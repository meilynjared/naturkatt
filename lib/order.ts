import { GIFT_WRAP_PRICE, getProduct, type Product } from './catalog'
import { COMMUNES, DELIVERY_TIME, formatKm, googleMapsLink, PICKUP, type Carrier, type Commune, type DeliveryLocation, type ShippingQuote } from './shipping'
import { formatCLP } from './store'

export type CartItem = {
  key: string
  slug: string
  name: string
  image: string
  unitPrice: number
  quantity: number
  /** Texto para mostrar, por ejemplo { aroma: 'Familia olfativa: Floral' } */
  selections: Record<string, string>
  /** Valor elegido en cada opción, por ejemplo { aroma: 'Floral' }. Se usa para recalcular el precio en el servidor. */
  choices: Record<string, string>
  giftWrap: boolean
  giftMessage: string
}

/** Lo mínimo que el navegador envía al servidor para cobrar un pedido. El precio siempre se recalcula en el servidor. */
export type OrderLineInput = {
  slug: string
  choices: Record<string, string>
  giftWrap: boolean
  giftMessage: string
  quantity: number
}

export type PricedLine = OrderLineInput & {
  name: string
  image: string
  detail: string
  unitPrice: number
  lineTotal: number
}

export const MAX_QUANTITY_PER_LINE = 10
const MAX_LINES = 20
const MAX_GIFT_MESSAGE = 140

/** Recalcula el pedido con los precios del catálogo. Devuelve un error si algún dato no calza con el catálogo. */
export function priceOrder(input: unknown): { lines: PricedLine[]; total: number } | { error: string } {
  if (!Array.isArray(input) || input.length === 0) return { error: 'El pedido está vacío.' }
  if (input.length > MAX_LINES) return { error: 'El pedido tiene demasiados productos.' }

  const lines: PricedLine[] = []
  for (const raw of input as Partial<OrderLineInput>[]) {
    const product = typeof raw?.slug === 'string' ? getProduct(raw.slug) : undefined
    if (!product) return { error: 'Uno de los productos ya no está disponible.' }

    const quantity = Number(raw.quantity)
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY_PER_LINE) {
      return { error: `La cantidad de ${product.name} no es válida.` }
    }

    const choices: Record<string, string> = {}
    for (const option of product.options) {
      const label = raw.choices?.[option.id]
      if (!option.values.some((v) => v.label === label)) {
        return { error: `Elige una opción válida de ${option.name.toLowerCase()} para ${product.name}.` }
      }
      choices[option.id] = label as string
    }

    const giftWrap = raw.giftWrap === true
    const giftMessage = giftWrap && typeof raw.giftMessage === 'string' ? raw.giftMessage.trim().slice(0, MAX_GIFT_MESSAGE) : ''
    const unitPrice = unitPriceFor(product, choices, giftWrap)
    const detailParts = product.options.map((o) => `${o.name}: ${choices[o.id]}`)
    if (giftWrap) detailParts.push('envoltorio de regalo')

    lines.push({
      slug: product.slug,
      choices,
      giftWrap,
      giftMessage,
      quantity,
      name: product.name,
      image: product.image,
      detail: detailParts.join(' · '),
      unitPrice,
      lineTotal: unitPrice * quantity,
    })
  }

  return { lines, total: lines.reduce((sum, l) => sum + l.lineTotal, 0) }
}

/** Solo se envía dentro de la Región de Tarapacá. */
export const DELIVERY_CITIES = COMMUNES
export type DeliveryCity = Commune

/** domicilio: envío a la dirección de la clienta · retiro: retira gratis en el punto de retiro de Gloria */
export type DeliveryMode = 'domicilio' | 'retiro'

export type CheckoutCustomer = {
  name: string
  phone: string
  delivery: DeliveryMode
  address: string
  city: DeliveryCity
  notes: string
  /** Punto de entrega verificado en el mapa. */
  location: DeliveryLocation | null
}

/** Envío cobrado junto al pedido. */
export type OrderShipping = Pick<ShippingQuote, 'fee' | 'km' | 'method' | 'free' | 'outsideArea'> & { carrier: Carrier | 'retiro' | null }

export const PICKUP_SHIPPING: OrderShipping = { fee: 0, km: 0, method: 'ruta', free: true, outsideArea: false, carrier: 'retiro' }

export function shippingLine(shipping?: OrderShipping | null) {
  if (!shipping) return 'Por coordinar con Gloria'
  if (shipping.carrier === 'retiro') return `${PICKUP.title} (${PICKUP.address})`
  if (shipping.outsideArea) return 'Fuera de la zona de envío: Gloria te confirma el valor'
  const how = shipping.carrier ? ` · ${DELIVERY_TIME[shipping.carrier]}` : ''
  return `${shipping.free ? 'Gratis' : formatCLP(shipping.fee)} (${formatKm(shipping.km)} de recorrido)${how}`
}

/** Mensaje para avisarle a Gloria de un pedido ya pagado con Webpay. */
export function buildPaidOrderMessage(params: {
  buyOrder: string
  authorizationCode?: string
  lines: PricedLine[]
  total: number
  customer: CheckoutCustomer
  shipping?: OrderShipping | null
}) {
  const { buyOrder, authorizationCode, lines, total, customer, shipping } = params
  const items = lines.map((l) => {
    const card = l.giftMessage ? `\n   Tarjeta: "${l.giftMessage}"` : ''
    return `• ${l.quantity} x ${l.name} (${l.detail}) — ${formatCLP(l.lineTotal)}${card}`
  })
  return [
    '¡Hola Gloria! Acabo de pagar con Webpay en NaturKatt.',
    '',
    `Orden de compra: ${buyOrder}${authorizationCode ? ` · Autorización: ${authorizationCode}` : ''}`,
    ...items,
    `${shipping?.carrier === 'retiro' ? 'Entrega' : 'Envío'}: ${shippingLine(shipping)}`,
    `Total pagado: ${formatCLP(total)}`,
    '',
    `Nombre: ${customer.name}`,
    `Teléfono: ${customer.phone}`,
    ...(shipping?.carrier === 'retiro'
      ? ['¿Qué día y a qué hora puedo pasar a retirar?']
      : [
          `Dirección: ${customer.address.trim() || 'marcada en el mapa'}, ${customer.city}`,
          customer.location ? `Ubicación en el mapa: ${googleMapsLink(customer.location.lat, customer.location.lon)}` : '',
        ]),
    customer.notes ? `Indicaciones: ${customer.notes}` : '',
  ]
    .filter((line, i, all) => line !== '' || all[i - 1] !== '')
    .join('\n')
    .trim()
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
