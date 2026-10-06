import { Router } from 'express'
import bcrypt from 'bcryptjs'
import rateLimit from 'express-rate-limit'
import { query } from '../db/pool.js'
import { signToken, requireAdmin } from '../middleware/auth.js'
import { badRequest, unauthorized } from '../utils/errors.js'
import { logAudit } from '../utils/audit.js'

export const authRouter = Router()

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Muitas tentativas de login. Tente novamente em alguns minutos.' },
})

// Hash descartável: mantém o tempo de resposta parecido quando o usuário não existe.
const DUMMY_HASH = bcrypt.hashSync('localizaae-dummy', 10)

authRouter.post('/login', loginLimiter, async (req, res) => {
  const username = typeof req.body?.username === 'string' ? req.body.username.trim() : ''
  const password = typeof req.body?.password === 'string' ? req.body.password : ''
  if (!username || !password) throw badRequest('Informe usuário e senha')

  const { rows } = await query(
    'SELECT id, username, email, senha_hash FROM usuarios WHERE username = $1 OR lower(email) = lower($1)',
    [username],
  )
  const user = rows[0]
  const ok = await bcrypt.compare(password, user?.senha_hash ?? DUMMY_HASH)
  if (!user || !ok) throw unauthorized('Usuário ou senha incorretos')

  await logAudit(null, user.email, 'login', 'Sessão iniciada')
  res.json({
    token: signToken(user),
    user: { id: String(user.id), username: user.username, email: user.email },
  })
})

authRouter.get('/me', requireAdmin, (req, res) => {
  res.json({ user: req.user })
})
