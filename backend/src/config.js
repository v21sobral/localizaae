import 'dotenv/config'

const isProd = process.env.NODE_ENV === 'production'

if (isProd && (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'troque-este-segredo')) {
  throw new Error('Defina um JWT_SECRET seguro em produção.')
}

export const config = {
  isProd,
  port: Number(process.env.PORT || 3001),
  databaseUrl: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/localizaae',
  pgSsl: process.env.PGSSL === 'true',
  jwtSecret: process.env.JWT_SECRET || 'troque-este-segredo',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
}
