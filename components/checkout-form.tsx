'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { CircleAlert, CircleCheck, CreditCard, ExternalLink, Loader2, LocateFixed, Lock, Map as MapIcon, MapPin, MessageCircle, Store, Truck } from 'lucide-react'
import { FREE_SHIPPING_THRESHOLD } from '@/lib/catalog'
import {
  clearPendingCheckout,
  loadCustomer,
  loadPendingCheckout,
  saveCustomer,
  saveLastOrder,
  type PendingLine,
} from '@/lib/checkout-storage'
import { DELIVERY_CITIES, type CheckoutCustomer, type DeliveryCity, type DeliveryMode, type OrderShipping, type PricedLine } from '@/lib/order'
import { formatChileMobile, isValidChileMobile, PHONE_PREFIX } from '@/lib/phone'
import {
  DELIVERY_TIME,
  formatKm,
  googleMapsLink,
  inRegion,
  isCommune,
  LOCAL_COMMUNES,
  PICKUP,
  SHIPPING_TIERS,
  TARAPACA_COMMUNES,
  shippingQuote,
  shippingSummary,
  type DeliveryLocation,
  type RouteQuote,
} from '@/lib/shipping'
import { formatCLP, whatsappLink } from '@/lib/store'

const DeliveryMap = dynamic(() => import('./delivery-map').then((m) => m.DeliveryMap), {
  ssr: false,
  loading: () => <div className="h-64 w-full animate-pulse rounded-xl border bg-muted sm:h-72" aria-hidden />,
})

const EMPTY_CUSTOMER: CheckoutCustomer = {
  name: '',
  phone: '',
  delivery: 'domicilio',
  address: '',
  city: 'Iquique',
  notes: '',
  location: null,
}

type Errors = Partial<Record<keyof CheckoutCustomer, string>>

type GeoState =
  | { kind: 'idle' }
  | { kind: 'buscando' }
  | { kind: 'encontrada' }
  | { kind: 'otra-comuna'; commune: string }
  | { kind: 'no-encontrada' }
  | { kind: 'sin-servicio' }

type GeocodeResponse =
  | { status: 'ok' | 'otra-comuna'; result: DeliveryLocation & { commune: string } }
  | { status: 'no-encontrada' | 'sin-servicio' }
  | { error: string }

const searchKey = (c: CheckoutCustomer) => `${c.address.trim().toLowerCase()}|${c.city.toLowerCase()}`

function validate(c: CheckoutCustomer): Errors {
  const errors: Errors = {}
  if (c.name.trim().length < 3) errors.name = 'Escribe tu nombre y apellido.'
  if (!isValidChileMobile(c.phone)) errors.phone = 'Escribe los 8 dígitos de tu celular: +56 9 1234 5678.'
  if (c.delivery === 'retiro') return errors
  const markedOnMap = c.location?.precision === 'manual'
  if (c.address.trim().length < 5 && !markedOnMap) errors.address = 'Escribe calle, número y depto o casa, o marca tu casa en el mapa.'
  else if (!c.location) errors.address = 'Busca tu dirección o márcala en el mapa para calcular el envío.'
  else if (c.location.precision === 'calle')
    errors.address = 'Confirma en el mapa el punto exacto de entrega.'
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
  const [geo, setGeo] = useState<GeoState>({ kind: 'idle' })
  const [mapOpen, setMapOpen] = useState(false)
  const [route, setRoute] = useState<RouteQuote | null>(null)
  const [routeLoading, setRouteLoading] = useState(false)
  const [mapZoom, setMapZoom] = useState(17)
  const [pointInfo, setPointInfo] = useState<'idle' | 'buscando' | 'ok' | 'sin-calle' | 'fuera' | 'error'>('idle')
  const [locating, setLocating] = useState(false)
  const [locateError, setLocateError] = useState('')
  const reverseSeq = useRef(0)
  /** La dirección escrita la sugirió el mapa (se puede reemplazar al mover el pin). */
  const addressFromMap = useRef(false)
  const formRef = useRef<HTMLFormElement>(null)
  const lastSearch = useRef('')

  useEffect(() => {
    setLines(loadPendingCheckout() ?? [])
    const saved = loadCustomer()
    if (saved) {
      const known = isCommune(saved.city)
      const restored: CheckoutCustomer = {
        ...EMPTY_CUSTOMER,
        ...saved,
        phone: formatChileMobile(saved.phone ?? ''),
        // Antes existía la opción "Otra ciudad": esos datos se piden de nuevo.
        delivery: saved.delivery === 'retiro' ? 'retiro' : 'domicilio',
        city: known ? saved.city : EMPTY_CUSTOMER.city,
        location: known ? (saved.location ?? null) : null,
      }
      setCustomer(restored)
      setHasSavedData(true)
      if (restored.location) {
        lastSearch.current = searchKey(restored)
        setGeo({ kind: 'encontrada' })
      }
    }
  }, [])

  // Distancia por calle desde donde despacha Gloria cada vez que cambia el punto de entrega.
  const loc = customer.delivery === 'domicilio' ? customer.location : null
  useEffect(() => {
    if (!loc) {
      setRoute(null)
      return
    }
    const controller = new AbortController()
    setRouteLoading(true)
    fetch('/api/envio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat: loc.lat, lon: loc.lon }),
      signal: controller.signal,
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('envio'))))
      .then((data: RouteQuote) => setRoute(data))
      .catch((err) => {
        if (!controller.signal.aborted) {
          console.error(err)
          setRoute(null)
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setRouteLoading(false)
      })
    return () => controller.abort()
  }, [loc?.lat, loc?.lon]) // eslint-disable-line react-hooks/exhaustive-deps

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

  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0)
  const pickup = customer.delivery === 'retiro'
  const quote = !pickup && route ? shippingQuote(subtotal, route) : null
  // El envío gratis desde $30.000 es solo para el reparto de Gloria en Iquique y Alto Hospicio.
  const freeEligible = !pickup && (quote ? quote.carrier === 'gloria' : LOCAL_COMMUNES.includes(customer.city))
  const total = subtotal + (quote?.fee ?? 0)
  const missingForFree = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)

  const set = (field: 'name' | 'notes') => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setCustomer((c) => ({ ...c, [field]: e.target.value }))

  /** Cambiar la dirección o la ciudad obliga a verificarla de nuevo. */
  const changeDelivery = (patch: Partial<CheckoutCustomer>) => {
    setCustomer((c) => ({ ...c, ...patch, location: null }))
    setGeo({ kind: 'idle' })
    setServerError('')
    setMapOpen(false)
    setPointInfo('idle')
    setLocateError('')
    lastSearch.current = ''
  }

  const verifyAddress = async (target: CheckoutCustomer = customer, force = false) => {
    const city = target.city
    if (target.address.trim().length < 5) return
    const key = searchKey(target)
    if (!force && key === lastSearch.current) return
    lastSearch.current = key
    setGeo({ kind: 'buscando' })
    setErrors((e) => ({ ...e, address: undefined }))
    try {
      const res = await fetch('/api/direccion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: target.address, city }),
      })
      const data: GeocodeResponse = await res.json()
      if (lastSearch.current !== key) return // la clienta cambió la dirección mientras se buscaba
      if ('error' in data) throw new Error(data.error)
      if (data.status === 'ok') {
        const { lat, lon, label, precision } = data.result
        setCustomer((c) => ({ ...c, location: { lat, lon, label, precision } }))
        setGeo({ kind: 'encontrada' })
        setPointInfo('idle')
        setMapZoom(17)
        setMapOpen(precision === 'calle')
      } else if (data.status === 'otra-comuna') {
        setGeo({ kind: 'otra-comuna', commune: data.result.commune })
      } else {
        setGeo({ kind: data.status })
      }
    } catch {
      lastSearch.current = ''
      setGeo({ kind: 'sin-servicio' })
    }
  }

  /** Abre el mapa (en el centro de la comuna si aún no hay punto) para que la clienta busque y marque su casa. */
  const markOnMap = () => {
    if (!customer.location) {
      const center = TARAPACA_COMMUNES[customer.city]
      setCustomer((c) => ({ ...c, location: { ...center, label: '', precision: 'calle' } }))
      setMapZoom(15)
    }
    setGeo({ kind: 'encontrada' })
    setMapOpen(true)
  }

  /** Sugiere la calle y el número del punto marcado, para quien no recuerda su dirección exacta. */
  const suggestAddress = async (lat: number, lon: number) => {
    const seq = ++reverseSeq.current
    setPointInfo('buscando')
    try {
      const res = await fetch('/api/direccion/inversa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lon }),
      })
      const data: { address?: string; label?: string; commune?: string; outsideRegion?: boolean } = await res.json()
      if (seq !== reverseSeq.current) return
      if (data.outsideRegion) {
        setPointInfo('fuera')
        return
      }
      const fillAddress = !!data.address && (!customer.address.trim() || addressFromMap.current)
      if (fillAddress) addressFromMap.current = true
      setCustomer((c) => {
        if (!c.location || c.location.lat !== lat || c.location.lon !== lon) return c
        const next: CheckoutCustomer = {
          ...c,
          city: data.commune && isCommune(data.commune) ? data.commune : c.city,
          address: fillAddress ? (data.address as string) : c.address,
          location: { ...c.location, label: data.label || c.location.label },
        }
        lastSearch.current = searchKey(next)
        return next
      })
      setPointInfo(data.address ? 'ok' : 'sin-calle')
    } catch {
      if (seq === reverseSeq.current) setPointInfo('error')
    }
  }

  const movePin = (lat: number, lon: number) => {
    setCustomer((c) => ({
      ...c,
      location: { lat, lon, label: c.location?.label || c.address.trim(), precision: 'manual' },
    }))
    setErrors((e) => ({ ...e, address: undefined }))
    setLocateError('')
    void suggestAddress(lat, lon)
  }

  const useMyLocation = () => {
    if (!('geolocation' in navigator)) {
      setLocateError('Tu navegador no permite compartir la ubicación. Márcala tocando el mapa.')
      return
    }
    setLocating(true)
    setLocateError('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false)
        const { latitude, longitude } = pos.coords
        if (!inRegion(latitude, longitude)) {
          setLocateError('Tu ubicación actual está fuera de la Región de Tarapacá. Marca la dirección de entrega tocando el mapa.')
          return
        }
        movePin(latitude, longitude)
      },
      () => {
        setLocating(false)
        setLocateError('No pudimos obtener tu ubicación. Revisa el permiso de ubicación del navegador o marca tu casa tocando el mapa.')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    )
  }

  const confirmPin = () => {
    setCustomer((c) => (c.location ? { ...c, location: { ...c.location, precision: 'manual' } } : c))
    setErrors((e) => ({ ...e, address: undefined }))
  }

  const pay = async (e: React.FormEvent) => {
    e.preventDefault()
    const found = validate(customer)
    setErrors(found)
    setServerError('')
    if (Object.keys(found).length > 0) {
      if (found.address && !pickup && !customer.location) void verifyAddress(customer, true)
      return
    }
    if (!pickup && quote?.outsideArea) {
      setServerError('Por ahora solo enviamos dentro de la Región de Tarapacá. Escríbele a Gloria para coordinar.')
      return
    }
    if (!pickup && !quote) {
      setServerError('Estamos calculando el envío. Espera un segundo y vuelve a presionar pagar.')
      return
    }

    setStatus('sending')
    saveCustomer(remember ? customer : null)
    try {
      const res = await fetch('/api/webpay/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lines: lines.map(({ slug, choices, giftWrap, giftMessage, quantity }) => ({ slug, choices, giftWrap, giftMessage, quantity })),
          delivery: pickup
            ? { mode: 'retiro' }
            : { mode: 'domicilio', city: customer.city, lat: customer.location?.lat, lon: customer.location?.lon },
        }),
      })
      const data: {
        url?: string
        token?: string
        buyOrder?: string
        lines?: PricedLine[]
        subtotal?: number
        shipping?: OrderShipping | null
        total?: number
        error?: string
      } = await res.json()
      if (!res.ok || !data.url || !data.token || !data.buyOrder || !data.lines || data.total === undefined) {
        throw new Error(data.error || 'No pudimos conectar con Webpay. Intenta de nuevo en unos segundos.')
      }
      // Si el envío calculado en el servidor no coincide con el que se muestra, se actualiza antes de pagar.
      if (data.total !== total) {
        if (data.shipping) setRoute({ km: data.shipping.km, method: data.shipping.method })
        setStatus('idle')
        setServerError(`El total se actualizó a ${formatCLP(data.total)}. Revísalo y vuelve a presionar pagar.`)
        return
      }
      saveLastOrder({
        buyOrder: data.buyOrder,
        lines: data.lines,
        subtotal: data.subtotal,
        shipping: data.shipping ?? null,
        total: data.total,
        customer,
      })
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
  const location = customer.location

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-10 md:grid-cols-[1fr_minmax(0,22rem)]">
      <form onSubmit={pay} noValidate className="flex min-w-0 flex-col gap-6" aria-busy={busy}>
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
          <Field id="phone" label="Celular (WhatsApp)" error={errors.phone}>
            <input
              id="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+56 9 1234 5678"
              value={customer.phone}
              onFocus={() => setCustomer((c) => (c.phone ? c : { ...c, phone: PHONE_PREFIX }))}
              onBlur={() => setCustomer((c) => (c.phone.trim() === PHONE_PREFIX.trim() ? { ...c, phone: '' } : c))}
              onChange={(e) => {
                const value = e.target.value
                setCustomer((c) => ({ ...c, phone: formatChileMobile(value) }))
              }}
              aria-invalid={!!errors.phone}
              className={`${fieldClass} tabular-nums`}
            />
          </Field>

          <fieldset className="flex flex-col gap-2 sm:col-span-2">
            <legend className="mb-1.5 text-sm font-medium">¿Cómo quieres recibir tu pedido?</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  { value: 'domicilio', icon: Truck, title: 'Envío a domicilio', text: 'Reparto de Gloria en Iquique y Alto Hospicio; courier al resto de Tarapacá.' },
                  { value: 'retiro', icon: Store, title: PICKUP.title, text: `En ${PICKUP.address}. Coordinas día y hora por WhatsApp.` },
                ] as const
              ).map(({ value, icon: Icon, title, text }) => (
                <label
                  key={value}
                  className="flex cursor-pointer items-start gap-3 rounded-xl border bg-card p-3 transition has-[:checked]:border-primary has-[:checked]:bg-secondary has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring"
                >
                  <input
                    type="radio"
                    name="delivery"
                    value={value}
                    checked={customer.delivery === value}
                    onChange={() => {
                      setCustomer((c) => ({ ...c, delivery: value as DeliveryMode }))
                      setErrors((e) => ({ ...e, address: undefined }))
                      setServerError('')
                    }}
                    className="mt-1 size-4 accent-[var(--primary)]"
                  />
                  <Icon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                  <span className="flex flex-col">
                    <span className="text-sm font-semibold">{title}</span>
                    <span className="text-xs text-muted-foreground">{text}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {pickup ? (
            <div className="flex flex-col gap-1 rounded-xl border bg-card p-4 text-sm sm:col-span-2">
              <p className="flex items-start gap-2 font-medium text-primary">
                <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
                <span>
                  Punto de retiro de Gloria
                  <span className="block text-base text-foreground">{PICKUP.address}</span>
                </span>
              </p>
              <p className="text-muted-foreground">{PICKUP.howTo}</p>
              <a
                href={PICKUP.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 flex items-center gap-1.5 self-start text-xs text-primary underline underline-offset-4"
              >
                <ExternalLink className="size-3.5" aria-hidden />
                Ver el punto de retiro en Google Maps
              </a>
            </div>
          ) : (
          <>
          <Field id="city" label="Comuna (Región de Tarapacá)">
            <select
              id="city"
              value={customer.city}
              onChange={(e) => {
                const city = e.target.value as DeliveryCity
                changeDelivery({ city })
                void verifyAddress({ ...customer, city, location: null }, true)
              }}
              className={fieldClass}
            >
              {DELIVERY_CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
          <p className="self-end pb-3 text-xs text-muted-foreground sm:pb-3.5">
            ¿Vives fuera de Tarapacá?{' '}
            <a
              href={whatsappLink('¡Hola Gloria! Vivo fuera de la Región de Tarapacá y quiero comprar en NaturKatt.')}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-4"
            >
              Escríbele a Gloria
            </a>
          </p>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label htmlFor="address" className="text-sm font-medium">
              Dirección
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                id="address"
                autoComplete="street-address"
                placeholder="Calle y número, depto o casa"
                value={customer.address}
                onChange={(e) => {
                  const address = e.target.value
                  addressFromMap.current = false
                  if (customer.location?.precision === 'manual') {
                    // Ya marcó su casa en el mapa: puede completar la dirección (depto, casa) sin perder el punto.
                    setCustomer((c) => ({ ...c, address }))
                    lastSearch.current = searchKey({ ...customer, address })
                  } else {
                    changeDelivery({ address })
                  }
                }}
                onBlur={() => void verifyAddress()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    void verifyAddress()
                  }
                }}
                aria-invalid={!!errors.address}
                aria-describedby="address-status"
                className={fieldClass}
              />
              <button
                type="button"
                onClick={() => void verifyAddress(customer, customer.location?.precision === 'manual')}
                disabled={geo.kind === 'buscando' || customer.address.trim().length < 5}
                className="flex shrink-0 items-center justify-center gap-2 rounded-lg border border-primary/40 bg-secondary px-4 py-2.5 text-sm font-medium text-secondary-foreground transition hover:bg-secondary/70 disabled:opacity-60"
              >
                {geo.kind === 'buscando' ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <MapPin className="size-4" aria-hidden />}
                Buscar dirección
              </button>
            </div>
            {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
            {geo.kind === 'idle' && (
              <button
                type="button"
                onClick={markOnMap}
                className="flex items-center gap-1.5 self-start text-xs font-medium text-primary underline underline-offset-4"
              >
                <MapIcon className="size-3.5" aria-hidden />
                ¿No recuerdas tu dirección exacta? Búscala y márcala en el mapa
              </button>
            )}

            <div id="address-status" aria-live="polite" className="text-sm">
              {geo.kind === 'buscando' && <p className="text-muted-foreground">Buscando tu dirección…</p>}

              {geo.kind === 'encontrada' && location && (
                <div className="flex flex-col gap-3 rounded-xl border bg-card p-3">
                  {location.precision === 'calle' ? (
                    <p className="flex items-start gap-2 text-cta">
                      <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
                      <span>
                        {!location.label || location.label === customer.address.trim()
                          ? 'Recorre el mapa (arrástralo y usa + y −) y toca tu casa para marcarla, o usa tu ubicación actual.'
                          : `Encontramos la calle (${location.label}), pero no el número exacto. Arrastra el pin hasta tu casa o confirma si ya está bien.`}
                      </span>
                    </p>
                  ) : (
                    <p className="flex items-start gap-2 text-primary">
                      <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
                      <span>
                        {location.precision === 'manual' ? 'Punto de entrega marcado en el mapa' : 'Dirección verificada'}
                        <span className="block text-xs text-muted-foreground">{location.label}</span>
                      </span>
                    </p>
                  )}

                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setMapOpen((o) => !o)}
                      aria-expanded={mapOpen}
                      className="flex items-center gap-1.5 font-medium text-primary underline underline-offset-4"
                    >
                      <MapIcon className="size-3.5" aria-hidden />
                      {mapOpen ? 'Ocultar mapa' : 'Ver en el mapa'}
                    </button>
                    {location.precision !== 'calle' || location.label ? (
                    <a
                      href={googleMapsLink(location.lat, location.lon)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-muted-foreground underline underline-offset-4"
                    >
                      <ExternalLink className="size-3.5" aria-hidden />
                      Abrir en Google Maps
                    </a>
                    ) : null}
                  </div>

                  {mapOpen && (
                    <div className="flex flex-col gap-2">
                      <DeliveryMap lat={location.lat} lon={location.lon} zoom={mapZoom} onMove={movePin} />
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                        <button
                          type="button"
                          onClick={useMyLocation}
                          disabled={locating}
                          className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium disabled:opacity-60"
                        >
                          {locating ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : <LocateFixed className="size-3.5" aria-hidden />}
                          Usar mi ubicación actual
                        </button>
                        <p className="text-xs text-muted-foreground">Toca tu casa en el mapa o arrastra el pin: el envío se recalcula solo.</p>
                      </div>
                      {locateError && <p className="text-xs text-destructive">{locateError}</p>}
                      {pointInfo === 'buscando' && <p className="text-xs text-muted-foreground">Buscando la dirección del punto marcado…</p>}
                      {pointInfo === 'ok' && (
                        <p className="text-xs text-primary">
                          Completamos la dirección con el punto marcado. Revísala y agrega el depto o la casa si corresponde.
                        </p>
                      )}
                      {pointInfo === 'sin-calle' && (
                        <p className="text-xs text-muted-foreground">
                          No encontramos el nombre de la calle de ese punto. Si la sabes, escríbela; si no, deja una referencia en las indicaciones.
                        </p>
                      )}
                      {pointInfo === 'fuera' && <p className="text-xs text-destructive">Ese punto está fuera de la Región de Tarapacá.</p>}
                      {location.precision === 'calle' && (
                        <button
                          type="button"
                          onClick={confirmPin}
                          className="self-start rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
                        >
                          La ubicación del pin es correcta
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {(geo.kind === 'no-encontrada' || geo.kind === 'sin-servicio' || geo.kind === 'otra-comuna') && (
                <div className="flex flex-col gap-2 rounded-xl border border-cta/30 bg-cta/5 p-3">
                  <p className="flex items-start gap-2 text-cta">
                    <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
                    <span>
                      {geo.kind === 'otra-comuna'
                        ? `Encontramos esa dirección en ${geo.commune}, no en ${customer.city}. Revisa la comuna o la dirección.`
                        : geo.kind === 'no-encontrada'
                          ? `No encontramos “${customer.address.trim()}” en ${customer.city}. Revisa el nombre de la calle y el número.`
                          : 'El buscador de direcciones no responde en este momento.'}
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {geo.kind === 'otra-comuna' && isCommune(geo.commune) && (
                      <button
                        type="button"
                        onClick={() => {
                          const city = geo.commune as DeliveryCity
                          changeDelivery({ city })
                          void verifyAddress({ ...customer, city, location: null }, true)
                        }}
                        className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
                      >
                        {`Cambiar comuna a ${geo.commune}`}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={markOnMap}
                      className="flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-medium"
                    >
                      <MapPin className="size-3.5" aria-hidden />
                      Marcar mi casa en el mapa
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          </>
          )}

          <Field id="notes" label={pickup ? 'Comentarios para Gloria (opcional)' : 'Indicaciones para la entrega (opcional)'} wide>
            <textarea
              id="notes"
              rows={2}
              maxLength={200}
              placeholder={pickup ? 'Ej: prefiero retirar después de las 18:00' : 'Ej: dejar en conserjería, timbre 2'}
              value={customer.notes}
              onChange={set('notes')}
              className={`${fieldClass} resize-none`}
            />
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
          disabled={busy || routeLoading}
          className="flex items-center justify-center gap-2 rounded-full bg-cta px-6 py-4 text-lg font-semibold text-cta-foreground shadow-md transition hover:brightness-110 disabled:opacity-70"
        >
          {busy || routeLoading ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <CreditCard className="size-5" aria-hidden />}
          {status === 'redirecting'
            ? 'Abriendo Webpay…'
            : status === 'sending'
              ? 'Preparando el pago…'
              : routeLoading
                ? 'Calculando el envío…'
                : `Pagar ${formatCLP(total)} con Webpay`}
        </button>
        <p className="-mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
          <Lock className="size-3.5 shrink-0" aria-hidden />
          Pagas en el sitio seguro de Transbank con débito, crédito o prepago. NaturKatt no ve ni guarda los datos de tu tarjeta.
        </p>
        <a
          href={whatsappLink('¡Hola Gloria! Quiero pagar mi pedido de NaturKatt por transferencia o en efectivo al recibirlo.')}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 text-center text-sm text-primary underline underline-offset-4"
        >
          <MessageCircle className="size-4 shrink-0" aria-hidden />
          ¿Prefieres pagar con transferencia o en efectivo al recibir tu pedido? Coordínalo con Gloria
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
            <dt className="text-muted-foreground">Productos</dt>
            <dd className="tabular-nums">{formatCLP(subtotal)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{pickup ? 'Entrega' : 'Envío'}</dt>
            <dd className="text-right tabular-nums">
              {pickup
                ? 'Retiro gratis'
                : routeLoading
                ? 'Calculando…'
                : quote
                  ? shippingSummary(quote)
                  : freeEligible && missingForFree === 0
                    ? 'Gratis'
                    : 'Se calcula con tu dirección'}
              {pickup && <span className="block text-xs text-muted-foreground">{PICKUP.address}</span>}
              {quote && quote.carrier && !routeLoading && (
                <span className="block text-xs text-muted-foreground">
                  {`${formatKm(quote.km)} de recorrido · ${quote.carrier === 'gloria' ? 'reparto de Gloria, 24 h hábiles' : 'por courier, 2 a 5 días hábiles'}`}
                </span>
              )}
            </dd>
          </div>
          <div className="flex justify-between text-lg font-semibold">
            <dt>Total a pagar</dt>
            <dd className="tabular-nums">{formatCLP(total)}</dd>
          </div>
        </dl>
        {freeEligible && missingForFree > 0 && (
          <p className="mt-3 rounded-lg bg-secondary px-3 py-2 text-xs text-secondary-foreground">
            {`Agrega ${formatCLP(missingForFree)} más y el envío en Iquique y Alto Hospicio es gratis.`}
          </p>
        )}
        <details className="mt-3 text-xs text-muted-foreground">
          <summary className="cursor-pointer font-medium text-foreground">¿Cómo se calcula el envío?</summary>
          <p className="mt-2">
            {`Según la distancia por calle desde donde despacha Gloria, en Alto Hospicio. En Iquique y Alto Hospicio reparte Gloria (gratis en compras desde ${formatCLP(FREE_SHIPPING_THRESHOLD)}); al resto de Tarapacá se envía por courier. También puedes retirar gratis en Alto Hospicio.`}
          </p>
          <table className="mt-2 w-full">
            <tbody>
              {SHIPPING_TIERS.map((t, i) => (
                <tr key={t.upToKm} className={t.carrier === 'courier' && SHIPPING_TIERS[i - 1]?.carrier === 'gloria' ? 'border-t-2 border-foreground/20' : 'border-t'}>
                  <td className="py-1 pr-2">
                    {`${i === 0 ? 'Hasta' : `${SHIPPING_TIERS[i - 1].upToKm} a`} ${t.upToKm} km`}
                    <span className="block text-[11px] leading-tight">{t.zone}</span>
                  </td>
                  <td className="py-1 text-right align-top tabular-nums">{formatCLP(t.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2">{`${DELIVERY_TIME.gloria} hasta 30 km. ${DELIVERY_TIME.courier} más lejos.`}</p>
        </details>
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
