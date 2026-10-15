'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { CartItem } from '@/lib/order'

type CartContextValue = {
  items: CartItem[]
  count: number
  total: number
  isOpen: boolean
  open: () => void
  close: () => void
  add: (item: Omit<CartItem, 'key'>) => void
  updateQuantity: (key: string, quantity: number) => void
  remove: (key: string) => void
  assistantOpen: boolean
  assistantPrompt: string | null
  openAssistant: (prompt?: string) => void
  closeAssistant: () => void
  consumeAssistantPrompt: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

const MAX_QUANTITY = 10

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [assistantOpen, setAssistantOpen] = useState(false)
  const [assistantPrompt, setAssistantPrompt] = useState<string | null>(null)

  const add = useCallback((item: Omit<CartItem, 'key'>) => {
    const key = [item.slug, JSON.stringify(item.selections), item.giftWrap, item.giftMessage].join('|')
    setItems((prev) => {
      const existing = prev.find((i) => i.key === key)
      if (existing) {
        return prev.map((i) =>
          i.key === key ? { ...i, quantity: Math.min(MAX_QUANTITY, i.quantity + item.quantity) } : i,
        )
      }
      return [...prev, { ...item, key }]
    })
    setIsOpen(true)
  }, [])

  const updateQuantity = useCallback((key: string, quantity: number) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.key !== key)
        : prev.map((i) => (i.key === key ? { ...i, quantity: Math.min(MAX_QUANTITY, quantity) } : i)),
    )
  }, [])

  const remove = useCallback((key: string) => setItems((prev) => prev.filter((i) => i.key !== key)), [])

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: items.reduce((s, i) => s + i.quantity, 0),
      total: items.reduce((s, i) => s + i.unitPrice * i.quantity, 0),
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      add,
      updateQuantity,
      remove,
      assistantOpen,
      assistantPrompt,
      openAssistant: (prompt?: string) => {
        setAssistantPrompt(prompt ?? null)
        setAssistantOpen(true)
      },
      closeAssistant: () => setAssistantOpen(false),
      consumeAssistantPrompt: () => setAssistantPrompt(null),
    }),
    [items, isOpen, add, updateQuantity, remove, assistantOpen, assistantPrompt],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider')
  return ctx
}
