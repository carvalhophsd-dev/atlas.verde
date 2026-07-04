# Atlas Verde

Painel WebGIS com frontend React, mapa Leaflet e backend Node/Express para catalogo de bases vetoriais GeoJSON.

## Rodar localmente

```bash
npm install
npm run db:up
npm run api
npm run dev
```

Frontend: `http://127.0.0.1:5173`  
API: `http://127.0.0.1:3333/api`

## PostgreSQL/PostGIS

O backend usa PostGIS automaticamente quando `DATABASE_URL` esta definida.

Para subir um banco local com Docker:

```bash
npm run db:up
```

Use as variaveis do arquivo `.env.example`:

```bash
DATABASE_URL=postgres://atlas:atlas_dev@127.0.0.1:5432/atlas_verde
PGSSLMODE=disable
```

Na primeira inicializacao, a API cria as tabelas PostGIS e importa as bases seedadas de `server/data/vectors`.

## Supabase

Para producao, use o Supabase como PostgreSQL/PostGIS gerenciado e como Storage dos arquivos originais enviados pelo administrador.

1. Crie um projeto no Supabase.
2. Em `Database > Extensions`, habilite `postgis`.
3. Copie a connection string do banco e use como `DATABASE_URL` no backend.
4. Crie um bucket no Storage chamado `atlas-vectors`.
5. Copie a `service_role key` em `Project Settings > API`.
6. Configure as variaveis no host do backend:

```bash
DATABASE_URL=sua-connection-string-do-supabase
PGSSLMODE=require
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
SUPABASE_STORAGE_BUCKET=atlas-vectors
ATLAS_TOKEN_SECRET=um-segredo-longo-e-unico
```

Importante: `SUPABASE_SERVICE_ROLE_KEY` deve ficar apenas no backend. Nunca coloque essa chave na Vercel do frontend.

## Login demo

- Admin: `admin@atlas.local` / `admin123`
- Analista: `analista@atlas.local` / `atlas123`

## Publicacao de bases

O backend aceita upload de GeoJSON/JSON apenas para usuario administrador.

Em desenvolvimento, sem `DATABASE_URL`, a API salva os arquivos em `server/data/vectors` e atualiza `server/data/catalog.json`.

Em producao, com `DATABASE_URL`, a API grava as feicoes no PostgreSQL/PostGIS. Se as variaveis do Supabase Storage estiverem configuradas, ela tambem salva uma copia do arquivo original no bucket `atlas-vectors`.

O filesystem da Vercel nao deve ser usado como armazenamento persistente de uploads.

## Deploy

### Frontend na Vercel

- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_URL=https://sua-api.example.com/api`

### Backend

O servidor Express em `server/index.js` deve ser publicado em um host Node persistente, como Render ou Railway.

Configure no backend:

```bash
PORT=3333
DATABASE_URL=sua-connection-string-do-supabase
PGSSLMODE=require
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
SUPABASE_STORAGE_BUCKET=atlas-vectors
ATLAS_TOKEN_SECRET=um-segredo-longo-e-unico
```
