/** Celulares chilenos con el formato +56 9 1234 5678. */

export const PHONE_PREFIX = '+56 9 '
const PHONE_PATTERN = /^\+56 9 \d{4} \d{4}$/

/**
 * Ordena lo que escribe la clienta como +56 9 XXXX XXXX.
 * Acepta que escriba o pegue el número con o sin +56 y con o sin el 9 inicial.
 */
export function formatChileMobile(raw: string) {
  if (PHONE_PREFIX.startsWith(raw)) return '' // borró hasta el prefijo
  // Lo que viene después del prefijo ya mostrado (por ejemplo, si pega el número completo tras "+56 9 ").
  const rest = raw.startsWith(PHONE_PREFIX) ? raw.slice(PHONE_PREFIX.length) : raw
  let digits = rest.replace(/\D/g, '')
  if (digits.length >= 11 && digits.startsWith('569')) digits = digits.slice(3)
  else if (digits.length >= 10 && digits.startsWith('56')) digits = digits.slice(2)
  if (digits.length >= 9 && digits.startsWith('9')) digits = digits.slice(1)
  digits = digits.slice(0, 8)
  if (!digits) return ''
  return `${PHONE_PREFIX}${digits.slice(0, 4)}${digits.length > 4 ? ` ${digits.slice(4)}` : ''}`
}

export function isValidChileMobile(value: string) {
  return PHONE_PATTERN.test(value)
}
