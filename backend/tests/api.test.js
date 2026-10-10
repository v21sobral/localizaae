// Testes de integração. Exigem um PostgreSQL de TESTE já preparado:
//   DATABASE_URL=postgres://.../localizaae_test npm run db:setup && npm test
// ATENÇÃO: os testes gravam dados; nunca aponte para o banco de produção.
import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { createApp } from '../src/app.js'
import { pool } from '../src/db/pool.js'

let server
let base
let token

const api = async (method, path, { body, auth } = {}) => {
  const res = await fetch(base + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  return { status: res.status, data: text ? JSON.parse(text) : null }
}

const novoItem = (over = {}) => ({
  name: 'Teste Item',
  description: 'Descrição de teste',
  category: 'Outros',
  locationPublic: 'Bloco Z',
  locationDetail: 'Detalhe secreto Z',
  date: '2026-09-30',
  status: 'disponivel',
  imageUrl: '',
  ...over,
})
const solicitante = (over = {}) => ({
  comprovacao: 'Tem meu nome gravado',
  cpf: '529.982.247-25',
  nome: 'Maria',
  sobrenome: 'Silva',
  ddd: '71',
  telefone: '99999-1234',
  tipoUsuario: 'Aluno',
  ...over,
})

before(async () => {
  server = createApp().listen(0)
  await new Promise((r) => server.once('listening', r))
  base = `http://localhost:${server.address().port}/api`
})
after(async () => {
  await new Promise((r) => server.close(r))
  await pool.end()
})

test('API pública nunca expõe o local detalhado', async () => {
  const list = await api('GET', '/itens')
  assert.equal(list.status, 200)
  assert.ok(list.data.length >= 9)
  assert.ok(list.data.every((i) => !('locationDetail' in i)))
  const one = await api('GET', `/itens/${list.data[0].id}`)
  assert.equal(one.status, 200)
  assert.ok(!('locationDetail' in one.data))
  assert.equal((await api('GET', '/itens/999999')).status, 404)
  assert.equal((await api('GET', '/itens/abc')).status, 400)
})

test('rotas administrativas exigem login', async () => {
  assert.equal((await api('GET', '/admin/itens')).status, 401)
  assert.equal((await api('GET', '/admin/auditoria', { auth: 'token-falso' })).status, 401)
  const bad = await api('POST', '/auth/login', { body: { username: 'admin', password: 'errada' } })
  assert.equal(bad.status, 401)
  const ok = await api('POST', '/auth/login', { body: { username: 'admin', password: 'admin123' } })
  assert.equal(ok.status, 200)
  assert.equal(ok.data.user.email, 'admin@localiza.ae')
  token = ok.data.token
  const me = await api('GET', '/auth/me', { auth: token })
  assert.equal(me.data.user.username, 'admin')
  const adm = await api('GET', '/admin/itens', { auth: token })
  assert.ok(adm.data.every((i) => typeof i.locationDetail === 'string'))
})

test('CRUD de itens com validação', async () => {
  const inv = await api('POST', '/admin/itens', { auth: token, body: novoItem({ name: '', category: 'Inexistente' }) })
  assert.equal(inv.status, 400)
  assert.ok(inv.data.details.name)
  const semCat = await api('POST', '/admin/itens', { auth: token, body: novoItem({ category: 'Inexistente' }) })
  assert.equal(semCat.status, 400)
  assert.ok(semCat.data.details.category)

  const created = await api('POST', '/admin/itens', { auth: token, body: novoItem() })
  assert.equal(created.status, 201)
  assert.equal(created.data.locationDetail, 'Detalhe secreto Z')
  const id = created.data.id

  const edited = await api('PUT', `/admin/itens/${id}`, { auth: token, body: novoItem({ name: 'Teste Editado', category: 'Livros' }) })
  assert.equal(edited.status, 200)
  assert.equal(edited.data.name, 'Teste Editado')
  assert.equal(edited.data.category, 'Livros')

  assert.equal((await api('DELETE', `/admin/itens/${id}`, { auth: token })).status, 204)
  assert.equal((await api('DELETE', `/admin/itens/${id}`, { auth: token })).status, 404)
})

test('categorias: duplicadas e em uso são recusadas', async () => {
  const dup = await api('POST', '/admin/categorias', { auth: token, body: { name: 'livros' } })
  assert.equal(dup.status, 409)
  const nova = await api('POST', '/admin/categorias', { auth: token, body: { name: 'Categoria Teste' } })
  assert.equal(nova.status, 201)
  const ren = await api('PUT', `/admin/categorias/${nova.data.id}`, { auth: token, body: { name: 'Categoria Teste 2' } })
  assert.equal(ren.data.name, 'Categoria Teste 2')
  assert.equal((await api('DELETE', `/admin/categorias/${nova.data.id}`, { auth: token })).status, 204)

  const cats = await api('GET', '/categorias')
  const eletronicos = cats.data.find((c) => c.name === 'Eletrônicos')
  assert.equal((await api('DELETE', `/admin/categorias/${eletronicos.id}`, { auth: token })).status, 409)
})

test('solicitação pública: valida CPF, muda status para pendente e não repete', async () => {
  const item = (await api('POST', '/admin/itens', { auth: token, body: novoItem({ name: 'Item Claim' }) })).data
  const ruim = await api('POST', `/itens/${item.id}/solicitacoes`, { body: solicitante({ cpf: '111.111.111-11' }) })
  assert.equal(ruim.status, 400)
  assert.ok(ruim.data.details.cpf)

  const ok = await api('POST', `/itens/${item.id}/solicitacoes`, { body: solicitante() })
  assert.equal(ok.status, 201)
  const depois = await api('GET', `/itens/${item.id}`)
  assert.equal(depois.data.status, 'pendente')
  assert.equal((await api('POST', `/itens/${item.id}/solicitacoes`, { body: solicitante() })).status, 409)

  const sols = await api('GET', `/admin/itens/${item.id}/solicitacoes`, { auth: token })
  assert.equal(sols.data.length, 1)
  assert.equal(sols.data[0].cpf, '52998224725')
  assert.equal((await api('GET', `/admin/itens/${item.id}/solicitacoes`)).status, 401)
})

test('retirada: marca como retirado, mantém histórico após excluir o item e audita', async () => {
  const item = (await api('POST', '/admin/itens', { auth: token, body: novoItem({ name: 'Item Retirada' }) })).data
  const body = { itemId: item.id, ...solicitante({ nome: 'João', sobrenome: 'Souza' }) }
  assert.equal((await api('POST', '/admin/retiradas', { auth: token, body: { ...body, cpf: '123' } })).status, 400)
  assert.equal((await api('POST', '/admin/retiradas', { auth: token, body })).status, 201)
  assert.equal((await api('GET', `/itens/${item.id}`)).data.status, 'retirado')
  assert.equal((await api('POST', '/admin/retiradas', { auth: token, body })).status, 409)

  await api('DELETE', `/admin/itens/${item.id}`, { auth: token })
  const ret = await api('GET', '/admin/retiradas', { auth: token })
  const r = ret.data.find((x) => x.itemName === 'Item Retirada')
  assert.ok(r)
  assert.equal(r.itemId, null)
  assert.equal(r.requester, 'João Souza')

  const aud = await api('GET', '/admin/auditoria', { auth: token })
  const acoes = new Set(aud.data.map((a) => a.action))
  for (const a of ['login', 'item-create', 'item-edit', 'item-delete', 'retirada', 'category-create', 'category-edit', 'category-delete']) {
    assert.ok(acoes.has(a), `auditoria sem ${a}`)
  }
  const ret1 = aud.data.find((a) => a.action === 'retirada' && a.target === 'Item Retirada → João Souza')
  assert.ok(ret1)
  assert.equal(ret1.user, 'admin@localiza.ae')
})

test('retirada de item pendente (pedido feito no mural) é aceita', async () => {
  const item = (await api('POST', '/admin/itens', { auth: token, body: novoItem({ name: 'Item Pendente' }) })).data
  assert.equal((await api('POST', `/itens/${item.id}/solicitacoes`, { body: solicitante() })).status, 201)
  assert.equal((await api('GET', `/itens/${item.id}`)).data.status, 'pendente')
  const ok = await api('POST', '/admin/retiradas', { auth: token, body: { itemId: item.id, ...solicitante() } })
  assert.equal(ok.status, 201)
  assert.equal((await api('GET', `/itens/${item.id}`)).data.status, 'retirado')
})
