import { badRequest } from './errors.js'

export const STATUS = ['disponivel', 'pendente', 'retirado']
export const TIPOS_USUARIO = ['Aluno', 'Professor', 'Funcionário', 'Visitante', 'Outro']

export function isValidCPF(cpf) {
  const d = String(cpf ?? '').replace(/\D/g, '')
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false
  let sum = 0
  for (let i = 0; i < 9; i++) sum += Number(d[i]) * (10 - i)
  let r = (sum * 10) % 11
  if (r >= 10) r = 0
  if (r !== Number(d[9])) return false
  sum = 0
  for (let i = 0; i < 10; i++) sum += Number(d[i]) * (11 - i)
  r = (sum * 10) % 11
  if (r >= 10) r = 0
  return r === Number(d[10])
}

const str = (v) => (typeof v === 'string' ? v.trim() : '')

function requireText(errors, obj, field, label, max) {
  const v = str(obj[field])
  if (!v) errors[field] = `${label} é obrigatório`
  else if (max && v.length > max) errors[field] = `${label} deve ter no máximo ${max} caracteres`
  return v
}

function fail(errors) {
  if (Object.keys(errors).length) throw badRequest('Dados inválidos', errors)
}

export function parseId(value) {
  if (!/^\d{1,18}$/.test(String(value))) throw badRequest('Identificador inválido')
  return String(value)
}

/** Valida o corpo de cadastro/edição de item. */
export function parseItem(body = {}) {
  const errors = {}
  const nome = requireText(errors, body, 'name', 'Nome', 120)
  const descricao = requireText(errors, body, 'description', 'Descrição')
  const categoria = requireText(errors, body, 'category', 'Categoria', 60)
  const localPublico = requireText(errors, body, 'locationPublic', 'Local público', 120)
  const localDetalhado = requireText(errors, body, 'locationDetail', 'Local detalhado', 200)
  const data = str(body.date)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data) || Number.isNaN(Date.parse(data))) errors.date = 'Data inválida'
  const status = body.status ?? 'disponivel'
  if (!STATUS.includes(status)) errors.status = 'Status inválido'
  const imagemUrl = str(body.imageUrl) || null
  if (imagemUrl && !/^https?:\/\//i.test(imagemUrl)) errors.imageUrl = 'A URL da foto deve começar com http:// ou https://'
  fail(errors)
  return { nome, descricao, categoria, localPublico, localDetalhado, data, status, imagemUrl }
}

/** Valida os dados do solicitante (solicitação de reconhecimento e retirada). */
export function parseSolicitante(body = {}) {
  const errors = {}
  const comprovacao = requireText(errors, body, 'comprovacao', 'Comprovação de posse')
  const nome = requireText(errors, body, 'nome', 'Nome', 60)
  const sobrenome = requireText(errors, body, 'sobrenome', 'Sobrenome', 80)
  const cpf = String(body.cpf ?? '').replace(/\D/g, '')
  if (!isValidCPF(cpf)) errors.cpf = 'CPF inválido'
  const ddd = String(body.ddd ?? '').replace(/\D/g, '')
  const ddNum = Number(ddd)
  if (ddd.length !== 2 || ddNum < 11 || ddNum > 99) errors.ddd = 'DDD inválido'
  const telefone = String(body.telefone ?? '').replace(/\D/g, '')
  if (telefone.length !== 8 && telefone.length !== 9) errors.telefone = 'Telefone inválido'
  const tipoUsuario = body.tipoUsuario ?? 'Aluno'
  if (!TIPOS_USUARIO.includes(tipoUsuario)) errors.tipoUsuario = 'Tipo de usuário inválido'
  fail(errors)
  return { comprovacao, cpf, nome, sobrenome, ddd, telefone, tipoUsuario }
}

export function parseCategoriaNome(body = {}) {
  const errors = {}
  const nome = requireText(errors, body, 'name', 'Nome da categoria', 60)
  fail(errors)
  return nome
}
