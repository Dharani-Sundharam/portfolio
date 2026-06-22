'use client'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Volume2, VolumeX, Wifi, Search, Power, ChevronUp } from 'lucide-react'

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
  { id: 'browser', name: 'Internet', icon: '/win7/icons/internet-explorer.png', type: 'app', description: 'My pages, feed & search' },
  { id: 'projects', name: 'Projects', icon: '/win7/icons/folder.png', type: 'system', description: 'My builds & hardware' },
  { id: 'resume', name: 'Dharani_CV.pdf', icon: '/win7/icons/pdf.png', type: 'document' },
  { id: 'terminal', name: 'Command Prompt', icon: '/win7/icons/cmd.png', type: 'system' },
  { id: 'control-panel', name: 'Control Panel (Skills)', icon: '/win7/icons/control-panel.png', type: 'system' },
]

// Apps pinned to the taskbar (always shown; highlight when running).
export const pinnedApps: Program[] = [
  { id: 'browser', name: 'Internet', icon: '/win7/icons/internet-explorer.png', type: 'app' },
  { id: 'computer', name: 'Computer', icon: '/win7/icons/computer.png', type: 'system' },
  { id: 'projects', name: 'Projects', icon: '/win7/icons/folder.png', type: 'system' },
  { id: 'terminal', name: 'Command Prompt', icon: '/win7/icons/cmd.png', type: 'system' },
  { id: 'control-panel', name: 'Control Panel', icon: '/win7/icons/control-panel.png', type: 'system' },
]

// Shared icon renderer — real Win7 PNGs everywhere.
export function AppIcon({
  src,
  className,
  alt = '',
  style,
}: {
  src: string
  className?: string
  alt?: string
  style?: React.CSSProperties
}) {
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={src}
      alt={alt}
      draggable={false}
      style={style}
      className={`object-contain select-none ${className ?? ''}`}
    />
  )
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
  onShutDown?: () => void
  onShowDesktop?: () => void
}

type TrayPanel = null | 'vol' | 'net' | 'clock' | 'hidden'

export default function TaskbarSystem({
  programs = systemPrograms,
  openWindows = [],
  onWindowButton,
  onLaunchApp,
  onShutDown,
  onShowDesktop,
}: Props) {
  const [isStartOpen, setIsStartOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  // Start null so server & client first paint match — set on mount (no hydration mismatch).
  const [currentTime, setCurrentTime] = useState<Date | null>(null)

  // System-tray flyouts + (cosmetic) volume state.
  const [tray, setTray] = useState<TrayPanel>(null)
  const [volume, setVolume] = useState(70)
  const [muted, setMuted] = useState(false)
  const toggleTray = (k: Exclude<TrayPanel, null>) => setTray((t) => (t === k ? null : k))

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

  // Merge pinned apps with running windows (running pinned apps just light up).
  const taskbarItems = useMemo(() => {
    const pinnedIds = new Set(pinnedApps.map((p) => p.id))
    const fromPinned = pinnedApps.map((p) => ({
      id: p.id,
      title: p.name,
      icon: p.icon,
      program: p as Program | null,
      win: openWindows.find((w) => w.id === p.id),
    }))
    const extras = openWindows
      .filter((w) => !pinnedIds.has(w.id))
      .map((w) => ({ id: w.id, title: w.title, icon: w.icon, program: null as Program | null, win: w }))
    return [...fromPinned, ...extras]
  }, [openWindows])

  const launch = (p: Program) => {
    onLaunchApp?.(p)
    setIsStartOpen(false)
    setSearchQuery('')
  }

  const systemLinks: { label: string; src: string; appId?: string }[] = [
    { label: 'Computer', src: '/win7/icons/computer.png' },
    { label: 'Control Panel', src: '/win7/icons/control-panel.png', appId: 'control-panel' },
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
            {taskbarItems.map((it) => {
              const open = it.win
              const cls = !open
                ? 'border-transparent hover:bg-white/12 hover:border-white/20' // pinned, not running
                : open.focused && !open.minimized
                  ? 'bg-white/20 border-white/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]'
                  : `border-white/15 hover:bg-white/12 ${open.minimized ? 'bg-white/5 opacity-70' : 'bg-white/10'}`
              return (
                <button
                  key={it.id}
                  title={it.title}
                  onClick={() => (open ? onWindowButton?.(it.id) : it.program && onLaunchApp?.(it.program))}
                  className={`relative flex items-center gap-1.5 h-10 rounded border transition-colors ${open ? 'px-2.5 max-w-[180px]' : 'px-2.5 justify-center'} ${cls}`}
                >
                  <AppIcon src={it.icon} className="w-8 h-8 shrink-0 drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]" />
                  {open && <span className="text-xs text-sky-50 truncate hidden sm:block">{it.title}</span>}
                </button>
              )
            })}
          </div>
        </div>

        {/* Right: System tray + Aero Peek */}
        <div className="flex items-center h-full">
          <button
            onClick={() => toggleTray('hidden')}
            title="Show hidden icons"
            className={`grid place-items-center w-7 h-9 rounded text-sky-50/80 ${tray === 'hidden' ? 'bg-white/15' : 'hover:bg-white/10'}`}
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => toggleTray('net')}
            title="Network"
            className={`grid place-items-center w-8 h-9 rounded ${tray === 'net' ? 'bg-white/15' : 'hover:bg-white/10'}`}
          >
            <Wifi className="w-4 h-4 text-sky-50/90" />
          </button>
          <button
            onClick={() => toggleTray('vol')}
            title="Volume"
            className={`grid place-items-center w-8 h-9 rounded ${tray === 'vol' ? 'bg-white/15' : 'hover:bg-white/10'}`}
          >
            {muted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-sky-50/90" />
            ) : (
              <Volume2 className="w-4 h-4 text-sky-50/90" />
            )}
          </button>
          <button
            onClick={() => toggleTray('clock')}
            title="There's no better time to be here than right now ✨"
            className={`flex flex-col items-center justify-center leading-tight px-2 h-9 rounded text-sky-50 select-none min-w-[60px] ${tray === 'clock' ? 'bg-white/15' : 'hover:bg-white/10'}`}
          >
            <span className="text-xs font-medium tabular-nums">{currentTime ? formatTime(currentTime) : ' '}</span>
            <span className="text-[10px] text-sky-100/70 tabular-nums">{currentTime ? formatDate(currentTime) : ' '}</span>
          </button>
          {/* Aero Peek — Show desktop */}
          <button
            onClick={() => onShowDesktop?.()}
            title="Show desktop"
            className="h-full w-[12px] border-l border-white/30 hover:bg-white/25"
          />
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
            className="fixed bottom-12 left-0 w-[420px] max-w-[94vw] h-[550px] max-h-[calc(100vh-3.5rem)] z-50
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
                  {systemLinks.map(({ label, src, appId }) => (
                    <button
                      key={label}
                      onClick={() => {
                        const prog = appId && programs.find((p) => p.id === appId)
                        if (prog) launch(prog)
                      }}
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
              <button
                onClick={() => {
                  setIsStartOpen(false)
                  onShutDown?.()
                }}
                className="flex items-center gap-1.5 px-3 py-1 rounded text-sm font-medium text-sky-50
                           bg-white/10 hover:bg-white/20 border border-white/20 transition-colors"
              >
                <Power className="w-4 h-4" />
                Shut Down
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── System-tray flyouts ──────────────────────────────────────────── */}
      {tray && <div className="fixed inset-0 z-40" onClick={() => setTray(null)} />}
      <AnimatePresence>
        {tray === 'vol' && (
          <VolumeFlyout
            key="vol"
            value={volume}
            muted={muted}
            onChange={(v) => {
              setVolume(v)
              if (v > 0) setMuted(false)
            }}
            onToggleMute={() => setMuted((m) => !m)}
          />
        )}
        {tray === 'net' && <NetworkFlyout key="net" />}
        {tray === 'clock' && <ClockFlyout key="clock" now={currentTime} />}
        {tray === 'hidden' && <HiddenFlyout key="hidden" />}
      </AnimatePresence>
    </>
  )
}

// ── System-tray flyouts ───────────────────────────────────────────────────--
const popAnim = {
  initial: { opacity: 0, y: 8, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 8, scale: 0.98 },
  transition: { duration: 0.12 },
}
const flyoutBase =
  'fixed bottom-[52px] right-2 z-50 rounded-md border border-slate-300/80 bg-white/95 text-slate-800 ' +
  'shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur font-win7'

function VolumeFlyout({
  value,
  muted,
  onChange,
  onToggleMute,
}: {
  value: number
  muted: boolean
  onChange: (v: number) => void
  onToggleMute: () => void
}) {
  const shown = muted ? 0 : value
  return (
    <motion.div {...popAnim} className={`${flyoutBase} w-[80px] p-2 flex flex-col items-center gap-2`}>
      <span className="text-[11px]">Speakers</span>
      <input
        type="range"
        min={0}
        max={100}
        value={shown}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
        className="h-32 w-2 accent-sky-500 cursor-pointer touch-none"
      />
      <span className="text-[11px] tabular-nums">{shown}</span>
      <button
        onClick={onToggleMute}
        className="grid place-items-center w-7 h-7 rounded border border-slate-300 hover:bg-slate-100"
      >
        {shown === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>
    </motion.div>
  )
}

function NetworkFlyout() {
  const nets = [
    { name: 'DharaniOS-5G', state: 'Connected, secured', strong: true },
    { name: 'RMD-Campus', state: '', strong: false },
    { name: 'iTNT-Lab', state: '', strong: false },
  ]
  return (
    <motion.div {...popAnim} className={`${flyoutBase} w-64 p-2`}>
      <div className="text-[12px] font-semibold px-1 pb-1.5 mb-1 border-b border-slate-200">
        Wireless Network Connection
      </div>
      {nets.map((n) => (
        <div key={n.name} className="flex items-center gap-2 px-1 py-1.5 rounded hover:bg-sky-100">
          <Wifi className={`w-4 h-4 shrink-0 ${n.strong ? 'text-sky-600' : 'text-slate-400'}`} />
          <div className="min-w-0">
            <div className="text-[12px] truncate">{n.name}</div>
            {n.state && <div className="text-[10px] text-slate-500">{n.state}</div>}
          </div>
        </div>
      ))}
      <button className="mt-1 w-full text-left text-[12px] text-sky-700 px-1 py-1 rounded hover:bg-sky-100">
        Open Network and Sharing Center
      </button>
    </motion.div>
  )
}

function ClockFlyout({ now }: { now: Date | null }) {
  const d = now ?? new Date()
  return (
    <motion.div {...popAnim} className={`${flyoutBase} w-64 p-3`}>
      <div className="text-center text-[13px] font-semibold">
        {d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
      </div>
      <div className="text-center text-2xl tabular-nums my-1">{formatTime(d)}</div>
      <MonthCalendar date={d} />
    </motion.div>
  )
}

function MonthCalendar({ date }: { date: Date }) {
  const y = date.getFullYear()
  const m = date.getMonth()
  const today = date.getDate()
  const firstDow = new Date(y, m, 1).getDay()
  const days = new Date(y, m + 1, 0).getDate()
  const cells: (number | null)[] = []
  for (let i = 0; i < firstDow; i++) cells.push(null)
  for (let dd = 1; dd <= days; dd++) cells.push(dd)
  return (
    <div className="mt-2">
      <div className="grid grid-cols-7 text-[10px] text-slate-400 mb-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((w, i) => (
          <div key={i} className="text-center">
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5 text-[11px]">
        {cells.map((c, i) => (
          <div
            key={i}
            className={`text-center py-0.5 rounded ${c === today ? 'bg-sky-500 text-white font-semibold' : 'text-slate-700'}`}
          >
            {c ?? ''}
          </div>
        ))}
      </div>
    </div>
  )
}

function HiddenFlyout() {
  return (
    <motion.div {...popAnim} className={`${flyoutBase} w-36 p-2`}>
      <div className="grid grid-cols-3 gap-2 place-items-center">
        <button title="Action Center" className="grid place-items-center w-8 h-8 rounded hover:bg-slate-100">
          <AppIcon src="/win7/icons/control-panel.png" className="w-5 h-5" />
        </button>
        <button title="Safely Remove Hardware" className="grid place-items-center w-8 h-8 rounded hover:bg-slate-100">
          <AppIcon src="/win7/icons/computer.png" className="w-5 h-5" />
        </button>
      </div>
      <button className="mt-1.5 w-full text-[11px] text-sky-700 px-1 py-0.5 rounded hover:bg-sky-100">
        Customize…
      </button>
    </motion.div>
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
