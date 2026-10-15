'use client'

import { useChat } from '@ai-sdk/react'
import { useEffect, useRef, useState } from 'react'
import { Flower2, Loader2, Send, UserRound, X } from 'lucide-react'
import { useCart } from './cart-provider'
import { whatsappLink } from '@/lib/store'

const suggestions = [
  'Busco un regalo para mi mamá',
  '¿Qué rutina me sirve si tengo piel grasa?',
  '¿Cómo puedo pagar?',
  '¿Hacen envíos fuera de Iquique?',
]

export function FlorChat({ onClose }: { onClose: () => void }) {
  const { messages, sendMessage, status, error } = useChat()
  const { assistantPrompt, consumeAssistantPrompt } = useCart()
  const [input, setInput] = useState('')
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const busy = status === 'submitted' || status === 'streaming'

  const send = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || busy) return
    sendMessage({ text: trimmed.slice(0, 800) })
    setInput('')
  }

  const sentPromptRef = useRef<string | null>(null)
  useEffect(() => {
    if (assistantPrompt && sentPromptRef.current !== assistantPrompt) {
      sentPromptRef.current = assistantPrompt
      sendMessage({ text: assistantPrompt })
      consumeAssistantPrompt()
    }
  }, [assistantPrompt, sendMessage, consumeAssistantPrompt])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <div
      role="dialog"
      aria-label="Chat con Flor, asistente virtual"
      className="flex h-full flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl"
    >
      <header className="flex items-center gap-3 bg-primary px-4 py-3 text-primary-foreground">
        <span className="flex size-10 items-center justify-center rounded-full bg-primary-foreground/15">
          <Flower2 className="size-5" aria-hidden />
        </span>
        <div className="flex-1">
          <p className="font-semibold leading-tight">Flor</p>
          <p className="text-xs opacity-85">Asistente virtual de NaturKatt · responde al instante</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-2 hover:bg-primary-foreground/15"
          aria-label="Cerrar chat"
        >
          <X className="size-5" />
        </button>
      </header>

      <div ref={listRef} className="flex flex-1 flex-col gap-3 overflow-y-auto p-4" aria-live="polite">
        <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-secondary px-4 py-3 text-sm leading-relaxed text-secondary-foreground">
          ¡Hola! Soy Flor, la asistente de Gloria. Te ayudo a elegir el producto ideal, resolver dudas de pago o
          envío y armar tu pedido. ¿Es para ti o para regalar?
        </div>

        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                className="rounded-full border border-primary/30 bg-card px-3 py-1.5 text-left text-xs text-primary transition hover:bg-secondary"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={
              message.role === 'user'
                ? 'max-w-[85%] self-end rounded-2xl rounded-tr-sm bg-primary px-4 py-3 text-sm text-primary-foreground'
                : 'max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tl-sm bg-secondary px-4 py-3 text-sm leading-relaxed text-secondary-foreground'
            }
          >
            {message.parts.map((part, i) => (part.type === 'text' ? <span key={i}>{part.text}</span> : null))}
          </div>
        ))}

        {status === 'submitted' && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" aria-hidden />
            Flor está escribiendo…
          </div>
        )}
        {error && (
          <p className="rounded-lg bg-accent px-3 py-2 text-xs text-accent-foreground">
            Flor tuvo un problema para responder. Intenta nuevamente o escríbele a Gloria por WhatsApp.
          </p>
        )}
      </div>

      <div className="border-t p-3">
        <a
          href={whatsappLink('¡Hola Gloria! Estaba hablando con Flor y prefiero que me atiendas tú.')}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-2 flex items-center justify-center gap-1.5 text-xs font-medium text-primary underline-offset-4 hover:underline"
        >
          <UserRound className="size-3.5" aria-hidden />
          Prefiero hablar con Gloria
        </a>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            send(input)
          }}
          className="flex items-center gap-2"
        >
          <label htmlFor="flor-input" className="sr-only">
            Escribe tu mensaje
          </label>
          <input
            ref={inputRef}
            id="flor-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.nativeEvent.isComposing || e.keyCode === 229)) e.preventDefault()
            }}
            maxLength={800}
            placeholder="Escribe tu pregunta…"
            className="flex-1 rounded-full border bg-card px-4 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="flex size-10 items-center justify-center rounded-full bg-cta text-cta-foreground transition hover:brightness-110 disabled:opacity-50"
            aria-label="Enviar mensaje"
          >
            <Send className="size-4" />
          </button>
        </form>
      </div>
    </div>
  )
}
