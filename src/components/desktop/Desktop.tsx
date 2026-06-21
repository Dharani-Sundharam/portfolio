'use client'

import { useCallback, useRef, useState } from 'react'
import TaskbarSystem, {
  systemPrograms,
  AppIcon,
  type Program,
} from '@/components/desktop/TaskbarSystem'
import Window from '@/components/desktop/Window'
import ContextMenu, { type MenuItem } from '@/components/desktop/ContextMenu'

// Short placeholder body per program — replaced by real apps later.
function bodyFor(p: Program) {
  switch (p.id) {
    case 'flowax':
      return 'Local RAG & Agentic OS. A self-hosted AI engine — full app window coming soon.'
    case 'drivesync':
      return 'Autonomous rover V2V communication over ESP-NOW. Demo + writeup coming soon.'
    case 'resume':
      return 'Dharani_CV.txt — résumé viewer. Will open the real PDF/CV here.'
    case 'terminal':
      return 'C:\\Users\\Dharani> _   Interactive shell coming soon.'
    case 'nptel':
      return 'NPTEL certification document. Preview coming soon.'
    case 'control-panel':
      return 'Control Panel — skills shown as adjustable system settings. Coming soon.'
    default:
      return 'Coming soon.'
  }
}

type Win = {
  id: string
  program: Program
  minimized: boolean
  x: number
  y: number
  w: number
  h: number
}

export default function Desktop() {
  const [wins, setWins] = useState<Win[]>([])
  const [order, setOrder] = useState<string[]>([]) // stacking order; last = top/focused
  const focusedId = order[order.length - 1]

  // ── Desktop rubber-band (marquee) selection box ──
  const [sel, setSel] = useState<{ x: number; y: number; w: number; h: number } | null>(null)
  const selStart = useRef<{ x: number; y: number } | null>(null)
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null)
  const onSelMove = useCallback((e: PointerEvent) => {
    const s = selStart.current
    if (!s) return
    setSel({
      x: Math.min(s.x, e.clientX),
      y: Math.min(s.y, e.clientY),
      w: Math.abs(e.clientX - s.x),
      h: Math.abs(e.clientY - s.y),
    })
  }, [])
  const onSelEnd = useCallback(() => {
    selStart.current = null
    setSel(null)
    window.removeEventListener('pointermove', onSelMove)
    window.removeEventListener('pointerup', onSelEnd)
  }, [onSelMove])
  const startSel = (e: React.PointerEvent) => {
    if (e.button !== 0) return // left-button only; right-click opens the context menu
    setSelectedIcon(null) // clicking empty desktop deselects icons
    selStart.current = { x: e.clientX, y: e.clientY }
    setSel({ x: e.clientX, y: e.clientY, w: 0, h: 0 })
    window.addEventListener('pointermove', onSelMove)
    window.addEventListener('pointerup', onSelEnd)
  }

  // ── Desktop right-click context menu ──
  const [ctx, setCtx] = useState<{ x: number; y: number } | null>(null)
  const desktopMenu: MenuItem[] = [
    {
      label: 'View',
      sub: [
        { label: 'Large icons' },
        { label: 'Medium icons' },
        { label: 'Small icons' },
        { sep: true },
        { label: 'Auto arrange icons' },
        { label: 'Align icons to grid' },
        { sep: true },
        { label: 'Show desktop icons' },
      ],
    },
    {
      label: 'Sort by',
      sub: [{ label: 'Name' }, { label: 'Size' }, { label: 'Item type' }, { label: 'Date modified' }],
    },
    { label: 'Refresh' },
    { sep: true },
    { label: 'Paste', disabled: true },
    { label: 'Paste shortcut', disabled: true },
    { sep: true },
    {
      label: 'New',
      sub: [{ label: 'Folder' }, { label: 'Shortcut' }, { sep: true }, { label: 'Text Document' }],
    },
    { sep: true },
    { label: 'Screen resolution' },
    { label: 'Gadgets' },
    { label: 'Personalize' },
  ]

  const focus = (id: string) =>
    setOrder((o) => (o[o.length - 1] === id ? o : [...o.filter((x) => x !== id), id]))

  const open = (p: Program) => {
    setWins((cur) => {
      const existing = cur.find((w) => w.id === p.id)
      if (existing) return cur.map((w) => (w.id === p.id ? { ...w, minimized: false } : w))
      const n = cur.length
      return [...cur, { id: p.id, program: p, minimized: false, x: 130 + n * 28, y: 70 + n * 28, w: 480, h: 320 }]
    })
    focus(p.id)
  }

  const close = (id: string) => {
    setWins((cur) => cur.filter((w) => w.id !== id))
    setOrder((o) => o.filter((x) => x !== id))
  }

  const minimize = (id: string) => {
    setWins((cur) => cur.map((w) => (w.id === id ? { ...w, minimized: true } : w)))
    setOrder((o) => o.filter((x) => x !== id)) // drop focus; next window becomes active
  }

  // Taskbar button: restore+focus if minimized, minimize if focused, else focus.
  const taskbarClick = (id: string) => {
    const w = wins.find((x) => x.id === id)
    if (!w) return
    if (w.minimized) {
      setWins((cur) => cur.map((x) => (x.id === id ? { ...x, minimized: false } : x)))
      focus(id)
    } else if (focusedId === id) {
      minimize(id)
    } else {
      focus(id)
    }
  }

  // Desktop shortcuts (classic Win7 — Computer + Recycle Bin + a couple of programs).
  const desktopIcons = [
    { id: 'computer', label: 'Computer', src: '/win7/icons/computer.png', onOpen: () => {} },
    { id: 'recycle', label: 'Recycle Bin', src: '/win7/icons/recycle-empty.png', onOpen: () => {} },
    ...systemPrograms
      .filter((p) => ['flowax', 'drivesync', 'resume'].includes(p.id))
      .map((p) => ({ id: p.id, label: p.name, src: p.icon, onOpen: () => open(p) })),
  ]

  const openWindows = wins.map((w) => ({
    id: w.id,
    title: w.program.name,
    icon: w.program.icon,
    minimized: w.minimized,
    focused: focusedId === w.id,
  }))

  return (
    <div className="fixed inset-0 overflow-hidden select-none font-win7 win7-cursor">
      {/* ── Windows 7 wallpaper (real sprite; solid colour fallback if missing) ── */}
      <div
        onPointerDown={startSel}
        onContextMenu={(e) => {
          e.preventDefault()
          setCtx({ x: e.clientX, y: e.clientY })
        }}
        className="absolute inset-0 bg-[#0b2a5e]"
        style={{
          backgroundImage: "url('/win7/wallpaper/win7-default.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* ── Desktop icons ── */}
      <div className="absolute top-4 left-3 flex flex-col gap-1">
        {desktopIcons.map((d) => (
          <button
            key={d.id}
            onClick={() => setSelectedIcon(d.id)}
            onDoubleClick={d.onOpen}
            className={`group w-24 flex flex-col items-center gap-1 px-1 py-1.5 rounded outline-none border transition-colors ${
              selectedIcon === d.id
                ? 'border-[#cfeaff]/70 bg-[rgba(140,185,245,0.45)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.25),0_2px_5px_rgba(0,0,0,0.3)]'
                : 'border-transparent hover:border-[#e0f2ff]/60 hover:bg-[rgba(180,212,255,0.28)]'
            }`}
          >
            <AppIcon src={d.src} className="w-12 h-12 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]" />
            <span className="text-[12px] text-white text-center leading-tight [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]">
              {d.label}
            </span>
          </button>
        ))}
      </div>

      {/* ── Windows (.win7 scopes 7.css to here only) ── */}
      <div className="win7">
        {wins.map((w) => (
          <Window
            key={w.id}
            title={w.program.name}
            iconSrc={w.program.icon}
            z={100 + Math.max(0, order.indexOf(w.id))}
            focused={focusedId === w.id}
            minimized={w.minimized}
            initial={{ x: w.x, y: w.y, w: w.w, h: w.h }}
            onFocus={() => focus(w.id)}
            onClose={() => close(w.id)}
            onMinimize={() => minimize(w.id)}
          >
            <p className="font-win7-mono text-[13px] text-slate-700">{bodyFor(w.program)}</p>
          </Window>
        ))}
      </div>

      {/* ── Marquee selection box ── */}
      {sel && (sel.w > 2 || sel.h > 2) && (
        <div
          className="fixed z-[60] pointer-events-none rounded-[1px] border border-sky-300/90 bg-sky-300/25"
          style={{ left: sel.x, top: sel.y, width: sel.w, height: sel.h }}
        />
      )}

      {/* ── Right-click context menu ── */}
      {ctx && <ContextMenu x={ctx.x} y={ctx.y} items={desktopMenu} onClose={() => setCtx(null)} />}

      {/* ── Taskbar + Start Menu ── */}
      <TaskbarSystem openWindows={openWindows} onWindowButton={taskbarClick} onLaunchApp={open} />
    </div>
  )
}
