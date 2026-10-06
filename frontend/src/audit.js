import { useCallback, useEffect, useState } from 'react'
import { api, errorMessage } from './services/api'

/**
 * Log de auditoria vindo da API (somente leitura, do mais recente ao mais antigo).
 * O registro é feito pelo próprio back-end a cada operação (RN5).
 */
export function useAuditLog() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const reload = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setEntries(await api.getAudit())
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  return { entries, loading, error, reload }
}
