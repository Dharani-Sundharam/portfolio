'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import MobileView from '@/components/MobileView'

const InteractiveBoard = dynamic(
  () => import('@/components/InteractiveBoard'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <p className="text-slate-500 text-sm tracking-widest uppercase">Initialising</p>
        </div>
      </div>
    ),
  }
)

export default function MotherboardPage() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Don't render until we know screen size (avoids flash)
  if (isMobile === null) return null

  // Mobile: scroll layout only — no 3D board, no WebGL / graphics-acceleration prompt
  if (isMobile) {
    return (
      <main className="w-full min-h-screen overflow-y-auto bg-slate-950">
        <MobileView />
      </main>
    )
  }

  // Desktop: 3D motherboard (WebGL check lives inside InteractiveBoard)
  return (
    <main className="w-full h-screen overflow-hidden bg-slate-950">
      <InteractiveBoard />
    </main>
  )
}
