import { routeFromStore } from '@/lib/geo-server'
import { inRegion } from '@/lib/shipping'

export const runtime = 'nodejs'

/** Distancia por calle desde el local de Gloria hasta el punto de entrega. El valor del envío se calcula con lib/shipping.ts. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { lat?: unknown; lon?: unknown } | null
  const lat = Number(body?.lat)
  const lon = Number(body?.lon)
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return Response.json({ error: 'Ubicación inválida.' }, { status: 400 })
  }
  if (!inRegion(lat, lon)) {
    return Response.json({ km: 9999, method: 'estimada' })
  }
  return Response.json(await routeFromStore(lat, lon))
}
