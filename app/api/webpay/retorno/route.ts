import { webpayTransaction } from '@/lib/webpay'

export const runtime = 'nodejs'

/**
 * Transbank devuelve al cliente a esta URL (por GET en la API v1.2; se acepta también POST).
 * - Pago terminado (aprobado o rechazado): llega token_ws.
 * - Cliente anuló en el formulario de Webpay: llegan TBK_TOKEN, TBK_ORDEN_COMPRA y TBK_ID_SESION.
 * - Tiempo agotado: llegan TBK_ORDEN_COMPRA y TBK_ID_SESION, sin token.
 */
async function handle(req: Request, params: URLSearchParams) {
  const origin = new URL(req.url).origin
  const go = (query: Record<string, string>) =>
    Response.redirect(`${origin}/pago/resultado?${new URLSearchParams(query)}`, 303)

  const token = params.get('token_ws')
  const abortedToken = params.get('TBK_TOKEN')
  const order = params.get('TBK_ORDEN_COMPRA') ?? ''

  if (token && !abortedToken) {
    try {
      await webpayTransaction().commit(token)
    } catch (error) {
      // Si ya se había confirmado (por ejemplo, al recargar), la página de resultado consulta el estado igual.
      console.error('Webpay commit error', error)
    }
    return go({ token })
  }

  if (abortedToken) return go({ estado: 'anulado', orden: order })
  if (order) return go({ estado: 'expirado', orden: order })
  return go({ estado: 'error' })
}

export async function GET(req: Request) {
  return handle(req, new URL(req.url).searchParams)
}

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null)
  const params = new URLSearchParams()
  form?.forEach((value, key) => {
    if (typeof value === 'string') params.set(key, value)
  })
  return handle(req, params)
}
