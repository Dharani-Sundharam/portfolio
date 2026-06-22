'use client'

import { useEffect } from 'react'

export type PowerPhase = 'confirm' | 'shutting' | 'off'

const open = (url: string) => {
  if (typeof window !== 'undefined') window.open(url, '_blank', 'noopener,noreferrer')
}

// The Shut Down flow: a friendly "follow & star" dialog → shutting-down → the
// classic "It's now safe to turn off your computer" screen.
export default function ShutdownScreen({
  phase,
  github,
  onCancel,
  onConfirm,
  onShutdownComplete,
  onRestart,
}: {
  phase: PowerPhase
  github: string
  onCancel: () => void
  onConfirm: () => void
  onShutdownComplete: () => void
  onRestart: () => void
}) {
  // "Shutting down…" auto-advances to the off screen.
  useEffect(() => {
    if (phase !== 'shutting') return
    const t = setTimeout(onShutdownComplete, 2200)
    return () => clearTimeout(t)
  }, [phase, onShutdownComplete])

  // Esc cancels the confirm dialog.
  useEffect(() => {
    if (phase !== 'confirm') return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCancel()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, onCancel])

  if (phase === 'confirm') {
    return (
      <div
        className="fixed inset-0 z-[300] flex items-center justify-center bg-black/45 win7-cursor"
        onMouseDown={onCancel}
      >
        <div className="win7" onMouseDown={(e) => e.stopPropagation()}>
          <div className="window active animate-win-pop-in" style={{ width: 460 }}>
            <div className="title-bar">
              <div className="title-bar-text">Shut Down DharaniOS</div>
              <div className="title-bar-controls">
                <button aria-label="Close" onClick={onCancel} />
              </div>
            </div>
            <div className="window-body has-space">
              <div className="flex gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/profile_pic.png"
                  alt="Dharani"
                  className="w-14 h-14 shrink-0 rounded-full object-cover border border-slate-300 shadow-sm"
                />
                <div className="font-win7 text-[13px] text-slate-800 leading-relaxed">
                  <p className="font-semibold mb-1">Thanks for exploring my portfolio! 🙏</p>
                  <p>
                    Before you go — please <b>follow me on GitHub</b> and ⭐ <b>star</b> the projects you
                    liked. It genuinely helps a student out!
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => open(github)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/win7/icons/github.png" alt="" className="w-4 h-4" />
                    Follow on GitHub
                  </button>
                  <button
                    onClick={() => open(`${github}?tab=repositories`)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5"
                  >
                    ⭐ Star repos
                  </button>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-200 flex justify-end gap-2">
                  <button onClick={onConfirm} className="font-semibold min-w-[92px]">
                    Shut down
                  </button>
                  <button onClick={onCancel} className="min-w-[80px]">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Full-screen shutting-down / off screens.
  return (
    <div className="fixed inset-0 z-[400] bg-black text-slate-100 flex flex-col items-center justify-center gap-6 font-win7 select-none">
      {phase === 'shutting' ? (
        <>
          <div className="win7">
            <span className="loader animate" aria-label="Shutting down" />
          </div>
          <p className="text-lg tracking-wide">Shutting down…</p>
        </>
      ) : (
        <>
          <p className="text-xl text-center px-6">It&rsquo;s now safe to turn off your computer.</p>
          <button
            onClick={onRestart}
            className="px-5 py-2 rounded text-sm bg-white/10 hover:bg-white/20 border border-white/25 transition-colors"
          >
            Turn back on
          </button>
        </>
      )}
    </div>
  )
}
