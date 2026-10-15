import { COMMUNES, REGION_AREA, type DeliveryLocation, type RouteQuote } from './shipping'

/**
 * Punto desde donde despacha Gloria (su casa en Alto Hospicio). Solo se usa en el servidor para medir distancias:
 * no se muestra en la página ni se envía al navegador.
 */
const STORE_LOCATION = { lat: -20.266411, lon: -70.107505 }

/**
 * Búsqueda de direcciones y distancias con servicios gratuitos de OpenStreetMap (no requieren clave ni tarjeta):
 * - Nominatim para encontrar la dirección (y Photon como respaldo).
 * - OSRM para la distancia por calle desde el local.
 * Se consultan solo desde el servidor, con caché, y respetando sus políticas de uso (1 consulta por segundo e identificación).
 */

const USER_AGENT = 'NaturKatt/1.0 (tienda online de Gloria Rios, https://naturkatt.vercel.app)'
const TIMEOUT_MS = 5000

const cache = new Map<string, unknown>()
function remember<T>(key: string, value: T) {
  if (cache.size > 500) cache.delete(cache.keys().next().value as string)
  cache.set(key, value)
  return value
}

let lastNominatimCall = 0
async function politeDelay() {
  const wait = lastNominatimCall + 1100 - Date.now()
  lastNominatimCall = Math.max(Date.now(), lastNominatimCall + 1100)
  if (wait > 0) await new Promise((r) => setTimeout(r, wait))
}

async function getJson(url: string) {
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'es' },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`${new URL(url).host} respondió ${res.status}`)
  return res.json()
}

export type GeocodeResult = DeliveryLocation & { commune: string }
export type GeocodeOutcome =
  | { status: 'ok'; result: GeocodeResult }
  | { status: 'otra-comuna'; result: GeocodeResult }
  | { status: 'no-encontrada' }
  | { status: 'sin-servicio' }

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()

/** Quita depto, casa, block, etc., que confunden al buscador; Gloria los ve igual en el pedido. */
export function streetPart(address: string) {
  return address
    .replace(/#/g, ' ')
    .replace(/[,;]?\s*\b(depto|dpto|dto|departamento|depa|casa|block|blk|torre|piso|oficina|of|local|condominio|villa)\b.*$/i, '')
    .replace(/\s+/g, ' ')
    .trim()
}

type NominatimItem = {
  lat: string
  lon: string
  display_name: string
  address?: Record<string, string>
}

/** Comuna de Tarapacá a la que pertenece el resultado, si el buscador la informa (en pueblos pequeños a veces no viene). */
function communeOf(address: Record<string, string> = {}) {
  for (const value of [address.city, address.town, address.village, address.municipality]) {
    const match = value && COMMUNES.find((c) => normalize(c) === normalize(value))
    if (match) return match
  }
  return ''
}

function placeOf(address: Record<string, string> = {}) {
  return address.city || address.town || address.village || address.hamlet || address.municipality || ''
}

function shortLabel(address: Record<string, string> = {}, fallback: string) {
  const street = address.road || address.pedestrian || address.footway || address.residential || ''
  const parts = [street && address.house_number ? `${street} ${address.house_number}` : street, address.suburb || address.neighbourhood, placeOf(address)]
  const label = parts.filter(Boolean).join(', ')
  return label || fallback.split(',').slice(0, 3).join(',')
}

async function nominatim(street: string, city: string): Promise<GeocodeResult[]> {
  const base = 'https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=5&countrycodes=cl'
  const area = `&viewbox=${REGION_AREA.west},${REGION_AREA.north},${REGION_AREA.east},${REGION_AREA.south}&bounded=1`
  const attempts = [
    `${base}${area}&street=${encodeURIComponent(street)}&city=${encodeURIComponent(city)}`,
    `${base}${area}&q=${encodeURIComponent(`${street}, ${city}, Tarapacá, Chile`)}`,
  ]
  for (const url of attempts) {
    await politeDelay()
    const items = (await getJson(url)) as NominatimItem[]
    if (items.length > 0) {
      return items.map((i) => ({
        lat: Number(i.lat),
        lon: Number(i.lon),
        label: shortLabel(i.address, i.display_name),
        commune: communeOf(i.address),
        precision: i.address?.house_number ? 'exacta' : 'calle',
      }))
    }
  }
  return []
}

type PhotonFeature = {
  geometry: { coordinates: [number, number] }
  properties: Record<string, string>
}

async function photon(street: string, city: string): Promise<GeocodeResult[]> {
  const bbox = `&bbox=${REGION_AREA.west},${REGION_AREA.south},${REGION_AREA.east},${REGION_AREA.north}`
  const data = (await getJson(
    `https://photon.komoot.io/api/?limit=5${bbox}&q=${encodeURIComponent(`${street}, ${city}, Chile`)}`,
  )) as { features: PhotonFeature[] }
  return data.features
    .filter((f) => f.properties.countrycode === 'CL')
    .map((f) => {
      const p = f.properties
      const streetName = p.street || p.name || ''
      const place = p.city || p.locality || p.county || ''
      const commune = COMMUNES.find((c) => [p.city, p.locality, p.county].some((v) => v && normalize(v) === normalize(c))) ?? ''
      return {
        lon: f.geometry.coordinates[0],
        lat: f.geometry.coordinates[1],
        label: [p.housenumber ? `${streetName} ${p.housenumber}` : streetName, p.district, place].filter(Boolean).join(', '),
        commune,
        precision: p.housenumber ? 'exacta' : 'calle',
      }
    })
}

/** Busca la dirección en la comuna elegida, dentro de la Región de Tarapacá. */
export async function geocodeAddress(address: string, city: string): Promise<GeocodeOutcome> {
  const street = streetPart(address)
  const key = `geo:${normalize(street)}|${normalize(city)}`
  if (cache.has(key)) return cache.get(key) as GeocodeOutcome

  let results: GeocodeResult[] | null = null
  for (const provider of [nominatim, photon]) {
    try {
      results = await provider(street, city)
      if (results.length > 0) break
    } catch (error) {
      console.error('Buscador de direcciones no disponible', error)
    }
  }
  if (results === null) return { status: 'sin-servicio' } // no se guarda en caché: puede ser una caída momentánea
  if (results.length === 0) return remember(key, { status: 'no-encontrada' } as GeocodeOutcome)

  // Se prefiere un resultado en la comuna elegida (o sin comuna informada) y, dentro de ellos, uno con el número de la casa.
  // Solo se avisa "otra comuna" si el buscador dice claramente que la dirección está en otra comuna de Tarapacá.
  const sameCommune = results.filter((r) => !r.commune || normalize(r.commune) === normalize(city))
  const pool = sameCommune.length > 0 ? sameCommune : results
  const best = pool.find((r) => r.precision === 'exacta') ?? pool[0]
  const outcome: GeocodeOutcome = sameCommune.length > 0 ? { status: 'ok', result: best } : { status: 'otra-comuna', result: best }
  return remember(key, outcome)
}

/** Distancia por calle desde el local. Si el servicio de rutas no responde, se usa una estimación. */
export async function routeFromStore(lat: number, lon: number): Promise<RouteQuote> {
  const key = `route:${lat.toFixed(5)},${lon.toFixed(5)}`
  if (cache.has(key)) return cache.get(key) as RouteQuote
  try {
    const data = (await getJson(
      `https://router.project-osrm.org/route/v1/driving/${STORE_LOCATION.lon},${STORE_LOCATION.lat};${lon},${lat}?overview=false`,
    )) as { code: string; routes?: { distance: number }[] }
    const meters = data.routes?.[0]?.distance
    if (data.code === 'Ok' && typeof meters === 'number') {
      return remember(key, { km: Math.round(meters / 100) / 10, method: 'ruta' } as RouteQuote)
    }
  } catch (error) {
    console.error('Servicio de rutas no disponible; se usa la distancia estimada.', error)
  }
  return { km: estimatedRoadKm(lat, lon), method: 'estimada' }
}

/** Distancia en línea recta (km). */
function haversineKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const R = 6371
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLon = toRad(b.lon - a.lon)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

/**
 * Distancia aproximada por calle cuando el servicio de rutas no responde.
 * Bajar de Alto Hospicio a Iquique obliga a tomar la Ruta A-16, así que el recorrido real es mucho más largo que la línea recta
 * (local → Plaza Prat: 7,5 km en línea recta y 12,9 km por calle). Hacia el interior la ruta es más directa
 * (local → Pozo Almonte: 33,6 km en línea recta y 44,6 km por calle).
 */
export function estimatedRoadKm(lat: number, lon: number) {
  const straight = haversineKm(STORE_LOCATION, { lat, lon })
  const downToIquique = lon < -70.122 && straight < 25
  return Math.round(straight * (downToIquique ? 1.75 : 1.35) * 10) / 10
}
