import { Environment, IntegrationApiKeys, IntegrationCommerceCodes, Options, WebpayPlus } from 'transbank-sdk'

/**
 * Webpay Plus de Transbank.
 *
 * Por defecto usa el ambiente de INTEGRACIÓN (pruebas): no se cobra dinero real y se paga con tarjetas de prueba.
 * Para cobrar de verdad, Gloria debe afiliarse a Webpay Plus con Transbank y configurar en Vercel:
 *   WEBPAY_ENV=produccion
 *   WEBPAY_COMMERCE_CODE=<código de comercio entregado por Transbank>
 *   WEBPAY_API_KEY=<llave secreta entregada por Transbank>
 */
export const WEBPAY_IS_PRODUCTION = process.env.WEBPAY_ENV === 'produccion'

export function webpayTransaction() {
  if (WEBPAY_IS_PRODUCTION) {
    const commerceCode = process.env.WEBPAY_COMMERCE_CODE
    const apiKey = process.env.WEBPAY_API_KEY
    if (!commerceCode || !apiKey) {
      throw new Error('Faltan WEBPAY_COMMERCE_CODE o WEBPAY_API_KEY para operar en producción.')
    }
    return new WebpayPlus.Transaction(new Options(commerceCode, apiKey, Environment.Production))
  }
  return new WebpayPlus.Transaction(
    new Options(IntegrationCommerceCodes.WEBPAY_PLUS, IntegrationApiKeys.WEBPAY, Environment.Integration),
  )
}

export type WebpayStatus = {
  status: string
  response_code: number
  amount: number
  buy_order: string
  authorization_code?: string
  payment_type_code?: string
  installments_number?: number
  transaction_date?: string
  card_detail?: { card_number?: string }
}

export function isApproved(s: WebpayStatus) {
  return s.status === 'AUTHORIZED' && s.response_code === 0
}

const PAYMENT_TYPES: Record<string, string> = {
  VD: 'Débito (Redcompra)',
  VP: 'Prepago',
  VN: 'Crédito sin cuotas',
  VC: 'Crédito en cuotas',
  SI: 'Crédito, 3 cuotas sin interés',
  S2: 'Crédito, 2 cuotas sin interés',
  NC: 'Crédito, cuotas sin interés',
}

export function paymentTypeLabel(code?: string) {
  return (code && PAYMENT_TYPES[code]) || 'Tarjeta'
}

/** Orden de compra única de hasta 26 caracteres, como exige Transbank. */
export function newBuyOrder() {
  const time = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `NK-${time}-${random}`
}
