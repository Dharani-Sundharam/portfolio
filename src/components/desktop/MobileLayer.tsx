'use client'

import { useEffect, useState } from 'react'

// On touch devices the OS shows a fake desktop cursor that follows your finger,
// plus a "rotate to landscape" gate in portrait. Both no-op on real pointers.
export default function MobileLayer() {
  return (
    <>
      <VirtualCursor />
      <RotateGate />
    </>
  )
}

function isCoarse() {
  return typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
}

// A standard arrow cursor that tracks the last touch point.
function VirtualCursor() {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    if (!isCoarse()) return
    setPos({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
    const move = (e: TouchEvent) => {
      const t = e.touches[0] ?? e.changedTouches[0]
      if (t) setPos({ x: t.clientX, y: t.clientY })
    }
    document.addEventListener('touchstart', move, { passive: true })
    document.addEventListener('touchmove', move, { passive: true })
    return () => {
      document.removeEventListener('touchstart', move)
      document.removeEventListener('touchmove', move)
    }
  }, [])

  if (!pos) return null
  return (
    <div className="pointer-events-none fixed z-[10000]" style={{ left: pos.x, top: pos.y }}>
      <svg width="26" height="26" viewBox="0 0 28 28" style={{ transform: 'translate(-2px, -2px)' }}>
        <polygon
          points="3,2 3,21 8,16.5 11.5,24 14,23 10.5,15.5 17,15.5"
          fill="white"
          stroke="#111"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

// Full-screen "please rotate" prompt shown only on touch + portrait.
function RotateGate() {
  const [portrait, setPortrait] = useState(false)

  useEffect(() => {
    if (!isCoarse()) return
    const check = () => setPortrait(window.innerHeight > window.innerWidth)
    check()
    window.addEventListener('resize', check)
    window.addEventListener('orientationchange', check)
    return () => {
      window.removeEventListener('resize', check)
      window.removeEventListener('orientationchange', check)
    }
  }, [])

  if (!portrait) return null
  return (
    <div className="fixed inset-0 z-[10001] flex flex-col items-center justify-center gap-5 px-8 text-center bg-[#0a1a3a] text-white font-win7">
      <div className="text-6xl animate-[rotate-device_1.8s_ease-in-out_infinite]">📱</div>
      <div className="text-lg font-semibold">Please rotate your device</div>
      <p className="max-w-xs text-sm text-white/70">
        DharaniOS runs in landscape — turn your phone sideways for the full desktop experience.
      </p>
    </div>
  )
}
