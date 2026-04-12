'use client'

import { useEffect, useRef, useState } from 'react'
import { sections } from '@/data/sections'
import { scrollState } from '@/lib/scrollState'
import { snapToSection } from '@/lib/snapNav'

/**
 * Fixed right-side nav dots.
 * Reads scrollState.offset directly (no ScrollControls dependency).
 * Clicking a dot calls snapToSection() for instant keyboard-like navigation.
 */

const SECTION_RANGES = [
  [0.00, 0.18],  // intro
  [0.18, 0.38],  // about
  [0.38, 0.57],  // skills
  [0.57, 0.75],  // projects
  [0.75, 1.00],  // contact
]

export default function ScrollProgressNav() {
  const [activeIdx, setActiveIdx] = useState(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const tick = () => {
      const t = scrollState.offset
      let idx = 0
      for (let i = 0; i < SECTION_RANGES.length; i++) {
        if (t >= SECTION_RANGES[i][0]) idx = i
      }
      setActiveIdx(prev => prev === idx ? prev : idx)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <nav
      aria-label="Section navigation"
      style={{
        position: 'fixed', right: 24, top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 50, display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 14,
      }}
    >
      {sections.map((section, i) => {
        const isActive = i === activeIdx
        return (
          <button
            key={section.id}
            title={section.title}
            aria-label={`Go to ${section.title}`}
            onClick={() => snapToSection(i)}
            style={{
              position: 'relative', width: 22, height: 22,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            }}
            className="group"
          >
            {/* Glow ring */}
            <span style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              transition: 'box-shadow 0.4s',
              boxShadow: isActive
                ? `0 0 0 2px ${section.lightColor}80, 0 0 12px ${section.lightColor}60`
                : 'none',
            }} />
            {/* Dot */}
            <span style={{
              display: 'block', borderRadius: '50%',
              width: isActive ? 11 : 6,
              height: isActive ? 11 : 6,
              background: isActive ? section.lightColor : 'rgba(148,163,184,0.3)',
              boxShadow: isActive ? `0 0 10px ${section.lightColor}` : 'none',
              transition: 'all 0.35s',
            }} />
            {/* Hover label */}
            <span style={{
              position: 'absolute', right: 28, whiteSpace: 'nowrap',
              fontSize: 11, fontWeight: 600, color: '#cbd5e1',
              background: 'rgba(2,6,23,0.85)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(71,85,105,0.5)',
              borderRadius: 6, padding: '2px 8px',
              opacity: 0, pointerEvents: 'none',
              transition: 'opacity 0.2s',
            }}
              className="group-hover:opacity-100"
            >
              {section.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
