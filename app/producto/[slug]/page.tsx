import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Check, ChevronLeft } from 'lucide-react'
import { SiteFooter } from '@/components/faq-footer'
import { ProductCard } from '@/components/product-card'
import { ProductConfigurator } from '@/components/product-configurator'
import { ReviewsSection } from '@/components/reviews-section'
import { SiteHeader } from '@/components/site-header'
import { Stars } from '@/components/stars'
import { getProduct, products, reviews } from '@/lib/catalog'
import { formatCLP } from '@/lib/store'

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: PageProps<'/producto/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const product = getProduct(slug)
  if (!product) return {}
  return {
    title: `${product.name} | NaturKatt`,
    description: product.short,
    openGraph: { images: [product.image] },
  }
}

export default async function ProductPage({ params }: PageProps<'/producto/[slug]'>) {
  const { slug } = await params
  const product = getProduct(slug)
  if (!product) notFound()

  const productReviews = reviews.filter((r) => r.productSlug === product.slug)
  const related = products.filter((p) => p.slug !== product.slug && p.category === product.category).slice(0, 3)

  return (
    <>
      <SiteHeader />
      <main>
        <div className="mx-auto max-w-6xl px-4 pt-6">
          <Link href="/#kits" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ChevronLeft className="size-4" aria-hidden />
            Volver al catálogo
          </Link>
        </div>

        <section className="mx-auto grid max-w-6xl gap-10 px-4 py-8 md:grid-cols-2">
          <div className="md:sticky md:top-24 md:self-start">
            <div className="relative aspect-square overflow-hidden rounded-3xl bg-muted">
              <Image
                src={product.image || '/placeholder.svg'}
                alt={product.name}
                fill
                priority
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
              {product.badge && (
                <span className="absolute left-4 top-4 rounded-full bg-background px-3 py-1 text-sm font-semibold text-primary">
                  {product.badge}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <p className="text-sm uppercase tracking-wider text-muted-foreground">{product.line}</p>
              <h1 className="text-balance font-serif text-3xl leading-tight md:text-4xl">{product.name}</h1>
              <a href="#resenas" className="flex w-fit items-center gap-2 text-sm text-muted-foreground hover:underline">
                <Stars rating={product.rating} />
                {`${product.rating.toFixed(1).replace('.', ',')} · ${product.reviewCount} reseñas`}
              </a>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-semibold tabular-nums">{formatCLP(product.price)}</span>
                {product.compareAt && (
                  <>
                    <span className="text-lg text-muted-foreground line-through tabular-nums">
                      {formatCLP(product.compareAt)}
                    </span>
                    <span className="rounded-full bg-accent px-2 py-0.5 text-sm font-semibold text-accent-foreground">
                      {`Ahorras ${formatCLP(product.compareAt - product.price)}`}
                    </span>
                  </>
                )}
              </div>
              <p className="text-pretty leading-relaxed text-muted-foreground">{product.description}</p>
            </div>

            {product.includes && (
              <div className="rounded-xl bg-secondary p-5">
                <h2 className="mb-2 font-semibold">Este kit incluye</h2>
                <ul className="flex flex-col gap-1.5 text-sm">
                  {product.includes.map((i) => (
                    <li key={i} className="flex gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <ProductConfigurator product={product} />

            <div>
              <h2 className="mb-2 font-semibold">Beneficios</h2>
              <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                {product.benefits.map((b) => (
                  <li key={b} className="flex gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                    {b}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-sm">
                <span className="font-semibold">Ideal para: </span>
                <span className="text-muted-foreground">{product.idealFor}</span>
              </p>
            </div>
          </div>
        </section>

        <ReviewsSection
          reviews={productReviews.length ? productReviews : reviews}
          title={productReviews.length ? 'Opiniones de este producto' : 'Lo que dicen nuestras clientas y clientes'}
        />

        {related.length > 0 && (
          <section className="mx-auto max-w-6xl px-4 pb-16">
            <h2 className="mb-6 font-serif text-2xl">También te puede gustar</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  )
}
