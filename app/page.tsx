import { AboutGloria } from '@/components/about-gloria'
import { Faq, SiteFooter } from '@/components/faq-footer'
import { FlorSection } from '@/components/flor-section'
import { Hero } from '@/components/hero'
import { ProductCard } from '@/components/product-card'
import { ReviewsSection } from '@/components/reviews-section'
import { SiteHeader } from '@/components/site-header'
import { TrustSeals } from '@/components/trust-seals'
import { kits, reviews, singles } from '@/lib/catalog'

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <section aria-label="Garantías" className="mx-auto max-w-6xl px-4 pb-8">
          <TrustSeals />
        </section>

        <section id="kits" className="mx-auto max-w-6xl scroll-mt-28 px-4 py-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Listos para regalar</p>
          <h2 className="mt-2 font-serif text-3xl md:text-4xl">Kits de productos</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Combinaciones pensadas por Gloria para cada ocasión, con ahorro frente a comprar por separado.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {kits.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>

        <FlorSection />

        <section id="productos" className="mx-auto max-w-6xl scroll-mt-28 px-4 py-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Favoritos individuales</p>
          <h2 className="mt-2 font-serif text-3xl md:text-4xl">Productos</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {singles.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>

        <AboutGloria />
        <ReviewsSection reviews={reviews} />
        <Faq />
      </main>
      <SiteFooter />
    </>
  )
}
