'use client'

import type { CartItem, CheckoutCustomer, OrderLineInput, PricedLine } from './order'

/** Productos que la clienta va a pagar (se guardan solo en esta pestaña del navegador). */
const PENDING_KEY = 'naturkatt:checkout'
/** Pedido enviado a Webpay, para mostrar el detalle al volver del pago. */
const LAST_ORDER_KEY = 'naturkatt:ultimo-pedido'
/** Datos de entrega guardados con permiso de la clienta, para la compra en 1 clic. */
const CUSTOMER_KEY = 'naturkatt:cliente'

export type PendingLine = OrderLineInput & { name: string; image: string; detail: string; unitPrice: number }

export type LastOrder = {
  buyOrder: string
  lines: PricedLine[]
  total: number
  customer: CheckoutCustomer
}

function read<T>(storage: () => Storage, key: string): T | null {
  try {
    const raw = storage().getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function write(storage: () => Storage, key: string, value: unknown) {
  try {
    if (value === null) storage().removeItem(key)
    else storage().setItem(key, JSON.stringify(value))
  } catch {
    // El navegador puede bloquear el almacenamiento (modo privado); la compra sigue funcionando sin guardar.
  }
}

const session = () => window.sessionStorage
const local = () => window.localStorage

export function toPendingLines(items: Omit<CartItem, 'key'>[]): PendingLine[] {
  return items.map((i) => ({
    slug: i.slug,
    choices: i.choices,
    giftWrap: i.giftWrap,
    giftMessage: i.giftMessage,
    quantity: i.quantity,
    name: i.name,
    image: i.image,
    detail: [...Object.values(i.selections), ...(i.giftWrap ? ['envoltorio de regalo'] : [])].join(' · '),
    unitPrice: i.unitPrice,
  }))
}

export const savePendingCheckout = (lines: PendingLine[]) => write(session, PENDING_KEY, lines)
export const loadPendingCheckout = () => read<PendingLine[]>(session, PENDING_KEY)
export const clearPendingCheckout = () => write(session, PENDING_KEY, null)

export const saveLastOrder = (order: LastOrder) => write(session, LAST_ORDER_KEY, order)
export const loadLastOrder = () => read<LastOrder>(session, LAST_ORDER_KEY)

export const saveCustomer = (customer: CheckoutCustomer | null) => write(local, CUSTOMER_KEY, customer)
export const loadCustomer = () => read<CheckoutCustomer>(local, CUSTOMER_KEY)
