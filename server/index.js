import cors from "cors";
import crypto from "node:crypto";
import express from "express";
import fs from "node:fs/promises";
import multer from "multer";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createDatabase } from "./db.js";
import { createObjectStorage } from "./storage.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "data");
const vectorsDir = path.join(dataDir, "vectors");
const uploadsDir = path.join(__dirname, "uploads");
const catalogPath = path.join(dataDir, "catalog.json");
const schemaPath = path.join(__dirname, "db", "schema.sql");
const port = Number(process.env.PORT || 3333);
const tokenSecret = process.env.ATLAS_TOKEN_SECRET || "atlas-verde-dev-secret";
const database = createDatabase({ catalogPath, vectorsDir, schemaPath });
const objectStorage = createObjectStorage();

const users = [
  { email: "admin@atlas.local", password: "admin123", name: "Administrador", role: "admin" },
  { email: "analista@atlas.local", password: "atlas123", name: "Analista", role: "viewer" }
];

const app = express();
const upload = multer({
  dest: uploadsDir,
  limits: { fileSize: 25 * 1024 * 1024 }
});

app.use(cors({ origin: true }));
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_request, response) => {
  response.json({
    ok: true,
    service: "atlas-verde-api",
    database: database.enabled ? "postgis" : "json",
    objectStorage: objectStorage.provider
  });
});

app.post("/api/auth/login", (request, response) => {
  const { email, password } = request.body || {};
  const user = users.find((item) => item.email === String(email || "").trim() && item.password === password);

  if (!user) {
    return response.status(401).json({ message: "Credenciais inválidas." });
  }

  const safeUser = { email: user.email, name: user.name, role: user.role };
  response.json({ user: safeUser, token: signToken(safeUser) });
});

app.get("/api/bases", async (_request, response, next) => {
  try {
    response.json(database.enabled ? await database.listBases() : await readCatalog());
  } catch (error) {
    next(error);
  }
});

app.get("/api/bases/:id/geojson", async (request, response, next) => {
  try {
    const base = await findBase(request.params.id);
    if (!base) return response.status(404).json({ message: "Base não encontrada." });

    if (database.enabled) {
      const geojson = await database.getGeoJson(request.params.id);
      if (!geojson) return response.status(404).json({ message: "GeoJSON não encontrado." });
      response.setHeader("Content-Type", "application/geo+json");
      response.setHeader("Content-Disposition", `attachment; filename="${slugify(base.title)}.geojson"`);
      return response.send(JSON.stringify(geojson, null, 2));
    }

    response.download(path.join(vectorsDir, base.filename), `${slugify(base.title)}.geojson`);
  } catch (error) {
    next(error);
  }
});

app.get("/api/bases/:id/tiles/:z/:x/:y.mvt", async (request, response, next) => {
  try {
    if (!database.enabled) return response.status(404).json({ message: "Tiles vetoriais exigem PostGIS." });

    const base = await findBase(request.params.id);
    if (!base) return response.status(404).json({ message: "Base nÃ£o encontrada." });

    const z = Number(request.params.z);
    const x = Number(request.params.x);
    const y = Number(request.params.y);
    if (![z, x, y].every(Number.isInteger) || z < 0 || z > 22 || x < 0 || y < 0) {
      return response.status(400).json({ message: "Tile invÃ¡lido." });
    }

    const tile = await database.getVectorTile({ id: request.params.id, z, x, y });
    response.setHeader("Content-Type", "application/vnd.mapbox-vector-tile");
    response.setHeader("Cache-Control", "public, max-age=3600");
    response.send(tile);
  } catch (error) {
    next(error);
  }
});

app.get("/api/bases/:id/metadata", async (request, response, next) => {
  try {
    const base = await findBase(request.params.id);
    if (!base) return response.status(404).json({ message: "Base não encontrada." });

    response.json({
      title: base.title,
      theme: base.theme,
      format: base.format,
      geometry: base.geometry,
      scale: base.scale,
      updated: base.updated,
      features: base.features,
      srid: "SIRGAS 2000"
    });
  } catch (error) {
    next(error);
  }
});

app.patch("/api/bases/:id/toggle", requireAdmin, async (request, response, next) => {
  try {
    if (database.enabled) {
      const updated = await database.toggleBase(request.params.id);
      if (!updated) return response.status(404).json({ message: "Base não encontrada." });
      return response.json(updated);
    }

    const catalog = await readCatalog();
    const index = catalog.findIndex((base) => base.id === request.params.id);
    if (index === -1) return response.status(404).json({ message: "Base não encontrada." });

    catalog[index] = { ...catalog[index], active: !catalog[index].active };
    await writeCatalog(catalog);
    response.json(catalog[index]);
  } catch (error) {
    next(error);
  }
});

app.post("/api/bases", requireAdmin, upload.single("file"), async (request, response, next) => {
  try {
    if (!request.file) {
      return response.status(400).json({ message: "Envie um arquivo GeoJSON." });
    }

    const rawBuffer = await fs.readFile(request.file.path);
    const raw = rawBuffer.toString("utf8");
    const geojson = normalizeGeoJson(JSON.parse(raw));
    const id = `base-${Date.now()}`;
    const title = String(request.body.title || request.file.originalname.replace(/\.(geojson|json)$/i, "") || id).trim();
    const filename = `${id}.geojson`;
    const baseInput = {
      id,
      title,
      theme: String(request.body.theme || "Importado"),
      scale: String(request.body.scale || "Fonte do arquivo"),
      color: "border-amberline bg-amberline/20",
      geojson
    };

    const storedFile = await objectStorage.uploadGeoJson({ id, filename, buffer: rawBuffer });

    if (database.enabled) {
      const base = await database.createBase({ ...baseInput, storage: storedFile });
      await fs.unlink(request.file.path).catch(() => {});
      return response.status(201).json(base);
    }

    await fs.writeFile(path.join(vectorsDir, filename), JSON.stringify(geojson, null, 2), "utf8");
    await fs.unlink(request.file.path).catch(() => {});

    const base = {
      id,
      title,
      theme: String(request.body.theme || "Importado"),
      format: "GeoJSON",
      geometry: summarizeGeometry(geojson),
      scale: String(request.body.scale || "Fonte do arquivo"),
      updated: new Date().toISOString().slice(0, 10),
      features: geojson.features.length,
      active: true,
      color: "border-amberline bg-amberline/20",
      filename
    };

    const catalog = await readCatalog();
    catalog.push(base);
    await writeCatalog(catalog);

    response.status(201).json(base);
  } catch (error) {
    if (request.file?.path) await fs.unlink(request.file.path).catch(() => {});
    next(error);
  }
});

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ message: error.message || "Erro interno da API." });
});

await fs.mkdir(vectorsDir, { recursive: true });
await fs.mkdir(uploadsDir, { recursive: true });
await database.init();

app.listen(port, () => {
  console.log(`Atlas Verde API em http://127.0.0.1:${port}`);
});

async function readCatalog() {
  const content = await fs.readFile(catalogPath, "utf8");
  return JSON.parse(content);
}

async function writeCatalog(catalog) {
  await fs.writeFile(catalogPath, JSON.stringify(catalog, null, 2), "utf8");
}

async function findBase(id) {
  if (database.enabled) return database.findBase(id);
  const catalog = await readCatalog();
  return catalog.find((base) => base.id === id);
}

function requireAdmin(request, response, next) {
  const token = request.headers.authorization?.replace(/^Bearer\s+/i, "");
  const user = verifyToken(token);

  if (!user || user.role !== "admin") {
    return response.status(403).json({ message: "Apenas administradores podem publicar bases." });
  }

  request.user = user;
  next();
}

function signToken(user) {
  const payload = Buffer.from(JSON.stringify({ ...user, exp: Date.now() + 8 * 60 * 60 * 1000 })).toString("base64url");
  const signature = crypto.createHmac("sha256", tokenSecret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

function verifyToken(token) {
  if (!token || !token.includes(".")) return null;
  const [payload, signature] = token.split(".");
  const expected = crypto.createHmac("sha256", tokenSecret).update(payload).digest("base64url");
  if (Buffer.byteLength(signature) !== Buffer.byteLength(expected)) return null;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;

  const user = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  if (!user.exp || user.exp < Date.now()) return null;
  return user;
}

function normalizeGeoJson(input) {
  if (!input || typeof input !== "object") throw new Error("GeoJSON vazio.");
  if (input.type === "FeatureCollection" && Array.isArray(input.features)) return input;
  if (input.type === "Feature" && input.geometry) return { type: "FeatureCollection", features: [input] };
  if (input.type && input.coordinates) {
    return { type: "FeatureCollection", features: [{ type: "Feature", properties: { name: "Geometria importada" }, geometry: input }] };
  }
  throw new Error("GeoJSON inválido.");
}

function summarizeGeometry(geojson) {
  const types = new Set(geojson.features.map((feature) => feature.geometry?.type).filter(Boolean));
  return types.size ? Array.from(types).join(", ") : "Sem geometria";
}

function slugify(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}
