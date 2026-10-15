import { convertToModelMessages, createUIMessageStreamResponse, streamText, toUIMessageStream, type UIMessage } from 'ai'
import { products } from '@/lib/catalog'
import { buildFlorInstructions } from '@/lib/flor-prompt'

export const maxDuration = 30

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

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response('Solicitud inválida', { status: 400 })
  }

  const result = streamText({
    model: 'google/gemini-3.8-flash',
    instructions,
    messages: await convertToModelMessages(messages.slice(-MAX_MESSAGES)),
  })

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  })
}
