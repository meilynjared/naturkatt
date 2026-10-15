import Image from 'next/image'
import { MessageCircle } from 'lucide-react'
import { OWNER_NAME, WHATSAPP_DISPLAY, whatsappLink } from '@/lib/store'

const steps = [
  { n: '1', title: 'Elige', text: 'Explora los kits o deja que Flor te recomiende según tu piel o la persona a quien regalas.' },
  { n: '2', title: 'Compra en 1 clic', text: 'Personaliza, presiona comprar y tu pedido llega listo a mi WhatsApp.' },
  { n: '3', title: 'Recibe', text: 'Te confirmo en minutos y lo entrego en 24 h en Iquique o envío a todo Chile.' },
]

export function AboutGloria() {
  return (
    <section id="gloria" className="scroll-mt-28 bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-[2fr_3fr]">
        <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-3xl">
          <Image
            src="/images/gloria.png"
            alt={`${OWNER_NAME}, consultora y dueña de NaturKatt`}
            fill
            sizes="(min-width: 768px) 40vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col gap-6">
          <p className="text-sm font-semibold uppercase tracking-wider opacity-80">Tu consultora en Iquique</p>
          <h2 className="text-balance font-serif text-3xl md:text-4xl">{`Hola, soy ${OWNER_NAME}`}</h2>
          <p className="text-pretty text-lg leading-relaxed opacity-90">
            Hace más de 12 años asesoro a familias de Iquique y Alto Hospicio en el cuidado de su piel. NaturKatt nace
            para que puedas comprarme a cualquier hora, con la misma atención personalizada de siempre: cada pedido lo
            reviso y confirmo yo misma.
          </p>
          <ol className="grid gap-4 sm:grid-cols-3">
            {steps.map((s) => (
              <li key={s.n} className="rounded-xl bg-primary-foreground/10 p-4">
                <span className="font-serif text-2xl">{s.n}</span>
                <p className="mt-1 font-semibold">{s.title}</p>
                <p className="mt-1 text-sm opacity-85">{s.text}</p>
              </li>
            ))}
          </ol>
          <a
            href={whatsappLink('¡Hola Gloria! Vengo de NaturKatt y quisiera una asesoría.')}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-fit items-center gap-2 rounded-full bg-cta px-6 py-3.5 font-semibold text-cta-foreground transition hover:brightness-110"
          >
            <MessageCircle className="size-5" aria-hidden />
            {`Escríbeme al ${WHATSAPP_DISPLAY}`}
          </a>
        </div>
      </div>
    </section>
  )
}
