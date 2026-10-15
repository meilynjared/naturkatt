'use client'

import Link from 'next/link'
import { Leaf, ShoppingBag } from 'lucide-react'
import { useCart } from './cart-provider'

const nav = [
  { href: '/#kits', label: 'Kits de regalo' },
  { href: '/#productos', label: 'Productos' },
  { href: '/#resenas', label: 'Reseñas' },
  { href: '/#gloria', label: 'Sobre Gloria' },
]

export function SiteHeader() {
  const { count, open } = useCart()
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="bg-primary px-4 py-2 text-center text-xs font-medium text-primary-foreground sm:text-sm">
        Envío gratis en Iquique y Alto Hospicio sobre $30.000 · Despacho a todo Chile
      </div>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Leaf className="size-5" aria-hidden />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-serif text-xl font-semibold tracking-tight">NaturKatt</span>
            <span className="text-xs text-muted-foreground">Consultora Natura Gloria</span>
          </span>
        </Link>
        <nav aria-label="Principal" className="hidden md:block">
          <ul className="flex items-center gap-6 text-sm">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-muted-foreground transition hover:text-foreground">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <button
          type="button"
          onClick={open}
          className="relative flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm font-medium transition hover:bg-muted"
        >
          <ShoppingBag className="size-4" aria-hidden />
          <span>Carrito</span>
          {count > 0 && (
            <span className="flex size-5 items-center justify-center rounded-full bg-cta text-xs text-cta-foreground">
              {count}
              <span className="sr-only"> productos</span>
            </span>
          )}
        </button>
      </div>
    </header>
  )
}
