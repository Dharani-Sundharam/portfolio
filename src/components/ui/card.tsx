'use client'

import { cn } from '@/lib/utils'

interface CardProps {
  className?: string
  children: React.ReactNode
}

export function Card({ className, children }: CardProps) {
  return (
    <div className={cn('rounded-xl border border-white/10 bg-black/50 backdrop-blur-sm', className)}>
      {children}
    </div>
  )
}
