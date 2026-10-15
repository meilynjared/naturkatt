import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span className={cn('flex items-center gap-0.5', className)} role="img" aria-label={`${rating} de 5 estrellas`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn('size-4', i < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-border')}
          aria-hidden
        />
      ))}
    </span>
  )
}
