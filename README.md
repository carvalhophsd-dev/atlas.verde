# Atlas Verde

Painel WebGIS com frontend React, mapa Leaflet e backend Node/Express para catálogo de bases vetoriais GeoJSON.

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

O backend usa PostGIS automaticamente quando `DATABASE_URL` está definida.

Para subir um banco local com Docker:

```bash
npm run db:up
```

Use as variáveis do arquivo `.env.example`:

```bash
DATABASE_URL=postgres://atlas:atlas_dev@127.0.0.1:5432/atlas_verde
PGSSLMODE=disable
```

Na primeira inicialização, a API cria as tabelas PostGIS e importa as bases seedadas de `server/data/vectors`.

## Login demo

- Admin: `admin@atlas.local` / `admin123`
- Analista: `analista@atlas.local` / `atlas123`

## Publicação de bases

O backend atual aceita upload de GeoJSON/JSON, salva os arquivos em `server/data/vectors` e atualiza `server/data/catalog.json`.

Para produção real com uploads persistentes, use PostgreSQL/PostGIS em um serviço gerenciado. Se também quiser preservar o arquivo original enviado pelo usuário, use storage externo como S3, R2 ou Supabase Storage. O filesystem da Vercel não deve ser usado como armazenamento persistente de uploads.

## Deploy

### Frontend na Vercel

- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_URL=https://sua-api.example.com/api`

### Backend

O servidor Express em `server/index.js` deve ser publicado em um host Node persistente e configurado com `DATABASE_URL`.
