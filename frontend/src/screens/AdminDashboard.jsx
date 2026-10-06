import { useState } from 'react'
import StatusBadge from '../components/StatusBadge'
import AdminShell from '../components/AdminShell'
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  CheckCircle,
  Package,
  TrendingUp,
  Clock,
  BarChart2,
  Check,
  X,
  AlertTriangle,
} from '../components/Icons'
import { formatDate, daysAvailableFromISO, NEAR_DEADLINE_DAYS } from '../utils/date'
const CAT_COLORS = ['#155289', '#5AA0D2', '#E68C28', '#2E9CC4', '#157F3C', '#9C4A06']
function catColor(cat) {
  let h = 0
  for (let i = 0; i < cat.length; i++) h = (h * 31 + cat.charCodeAt(i)) | 0
  return CAT_COLORS[Math.abs(h) % CAT_COLORS.length]
}
export default function AdminDashboard({ items, onNavigate, onLogout, onDelete }) {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [deleteId, setDeleteId] = useState(null)
  const total = items.length
  const available = items.filter((i) => i.status === 'disponivel').length
  const retrieved = items.filter((i) => i.status === 'retirado').length
  const pending = items.filter((i) => i.status === 'pendente').length
  const rate = total > 0 ? Math.round((retrieved / total) * 100) : 0
  const nearDeadline = items.filter(
    (i) => i.status === 'disponivel' && daysAvailableFromISO(i.date) >= NEAR_DEADLINE_DAYS,
  ).length
  const filtered = items.filter((item) => {
    const q = search.toLowerCase()
    return (
      (!q || item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)) &&
      (filterStatus === 'all' || item.status === filterStatus)
    )
  })
  return (
    <AdminShell active="admin-dashboard" onNavigate={onNavigate} onLogout={onLogout}>
      <div
        style={{
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1
            style={{
              fontWeight: 600,
              fontSize: 18,
              color: 'var(--color-text)',
              marginBottom: 2,
              letterSpacing: '-0.02em',
            }}
          >
            Painel do administrador
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Visão geral dos itens cadastrados.</p>
        </div>
        <button
          onClick={() => onNavigate('admin-item-form')}
          className="btn-primary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'var(--color-primary)',
            color: 'var(--color-on-primary)',
            border: 'none',
            borderRadius: 9999,
            padding: '8px 18px',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-primary-dark)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-primary)')}
        >
          <Plus size={14} strokeWidth={2} />
          Cadastrar item
        </button>
      </div>

      {/* KPI row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 10,
          marginBottom: 24,
        }}
      >
        <KpiCard label="Total de itens" value={total} Icon={Package} />
        <KpiCard label="Disponíveis" value={available} Icon={Clock} accent="var(--color-amber)" />
        <KpiCard label="Retirados" value={retrieved} Icon={CheckCircle} accent="var(--color-success)" />
        <KpiCard label="Pendentes" value={pending} Icon={BarChart2} />
        <KpiCard
          label="Próx. do prazo"
          value={nearDeadline}
          Icon={AlertTriangle}
          accent="var(--color-danger-text)"
        />
        <KpiCard
          label="Taxa de devolução"
          value={`${rate}%`}
          Icon={TrendingUp}
          accent="var(--color-primary)"
        />
      </div>

      {/* Table card */}
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 8,
          overflow: 'hidden',
          boxShadow: '0 1px 3px var(--color-card-shadow)',
        }}
      >
        <div
          style={{
            padding: '14px 18px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            gap: 10,
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text)' }}>
              Itens cadastrados
            </span>
            <span
              style={{
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: 9999,
                padding: '1px 8px',
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--color-text-muted)',
              }}
            >
              {filtered.length !== items.length ? `${filtered.length} / ${items.length}` : items.length}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <span
                style={{
                  position: 'absolute',
                  left: 9,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-subtle)',
                  display: 'flex',
                  pointerEvents: 'none',
                }}
              >
                <Search size={13} strokeWidth={1.75} />
              </span>
              <input
                id="dashboard-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar…"
                style={{
                  paddingLeft: 28,
                  paddingRight: 10,
                  paddingTop: 6,
                  paddingBottom: 6,
                  border: '1px solid var(--color-border)',
                  borderRadius: 6,
                  fontSize: 13,
                  outline: 'none',
                  color: 'var(--color-text)',
                  background: 'var(--color-bg)',
                  transition: 'border-color 0.15s',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--color-primary)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: '6px 12px',
                border: '1px solid var(--color-border)',
                borderRadius: 6,
                fontSize: 13,
                color: 'var(--color-text)',
                background: 'var(--color-bg)',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="all">Todos os status</option>
              <option value="disponivel">Disponível</option>
              <option value="retirado">Retirado</option>
              <option value="pendente">Pendente</option>
            </select>
          </div>
        </div>

        <div className="table-scroll">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-bg)' }}>
                {['Item', 'Local', 'Data', 'Status', 'Ações'].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '9px 16px',
                      textAlign: 'left',
                      fontSize: 10.5,
                      fontWeight: 700,
                      color: 'var(--color-text-muted)',
                      letterSpacing: '0.07em',
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
              {filtered.map((item, i) => (
                <tr
                  key={item.id}
                  style={{
                    borderBottom: i < filtered.length - 1 ? '1px solid var(--color-border)' : 'none',
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '11px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <ItemAvatar name={item.name} category={item.category} />
                      <div>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: 13,
                            color: 'var(--color-text)',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.name}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>
                          {item.category}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td
                    style={{
                      padding: '11px 16px',
                      fontSize: 13,
                      color: 'var(--color-text-muted)',
                      maxWidth: 200,
                    }}
                  >
                    <span
                      style={{
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.locationPublic}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: '11px 16px',
                      fontSize: 13,
                      color: 'var(--color-text-muted)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {formatDate(item.date, { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '11px 16px' }}>
                    <StatusBadge status={item.status} size="sm" date={item.date} />
                  </td>
                  <td style={{ padding: '11px 16px' }}>
                    {deleteId === item.id ? (
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span
                          style={{
                            fontSize: 12,
                            color: 'var(--color-danger-text)',
                            fontWeight: 500,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          Confirmar?
                        </span>
                        <button
                          onClick={() => {
                            onDelete(item.id)
                            setDeleteId(null)
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                            padding: '4px 10px',
                            background: 'var(--color-danger-text)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          <Check size={11} strokeWidth={2.5} /> Sim
                        </button>
                        <button
                          onClick={() => setDeleteId(null)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 28,
                            height: 28,
                            background: 'transparent',
                            border: '1px solid var(--color-border)',
                            borderRadius: 6,
                            cursor: 'pointer',
                            color: 'var(--color-text-muted)',
                          }}
                        >
                          <X size={12} strokeWidth={2} />
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: 4 }}>
                        <TblAction
                          label="Editar"
                          Icon={Pencil}
                          onClick={() => onNavigate('admin-item-form', { editId: item.id })}
                        />
                        {item.status === 'disponivel' && (
                          <TblAction
                            label="Retirada"
                            Icon={CheckCircle}
                            color="var(--color-primary)"
                            onClick={() => onNavigate('admin-retirada', { itemId: item.id })}
                          />
                        )}
                        <TblAction
                          label="Excluir"
                          Icon={Trash2}
                          color="var(--color-danger-text)"
                          onClick={() => setDeleteId(item.id)}
                        />
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 8,
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                  color: 'var(--color-text-subtle)',
                }}
              >
                <Package size={20} strokeWidth={1.5} />
              </div>
              <p style={{ fontWeight: 500, fontSize: 14, color: 'var(--color-text)', marginBottom: 4 }}>
                Nenhum item encontrado
              </p>
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                Tente ajustar os filtros de busca.
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  )
}
function KpiCard({ label, value, Icon, accent }) {
  const accentColor = accent ?? 'var(--color-text-subtle)'
  return (
    <div
      className="card-hover-sm"
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderTop: `3px solid ${accentColor}`,
        borderRadius: 8,
        padding: '14px 16px',
        boxShadow: '0 1px 3px var(--color-card-shadow)',
        cursor: 'default',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <span
          style={{
            fontSize: 11,
            color: 'var(--color-text-muted)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            lineHeight: 1.4,
          }}
        >
          {label}
        </span>
        <span
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--color-bg)',
            color: accentColor,
          }}
        >
          <Icon size={13} strokeWidth={1.75} />
        </span>
      </div>
      <div
        style={{
          fontWeight: 600,
          fontSize: 26,
          color: 'var(--color-text)',
          letterSpacing: '-0.04em',
          lineHeight: 1,
        }}
      >
        {value}
      </div>
    </div>
  )
}
function ItemAvatar({ name, category }) {
  const color = catColor(category)
  const initial = name.charAt(0).toUpperCase()
  return (
    <div
      style={{
        width: 34,
        height: 34,
        borderRadius: 8,
        background: `${color}18`,
        border: `1px solid ${color}2E`,
        color: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 13,
        fontWeight: 700,
        flexShrink: 0,
        letterSpacing: '-0.01em',
      }}
    >
      {initial}
    </div>
  )
}
function TblAction({ label, Icon, color, onClick }) {
  const c = color ?? 'var(--color-text-muted)'
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      style={{
        width: 30,
        height: 30,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        border: '1px solid var(--color-border)',
        borderRadius: 6,
        color: c,
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
      onMouseEnter={(e) => {
        const b = e.currentTarget
        b.style.background = 'var(--color-bg)'
        b.style.borderColor = 'var(--color-border-strong)'
        b.style.transform = 'scale(1.1)'
      }}
      onMouseLeave={(e) => {
        const b = e.currentTarget
        b.style.background = 'transparent'
        b.style.borderColor = 'var(--color-border)'
        b.style.transform = 'scale(1)'
      }}
    >
      <Icon size={13} strokeWidth={2} />
    </button>
  )
}
