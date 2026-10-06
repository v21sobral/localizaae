import StatusBadge from '../components/StatusBadge'
import { ArrowLeft, MapPin, Calendar, Package, Tag, Shield } from '../components/Icons'
import { formatDate, daysAvailableFromISO, DEADLINE_DAYS } from '../utils/date'
export default function ItemDetailScreen({ item, onBack, onClaim, today: _today }) {
  const formattedDate = formatDate(item.date, { day: '2-digit', month: 'long', year: 'numeric' })
  const days = daysAvailableFromISO(item.date)
  const daysLeft = Math.max(0, DEADLINE_DAYS - days)
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
        }}
      >
        <div
          style={{
            maxWidth: 960,
            margin: '0 auto',
            padding: '0 24px',
            height: 52,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <button
            onClick={onBack}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: 'var(--color-text-muted)',
              fontSize: 13,
              padding: '4px 8px',
              borderRadius: 7,
              transition: 'color 0.15s, background 0.15s, transform 0.12s',
            }}
            onMouseEnter={(e) => {
              const b = e.currentTarget
              b.style.color = 'var(--color-text)'
              b.style.background = 'var(--color-bg)'
              b.style.transform = 'translateX(-2px)'
            }}
            onMouseLeave={(e) => {
              const b = e.currentTarget
              b.style.color = 'var(--color-text-muted)'
              b.style.background = 'none'
              b.style.transform = 'translateX(0)'
            }}
          >
            <ArrowLeft size={14} strokeWidth={2} />
            Mural
          </button>
          <span style={{ color: 'var(--color-text-subtle)', fontSize: 13 }}>/</span>
          <span style={{ fontSize: 13, color: 'var(--color-text)', fontWeight: 500 }}>{item.name}</span>
        </div>
      </header>

      <main style={{ maxWidth: 960, margin: '0 auto', padding: '28px 24px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 28,
            alignItems: 'start',
          }}
        >
          {/* Image */}
          <div
            style={{
              borderRadius: 8,
              overflow: 'hidden',
              background: 'var(--color-placeholder-bg)',
              aspectRatio: '4/3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--color-border)',
              boxShadow: '0 1px 3px var(--color-card-shadow)',
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
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ color: 'var(--color-placeholder-icon)' }}>
                <Package size={52} strokeWidth={1} />
              </div>
            )}
          </div>

          {/* Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ marginBottom: 8 }}>
                <StatusBadge status={item.status} date={item.date} />
              </div>
              <h1
                style={{
                  fontWeight: 600,
                  fontSize: 22,
                  color: 'var(--color-text)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                  marginBottom: 8,
                }}
              >
                {item.name}
              </h1>
              <p style={{ fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.65 }}>
                {item.description}
              </p>
            </div>

            {/* Metadata */}
            <div
              style={{
                borderTop: '1px solid var(--color-border)',
                paddingTop: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <MetaRow Icon={Tag} label="Categoria" value={item.category} />
              <MetaRow Icon={MapPin} label="Local" value={item.locationPublic} />
              <MetaRow Icon={Calendar} label="Encontrado em" value={formattedDate} />
            </div>

            {/* Simple timeline for disponivel */}
            {item.status === 'disponivel' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 12,
                  color: 'var(--color-text-muted)',
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: 'var(--color-text-subtle)',
                    flexShrink: 0,
                  }}
                />
                <span>Encontrado em {formattedDate}</span>
                <span style={{ color: 'var(--color-border)' }}>·</span>
                <span>
                  Disponível há {days} {days === 1 ? 'dia' : 'dias'}
                </span>
                {days >= 75 && (
                  <>
                    <span style={{ color: 'var(--color-border)' }}>·</span>
                    <span style={{ color: 'var(--color-danger-text)', fontWeight: 500 }}>
                      {daysLeft} {daysLeft === 1 ? 'dia restante' : 'dias restantes'}
                    </span>
                  </>
                )}
              </div>
            )}

            {/* CTA blocks */}
            {item.status === 'disponivel' && (
              <div
                style={{
                  border: '1px solid var(--color-border)',
                  borderRadius: 8,
                  padding: '18px',
                  background: 'var(--color-surface)',
                  boxShadow: '0 1px 3px var(--color-card-shadow)',
                }}
              >
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginBottom: 6 }}>
                  Este item está disponível para retirada
                </p>
                <p
                  style={{
                    fontSize: 13,
                    color: 'var(--color-text-muted)',
                    lineHeight: 1.55,
                    marginBottom: 12,
                  }}
                >
                  Compareça presencialmente ao local com um documento de identificação e descreva o objeto
                  para o responsável.
                </p>
                {onClaim && (
                  <button
                    onClick={onClaim}
                    className="btn-primary"
                    style={{
                      width: '100%',
                      padding: '9px 0',
                      background: 'var(--color-accent)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 9999,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      marginBottom: 10,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-accent-dark)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-accent)')}
                  >
                    Reconhecer este item
                  </button>
                )}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8,
                    padding: '10px 12px',
                    background: 'var(--color-bg)',
                    borderRadius: 7,
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <span
                    style={{
                      color: 'var(--color-text-subtle)',
                      flexShrink: 0,
                      marginTop: 1,
                      display: 'flex',
                    }}
                  >
                    <Shield size={14} strokeWidth={1.75} />
                  </span>
                  <p style={{ fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                    <strong style={{ color: 'var(--color-text)', fontWeight: 500 }}>
                      Privacidade protegida.
                    </strong>{' '}
                    Seus dados pessoais são coletados apenas no momento da retirada presencial — nunca online.
                  </p>
                </div>
              </div>
            )}

            {item.status === 'retirado' && (
              <div
                style={{
                  border: '1px solid var(--color-status-retrieved-border)',
                  borderRadius: 8,
                  padding: '16px 18px',
                  background: 'var(--color-status-retrieved-bg)',
                }}
              >
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--color-status-retrieved-text)',
                    marginBottom: 4,
                  }}
                >
                  Item devolvido ao proprietário
                </p>
                <p style={{ fontSize: 13, color: 'var(--color-status-retrieved-text)', lineHeight: 1.5 }}>
                  Este item já foi retirado. Se acredita que é seu, entre em contato diretamente com a
                  administração.
                </p>
              </div>
            )}

            {item.status === 'pendente' && (
              <div
                style={{
                  border: '1px solid var(--color-status-pending-border)',
                  borderRadius: 8,
                  padding: '16px 18px',
                  background: 'var(--color-status-pending-bg)',
                }}
              >
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--color-status-pending-text)',
                    marginBottom: 4,
                  }}
                >
                  Verificação em andamento
                </p>
                <p style={{ fontSize: 13, color: 'var(--color-status-pending-text)', lineHeight: 1.5 }}>
                  Este item está sendo verificado pela equipe. Consulte novamente em breve.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
function MetaRow({ Icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <span style={{ color: 'var(--color-text-subtle)', display: 'flex', marginTop: 2, flexShrink: 0 }}>
        <Icon size={14} strokeWidth={1.75} />
      </span>
      <div>
        <div
          style={{
            fontSize: 11,
            color: 'var(--color-text-subtle)',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
            marginBottom: 1,
          }}
        >
          {label}
        </div>
        <div style={{ fontSize: 13, color: 'var(--color-text)', fontWeight: 500 }}>{value}</div>
      </div>
    </div>
  )
}
