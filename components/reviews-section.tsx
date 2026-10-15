import Image from 'next/image'
import { BadgeCheck } from 'lucide-react'
import { getProduct, type Review } from '@/lib/catalog'
import { Stars } from './stars'

export function ReviewsSection({
  reviews,
  title = 'Lo que dicen nuestras clientas y clientes',
}: {
  reviews: Review[]
  title?: string
}) {
  const average = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
  return (
    <section id="resenas" className="mx-auto max-w-6xl scroll-mt-28 px-4 py-16">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Prueba social</p>
          <h2 className="mt-2 text-balance font-serif text-3xl md:text-4xl">{title}</h2>
        </div>
        <div className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3">
          <span className="font-serif text-3xl">{average.toFixed(1).replace('.', ',')}</span>
          <span className="flex flex-col text-sm text-muted-foreground">
            <Stars rating={average} />
            {`${reviews.length} reseñas verificadas`}
          </span>
        </div>
      </div>
      <ul className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {reviews.map((review) => (
          <li key={review.id} className="mb-4 break-inside-avoid overflow-hidden rounded-xl border bg-card">
            {review.photo && (
              <div className="relative aspect-[4/3]">
                <Image
                  src={review.photo || '/placeholder.svg'}
                  alt={`Foto de ${review.name} con su compra`}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex flex-col gap-2 p-5">
              <Stars rating={review.rating} />
              <p className="text-pretty leading-relaxed">{review.text}</p>
              <div className="mt-2 flex items-center justify-between gap-2 text-sm">
                <span>
                  <span className="font-semibold">{review.name}</span>
                  <span className="text-muted-foreground">{` · ${review.city}`}</span>
                </span>
                <span className="flex items-center gap-1 text-xs font-medium text-primary">
                  <BadgeCheck className="size-4" aria-hidden />
                  Compra verificada
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {`${getProduct(review.productSlug)?.name ?? ''} · ${review.date}`}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
