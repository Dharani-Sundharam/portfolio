'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import TaskbarSystem, { AppIcon, type Program } from '@/components/desktop/TaskbarSystem'
import Window from '@/components/desktop/Window'
import ContextMenu, { type MenuItem } from '@/components/desktop/ContextMenu'
import ShutdownScreen, { type PowerPhase } from '@/components/desktop/ShutdownScreen'
import projectsData from '@/data/projects.json'
import { ProjectsFolder, ProjectDetail, type Project } from '@/components/desktop/apps/ProjectsApp'
import Terminal from '@/components/desktop/apps/Terminal'
import ControlPanel from '@/components/desktop/apps/ControlPanel'
import FileExplorer from '@/components/desktop/apps/FileExplorer'
import RecycleBin from '@/components/desktop/apps/RecycleBin'
import PdfViewer from '@/components/desktop/apps/PdfViewer'
import Browser from '@/components/desktop/apps/Browser'
import Guide from '@/components/desktop/apps/Guide'
import Notepad from '@/components/desktop/apps/Notepad'

const PROJECTS = (projectsData as { projects: Project[] }).projects

// External shortcuts (GitHub / LinkedIn / Mail desktop icons).
const SOCIAL = {
  github: 'https://github.com/Dharani-Sundharam',
  linkedin: 'https://www.linkedin.com/in/dharani-sundharam/',
  mail: 'https://mail.google.com/mail/?view=cm&fs=1&to=dharani3318s@gmail.com',
}
const openUrl = (url: string) => {
  if (typeof window !== 'undefined') window.open(url, '_blank', 'noopener,noreferrer')
}

// Trigger a file download (used by the CV right-click → Download).
const downloadFile = (url: string, name: string) => {
  if (typeof document === 'undefined') return
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
}

// Built-in apps that open as windows, keyed by id (one source of truth).
const APP_META: Record<string, { name: string; icon: string; type: Program['type'] }> = {
  computer: { name: 'Computer', icon: '/win7/icons/computer.png', type: 'system' },
  recycle: { name: 'Recycle Bin', icon: '/win7/icons/recycle-empty.png', type: 'system' },
  projects: { name: 'Projects', icon: '/win7/icons/folder.png', type: 'system' },
  resume: { name: 'Dharani_CV.pdf', icon: '/win7/icons/pdf.png', type: 'document' },
  terminal: { name: 'Command Prompt', icon: '/win7/icons/cmd.png', type: 'system' },
  'control-panel': { name: 'Control Panel', icon: '/win7/icons/control-panel.png', type: 'system' },
  browser: { name: 'Internet', icon: '/win7/icons/internet-explorer.png', type: 'app' },
  guide: { name: 'Read Me — Start Here', icon: '/win7/icons/txt.png', type: 'document' },
}

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
  maxed: boolean // open maximized (mobile)
  x: number
  y: number
  w: number
  h: number
}

type IconKind = 'system' | 'program' | 'folder' | 'txt'
type DesktopIcon = { id: string; label: string; src: string; kind: IconKind; onOpen: () => void }
type UserItem = { id: string; label: string; kind: 'folder' | 'txt' }

const FOLDER_ICON = '/win7/icons/folder.png'
const TXT_ICON = '/win7/icons/txt.png'

// ── Icon tile geometry (used for layout + marquee hit-testing) ──
const TILE_W = 84
const TILE_H = 92
const GRID_X = 14
const GRID_Y = 12
const TASKBAR_H = 48
const ICON_PX: Record<'large' | 'medium' | 'small', number> = { large: 48, medium: 36, small: 28 }

// Lay icons out top-to-bottom, wrapping into a new column when one fills up.
function gridLayout(ids: string[]): Record<string, { x: number; y: number }> {
  const { rows } = gridDims()
  const pos: Record<string, { x: number; y: number }> = {}
  ids.forEach((id, i) => {
    const col = Math.floor(i / rows)
    const row = i % rows
    pos[id] = { x: GRID_X + col * TILE_W, y: GRID_Y + row * TILE_H }
  })
  return pos
}

// Do two rects overlap? (marquee vs. icon tile)
function intersects(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}

// ── Grid snapping (so icons never overlap, Win7 "align to grid" behaviour) ──
function gridDims() {
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1920
  const vh = typeof window !== 'undefined' ? window.innerHeight : 1080
  return {
    cols: Math.max(1, Math.floor((vw - GRID_X) / TILE_W)),
    rows: Math.max(1, Math.floor((vh - GRID_Y - TASKBAR_H) / TILE_H)),
  }
}
const ckey = (c: number, r: number) => `${c},${r}`
function cellOf(p: { x: number; y: number }, cols: number, rows: number) {
  return {
    c: Math.max(0, Math.min(cols - 1, Math.round((p.x - GRID_X) / TILE_W))),
    r: Math.max(0, Math.min(rows - 1, Math.round((p.y - GRID_Y) / TILE_H))),
  }
}
const cellToPos = (c: number, r: number) => ({ x: GRID_X + c * TILE_W, y: GRID_Y + r * TILE_H })

// Nearest free grid cell to (c,r) not already taken — spiral outward by ring.
function findFreeCell(c: number, r: number, taken: Set<string>, cols: number, rows: number) {
  if (!taken.has(ckey(c, r))) return { c, r }
  for (let radius = 1; radius < cols + rows + 2; radius++) {
    let best: { c: number; r: number } | null = null
    let bestD = Infinity
    for (let dc = -radius; dc <= radius; dc++) {
      for (let dr = -radius; dr <= radius; dr++) {
        if (Math.max(Math.abs(dc), Math.abs(dr)) !== radius) continue // current ring only
        const cc = c + dc
        const rr = r + dr
        if (cc < 0 || rr < 0 || cc >= cols || rr >= rows) continue
        if (taken.has(ckey(cc, rr))) continue
        const d = dc * dc + dr * dr
        if (d < bestD) {
          bestD = d
          best = { c: cc, r: rr }
        }
      }
    }
    if (best) return best
  }
  return { c, r } // fallback (desktop full)
}

// Initial window size per app id.
function sizeFor(id: string): { w: number; h: number } {
  if (id === 'projects') return { w: 660, h: 460 }
  if (id === 'resume') return { w: 640, h: 600 }
  if (id === 'terminal') return { w: 660, h: 400 }
  if (id === 'control-panel') return { w: 720, h: 520 }
  if (id === 'computer') return { w: 640, h: 440 }
  if (id === 'recycle') return { w: 560, h: 400 }
  if (id === 'browser') return { w: 820, h: 560 }
  if (id === 'guide') return { w: 460, h: 440 }
  if (id.startsWith('project-')) return { w: 600, h: 560 }
  if (id.startsWith('txt-')) return { w: 560, h: 420 }
  return { w: 480, h: 320 }
}

// First empty cell scanning top-to-bottom then next column (where Win7 drops new items).
function firstFreeCell(taken: Set<string>, cols: number, rows: number) {
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      if (!taken.has(ckey(c, r))) return { c, r }
    }
  }
  return { c: 0, r: 0 }
}

export default function Desktop() {
  const [wins, setWins] = useState<Win[]>([])
  const [order, setOrder] = useState<string[]>([]) // stacking order; last = top/focused
  const focusedId = order[order.length - 1]

  const [power, setPower] = useState<PowerPhase | null>(null) // shutdown flow
  const peekRef = useRef<string[]>([]) // windows hidden by "Show desktop", to restore

  const focus = (id: string) =>
    setOrder((o) => (o[o.length - 1] === id ? o : [...o.filter((x) => x !== id), id]))

  const open = useCallback((p: Program) => {
    setWins((cur) => {
      const existing = cur.find((w) => w.id === p.id)
      if (existing) return cur.map((w) => (w.id === p.id ? { ...w, minimized: false } : w))
      const n = cur.length
      const vw = typeof window !== 'undefined' ? window.innerWidth : 1280
      const vh = typeof window !== 'undefined' ? window.innerHeight : 800
      // Phones / small tablets: open maximized so the app fills the screen.
      const mobile =
        typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches && vw < 1024
      // Clamp the (restore) size + position so a window never exceeds the viewport.
      const d = sizeFor(p.id)
      const w = Math.min(d.w, Math.max(260, vw - 12))
      const h = Math.min(d.h, Math.max(140, vh - TASKBAR_H - 12))
      const x = Math.max(8, Math.min(150 + n * 28, vw - w - 8))
      const y = Math.max(8, Math.min(64 + n * 28, vh - TASKBAR_H - h - 8))
      return [...cur, { id: p.id, program: p, minimized: false, maxed: mobile, x, y, w, h }]
    })
    setOrder((o) => (o[o.length - 1] === p.id ? o : [...o.filter((x) => x !== p.id), p.id]))
  }, [])

  // Launch a built-in app by id (used by desktop icons, the explorer, the taskbar).
  const openApp = useCallback(
    (id: string) => {
      const m = APP_META[id]
      if (m) open({ id, name: m.name, icon: m.icon, type: m.type })
    },
    [open],
  )

  // Open a project in its own detail window (looked up later by id in windowBody).
  const openProject = useCallback(
    (p: Project) => open({ id: `project-${p.id}`, name: p.name, icon: FOLDER_ICON, type: 'document' }),
    [open],
  )

  // What renders inside each window's body, by program id.
  const windowBody = (p: Program) => {
    if (p.id === 'projects') return <ProjectsFolder projects={PROJECTS} onOpen={openProject} />
    if (p.id.startsWith('project-')) {
      const proj = PROJECTS.find((x) => `project-${x.id}` === p.id)
      return proj ? <ProjectDetail project={proj} /> : null
    }
    if (p.id === 'resume') return <PdfViewer src="/resume.pdf" />
    if (p.id === 'computer') return <FileExplorer onOpenApp={openApp} onOpenUrl={openUrl} />
    if (p.id === 'recycle') return <RecycleBin />
    if (p.id === 'terminal') return <Terminal onExit={() => close('terminal')} />
    if (p.id === 'control-panel') return <ControlPanel />
    if (p.id === 'browser') return <Browser />
    if (p.id === 'guide') return <Guide />
    if (p.id.startsWith('folder-')) {
      return (
        <div className="absolute inset-0 flex items-center justify-center text-[12px] text-slate-500 font-win7">
          This folder is empty.
        </div>
      )
    }
    if (p.id.startsWith('txt-')) {
      return <Notepad fileName={p.name} onExit={() => close(p.id)} />
    }
    return <p className="font-win7-mono text-[13px] text-slate-700">{bodyFor(p)}</p>
  }

  const close = (id: string) => {
    setWins((cur) => cur.filter((w) => w.id !== id))
    setOrder((o) => o.filter((x) => x !== id))
  }

  const minimize = (id: string) => {
    setWins((cur) => cur.map((w) => (w.id === id ? { ...w, minimized: true } : w)))
    setOrder((o) => o.filter((x) => x !== id))
  }

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

  // Aero "Show desktop": minimize everything; click again to restore what was hidden.
  const showDesktop = () => {
    const visible = wins.filter((w) => !w.minimized)
    if (visible.length > 0) {
      peekRef.current = visible.map((w) => w.id)
      setWins((cur) => cur.map((w) => ({ ...w, minimized: true })))
      setOrder([])
    } else {
      const ids = peekRef.current
      peekRef.current = []
      setWins((cur) => cur.map((w) => (ids.includes(w.id) ? { ...w, minimized: false } : w)))
      setOrder(ids)
    }
  }

  // ── User-created desktop items (folders / text documents) ──
  const [userItems, setUserItems] = useState<UserItem[]>([])
  const [renaming, setRenaming] = useState<{ id: string; value: string } | null>(null)
  const [refreshTick, setRefreshTick] = useState(0) // bumping it redraws the icon layer
  const nextItemId = useRef(1)

  // ── Desktop shortcuts (defaults + user items) ──
  const desktopIcons: DesktopIcon[] = useMemo(
    () => [
      { id: 'computer', label: 'Computer', src: '/win7/icons/computer.png', kind: 'system' as const, onOpen: () => openApp('computer') },
      { id: 'guide', label: 'Read Me', src: '/win7/icons/txt.png', kind: 'system' as const, onOpen: () => openApp('guide') },
      { id: 'projects', label: 'Projects', src: FOLDER_ICON, kind: 'system' as const, onOpen: () => openApp('projects') },
      { id: 'skills', label: 'Skills', src: '/win7/icons/control-panel.png', kind: 'system' as const, onOpen: () => openApp('control-panel') },
      { id: 'browser', label: 'Internet', src: '/win7/icons/internet-explorer.png', kind: 'system' as const, onOpen: () => openApp('browser') },
      { id: 'resume', label: 'Dharani_CV', src: '/win7/icons/pdf.png', kind: 'system' as const, onOpen: () => openApp('resume') },
      { id: 'github', label: 'GitHub', src: '/win7/icons/github.png', kind: 'system' as const, onOpen: () => openUrl(SOCIAL.github) },
      { id: 'linkedin', label: 'LinkedIn', src: '/win7/icons/linkedin.png', kind: 'system' as const, onOpen: () => openUrl(SOCIAL.linkedin) },
      { id: 'mail', label: 'Mail', src: '/images/google.png', kind: 'system' as const, onOpen: () => openUrl(SOCIAL.mail) },
      { id: 'recycle', label: 'Recycle Bin', src: '/win7/icons/recycle-empty.png', kind: 'system' as const, onOpen: () => openApp('recycle') },
      ...userItems.map((u) => {
        const icon = u.kind === 'folder' ? FOLDER_ICON : TXT_ICON
        return {
          id: u.id,
          label: u.label,
          src: icon,
          kind: u.kind,
          onOpen: () =>
            open({ id: u.id, name: u.label, icon, type: u.kind === 'folder' ? 'system' : 'document' }),
        }
      }),
    ],
    [open, openApp, userItems],
  )
  const iconIds = useMemo(() => desktopIcons.map((d) => d.id), [desktopIcons])
  const iconById = useMemo(
    () => Object.fromEntries(desktopIcons.map((d) => [d.id, d])),
    [desktopIcons],
  )

  // ── Icon positions, selection, sizing, visibility ──
  const [iconPos, setIconPos] = useState<Record<string, { x: number; y: number }>>(() =>
    gridLayout(iconIds),
  )
  const [selectedIcons, setSelectedIcons] = useState<Set<string>>(new Set())
  const [iconSize, setIconSize] = useState<'large' | 'medium' | 'small'>('large')
  const [showIcons, setShowIcons] = useState(true)

  // Safety net: every icon must have a non-overlapping cell. Covers newly added
  // built-in icons and hot-reload, so nothing stacks at the top-left corner.
  useEffect(() => {
    setIconPos((prev) => {
      const missing = iconIds.filter((id) => !prev[id])
      if (missing.length === 0) return prev
      const { cols, rows } = gridDims()
      const taken = new Set<string>()
      for (const id of iconIds) {
        const p = prev[id]
        if (p) {
          const c = cellOf(p, cols, rows)
          taken.add(ckey(c.c, c.r))
        }
      }
      const next = { ...prev }
      for (const id of missing) {
        const free = firstFreeCell(taken, cols, rows)
        taken.add(ckey(free.c, free.r))
        next[id] = cellToPos(free.c, free.r)
      }
      return next
    })
  }, [iconIds])

  const clamp = (x: number, y: number) => {
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1920
    const vh = typeof window !== 'undefined' ? window.innerHeight : 1080
    return {
      x: Math.max(0, Math.min(x, vw - TILE_W)),
      y: Math.max(0, Math.min(y, vh - TASKBAR_H - TILE_H + 8)),
    }
  }

  // ── Rubber-band (marquee) selection ──
  const [sel, setSel] = useState<{ x: number; y: number; w: number; h: number } | null>(null)
  const selStart = useRef<{ x: number; y: number } | null>(null)
  const selBase = useRef<Set<string>>(new Set())

  const hitTest = useCallback(
    (rect: { x: number; y: number; w: number; h: number }) => {
      const hits = new Set<string>(selBase.current)
      for (const id of iconIds) {
        const p = iconPos[id]
        if (p && intersects(rect, { x: p.x, y: p.y, w: TILE_W, h: TILE_H })) hits.add(id)
      }
      return hits
    },
    [iconIds, iconPos],
  )

  const onSelMove = useCallback(
    (e: PointerEvent) => {
      const s = selStart.current
      if (!s) return
      const rect = {
        x: Math.min(s.x, e.clientX),
        y: Math.min(s.y, e.clientY),
        w: Math.abs(e.clientX - s.x),
        h: Math.abs(e.clientY - s.y),
      }
      setSel(rect)
      setSelectedIcons(hitTest(rect))
    },
    [hitTest],
  )
  const onSelEnd = useCallback(() => {
    selStart.current = null
    setSel(null)
    window.removeEventListener('pointermove', onSelMove)
    window.removeEventListener('pointerup', onSelEnd)
  }, [onSelMove])

  const startSel = (e: React.PointerEvent) => {
    if (e.button !== 0) return // left-button only; right-click opens the context menu
    setCtx(null)
    selBase.current = e.shiftKey ? new Set(selectedIcons) : new Set()
    if (!e.shiftKey) setSelectedIcons(new Set()) // clicking empty desktop deselects
    selStart.current = { x: e.clientX, y: e.clientY }
    setSel({ x: e.clientX, y: e.clientY, w: 0, h: 0 })
    window.addEventListener('pointermove', onSelMove)
    window.addEventListener('pointerup', onSelEnd)
  }

  // ── Dragging icons (single or the whole selection) ──
  const iconDrag = useRef<{
    sx: number
    sy: number
    origins: Record<string, { x: number; y: number }>
    moved: boolean
    collapseTo: string | null
  } | null>(null)

  const onIconMove = useCallback((e: PointerEvent) => {
    const d = iconDrag.current
    if (!d) return
    const dx = e.clientX - d.sx
    const dy = e.clientY - d.sy
    if (Math.abs(dx) + Math.abs(dy) > 4) d.moved = true
    setIconPos((prev) => {
      const next = { ...prev }
      for (const id in d.origins) {
        const o = d.origins[id]
        next[id] = clamp(o.x + dx, o.y + dy)
      }
      return next
    })
  }, [])

  // Snap the dragged icons to the nearest free grid cells so none overlap.
  const snapIcons = useCallback(
    (draggedIds: string[]) => {
      const { cols, rows } = gridDims()
      setIconPos((prev) => {
        const dragged = new Set(draggedIds)
        const taken = new Set<string>()
        // Stationary icons keep their cells (and are obstacles for the dragged ones).
        for (const id of iconIds) {
          if (dragged.has(id) || !prev[id]) continue
          const { c, r } = cellOf(prev[id], cols, rows)
          taken.add(ckey(c, r))
        }
        const next = { ...prev }
        // Resolve in a stable order (top-left first) for predictable packing.
        const ordered = [...draggedIds]
          .filter((id) => prev[id])
          .sort((a, b) => prev[a].y - prev[b].y || prev[a].x - prev[b].x)
        for (const id of ordered) {
          const want = cellOf(prev[id], cols, rows)
          const free = findFreeCell(want.c, want.r, taken, cols, rows)
          taken.add(ckey(free.c, free.r))
          next[id] = cellToPos(free.c, free.r)
        }
        return next
      })
    },
    [iconIds],
  )

  const onIconUp = useCallback(() => {
    const d = iconDrag.current
    if (d) {
      if (!d.moved && d.collapseTo) setSelectedIcons(new Set([d.collapseTo]))
      if (d.moved) snapIcons(Object.keys(d.origins))
    }
    iconDrag.current = null
    window.removeEventListener('pointermove', onIconMove)
    window.removeEventListener('pointerup', onIconUp)
  }, [onIconMove, snapIcons])

  const startIconDrag = (e: React.PointerEvent, id: string) => {
    if (e.button !== 0) return
    e.stopPropagation() // don't start a marquee
    setCtx(null)

    let selection = new Set(selectedIcons)
    let collapseTo: string | null = null
    if (e.shiftKey) {
      selection.has(id) ? selection.delete(id) : selection.add(id)
    } else if (selection.has(id)) {
      collapseTo = id // keep the group for now; collapse to this one if we don't drag
    } else {
      selection = new Set([id])
    }
    setSelectedIcons(selection)
    if (!selection.has(id)) return // shift-click just toggled it off — nothing to drag

    const origins: Record<string, { x: number; y: number }> = {}
    selection.forEach((sid) => {
      if (iconPos[sid]) origins[sid] = iconPos[sid]
    })
    iconDrag.current = { sx: e.clientX, sy: e.clientY, origins, moved: false, collapseTo }
    window.addEventListener('pointermove', onIconMove)
    window.addEventListener('pointerup', onIconUp)
  }

  // ── Right-click context menus ──
  const [ctx, setCtx] = useState<{ x: number; y: number; items: MenuItem[] } | null>(null)

  const relayout = (ids: string[]) => setIconPos(gridLayout(ids))

  // Redraw the desktop icon layer (Win7 "Refresh" — re-paints, keeps positions).
  const refresh = () => {
    setCtx(null)
    setRefreshTick((t) => t + 1)
  }

  // Create a new folder / text document, drop it in the first free cell, rename mode.
  const createItem = (kind: 'folder' | 'txt') => {
    setCtx(null)
    const base = kind === 'folder' ? 'New folder' : 'New Text Document'
    const ext = kind === 'txt' ? '.txt' : ''
    const used = new Set(desktopIcons.map((d) => d.label))
    let label = `${base}${ext}`
    for (let n = 2; used.has(label); n++) label = `${base} (${n})${ext}`

    const id = `${kind}-${nextItemId.current++}`
    const { cols, rows } = gridDims()
    const taken = new Set<string>()
    for (const did of iconIds) {
      const pp = iconPos[did]
      if (pp) {
        const { c, r } = cellOf(pp, cols, rows)
        taken.add(ckey(c, r))
      }
    }
    const free = firstFreeCell(taken, cols, rows)
    setIconPos((prev) => ({ ...prev, [id]: cellToPos(free.c, free.r) }))
    setUserItems((prev) => [...prev, { id, label, kind }])
    setSelectedIcons(new Set([id]))
    setRenaming({ id, value: label }) // Win7 drops new items straight into rename mode
  }

  const commitRename = () => {
    setRenaming((r) => {
      if (r) {
        const v = r.value.trim()
        if (v) setUserItems((prev) => prev.map((u) => (u.id === r.id ? { ...u, label: v } : u)))
      }
      return null
    })
  }

  // Delete the given user items (folders / text docs) and close their windows.
  const deleteItems = (idList: string[]) => {
    setCtx(null)
    const ids = new Set(idList.filter((id) => id.startsWith('folder-') || id.startsWith('txt-')))
    if (ids.size === 0) return
    setUserItems((prev) => prev.filter((u) => !ids.has(u.id)))
    setWins((cur) => cur.filter((w) => !ids.has(w.id)))
    setOrder((o) => o.filter((x) => !ids.has(x)))
    setIconPos((prev) => {
      const next = { ...prev }
      ids.forEach((id) => delete next[id])
      return next
    })
    setSelectedIcons((prev) => new Set([...prev].filter((id) => !ids.has(id))))
  }

  // Delete key removes the selected user items (never the protected defaults).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Delete' || renaming) return
      const el = document.activeElement
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) return
      if (selectedIcons.size > 0) deleteItems([...selectedIcons])
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIcons, renaming])

  const desktopMenu = (): MenuItem[] => [
    {
      label: 'View',
      sub: [
        { label: 'Large icons', onClick: () => setIconSize('large') },
        { label: 'Medium icons', onClick: () => setIconSize('medium') },
        { label: 'Small icons', onClick: () => setIconSize('small') },
        { sep: true },
        { label: 'Auto arrange icons', onClick: () => relayout(iconIds) },
        { label: 'Align icons to grid', onClick: () => relayout(iconIds) },
        { sep: true },
        { label: showIcons ? 'Hide desktop icons' : 'Show desktop icons', onClick: () => setShowIcons((v) => !v) },
      ],
    },
    {
      label: 'Sort by',
      sub: [
        {
          label: 'Name',
          onClick: () => relayout([...iconIds].sort((a, b) => iconById[a].label.localeCompare(iconById[b].label))),
        },
        { label: 'Size', onClick: () => relayout(iconIds) },
        { label: 'Item type', onClick: () => relayout(iconIds) },
        { label: 'Date modified', onClick: () => relayout(iconIds) },
      ],
    },
    { label: 'Refresh', onClick: refresh },
    { sep: true },
    { label: 'Paste', disabled: true },
    { label: 'Paste shortcut', disabled: true },
    { sep: true },
    {
      label: 'New',
      sub: [
        { label: 'Folder', icon: FOLDER_ICON, onClick: () => createItem('folder') },
        { label: 'Shortcut', disabled: true },
        { sep: true },
        { label: 'Text Document', icon: TXT_ICON, onClick: () => createItem('txt') },
      ],
    },
    { sep: true },
    { label: 'Screen resolution', disabled: true },
    { label: 'Gadgets', disabled: true },
    { label: 'Personalize', disabled: true },
  ]

  const iconMenu = (icon: DesktopIcon): MenuItem[] => {
    const isUser = icon.kind === 'folder' || icon.kind === 'txt'
    // Delete the whole selection if this icon is part of it, else just this icon.
    const targets = (selectedIcons.has(icon.id) ? [...selectedIcons] : [icon.id]).filter(
      (id) => id.startsWith('folder-') || id.startsWith('txt-'),
    )
    return [
      { label: 'Open', onClick: icon.onOpen, bold: true },
      ...(icon.id === 'resume'
        ? [{ label: 'Download', onClick: () => downloadFile('/resume.pdf', 'Dharani_Sundharam_CV.pdf') }]
        : []),
      { sep: true },
      { label: 'Cut', disabled: true },
      { label: 'Copy', disabled: true },
      { sep: true },
      { label: 'Delete', disabled: !isUser, onClick: isUser ? () => deleteItems(targets) : undefined },
      {
        label: 'Rename',
        disabled: !isUser,
        onClick: isUser ? () => setRenaming({ id: icon.id, value: icon.label }) : undefined,
      },
      { sep: true },
      { label: 'Properties', disabled: true },
    ]
  }

  const openWindows = wins.map((w) => ({
    id: w.id,
    title: w.program.name,
    icon: w.program.icon,
    minimized: w.minimized,
    focused: focusedId === w.id,
  }))

  const iconImgPx = ICON_PX[iconSize]

  return (
    <div className="fixed inset-0 overflow-hidden select-none font-win7 win7-cursor">
      {/* ── Windows 7 wallpaper (real sprite; solid colour fallback if missing) ── */}
      <div
        onPointerDown={startSel}
        onContextMenu={(e) => {
          e.preventDefault()
          setCtx({ x: e.clientX, y: e.clientY, items: desktopMenu() })
        }}
        className="absolute inset-0 bg-[#0b2a5e] touch-none"
        style={{
          backgroundImage: "url('/win7/wallpaper/win7-default.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* ── Desktop icons (absolute, draggable; container passes empty clicks through) ── */}
      {showIcons && (
        <div key={refreshTick} className="absolute inset-0 z-10 pointer-events-none animate-desktop-redraw">
          {desktopIcons.map((d) => {
            const p = iconPos[d.id] ?? { x: GRID_X, y: GRID_Y }
            const selected = selectedIcons.has(d.id)
            const isRenaming = renaming?.id === d.id
            return (
              <div
                key={d.id}
                role="button"
                tabIndex={-1}
                onPointerDown={(e) => {
                  if (isRenaming) return // don't drag while editing the name
                  startIconDrag(e, d.id)
                }}
                onDoubleClick={d.onOpen}
                onContextMenu={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (!selected) setSelectedIcons(new Set([d.id]))
                  setCtx({ x: e.clientX, y: e.clientY, items: iconMenu(d) })
                }}
                style={{ left: p.x, top: p.y, width: TILE_W }}
                className={`pointer-events-auto absolute touch-none flex flex-col items-center gap-1 px-1 py-1.5 rounded outline-none border transition-colors ${
                  selected
                    ? 'border-[#cfeaff]/70 bg-[rgba(140,185,245,0.45)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.25),0_2px_5px_rgba(0,0,0,0.3)]'
                    : 'border-transparent hover:border-[#e0f2ff]/60 hover:bg-[rgba(180,212,255,0.28)]'
                }`}
              >
                <AppIcon
                  src={d.src}
                  style={{ width: iconImgPx, height: iconImgPx }}
                  className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]"
                />
                {isRenaming ? (
                  <input
                    autoFocus
                    value={renaming.value}
                    onFocus={(e) => e.currentTarget.select()}
                    onChange={(e) => setRenaming({ id: d.id, value: e.target.value })}
                    onPointerDown={(e) => e.stopPropagation()}
                    onDoubleClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitRename()
                      else if (e.key === 'Escape') setRenaming(null)
                    }}
                    onBlur={commitRename}
                    className="w-[80px] px-0.5 text-[12px] text-center text-black bg-white border border-[#7da2ce] outline-none"
                  />
                ) : (
                  <span className="text-[12px] text-white text-center leading-tight [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]">
                    {d.label}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}

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
            initialMaximized={w.maxed}
            initial={{ x: w.x, y: w.y, w: w.w, h: w.h }}
            onFocus={() => focus(w.id)}
            onClose={() => close(w.id)}
            onMinimize={() => minimize(w.id)}
          >
            {windowBody(w.program)}
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
      {ctx && <ContextMenu x={ctx.x} y={ctx.y} items={ctx.items} onClose={() => setCtx(null)} />}

      {/* ── Taskbar + Start Menu ── */}
      <TaskbarSystem
        openWindows={openWindows}
        onWindowButton={taskbarClick}
        onLaunchApp={open}
        onShowDesktop={showDesktop}
        onShutDown={() => setPower('confirm')}
      />

      {/* ── Shut Down flow ── */}
      {power && (
        <ShutdownScreen
          phase={power}
          github={SOCIAL.github}
          onCancel={() => setPower(null)}
          onConfirm={() => setPower('shutting')}
          onShutdownComplete={() => setPower('off')}
          onRestart={() => {
            if (typeof window !== 'undefined') window.location.reload()
          }}
        />
      )}
    </div>
  )
}
