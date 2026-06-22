'use client'

import { useEffect } from 'react'

// Windows 7 right-click context menu, built on 7.css's native menu component.
// 7.css supplies ALL the chrome (.win7 ul[role=menu]): the gutter rail, the
// blue Aero hover highlight, submenu arrows (auto on aria-haspopup), dividers
// (.has-divider), and disabled state (aria-disabled). `can-hover` opens
// submenus on hover; globals.css only adds left-flip near the screen edge.
export type MenuItem = {
  label?: string
  sub?: MenuItem[]
  onClick?: () => void
  disabled?: boolean
  bold?: boolean // default action — rendered bold (e.g. "Open")
  icon?: string // optional 16px gutter icon
  sep?: boolean
}

// Collapse `sep` markers into `.has-divider` on the preceding item (the 7.css way).
type Entry = MenuItem & { divider: boolean }
function normalize(items: MenuItem[]): Entry[] {
  const out: Entry[] = []
  for (const it of items) {
    if (it.sep) {
      if (out.length) out[out.length - 1].divider = true
      continue
    }
    out.push({ ...it, divider: false })
  }
  return out
}

function Img({ icon }: { icon?: string }) {
  if (!icon) return null
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={icon} alt="" width={16} height={16} draggable={false} />
}

function MenuList({
  items,
  onClose,
  canHover,
  flip,
}: {
  items: MenuItem[]
  onClose: () => void
  canHover?: boolean
  flip?: boolean
}) {
  return (
    <ul
      role="menu"
      className={`${canHover ? 'can-hover' : ''} ${flip ? 'flip' : ''}`}
      style={{ minWidth: 215, fontSize: '8.25pt' }}
    >
      {normalize(items).map((it, i) => {
        // Submenu parent: aria-haspopup on the <li> (7.css draws the arrow + aligns it).
        if (it.sub) {
          return (
            <li
              key={i}
              role="menuitem"
              tabIndex={0}
              aria-haspopup="true"
              className={it.divider ? 'has-divider' : undefined}
              style={it.bold ? { fontWeight: 700 } : undefined}
            >
              <Img icon={it.icon} />
              {it.label}
              <MenuList items={it.sub} onClose={onClose} canHover />
            </li>
          )
        }

        // Leaf item: a <button> 7.css styles as a full-width menu row.
        return (
          <li
            key={i}
            role="menuitem"
            className={it.divider ? 'has-divider' : undefined}
            aria-disabled={it.disabled || undefined}
          >
            <Img icon={it.icon} />
            <button
              type="button"
              style={it.bold ? { fontWeight: 700 } : undefined}
              onClick={() => {
                if (it.disabled) return
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

  // Keep it on screen (approx footprint), and flip submenus left near the edge.
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1920
  const vh = typeof window !== 'undefined' ? window.innerHeight : 1080
  const menuH = items.reduce((h, it) => h + (it.sep ? 6 : 24), 6)
  const left = Math.min(x, vw - 225)
  const top = Math.min(y, Math.max(4, vh - menuH - 48))
  const flip = x > vw - 400 // not enough room for a submenu on the right

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
        <MenuList items={items} onClose={onClose} canHover flip={flip} />
      </div>
    </>
  )
}
