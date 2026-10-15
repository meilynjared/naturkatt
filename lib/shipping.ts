import { FREE_SHIPPING_THRESHOLD } from './catalog'
import { formatCLP } from './store'

/**
 * Envío a domicilio en Iquique y Alto Hospicio.
 * El costo depende de la distancia por calle entre el local de Gloria y la dirección de entrega,
 * y es gratis en compras desde $30.000. Los tramos se definieron con precios de referencia de
 * tiendas locales (Iquique ↔ Alto Hospicio ≈ $3.500) y de couriers del mismo día (≈ $2.900 por paquete pequeño).
 */

export const STORE_LOCATION = {
  label: 'Av. Esmeralda 2872, Alto Hospicio',
  lat: -20.266411,
  lon: -70.107505,
}

export const LOCAL_CITIES = ['Iquique', 'Alto Hospicio'] as const
export type LocalCity = (typeof LOCAL_CITIES)[number]
export const isLocalCity = (city: string): city is LocalCity => (LOCAL_CITIES as readonly string[]).includes(city)

/** Centro de cada comuna, para abrir el mapa cuando la dirección no se encuentra. */
export const CITY_CENTER: Record<LocalCity, { lat: number; lon: number }> = {
  Iquique: { lat: -20.2140, lon: -70.1524 },
  'Alto Hospicio': { lat: STORE_LOCATION.lat, lon: STORE_LOCATION.lon },
}

/** Zona de reparto de Gloria (Iquique y Alto Hospicio urbanos). */
export const SERVICE_AREA = { south: -20.36, north: -20.15, west: -70.2, east: -70.04 }
export function inServiceArea(lat: number, lon: number) {
  return lat >= SERVICE_AREA.south && lat <= SERVICE_AREA.north && lon >= SERVICE_AREA.west && lon <= SERVICE_AREA.east
}

/** Tramos por distancia en kilómetros por calle desde el local. */
export const SHIPPING_TIERS = [
  { upToKm: 3, price: 1500, zone: 'Alto Hospicio, cerca del local' },
  { upToKm: 6, price: 2000, zone: 'Alto Hospicio' },
  { upToKm: 10, price: 2500, zone: 'Alto Hospicio lejano y bajada a Iquique' },
  { upToKm: 14, price: 3500, zone: 'Iquique centro y norte' },
  { upToKm: 18, price: 4000, zone: 'Iquique sur (Cavancha, Playa Brava)' },
  { upToKm: 22, price: 4500, zone: 'Iquique extremo sur (Bajo Molle)' },
  { upToKm: 30, price: 5000, zone: 'Sectores alejados' },
] as const

export const MAX_LOCAL_KM = SHIPPING_TIERS[SHIPPING_TIERS.length - 1].upToKm

export type DeliveryLocation = {
  lat: number
  lon: number
  /** Dirección tal como la encontró el buscador de mapas. */
  label: string
  /** exacta: se encontró el número · calle: solo la calle, falta confirmar el punto · manual: la clienta marcó el punto en el mapa */
  precision: 'exacta' | 'calle' | 'manual'
}

export type RouteQuote = {
  km: number
  /** ruta: distancia por calle calculada con OpenStreetMap · estimada: aproximación si el servicio de rutas no responde */
  method: 'ruta' | 'estimada'
}

export type ShippingQuote = RouteQuote & {
  /** Valor del tramo, antes de aplicar el envío gratis. */
  tierPrice: number | null
  /** Lo que se cobra en Webpay. */
  fee: number
  free: boolean
  /** Fuera de la zona de reparto: Gloria coordina el envío y su valor. */
  outsideArea: boolean
}

export function tierFor(km: number) {
  return SHIPPING_TIERS.find((t) => km <= t.upToKm) ?? null
}

export function shippingQuote(subtotal: number, route: RouteQuote): ShippingQuote {
  const tier = tierFor(route.km)
  const free = subtotal >= FREE_SHIPPING_THRESHOLD
  return {
    ...route,
    tierPrice: tier?.price ?? null,
    outsideArea: !tier,
    free: free && !!tier,
    fee: tier && !free ? tier.price : 0,
  }
}

export function formatKm(km: number) {
  return `${km.toLocaleString('es-CL', { maximumFractionDigits: 1, minimumFractionDigits: km < 10 ? 1 : 0 })} km`
}

export function shippingSummary(q: ShippingQuote) {
  if (q.outsideArea) return 'Fuera de la zona de reparto: Gloria te confirma el valor'
  if (q.free) return 'Gratis'
  return formatCLP(q.fee)
}

export function googleMapsLink(lat: number, lon: number) {
  return `https://www.google.com/maps/search/?api=1&query=${lat.toFixed(6)},${lon.toFixed(6)}`
}

/** Distancia en línea recta (km). */
export function haversineKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
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
 * (local → Plaza Prat: 7,5 km en línea recta y 12,9 km por calle).
 */
export function estimatedRoadKm(lat: number, lon: number) {
  const straight = haversineKm(STORE_LOCATION, { lat, lon })
  const belowCliff = lon < -70.122
  return Math.round(straight * (belowCliff ? 1.75 : 1.35) * 10) / 10
}
