'use client'

import Image from 'next/image'
import { useEffect } from 'react'
import { Minus, Plus, ShieldCheck, Trash2, Truck, X } from 'lucide-react'
import { useCart } from './cart-provider'
import { FREE_SHIPPING_THRESHOLD } from '@/lib/catalog'
import { buildOrderMessage, describeItem } from '@/lib/order'
import { formatCLP, whatsappLink } from '@/lib/store'

export function CartDrawer() {
  const { items, total, isOpen, close, updateQuantity, remove } = useCart()

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, close])

  if (!isOpen) return null

  const missing = Math.max(0, FREE_SHIPPING_THRESHOLD - total)
  const progress = Math.min(100, (total / FREE_SHIPPING_THRESHOLD) * 100)

  return (
    <div className="fixed inset-0 z-[60]">
      <button
        type="button"
        aria-label="Cerrar carrito"
        className="absolute inset-0 bg-foreground/40"
        onClick={close}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-background shadow-2xl animate-in slide-in-from-right"
      >
        <header className="flex items-center justify-between border-b px-5 py-4">
          <h2 id="cart-title" className="font-serif text-xl">
            Tu pedido
          </h2>
          <button
            type="button"
            onClick={close}
            className="rounded-full p-2 hover:bg-muted"
            aria-label="Cerrar carrito"
          >
            <X className="size-5" />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <p className="font-serif text-lg">Tu carrito está vacío</p>
            <p className="text-sm text-muted-foreground">
              Explora nuestros kits o pídele a Flor una recomendación.
            </p>
          </div>
        ) : (
          <>
            <div className="border-b bg-secondary px-5 py-3 text-sm">
              <p className="flex items-center gap-2 font-medium text-secondary-foreground">
                <Truck className="size-4" aria-hidden />
                {missing > 0
                  ? `Te faltan ${formatCLP(missing)} para envío gratis en Iquique`
                  : '¡Tienes envío gratis en Iquique y Alto Hospicio!'}
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background" aria-hidden>
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <ul className="flex-1 divide-y overflow-y-auto px-5">
              {items.map((item) => (
                <li key={item.key} className="flex gap-4 py-4">
                  <Image
                    src={item.image || '/placeholder.svg'}
                    alt=""
                    width={80}
                    height={80}
                    className="size-20 rounded-lg object-cover"
                  />
                  <div className="flex flex-1 flex-col gap-1">
                    <p className="font-medium leading-tight">{item.name}</p>
                    {describeItem(item) && <p className="text-xs text-muted-foreground">{describeItem(item)}</p>}
                    {item.giftMessage && (
                      <p className="text-xs italic text-muted-foreground">{`Tarjeta: "${item.giftMessage}"`}</p>
                    )}
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center rounded-full border">
                        <button
                          type="button"
                          className="p-1.5"
                          aria-label={`Restar una unidad de ${item.name}`}
                          onClick={() => updateQuantity(item.key, item.quantity - 1)}
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="w-6 text-center text-sm tabular-nums">{item.quantity}</span>
                        <button
                          type="button"
                          className="p-1.5"
                          aria-label={`Sumar una unidad de ${item.name}`}
                          onClick={() => updateQuantity(item.key, item.quantity + 1)}
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                      <span className="font-semibold tabular-nums">{formatCLP(item.unitPrice * item.quantity)}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(item.key)}
                    className="self-start p-1 text-muted-foreground hover:text-destructive"
                    aria-label={`Eliminar ${item.name}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>

            <footer className="flex flex-col gap-3 border-t px-5 py-4">
              <div className="flex items-center justify-between text-lg">
                <span>Total</span>
                <span className="font-semibold tabular-nums">{formatCLP(total)}</span>
              </div>
              <a
                href={whatsappLink(buildOrderMessage(items))}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center rounded-full bg-cta px-6 py-3.5 font-semibold text-cta-foreground transition hover:brightness-110"
              >
                Confirmar pedido por WhatsApp
              </a>
              <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="size-3.5" aria-hidden />
                Pago 100% seguro · Gloria confirma tu pedido personalmente
              </p>
            </footer>
          </>
        )}
      </aside>
    </div>
  )
}
