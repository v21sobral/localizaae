import { useEffect } from 'react'
import { AlertCircle } from './Icons'
/**
 * Modal de confirmação exibido quando o usuário tenta sair de uma tela de
 * formulário do admin com alterações não salvas. Oferece até três ações:
 * salvar e continuar, descartar e continuar, ou cancelar (permanecer na tela).
 *
 * `onSaveAndContinue` é opcional: em fluxos onde não há um "salvar" parcial
 * (ex.: Retirada em múltiplas etapas) o botão de salvar não é exibido.
 */
export default function UnsavedChangesModal({
  open,
  message = 'Você tem alterações não salvas nesta tela. O que deseja fazer antes de sair?',
  onSaveAndContinue,
  onDiscard,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onCancel])
  if (!open) return null
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="unsaved-title"
      onClick={onCancel}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(15,23,42,0.55)',
        backdropFilter: 'blur(2px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 460,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 14,
          boxShadow: '0 24px 60px -12px rgba(0,0,0,0.4)',
          overflow: 'hidden',
        }}
      >
        {/* Cabeçalho */}
        <div style={{ padding: '26px 26px 20px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <div
            style={{
              flexShrink: 0,
              width: 46,
              height: 46,
              borderRadius: '50%',
              background: 'var(--color-warning-bg)',
              border: '1px solid var(--color-warning-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-warning-text)',
            }}
          >
            <AlertCircle size={24} strokeWidth={2} />
          </div>
          <div style={{ flex: 1, paddingTop: 2 }}>
            <h2
              id="unsaved-title"
              style={{
                fontWeight: 700,
                fontSize: 19,
                color: 'var(--color-text)',
                marginBottom: 8,
                letterSpacing: '-0.01em',
                lineHeight: 1.25,
              }}
            >
              Alterações não salvas
            </h2>
            <p style={{ fontSize: 15, color: 'var(--color-text)', opacity: 0.85, lineHeight: 1.6 }}>
              {message}
            </p>
          </div>
        </div>

        {/* Ações — empilhadas, cada uma com descrição do que faz */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            padding: '18px 26px 24px',
            borderTop: '1px solid var(--color-border)',
            background: 'var(--color-bg)',
          }}
        >
          {onSaveAndContinue && (
            <ActionButton
              variant="primary"
              label="Salvar e continuar"
              description="Salva as alterações e vai para a tela escolhida."
              onClick={onSaveAndContinue}
            />
          )}
          <ActionButton
            variant="danger"
            label="Descartar e sair"
            description="Sai sem salvar. As alterações serão perdidas."
            onClick={onDiscard}
          />
          <ActionButton
            variant="neutral"
            label="Cancelar"
            description="Permanece nesta tela e continua a edição."
            onClick={onCancel}
          />
        </div>
      </div>
    </div>
  )
}
function ActionButton({ variant, label, description, onClick }) {
  const base = {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    cursor: 'pointer',
    borderRadius: 10,
    padding: '12px 16px',
    transition: 'background 0.12s, border-color 0.12s',
  }
  const styles = {
    primary: {
      style: { ...base, border: '1px solid var(--color-primary)', background: 'var(--color-primary)' },
      base: 'var(--color-primary)',
      hover: 'var(--color-primary-dark)',
      labelColor: 'var(--color-on-primary)',
      descColor: 'var(--color-on-primary)',
    },
    danger: {
      style: {
        ...base,
        border: '1px solid var(--color-danger-border, var(--color-border))',
        background: 'var(--color-surface)',
      },
      base: 'var(--color-surface)',
      hover: 'var(--color-bg)',
      labelColor: 'var(--color-danger-text)',
      descColor: 'var(--color-text-muted)',
    },
    neutral: {
      style: { ...base, border: '1px solid var(--color-border)', background: 'var(--color-surface)' },
      base: 'var(--color-surface)',
      hover: 'var(--color-bg)',
      labelColor: 'var(--color-text)',
      descColor: 'var(--color-text-muted)',
    },
  }
  const s = styles[variant]
  return (
    <button
      type="button"
      onClick={onClick}
      style={s.style}
      onMouseEnter={(e) => (e.currentTarget.style.background = s.hover)}
      onMouseLeave={(e) => (e.currentTarget.style.background = s.base)}
    >
      <span style={{ display: 'block', fontSize: 15, fontWeight: 600, color: s.labelColor, marginBottom: 2 }}>
        {label}
      </span>
      <span
        style={{
          display: 'block',
          fontSize: 13,
          color: s.descColor,
          opacity: variant === 'primary' ? 0.85 : 1,
          lineHeight: 1.4,
        }}
      >
        {description}
      </span>
    </button>
  )
}
