'use client'

// A friendly "Read Me — Start Here" note that orients first-time visitors.
const TIPS: { icon: string; title: string; body: string }[] = [
  { icon: '📁', title: 'Projects', body: 'Double-click the Projects folder — each one opens a writeup, a photo walkthrough, and its live GitHub README.' },
  { icon: '🛠️', title: 'Skills', body: 'Open the “Skills” icon (Control Panel) for my abilities, background, and achievements.' },
  { icon: '📄', title: 'Dharani_CV', body: 'Opens my résumé — you can download it from the toolbar or by right-clicking the icon.' },
  { icon: '⌨️', title: 'Command Prompt', body: 'A real shell — type “help”, “projects”, or “neofetch”.' },
  { icon: '🌐', title: 'Internet', body: 'A little browser with my pages, my feed, and Google search.' },
  { icon: '🔗', title: 'GitHub · LinkedIn · Mail', body: 'The desktop shortcuts jump straight to my profiles.' },
]

export default function Guide() {
  return (
    <div className="absolute inset-0 overflow-auto bg-[#fffef5] font-win7 text-slate-800 p-5">
      <h1 className="text-[18px] font-bold">Welcome to DharaniOS 👋</h1>
      <p className="mt-1 text-[13px] text-slate-600">
        This desktop <i>is</i> my portfolio. Here&rsquo;s how to explore it:
      </p>

      <ul className="mt-3 space-y-2.5">
        {TIPS.map((t) => (
          <li key={t.title} className="flex gap-3">
            <span className="text-[18px] leading-none shrink-0">{t.icon}</span>
            <div>
              <div className="text-[13px] font-semibold">{t.title}</div>
              <div className="text-[12px] text-slate-600 leading-snug">{t.body}</div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4 pt-3 border-t border-amber-200/70 text-[12px] text-slate-600">
        Tip: right-click the desktop to make files, drag icons anywhere, and when you&rsquo;re done —
        <b> Shut Down</b> from the Start menu (but follow me first 😄).
      </div>
    </div>
  )
}
