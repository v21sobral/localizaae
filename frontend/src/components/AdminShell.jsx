import { useState, useEffect } from 'react'
import { LayoutDashboard, CheckCircle, BarChart2, Tag, FileText, LogOut } from './Icons'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'
import headerBg from '../assets/header-bg.jpg'
const navItems = [
  { screen: 'admin-dashboard', label: 'Painel', Icon: LayoutDashboard },
  { screen: 'admin-retirada', label: 'Retiradas', Icon: CheckCircle },
  { screen: 'admin-relatorios', label: 'Relatórios', Icon: BarChart2 },
  { screen: 'admin-categorias', label: 'Categorias', Icon: Tag },
  { screen: 'admin-auditoria', label: 'Auditoria', Icon: FileText },
]
const HEADER_H = 132
const SIDEBAR_W = 220
const BOTTOM_NAV_H = 60
export default function AdminShell({ children, active, onNavigate, onLogout }) {
  const [isSmall, setIsSmall] = useState(() => window.innerWidth <= 640)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    const handler = (e) => setIsSmall(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  const handleLogoutRequest = () => setShowLogoutModal(true)
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      {/* ── Logout confirmation modal ── */}
      {showLogoutModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-modal-title"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(3px)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowLogoutModal(false)
          }}
        >
          <div
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 16,
              padding: '32px 28px 24px',
              width: 340,
              boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0,
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: 'color-mix(in srgb, #E68C28 12%, transparent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <LogOut size={22} strokeWidth={1.75} style={{ color: '#E68C28' }} />
            </div>

            <h2
              id="logout-modal-title"
              style={{
                margin: 0,
                fontSize: 17,
                fontWeight: 700,
                color: 'var(--color-text)',
                textAlign: 'center',
                marginBottom: 8,
              }}
            >
              Sair do sistema?
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: 13.5,
                color: 'var(--color-text-muted)',
                textAlign: 'center',
                lineHeight: 1.55,
                marginBottom: 24,
              }}
            >
              Você será desconectado da área administrativa. Alterações não salvas serão perdidas.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
              <button
                onClick={() => {
                  setShowLogoutModal(false)
                  onLogout()
                }}
                style={{
                  width: '100%',
                  padding: '10px 0',
                  borderRadius: 9,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 600,
                  background: '#155289',
                  color: '#fff',
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.88')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                Sim, sair
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                style={{
                  width: '100%',
                  padding: '10px 0',
                  borderRadius: 9,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 500,
                  background: 'transparent',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-muted)',
                  transition: 'background 0.15s, color 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--color-bg)'
                  e.currentTarget.style.color = 'var(--color-text)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--color-text-muted)'
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Full-width header ── */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: HEADER_H,
          zIndex: 50,
          background: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
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
            width: '65%',
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
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
          }}
        >
          <Logo variant="light" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ThemeToggle />
            {/* Logout só no header em mobile (sidebar não aparece) */}
            <button
              onClick={handleLogoutRequest}
              className="flex lg:hidden items-center gap-1"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-muted)',
                fontSize: 12,
                padding: '4px 8px',
                borderRadius: 7,
              }}
            >
              <LogOut size={15} strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Sidebar — desktop only (CSS lg:flex) ── */}
      <aside
        className="hidden lg:flex flex-col"
        style={{
          position: 'fixed',
          top: HEADER_H,
          left: 0,
          width: SIDEBAR_W,
          height: `calc(100vh - ${HEADER_H}px)`,
          background: 'var(--color-sidebar)',
          borderRight: '1px solid var(--color-border)',
          zIndex: 40,
        }}
      >
        <SidebarNav active={active} onNavigate={onNavigate} onLogout={handleLogoutRequest} />
      </aside>

      {/* ── Content area ── */}
      <div
        className="lg:ml-[220px]"
        style={{
          marginTop: HEADER_H,
          minHeight: `calc(100vh - ${HEADER_H}px)`,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <main
          style={{
            flex: 1,
            padding: isSmall ? `16px 16px ${BOTTOM_NAV_H + 16}px` : '28px 24px',
            maxWidth: 1200,
            width: '100%',
            margin: '0 auto',
          }}
        >
          {children}
        </main>
      </div>

      {/* ── Bottom navigation — mobile only (CSS lg:hidden) ── */}
      <nav
        className="flex lg:hidden"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: BOTTOM_NAV_H,
          zIndex: 50,
          background: 'var(--color-surface)',
          borderTop: '1px solid var(--color-border)',
          alignItems: 'stretch',
        }}
      >
        {navItems.map(({ screen, label, Icon }) => {
          const isActive = active === screen || (screen === 'admin-dashboard' && active === 'admin-item-form')
          return (
            <button
              key={screen}
              onClick={() => onNavigate(screen)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: isActive ? 'var(--c-sidebar-active-text)' : 'var(--c-sidebar-text-muted)',
                borderTop: isActive ? '2px solid var(--c-sidebar-active-text)' : '2px solid transparent',
                fontSize: 10,
                fontWeight: isActive ? 600 : 400,
                transition: 'color 0.15s',
                paddingTop: 2,
              }}
            >
              <Icon size={18} strokeWidth={isActive ? 2 : 1.75} />
              {label}
            </button>
          )
        })}
        <button
          onClick={handleLogoutRequest}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3,
            border: 'none',
            borderTop: '2px solid transparent',
            background: 'transparent',
            cursor: 'pointer',
            color: 'var(--c-sidebar-text-muted)',
            fontSize: 10,
            fontWeight: 400,
            transition: 'color 0.15s',
            paddingTop: 2,
          }}
        >
          <LogOut size={18} strokeWidth={1.75} />
          Sair
        </button>
      </nav>
    </div>
  )
}
function SidebarNav({ active, onNavigate, onLogout }) {
  return (
    <>
      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto', position: 'relative' }}>
        <div style={{ marginBottom: 4 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--c-sidebar-text-muted)',
              padding: '6px 8px',
              display: 'block',
            }}
          >
            Principal
          </span>
        </div>
        {navItems.map(({ screen, label, Icon }) => {
          const isActive = active === screen || (screen === 'admin-dashboard' && active === 'admin-item-form')
          return (
            <button
              key={screen}
              onClick={() => onNavigate(screen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '8px 10px',
                borderRadius: 9,
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                marginBottom: 2,
                position: 'relative',
                background: isActive ? 'var(--c-sidebar-active)' : 'transparent',
                color: isActive ? 'var(--c-sidebar-active-text)' : 'var(--c-sidebar-text)',
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                transition: 'background 0.15s, color 0.15s, transform 0.12s',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  const b = e.currentTarget
                  b.style.background = 'var(--c-sidebar-hover)'
                  b.style.color = 'var(--c-sidebar-hover-text)'
                  b.style.transform = 'translateX(2px)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  const b = e.currentTarget
                  b.style.background = 'transparent'
                  b.style.color = 'var(--c-sidebar-text)'
                  b.style.transform = 'translateX(0)'
                }
              }}
            >
              {isActive && (
                <span
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 3,
                    height: 20,
                    borderRadius: 3,
                    background: 'var(--c-sidebar-active-text)',
                  }}
                />
              )}
              <Icon size={15} strokeWidth={isActive ? 2 : 1.75} />
              {label}
            </button>
          )
        })}
      </nav>

      <div style={{ padding: '10px 10px', borderTop: '1px solid var(--color-border)', flexShrink: 0 }}>
        <div
          style={{
            padding: '6px 8px 10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          <span style={{ fontSize: 11, color: 'var(--c-sidebar-text-muted)' }}>Tema</span>
          <ThemeToggle tone="onDark" />
        </div>
        <div style={{ padding: '6px 8px', marginBottom: 2 }}>
          <div style={{ fontSize: 11, color: 'var(--c-sidebar-text-muted)', marginBottom: 1 }}>Conta</div>
          <div
            style={{
              fontSize: 12,
              color: 'var(--c-sidebar-text)',
              fontWeight: 500,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            admin@localiza.ae
          </div>
        </div>
        <button
          onClick={onLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            width: '100%',
            padding: '7px 10px',
            borderRadius: 9,
            border: 'none',
            cursor: 'pointer',
            background: 'transparent',
            color: 'var(--c-sidebar-text-muted)',
            fontSize: 13,
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            const b = e.currentTarget
            b.style.background = 'var(--c-sidebar-hover)'
            b.style.color = 'var(--c-sidebar-hover-text)'
            b.style.transform = 'translateX(2px)'
          }}
          onMouseLeave={(e) => {
            const b = e.currentTarget
            b.style.background = 'transparent'
            b.style.color = 'var(--c-sidebar-text-muted)'
            b.style.transform = 'translateX(0)'
          }}
        >
          <LogOut size={14} />
          Sair
        </button>
      </div>
    </>
  )
}
