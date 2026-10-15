import { Leaf } from 'lucide-react'
import { CITY, OWNER_NAME, WHATSAPP_DISPLAY, whatsappLink } from '@/lib/store'

const faqs = [
  {
    q: '¿Cómo pago mi pedido?',
    a: 'Puedes pagar por transferencia bancaria, con tarjeta de débito o crédito mediante link de pago seguro, o en efectivo contra entrega en Iquique y Alto Hospicio. Nunca te pediremos datos de tu tarjeta por chat.',
  },
  {
    q: '¿Cuánto demora el envío?',
    a: 'En Iquique y Alto Hospicio entregamos en 24 horas hábiles, gratis sobre $30.000. Al resto de Chile enviamos por courier en 2 a 5 días hábiles con número de seguimiento.',
  },
  {
    q: '¿Puedo devolver un producto?',
    a: 'Sí. Tienes 30 días para cambios o devoluciones gratuitas si el producto está sin uso o llegó con algún problema.',
  },
  {
    q: '¿Los productos son originales?',
    a: 'Sí. Gloria es consultora oficial y todos los productos vienen sellados con su fecha de vencimiento visible.',
  },
]

export function Faq() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <h2 className="mb-6 text-center font-serif text-3xl">Preguntas frecuentes</h2>
      <div className="flex flex-col gap-3">
        {faqs.map((f) => (
          <details key={f.q} className="group rounded-xl border bg-card p-5">
            <summary className="cursor-pointer list-none font-semibold marker:hidden">
              <span className="flex items-center justify-between gap-4">
                {f.q}
                <span className="text-xl text-primary transition group-open:rotate-45" aria-hidden>
                  +
                </span>
              </span>
            </summary>
            <p className="mt-3 leading-relaxed text-muted-foreground">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted">
      <div className="mx-auto max-w-6xl px-4 pt-10 pb-[calc(var(--float-offset)+9rem)]">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Leaf className="size-5" aria-hidden />
            </span>
            <div>
              <p className="font-serif text-lg font-semibold">NaturKatt</p>
              <p className="text-sm text-muted-foreground">Consultora Natura Gloria</p>
            </div>
          </div>
          <address className="text-sm not-italic text-muted-foreground md:text-right">
            <p>{OWNER_NAME}</p>
            <p>{CITY}</p>
            <a href={whatsappLink('¡Hola Gloria!')} target="_blank" rel="noopener noreferrer" className="underline">
              {`WhatsApp ${WHATSAPP_DISPLAY}`}
            </a>
          </address>
        </div>
        <div className="mt-8 flex flex-col gap-1 border-t pt-6 text-center text-muted-foreground">
          <p className="text-sm">
            © 2026 NaturKatt. Tus datos se tratan conforme a la Ley 19.628 y Ley 21.719 de Protección de Datos
            Personales.
          </p>
          <p className="text-xs">
            NaturKatt es el emprendimiento de una consultora independiente; no es un sitio oficial de Natura.
          </p>
        </div>
      </div>
    </footer>
  )
}
