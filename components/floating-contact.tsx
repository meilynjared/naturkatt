'use client'

import { Flower2, MessageCircle } from 'lucide-react'
import { useCart } from './cart-provider'
import { FlorChat } from './flor-chat'
import { whatsappLink } from '@/lib/store'

export function FloatingContact() {
  const { assistantOpen, openAssistant, closeAssistant } = useCart()

  return (
    <>
      {assistantOpen && (
        <div className="fixed inset-x-3 bottom-[calc(var(--float-offset)+0.75rem)] top-20 z-50 sm:inset-x-auto sm:right-5 sm:top-auto sm:h-[min(600px,calc(100vh-8rem))] sm:w-[380px]">
          <FlorChat onClose={closeAssistant} />
        </div>
      )}
      {!assistantOpen && (
        <div className="fixed bottom-[calc(var(--float-offset)+1rem)] right-4 z-50 flex flex-col items-end gap-3 sm:right-5">
          <button
            type="button"
            onClick={() => openAssistant()}
            aria-label="Pregúntale a Flor, asistente virtual"
            className="flex items-center gap-2 rounded-full bg-sun p-3.5 text-sm font-semibold text-sun-foreground shadow-lg transition hover:brightness-110 sm:py-3 sm:pl-3 sm:pr-4 [html:not(:has([data-buy-bar]))_&]:py-3 [html:not(:has([data-buy-bar]))_&]:pl-3 [html:not(:has([data-buy-bar]))_&]:pr-4"
          >
            <Flower2 className="size-5" aria-hidden />
            <span className="hidden sm:inline [html:not(:has([data-buy-bar]))_&]:inline">Pregúntale a Flor</span>
          </button>
          <a
            href={whatsappLink('¡Hola Gloria! Vengo de NaturKatt y tengo una consulta.')}
            target="_blank"
            rel="noopener noreferrer"
            className="flex size-14 items-center justify-center rounded-full bg-whatsapp text-whatsapp-foreground shadow-lg transition hover:brightness-110"
            aria-label="Escribir por WhatsApp a Gloria"
          >
            <MessageCircle className="size-7" aria-hidden />
          </a>
        </div>
      )}
    </>
  )
}
