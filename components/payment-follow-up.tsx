'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { clearPendingCheckout, loadLastOrder, type LastOrder } from '@/lib/checkout-storage'
import { buildPaidOrderMessage, shippingLine } from '@/lib/order'
import { PICKUP } from '@/lib/shipping'
import { formatCLP, whatsappLink } from '@/lib/store'

export function PaymentFollowUp({
  approved,
  buyOrder,
  authorizationCode,
}: {
  approved: boolean
  buyOrder: string
  authorizationCode?: string
}) {
  const [order, setOrder] = useState<LastOrder | null>(null)

  useEffect(() => {
    const last = loadLastOrder()
    if (last && last.buyOrder === buyOrder) setOrder(last)
    if (approved) clearPendingCheckout()
  }, [approved, buyOrder])

  if (!approved) return null

  const message = order
    ? buildPaidOrderMessage({ buyOrder, authorizationCode, lines: order.lines, total: order.total, customer: order.customer, shipping: order.shipping })
    : `¡Hola Gloria! Acabo de pagar con Webpay en NaturKatt. Orden de compra: ${buyOrder}${authorizationCode ? ` · Autorización: ${authorizationCode}` : ''}`

  return (
    <section className="flex flex-col gap-5">
      {order && (
        <div className="rounded-2xl border bg-card p-5">
          <h2 className="font-serif text-xl">Tu pedido</h2>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            {order.lines.map((l, i) => (
              <li key={`${l.slug}-${i}`} className="flex justify-between gap-4">
                <span>
                  {`${l.quantity} × ${l.name}`}
                  <span className="block text-xs text-muted-foreground">{l.detail}</span>
                </span>
                <span className="tabular-nums">{formatCLP(l.lineTotal)}</span>
              </li>
            ))}
          </ul>
          {order.subtotal !== undefined && (
            <dl className="mt-3 flex flex-col gap-1 border-t pt-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Envío</dt>
                <dd className="text-right">{shippingLine(order.shipping)}</dd>
              </div>
              <div className="flex justify-between gap-4 font-semibold">
                <dt>Total pagado</dt>
                <dd className="tabular-nums">{formatCLP(order.total)}</dd>
              </div>
            </dl>
          )}
          <p className="mt-4 border-t pt-4 text-sm text-muted-foreground">
            {order.shipping?.carrier === 'retiro'
              ? `Retiro por ${order.customer.name} en el punto de retiro de Gloria (${PICKUP.address}). Coordina con ella el día y la hora por WhatsApp.`
              : `Entrega a ${order.customer.name} en ${order.customer.address.trim() || 'el punto marcado en el mapa'}, ${order.customer.city}.`}
          </p>
        </div>
      )}

      <div className="flex flex-col items-center gap-3 text-center">
        <p className="text-sm text-muted-foreground">
          Último paso: envíale el comprobante a Gloria para que coordine la entrega contigo.
        </p>
        <a
          href={whatsappLink(message)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-full bg-cta px-6 py-3.5 font-semibold text-cta-foreground transition hover:brightness-110"
        >
          <MessageCircle className="size-5" aria-hidden />
          Enviar comprobante a Gloria
        </a>
        <Link href="/" className="text-sm text-primary-ink underline underline-offset-4">
          Volver a la tienda
        </Link>
      </div>
    </section>
  )
}
