# Atlas Verde

Painel WebGIS com frontend React, mapa Leaflet e backend Node/Express para catálogo de bases vetoriais GeoJSON.

## Rodar localmente

```bash
npm install
npm run api
npm run dev
```

Frontend: `http://127.0.0.1:5173`  
API: `http://127.0.0.1:3333/api`

## Login demo

- Admin: `admin@atlas.local` / `admin123`
- Analista: `analista@atlas.local` / `atlas123`

## Publicação de bases

O backend atual aceita upload de GeoJSON/JSON, salva os arquivos em `server/data/vectors` e atualiza `server/data/catalog.json`.

Para produção real com uploads persistentes, use um storage externo e banco de dados, por exemplo Supabase/PostGIS, S3/R2 + PostgreSQL, Railway, Render ou Fly.io. O filesystem da Vercel não deve ser usado como armazenamento persistente de uploads.

## Deploy

### Frontend na Vercel

- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_URL=https://sua-api.example.com/api`

### Backend

O servidor Express em `server/index.js` deve ser publicado em um host Node persistente, ou adaptado para serverless com storage externo.
