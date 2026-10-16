import { LotusIcon } from './lotus-logo'
import { CITY, OWNER_EMAIL, OWNER_NAME, WHATSAPP_DISPLAY, whatsappLink } from '@/lib/store'

const faqs = [
  {
    q: '¿Cómo pago mi pedido?',
    a: 'Puedes pagar con Webpay (débito, crédito o prepago) directamente en la tienda, en el sitio seguro de Transbank. Si prefieres, coordinas con Gloria el pago por transferencia bancaria o en efectivo al recibir tu pedido en Iquique y Alto Hospicio. Nunca te pediremos datos de tu tarjeta por chat.',
  },
  {
    q: '¿Cuánto demora el envío?',
    a: 'En Iquique y Alto Hospicio entregamos en 24 horas hábiles, gratis sobre $30.000; bajo ese monto, el envío se calcula al pagar según la distancia desde donde despacha Gloria, en Alto Hospicio (desde $1.500). Al resto de la Región de Tarapacá (Pozo Almonte, Huara, Pica, Camiña y Colchane) enviamos por courier en 2 a 5 días hábiles con número de seguimiento, desde $5.990 según la distancia. También puedes retirar gratis en el punto de retiro de Gloria (Av. Esmeralda 2872, Alto Hospicio), coordinando el día y la hora por WhatsApp.',
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
                <span className="text-xl text-primary-ink transition group-open:rotate-45" aria-hidden>
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
      <div className="mx-auto max-w-6xl px-4 pt-10 pb-[calc(var(--float-offset)+8.5rem)] lg:pb-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-full bg-card ring-1 ring-primary/25">
              <LotusIcon id="pie" className="size-8" />
            </span>
            <div>
              <p className="font-serif text-lg font-semibold">NaturKatt</p>
              <p className="text-sm text-muted-foreground">Consultora Natura Gloria</p>
            </div>
          </div>
          <address className="text-sm not-italic text-muted-foreground md:text-right">
            <p>{OWNER_NAME}</p>
            <p>{CITY}</p>
            <p>
              <a href={whatsappLink('¡Hola Gloria!')} target="_blank" rel="noopener noreferrer" className="underline">
                {`WhatsApp ${WHATSAPP_DISPLAY}`}
              </a>
            </p>
            <p>
              <a href={`mailto:${OWNER_EMAIL}`} className="underline">
                {OWNER_EMAIL}
              </a>
            </p>
          </address>
        </div>
        <div className="mt-8 border-t pt-6">
          {/* Ancho acotado para que el texto no quede detrás de los botones flotantes de Flor y WhatsApp. */}
          <div className="mx-auto flex max-w-3xl flex-col gap-1 text-center text-muted-foreground">
            <p className="text-sm">
              © 2026 NaturKatt. Tus datos se tratan conforme a la Ley 19.628 y Ley 21.719 de Protección de Datos
              Personales.
            </p>
            <p className="text-xs">
              NaturKatt es el emprendimiento de una consultora independiente; no es un sitio oficial de Natura.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
