import { query } from '../db/pool.js'

/** Registra uma operação no log de auditoria (RN5). `db` pode ser um client de transação. */
export function logAudit(db, usuario, acao, alvo) {
  return (db ?? { query }).query('INSERT INTO auditoria (usuario, acao, alvo) VALUES ($1, $2, $3)', [
    usuario,
    acao,
    alvo,
  ])
}
