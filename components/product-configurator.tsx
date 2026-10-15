'use client'

import { useState } from 'react'
import { Gift, Minus, Plus, ShoppingBag, Zap } from 'lucide-react'
import { GIFT_WRAP_PRICE, type Product } from '@/lib/catalog'
import { buildOrderMessage, unitPriceFor, type CartItem } from '@/lib/order'
import { formatCLP, whatsappLink } from '@/lib/store'
import { cn } from '@/lib/utils'
import { useCart } from './cart-provider'
import { TrustSeals } from './trust-seals'

const MAX_QUANTITY = 10

export function ProductConfigurator({ product }: { product: Product }) {
  const { add } = useCart()
  const [selections, setSelections] = useState<Record<string, string>>(() =>
    Object.fromEntries(product.options.map((o) => [o.id, o.values[0].label])),
  )
  const [giftWrap, setGiftWrap] = useState(product.category === 'kit')
  const [giftMessage, setGiftMessage] = useState('')
  const [quantity, setQuantity] = useState(1)

  const unitPrice = unitPriceFor(product, selections, giftWrap)
  const total = unitPrice * quantity

  const item: Omit<CartItem, 'key'> = {
    slug: product.slug,
    name: product.name,
    image: product.image,
    unitPrice,
    quantity,
    selections: Object.fromEntries(
      product.options.map((o) => [o.id, `${o.name}: ${selections[o.id]}`]),
    ),
    giftWrap,
    giftMessage: giftWrap ? giftMessage.trim() : '',
  }

  const buyNow = () => {
    const message = buildOrderMessage([{ ...item, key: product.slug }])
    window.open(whatsappLink(message), '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="flex flex-col gap-6">
      {product.options.map((option) => (
        <fieldset key={option.id} className="flex flex-col gap-3">
          <legend className="mb-3 text-sm font-semibold">
            {option.name}
            <span className="font-normal text-muted-foreground">{`: ${selections[option.id]}`}</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {option.values.map((value) => {
              const active = selections[option.id] === value.label
              return (
                <label
                  key={value.label}
                  className={cn(
                    'flex cursor-pointer items-center gap-2 rounded-full border-2 px-4 py-2 text-sm transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring',
                    active ? 'border-primary bg-secondary font-semibold text-primary' : 'border-border bg-card hover:border-primary/40',
                  )}
                >
                  <input
                    type="radio"
                    name={option.id}
                    value={value.label}
                    checked={active}
                    onChange={() => setSelections((s) => ({ ...s, [option.id]: value.label }))}
                    className="sr-only"
                  />
                  {value.swatch && (
                    <span
                      className="size-5 rounded-full border border-foreground/10"
                      style={{ backgroundColor: value.swatch }}
                      aria-hidden
                    />
                  )}
                  {value.label}
                  {value.priceDelta ? (
                    <span className="text-xs text-muted-foreground">{`+${formatCLP(value.priceDelta)}`}</span>
                  ) : null}
                </label>
              )
            })}
          </div>
        </fieldset>
      ))}

      <div className="rounded-xl border bg-card p-4">
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={giftWrap}
            onChange={(e) => setGiftWrap(e.target.checked)}
            className="size-5 accent-[var(--primary)]"
          />
          <Gift className="size-5 text-primary" aria-hidden />
          <span className="flex-1 text-sm font-semibold">Envoltorio de regalo con tarjeta</span>
          <span className="text-sm text-muted-foreground">{`+${formatCLP(GIFT_WRAP_PRICE)}`}</span>
        </label>
        {giftWrap && (
          <div className="mt-3">
            <label htmlFor="gift-message" className="text-xs text-muted-foreground">
              Mensaje para la tarjeta (opcional)
            </label>
            <textarea
              id="gift-message"
              value={giftMessage}
              onChange={(e) => setGiftMessage(e.target.value)}
              maxLength={140}
              rows={2}
              placeholder="Ej: ¡Feliz cumpleaños, mamá! Te quiero mucho."
              className="mt-1 w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <p className="text-right text-xs text-muted-foreground">{`${giftMessage.length}/140`}</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center rounded-full border bg-card" role="group" aria-label="Cantidad">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="p-3 disabled:opacity-40"
            disabled={quantity <= 1}
            aria-label="Disminuir cantidad"
          >
            <Minus className="size-4" />
          </button>
          <span className="w-8 text-center font-semibold tabular-nums" aria-live="polite">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(MAX_QUANTITY, q + 1))}
            className="p-3 disabled:opacity-40"
            disabled={quantity >= MAX_QUANTITY}
            aria-label="Aumentar cantidad"
          >
            <Plus className="size-4" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground">
          Total: <span className="text-xl font-semibold text-foreground tabular-nums">{formatCLP(total)}</span>
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={buyNow}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-cta px-6 py-4 text-lg font-semibold text-cta-foreground shadow-md transition hover:brightness-110"
        >
          <Zap className="size-5" aria-hidden />
          Comprar ahora en 1 clic
        </button>
        <button
          type="button"
          onClick={() => add(item)}
          className="flex items-center justify-center gap-2 rounded-full border-2 border-primary px-6 py-3.5 font-semibold text-primary transition hover:bg-secondary"
        >
          <ShoppingBag className="size-5" aria-hidden />
          Agregar al carrito
        </button>
      </div>
      <p className="-mt-3 text-xs text-muted-foreground">
        Tu pedido llega directo al WhatsApp de Gloria, quien lo confirma en minutos. Sin registros ni formularios.
      </p>

      <TrustSeals compact />

      <div
        data-buy-bar
        className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
      >
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <div className="hidden min-w-0 flex-1 sm:block">
            <p className="truncate font-semibold">{product.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {Object.values(selections).join(' · ')}
              {giftWrap ? ' · con envoltorio' : ''}
            </p>
          </div>
          <p className="text-lg font-semibold tabular-nums">{formatCLP(total)}</p>
          <button
            type="button"
            onClick={buyNow}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-cta px-6 py-3 font-semibold text-cta-foreground shadow-md transition hover:brightness-110 sm:flex-none"
          >
            <Zap className="size-4" aria-hidden />
            Comprar ahora
          </button>
        </div>
      </div>
    </div>
  )
}
