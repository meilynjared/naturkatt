import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/lib/catalog'
import { formatCLP } from '@/lib/store'
import { Stars } from './stars'

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border bg-card transition hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={product.image || '/placeholder.svg'}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-background px-3 py-1 text-xs font-semibold text-primary">
            {product.badge}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{product.line}</p>
        <h3 className="font-serif text-lg leading-snug">
          <Link href={`/producto/${product.slug}`} className="after:absolute after:inset-0">
            {product.name}
          </Link>
        </h3>
        <p className="text-sm text-muted-foreground">{product.short}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Stars rating={product.rating} />
          <span>({product.reviewCount})</span>
        </div>
        <div className="mt-auto flex items-baseline gap-2 pt-2">
          <span className="text-lg font-semibold tabular-nums">{formatCLP(product.price)}</span>
          {product.compareAt && (
            <span className="text-sm text-muted-foreground line-through tabular-nums">
              {formatCLP(product.compareAt)}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
