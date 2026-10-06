import { useState } from 'react'
import AdminShell from '../components/AdminShell'
import { Badge } from '../components/StatusBadge'
import { useAuditLog } from '../audit'
const ACTION_META = {
  login: {
    label: 'Login',
    bg: 'var(--color-status-pending-bg)',
    text: 'var(--color-status-pending-text)',
    border: 'var(--color-status-pending-border)',
  },
  'item-create': {
    label: 'Cadastro de item',
    bg: 'var(--color-status-retrieved-bg)',
    text: 'var(--color-status-retrieved-text)',
    border: 'var(--color-status-retrieved-border)',
  },
  'item-edit': {
    label: 'Edição de item',
    bg: 'var(--color-status-pending-bg)',
    text: 'var(--color-status-pending-text)',
    border: 'var(--color-status-pending-border)',
  },
  'item-delete': {
    label: 'Exclusão de item',
    bg: 'var(--color-danger-bg)',
    text: 'var(--color-danger-text)',
    border: 'var(--color-danger-border)',
  },
  retirada: {
    label: 'Registro de retirada',
    bg: 'var(--color-status-available-bg)',
    text: 'var(--color-status-available-text)',
    border: 'var(--color-status-available-border)',
  },
  'category-create': {
    label: 'Cadastro de categoria',
    bg: 'var(--color-primary-light)',
    text: 'var(--color-primary)',
    border: 'var(--color-status-pending-border)',
  },
  'category-edit': {
    label: 'Edição de categoria',
    bg: 'var(--color-primary-light)',
    text: 'var(--color-primary)',
    border: 'var(--color-status-pending-border)',
  },
  'category-delete': {
    label: 'Exclusão de categoria',
    bg: 'var(--color-danger-bg)',
    text: 'var(--color-danger-text)',
    border: 'var(--color-danger-border)',
  },
}
const ACTION_OPTIONS = Object.keys(ACTION_META)
export default function AdminAuditoria({ onNavigate, onLogout }) {
  const { entries: log, loading, error } = useAuditLog()
  const auditUsers = [...new Set(log.map((e) => e.user))]
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [filterAction, setFilterAction] = useState('all')
  const [filterUser, setFilterUser] = useState('all')
  const filtered = log.filter((e) => {
    const d = new Date(e.timestamp)
    if (dateFrom && d < new Date(`${dateFrom}T00:00:00`)) return false
    if (dateTo && d > new Date(`${dateTo}T23:59:59`)) return false
    if (filterAction !== 'all' && e.action !== filterAction) return false
    if (filterUser !== 'all' && e.user !== filterUser) return false
    return true
  })
  const inputStyle = {
    padding: '6px 10px',
    border: '1px solid var(--color-border)',
    borderRadius: 6,
    fontSize: 13,
    outline: 'none',
    background: 'var(--color-surface)',
    color: 'var(--color-text)',
  }
  return (
    <AdminShell active="admin-auditoria" onNavigate={onNavigate} onLogout={onLogout}>
      <div style={{ marginBottom: 22 }}>
        <h1
          style={{
            fontWeight: 600,
            fontSize: 18,
            color: 'var(--color-text)',
            letterSpacing: '-0.02em',
            marginBottom: 2,
          }}
        >
          Auditoria
        </h1>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
          Registro somente-leitura de todas as movimentações do sistema, da mais recente para a mais antiga.
        </p>
      </div>

      {/* Filters */}
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 7,
          padding: '14px 18px',
          marginBottom: 18,
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--color-text-muted)',
            marginBottom: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          Filtros
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label
              htmlFor="audit-from"
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 500,
                color: 'var(--color-text)',
                marginBottom: 4,
              }}
            >
              Período de
            </label>
            <input
              id="audit-from"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = 'var(--color-primary)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
            />
          </div>
          <div>
            <label
              htmlFor="audit-to"
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 500,
                color: 'var(--color-text)',
                marginBottom: 4,
              }}
            >
              até
            </label>
            <input
              id="audit-to"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = 'var(--color-primary)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
            />
          </div>
          <div>
            <label
              htmlFor="audit-action"
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 500,
                color: 'var(--color-text)',
                marginBottom: 4,
              }}
            >
              Tipo de ação
            </label>
            <select
              id="audit-action"
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              <option value="all">Todas</option>
              {ACTION_OPTIONS.map((a) => (
                <option key={a} value={a}>
                  {ACTION_META[a].label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="audit-user"
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 500,
                color: 'var(--color-text)',
                marginBottom: 4,
              }}
            >
              Usuário
            </label>
            <select
              id="audit-user"
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              <option value="all">Todos</option>
              {auditUsers.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
          {(dateFrom || dateTo || filterAction !== 'all' || filterUser !== 'all') && (
            <button
              onClick={() => {
                setDateFrom('')
                setDateTo('')
                setFilterAction('all')
                setFilterUser('all')
              }}
              style={{
                fontSize: 12,
                color: 'var(--color-text-muted)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '6px 4px',
                textDecoration: 'underline',
              }}
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 7,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text)' }}>
            Log de movimentações
          </span>
          <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
            {filtered.length} {filtered.length === 1 ? 'registro' : 'registros'}
          </span>
        </div>
        <div className="table-scroll">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-bg)' }}>
                {['Data e horário', 'Usuário', 'Ação', 'Registro afetado'].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '8px 14px',
                      textAlign: 'left',
                      fontSize: 11,
                      fontWeight: 600,
                      color: 'var(--color-text-muted)',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      borderBottom: '1px solid var(--color-border)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((e, i) => {
                const m = ACTION_META[e.action]
                return (
                  <tr
                    key={e.id}
                    style={{
                      borderBottom: i < filtered.length - 1 ? '1px solid var(--color-border)' : 'none',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={(ev) => (ev.currentTarget.style.background = 'var(--color-bg)')}
                    onMouseLeave={(ev) => (ev.currentTarget.style.background = 'transparent')}
                  >
                    <td
                      style={{
                        padding: '10px 14px',
                        fontSize: 13,
                        color: 'var(--color-text-muted)',
                        whiteSpace: 'nowrap',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {new Date(e.timestamp).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td
                      style={{
                        padding: '10px 14px',
                        fontSize: 13,
                        color: 'var(--color-text)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {e.user}
                    </td>
                    <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                      <Badge label={m.label} bg={m.bg} text={m.text} border={m.border} size="sm" />
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: 13, color: 'var(--color-text)' }}>
                      {e.target}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div
              style={{
                padding: '28px 16px',
                textAlign: 'center',
                fontSize: 13,
                color: 'var(--color-text-muted)',
              }}
            >
              {loading ? 'Carregando registros…' : error || 'Nenhum registro para os filtros selecionados.'}
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  )
}
