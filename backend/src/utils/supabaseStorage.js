import { randomUUID } from 'node:crypto'
import { config } from '../config.js'
import { badRequest, HttpError } from './errors.js'

const IMAGE_FORMATS = [
  {
    contentType: 'image/jpeg',
    extension: 'jpg',
    matches: (buffer) => buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff,
  },
  {
    contentType: 'image/png',
    extension: 'png',
    matches: (buffer) => buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
  },
  {
    contentType: 'image/webp',
    extension: 'webp',
    matches: (buffer) =>
      buffer.length >= 12 &&
      buffer.toString('ascii', 0, 4) === 'RIFF' &&
      buffer.toString('ascii', 8, 12) === 'WEBP',
  },
]

export function detectImageFormat(file) {
  if (!Buffer.isBuffer(file?.buffer)) throw badRequest('Arquivo de imagem inválido.')
  const format = IMAGE_FORMATS.find((candidate) => candidate.contentType === file.mimetype && candidate.matches(file.buffer))
  if (!format) throw badRequest('O conteúdo do arquivo não corresponde a uma imagem JPEG, PNG ou WEBP válida.')
  return format
}

function storageSettings() {
  let url
  try {
    url = new URL(config.supabaseUrl)
  } catch {
    throw new HttpError(503, 'Upload indisponível. Configure uma URL válida para o Supabase Storage.')
  }
  const isLocal = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
  if ((url.protocol !== 'https:' && !(url.protocol === 'http:' && isLocal)) || !config.supabaseServiceRoleKey) {
    throw new HttpError(503, 'Upload indisponível. Configure o Supabase Storage no servidor.')
  }
  return {
    baseUrl: url.origin,
    apiKey: config.supabaseServiceRoleKey,
    bucket: config.supabaseStorageBucket,
  }
}

async function storageFetch(url, options) {
  try {
    return await fetch(url, { ...options, signal: AbortSignal.timeout(15000) })
  } catch {
    throw new HttpError(502, 'Não foi possível conectar ao Supabase Storage.')
  }
}

export async function uploadItemImage(file) {
  const format = detectImageFormat(file)
  const { baseUrl, apiKey, bucket } = storageSettings()
  const path = `${randomUUID()}.${format.extension}`
  const bucketPath = encodeURIComponent(bucket)
  const response = await storageFetch(`${baseUrl}/storage/v1/object/${bucketPath}/${path}`, {
    method: 'POST',
    headers: {
      apikey: apiKey,
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': format.contentType,
      'x-upsert': 'false',
    },
    body: file.buffer,
  })
  if (!response.ok) {
    throw new HttpError(502, `O Supabase Storage recusou a imagem (HTTP ${response.status}). Verifique o bucket e as permissões.`)
  }
  return {
    path,
    imageUrl: `${baseUrl}/storage/v1/object/public/${bucketPath}/${path}`,
  }
}

function getManagedImagePath(imageUrl) {
  if (!config.supabaseUrl || !imageUrl) return null
  let parsedUrl
  let baseUrl
  try {
    parsedUrl = new URL(imageUrl)
    baseUrl = new URL(config.supabaseUrl)
  } catch {
    return null
  }
  if (parsedUrl.origin !== baseUrl.origin) return null
  const prefix = `/storage/v1/object/public/${encodeURIComponent(config.supabaseStorageBucket)}/`
  if (!parsedUrl.pathname.startsWith(prefix)) return null
  const path = parsedUrl.pathname.slice(prefix.length)
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$/.test(path)
    ? path
    : null
}

export async function deleteItemImage(imageUrl) {
  const path = getManagedImagePath(imageUrl)
  if (!path) return
  const { baseUrl, apiKey, bucket } = storageSettings()
  const response = await storageFetch(`${baseUrl}/storage/v1/object/${encodeURIComponent(bucket)}`, {
    method: 'DELETE',
    headers: {
      apikey: apiKey,
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prefixes: [path] }),
  })
  if (!response.ok) throw new HttpError(502, `Não foi possível remover a imagem do Supabase Storage (HTTP ${response.status}).`)
}

export async function cleanupItemImage(imageUrl) {
  try {
    await deleteItemImage(imageUrl)
  } catch (error) {
    console.error('Falha ao limpar imagem no Supabase Storage:', error)
  }
}
