import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateText,
  type UIMessage,
} from 'ai'
import { products } from '@/lib/catalog'
import { florFallbackReply } from '@/lib/flor-fallback'
import { buildFlorInstructions } from '@/lib/flor-prompt'

export const maxDuration = 30

const MODEL = process.env.FLOR_MODEL || 'google/gemini-3.8-flash'

const instructions = buildFlorInstructions(
  products.map((p) => ({
    name: p.name,
    price: p.price,
    short: p.short,
    idealFor: p.idealFor,
    options: p.options.map((o) => `${o.name}: ${o.values.map((v) => v.label).join(', ')}`),
  })),
)

const MAX_MESSAGES = 30

function lastUserText(messages: UIMessage[]) {
  const last = [...messages].reverse().find((m) => m.role === 'user')
  return (last?.parts ?? [])
    .map((p) => (p.type === 'text' ? p.text : ''))
    .join(' ')
    .trim()
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response('Solicitud inválida', { status: 400 })
  }

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      let reply = ''
      try {
        const result = await generateText({
          model: MODEL,
          instructions,
          messages: await convertToModelMessages(messages.slice(-MAX_MESSAGES)),
          abortSignal: AbortSignal.timeout(20_000),
        })
        reply = result.text.trim()
      } catch (error) {
        // Queda en los registros de Vercel para revisar la causa (créditos o permisos del servicio de IA, etc.).
        console.error('Flor: el modelo de IA no respondió; se usa la respuesta de respaldo.', error)
      }
      if (!reply) reply = florFallbackReply(lastUserText(messages))

      const id = crypto.randomUUID()
      writer.write({ type: 'text-start', id })
      writer.write({ type: 'text-delta', id, delta: reply })
      writer.write({ type: 'text-end', id })
    },
    onError: () => 'Flor tuvo un problema para responder.',
  })

  return createUIMessageStreamResponse({ stream })
}
