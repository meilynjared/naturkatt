import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Fraunces, Inter } from 'next/font/google'
import { CartProvider } from '@/components/cart-provider'
import { CartDrawer } from '@/components/cart-drawer'
import { FloatingContact } from '@/components/floating-contact'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces' })

export const metadata: Metadata = {
  metadataBase: new URL('https://naturkatt.vercel.app'),
  title: 'NaturKatt | Consultora Natura Gloria — Cosmética botánica en Iquique',
  description:
    'Kits de regalo, perfumes y cuidado facial y corporal con envío rápido en Iquique, Alto Hospicio y toda la Región de Tarapacá. Atención personalizada de Gloria Ríos Marambio y la asistente virtual Flor.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  themeColor: '#e0b0ff',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${fraunces.variable}`} data-scroll-behavior="smooth">
      <body className="antialiased">
        <CartProvider>
          {children}
          <CartDrawer />
          <FloatingContact />
        </CartProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
