# LocalizaAê — Front-end

Plataforma web de achados e perdidos ("Achou, Registrou, Localizou!").
Front-end em **HTML, CSS e JavaScript**, empacotado com **Vite**, conforme o item 1.4 da documentação técnica.

## Stack

| Camada | Tecnologia |
| --- | --- |
| Front-end | JavaScript (JSX/React 19) + CSS (Tailwind v4) + HTML, empacotado com Vite |
| Back-end | Node.js com JavaScript (`../backend`) |
| Banco de dados | PostgreSQL |
| Versionamento | GitHub (deploy no GitHub Pages) |

## Como rodar

Requer Node.js 22+.

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # gera a pasta dist/
npm run preview   # serve o build localmente
```

Para publicar no GitHub Pages em `https://<usuario>.github.io/localizaae/`:

```bash
VITE_BASE=/localizaae/ npm run build
```

O workflow em `.github/workflows/deploy.yml` faz isso automaticamente a cada push na `main`.

## Estrutura

```
src/
  App.jsx            estado global e navegação entre telas
  audit.js           hook que lê o log de auditoria da API
  services/api.js    cliente da API (fetch + token)
  theme.js           tema claro/escuro
  components/        Logo, AdminShell, StatusBadge, ThemeToggle, modais, ícones
  screens/           Mural, Detalhe, Login, Dashboard, Cadastro/Edição, Retirada,
                     Relatórios, Categorias e Auditoria
  utils/             datas e validadores (CPF, telefone)
```

## Integração com o back-end

Os dados vêm da API (`../backend`) pelo cliente em `src/services/api.js`.
Em desenvolvimento o Vite faz proxy de `/api` para `http://localhost:3001`
(ajustável com `VITE_PROXY_TARGET`). Em produção defina `VITE_API_URL` (ver `.env.example`).
O token de sessão fica em `sessionStorage` e é descartado ao fechar a aba.

## Login de demonstração

As credenciais de teste aparecem na própria tela de login e são criadas pelo seed do back-end (`npm run db:setup`).
