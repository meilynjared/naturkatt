import { priceOrder } from '@/lib/order'
import { newBuyOrder, webpayTransaction } from '@/lib/webpay'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  let body: { lines?: unknown }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Solicitud inválida.' }, { status: 400 })
  }

  // El precio se recalcula aquí con el catálogo: nunca se confía en el monto que envía el navegador.
  const priced = priceOrder(body.lines)
  if ('error' in priced) return Response.json({ error: priced.error }, { status: 400 })

  const buyOrder = newBuyOrder()
  const sessionId = crypto.randomUUID()
  const returnUrl = `${new URL(req.url).origin}/api/webpay/retorno`

  try {
    const { token, url } = await webpayTransaction().create(buyOrder, sessionId, priced.total, returnUrl)
    return Response.json({ token, url, buyOrder, lines: priced.lines, total: priced.total })
  } catch (error) {
    console.error('Webpay create error', error)
    return Response.json(
      { error: 'No pudimos conectar con Webpay. Intenta de nuevo en unos segundos.' },
      { status: 502 },
    )
  }
}
