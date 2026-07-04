import fs from "node:fs/promises";
import path from "node:path";
import { Pool } from "pg";

export function createDatabase({ catalogPath, vectorsDir, schemaPath }) {
  const databaseUrl = process.env.DATABASE_URL;
  const pool = databaseUrl
    ? new Pool({
        connectionString: databaseUrl,
        ssl: process.env.PGSSLMODE === "disable" ? false : process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
      })
    : null;

  return {
    enabled: Boolean(pool),
    async init() {
      if (!pool) return;
      const schema = await fs.readFile(schemaPath, "utf8");
      await pool.query(schema);
      await seedIfEmpty(pool, catalogPath, vectorsDir);
    },
    async listBases() {
      const { rows } = await pool.query(`
        SELECT id, title, theme, source_format AS format, geometry_type AS geometry,
               source_scale AS scale, updated_label AS updated, features_count AS features,
               active, color
        FROM reference_bases
        ORDER BY created_at ASC
      `);
      return rows;
    },
    async findBase(id) {
      const { rows } = await pool.query(
        `SELECT id, title, theme, source_format AS format, geometry_type AS geometry,
                source_scale AS scale, updated_label AS updated, features_count AS features,
                active, color
         FROM reference_bases
         WHERE id = $1`,
        [id]
      );
      return rows[0] || null;
    },
    async getGeoJson(id) {
      const { rows } = await pool.query(
        `
        SELECT json_build_object(
          'type', 'FeatureCollection',
          'features', COALESCE(
            json_agg(
              json_build_object(
                'type', 'Feature',
                'properties', f.properties,
                'geometry', ST_AsGeoJSON(f.geom)::json
              )
              ORDER BY f.id
            ) FILTER (WHERE f.id IS NOT NULL),
            '[]'::json
          )
        ) AS geojson
        FROM reference_bases b
        LEFT JOIN reference_features f ON f.base_id = b.id
        WHERE b.id = $1
        GROUP BY b.id
        `,
        [id]
      );
      return rows[0]?.geojson || null;
    },
    async toggleBase(id) {
      const { rows } = await pool.query(
        `
        UPDATE reference_bases
        SET active = NOT active, updated_at = now()
        WHERE id = $1
        RETURNING id, title, theme, source_format AS format, geometry_type AS geometry,
                  source_scale AS scale, updated_label AS updated, features_count AS features,
                  active, color
        `,
        [id]
      );
      return rows[0] || null;
    },
    async createBase({ id, title, theme, scale, color, geojson, storage }) {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const geometry = summarizeGeometry(geojson);
        const features = geojson.features.length;
        const updated = new Date().toISOString().slice(0, 10);

        const { rows } = await client.query(
          `
          INSERT INTO reference_bases
            (id, title, theme, source_format, geometry_type, source_scale, updated_label, features_count, active, color,
             storage_bucket, storage_path, storage_public_url)
          VALUES ($1, $2, $3, 'GeoJSON', $4, $5, $6, $7, true, $8, $9, $10, $11)
          RETURNING id, title, theme, source_format AS format, geometry_type AS geometry,
                    source_scale AS scale, updated_label AS updated, features_count AS features,
                    active, color
          `,
          [id, title, theme, geometry, scale, updated, features, color, storage?.bucket || null, storage?.path || null, storage?.publicUrl || null]
        );

        for (const feature of geojson.features) {
          if (!feature.geometry) continue;
          await client.query(
            `
            INSERT INTO reference_features (base_id, properties, geom)
            VALUES ($1, $2::jsonb, ST_SetSRID(ST_GeomFromGeoJSON($3), 4326))
            `,
            [id, JSON.stringify(feature.properties || {}), JSON.stringify(feature.geometry)]
          );
        }

        await client.query("COMMIT");
        return rows[0];
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    }
  };
}

async function seedIfEmpty(pool, catalogPath, vectorsDir) {
  const { rows } = await pool.query("SELECT COUNT(*)::int AS count FROM reference_bases");
  if (rows[0]?.count > 0) return;

  const catalog = JSON.parse(await fs.readFile(catalogPath, "utf8"));
  for (const base of catalog) {
    const geojson = JSON.parse(await fs.readFile(path.join(vectorsDir, base.filename), "utf8"));
    await insertSeedBase(pool, base, geojson);
  }
}

async function insertSeedBase(pool, base, geojson) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `
      INSERT INTO reference_bases
        (id, title, theme, source_format, geometry_type, source_scale, updated_label, features_count, active, color)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (id) DO NOTHING
      `,
      [base.id, base.title, base.theme, base.format, base.geometry, base.scale, base.updated, base.features, base.active, base.color]
    );

    for (const feature of geojson.features || []) {
      if (!feature.geometry) continue;
      await client.query(
        `
        INSERT INTO reference_features (base_id, properties, geom)
        VALUES ($1, $2::jsonb, ST_SetSRID(ST_GeomFromGeoJSON($3), 4326))
        `,
        [base.id, JSON.stringify(feature.properties || {}), JSON.stringify(feature.geometry)]
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

function summarizeGeometry(geojson) {
  const types = new Set((geojson.features || []).map((feature) => feature.geometry?.type).filter(Boolean));
  return types.size ? Array.from(types).join(", ") : "Sem geometria";
}
