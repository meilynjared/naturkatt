import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Sparkles } from 'lucide-react'

export function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 md:grid-cols-2 md:py-20">
      <div className="flex flex-col gap-6">
        <p className="flex w-fit items-center gap-2 rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground">
          <MapPin className="size-4" aria-hidden />
          Desde Iquique para todo Chile
        </p>
        <h1 className="text-balance font-serif text-4xl leading-tight md:text-6xl">
          Cosmética botánica elegida para ti, con la cercanía de siempre.
        </h1>
        <p className="text-pretty text-lg text-muted-foreground">
          Soy Gloria, tu consultora Natura. Te ayudo a encontrar el perfume, la rutina o el regalo perfecto, y te lo
          llevo a la puerta de tu casa.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="#kits"
            className="rounded-full bg-cta px-7 py-3.5 font-semibold text-cta-foreground transition hover:brightness-110"
          >
            Ver kits de regalo
          </Link>
          <Link
            href="#flor"
            className="flex items-center gap-2 rounded-full border-2 border-primary px-7 py-3 font-semibold text-primary transition hover:bg-secondary"
          >
            <Sparkles className="size-4" aria-hidden />
            Pide ayuda a Flor
          </Link>
        </div>
        <dl className="flex gap-8 pt-2">
          <div>
            <dt className="text-sm text-muted-foreground">Clientes felices</dt>
            <dd className="font-serif text-2xl">+1.200</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Calificación</dt>
            <dd className="font-serif text-2xl">4,9 / 5</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Años asesorando</dt>
            <dd className="font-serif text-2xl">12</dd>
          </div>
        </dl>
      </div>
      <div className="relative aspect-[4/5] overflow-hidden rounded-3xl md:aspect-square">
        <Image
          src="/images/hero.png"
          alt="Productos de cosmética botánica rodeados de hojas y flores"
          fill
          priority
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
    </section>
  )
}
