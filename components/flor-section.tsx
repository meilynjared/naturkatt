'use client'

import { Flower2 } from 'lucide-react'
import { useCart } from './cart-provider'

const prompts = [
  'Necesito un regalo de menos de $40.000',
  'Tengo la piel seca por el sol, ¿qué me recomiendas?',
  'Quiero un perfume que dure todo el día',
]

export function FlorSection() {
  const { openAssistant } = useCart()
  return (
    <section id="flor" className="mx-auto max-w-6xl scroll-mt-28 px-4">
      <div className="flex flex-col gap-6 rounded-3xl bg-accent p-8 md:flex-row md:items-center md:p-12">
        <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-cta text-cta-foreground">
          <Flower2 className="size-8" aria-hidden />
        </span>
        <div className="flex-1">
          <h2 className="font-serif text-2xl md:text-3xl">¿No sabes qué elegir? Pregúntale a Flor</h2>
          <p className="mt-2 text-pretty text-muted-foreground">
            Nuestra asistente virtual te recomienda el producto ideal en segundos, las 24 horas. Y si prefieres, te
            conecta con Gloria.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {prompts.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => openAssistant(p)}
                className="rounded-full border border-accent-foreground/30 bg-background px-4 py-2 text-sm text-accent-foreground transition hover:bg-card"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
