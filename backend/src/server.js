import { config } from './config.js'
import { createApp } from './app.js'
import { pool } from './db/pool.js'

const app = createApp()
const server = app.listen(config.port, () => {
  console.log(`LocalizaAê API em http://localhost:${config.port}/api`)
})

async function shutdown() {
  server.close(async () => {
    await pool.end()
    process.exit(0)
  })
}
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
