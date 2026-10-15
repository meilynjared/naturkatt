export const WHATSAPP_NUMBER = '56975760155'
export const WHATSAPP_DISPLAY = '+56 9 7576 0155'
export const OWNER_NAME = 'Gloria Ríos Marambio'
export const OWNER_EMAIL = 'gloriariosmarambio@gmail.com'
export const CITY = 'Iquique, Chile'

const clp = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
})

export function formatCLP(value: number) {
  return clp.format(value)
}

export function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}
