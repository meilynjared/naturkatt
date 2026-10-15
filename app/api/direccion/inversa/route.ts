import { reverseGeocode } from '@/lib/geo-server'
import { inRegion } from '@/lib/shipping'

export const runtime = 'nodejs'

/** Sugiere la dirección (calle y número) de un punto marcado en el mapa. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { lat?: unknown; lon?: unknown } | null
  const lat = Number(body?.lat)
  const lon = Number(body?.lon)
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return Response.json({ error: 'Ubicación inválida.' }, { status: 400 })
  }
  if (!inRegion(lat, lon)) return Response.json({ outsideRegion: true })
  const result = await reverseGeocode(lat, lon)
  return Response.json(result ?? { address: '', label: '', commune: '' })
}
