import jwt from 'jsonwebtoken'
import { config } from '../config.js'
import { unauthorized } from '../utils/errors.js'

export function signToken(user) {
  return jwt.sign({ sub: String(user.id), username: user.username, email: user.email }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  })
}

/** Exige `Authorization: Bearer <token>` válido (perfil Administrador — RN2). */
export function requireAdmin(req, _res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return next(unauthorized())
  try {
    const payload = jwt.verify(token, config.jwtSecret)
    req.user = { id: payload.sub, username: payload.username, email: payload.email }
    next()
  } catch {
    next(unauthorized('Sessão expirada ou inválida'))
  }
}
