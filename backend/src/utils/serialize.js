/** Colunas e JOIN comuns para montar o item no formato usado pelo front-end. */
export const ITEM_SELECT = `
  SELECT i.id, i.nome, i.descricao, c.nome AS categoria, i.local_publico, i.local_detalhado,
         i.data_encontrado, i.status, i.imagem_url
    FROM itens i
    JOIN categorias c ON c.id = i.categoria_id`

/** Item como o front-end espera. `local_detalhado` só entra na visão administrativa. */
export function toItem(row, { admin = false } = {}) {
  const item = {
    id: String(row.id),
    name: row.nome,
    description: row.descricao,
    category: row.categoria,
    locationPublic: row.local_publico,
    date: row.data_encontrado,
    status: row.status,
    imageUrl: row.imagem_url ?? undefined,
  }
  if (admin) item.locationDetail = row.local_detalhado
  return item
}

export const toCategoria = (row) => ({ id: String(row.id), name: row.nome })

export const toAudit = (row) => ({
  id: String(row.id),
  timestamp: new Date(row.criado_em).toISOString(),
  user: row.usuario,
  action: row.acao,
  target: row.alvo,
})
