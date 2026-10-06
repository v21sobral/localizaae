/** CPF validation using check-digit algorithm. Rejects repeated sequences (e.g. 111.111.111-11). */
export function isValidCPF(cpf) {
  const d = cpf.replace(/\D/g, '')
  if (d.length !== 11) return false
  if (/^(\d)\1{10}$/.test(d)) return false
  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(d[i]) * (10 - i)
  let r = (sum * 10) % 11
  if (r === 10 || r === 11) r = 0
  if (r !== parseInt(d[9])) return false
  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(d[i]) * (11 - i)
  r = (sum * 10) % 11
  if (r === 10 || r === 11) r = 0
  return r === parseInt(d[10])
}
/** Validate DDD (2 digits, 11–99) and phone number (8 or 9 digits). */
export function isValidPhone(ddd, tel) {
  const dddNum = parseInt(ddd, 10)
  if (ddd.length !== 2 || dddNum < 11 || dddNum > 99) return false
  const telDigits = tel.replace(/\D/g, '')
  return telDigits.length === 8 || telDigits.length === 9
}
/** Apply phone mask: 99999-9999 or 9999-9999. */
export function maskPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 9)
  if (digits.length <= 8) return digits.replace(/(\d{4})(\d{1,4})/, '$1-$2')
  return digits.replace(/(\d{5})(\d{1,4})/, '$1-$2')
}
