# LocalizaAê — Back-end

API REST em Node.js (Express 5) com PostgreSQL. Instruções completas e lista de rotas no [README da raiz](../README.md).

```bash
cp .env.example .env
npm install
npm run db:setup   # cria o banco, aplica ../database/schema.sql e o seed (idempotente)
npm run dev        # http://localhost:3001/api
npm test           # exige um banco de TESTE
```

Estrutura: `src/app.js` (middlewares e rotas), `src/routes/` (público, auth, admin),
`src/utils/validators.js` (validação de entrada), `scripts/` (init-db e seed).
