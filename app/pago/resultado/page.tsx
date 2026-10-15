import type { Metadata } from 'next'
import Link from 'next/link'
import { CircleAlert, CircleCheck, CircleX } from 'lucide-react'
import { PaymentFollowUp } from '@/components/payment-follow-up'
import { SiteFooter } from '@/components/faq-footer'
import { SiteHeader } from '@/components/site-header'
import { formatCLP } from '@/lib/store'
import { isApproved, paymentTypeLabel, WEBPAY_IS_PRODUCTION, webpayTransaction, type WebpayStatus } from '@/lib/webpay'

export const metadata: Metadata = {
  title: 'Resultado del pago | NaturKatt',
  robots: { index: false },
}

export const dynamic = 'force-dynamic'

type Outcome =
  | { kind: 'approved'; tx: WebpayStatus }
  | { kind: 'rejected'; tx: WebpayStatus }
  | { kind: 'cancelled'; order: string }
  | { kind: 'expired'; order: string }
  | { kind: 'error' }

async function resolveOutcome(params: Record<string, string | string[] | undefined>): Promise<Outcome> {
  const token = typeof params.token === 'string' ? params.token : undefined
  const order = typeof params.orden === 'string' ? params.orden : ''
  if (token) {
    try {
      // Se consulta el estado directamente a Transbank: el resultado no depende de lo que diga la URL.
      const tx = (await webpayTransaction().status(token)) as WebpayStatus
      return isApproved(tx) ? { kind: 'approved', tx } : { kind: 'rejected', tx }
    } catch (error) {
      console.error('Webpay status error', error)
      return { kind: 'error' }
    }
  }
  if (params.estado === 'anulado') return { kind: 'cancelled', order }
  if (params.estado === 'expirado') return { kind: 'expired', order }
  return { kind: 'error' }
}

const COPY = {
  approved: { icon: CircleCheck, tone: 'text-primary', title: '¡Pago aprobado!', text: 'Gloria ya puede preparar tu pedido.' },
  rejected: {
    icon: CircleX,
    tone: 'text-destructive',
    title: 'El pago fue rechazado',
    text: 'No se hizo ningún cargo. Puedes intentarlo de nuevo con otra tarjeta o coordinar otro medio de pago con Gloria.',
  },
  cancelled: { icon: CircleAlert, tone: 'text-cta', title: 'Anulaste el pago', text: 'No se hizo ningún cargo. Tu pedido sigue guardado para que lo pagues cuando quieras.' },
  expired: { icon: CircleAlert, tone: 'text-cta', title: 'Se acabó el tiempo para pagar', text: 'No se hizo ningún cargo. Puedes volver a intentarlo.' },
  error: {
    icon: CircleAlert,
    tone: 'text-cta',
    title: 'No pudimos confirmar el pago',
    text: 'Si se hizo un cargo, escríbele a Gloria con tu orden de compra y lo revisa de inmediato.',
  },
} as const

function formatDate(iso?: string) {
  if (!iso) return ''
  return new Intl.DateTimeFormat('es-CL', { dateStyle: 'long', timeStyle: 'short', timeZone: 'America/Santiago' }).format(new Date(iso))
}

export default async function PaymentResultPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const outcome = await resolveOutcome(await searchParams)
  const copy = COPY[outcome.kind]
  const Icon = copy.icon
  const tx = outcome.kind === 'approved' || outcome.kind === 'rejected' ? outcome.tx : null
  const order = tx?.buy_order ?? (outcome.kind === 'cancelled' || outcome.kind === 'expired' ? outcome.order : '')

  const details: [string, string][] = tx
    ? [
        ['Orden de compra', tx.buy_order],
        ['Monto', formatCLP(tx.amount)],
        ...(outcome.kind === 'approved'
          ? ([
              ['Código de autorización', tx.authorization_code ?? '—'],
              ['Medio de pago', paymentTypeLabel(tx.payment_type_code)],
              ...(tx.installments_number ? [['Cuotas', String(tx.installments_number)] as [string, string]] : []),
              ['Tarjeta', tx.card_detail?.card_number ? `terminada en ${tx.card_detail.card_number}` : '—'],
              ['Fecha', formatDate(tx.transaction_date)],
            ] as [string, string][])
          : []),
      ]
    : order
      ? [['Orden de compra', order]]
      : []

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-12">
        <section className="flex flex-col items-center gap-3 text-center">
          <Icon className={`size-14 ${copy.tone}`} aria-hidden />
          <h1 className="font-serif text-3xl">{copy.title}</h1>
          <p className="text-pretty text-muted-foreground">{copy.text}</p>
          {!WEBPAY_IS_PRODUCTION && (
            <p className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">
              Webpay en modo de pruebas: no se cobró dinero real
            </p>
          )}
        </section>

        {details.length > 0 && (
          <dl className="divide-y rounded-2xl border bg-card px-5">
            {details.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 py-3 text-sm">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="text-right font-medium tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
        )}

        <PaymentFollowUp
          approved={outcome.kind === 'approved'}
          buyOrder={order}
          authorizationCode={tx?.authorization_code}
        />

        {outcome.kind !== 'approved' && (
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/checkout" className="rounded-full bg-cta px-6 py-3 font-semibold text-cta-foreground">
              Intentar pagar de nuevo
            </Link>
            <Link href="/" className="text-sm text-primary underline underline-offset-4">
              Volver a la tienda
            </Link>
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  )
}
