# LocalizaAê

Plataforma web de achados e perdidos — *Achou, Registrou, Localizou!*

| Camada | Tecnologia |
| --- | --- |
| Front-end | HTML, CSS e JavaScript (JSX/React 19 + Tailwind v4), empacotado com **Vite** |
| Back-end | **Node.js** (JavaScript) com Express |
| Banco de dados | **PostgreSQL** |
| Versionamento | GitHub (front publicado no GitHub Pages) |

```
localizaae/
  frontend/   interface (Vite)
  backend/    API REST (Express + pg)
  database/   schema.sql
  docker-compose.yml   PostgreSQL local
```

## Como rodar (desenvolvimento)

Requer Node.js 20+ e um PostgreSQL (use o `docker-compose.yml` se não tiver um).

```bash
# 1) Banco de dados
docker compose up -d

# 2) Back-end  → http://localhost:3001/api
cd backend
cp .env.example .env          # ajuste JWT_SECRET e a senha do admin
npm install
npm run db:setup              # cria o banco (se faltar), aplica schema.sql e o seed
npm run dev

# 3) Front-end  → http://localhost:5173  (o Vite faz proxy de /api para o back-end)
cd ../frontend
npm install
npm run dev
```

Login de demonstração criado pelo seed: usuário `admin`, senha `admin123`
(troque via `ADMIN_PASSWORD` no `.env` antes de rodar o seed em qualquer ambiente real).
O seed também cria as 9 categorias e itens de demonstração (`SEED_DEMO_ITEMS=false` desliga os itens).

`npm run db:setup` é idempotente: pode ser executado quantas vezes quiser.

## API

Base: `/api`. Erros retornam `{ "error": "mensagem", "details": { campo: "motivo" } }`.

**Pública** (sem login)

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/itens` | Mural. **Nunca** inclui o local detalhado |
| GET | `/itens/:id` | Detalhe de um item |
| GET | `/categorias` | Categorias |
| POST | `/itens/:id/solicitacoes` | Pedido de reconhecimento: grava os dados pessoais e muda o item para *pendente* |

**Autenticação**

| Método | Rota | Descrição |
| --- | --- | --- |
| POST | `/auth/login` | `{ username, password }` → `{ token, user }` (JWT) |
| GET | `/auth/me` | Usuário da sessão |

**Administração** (header `Authorization: Bearer <token>`)

| Método | Rota | Descrição |
| --- | --- | --- |
| GET/POST | `/admin/itens` | Lista (com local detalhado) / cadastra item |
| PUT/DELETE | `/admin/itens/:id` | Edita / exclui item |
| GET | `/admin/itens/:id/solicitacoes` | Solicitações recebidas para o item |
| POST | `/admin/categorias` | Cria categoria |
| PUT/DELETE | `/admin/categorias/:id` | Renomeia / exclui (409 se houver itens) |
| GET/POST | `/admin/retiradas` | Histórico / registra retirada (muda o item para *retirado*) |
| GET | `/admin/auditoria` | Log somente leitura, do mais recente ao mais antigo |

A auditoria é gravada pelo próprio back-end, na mesma transação da operação (login, cadastro, edição,
exclusão, retirada e categorias).

## Testes

```bash
cd backend
DATABASE_URL=postgres://postgres:postgres@localhost:5432/localizaae_test npm run db:setup
DATABASE_URL=postgres://postgres:postgres@localhost:5432/localizaae_test npm test
```

Use sempre um banco **separado** para testes: eles gravam dados.

## Publicação

- **Front (GitHub Pages)**: o workflow `.github/workflows/deploy.yml` publica em `/localizaae/` a cada push na
  `main`. Crie a variável de repositório `VITE_API_URL` com a URL pública da API
  (ex.: `https://sua-api.exemplo.com/api`).
- **Back-end**: hospede em um serviço Node com HTTPS e um PostgreSQL gerenciado. Defina `NODE_ENV=production`,
  `DATABASE_URL`, `JWT_SECRET` (longo e aleatório), `CORS_ORIGIN` (incluindo `https://v21sobral.github.io`)
  e `PGSSL=true` se o provedor exigir.

## Segurança e LGPD (resumo do que está implementado)

- Senhas com bcrypt; sessão por JWT (8 h); limite de tentativas no login e nas solicitações públicas.
- Rotas administrativas exigem token (RN2); o local detalhado só sai nelas.
- Dados pessoais (CPF, nome, telefone) só são gravados na solicitação de reconhecimento ou na retirada,
  como previsto no projeto. CPF é guardado só com dígitos.
- Todas as consultas usam parâmetros (sem concatenação de SQL); entradas são validadas no servidor
  (CPF com dígito verificador, telefone, DDD, tipos de usuário).
- Pontos a considerar numa próxima fase: criptografar o CPF em repouso, rotina de descarte de dados
  de solicitações antigas e política de retenção dos logs (Marco Civil da Internet).
