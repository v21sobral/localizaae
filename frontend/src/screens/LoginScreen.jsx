import { useState } from 'react'
import { User, Lock, AlertCircle } from '../components/Icons'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'
import { api, setToken, ApiError } from '../services/api'
export default function LoginScreen({ onLogin, onBack }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [forgotMsg, setForgotMsg] = useState(false)
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setForgotMsg(false)
    setError('')
    try {
      const { token, user } = await api.login(username.trim(), password)
      setToken(token)
      onLogin(user)
    } catch (err) {
      setError(
        err instanceof ApiError && err.status !== 401 ? err.message : 'Usuário ou senha incorretos.',
      )
      setLoading(false)
    }
  }
  const inputBase = {
    width: '100%',
    padding: '9px 12px 9px 38px',
    border: '1px solid var(--color-border)',
    borderRadius: 10,
    fontSize: 14,
    outline: 'none',
    background: 'var(--color-surface)',
    color: 'var(--color-text)',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    boxSizing: 'border-box',
  }
  return (
    <div
      style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', flexDirection: 'column' }}
    >
      {/* Top bar */}
      <div
        style={{
          height: 52,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-surface)',
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
            padding: 0,
            transition: 'color 0.12s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          Voltar ao Mural
        </button>
        <ThemeToggle />
      </div>

      {/* Main */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 16px',
        }}
      >
        <div style={{ width: '100%', maxWidth: 380 }}>
          {/* Logo */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
            <Logo variant="hero" />
          </div>

          {/* Card */}
          <div
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 20,
              padding: '32px 32px 28px',
              boxShadow: '0 4px 24px var(--color-card-shadow)',
            }}
          >
            <h1
              style={{
                fontWeight: 600,
                fontSize: 18,
                color: 'var(--color-text)',
                marginBottom: 4,
                letterSpacing: '-0.01em',
              }}
            >
              Acesso restrito
            </h1>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 20 }}>
              Entre com as credenciais de administrador.
            </p>

            {error && (
              <div
                role="alert"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'var(--color-danger-bg)',
                  border: '1px solid var(--color-danger-border)',
                  borderRadius: 10,
                  padding: '10px 14px',
                  marginBottom: 16,
                  color: 'var(--color-danger-text)',
                  fontSize: 13,
                }}
              >
                <AlertCircle size={14} strokeWidth={2} />
                {error}
              </div>
            )}

            {forgotMsg && (
              <div
                role="alert"
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 10,
                  padding: '10px 14px',
                  marginBottom: 16,
                  fontSize: 13,
                  color: 'var(--color-text-muted)',
                }}
              >
                Entre em contato com o administrador da sua instituição.
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label
                  htmlFor="login-user"
                  style={{
                    display: 'block',
                    fontSize: 13,
                    fontWeight: 500,
                    color: 'var(--color-text)',
                    marginBottom: 5,
                  }}
                >
                  Usuário
                </label>
                <div style={{ position: 'relative' }}>
                  <span
                    style={{
                      position: 'absolute',
                      left: 10,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--color-text-subtle)',
                      display: 'flex',
                    }}
                  >
                    <User size={14} strokeWidth={1.75} />
                  </span>
                  <input
                    id="login-user"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value)
                      setError('')
                    }}
                    placeholder="admin"
                    autoComplete="username"
                    aria-invalid={!!error || undefined}
                    style={{
                      ...inputBase,
                      borderColor: error ? 'var(--color-invalid)' : 'var(--color-border)',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--color-primary)'
                      e.target.style.boxShadow = '0 0 0 3px var(--color-ring)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = error ? 'var(--color-invalid)' : 'var(--color-border)'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="login-pass"
                  style={{
                    display: 'block',
                    fontSize: 13,
                    fontWeight: 500,
                    color: 'var(--color-text)',
                    marginBottom: 5,
                  }}
                >
                  Senha
                </label>
                <div style={{ position: 'relative' }}>
                  <span
                    style={{
                      position: 'absolute',
                      left: 10,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--color-text-subtle)',
                      display: 'flex',
                    }}
                  >
                    <Lock size={14} strokeWidth={1.75} />
                  </span>
                  <input
                    id="login-pass"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setError('')
                    }}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    aria-invalid={!!error || undefined}
                    style={{
                      ...inputBase,
                      borderColor: error ? 'var(--color-invalid)' : 'var(--color-border)',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--color-primary)'
                      e.target.style.boxShadow = '0 0 0 3px var(--color-ring)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = error ? 'var(--color-invalid)' : 'var(--color-border)'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -6 }}>
                <button
                  type="button"
                  onClick={() => {
                    setForgotMsg(true)
                    setError('')
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-primary)',
                    fontSize: 12,
                    cursor: 'pointer',
                    padding: 0,
                    fontWeight: 500,
                  }}
                >
                  Esqueci minha senha
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={loading ? '' : 'btn-primary'}
                style={{
                  background: loading ? 'var(--color-primary-disabled)' : 'var(--color-primary)',
                  color: 'var(--color-on-primary)',
                  border: 'none',
                  borderRadius: 9999,
                  padding: '10px 16px',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginTop: 4,
                  width: '100%',
                }}
                onMouseEnter={(e) => {
                  if (!loading) e.currentTarget.style.background = 'var(--color-primary-dark)'
                }}
                onMouseLeave={(e) => {
                  if (!loading) e.currentTarget.style.background = 'var(--color-primary)'
                }}
              >
                {loading ? 'Entrando…' : 'Entrar'}
              </button>
            </form>
          </div>

          {/* Demo hint — only in development */}
          {import.meta.env.DEV && (
            <div
              style={{
                marginTop: 14,
                padding: '11px 16px',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 12,
                fontSize: 12,
                color: 'var(--color-text-muted)',
              }}
            >
              Demo — usuário:{' '}
              <code
                style={{
                  fontFamily: 'monospace',
                  background: 'var(--color-bg)',
                  padding: '1px 4px',
                  borderRadius: 3,
                }}
              >
                admin
              </code>{' '}
              / senha:{' '}
              <code
                style={{
                  fontFamily: 'monospace',
                  background: 'var(--color-bg)',
                  padding: '1px 4px',
                  borderRadius: 3,
                }}
              >
                admin123
              </code>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
