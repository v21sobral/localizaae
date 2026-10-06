import { useSyncExternalStore } from 'react'
import { getTheme, toggleTheme, subscribe } from '../theme'
import { Sun, Moon } from './Icons'
/**
 * Single, borderless icon button that toggles the theme — the pattern used by
 * GitHub, Linear and Vercel. Shows the icon of the mode you'll switch *to*.
 *
 * tone="default" — for light surfaces (public header, login)
 * tone="onDark"  — for the navy admin sidebar / topbar
 */
export default function ThemeToggle({ tone = 'default' }) {
  const theme = useSyncExternalStore(subscribe, getTheme, getTheme)
  const onDark = tone === 'onDark'
  const nextIsDark = theme === 'light'
  const idle = onDark ? 'var(--c-sidebar-text)' : 'var(--color-text-muted)'
  const hover = onDark ? '#fff' : 'var(--color-text)'
  const idleBg = onDark ? 'rgba(255,255,255,0.08)' : 'var(--color-bg)'
  const hoverBg = onDark ? 'rgba(255,255,255,0.15)' : 'var(--color-border)'
  const border = onDark ? '1px solid rgba(255,255,255,0.14)' : '1px solid var(--color-border)'
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={nextIsDark ? 'Ativar modo escuro' : 'Ativar modo claro'}
      title={nextIsDark ? 'Modo escuro' : 'Modo claro'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 32,
        height: 32,
        borderRadius: 7,
        border,
        background: idleBg,
        color: idle,
        cursor: 'pointer',
        transition: 'color 0.12s, background 0.12s, border-color 0.12s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = hover
        e.currentTarget.style.background = hoverBg
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = idle
        e.currentTarget.style.background = idleBg
      }}
    >
      {nextIsDark ? <Moon size={16} strokeWidth={1.75} /> : <Sun size={16} strokeWidth={1.75} />}
    </button>
  )
}
