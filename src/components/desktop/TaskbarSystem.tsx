'use client'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Volume2, Wifi, Search, Power, ChevronUp } from 'lucide-react'

// ── Data ────────────────────────────────────────────────────────────────────
export type ProgramType = 'app' | 'document' | 'system'

export type Program = {
  id: string
  name: string
  icon: string // path to a real Win7 icon PNG
  type: ProgramType
  description?: string
}

export const systemPrograms: Program[] = [
  { id: 'flowax', name: 'FlowAX AI Engine', icon: '/win7/icons/folder.png', type: 'app', description: 'Local RAG & Agentic OS' },
  { id: 'drivesync', name: 'DriveSync (V2V)', icon: '/win7/icons/folder.png', type: 'app', description: 'Autonomous Rover Comm' },
  { id: 'resume', name: 'Dharani_CV.txt', icon: '/win7/icons/txt.png', type: 'document' },
  { id: 'terminal', name: 'Command Prompt', icon: '/win7/icons/cmd.png', type: 'system' },
  { id: 'nptel', name: 'NPTEL Certification', icon: '/win7/icons/folder.png', type: 'document' },
  { id: 'control-panel', name: 'Control Panel (Skills)', icon: '/win7/icons/control-panel.png', type: 'system' },
]

// Shared icon renderer — real Win7 PNGs everywhere.
export function AppIcon({ src, className, alt = '' }: { src: string; className?: string; alt?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} draggable={false} className={`object-contain select-none ${className ?? ''}`} />
}

// ── Helpers ───────────────────────────────────────────────────────────────--
function formatTime(d: Date): string {
  let h = d.getHours()
  const m = d.getMinutes()
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `${h}:${m.toString().padStart(2, '0')} ${ampm}`
}

function formatDate(d: Date): string {
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`
}

// ── Component ─────────────────────────────────────────────────────────────--
type TaskWin = { id: string; title: string; icon: string; minimized: boolean; focused: boolean }

type Props = {
  programs?: Program[]
  openWindows?: TaskWin[]
  onWindowButton?: (id: string) => void
  onLaunchApp?: (program: Program) => void
}

export default function TaskbarSystem({
  programs = systemPrograms,
  openWindows = [],
  onWindowButton,
  onLaunchApp,
}: Props) {
  const [isStartOpen, setIsStartOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  // Start null so server & client first paint match — set on mount (no hydration mismatch).
  const [currentTime, setCurrentTime] = useState<Date | null>(null)

  // Live clock
  useEffect(() => {
    setCurrentTime(new Date())
    const t = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return programs
    return programs.filter((p) => p.name.toLowerCase().includes(q))
  }, [programs, searchQuery])

  const launch = (p: Program) => {
    onLaunchApp?.(p)
    setIsStartOpen(false)
    setSearchQuery('')
  }

  const systemLinks = [
    { label: 'Computer', src: '/win7/icons/computer.png' },
    { label: 'Control Panel', src: '/win7/icons/control-panel.png' },
    { label: 'Devices and Printers', src: '/win7/icons/folder.png' },
  ]

  return (
    <>
      {/* Click-away layer to dismiss the Start Menu */}
      <AnimatePresence>
        {isStartOpen && (
          <motion.div
            key="start-backdrop"
            className="fixed inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsStartOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Taskbar ──────────────────────────────────────────────────────── */}
      <footer
        className="fixed bottom-0 left-0 w-full h-12 z-50 flex items-center justify-between px-2
                   bg-sky-900/30 backdrop-blur-md border-t border-sky-400/30
                   shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
      >
        {/* Left: Start Orb + pinned apps */}
        <div className="flex items-center gap-1">
          <StartOrb open={isStartOpen} onClick={() => setIsStartOpen((v) => !v)} />

          <div className="ml-1 flex items-center gap-1 overflow-x-auto">
            {openWindows.map((w) => (
              <button
                key={w.id}
                title={w.title}
                onClick={() => onWindowButton?.(w.id)}
                className={`relative flex items-center gap-1.5 h-9 px-2 max-w-[170px] rounded border transition-colors
                  ${w.focused && !w.minimized
                    ? 'bg-white/20 border-white/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]'
                    : `border-white/15 hover:bg-white/12 ${w.minimized ? 'bg-white/5 opacity-70' : 'bg-white/10'}`}`}
              >
                <AppIcon src={w.icon} className="w-6 h-6 shrink-0 drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]" />
                <span className="text-xs text-sky-50 truncate hidden sm:block">{w.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: System tray + Aero Peek */}
        <div className="flex items-center h-full">
          <button className="grid place-items-center w-7 h-9 rounded hover:bg-white/10 text-sky-50/80">
            <ChevronUp className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3 px-2">
            <Volume2 className="w-4 h-4 text-sky-50/90" />
            <Wifi className="w-4 h-4 text-sky-50/90" />
          </div>
          <div className="flex flex-col items-center justify-center leading-tight px-2 text-sky-50 select-none min-w-[58px]">
            <span className="text-xs font-medium tabular-nums">{currentTime ? formatTime(currentTime) : ' '}</span>
            <span className="text-[10px] text-sky-100/70 tabular-nums">{currentTime ? formatDate(currentTime) : ' '}</span>
          </div>
          {/* Aero Peek */}
          <div className="h-full w-[4px] border-l border-white/30 hover:bg-white/10" title="Show desktop" />
        </div>
      </footer>

      {/* ── Start Menu ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isStartOpen && (
          <motion.div
            key="start-menu"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            style={{ transformOrigin: 'bottom left' }}
            className="fixed bottom-12 left-0 w-[420px] h-[550px] max-h-[calc(100vh-3.5rem)] z-50
                       rounded-t-xl shadow-2xl flex flex-col overflow-hidden
                       bg-slate-900/40 backdrop-blur-xl border border-white/20"
          >
            {/* Body: split layout */}
            <div className="flex flex-1 min-h-0">
              {/* Left column — programs (solid light) */}
              <div className="w-[60%] bg-white/95 text-slate-800 flex flex-col min-h-0">
                <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Programs
                </div>
                <ul className="flex-1 overflow-y-auto px-1 pb-2">
                  {filtered.length === 0 && (
                    <li className="px-3 py-6 text-center text-sm text-slate-400">No results</li>
                  )}
                  {filtered.map((p) => (
                    <li key={p.id}>
                      <button
                        onClick={() => launch(p)}
                        className="group w-full flex items-center gap-3 px-2 py-2 rounded
                                   hover:bg-sky-100 text-left transition-colors"
                      >
                        <AppIcon src={p.icon} className="w-8 h-8 shrink-0" />
                        <span className="min-w-0">
                          <span className="block text-sm font-medium truncate">{p.name}</span>
                          {p.description && (
                            <span className="block text-[11px] text-slate-500 truncate">{p.description}</span>
                          )}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
                <button className="text-left px-4 py-2 text-sm text-sky-700 hover:bg-sky-100 border-t border-slate-200">
                  All Programs ▸
                </button>
              </div>

              {/* Right column — user + system links (Aero) */}
              <div className="w-[40%] flex flex-col text-sky-50 px-3 py-3">
                {/* User header */}
                <div className="flex flex-col items-center gap-2 pb-3 border-b border-white/15">
                  <div className="w-14 h-14 rounded overflow-hidden border border-white/50 shadow-[0_2px_6px_rgba(0,0,0,0.4)]">
                    <AppIcon src="/profile_pic.png" className="w-full h-full !object-cover" />
                  </div>
                  <span className="text-sm font-medium">Dharani Sundharam</span>
                </div>

                {/* System links */}
                <nav className="flex flex-col mt-2 text-sm">
                  {systemLinks.map(({ label, src }) => (
                    <button
                      key={label}
                      className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/10 text-left text-sky-50"
                    >
                      <AppIcon src={src} className="w-5 h-5" />
                      {label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Footer: search + power */}
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-900/50 border-t border-white/15">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search programs and files"
                  className="w-full bg-white/80 rounded-full pl-9 pr-3 py-1 text-sm text-black placeholder-gray-600
                             outline-none focus:bg-white focus:ring-2 focus:ring-sky-400/60"
                />
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1 rounded text-sm font-medium text-sky-50
                                 bg-white/10 hover:bg-white/20 border border-white/20 transition-colors">
                <Power className="w-4 h-4" />
                Shut Down
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ── Start Orb ─────────────────────────────────────────────────────────────--
// Real Win7 orb sprite (normal/hover swap); falls back to the CSS orb if the
// image is missing.
function StartOrb({ open, onClick }: { open: boolean; onClick: () => void }) {
  const [hover, setHover] = useState(false)
  const [imgOk, setImgOk] = useState(true)
  const src = open || hover ? '/win7/orb/orb-hover.png' : '/win7/orb/orb-normal.png'

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label="Start"
      className="relative grid place-items-center w-14 h-12 shrink-0"
    >
      {imgOk ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt="Start"
          draggable={false}
          onError={() => setImgOk(false)}
          className={`w-12 h-12 object-contain -translate-y-[1px] select-none transition active:scale-95 ${
            open || hover
              ? 'drop-shadow-[0_0_12px_rgba(130,225,255,0.85)]'
              : 'drop-shadow-[0_0_7px_rgba(56,189,248,0.4)]'
          }`}
        />
      ) : (
        <CssOrb open={open} />
      )}
    </button>
  )
}

// CSS fallback orb — only shown if the sprite fails to load.
function CssOrb({ open }: { open: boolean }) {
  return (
    <span
      className={`relative w-10 h-10 rounded-full grid place-items-center
        bg-[radial-gradient(circle_at_50%_30%,#7dd3fc_0%,#0369a1_55%,#0c2a4d_100%)]
        border border-sky-200/40 shadow-[inset_0_1px_2px_rgba(255,255,255,0.6),0_2px_6px_rgba(0,0,0,0.4)]
        ${open ? 'shadow-[0_0_18px_rgba(56,189,248,0.9)]' : ''}`}
    >
      <span className="grid grid-cols-2 gap-[2px] w-5 h-5 [transform:perspective(60px)_rotateY(-12deg)]">
        <span className="rounded-[1px] bg-[#f25022]" />
        <span className="rounded-[1px] bg-[#7fba00]" />
        <span className="rounded-[1px] bg-[#00a4ef]" />
        <span className="rounded-[1px] bg-[#ffb900]" />
      </span>
      <span className="pointer-events-none absolute inset-x-1 top-1 h-3 rounded-full bg-white/30 blur-[1px]" />
    </span>
  )
}
