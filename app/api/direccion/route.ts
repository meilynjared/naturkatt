import { geocodeAddress } from '@/lib/geo-server'
import { isLocalCity } from '@/lib/shipping'

export const runtime = 'nodejs'

/** Verifica que la dirección de entrega exista y devuelve su ubicación en el mapa. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { address?: unknown; city?: unknown } | null
  const address = typeof body?.address === 'string' ? body.address.trim().slice(0, 160) : ''
  const city = typeof body?.city === 'string' ? body.city.trim().slice(0, 60) : ''
  if (address.length < 4 || city.length < 3) {
    return Response.json({ error: 'Escribe la calle, el número y la ciudad.' }, { status: 400 })
  }
  const outcome = await geocodeAddress(address, city, isLocalCity(city))
  return Response.json(outcome)
}
