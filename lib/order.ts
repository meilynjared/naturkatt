import { FREE_SHIPPING_THRESHOLD, GIFT_WRAP_PRICE, type Product } from './catalog'
import { formatCLP } from './store'

export type CartItem = {
  key: string
  slug: string
  name: string
  image: string
  unitPrice: number
  quantity: number
  selections: Record<string, string>
  giftWrap: boolean
  giftMessage: string
}

export function unitPriceFor(product: Product, selections: Record<string, string>, giftWrap: boolean) {
  let price = product.price
  for (const option of product.options) {
    const value = option.values.find((v) => v.label === selections[option.id])
    price += value?.priceDelta ?? 0
  }
  return price + (giftWrap ? GIFT_WRAP_PRICE : 0)
}

export function describeItem(item: CartItem) {
  const parts = Object.values(item.selections)
  if (item.giftWrap) parts.push('envoltorio de regalo')
  return parts.join(' · ')
}

export function buildOrderMessage(items: CartItem[]) {
  const total = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
  const lines = items.map((item) => {
    const detail = describeItem(item)
    const message = item.giftMessage ? `\n   Tarjeta: "${item.giftMessage}"` : ''
    return `• ${item.quantity} x ${item.name}${detail ? ` (${detail})` : ''} — ${formatCLP(item.unitPrice * item.quantity)}${message}`
  })
  const shipping =
    total >= FREE_SHIPPING_THRESHOLD
      ? 'Mi pedido califica para envío gratis en Iquique / Alto Hospicio.'
      : 'Quisiera saber el costo de envío a mi comuna.'
  return `¡Hola Gloria! Quiero hacer este pedido en NaturKatt:\n\n${lines.join('\n')}\n\nTotal: ${formatCLP(total)}\n${shipping}\n\nMi nombre y dirección de entrega:`
}
