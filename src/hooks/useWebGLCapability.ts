'use client'

import { useEffect, useState } from 'react'
import { assessWebGLSupport } from '@/lib/webglSupport'

export type WebGLCapability = 'checking' | 'supported' | 'fallback'

export function useWebGLCapability() {
  const [capability, setCapability] = useState<WebGLCapability>('checking')
  const [reason, setReason] = useState<string | null>(null)

  useEffect(() => {
    const { ok, reason: r } = assessWebGLSupport()
    setCapability(ok ? 'supported' : 'fallback')
    setReason(r ?? null)
  }, [])

  return { capability, reason }
}
