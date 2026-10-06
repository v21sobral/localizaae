// Dados iniciais: administrador, categorias e (opcional) itens de demonstração. Idempotente.
import bcrypt from 'bcryptjs'
import { config } from '../src/config.js'
import { pool } from '../src/db/pool.js'

const CATEGORIAS = [
  'Eletrônicos',
  'Acessórios',
  'Documentos e Carteiras',
  'Bolsas e Mochilas',
  'Guarda-chuvas',
  'Chaves',
  'Livros',
  'Roupas e Calçados',
  'Outros',
]

const img = (id) => `https://images.unsplash.com/${id}?w=400&h=300&fit=crop&auto=format`

// [nome, descrição, categoria, local público, local detalhado, dias atrás, status, foto]
const ITENS = [
  ['Óculos de grau', 'Óculos de grau com armação preta, lentes com grau de miopia. Encontrado próximo ao bebedouro.', 'Acessórios', 'Bloco A – Corredor Principal', 'Próximo ao bebedouro do 2º andar, bloco A', 18, 'disponivel', 'photo-1574258495973-f010dfbb5371'],
  ['Carteira de couro marrom', 'Carteira masculina de couro marrom, sem documentos. Contém alguns cartões.', 'Documentos e Carteiras', 'Refeitório – Mesa Central', 'Mesa central do refeitório, próximo à janela', 19, 'disponivel', 'photo-1627123424574-724758594e93'],
  ['Guarda-chuva preto', 'Guarda-chuva automático preto, cabo de borracha. Sem identificação.', 'Guarda-chuvas', 'Entrada Principal', 'Porta giratória da entrada principal', 21, 'retirado', 'photo-1558618666-fcd25c85cd64'],
  ['Fone de ouvido Bluetooth', 'Fone de ouvido sem fio, branco, modelo over-ear. Sem case de carregamento.', 'Eletrônicos', 'Biblioteca – Sala de Leitura', 'Mesa 7 da sala de leitura silenciosa', 22, 'disponivel', 'photo-1505740420928-5e560c06d30e'],
  ['Mochila azul', 'Mochila escolar azul marinho com bolso frontal. Contém cadernos e materiais.', 'Bolsas e Mochilas', 'Quadra Esportiva', 'Arquibancada lateral da quadra coberta', 23, 'pendente', 'photo-1553062407-98eeb64c6a62'],
  ['Chave com chaveiro', 'Manojo com 3 chaves e chaveiro colorido (formato de gatinho).', 'Chaves', 'Secretaria – Recepção', 'Balcão de atendimento da secretaria', 24, 'disponivel', 'photo-1589118949245-7d38baf380d6'],
  ['Livro "O Hobbit"', 'Livro de capa brochura, ed. HarperCollins 2019. Nome "Ana" escrito na primeira página.', 'Livros', 'Biblioteca', 'Prateleira da seção Literatura, corredor B', 26, 'retirado', 'photo-1544947950-fa07a98d237f'],
  ['Celular Samsung Galaxy', 'Smartphone Android preto, tela de 6,4". Tela bloqueada, sem possibilidade de acessar contatos.', 'Eletrônicos', 'Laboratório de Informática', 'Bancada 3, Laboratório INFO-02', 27, 'disponivel', 'photo-1610945265064-0e34e5519bbf'],
  ['Guarda-sol de praia', 'Guarda-sol listrado azul e branco, haste de alumínio. Encontrado próximo à cantina.', 'Outros', 'Cantina – Área Externa', 'Área externa da cantina, próximo à mesa 4', 82, 'disponivel', 'photo-1507525428034-b723cf961d3e'],
]

const username = process.env.ADMIN_USERNAME || 'admin'
const email = process.env.ADMIN_EMAIL || 'admin@localiza.ae'
const password = process.env.ADMIN_PASSWORD || 'admin123'

if (config.isProd && password === 'admin123') {
  throw new Error('Defina ADMIN_PASSWORD (diferente de admin123) para executar o seed em produção.')
}

const admin = await pool.query('SELECT 1 FROM usuarios WHERE username = $1', [username])
if (!admin.rowCount) {
  await pool.query('INSERT INTO usuarios (username, email, senha_hash) VALUES ($1,$2,$3)', [
    username,
    email,
    await bcrypt.hash(password, 10),
  ])
  console.log(`Administrador "${username}" criado.`)
} else {
  console.log(`Administrador "${username}" já existe (senha mantida).`)
}

for (const nome of CATEGORIAS) {
  await pool.query('INSERT INTO categorias (nome) VALUES ($1) ON CONFLICT DO NOTHING', [nome])
}
console.log('Categorias garantidas.')

if (process.env.SEED_DEMO_ITEMS !== 'false') {
  const { rows } = await pool.query('SELECT count(*)::int AS n FROM itens')
  if (rows[0].n === 0) {
    for (const [nome, desc, cat, local, detalhe, dias, status, foto] of ITENS) {
      await pool.query(
        `INSERT INTO itens (nome, descricao, categoria_id, local_publico, local_detalhado, data_encontrado, status, imagem_url)
         SELECT $1, $2, c.id, $3, $4, (CURRENT_DATE - $5::int), $6, $7 FROM categorias c WHERE lower(c.nome) = lower($8)`,
        [nome, desc, local, detalhe, dias, status, img(foto), cat],
      )
    }
    console.log(`${ITENS.length} itens de demonstração inseridos.`)
  } else {
    console.log('Tabela de itens já possui dados; demo ignorado.')
  }
}

await pool.end()
