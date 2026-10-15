import { RotateCcw, ShieldCheck, Truck } from 'lucide-react'
import { cn } from '@/lib/utils'

const seals = [
  { icon: ShieldCheck, title: 'Pago 100% seguro', text: 'Transferencia, tarjetas o efectivo contra entrega' },
  { icon: RotateCcw, title: 'Devoluciones gratuitas en 30 días', text: 'Si no te encanta, lo cambiamos o reembolsamos' },
  { icon: Truck, title: 'Envío rápido', text: '24 h en Iquique · 2 a 5 días hábiles a todo Chile' },
]

export function TrustSeals({ compact = false }: { compact?: boolean }) {
  return (
    <ul className={cn('grid gap-3', compact ? 'grid-cols-1 sm:grid-cols-3' : 'sm:grid-cols-3 sm:gap-6')}>
      {seals.map(({ icon: Icon, title, text }) => (
        <li
          key={title}
          className={cn(
            'flex items-start gap-3 rounded-xl border bg-card',
            compact ? 'p-3' : 'p-5',
          )}
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
            <Icon className="size-5" aria-hidden />
          </span>
          <span className="flex flex-col">
            <span className={cn('font-semibold leading-tight', compact && 'text-sm')}>{title}</span>
            <span className="text-xs text-muted-foreground sm:text-sm">{text}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}
