import { routeFromStore } from '@/lib/geo-server'
import { DELIVERY_CITIES, priceOrder, type OrderShipping } from '@/lib/order'
import { inRegion, shippingQuote } from '@/lib/shipping'
import { newBuyOrder, webpayTransaction } from '@/lib/webpay'

export const runtime = 'nodejs'

type Delivery = { city?: unknown; lat?: unknown; lon?: unknown }

export async function POST(req: Request) {
  let body: { lines?: unknown; delivery?: Delivery }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Solicitud inválida.' }, { status: 400 })
  }

  // El precio se recalcula aquí con el catálogo: nunca se confía en el monto que envía el navegador.
  const priced = priceOrder(body.lines)
  if ('error' in priced) return Response.json({ error: priced.error }, { status: 400 })

  // El envío también se calcula aquí, con la ubicación verificada de la entrega.
  const city = String(body.delivery?.city ?? '')
  if (!(DELIVERY_CITIES as readonly string[]).includes(city)) {
    return Response.json({ error: 'Elige la comuna de entrega.' }, { status: 400 })
  }
  const lat = Number(body.delivery?.lat)
  const lon = Number(body.delivery?.lon)
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return Response.json({ error: 'Verifica tu dirección en el mapa para calcular el envío.' }, { status: 400 })
  }
  const route = inRegion(lat, lon) ? await routeFromStore(lat, lon) : { km: 9999, method: 'estimada' as const }
  const { fee, km, method, free, outsideArea, carrier } = shippingQuote(priced.total, route)
  const shipping: OrderShipping = { fee, km, method, free, outsideArea, carrier }
  if (outsideArea) {
    return Response.json({ error: 'Por ahora solo enviamos dentro de la Región de Tarapacá. Escríbele a Gloria para coordinar.' }, { status: 400 })
  }

  const subtotal = priced.total
  const total = subtotal + shipping.fee
  const buyOrder = newBuyOrder()
  const sessionId = crypto.randomUUID()
  const returnUrl = `${new URL(req.url).origin}/api/webpay/retorno`

  try {
    const { token, url } = await webpayTransaction().create(buyOrder, sessionId, total, returnUrl)
    return Response.json({ token, url, buyOrder, lines: priced.lines, subtotal, shipping, total })
  } catch (error) {
    console.error('Webpay create error', error)
    return Response.json(
      { error: 'No pudimos conectar con Webpay. Intenta de nuevo en unos segundos.' },
      { status: 502 },
    )
  }
}
