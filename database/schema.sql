-- ============================================================
-- Localiza Aê — esquema do banco de dados (PostgreSQL)
-- Idempotente: pode ser executado mais de uma vez.
-- ============================================================

CREATE TABLE IF NOT EXISTS usuarios (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  username    VARCHAR(50)  NOT NULL UNIQUE,
  email       VARCHAR(120) NOT NULL UNIQUE,
  senha_hash  TEXT         NOT NULL,
  criado_em   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categorias (
  id    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nome  VARCHAR(60) NOT NULL
);
-- Nome único sem diferenciar maiúsculas/minúsculas
CREATE UNIQUE INDEX IF NOT EXISTS ux_categorias_nome ON categorias (lower(nome));

CREATE TABLE IF NOT EXISTS itens (
  id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nome             VARCHAR(120) NOT NULL,
  descricao        TEXT         NOT NULL,
  categoria_id     BIGINT       NOT NULL REFERENCES categorias(id) ON DELETE RESTRICT,
  local_publico    VARCHAR(120) NOT NULL,
  local_detalhado  VARCHAR(200) NOT NULL,   -- nunca exposto na API pública
  data_encontrado  DATE         NOT NULL,
  status           VARCHAR(12)  NOT NULL DEFAULT 'disponivel'
                   CHECK (status IN ('disponivel', 'pendente', 'retirado')),
  imagem_url       TEXT,
  criado_em        TIMESTAMPTZ  NOT NULL DEFAULT now(),
  atualizado_em    TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_itens_status    ON itens (status);
CREATE INDEX IF NOT EXISTS ix_itens_categoria ON itens (categoria_id);
CREATE INDEX IF NOT EXISTS ix_itens_data      ON itens (data_encontrado);

-- Diferencial do projeto: dados pessoais só são gravados DEPOIS que a pessoa
-- identifica o item (solicitação de reconhecimento) ou no ato da retirada.
CREATE TABLE IF NOT EXISTS solicitacoes (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  item_id       BIGINT       NOT NULL REFERENCES itens(id) ON DELETE CASCADE,
  comprovacao   TEXT         NOT NULL,
  cpf           CHAR(11)     NOT NULL,
  nome          VARCHAR(60)  NOT NULL,
  sobrenome     VARCHAR(80)  NOT NULL,
  ddd           CHAR(2)      NOT NULL,
  telefone      VARCHAR(9)   NOT NULL,
  tipo_usuario  VARCHAR(20)  NOT NULL,
  criado_em     TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_solicitacoes_item ON solicitacoes (item_id);

CREATE TABLE IF NOT EXISTS retiradas (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  item_id       BIGINT       REFERENCES itens(id) ON DELETE SET NULL,
  item_nome     VARCHAR(120) NOT NULL,       -- cópia do nome: o histórico sobrevive à exclusão do item
  usuario_id    BIGINT       REFERENCES usuarios(id) ON DELETE SET NULL,
  comprovacao   TEXT         NOT NULL,
  cpf           CHAR(11)     NOT NULL,
  nome          VARCHAR(60)  NOT NULL,
  sobrenome     VARCHAR(80)  NOT NULL,
  ddd           CHAR(2)      NOT NULL,
  telefone      VARCHAR(9)   NOT NULL,
  tipo_usuario  VARCHAR(20)  NOT NULL,
  criado_em     TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS auditoria (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  usuario     VARCHAR(120) NOT NULL,
  acao        VARCHAR(20)  NOT NULL
              CHECK (acao IN ('login', 'item-create', 'item-edit', 'item-delete', 'retirada',
                              'category-create', 'category-edit', 'category-delete')),
  alvo        TEXT         NOT NULL,
  criado_em   TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_auditoria_criado ON auditoria (criado_em DESC);
