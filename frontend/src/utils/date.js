/** Parse a YYYY-MM-DD string as local time (avoids UTC midnight → day-before bug). */
export function parseLocalDate(iso) {
  return new Date(iso + 'T00:00:00')
}
/** Format a YYYY-MM-DD ISO string using local time. */
export function formatDate(iso, opts) {
  return parseLocalDate(iso).toLocaleDateString('pt-BR', opts)
}
/** Return today's date as YYYY-MM-DD in local time (avoids toISOString UTC shift). */
export function todayLocalISO() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
/** Days elapsed since the item was found (local time). */
export function daysAvailableFromISO(iso) {
  const found = parseLocalDate(iso)
  const now = new Date()
  return Math.floor((now.getTime() - found.getTime()) / (1000 * 60 * 60 * 24))
}
export const DEADLINE_DAYS = 90
export const NEAR_DEADLINE_DAYS = 75
