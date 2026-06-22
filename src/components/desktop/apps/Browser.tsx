'use client'

import { useState } from 'react'
import portfolio from '@/data/portfolio.json'
import projectsData from '@/data/projects.json'
import type { Project } from '@/components/desktop/apps/ProjectsApp'

const P = portfolio as typeof portfolio
const PROJECTS = (projectsData as { projects: Project[] }).projects
const SOCIAL = P.profile.social

type Page = 'home' | 'about' | 'projects' | 'feed'
const PRETTY: Record<Page, string> = {
  home: 'dharani://home',
  about: 'dharani://about',
  projects: 'dharani://projects',
  feed: 'dharani://feed',
}
const TITLES: Record<Page, string> = { home: 'Home', about: 'About Me', projects: 'My Projects', feed: 'My Feed' }

const openExternal = (url: string) => {
  if (typeof window !== 'undefined') window.open(url, '_blank', 'noopener,noreferrer')
}

export default function Browser() {
  const [history, setHistory] = useState<Page[]>(['home'])
  const [idx, setIdx] = useState(0)
  const page = history[idx]
  const [addr, setAddr] = useState(PRETTY.home)

  const go = (p: Page) => {
    const next = history.slice(0, idx + 1)
    next.push(p)
    setHistory(next)
    setIdx(next.length - 1)
    setAddr(PRETTY[p])
  }
  const back = () => idx > 0 && (setIdx(idx - 1), setAddr(PRETTY[history[idx - 1]]))
  const fwd = () => idx < history.length - 1 && (setIdx(idx + 1), setAddr(PRETTY[history[idx + 1]]))

  // Address bar: internal page → navigate; URL → open tab; anything else → Google.
  const submit = (raw: string) => {
    const q = raw.trim()
    if (!q) return
    const key = q.toLowerCase().replace(/^dharani:\/\//, '').replace(/\/+$/, '')
    if (['home', 'about', 'projects', 'feed'].includes(key)) return go(key as Page)
    if (/^https?:\/\//i.test(q) || /^[\w-]+(\.[\w-]+)+/.test(q)) {
      openExternal(/^https?:\/\//i.test(q) ? q : `https://${q}`)
    } else {
      openExternal(`https://www.google.com/search?q=${encodeURIComponent(q)}`)
    }
    setAddr(PRETTY[page])
  }

  return (
    <div className="absolute inset-0 flex flex-col bg-white font-win7 text-slate-800">
      {/* toolbar */}
      <div className="flex items-center gap-1.5 px-2 py-1.5 bg-gradient-to-b from-[#eef5fc] to-[#d3e3f3] border-b border-slate-300">
        <NavBtn onClick={back} disabled={idx <= 0} label="Back">←</NavBtn>
        <NavBtn onClick={fwd} disabled={idx >= history.length - 1} label="Forward">→</NavBtn>
        <NavBtn onClick={() => setAddr(PRETTY[page])} label="Refresh">⟳</NavBtn>
        <NavBtn onClick={() => go('home')} label="Home">⌂</NavBtn>
        <div className="flex-1 flex items-center gap-1.5 bg-white rounded border border-slate-300 px-2 h-7">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/win7/icons/internet-explorer.png" alt="" className="w-4 h-4" />
          <input
            value={addr}
            onChange={(e) => setAddr(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit(addr)}
            spellCheck={false}
            className="flex-1 bg-transparent outline-none text-[12px] text-slate-700"
          />
        </div>
        <button
          onClick={() => submit(addr)}
          className="px-3 h-7 rounded text-[12px] text-white bg-gradient-to-b from-[#6cb1ec] to-[#2f80c0] border border-[#2a6ba3] hover:brightness-105"
        >
          Go
        </button>
      </div>

      {/* page */}
      <div className="flex-1 overflow-auto">
        {page === 'home' && <Home onNav={go} onSearch={submit} />}
        {page === 'about' && <About />}
        {page === 'projects' && <Projects />}
        {page === 'feed' && <Feed />}
      </div>

      {/* status bar */}
      <div className="px-2 py-0.5 border-t border-slate-200 bg-slate-50 text-[10px] text-slate-400">
        {TITLES[page]} — DharaniOS Internet
      </div>
    </div>
  )
}

function NavBtn({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void
  disabled?: boolean
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className="grid place-items-center w-7 h-7 rounded text-slate-600 hover:bg-white/70 disabled:opacity-30"
    >
      {children}
    </button>
  )
}

function Tile({ onClick, emoji, label }: { onClick: () => void; emoji: string; label: string }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-white border border-slate-200 hover:border-sky-300 hover:shadow-md transition"
    >
      <span className="text-2xl leading-none">{emoji}</span>
      <span className="text-[12px] font-medium text-slate-700">{label}</span>
    </button>
  )
}

function Home({ onNav, onSearch }: { onNav: (p: Page) => void; onSearch: (q: string) => void }) {
  const [q, setQ] = useState('')
  return (
    <div className="min-h-full bg-gradient-to-b from-[#e8f3ff] to-white p-6 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={P.profile.avatar}
        alt={P.profile.name}
        className="w-20 h-20 rounded-full object-cover mx-auto border-2 border-white shadow-md"
      />
      <h1 className="mt-2 text-[20px] font-bold text-slate-800">{P.profile.name}</h1>
      <p className="text-[12px] text-slate-500">{P.profile.role}</p>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          onSearch(q)
        }}
        className="mt-4 max-w-md mx-auto flex gap-2"
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search Google or type a site…"
          className="flex-1 rounded-full border border-slate-300 px-4 py-1.5 text-[13px] outline-none focus:ring-2 focus:ring-sky-300"
        />
        <button className="px-4 rounded-full text-[12px] text-white bg-gradient-to-b from-[#6cb1ec] to-[#2f80c0] border border-[#2a6ba3]">
          Search
        </button>
      </form>

      <div className="mt-6 grid grid-cols-3 gap-3 max-w-lg mx-auto">
        <Tile emoji="🙋" label="About Me" onClick={() => onNav('about')} />
        <Tile emoji="📁" label="My Projects" onClick={() => onNav('projects')} />
        <Tile emoji="📰" label="My Feed" onClick={() => onNav('feed')} />
        <Tile emoji="🐙" label="GitHub" onClick={() => openExternal(SOCIAL.github)} />
        <Tile emoji="💼" label="LinkedIn" onClick={() => openExternal(SOCIAL.linkedin)} />
        <Tile emoji="✉️" label="Email" onClick={() => openExternal(`mailto:${SOCIAL.email}`)} />
      </div>
    </div>
  )
}

function About() {
  const exp = P.experience[0]
  return (
    <div className="max-w-2xl mx-auto p-6 text-slate-700">
      <h1 className="text-[20px] font-bold text-slate-800">About Me</h1>
      <p className="text-[12px] text-sky-700">{P.profile.tagline}</p>
      <p className="mt-3 text-[13px] leading-relaxed">{P.profile.bio}</p>

      <h2 className="mt-5 text-[14px] font-semibold text-slate-800">Education</h2>
      {P.education.map((e) => (
        <div key={e.id} className="text-[12px] mt-1">
          <b>{e.degree}</b> — {e.school} <span className="text-slate-400">({e.date})</span>
        </div>
      ))}

      <h2 className="mt-5 text-[14px] font-semibold text-slate-800">Experience</h2>
      <div className="text-[12px] mt-1">
        <b>{exp.role}</b> @ {exp.company}
      </div>
      <ul className="mt-1 list-disc pl-5 text-[12px] space-y-0.5">
        {exp.description.map((d, i) => (
          <li key={i}>{d}</li>
        ))}
      </ul>

      <h2 className="mt-5 text-[14px] font-semibold text-slate-800">Skills</h2>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {P.skills.map((s) => (
          <span key={s} className="px-2 py-0.5 text-[11px] rounded-full bg-sky-50 border border-sky-200 text-sky-800">
            {s}
          </span>
        ))}
      </div>
    </div>
  )
}

function Projects() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-[20px] font-bold text-slate-800 mb-3">My Projects</h1>
      <div className="space-y-2.5">
        {PROJECTS.map((p) => (
          <div key={p.id} className="p-3 rounded-lg border border-slate-200 hover:shadow-sm transition">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
              <h3 className="text-[14px] font-semibold text-slate-800">{p.title}</h3>
              <span className="ml-auto text-[10px] text-slate-400">{p.meta}</span>
            </div>
            <p className="mt-1 text-[12px] text-slate-600">{p.description}</p>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="text-[10px] text-slate-400">{p.language} · ★ {p.stars}</span>
              {p.url && (
                <button
                  onClick={() => openExternal(p.url)}
                  className="ml-auto text-[11px] text-sky-700 hover:underline"
                >
                  View on GitHub →
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Feed() {
  const updates = [
    {
      title: 'Shipped my portfolio as a Windows 7 desktop OS 🪟',
      summary: 'Rebuilt my whole portfolio into “DharaniOS” — draggable windows, a real terminal, live GitHub READMEs and more.',
      url: SOCIAL.github,
      when: 'now',
    },
    ...P.posts.map((p, i) => ({ ...p, when: ['2w', '1mo', '3mo'][i] ?? 'recently' })),
  ]
  return (
    <div className="max-w-xl mx-auto p-5">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-[18px] font-bold text-slate-800">My Feed</h1>
        <button onClick={() => openExternal(SOCIAL.linkedin)} className="text-[12px] text-sky-700 hover:underline">
          See more on LinkedIn →
        </button>
      </div>

      <div className="space-y-3">
        {updates.map((u, i) => (
          <article key={i} className="rounded-lg border border-slate-200 bg-white p-3.5">
            <header className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={P.profile.avatar} alt="" className="w-9 h-9 rounded-full object-cover border border-slate-200" />
              <div className="leading-tight">
                <div className="text-[12px] font-semibold text-slate-800">{P.profile.name}</div>
                <div className="text-[10px] text-slate-400">Electronics &amp; Communication Engineer · {u.when}</div>
              </div>
              <span className="ml-auto text-[#0a66c2] text-[16px] font-bold">in</span>
            </header>
            <h3 className="mt-2 text-[13px] font-semibold text-slate-800">{u.title}</h3>
            <p className="mt-0.5 text-[12px] text-slate-600 leading-snug">{u.summary}</p>
            <div className="mt-2 pt-2 border-t border-slate-100">
              <button onClick={() => openExternal(u.url)} className="text-[11px] text-[#0a66c2] hover:underline font-medium">
                👍 View update
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
