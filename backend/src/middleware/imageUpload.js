import multer from 'multer'
import { badRequest } from '../utils/errors.js'

const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

export const itemImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_SIZE, files: 1, fields: 30, parts: 31 },
  fileFilter(_req, file, callback) {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      callback(badRequest('Formato inválido. Envie uma imagem JPEG, PNG ou WEBP.'))
      return
    }
    callback(null, true)
  },
})
