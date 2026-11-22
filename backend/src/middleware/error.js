import { HttpError } from '../utils/errors.js'

export function notFoundHandler(_req, res) {
  res.status(404).json({ error: 'Rota não encontrada' })
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, details: err.details })
  }
  if (err?.name === 'MulterError') {
    const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400
    const message = err.code === 'LIMIT_FILE_SIZE'
      ? 'A imagem deve ter no máximo 5 MB.'
      : 'Envie apenas um arquivo de imagem válido.'
    return res.status(status).json({ error: message })
  }
  if (err?.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON inválido' })
  if (err?.type === 'entity.too.large') return res.status(413).json({ error: 'Requisição muito grande' })
  console.error(err)
  res.status(500).json({ error: 'Erro interno do servidor' })
}
