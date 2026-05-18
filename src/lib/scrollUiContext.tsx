'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { useScrollUi, type ScrollUiState } from '@/lib/useScrollUi'

const ScrollUiContext = createContext<ScrollUiState | null>(null)

export function ScrollUiProvider({ children }: { children: ReactNode }) {
  const ui = useScrollUi()
  return <ScrollUiContext.Provider value={ui}>{children}</ScrollUiContext.Provider>
}

export function useScrollUiContext(): ScrollUiState {
  const ctx = useContext(ScrollUiContext)
  if (!ctx) throw new Error('useScrollUiContext must be used within ScrollUiProvider')
  return ctx
}
