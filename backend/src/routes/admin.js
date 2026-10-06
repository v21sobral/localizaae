import { Router } from 'express'
import { query, withTransaction } from '../db/pool.js'
import { requireAdmin } from '../middleware/auth.js'
import { ITEM_SELECT, toItem, toCategoria, toAudit } from '../utils/serialize.js'
import { parseId, parseItem, parseSolicitante, parseCategoriaNome } from '../utils/validators.js'
import { badRequest, conflict, notFound } from '../utils/errors.js'
import { logAudit } from '../utils/audit.js'

export const adminRouter = Router()
adminRouter.use(requireAdmin)

const adminItem = (row) => toItem(row, { admin: true })

async function categoriaIdPorNome(db, nome) {
  const { rows } = await db.query('SELECT id FROM categorias WHERE lower(nome) = lower($1)', [nome])
  if (!rows[0]) throw badRequest('Dados inválidos', { category: 'Categoria inexistente' })
  return rows[0].id
}

async function buscarItem(db, id) {
  const { rows } = await db.query(`${ITEM_SELECT} WHERE i.id = $1`, [id])
  return rows[0]
}

// ── Itens ────────────────────────────────────────────────
adminRouter.get('/itens', async (_req, res) => {
  const { rows } = await query(`${ITEM_SELECT} ORDER BY i.data_encontrado DESC, i.id DESC`)
  res.json(rows.map(adminItem))
})

adminRouter.post('/itens', async (req, res) => {
  const d = parseItem(req.body)
  const item = await withTransaction(async (db) => {
    const categoriaId = await categoriaIdPorNome(db, d.categoria)
    const { rows } = await db.query(
      `INSERT INTO itens (nome, descricao, categoria_id, local_publico, local_detalhado, data_encontrado, status, imagem_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
      [d.nome, d.descricao, categoriaId, d.localPublico, d.localDetalhado, d.data, d.status, d.imagemUrl],
    )
    await logAudit(db, req.user.email, 'item-create', d.nome)
    return buscarItem(db, rows[0].id)
  })
  res.status(201).json(adminItem(item))
})

adminRouter.put('/itens/:id', async (req, res) => {
  const id = parseId(req.params.id)
  const d = parseItem(req.body)
  const item = await withTransaction(async (db) => {
    const categoriaId = await categoriaIdPorNome(db, d.categoria)
    const { rowCount } = await db.query(
      `UPDATE itens SET nome=$1, descricao=$2, categoria_id=$3, local_publico=$4, local_detalhado=$5,
              data_encontrado=$6, status=$7, imagem_url=$8, atualizado_em=now()
        WHERE id=$9`,
      [d.nome, d.descricao, categoriaId, d.localPublico, d.localDetalhado, d.data, d.status, d.imagemUrl, id],
    )
    if (!rowCount) throw notFound('Item não encontrado')
    await logAudit(db, req.user.email, 'item-edit', d.nome)
    return buscarItem(db, id)
  })
  res.json(adminItem(item))
})

adminRouter.delete('/itens/:id', async (req, res) => {
  const id = parseId(req.params.id)
  await withTransaction(async (db) => {
    const { rows } = await db.query('DELETE FROM itens WHERE id = $1 RETURNING nome', [id])
    if (!rows[0]) throw notFound('Item não encontrado')
    await logAudit(db, req.user.email, 'item-delete', rows[0].nome)
  })
  res.status(204).end()
})

// Solicitações de reconhecimento recebidas para um item (dados pessoais: só administrador).
adminRouter.get('/itens/:id/solicitacoes', async (req, res) => {
  const id = parseId(req.params.id)
  const { rows } = await query(
    `SELECT id, comprovacao, cpf, nome, sobrenome, ddd, telefone, tipo_usuario, criado_em
       FROM solicitacoes WHERE item_id = $1 ORDER BY criado_em DESC`,
    [id],
  )
  res.json(
    rows.map((r) => ({
      id: String(r.id),
      comprovacao: r.comprovacao,
      cpf: r.cpf,
      nome: r.nome,
      sobrenome: r.sobrenome,
      ddd: r.ddd,
      telefone: r.telefone,
      tipoUsuario: r.tipo_usuario,
      createdAt: new Date(r.criado_em).toISOString(),
    })),
  )
})

// ── Categorias ───────────────────────────────────────────
adminRouter.post('/categorias', async (req, res) => {
  const nome = parseCategoriaNome(req.body)
  const row = await withTransaction(async (db) => {
    const dup = await db.query('SELECT 1 FROM categorias WHERE lower(nome) = lower($1)', [nome])
    if (dup.rowCount) throw conflict('Já existe uma categoria com esse nome')
    const { rows } = await db.query('INSERT INTO categorias (nome) VALUES ($1) RETURNING id, nome', [nome])
    await logAudit(db, req.user.email, 'category-create', nome)
    return rows[0]
  })
  res.status(201).json(toCategoria(row))
})

adminRouter.put('/categorias/:id', async (req, res) => {
  const id = parseId(req.params.id)
  const nome = parseCategoriaNome(req.body)
  const row = await withTransaction(async (db) => {
    const atual = await db.query('SELECT nome FROM categorias WHERE id = $1 FOR UPDATE', [id])
    if (!atual.rows[0]) throw notFound('Categoria não encontrada')
    const dup = await db.query('SELECT 1 FROM categorias WHERE lower(nome) = lower($1) AND id <> $2', [nome, id])
    if (dup.rowCount) throw conflict('Já existe uma categoria com esse nome')
    const { rows } = await db.query('UPDATE categorias SET nome = $1 WHERE id = $2 RETURNING id, nome', [nome, id])
    await logAudit(db, req.user.email, 'category-edit', `${atual.rows[0].nome} → ${nome}`)
    return rows[0]
  })
  res.json(toCategoria(row))
})

adminRouter.delete('/categorias/:id', async (req, res) => {
  const id = parseId(req.params.id)
  await withTransaction(async (db) => {
    const uso = await db.query('SELECT count(*)::int AS n FROM itens WHERE categoria_id = $1', [id])
    if (uso.rows[0].n > 0) throw conflict('Não é possível excluir: existem itens nesta categoria')
    const { rows } = await db.query('DELETE FROM categorias WHERE id = $1 RETURNING nome', [id])
    if (!rows[0]) throw notFound('Categoria não encontrada')
    await logAudit(db, req.user.email, 'category-delete', rows[0].nome)
  })
  res.status(204).end()
})

// ── Retiradas ────────────────────────────────────────────
adminRouter.get('/retiradas', async (_req, res) => {
  const { rows } = await query(
    `SELECT id, item_id, item_nome, nome, sobrenome, tipo_usuario, criado_em
       FROM retiradas ORDER BY criado_em DESC`,
  )
  res.json(
    rows.map((r) => ({
      id: String(r.id),
      itemId: r.item_id ? String(r.item_id) : null,
      itemName: r.item_nome,
      requester: `${r.nome} ${r.sobrenome}`.trim(),
      tipoUsuario: r.tipo_usuario,
      createdAt: new Date(r.criado_em).toISOString(),
    })),
  )
})

adminRouter.post('/retiradas', async (req, res) => {
  const itemId = parseId(req.body?.itemId)
  const s = parseSolicitante(req.body)
  const retirada = await withTransaction(async (db) => {
    const { rows } = await db.query('SELECT nome, status FROM itens WHERE id = $1 FOR UPDATE', [itemId])
    const item = rows[0]
    if (!item) throw notFound('Item não encontrado')
    if (item.status === 'retirado') throw conflict('Este item já foi retirado')

    const ins = await db.query(
      `INSERT INTO retiradas (item_id, item_nome, usuario_id, comprovacao, cpf, nome, sobrenome, ddd, telefone, tipo_usuario)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id, criado_em`,
      [itemId, item.nome, req.user.id, s.comprovacao, s.cpf, s.nome, s.sobrenome, s.ddd, s.telefone, s.tipoUsuario],
    )
    await db.query(`UPDATE itens SET status = 'retirado', atualizado_em = now() WHERE id = $1`, [itemId])
    await logAudit(db, req.user.email, 'retirada', `${item.nome} → ${s.nome} ${s.sobrenome}`.trim())
    return { id: String(ins.rows[0].id), itemId, itemName: item.nome, createdAt: ins.rows[0].criado_em }
  })
  res.status(201).json(retirada)
})

// ── Auditoria (somente leitura, do mais recente ao mais antigo) ──
adminRouter.get('/auditoria', async (_req, res) => {
  const { rows } = await query('SELECT id, usuario, acao, alvo, criado_em FROM auditoria ORDER BY criado_em DESC, id DESC LIMIT 1000')
  res.json(rows.map(toAudit))
})
