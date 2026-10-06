import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { query, withTransaction } from '../db/pool.js'
import { ITEM_SELECT, toItem, toCategoria } from '../utils/serialize.js'
import { parseId, parseSolicitante } from '../utils/validators.js'
import { conflict, notFound } from '../utils/errors.js'

export const publicoRouter = Router()

const claimLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Muitas solicitações. Tente novamente mais tarde.' },
})

publicoRouter.get('/categorias', async (_req, res) => {
  const { rows } = await query('SELECT id, nome FROM categorias ORDER BY nome')
  res.json(rows.map(toCategoria))
})

// Mural: nunca inclui `local_detalhado`.
publicoRouter.get('/itens', async (_req, res) => {
  const { rows } = await query(`${ITEM_SELECT} ORDER BY i.data_encontrado DESC, i.id DESC`)
  res.json(rows.map((r) => toItem(r)))
})

publicoRouter.get('/itens/:id', async (req, res) => {
  const id = parseId(req.params.id)
  const { rows } = await query(`${ITEM_SELECT} WHERE i.id = $1`, [id])
  if (!rows[0]) throw notFound('Item não encontrado')
  res.json(toItem(rows[0]))
})

// Solicitação de reconhecimento: só aqui (ou na retirada) dados pessoais são gravados.
publicoRouter.post('/itens/:id/solicitacoes', claimLimiter, async (req, res) => {
  const id = parseId(req.params.id)
  const s = parseSolicitante(req.body)

  await withTransaction(async (db) => {
    const { rows } = await db.query('SELECT status FROM itens WHERE id = $1 FOR UPDATE', [id])
    if (!rows[0]) throw notFound('Item não encontrado')
    if (rows[0].status !== 'disponivel') throw conflict('Este item não está mais disponível para solicitação')

    await db.query(
      `INSERT INTO solicitacoes (item_id, comprovacao, cpf, nome, sobrenome, ddd, telefone, tipo_usuario)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [id, s.comprovacao, s.cpf, s.nome, s.sobrenome, s.ddd, s.telefone, s.tipoUsuario],
    )
    await db.query(`UPDATE itens SET status = 'pendente', atualizado_em = now() WHERE id = $1`, [id])
  })

  res.status(201).json({ ok: true })
})
