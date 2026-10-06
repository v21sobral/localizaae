import { useState } from 'react'
import StatusBadge from '../components/StatusBadge'
import { Search, MapPin, Calendar, Package, ChevronRight, Filter } from '../components/Icons'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'
import headerBg from '../assets/header-bg.jpg'
import { formatDate } from '../utils/date'
export default function MuralScreen({ items, categories, onItemClick, onAdminClick }) {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterLocation, setFilterLocation] = useState('all')
  const locations = Array.from(new Set(items.map((i) => i.locationPublic)))
  const filtered = items.filter((item) => {
    const q = search.toLowerCase()
    return (
      (!q ||
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.locationPublic.toLowerCase().includes(q)) &&
      (filterStatus === 'all' || item.status === filterStatus) &&
      (filterCategory === 'all' || item.category === filterCategory) &&
      (filterLocation === 'all' || item.locationPublic === filterLocation)
    )
  })
  const counts = {
    total: items.length,
    disponivel: items.filter((i) => i.status === 'disponivel').length,
    retirado: items.filter((i) => i.status === 'retirado').length,
  }
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      {/* Header */}
      <header
        style={{
          background: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
          position: 'sticky',
          top: 0,
          zIndex: 30,
          overflow: 'hidden',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            width: '52%',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          <img
            src={headerBg}
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'right center',
              opacity: 0.9,
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to right, var(--color-surface) 0%, transparent 60%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, var(--color-surface) 0%, transparent 30%)',
            }}
          />
        </div>
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            maxWidth: 1160,
            margin: '0 auto',
            padding: '0 24px',
            height: 132,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Logo variant="light" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ThemeToggle />
            <button
              onClick={onAdminClick}
              className="btn-primary"
              style={{
                background: 'var(--color-accent)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 9999,
                padding: '7px 18px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: 'inset 0 -3px 0 rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.18)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-accent-dark)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--color-accent)'
              }}
            >
              Área Admin
            </button>
          </div>
        </div>
      </header>

      {/* Page header */}
      <div style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '20px 24px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <div>
              <h1
                style={{
                  fontWeight: 600,
                  fontSize: 20,
                  color: 'var(--color-text)',
                  marginBottom: 4,
                  letterSpacing: '-0.02em',
                }}
              >
                Mural de Itens Encontrados
              </h1>
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                Consulte os itens disponíveis. A retirada é feita presencialmente com documento de
                identificação.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 16, flexShrink: 0 }}>
              <Stat label="Total de itens" value={counts.total} />
              <div style={{ width: 1, background: 'var(--color-border)' }} />
              <Stat label="Disponíveis" value={counts.disponivel} accent />
              <div style={{ width: 1, background: 'var(--color-border)' }} />
              <Stat label="Retirados" value={counts.retirado} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="mural-filters" style={{ maxWidth: 1160, margin: '0 auto', padding: '12px 24px' }}>
          <div style={{ position: 'relative', flex: '1 1 auto', minWidth: 0, width: '100%' }}>
            <span
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-subtle)',
                display: 'flex',
                pointerEvents: 'none',
              }}
            >
              <Search size={14} strokeWidth={1.75} />
            </span>
            <input
              id="mural-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, categoria ou local…"
              aria-label="Buscar itens"
              style={{
                width: '100%',
                paddingLeft: 34,
                paddingRight: 14,
                paddingTop: 8,
                paddingBottom: 8,
                border: '1px solid var(--color-border)',
                borderRadius: 9999,
                fontSize: 13,
                outline: 'none',
                boxSizing: 'border-box',
                color: 'var(--color-text)',
                background: 'var(--color-surface)',
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--color-primary)'
                e.target.style.boxShadow = '0 0 0 3px var(--color-ring)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--color-border)'
                e.target.style.boxShadow = 'none'
              }}
            />
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: 'var(--color-text-subtle)',
              flexShrink: 0,
            }}
          >
            <Filter size={13} strokeWidth={1.75} />
            <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Filtros:</span>
          </div>
          <FilterSelect
            value={filterStatus}
            onChange={setFilterStatus}
            options={[
              ['all', 'Todos os status'],
              ['disponivel', 'Disponível'],
              ['retirado', 'Retirado'],
              ['pendente', 'Pendente'],
            ]}
          />
          <FilterSelect
            value={filterCategory}
            onChange={setFilterCategory}
            options={[['all', 'Categoria'], ...categories.map((c) => [c, c])]}
          />
          <FilterSelect
            value={filterLocation}
            onChange={setFilterLocation}
            options={[['all', 'Local'], ...locations.map((l) => [l, l])]}
          />
          {(filterStatus !== 'all' || filterCategory !== 'all' || filterLocation !== 'all' || search) && (
            <button
              onClick={() => {
                setSearch('')
                setFilterStatus('all')
                setFilterCategory('all')
                setFilterLocation('all')
              }}
              style={{
                fontSize: 12,
                color: 'var(--color-text-muted)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0 4px',
                textDecoration: 'underline',
              }}
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <main style={{ maxWidth: 1160, margin: '0 auto', padding: '24px 24px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 20px' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 8,
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                color: 'var(--color-text-subtle)',
              }}
            >
              <Package size={22} strokeWidth={1.5} />
            </div>
            <p style={{ fontWeight: 500, fontSize: 15, color: 'var(--color-text)', marginBottom: 4 }}>
              Nenhum item encontrado
            </p>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
              Tente ajustar os filtros de busca.
            </p>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 14 }}>
              {filtered.length} {filtered.length === 1 ? 'item encontrado' : 'itens encontrados'}
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 12,
              }}
            >
              {filtered.map((item) => (
                <ItemCard key={item.id} item={item} onClick={() => onItemClick(item.id)} />
              ))}
            </div>
          </>
        )}
      </main>

      <footer
        style={{
          borderTop: '1px solid var(--color-border)',
          padding: '16px 24px',
          textAlign: 'center',
          color: 'var(--color-text-subtle)',
          fontSize: 12,
          background: 'var(--color-surface)',
        }}
      >
        Localiza Aê — Plataforma de Achados e Perdidos &copy; {new Date().getFullYear()}
      </footer>
    </div>
  )
}
function Stat({ label, value, accent }) {
  return (
    <div style={{ textAlign: 'right' }}>
      <div
        style={{
          fontWeight: 600,
          fontSize: 20,
          color: accent ? 'var(--color-accent)' : 'var(--color-text)',
          letterSpacing: '-0.02em',
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>{label}</div>
    </div>
  )
}
function FilterSelect({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        padding: '7px 28px 7px 12px',
        border: '1px solid var(--color-border)',
        borderRadius: 9999,
        fontSize: 13,
        color: 'var(--color-text)',
        background: 'var(--color-surface)',
        cursor: 'pointer',
        outline: 'none',
        appearance: 'auto',
        transition: 'border-color 0.15s',
      }}
      onFocus={(e) => (e.target.style.borderColor = 'var(--color-primary)')}
      onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
    >
      {options.map(([val, lbl]) => (
        <option key={val} value={val}>
          {lbl}
        </option>
      ))}
    </select>
  )
}
function ItemCard({ item, onClick }) {
  const formattedDate = formatDate(item.date, { day: '2-digit', month: 'short', year: 'numeric' })
  const [hovered, setHovered] = useState(false)
  const borderColor =
    {
      disponivel: 'var(--color-accent)',
      retirado: 'var(--color-success)',
      pendente: 'var(--color-primary)',
    }[item.status] ?? 'var(--color-secondary)'
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="card-hover"
      aria-label={`Ver detalhes de ${item.name}`}
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderLeft: `3px solid ${borderColor}`,
        borderRadius: 8,
        overflow: 'hidden',
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 1px 3px var(--color-card-shadow)',
      }}
    >
      {/* Image / placeholder */}
      <div
        style={{
          height: 185,
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
          background: 'var(--color-placeholder-bg)',
        }}
      >
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.38s ease',
              transform: hovered ? 'scale(1.07)' : 'scale(1)',
            }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-placeholder-icon)',
            }}
          >
            <Package size={44} strokeWidth={0.85} />
          </div>
        )}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 72,
            background: 'linear-gradient(to top, rgba(0,0,0,0.34) 0%, transparent 100%)',
            pointerEvents: 'none',
          }}
        />
        {/* Category chip — solid background (no backdrop-filter) */}
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            background: 'rgba(8,12,22,0.72)',
            borderRadius: 9999,
            padding: '3px 9px',
            fontSize: 10.5,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.95)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            border: '1px solid rgba(255,255,255,0.12)',
            lineHeight: 1.6,
          }}
        >
          {item.category}
        </div>
        <div style={{ position: 'absolute', top: 10, right: 10 }}>
          <StatusBadge status={item.status} size="sm" date={item.date} />
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '14px 16px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            fontWeight: 600,
            fontSize: 14.5,
            color: 'var(--color-text)',
            lineHeight: 1.3,
            letterSpacing: '-0.015em',
            marginBottom: 8,
          }}
        >
          {item.name}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: 'var(--color-text-muted)',
              fontSize: 12,
            }}
          >
            <span style={{ flexShrink: 0, color: 'var(--color-text-subtle)', display: 'flex' }}>
              <MapPin size={12} strokeWidth={1.75} />
            </span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.locationPublic}
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: 'var(--color-text-muted)',
              fontSize: 12,
            }}
          >
            <span style={{ flexShrink: 0, color: 'var(--color-text-subtle)', display: 'flex' }}>
              <Calendar size={12} strokeWidth={1.75} />
            </span>
            <span>{formattedDate}</span>
          </div>
        </div>
        <div
          style={{
            marginTop: 'auto',
            paddingTop: 12,
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 500 }}>
            Ver detalhes
          </span>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              flexShrink: 0,
              background: hovered ? 'var(--color-primary)' : 'var(--color-bg)',
              border: `1px solid ${hovered ? 'var(--color-primary)' : 'var(--color-border)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: hovered ? 'var(--color-on-primary)' : 'var(--color-text-muted)',
              transition: 'all 0.2s ease',
            }}
          >
            <ChevronRight size={13} strokeWidth={2.5} />
          </div>
        </div>
      </div>
    </button>
  )
}
