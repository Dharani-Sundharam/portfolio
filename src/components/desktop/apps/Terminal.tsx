'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import portfolio from '@/data/portfolio.json'
import projectsData from '@/data/projects.json'
import type { Project } from '@/components/desktop/apps/ProjectsApp'

const PROJECTS = (projectsData as { projects: Project[] }).projects
const P = portfolio as typeof portfolio
const SOCIAL = P.profile.social
const PROMPT = 'C:\\Users\\Dharani>'

const openUrl = (url: string) => {
  if (typeof window !== 'undefined') window.open(url, '_blank', 'noopener,noreferrer')
}

type Line = { text: string; tone?: 'dim' | 'accent' | 'warn'; pre?: boolean }

const BANNER: Line[] = [
  { text: 'DharaniOS [Version 7.0.7601]' },
  { text: '(c) 2026 Dharani Sundharam. All rights reserved.', tone: 'dim' },
  { text: '' },
  { text: "Type 'help' to see what I can do, or 'about' to know me.", tone: 'accent' },
  { text: '' },
]

// chunk a list into rows of N for tidy columns
function columns(items: string[], per = 3): string[] {
  const rows: string[] = []
  for (let i = 0; i < items.length; i += per) {
    rows.push(items.slice(i, i + per).map((s) => '  ' + s.padEnd(22)).join(''))
  }
  return rows
}

export default function Terminal({ onExit }: { onExit?: () => void }) {
  const [lines, setLines] = useState<Line[]>(BANNER)
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [hIdx, setHIdx] = useState<number | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines])

  const help: Line[] = useMemo(
    () => [
      { text: 'Available commands:', tone: 'accent' },
      { text: '  help            show this help' },
      { text: '  about           who I am' },
      { text: '  whoami          current user' },
      { text: '  skills          my tech stack' },
      { text: '  projects        list my projects' },
      { text: '  project <name>  details of one project' },
      { text: '  experience      work experience' },
      { text: '  education       my education' },
      { text: '  ctf             CTF / Hack The Box' },
      { text: '  resume          open my CV (PDF)' },
      { text: '  github          open my GitHub' },
      { text: '  linkedin        open my LinkedIn' },
      { text: '  contact         how to reach me' },
      { text: '  neofetch        system info' },
      { text: '  echo <text>     print text' },
      { text: '  date            current date & time' },
      { text: '  clear           clear the screen' },
      { text: '  exit            close the terminal' },
    ],
    [],
  )

  const run = (raw: string) => {
    const trimmed = raw.trim()
    const echo: Line = { text: `${PROMPT} ${raw}` }
    const [cmd, ...args] = trimmed.split(/\s+/)
    let out: Line[] = []

    switch (cmd.toLowerCase()) {
      case '':
        break
      case 'help':
      case '?':
        out = help
        break
      case 'about':
        out = [
          { text: P.profile.name, tone: 'accent' },
          { text: P.profile.role, tone: 'dim' },
          { text: '' },
          { text: P.profile.bio },
        ]
        break
      case 'whoami':
        out = [{ text: 'dharanios\\dharani' }]
        break
      case 'skills':
        out = [{ text: 'Tech stack:', tone: 'accent' }, { text: '' }, ...columns(P.skills).map((t) => ({ text: t }))]
        break
      case 'projects':
        out = [
          { text: 'My projects:', tone: 'accent' },
          { text: '' },
          ...PROJECTS.map((p, i) => ({ text: ` ${i + 1}. ${p.name.padEnd(26)} ${p.meta}` })),
          { text: '' },
          { text: "type 'project <name>' for details (e.g. project speleo)", tone: 'dim' },
        ]
        break
      case 'project': {
        const q = args.join(' ').toLowerCase()
        if (!q) {
          out = [{ text: 'usage: project <name>', tone: 'warn' }, { text: 'try: project psap', tone: 'dim' }]
          break
        }
        const p =
          PROJECTS.find((x, i) => String(i + 1) === q) ||
          PROJECTS.find((x) => x.name.toLowerCase().includes(q) || x.title.toLowerCase().includes(q))
        if (!p) {
          out = [{ text: `No project matching "${q}".`, tone: 'warn' }]
          break
        }
        out = [
          { text: p.title, tone: 'accent' },
          { text: '─'.repeat(Math.min(p.title.length, 46)) },
          { text: p.description },
          { text: '' },
          { text: 'Tech: ' + p.tech.join(', '), tone: 'dim' },
          { text: p.url ? 'Repo: ' + p.url : 'Repo: (private)', tone: 'dim' },
        ]
        break
      }
      case 'experience':
        out = P.experience.flatMap((e) => [
          { text: `${e.role} — ${e.company}`, tone: 'accent' as const },
          ...e.description.map((d) => ({ text: '  • ' + d })),
          { text: '' },
        ])
        break
      case 'education':
        out = P.education.map((e) => ({ text: `${e.degree}  (${e.date}) — ${e.school}` }))
        break
      case 'ctf':
      case 'htb':
        out = [
          { text: '🚩 Top 10 CTF player in India', tone: 'accent' },
          { text: '🌐 Top 100 Global on Hack The Box' },
        ]
        break
      case 'resume':
      case 'cv':
        openUrl('/resume.pdf')
        out = [{ text: 'Opening Dharani_CV.pdf…', tone: 'dim' }]
        break
      case 'github':
        openUrl(SOCIAL.github)
        out = [{ text: 'Opening GitHub → ' + SOCIAL.github, tone: 'dim' }]
        break
      case 'linkedin':
        openUrl(SOCIAL.linkedin)
        out = [{ text: 'Opening LinkedIn → ' + SOCIAL.linkedin, tone: 'dim' }]
        break
      case 'contact':
      case 'email':
        out = [
          { text: 'Email:    ' + SOCIAL.email },
          { text: 'GitHub:   ' + SOCIAL.github },
          { text: 'LinkedIn: ' + SOCIAL.linkedin },
        ]
        break
      case 'neofetch':
      case 'sysinfo':
        out = neofetch()
        break
      case 'echo':
        out = [{ text: args.join(' ') }]
        break
      case 'date':
      case 'time':
        out = [{ text: new Date().toString() }]
        break
      case 'ls':
      case 'dir':
        out = ['Projects', 'Dharani_CV.pdf', 'Skills', 'About.txt', 'Contact'].map((t) => ({ text: '  ' + t }))
        break
      case 'sudo':
        out = [{ text: 'dharani is not in the sudoers file. This incident will be reported. 😏', tone: 'warn' }]
        break
      case 'cls':
      case 'clear':
        setLines([])
        return
      case 'exit':
        onExit?.()
        return
      default:
        out = [
          { text: `'${cmd}' is not recognized as an internal or external command,`, tone: 'warn' },
          { text: 'operable program or batch file.', tone: 'warn' },
          { text: "type 'help' for a list of commands.", tone: 'dim' },
        ]
    }

    setLines((prev) => [...prev, echo, ...out, { text: '' }])
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const v = input
      if (v.trim()) setHistory((h) => [...h, v.trim()])
      setHIdx(null)
      setInput('')
      run(v)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (history.length === 0) return
      const i = hIdx === null ? history.length - 1 : Math.max(0, hIdx - 1)
      setHIdx(i)
      setInput(history[i])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (hIdx === null) return
      const i = hIdx + 1
      if (i >= history.length) {
        setHIdx(null)
        setInput('')
      } else {
        setHIdx(i)
        setInput(history[i])
      }
    }
  }

  const toneClass = (t?: Line['tone']) =>
    t === 'dim' ? 'text-slate-500' : t === 'accent' ? 'text-sky-300' : t === 'warn' ? 'text-amber-400' : 'text-slate-200'

  return (
    <div
      ref={scrollRef}
      onClick={() => inputRef.current?.focus()}
      className="absolute inset-0 overflow-auto bg-[#0c0c0c] p-2 font-win7-mono text-[13px] leading-[1.35] whitespace-pre-wrap break-words selection:bg-slate-600/60"
    >
      {lines.map((l, i) => (
        <div key={i} className={`${toneClass(l.tone)} ${l.pre ? 'whitespace-pre' : ''}`}>
          {l.text || ' '}
        </div>
      ))}
      {/* live prompt */}
      <div className="flex text-slate-200">
        <span className="shrink-0 text-slate-200">{PROMPT}&nbsp;</span>
        <input
          ref={inputRef}
          autoFocus
          spellCheck={false}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          className="flex-1 bg-transparent border-0 outline-none text-slate-200 font-win7-mono text-[13px] caret-slate-200"
        />
      </div>
    </div>
  )
}

function neofetch(): Line[] {
  // Compact Win7-flag art (box-drawing renders 1 cell wide in monospace) so it
  // never wraps. Lines are flagged `pre` to disable wrapping in the terminal.
  const art = [
    '╔════╦════╗',
    '║ ▓▓ ║ ▓▓ ║',
    '╠════╬════╣',
    '║ ▓▓ ║ ▓▓ ║',
    '╚════╩════╝',
  ]
  const info = [
    'DharaniOS 7 (Build 7601)',
    '────────────────────────',
    `user     : ${P.profile.name}`,
    'role     : ECE @ RMD (2024–2028)',
    'shell    : cmd.exe',
    `skills   : ${P.skills.length} installed`,
    `projects : ${PROJECTS.length} shipped`,
    'CTF      : Top 10 India · Top 100 HTB',
  ]
  const rows = Math.max(art.length, info.length)
  const out: Line[] = []
  for (let i = 0; i < rows; i++) {
    const a = (art[i] ?? '').padEnd(12)
    const b = info[i] ?? ''
    out.push({ text: a + '  ' + b, tone: i < 2 ? 'accent' : undefined, pre: true })
  }
  return out
}
