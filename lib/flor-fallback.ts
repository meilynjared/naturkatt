import { FREE_SHIPPING_THRESHOLD, GIFT_WRAP_PRICE, getProduct, products, type Product } from './catalog'
import { formatCLP, WHATSAPP_DISPLAY } from './store'

/**
 * Respuestas de respaldo de Flor.
 * Se usan cuando el modelo de IA no responde (por ejemplo, si el servicio de IA no está disponible),
 * para que la asistente siempre ayude con información real del catálogo y de las políticas de la tienda.
 */

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')

const has = (text: string, ...words: string[]) => words.some((w) => text.includes(w))

function line(p: Product, extra?: string) {
  return `• ${p.name} — ${formatCLP(p.price)}: ${extra ?? p.short}`
}

function bySlug(...slugs: string[]) {
  return slugs.map((s) => getProduct(s)).filter((p): p is Product => Boolean(p))
}

const HOW_TO_BUY =
  'Para comprar, abre el producto, elige tus opciones y presiona "Comprar ahora": completas tus datos de entrega y pagas con Webpay.'
const OFFER_GLORIA = `Si prefieres, Gloria te atiende por WhatsApp al ${WHATSAPP_DISPLAY}.`

function parseBudget(text: string): number | null {
  const m = text.match(/\$?\s*(\d{1,3}(?:[.\s]\d{3})+|\d+)\s*(mil|lucas|luca|k)?/)
  if (!m) return null
  let value = Number(m[1].replace(/[.\s]/g, ''))
  if (m[2] || value < 1000) value *= 1000
  return value >= 5000 && value <= 500000 ? value : null
}

export function florFallbackReply(rawText: string): string {
  const t = normalize(rawText || '')

  if (has(t, 'reclamo', 'factura', 'mayorista', 'hablar con gloria', 'persona real', 'humano')) {
    return `Claro, eso lo ve Gloria personalmente. Escríbele por WhatsApp al ${WHATSAPP_DISPLAY} o usa el botón "Prefiero hablar con Gloria" aquí abajo.`
  }

  if (has(t, 'alergi', 'embaraz', 'irrit', 'herida', 'reaccion', 'dermat')) {
    return `Por tu seguridad, ante alergias, embarazo o reacciones en la piel te recomiendo consultar a un profesional de salud antes de usar un producto nuevo. ${OFFER_GLORIA}`
  }

  if (has(t, 'pag', 'webpay', 'tarjeta', 'transferencia', 'efectivo', 'cuota', 'debito', 'credito')) {
    return [
      'Puedes pagar con Webpay (débito, crédito o prepago) directamente en la tienda, en el sitio seguro de Transbank: NaturKatt nunca ve los datos de tu tarjeta.',
      'Si prefieres transferencia o efectivo contra entrega en Iquique y Alto Hospicio, lo coordinas con Gloria por WhatsApp.',
      '¿Te ayudo a elegir un producto?',
    ].join('\n')
  }

  if (has(t, 'envio', 'envia', 'despacho', 'demora', 'llega', 'entrega', 'courier', 'region', 'santiago', 'antofagasta', 'fuera de iquique')) {
    return [
      `En Iquique y Alto Hospicio entregamos en 24 horas hábiles, gratis en compras sobre ${formatCLP(FREE_SHIPPING_THRESHOLD)}. Bajo ese monto, el envío se calcula al pagar según la distancia desde el local en Alto Hospicio (desde $1.500).`,
      'Al resto de Chile enviamos por courier en 2 a 5 días hábiles con seguimiento; Gloria te confirma el costo según tu comuna.',
      '¿Quieres que te recomiende algo?',
    ].join('\n')
  }

  if (has(t, 'devol', 'cambio', 'cambiar', 'no le gusta', 'no me gusta', 'garantia')) {
    return 'Tienes 30 días para cambios o devoluciones gratuitas si el producto está sin uso o llegó con algún problema. ¿Te ayudo con algo más?'
  }

  if (has(t, 'original', 'vencimiento', 'falsific', 'sellado')) {
    return 'Sí, todos los productos son originales y llegan sellados, con su fecha de vencimiento visible. ¿Buscas algo en particular?'
  }

  if (has(t, 'como compro', 'como comprar', 'quiero comprar', 'hacer un pedido', 'como pido')) {
    return `${HOW_TO_BUY} Después le envías el comprobante a Gloria por WhatsApp y ella coordina la entrega.`
  }

  const budget = parseBudget(t)
  if (budget) {
    const options = [...products]
      .filter((p) => p.price <= budget)
      .sort((a, b) => (a.category === b.category ? b.price - a.price : a.category === 'kit' ? -1 : 1))
      .slice(0, 2)
    if (options.length === 0) {
      return `Con ${formatCLP(budget)} te recomiendo el ${line(getProduct('labial-hidratante')!).slice(2)} ${OFFER_GLORIA}`
    }
    return [`Con un presupuesto de ${formatCLP(budget)} te recomiendo:`, ...options.map((p) => line(p)), HOW_TO_BUY].join('\n')
  }

  if (has(t, 'bebe', 'baby', 'guagua', 'recien nacid')) {
    return [line(getProduct('kit-mama-y-bebe')!, 'shampoo, crema y colonia suave, con opción sin perfume.'), HOW_TO_BUY].join('\n')
  }

  if (has(t, 'hombre', 'papa', 'padre', 'esposo', 'novio', 'pololo', 'masculin')) {
    return ['Para él te recomiendo:', ...bySlug('kit-regalo-masculino', 'colonia-madera-urbana').map((p) => line(p)), HOW_TO_BUY].join('\n')
  }

  if (has(t, 'grasa', 'mixta', 'brillo', 'acne', 'espinilla')) {
    return [
      'Para piel mixta a grasa te recomiendo:',
      line(getProduct('kit-rutina-facial-botanica')!, 'limpiador, sérum e hidratante; elige la opción "Mixta a grasa".'),
      line(getProduct('serum-vitamina-c')!),
      '¿Es para ti o para regalar?',
    ].join('\n')
  }

  if (has(t, 'sensible')) {
    return [line(getProduct('kit-rutina-facial-botanica')!, 'rutina completa en 3 pasos; elige la opción "Sensible".'), OFFER_GLORIA].join('\n')
  }

  if (has(t, 'seca', 'sol', 'reseca', 'hidrat', 'nutri')) {
    return [
      'Para piel seca o castigada por el sol te recomiendo:',
      ...bySlug('kit-cuidado-corporal-castana', 'crema-corporal-castana').map((p) => line(p)),
      '¿Quieres que te ayude con algo más?',
    ].join('\n')
  }

  if (has(t, 'perfume', 'aroma', 'fragancia', 'colonia', 'dure', 'fijacion', 'oler')) {
    return [
      'Para un aroma que dure todo el día te recomiendo:',
      line(getProduct('kit-regalo-perfume')!, 'perfume floral 100 ml + crema corporal perfumada; fijación de 6 a 8 horas.'),
      line(getProduct('perfume-floral-amazonico')!),
      '¿Es para ti o para regalar?',
    ].join('\n')
  }

  if (has(t, 'spa', 'relaj', 'vela', 'exfoli')) {
    return [line(getProduct('kit-spa-en-casa-maracuya')!), HOW_TO_BUY].join('\n')
  }

  if (has(t, 'labial', 'maquillaje', 'labio')) {
    return [line(getProduct('labial-hidratante')!), HOW_TO_BUY].join('\n')
  }

  if (has(t, 'regalo', 'regalar', 'mama', 'madre', 'cumple', 'amiga', 'aniversario', 'sorpresa')) {
    return [
      'Para regalar, estos kits llegan listos y con ahorro:',
      ...bySlug('kit-regalo-perfume', 'kit-cuidado-corporal-castana').map((p) => line(p)),
      `Puedes agregar envoltorio con tarjeta escrita por ${formatCLP(GIFT_WRAP_PRICE)}. ¿Le gustan más los perfumes o el cuidado de la piel?`,
    ].join('\n')
  }

  if (has(t, 'hola', 'buenas', 'buenos dias', 'buenas tardes', 'que tal')) {
    return '¡Hola! Te ayudo a elegir. ¿El producto es para ti o para regalar?'
  }

  return [
    'Te puedo ayudar a elegir un regalo, recomendarte algo según tu tipo de piel o resolver dudas de pago, envío y devoluciones.',
    '¿Para quién es y cuánto quieres gastar más o menos?',
    OFFER_GLORIA,
  ].join('\n')
}
