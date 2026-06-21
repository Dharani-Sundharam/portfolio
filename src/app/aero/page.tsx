'use client'

// ── Frutiger Aero PROTOTYPE ────────────────────────────────────────────────
// Standalone sandbox at /aero to dial in the glossy "Frutiger Aero" look before
// folding it into the real OS. Nothing here is wired into the desktop yet.
// Techniques (glossy aqua gradients, translucent glass, big soft shadows) are
// reimplemented in Tailwind — no assets copied from the reference repo.

// Deterministic bubble field (no Math.random → no hydration mismatch).
const BUBBLES = [
  { left: '8%', top: '70%', size: 120, o: 0.25, d: 22 },
  { left: '22%', top: '30%', size: 60, o: 0.35, d: 18 },
  { left: '40%', top: '80%', size: 200, o: 0.18, d: 28 },
  { left: '55%', top: '20%', size: 90, o: 0.3, d: 20 },
  { left: '70%', top: '60%', size: 150, o: 0.22, d: 25 },
  { left: '85%', top: '35%', size: 70, o: 0.35, d: 16 },
  { left: '92%', top: '78%', size: 110, o: 0.2, d: 24 },
  { left: '33%', top: '55%', size: 45, o: 0.4, d: 14 },
]

export default function AeroPrototype() {
  return (
    <div
      className="fixed inset-0 overflow-y-auto font-win7 text-slate-900"
      style={{
        background:
          'radial-gradient(130% 80% at 50% -15%, rgba(255,255,255,0.85), rgba(255,255,255,0) 45%),' +
          'radial-gradient(90% 60% at 85% 110%, rgba(150,240,120,0.7), rgba(150,240,120,0) 55%),' +
          'linear-gradient(180deg, #8fd6ff 0%, #36a8e8 40%, #1ec6c0 70%, #8fe36b 100%)',
      }}
    >
      {/* floating bubbles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {BUBBLES.map((b, i) => (
          <span
            key={i}
            className="absolute rounded-full animate-aero-float"
            style={{
              left: b.left,
              top: b.top,
              width: b.size,
              height: b.size,
              animationDuration: `${b.d}s`,
              background:
                `radial-gradient(circle at 32% 28%, rgba(255,255,255,${b.o + 0.35}), rgba(255,255,255,${b.o}) 45%, rgba(255,255,255,0) 70%)`,
              boxShadow: 'inset 0 0 20px rgba(255,255,255,0.4)',
            }}
          />
        ))}
      </div>

      {/* content */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 py-12 flex flex-col items-center gap-10">
        <span className="rounded-full bg-black/25 text-white/90 text-xs px-3 py-1 backdrop-blur-md border border-white/30">
          prototype · /aero · not wired into the OS yet
        </span>

        {/* Hero glass panel */}
        <GlassPanel className="w-full max-w-2xl text-center px-10 py-10">
          <h1 className="text-4xl font-semibold text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.35)]">
            Frutiger Aero
          </h1>
          <p className="mt-3 text-white/90 text-lg [text-shadow:0_1px_4px_rgba(0,0,0,0.35)]">
            Glossy glass, aqua gloss, and that 2009 shine — sandbox for the new look.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <AeroButton>Get Started</AeroButton>
            <AeroButton variant="green">Explore</AeroButton>
            <AeroButton variant="ghost">Learn more</AeroButton>
          </div>
        </GlassPanel>

        {/* Glossy pills / orbs row */}
        <div className="flex flex-wrap items-center justify-center gap-5">
          {['#3aa0ff', '#27c7a8', '#9be84f', '#ff9b3a', '#ff5d7a'].map((c) => (
            <Orb key={c} color={c} />
          ))}
        </div>

        {/* Sample Aero window */}
        <AeroWindow title="Computer" className="w-full max-w-2xl">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {['FlowAX', 'DriveSync', 'PSAP', 'Speleo-X', 'Vending', 'FPGA'].map((p) => (
              <div
                key={p}
                className="rounded-xl bg-white/40 backdrop-blur-md border border-white/60 p-4
                           flex flex-col items-center gap-2 shadow-[0_4px_14px_rgba(0,0,0,0.15)]
                           hover:bg-white/60 transition-colors cursor-pointer"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-b from-[#bfe9ff] to-[#3aa0ff] border border-white/70 shadow-inner" />
                <span className="text-sm font-medium text-slate-800">{p}</span>
              </div>
            ))}
          </div>
        </AeroWindow>

        {/* Card grid */}
        <div className="grid sm:grid-cols-3 gap-5 w-full max-w-3xl">
          {[
            { t: 'Glass', d: 'Translucent panels with backdrop blur.' },
            { t: 'Gloss', d: 'Top-lit aqua gradients with a sharp shine.' },
            { t: 'Depth', d: 'Big soft shadows and inner highlights.' },
          ].map((c) => (
            <GlassPanel key={c.t} className="px-5 py-5 text-center">
              <h3 className="text-white font-semibold text-lg [text-shadow:0_1px_4px_rgba(0,0,0,0.35)]">{c.t}</h3>
              <p className="mt-1 text-white/85 text-sm">{c.d}</p>
            </GlassPanel>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Reusable Frutiger Aero pieces ──────────────────────────────────────────
function GlassPanel({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-white/20 backdrop-blur-xl
                  border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.25)] ${className}`}
    >
      {/* top sheen */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/45 to-transparent" />
      <div className="relative">{children}</div>
    </div>
  )
}

function AeroButton({
  children,
  variant = 'blue',
}: {
  children: React.ReactNode
  variant?: 'blue' | 'green' | 'ghost'
}) {
  const styles = {
    blue: 'text-white bg-gradient-to-b from-[#7fe0ff] to-[#1f8fe6] border-white/60',
    green: 'text-white bg-gradient-to-b from-[#c8f59a] to-[#56b81f] border-white/60',
    ghost: 'text-white bg-white/15 border-white/50',
  }[variant]
  return (
    <button
      className={`relative overflow-hidden rounded-xl px-6 py-2.5 font-medium border backdrop-blur-md
                  shadow-[0_4px_10px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.8)]
                  transition-transform hover:scale-[1.04] active:scale-95
                  [text-shadow:0_1px_2px_rgba(0,0,0,0.3)] ${styles}`}
    >
      {/* glossy top highlight */}
      <span className="pointer-events-none absolute inset-x-1 top-[2px] h-[42%] rounded-[10px] bg-white/45 blur-[0.5px]" />
      <span className="relative">{children}</span>
    </button>
  )
}

function Orb({ color }: { color: string }) {
  return (
    <span
      className="relative grid place-items-center w-16 h-16 rounded-full border border-white/70
                 shadow-[0_6px_16px_rgba(0,0,0,0.3)]"
      style={{ background: `radial-gradient(circle at 35% 25%, #ffffff, ${color} 55%, ${color} 100%)` }}
    >
      <span className="pointer-events-none absolute inset-x-2 top-1.5 h-1/3 rounded-full bg-white/70 blur-[1px]" />
    </span>
  )
}

function AeroWindow({
  title,
  className = '',
  children,
}: {
  title: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-white/50
                  bg-white/25 backdrop-blur-2xl shadow-[0_18px_50px_rgba(0,0,0,0.35)] ${className}`}
    >
      {/* glossy title bar */}
      <div className="relative flex items-center h-9 px-3 bg-gradient-to-b from-white/55 to-white/15 border-b border-white/40">
        <span className="text-sm font-medium text-slate-800 [text-shadow:0_1px_1px_rgba(255,255,255,0.6)]">{title}</span>
        <div className="ml-auto flex items-center gap-1.5">
          <Cap c="from-[#dff3ff] to-[#7fb8e6]" />
          <Cap c="from-[#dff3ff] to-[#7fb8e6]" />
          <Cap c="from-[#ffd0d0] to-[#e05a5a]" />
        </div>
      </div>
      {/* body */}
      <div className="relative p-5 bg-white/30">{children}</div>
    </div>
  )
}

function Cap({ c }: { c: string }) {
  return (
    <span
      className={`w-5 h-5 rounded-md border border-white/70 bg-gradient-to-b ${c}
                  shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_1px_2px_rgba(0,0,0,0.3)]`}
    />
  )
}
