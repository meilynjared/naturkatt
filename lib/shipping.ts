import { FREE_SHIPPING_THRESHOLD } from './catalog'
import { formatCLP } from './store'

/**
 * Envíos dentro de la Región de Tarapacá.
 * El costo depende de la distancia por calle entre el local de Gloria y la dirección de entrega:
 * - Hasta 30 km (Iquique y Alto Hospicio): reparto de Gloria en 24 h, gratis en compras desde $30.000.
 * - Más lejos (Pozo Almonte, Huara, Pica, Camiña, Colchane): por courier (Starken, Chilexpress o Correos de Chile).
 * Los tramos se definieron con precios de referencia de tiendas de Iquique (Iquique ↔ Alto Hospicio ≈ $3.500),
 * de couriers del mismo día (≈ $2.900 por paquete pequeño) y de couriers regionales ($3.000 a $8.000 por paquete pequeño,
 * más caro en el norte y con recargo en zonas rurales).
 */


/** Comunas de la Región de Tarapacá, con el centro de cada una para abrir el mapa cuando la dirección no se encuentra. */
export const TARAPACA_COMMUNES = {
  Iquique: { lat: -20.214, lon: -70.1524 },
  'Alto Hospicio': { lat: -20.2672, lon: -70.103 },
  'Pozo Almonte': { lat: -20.2597, lon: -69.7862 },
  Huara: { lat: -19.9959, lon: -69.7707 },
  Pica: { lat: -20.4912, lon: -69.3292 },
  Camiña: { lat: -19.313, lon: -69.4267 },
  Colchane: { lat: -19.2754, lon: -68.6396 },
} as const

export type Commune = keyof typeof TARAPACA_COMMUNES
export const COMMUNES = Object.keys(TARAPACA_COMMUNES) as Commune[]
export const isCommune = (city: string): city is Commune => city in TARAPACA_COMMUNES

/** Comunas con reparto propio de Gloria (y envío gratis desde $30.000). */
export const LOCAL_COMMUNES: Commune[] = ['Iquique', 'Alto Hospicio']

/** Rectángulo que contiene la Región de Tarapacá. */
export const REGION_AREA = { south: -21.65, north: -18.93, west: -70.35, east: -68.38 }
export function inRegion(lat: number, lon: number) {
  return lat >= REGION_AREA.south && lat <= REGION_AREA.north && lon >= REGION_AREA.west && lon <= REGION_AREA.east
}

export type Carrier = 'gloria' | 'courier'

/**
 * Retiro gratis en el punto de retiro de Gloria. Ella trabaja desde su casa, así que la página no muestra el número exacto:
 * se lo entrega a cada clienta por WhatsApp al coordinar el día y la hora.
 */
export const PICKUP = {
  title: 'Retiro gratis en Alto Hospicio',
  place: 'Punto de retiro de Gloria · Alto Hospicio, sector Av. Esmeralda',
  howTo: 'Coordinas el día y la hora con Gloria por WhatsApp; ella te confirma la dirección exacta. Tu pedido queda listo desde 24 h hábiles después del pago.',
}

/** Tramos por distancia en kilómetros por calle desde el local. */
export const SHIPPING_TIERS = [
  { upToKm: 3, price: 1500, carrier: 'gloria', zone: 'Alto Hospicio, sector Av. Esmeralda' },
  { upToKm: 6, price: 2000, carrier: 'gloria', zone: 'Alto Hospicio' },
  { upToKm: 10, price: 2500, carrier: 'gloria', zone: 'Alto Hospicio lejano y bajada a Iquique' },
  { upToKm: 14, price: 3500, carrier: 'gloria', zone: 'Iquique centro y norte' },
  { upToKm: 18, price: 4000, carrier: 'gloria', zone: 'Iquique sur (Cavancha, Playa Brava)' },
  { upToKm: 22, price: 4500, carrier: 'gloria', zone: 'Iquique extremo sur (Bajo Molle)' },
  { upToKm: 30, price: 5000, carrier: 'gloria', zone: 'Sectores alejados de Iquique y Alto Hospicio' },
  { upToKm: 60, price: 5990, carrier: 'courier', zone: 'Pozo Almonte, La Tirana' },
  { upToKm: 100, price: 6990, carrier: 'courier', zone: 'Huara, Pisagua, costa sur de Iquique' },
  { upToKm: 150, price: 7990, carrier: 'courier', zone: 'Pica, Matilla' },
  { upToKm: 200, price: 9490, carrier: 'courier', zone: 'Camiña' },
  { upToKm: 320, price: 10990, carrier: 'courier', zone: 'Colchane y altiplano' },
] as const satisfies readonly { upToKm: number; price: number; carrier: Carrier; zone: string }[]

export const DELIVERY_TIME: Record<Carrier, string> = {
  gloria: 'Reparto de Gloria en 24 h hábiles',
  courier: 'Por courier (Starken, Chilexpress o Correos de Chile) en 2 a 5 días hábiles',
}

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
  carrier: Carrier | null
  /** Valor del tramo, antes de aplicar el envío gratis. */
  tierPrice: number | null
  /** Lo que se cobra en Webpay. */
  fee: number
  free: boolean
  /** Fuera de la Región de Tarapacá: Gloria coordina el envío y su valor. */
  outsideArea: boolean
}

export function tierFor(km: number) {
  return SHIPPING_TIERS.find((t) => km <= t.upToKm) ?? null
}

export function shippingQuote(subtotal: number, route: RouteQuote): ShippingQuote {
  const tier = tierFor(route.km)
  const free = !!tier && tier.carrier === 'gloria' && subtotal >= FREE_SHIPPING_THRESHOLD
  return {
    ...route,
    carrier: tier?.carrier ?? null,
    tierPrice: tier?.price ?? null,
    outsideArea: !tier,
    free,
    fee: tier && !free ? tier.price : 0,
  }
}

export function formatKm(km: number) {
  return `${km.toLocaleString('es-CL', { maximumFractionDigits: 1, minimumFractionDigits: km < 10 ? 1 : 0 })} km`
}

export function shippingSummary(q: ShippingQuote) {
  if (q.outsideArea) return 'Fuera de la zona de envío: Gloria te confirma el valor'
  if (q.free) return 'Gratis'
  return formatCLP(q.fee)
}

export function googleMapsLink(lat: number, lon: number) {
  return `https://www.google.com/maps/search/?api=1&query=${lat.toFixed(6)},${lon.toFixed(6)}`
}
