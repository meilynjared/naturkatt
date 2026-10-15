import type { Metadata } from 'next'
import { CheckoutForm } from '@/components/checkout-form'
import { SiteFooter } from '@/components/faq-footer'
import { SiteHeader } from '@/components/site-header'
import { WEBPAY_IS_PRODUCTION } from '@/lib/webpay'

export const metadata: Metadata = {
  title: 'Pagar pedido | NaturKatt',
  robots: { index: false },
}

export default function CheckoutPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <CheckoutForm testMode={!WEBPAY_IS_PRODUCTION} />
      </main>
      <SiteFooter />
    </>
  )
}
