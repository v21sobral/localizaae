import pg from 'pg'
import { config } from '../config.js'

// DATE (OID 1082) volta como string 'YYYY-MM-DD', sem conversão de fuso.
pg.types.setTypeParser(1082, (v) => v)

export const pool = new pg.Pool({
  connectionString: config.databaseUrl,
  ssl: config.pgSsl ? { rejectUnauthorized: false } : undefined,
})

export const query = (text, params) => pool.query(text, params)

/** Executa fn(client) dentro de uma transação. */
export async function withTransaction(fn) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await fn(client)
    await client.query('COMMIT')
    return result
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}
