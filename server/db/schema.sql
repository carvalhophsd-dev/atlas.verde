CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS reference_bases (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  theme TEXT NOT NULL DEFAULT 'Importado',
  source_format TEXT NOT NULL DEFAULT 'GeoJSON',
  geometry_type TEXT NOT NULL DEFAULT 'Geometry',
  source_scale TEXT NOT NULL DEFAULT 'Fonte do arquivo',
  updated_label TEXT NOT NULL DEFAULT to_char(CURRENT_DATE, 'YYYY-MM-DD'),
  features_count INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  color TEXT NOT NULL DEFAULT 'border-amberline bg-amberline/20',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reference_features (
  id BIGSERIAL PRIMARY KEY,
  base_id TEXT NOT NULL REFERENCES reference_bases(id) ON DELETE CASCADE,
  properties JSONB NOT NULL DEFAULT '{}'::jsonb,
  geom geometry(Geometry, 4326) NOT NULL
);

CREATE INDEX IF NOT EXISTS reference_features_base_id_idx ON reference_features(base_id);
CREATE INDEX IF NOT EXISTS reference_features_geom_idx ON reference_features USING GIST (geom);
