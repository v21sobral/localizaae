const STORAGE_KEY = 'localiza-theme'
const listeners = new Set()
function readInitial() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    /* localStorage may be unavailable */
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}
let current = readInitial()
function apply(theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}
// Apply before first paint (module runs during import in main.tsx).
apply(current)
export function getTheme() {
  return current
}
export function setTheme(theme) {
  if (theme === current) return
  current = theme
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    /* ignore */
  }
  apply(theme)
  listeners.forEach((l) => l())
}
export function toggleTheme() {
  setTheme(current === 'dark' ? 'light' : 'dark')
}
export function subscribe(listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
