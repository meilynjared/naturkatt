'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { CreditCard, Loader2, Lock, MessageCircle } from 'lucide-react'
import {
  clearPendingCheckout,
  loadCustomer,
  loadPendingCheckout,
  saveCustomer,
  saveLastOrder,
  type PendingLine,
} from '@/lib/checkout-storage'
import { DELIVERY_CITIES, shippingLabel, type CheckoutCustomer, type DeliveryCity, type PricedLine } from '@/lib/order'
import { formatCLP, whatsappLink } from '@/lib/store'

const EMPTY_CUSTOMER: CheckoutCustomer = { name: '', phone: '', address: '', city: 'Iquique', otherCity: '', notes: '' }

type Errors = Partial<Record<keyof CheckoutCustomer, string>>

function validate(c: CheckoutCustomer): Errors {
  const errors: Errors = {}
  if (c.name.trim().length < 3) errors.name = 'Escribe tu nombre y apellido.'
  const digits = c.phone.replace(/\D/g, '')
  if (digits.length < 8 || digits.length > 12) errors.phone = 'Escribe un teléfono válido, por ejemplo +56 9 1234 5678.'
  if (c.address.trim().length < 5) errors.address = 'Escribe calle, número y depto o casa.'
  if (c.city === 'Otra ciudad' && c.otherCity.trim().length < 3) errors.otherCity = 'Escribe la ciudad o comuna de entrega.'
  return errors
}

export function CheckoutForm({ testMode }: { testMode: boolean }) {
  const [lines, setLines] = useState<PendingLine[] | null>(null)
  const [customer, setCustomer] = useState<CheckoutCustomer>(EMPTY_CUSTOMER)
  const [remember, setRemember] = useState(true)
  const [hasSavedData, setHasSavedData] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'redirecting'>('idle')
  const [serverError, setServerError] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    setLines(loadPendingCheckout() ?? [])
    const saved = loadCustomer()
    if (saved) {
      setCustomer({ ...EMPTY_CUSTOMER, ...saved })
      setHasSavedData(true)
    }
  }, [])

  if (lines === null) {
    return <div className="mx-auto max-w-5xl px-4 py-24 text-center text-muted-foreground">Cargando tu pedido…</div>
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center">
        <h1 className="font-serif text-3xl">No hay productos para pagar</h1>
        <p className="text-muted-foreground">Elige un kit o producto y presiona “Comprar ahora” para llegar aquí.</p>
        <Link href="/#kits" className="rounded-full bg-cta px-6 py-3 font-semibold text-cta-foreground">
          Ver kits de regalo
        </Link>
      </div>
    )
  }

  const total = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0)
  const set = (field: keyof CheckoutCustomer) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setCustomer((c) => ({ ...c, [field]: e.target.value }))

  const pay = async (e: React.FormEvent) => {
    e.preventDefault()
    const found = validate(customer)
    setErrors(found)
    setServerError('')
    if (Object.keys(found).length > 0) return

    setStatus('sending')
    saveCustomer(remember ? customer : null)
    try {
      const res = await fetch('/api/webpay/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lines: lines.map(({ slug, choices, giftWrap, giftMessage, quantity }) => ({ slug, choices, giftWrap, giftMessage, quantity })),
        }),
      })
      const data: { url?: string; token?: string; buyOrder?: string; lines?: PricedLine[]; total?: number; error?: string } =
        await res.json()
      if (!res.ok || !data.url || !data.token || !data.buyOrder || !data.lines || data.total === undefined) {
        throw new Error(data.error || 'No pudimos conectar con Webpay. Intenta de nuevo en unos segundos.')
      }
      saveLastOrder({ buyOrder: data.buyOrder, lines: data.lines, total: data.total, customer })
      setStatus('redirecting')
      // Webpay exige recibir el token por POST en su formulario de pago.
      const form = formRef.current!
      form.action = data.url
      ;(form.elements.namedItem('token_ws') as HTMLInputElement).value = data.token
      form.submit()
    } catch (err) {
      setStatus('idle')
      setServerError(err instanceof Error ? err.message : 'No pudimos conectar con Webpay.')
    }
  }

  const fieldClass =
    'w-full rounded-lg border bg-background px-3 py-2.5 outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[invalid=true]:border-destructive'
  const busy = status !== 'idle'

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-10 md:grid-cols-[1fr_minmax(0,22rem)]">
      <form onSubmit={pay} noValidate className="flex flex-col gap-6" aria-busy={busy}>
        <div>
          <h1 className="font-serif text-3xl">Datos de entrega</h1>
          <p className="mt-2 text-muted-foreground">
            {hasSavedData
              ? 'Usamos los datos de tu compra anterior. Revisa que estén bien y paga en un clic.'
              : 'Solo los usa Gloria para entregarte el pedido. No necesitas crear una cuenta.'}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="name" label="Nombre y apellido" error={errors.name}>
            <input id="name" autoComplete="name" value={customer.name} onChange={set('name')} aria-invalid={!!errors.name} className={fieldClass} />
          </Field>
          <Field id="phone" label="Teléfono (WhatsApp)" error={errors.phone}>
            <input id="phone" type="tel" autoComplete="tel" placeholder="+56 9 1234 5678" value={customer.phone} onChange={set('phone')} aria-invalid={!!errors.phone} className={fieldClass} />
          </Field>
          <Field id="address" label="Dirección" error={errors.address} wide>
            <input id="address" autoComplete="street-address" placeholder="Calle, número, depto o casa" value={customer.address} onChange={set('address')} aria-invalid={!!errors.address} className={fieldClass} />
          </Field>
          <Field id="city" label="Ciudad">
            <select id="city" value={customer.city} onChange={(e) => setCustomer((c) => ({ ...c, city: e.target.value as DeliveryCity }))} className={fieldClass}>
              {DELIVERY_CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
          {customer.city === 'Otra ciudad' && (
            <Field id="otherCity" label="¿Cuál ciudad o comuna?" error={errors.otherCity}>
              <input id="otherCity" autoComplete="address-level2" value={customer.otherCity} onChange={set('otherCity')} aria-invalid={!!errors.otherCity} className={fieldClass} />
            </Field>
          )}
          <Field id="notes" label="Indicaciones para la entrega (opcional)" wide>
            <textarea id="notes" rows={2} maxLength={200} placeholder="Ej: dejar en conserjería, timbre 2" value={customer.notes} onChange={set('notes')} className={`${fieldClass} resize-none`} />
          </Field>
        </div>

        <label className="flex cursor-pointer items-start gap-3 text-sm">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="mt-0.5 size-5 accent-[var(--primary)]" />
          <span>
            Recordar mis datos en este dispositivo para comprar en 1 clic la próxima vez.
            <span className="block text-xs text-muted-foreground">Se guardan solo en tu navegador; puedes desmarcar para no guardarlos.</span>
          </span>
        </label>

        {testMode && (
          <div className="rounded-xl border border-dashed border-primary/40 bg-secondary p-4 text-sm">
            <p className="font-semibold text-secondary-foreground">Webpay en modo de pruebas: no se cobra dinero real</p>
            <p className="mt-1 text-muted-foreground">
              Paga con la tarjeta de prueba <span className="font-mono text-foreground">4051 8856 0044 6623</span>, CVV{' '}
              <span className="font-mono text-foreground">123</span> y cualquier fecha futura. Si te pide autenticación, usa RUT{' '}
              <span className="font-mono text-foreground">11.111.111-1</span> y clave <span className="font-mono text-foreground">123</span>.
            </p>
          </div>
        )}

        {serverError && (
          <p role="alert" className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="flex items-center justify-center gap-2 rounded-full bg-cta px-6 py-4 text-lg font-semibold text-cta-foreground shadow-md transition hover:brightness-110 disabled:opacity-70"
        >
          {busy ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <CreditCard className="size-5" aria-hidden />}
          {status === 'redirecting' ? 'Abriendo Webpay…' : status === 'sending' ? 'Preparando el pago…' : `Pagar ${formatCLP(total)} con Webpay`}
        </button>
        <p className="-mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="size-3.5" aria-hidden />
          Pagas en el sitio seguro de Transbank con débito, crédito o prepago. NaturKatt no ve ni guarda los datos de tu tarjeta.
        </p>
        <a
          href={whatsappLink('¡Hola Gloria! Quiero pagar mi pedido de NaturKatt por transferencia o en efectivo.')}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 text-sm text-primary underline underline-offset-4"
        >
          <MessageCircle className="size-4" aria-hidden />
          ¿Prefieres transferencia o efectivo contra entrega? Coordínalo con Gloria
        </a>
      </form>

      <aside className="order-first h-fit rounded-2xl border bg-card p-5 md:order-none md:sticky md:top-28">
        <h2 className="font-serif text-xl">Tu pedido</h2>
        <ul className="mt-4 flex flex-col divide-y">
          {lines.map((l, i) => (
            <li key={`${l.slug}-${i}`} className="flex gap-3 py-3">
              <Image src={l.image || '/placeholder.svg'} alt="" width={56} height={56} className="size-14 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-tight">{`${l.quantity} × ${l.name}`}</p>
                {l.detail && <p className="text-xs text-muted-foreground">{l.detail}</p>}
                {l.giftMessage && <p className="text-xs italic text-muted-foreground">{`Tarjeta: "${l.giftMessage}"`}</p>}
              </div>
              <span className="text-sm font-semibold tabular-nums">{formatCLP(l.unitPrice * l.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-2 flex flex-col gap-2 border-t pt-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Envío</dt>
            <dd className="text-right">{shippingLabel(total, customer.city)}</dd>
          </div>
          <div className="flex justify-between text-lg font-semibold">
            <dt>Total a pagar</dt>
            <dd className="tabular-nums">{formatCLP(total)}</dd>
          </div>
        </dl>
        <button
          type="button"
          onClick={() => {
            clearPendingCheckout()
            setLines([])
          }}
          className="mt-4 text-xs text-muted-foreground underline underline-offset-4"
        >
          Cancelar y vaciar este pedido
        </button>
      </aside>

      {/* Formulario oculto que lleva el token a Webpay */}
      <form ref={formRef} method="POST" className="hidden" aria-hidden>
        <input type="hidden" name="token_ws" />
      </form>
    </div>
  )
}

function Field({
  id,
  label,
  error,
  wide,
  children,
}: {
  id: string
  label: string
  error?: string
  wide?: boolean
  children: React.ReactNode
}) {
  return (
    <div className={wide ? 'flex flex-col gap-1.5 sm:col-span-2' : 'flex flex-col gap-1.5'}>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
