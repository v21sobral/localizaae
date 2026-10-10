// Cliente da API do LocalizaAê (Node.js + PostgreSQL).
// Em desenvolvimento o Vite faz proxy de /api para o back-end (ver vite.config.js).
// Em produção, defina VITE_API_URL (ex.: https://api.exemplo.com/api).
const BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')
const TOKEN_KEY = 'localiza-ae:token'

export class ApiError extends Error {
  constructor(status, message, details) {
    super(message)
    this.status = status
    this.details = details
  }
}

export const getToken = () => {
  try {
    return sessionStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}
export const setToken = (token) => {
  try {
    if (token) sessionStorage.setItem(TOKEN_KEY, token)
    else sessionStorage.removeItem(TOKEN_KEY)
  } catch {
    /* sessionStorage indisponível */
  }
}

async function request(method, path, body) {
  const token = getToken()
  let res
  try {
    res = await fetch(BASE + path, {
      method,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError(0, 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.')
  }
  const data = res.status === 204 ? null : await res.json().catch(() => null)
  if (!res.ok) {
    if (res.status === 401 && token && path !== '/auth/login') {
      setToken(null)
      window.dispatchEvent(new Event('localiza:session-expired'))
    }
    throw new ApiError(res.status, data?.error || 'Erro inesperado no servidor.', data?.details)
  }
  return data
}

export const api = {
  // Público
  getItems: () => request('GET', '/itens'),
  getCategories: () => request('GET', '/categorias'),
  createClaim: (itemId, form) => request('POST', `/itens/${itemId}/solicitacoes`, form),

  // Autenticação
  login: (username, password) => request('POST', '/auth/login', { username, password }),
  me: () => request('GET', '/auth/me'),

  // Administração
  getAdminItems: () => request('GET', '/admin/itens'),
  getItemClaims: (id) => request('GET', `/admin/itens/${id}/solicitacoes`),
  createItem: (item) => request('POST', '/admin/itens', item),
  updateItem: (id, item) => request('PUT', `/admin/itens/${id}`, item),
  deleteItem: (id) => request('DELETE', `/admin/itens/${id}`),
  createCategory: (name) => request('POST', '/admin/categorias', { name }),
  renameCategory: (id, name) => request('PUT', `/admin/categorias/${id}`, { name }),
  deleteCategory: (id) => request('DELETE', `/admin/categorias/${id}`),
  createWithdrawal: (data) => request('POST', '/admin/retiradas', data),
  getAudit: () => request('GET', '/admin/auditoria'),
}

/** Mensagem amigável a partir de um erro da API (inclui o 1º erro de campo, se houver). */
export function errorMessage(err) {
  if (err instanceof ApiError) {
    const first = err.details && Object.values(err.details)[0]
    return first ? `${err.message}: ${first}` : err.message
  }
  return 'Ocorreu um erro inesperado.'
}
