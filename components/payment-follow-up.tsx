'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { clearPendingCheckout, loadLastOrder, type LastOrder } from '@/lib/checkout-storage'
import { buildPaidOrderMessage } from '@/lib/order'
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
    ? buildPaidOrderMessage({ buyOrder, authorizationCode, lines: order.lines, total: order.total, customer: order.customer })
    : `¡Hola Gloria! Acabo de pagar con Webpay en NaturKatt. Orden de compra: ${buyOrder}${authorizationCode ? ` · Autorización: ${authorizationCode}` : ''}`
  const city = order ? (order.customer.city === 'Otra ciudad' ? order.customer.otherCity : order.customer.city) : ''

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
          <p className="mt-4 border-t pt-4 text-sm text-muted-foreground">
            {`Entrega a ${order.customer.name} en ${order.customer.address}, ${city}.`}
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
        <Link href="/" className="text-sm text-primary underline underline-offset-4">
          Volver a la tienda
        </Link>
      </div>
    </section>
  )
}
