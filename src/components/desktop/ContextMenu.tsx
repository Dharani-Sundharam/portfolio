'use client'

import { useEffect } from 'react'

// Win7 right-click context menu, styled with 7.css's `ul[role="menu"]`.
// Ported from the nainemom/win7 pattern (with the author's permission).
export type MenuItem = {
  label?: string
  sub?: MenuItem[]
  onClick?: () => void
  disabled?: boolean
  sep?: boolean
}

function MenuList({ items, onClose }: { items: MenuItem[]; onClose: () => void }) {
  return (
    <ul role="menu">
      {items.map((it, i) => {
        if (it.sep) {
          return <li key={i} role="separator" className="my-1 ml-7 mr-1 border-t border-black/10" />
        }
        if (it.sub) {
          return (
            <li key={i} role="menuitem" aria-haspopup="true">
              <span>{it.label}</span>
              <MenuList items={it.sub} onClose={onClose} />
            </li>
          )
        }
        return (
          <li key={i} role="menuitem" aria-disabled={it.disabled || undefined}>
            <button
              disabled={it.disabled}
              className={it.disabled ? 'opacity-40 pointer-events-none' : ''}
              onClick={() => {
                it.onClick?.()
                onClose()
              }}
            >
              {it.label}
            </button>
          </li>
        )
      })}
    </ul>
  )
}

export default function ContextMenu({
  x,
  y,
  items,
  onClose,
}: {
  x: number
  y: number
  items: MenuItem[]
  onClose: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Keep it on screen (approx menu footprint).
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1920
  const vh = typeof window !== 'undefined' ? window.innerHeight : 1080
  const left = Math.min(x, vw - 210)
  const top = Math.min(y, vh - 380)

  return (
    <>
      {/* click-away / suppress browser menu */}
      <div
        className="fixed inset-0 z-[200]"
        onPointerDown={onClose}
        onContextMenu={(e) => {
          e.preventDefault()
          onClose()
        }}
      />
      <div className="win7 fixed z-[201]" style={{ left, top }}>
        <MenuList items={items} onClose={onClose} />
      </div>
    </>
  )
}
