'use client'

import { useState } from 'react'
import portfolio from '@/data/portfolio.json'

const P = portfolio as typeof portfolio

type Section = 'system' | 'skills' | 'achievements'

// Skill proficiencies grouped like Control-Panel "settings".
// Levels are illustrative — tweak these numbers anytime.
const SKILL_GROUPS: { title: string; color: string; icon: string; items: [string, number][] }[] = [
  {
    title: 'Cybersecurity',
    color: '#e11d48',
    icon: '🛡️',
    items: [
      ['Cybersecurity', 90],
      ['Network Security', 82],
      ['Penetration Testing', 85],
    ],
  },
  {
    title: 'Embedded & IoT',
    color: '#f59e0b',
    icon: '🔌',
    items: [
      ['IoT & Embedded Systems', 88],
      ['Arduino / Raspberry Pi', 90],
      ['STM32', 75],
      ['PCB Designing', 78],
    ],
  },
  {
    title: 'Hardware / RTL',
    color: '#8b5cf6',
    icon: '🧠',
    items: [
      ['Verilog', 80],
      ['RTL Design', 76],
      ['Fusion 360', 72],
    ],
  },
  {
    title: 'Software & Cloud',
    color: '#0891b2',
    icon: '💻',
    items: [
      ['Python', 92],
      ['C / C++', 85],
      ['Java', 70],
      ['React / Next.js', 75],
      ['Computer Vision (OpenCV)', 78],
      ['AWS Cloud', 70],
      ['Docker', 68],
      ['Linux', 85],
    ],
  },
]

const SKILL_COUNT = SKILL_GROUPS.reduce((n, g) => n + g.items.length, 0)
function tier(v: number): string {
  if (v >= 88) return 'Expert'
  if (v >= 80) return 'Advanced'
  if (v >= 72) return 'Proficient'
  return 'Intermediate'
}

const ACHIEVEMENTS = [
  { icon: '🚩', title: 'Top 10 CTF Player — India', desc: 'National-level Capture-The-Flag competitions' },
  { icon: '🌐', title: 'Top 100 Global — Hack The Box', desc: 'Offensive-security global ranking' },
  { icon: '🏆', title: '4th / 48 — Tantrotsav Hackathon', desc: '48-hour FPGA build (Fibonacci VGA generator)' },
]

const NAV: { id: Section; label: string }[] = [
  { id: 'system', label: 'System & About' },
  { id: 'skills', label: 'Abilities (Skills)' },
  { id: 'achievements', label: 'Achievements' },
]

function Bar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex-1 h-[14px] rounded-full bg-slate-200/80 border border-slate-300/80 overflow-hidden shadow-[inset_0_1px_1px_rgba(0,0,0,0.08)]">
      <div
        className="relative h-full rounded-full transition-[width] duration-700 ease-out"
        style={{
          width: `${value}%`,
          background: `linear-gradient(180deg, ${color}dd 0%, ${color} 55%, ${color}cc 100%)`,
        }}
      >
        {/* glossy sheen */}
        <span className="absolute inset-x-0 top-0 h-1/2 rounded-t-full bg-white/35" />
      </div>
    </div>
  )
}

export default function ControlPanel() {
  const [section, setSection] = useState<Section>('skills')
  const here = NAV.find((n) => n.id === section)?.label ?? ''

  return (
    <div className="absolute inset-0 flex flex-col bg-white font-win7 text-slate-800">
      {/* address / breadcrumb bar */}
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 border-b border-slate-200 bg-gradient-to-b from-white to-slate-50 text-[12px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/win7/icons/control-panel.png" alt="" className="w-4 h-4" />
        <span className="text-slate-400">Control Panel ▸</span>
        <span className="font-medium text-slate-700">{here}</span>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* left nav */}
        <nav className="w-48 shrink-0 bg-[#f3f7fc] border-r border-slate-200 p-2 text-[12px]">
          <div className="px-1.5 pb-1 mb-1 font-semibold text-sky-800 border-b border-slate-200">
            Control Panel Home
          </div>
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => setSection(n.id)}
              className={`block w-full text-left px-1.5 py-1 rounded ${
                section === n.id ? 'bg-[#cfe5fd] text-sky-900' : 'text-slate-700 hover:bg-[#eaf3fd]'
              }`}
            >
              {n.label}
            </button>
          ))}
        </nav>

        {/* main content */}
        <div className="flex-1 overflow-auto p-4">
          {section === 'system' && <SystemPage />}
          {section === 'skills' && <SkillsPage />}
          {section === 'achievements' && <AchievementsPage />}
        </div>
      </div>
    </div>
  )
}

function SystemPage() {
  const exp = P.experience[0]
  return (
    <div>
      <h2 className="text-[15px] text-sky-800 font-medium mb-3">
        View basic information about DharaniOS
      </h2>

      {/* Windows edition */}
      <div className="mb-4">
        <div className="text-[12px] text-slate-500 mb-1">DharaniOS edition</div>
        <div className="text-[16px] font-semibold">DharaniOS 7 Ultimate</div>
        <div className="text-[12px] text-slate-600">{P.profile.role}</div>
        <div className="text-[12px] text-slate-500 italic mt-1">{P.profile.tagline}</div>
      </div>

      {/* System block */}
      <div className="flex gap-4 border-t border-slate-200 pt-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={P.profile.avatar}
          alt={P.profile.name}
          className="w-24 h-24 rounded object-cover border border-slate-300 shadow-sm shrink-0"
        />
        <dl className="text-[12px] grid grid-cols-[110px_1fr] gap-x-3 gap-y-1.5 content-start">
          <dt className="text-slate-500">Name:</dt>
          <dd className="font-medium">{P.profile.name}</dd>
          <dt className="text-slate-500">Education:</dt>
          <dd>
            {P.education.map((e) => (
              <div key={e.id}>
                {e.degree} <span className="text-slate-500">— {e.school} ({e.date})</span>
              </div>
            ))}
          </dd>
          <dt className="text-slate-500">Experience:</dt>
          <dd>
            {exp.role} <span className="text-slate-500">@ {exp.company}</span>
          </dd>
          <dt className="text-slate-500">Email:</dt>
          <dd>
            <a href={`mailto:${P.profile.social.email}`} className="text-sky-700 hover:underline">
              {P.profile.social.email}
            </a>
          </dd>
        </dl>
      </div>

      {/* About / bio */}
      <div className="border-t border-slate-200 mt-3 pt-3">
        <div className="text-[12px] text-slate-500 mb-1">About</div>
        <p className="text-[13px] leading-relaxed text-slate-700">{P.profile.bio}</p>
      </div>
    </div>
  )
}

function SkillsPage() {
  return (
    <div>
      <div className="flex items-end justify-between mb-4">
        <div>
          <h2 className="text-[15px] text-sky-800 font-medium">Abilities</h2>
          <p className="text-[12px] text-slate-500">Proficiency across the stack — by domain.</p>
        </div>
        <div className="text-right text-[11px] text-slate-500">
          <span className="text-[20px] font-semibold text-slate-700 tabular-nums">{SKILL_COUNT}</span> skills
          <br />
          across {SKILL_GROUPS.length} domains
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {SKILL_GROUPS.map((g) => (
          <section
            key={g.title}
            className="rounded-lg border border-slate-200 overflow-hidden bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
          >
            <header
              className="flex items-center gap-2 px-3 py-1.5 text-[12px] font-semibold text-white"
              style={{ background: `linear-gradient(180deg, ${g.color} 0%, ${g.color}cc 100%)` }}
            >
              <span className="text-[14px] leading-none">{g.icon}</span>
              {g.title}
              <span className="ml-auto text-[11px] font-normal text-white/85">{g.items.length} skills</span>
            </header>
            <div className="p-2.5 space-y-2">
              {g.items.map(([name, lvl]) => (
                <div key={name} className="flex items-center gap-2.5">
                  <span className="w-44 shrink-0 text-[12px] text-slate-700">{name}</span>
                  <Bar value={lvl} color={g.color} />
                  <span
                    className="w-[68px] shrink-0 text-right text-[10px] font-medium tabular-nums"
                    style={{ color: g.color }}
                  >
                    {tier(lvl)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

function AchievementsPage() {
  return (
    <div>
      <h2 className="text-[15px] text-sky-800 font-medium mb-3">Achievements &amp; recognition</h2>
      <div className="space-y-2.5">
        {ACHIEVEMENTS.map((a) => (
          <div
            key={a.title}
            className="flex items-start gap-3 p-2.5 rounded border border-slate-200 bg-gradient-to-b from-white to-slate-50"
          >
            <div className="text-2xl leading-none shrink-0">{a.icon}</div>
            <div>
              <div className="text-[13px] font-semibold text-slate-800">{a.title}</div>
              <div className="text-[12px] text-slate-500">{a.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
