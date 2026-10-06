import { daysAvailableFromISO, NEAR_DEADLINE_DAYS } from '../utils/date'
const config = {
  disponivel: {
    label: 'Disponível',
    bg: 'var(--color-status-available-bg)',
    text: 'var(--color-status-available-text)',
    border: 'var(--color-status-available-border)',
  },
  retirado: {
    label: 'Retirado',
    bg: 'var(--color-status-retrieved-bg)',
    text: 'var(--color-status-retrieved-text)',
    border: 'var(--color-status-retrieved-border)',
  },
  pendente: {
    label: 'Pendente',
    bg: 'var(--color-status-pending-bg)',
    text: 'var(--color-status-pending-text)',
    border: 'var(--color-status-pending-border)',
  },
}
/** Shared pill primitive — reused by StatusBadge and the audit log's action badges. */
export function Badge({ label, bg, text, border, size = 'md' }) {
  return (
    <span
      style={{
        background: bg,
        color: text,
        border: `1px solid ${border}`,
        borderRadius: 9999,
        padding: size === 'sm' ? '2px 9px' : '3px 11px',
        fontSize: size === 'sm' ? 11 : 12,
        fontWeight: 600,
        letterSpacing: '0.02em',
        display: 'inline-block',
        lineHeight: '18px',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  )
}
export default function StatusBadge({ status, size = 'md', date }) {
  if (status === 'disponivel' && date && daysAvailableFromISO(date) >= NEAR_DEADLINE_DAYS) {
    return (
      <Badge
        label="Próximo do prazo"
        bg="var(--color-danger-bg)"
        text="var(--color-danger-text)"
        border="var(--color-danger-border)"
        size={size}
      />
    )
  }
  const c = config[status]
  return <Badge label={c.label} bg={c.bg} text={c.text} border={c.border} size={size} />
}
