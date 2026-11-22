import { after, test } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'node:http'

const originalEnv = {
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_STORAGE_BUCKET: process.env.SUPABASE_STORAGE_BUCKET,
}
const requests = []
const server = createServer(async (req, res) => {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  requests.push({
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: Buffer.concat(chunks),
  })
  res.writeHead(200, { 'Content-Type': 'application/json' }).end('{}')
})
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
const { port } = server.address()
process.env.SUPABASE_URL = `http://127.0.0.1:${port}`
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
process.env.SUPABASE_STORAGE_BUCKET = 'item-images'

const { deleteItemImage, detectImageFormat, uploadItemImage } = await import('../src/utils/supabaseStorage.js')

after(async () => {
  await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())))
  for (const [key, value] of Object.entries(originalEnv)) {
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
})

test('confere a assinatura de JPEG, PNG e WEBP', () => {
  const jpeg = detectImageFormat({
    mimetype: 'image/jpeg',
    buffer: Buffer.from([0xff, 0xd8, 0xff, 0xe0]),
  })
  const png = detectImageFormat({
    mimetype: 'image/png',
    buffer: Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  })
  const webp = detectImageFormat({
    mimetype: 'image/webp',
    buffer: Buffer.from('RIFF0000WEBP'),
  })

  assert.equal(jpeg.extension, 'jpg')
  assert.equal(png.extension, 'png')
  assert.equal(webp.extension, 'webp')
})

test('envia a imagem ao bucket configurado e consegue removê-la', async () => {
  const pngBytes = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const uploaded = await uploadItemImage({ mimetype: 'image/png', buffer: pngBytes })

  assert.match(uploaded.imageUrl, new RegExp(`/storage/v1/object/public/item-images/${uploaded.path}$`))
  assert.equal(requests[0].method, 'POST')
  assert.equal(requests[0].headers.authorization, 'Bearer test-service-role-key')
  assert.equal(requests[0].headers.apikey, 'test-service-role-key')
  assert.deepEqual(requests[0].body, pngBytes)

  await deleteItemImage(uploaded.imageUrl)
  assert.equal(requests[1].method, 'DELETE')
  assert.deepEqual(JSON.parse(requests[1].body.toString()), { prefixes: [uploaded.path] })
})

test('rejeita MIME ou conteúdo que não corresponde a imagem permitida', () => {
  assert.throws(
    () => detectImageFormat({ mimetype: 'image/svg+xml', buffer: Buffer.from('<svg />') }),
    /JPEG, PNG ou WEBP/,
  )
  assert.throws(
    () => detectImageFormat({ mimetype: 'image/png', buffer: Buffer.from('<svg />') }),
    /JPEG, PNG ou WEBP/,
  )
})
