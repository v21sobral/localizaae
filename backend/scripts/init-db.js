// Cria o banco (se não existir) e aplica database/schema.sql. Idempotente.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'
import { config } from '../src/config.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const schemaPath = process.env.SCHEMA_PATH || path.resolve(here, '../../database/schema.sql')
const ssl = config.pgSsl ? { rejectUnauthorized: false } : undefined

async function ensureDatabase() {
  const probe = new pg.Client({ connectionString: config.databaseUrl, ssl })
  try {
    await probe.connect()
    await probe.end()
  } catch (err) {
    if (err.code !== '3D000') throw err // 3D000 = banco não existe
    const url = new URL(config.databaseUrl)
    const dbName = decodeURIComponent(url.pathname.slice(1))
    if (!/^[A-Za-z0-9_]+$/.test(dbName)) throw new Error(`Nome de banco inválido: ${dbName}`)
    url.pathname = '/postgres'
    const admin = new pg.Client({ connectionString: url.toString(), ssl })
    await admin.connect()
    await admin.query(`CREATE DATABASE "${dbName}"`)
    await admin.end()
    console.log(`Banco "${dbName}" criado.`)
  }
}

await ensureDatabase()
const client = new pg.Client({ connectionString: config.databaseUrl, ssl })
await client.connect()
await client.query(fs.readFileSync(schemaPath, 'utf8'))
await client.end()
console.log('Schema aplicado com sucesso.')
