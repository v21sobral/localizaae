import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import { config } from './config.js'
import { query } from './db/pool.js'
import { authRouter } from './routes/auth.js'
import { publicoRouter } from './routes/publico.js'
import { adminRouter } from './routes/admin.js'
import { errorHandler, notFoundHandler } from './middleware/error.js'

export function createApp() {
  const app = express()
  app.disable('x-powered-by')
  app.set('trust proxy', 1)

  app.use(helmet())
  app.use(cors({ origin: config.corsOrigins }))
  app.use(express.json({ limit: '100kb' }))
  app.use(
    '/api',
    rateLimit({ windowMs: 15 * 60 * 1000, limit: 600, standardHeaders: 'draft-7', legacyHeaders: false }),
  )

  app.get('/api/health', async (_req, res) => {
    await query('SELECT 1')
    res.json({ status: 'ok' })
  })

  app.use('/api/auth', authRouter)
  app.use('/api/admin', adminRouter)
  app.use('/api', publicoRouter)

  app.use(notFoundHandler)
  app.use(errorHandler)
  return app
}
