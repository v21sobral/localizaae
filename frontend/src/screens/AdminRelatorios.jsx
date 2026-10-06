import { useState, useMemo } from 'react'
import StatusBadge from '../components/StatusBadge'
import AdminShell from '../components/AdminShell'
import { Package, CheckCircle, Clock, BarChart2, TrendingUp, Download, Printer } from '../components/Icons'
import { parseLocalDate, formatDate, todayLocalISO } from '../utils/date'
export default function AdminRelatorios({ items, categories, onNavigate, onLogout }) {
  // Default period: 1st day of oldest item's month → today
  const defaults = useMemo(() => {
    const today = todayLocalISO()
    if (items.length === 0) return { from: today.slice(0, 7) + '-01', to: today }
    const oldest = items.reduce((a, b) => (a.date < b.date ? a : b)).date
    const fromDate = oldest.slice(0, 7) + '-01'
    return { from: fromDate, to: today }
  }, [items])
  const [dateFrom, setDateFrom] = useState(defaults.from)
  const [dateTo, setDateTo] = useState(defaults.to)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const setFullPeriod = () => {
    setDateFrom(defaults.from)
    setDateTo(defaults.to)
  }
  const filtered = items.filter((item) => {
    const d = parseLocalDate(item.date)
    const from = dateFrom ? parseLocalDate(dateFrom) : null
    const to = dateTo ? parseLocalDate(dateTo) : null
    return (
      (!from || d >= from) &&
      (!to || d <= to) &&
      (filterStatus === 'all' || item.status === filterStatus) &&
      (filterCategory === 'all' || item.category === filterCategory)
    )
  })
  const total = filtered.length
  const available = filtered.filter((i) => i.status === 'disponivel').length
  const retrieved = filtered.filter((i) => i.status === 'retirado').length
  const pending = filtered.filter((i) => i.status === 'pendente').length
  const rate = total > 0 ? Math.round((retrieved / total) * 100) : 0
  const categoryData = Array.from(
    filtered.reduce((counts, item) => {
      counts.set(item.category, (counts.get(item.category) ?? 0) + 1)
      return counts
    }, new Map()),
    ([label, value]) => ({ label, value }),
  ).sort((a, b) => b.value - a.value)
  const statusData = [
    { label: 'Disponíveis', value: available, color: 'var(--color-accent)' },
    { label: 'Retirados', value: retrieved, color: 'var(--color-success)' },
    { label: 'Pendentes', value: pending, color: 'var(--color-primary)' },
  ]
  const exportCSV = () => {
    const BOM = '﻿'
    const header = ['Item', 'Categoria', 'Local', 'Data', 'Status']
    const rows = filtered.map((i) => [
      i.name,
      i.category,
      i.locationPublic,
      formatDate(i.date, { day: '2-digit', month: '2-digit', year: 'numeric' }),
      i.status === 'disponivel' ? 'Disponível' : i.status === 'retirado' ? 'Retirado' : 'Pendente',
    ])
    const csv =
      BOM +
      [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\r\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'localiza-ae-relatorio.csv'
    a.click()
    URL.revokeObjectURL(url)
  }
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
    <AdminShell active="admin-relatorios" onNavigate={onNavigate} onLogout={onLogout}>
      <div
        style={{
          marginBottom: 22,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1
            style={{
              fontWeight: 600,
              fontSize: 18,
              color: 'var(--color-text)',
              letterSpacing: '-0.02em',
              marginBottom: 2,
            }}
          >
            Relatórios
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
            Análise de itens por período, categoria e status.
          </p>
        </div>
        {/* Export buttons — hidden on print */}
        <div className="no-print" style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={exportCSV}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              borderRadius: 6,
              fontSize: 13,
              color: 'var(--color-text)',
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'background 0.12s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-surface)')}
          >
            <Download size={13} strokeWidth={2} /> Exportar CSV
          </button>
          <button
            onClick={() => window.print()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              borderRadius: 6,
              fontSize: 13,
              color: 'var(--color-text)',
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'background 0.12s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-surface)')}
          >
            <Printer size={13} strokeWidth={2} /> Imprimir / PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div
        className="no-print"
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
              htmlFor="rel-from"
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
              id="rel-from"
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
              htmlFor="rel-to"
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
              id="rel-to"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = 'var(--color-primary)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
            />
          </div>
          <button
            onClick={setFullPeriod}
            style={{
              padding: '6px 12px',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              borderRadius: 6,
              fontSize: 12,
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              transition: 'background 0.1s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-surface)')}
          >
            Todo o período
          </button>
          <div>
            <label
              htmlFor="rel-status"
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 500,
                color: 'var(--color-text)',
                marginBottom: 4,
              }}
            >
              Status
            </label>
            <select
              id="rel-status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              <option value="all">Todos</option>
              <option value="disponivel">Disponível</option>
              <option value="retirado">Retirado</option>
              <option value="pendente">Pendente</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="rel-cat"
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 500,
                color: 'var(--color-text)',
                marginBottom: 4,
              }}
            >
              Categoria
            </label>
            <select
              id="rel-cat"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              <option value="all">Todas</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 10,
          marginBottom: 18,
        }}
      >
        <KPI label="Total" value={total} Icon={Package} />
        <KPI label="Disponíveis" value={available} Icon={Clock} accent="var(--color-amber)" />
        <KPI label="Retirados" value={retrieved} Icon={CheckCircle} accent="var(--color-success)" />
        <KPI label="Pendentes" value={pending} Icon={BarChart2} />
        <KPI label="Taxa de devolução" value={`${rate}%`} Icon={TrendingUp} accent="var(--color-primary)" />
      </div>

      {/* Charts */}
      <div style={{ marginBottom: 18 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'end',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: 10,
          }}
        >
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text)' }}>Visão analítica</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
              Distribuição dos registros que correspondem aos filtros.
            </div>
          </div>
        </div>
        <div className="report-charts-grid">
          <CategoryChart data={categoryData} total={total} />
          <StatusChart data={statusData} total={total} rate={rate} />
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
          <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text)' }}>Itens no período</span>
          <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
            {filtered.length} {filtered.length === 1 ? 'registro' : 'registros'}
          </span>
        </div>
        <div className="table-scroll">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-bg)' }}>
                {['Item', 'Categoria', 'Local', 'Data', 'Status'].map((h) => (
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
              {filtered.map((item, i) => (
                <tr
                  key={item.id}
                  style={{
                    borderBottom: i < filtered.length - 1 ? '1px solid var(--color-border)' : 'none',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td
                    style={{
                      padding: '10px 14px',
                      fontWeight: 500,
                      fontSize: 13,
                      color: 'var(--color-text)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.name}
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: 'var(--color-text-muted)' }}>
                    {item.category}
                  </td>
                  <td
                    style={{
                      padding: '10px 14px',
                      fontSize: 13,
                      color: 'var(--color-text-muted)',
                      maxWidth: 180,
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
                      padding: '10px 14px',
                      fontSize: 13,
                      color: 'var(--color-text-muted)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {formatDate(item.date)}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <StatusBadge status={item.status} size="sm" />
                  </td>
                </tr>
              ))}
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
              Nenhum item para o período e filtros selecionados.
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  )
}
function ChartCard({ title, subtitle, children }) {
  return (
    <div
      className="card-hover-sm"
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 8,
        padding: '18px 18px 16px',
        boxShadow: '0 1px 3px var(--color-card-shadow)',
        minWidth: 0,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text)' }}>{title}</div>
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 3 }}>{subtitle}</div>
        </div>
        <span
          style={{
            width: 28,
            height: 28,
            borderRadius: 7,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--color-primary-light)',
            color: 'var(--color-primary)',
            flexShrink: 0,
          }}
        >
          <BarChart2 size={14} strokeWidth={1.75} />
        </span>
      </div>
      {children}
    </div>
  )
}
function CategoryChart({ data, total }) {
  const max = Math.max(...data.map((item) => item.value), 1)
  return (
    <ChartCard title="Itens por categoria" subtitle="Comparativo de volume entre categorias">
      {data.length > 0 ? (
        <div style={{ display: 'grid', gap: 14 }}>
          {data.map((item, index) => {
            const percentage = Math.round((item.value / total) * 100)
            return (
              <div key={item.label}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    marginBottom: 6,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                    <span
                      style={{ width: 20, color: 'var(--color-text-subtle)', fontSize: 10, fontWeight: 600 }}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span
                      title={item.label}
                      style={{
                        color: 'var(--color-text)',
                        fontSize: 12,
                        fontWeight: 500,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.label}
                    </span>
                  </div>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: 11, whiteSpace: 'nowrap' }}>
                    <strong style={{ color: 'var(--color-text)', fontSize: 12 }}>{item.value}</strong> ·{' '}
                    {percentage}%
                  </span>
                </div>
                <div
                  role="progressbar"
                  aria-label={`${item.label}: ${item.value} itens`}
                  aria-valuemin={0}
                  aria-valuemax={max}
                  aria-valuenow={item.value}
                  style={{
                    height: 7,
                    marginLeft: 28,
                    borderRadius: 9999,
                    background: 'var(--color-primary-light)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${Math.max((item.value / max) * 100, 4)}%`,
                      height: '100%',
                      borderRadius: 9999,
                      background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
                      transition: 'width 0.25s ease',
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <ChartEmptyState />
      )}
    </ChartCard>
  )
}
function StatusChart({ data, total, rate }) {
  const circumference = 2 * Math.PI * 42
  let offset = 0
  return (
    <ChartCard title="Distribuição por status" subtitle="Participação no total filtrado">
      {total > 0 ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2px 0 18px' }}>
            <div style={{ width: 154, height: 154, position: 'relative' }}>
              <svg
                viewBox="0 0 100 100"
                role="img"
                aria-label={`Distribuição de ${total} itens por status`}
                style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}
              >
                <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-bg)" strokeWidth="10" />
                {data.map((item) => {
                  const length = (item.value / total) * circumference
                  const currentOffset = offset
                  offset += length
                  return (
                    <circle
                      key={item.label}
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke={item.color}
                      strokeWidth="10"
                      strokeLinecap="butt"
                      strokeDasharray={`${length} ${circumference - length}`}
                      strokeDashoffset={-currentOffset}
                    />
                  )
                })}
              </svg>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                }}
              >
                <span
                  style={{
                    fontSize: 26,
                    lineHeight: 1,
                    fontWeight: 600,
                    letterSpacing: '-0.04em',
                    color: 'var(--color-text)',
                  }}
                >
                  {total}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    marginTop: 5,
                    color: 'var(--color-text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.07em',
                  }}
                >
                  itens
                </span>
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gap: 9 }}>
            {data.map((item) => (
              <div
                key={item.label}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}
              >
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    color: 'var(--color-text-muted)',
                    fontSize: 12,
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 9999,
                      background: item.color,
                      boxShadow: `0 0 0 3px color-mix(in srgb, ${item.color} 14%, transparent)`,
                    }}
                  />
                  {item.label}
                </span>
                <span style={{ color: 'var(--color-text)', fontSize: 12, fontWeight: 600 }}>
                  {item.value}{' '}
                  <span style={{ color: 'var(--color-text-subtle)', fontWeight: 400 }}>
                    ({Math.round((item.value / total) * 100)}%)
                  </span>
                </span>
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: 16,
              paddingTop: 13,
              borderTop: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Taxa de devolução</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-success)' }}>{rate}%</span>
          </div>
        </>
      ) : (
        <ChartEmptyState />
      )}
    </ChartCard>
  )
}
function ChartEmptyState() {
  return (
    <div
      style={{
        minHeight: 180,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        color: 'var(--color-text-muted)',
      }}
    >
      <span
        style={{
          width: 38,
          height: 38,
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-bg)',
          color: 'var(--color-text-subtle)',
          marginBottom: 9,
        }}
      >
        <BarChart2 size={17} strokeWidth={1.6} />
      </span>
      <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text)' }}>Sem dados para exibir</span>
      <span style={{ fontSize: 11, marginTop: 3 }}>Ajuste o período ou os filtros.</span>
    </div>
  )
}
function KPI({ label, value, Icon, accent }) {
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 7,
        padding: '12px 14px',
      }}
    >
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}
      >
        <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-muted)' }}>{label}</span>
        <span style={{ color: accent ?? 'var(--color-text-subtle)' }}>
          <Icon size={14} strokeWidth={1.75} />
        </span>
      </div>
      <div
        style={{
          fontWeight: 600,
          fontSize: 20,
          color: accent ?? 'var(--color-text)',
          letterSpacing: '-0.02em',
          lineHeight: 1,
        }}
      >
        {value}
      </div>
    </div>
  )
}
