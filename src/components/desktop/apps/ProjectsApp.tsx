'use client'

import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'

// One project record from src/data/projects.json.
export type Project = {
  id: number
  name: string
  title: string
  description: string
  detail: string
  tech: string[]
  color: string
  meta: string
  image?: string
  images?: string[]
  url: string
  stars: number
  language: string
}

const FOLDER = '/win7/icons/folder.png'
const GITHUB = '/win7/icons/github.png'

function imagesOf(p: Project): string[] {
  if (p.images?.length) return p.images
  return p.image ? [p.image] : []
}

// Parse "github.com/owner/repo(.git)" → { owner, repo }.
function parseRepo(url: string): { owner: string; repo: string } | null {
  const m = url.match(/github\.com\/([^/]+)\/([^/#?]+)/i)
  if (!m) return null
  return { owner: m[1], repo: m[2].replace(/\.git$/i, '') }
}

// Resolve a README's relative links/images against its raw base URL.
function makeUrlTransform(base: string) {
  return (url: string) => {
    if (!url) return url
    if (/^(https?:|data:|mailto:|#)/i.test(url)) return url
    try {
      return new URL(url, base).href
    } catch {
      return url
    }
  }
}

// ── The "Projects" folder window — Win7 Explorer-style grid of project folders ──
export function ProjectsFolder({
  projects,
  onOpen,
}: {
  projects: Project[]
  onOpen: (p: Project) => void
}) {
  const [sel, setSel] = useState<number | null>(null)

  return (
    <div className="absolute inset-0 flex flex-col bg-white font-win7 text-slate-800">
      {/* address / breadcrumb bar */}
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 border-b border-slate-200 bg-gradient-to-b from-white to-slate-50 text-[12px] text-slate-600">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/win7/icons/computer.png" alt="" className="w-4 h-4" />
        <span className="text-slate-400">Computer ▸</span>
        <span className="font-medium text-slate-700">Projects</span>
        <span className="ml-auto text-slate-400">{projects.length} items</span>
      </div>

      {/* icon grid */}
      <div
        className="flex-1 overflow-auto p-3 grid gap-1.5 content-start"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(98px, 1fr))' }}
        onClick={() => setSel(null)}
      >
        {projects.map((p) => (
          <button
            key={p.id}
            onClick={(e) => {
              e.stopPropagation()
              setSel(p.id)
            }}
            onDoubleClick={() => onOpen(p)}
            className={`flex flex-col items-center gap-1 p-2 rounded border outline-none transition-colors ${
              sel === p.id
                ? 'border-[#bcdcfb] bg-[#cfe5fd]'
                : 'border-transparent hover:border-[#dcebfb] hover:bg-[#eaf3fd]'
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={FOLDER} alt="" draggable={false} className="w-12 h-12" />
            <span className="text-[12px] leading-tight text-center text-slate-700">{p.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function GitHubButton({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md text-[12px] font-medium text-white bg-[#24292f] hover:bg-[#32383f] border border-[#1b1f24] shadow-sm"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={GITHUB} alt="" className="w-4 h-4 invert" />
      View on GitHub
    </a>
  )
}

// Image "presentation" — a slide stage with prev/next + the title overlaid.
function Presentation({ project }: { project: Project }) {
  const images = imagesOf(project)
  const [i, setI] = useState(0)
  if (images.length === 0) {
    return (
      <div
        className="relative h-[150px] shrink-0 flex items-end p-3"
        style={{ background: `linear-gradient(135deg, ${project.color}, #0b1220)` }}
      >
        <div>
          <div className="text-[10px] text-white/75">{project.meta}</div>
          <h2 className="text-[15px] font-semibold text-white">{project.title}</h2>
        </div>
      </div>
    )
  }
  const prev = () => setI((n) => (n - 1 + images.length) % images.length)
  const next = () => setI((n) => (n + 1) % images.length)
  return (
    <div className="relative h-[200px] shrink-0 bg-slate-900 flex items-center justify-center overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={images[i]} alt={project.name} className="max-h-full max-w-full object-contain" />

      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 grid place-items-center rounded-full bg-black/45 text-white hover:bg-black/65"
          >
            ‹
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 grid place-items-center rounded-full bg-black/45 text-white hover:bg-black/65"
          >
            ›
          </button>
          <div className="absolute top-2 right-2 text-[10px] text-white/80 bg-black/45 px-1.5 py-0.5 rounded">
            {i + 1} / {images.length}
          </div>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, k) => (
              <button
                key={k}
                onClick={() => setI(k)}
                className={`w-1.5 h-1.5 rounded-full ${k === i ? 'bg-white' : 'bg-white/40'}`}
              />
            ))}
          </div>
        </>
      )}

      {/* title scrim */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-3 pt-6 pb-2.5 pointer-events-none">
        <div className="text-[10px] text-white/75">
          {project.meta} · {project.language} · ★ {project.stars}
        </div>
        <h2 className="text-[15px] font-semibold text-white leading-tight">{project.title}</h2>
      </div>
    </div>
  )
}

// Live-fetch the repo's README from the GitHub API and render the markdown.
function ReadmeView({ project }: { project: Project }) {
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading')
  const [text, setText] = useState('')
  const [base, setBase] = useState('')

  useEffect(() => {
    const repo = parseRepo(project.url)
    if (!repo) {
      setState('error')
      return
    }
    let alive = true
    ;(async () => {
      // raw.githubusercontent.com is a CDN with no API rate limit. Try the common
      // branches / filenames until one resolves.
      const candidates = [
        ['main', 'README.md'],
        ['master', 'README.md'],
        ['main', 'readme.md'],
        ['master', 'readme.md'],
      ]
      for (const [br, file] of candidates) {
        try {
          const baseUrl = `https://raw.githubusercontent.com/${repo.owner}/${repo.repo}/${br}/`
          const res = await fetch(baseUrl + file)
          if (!res.ok) continue
          const md = await res.text()
          if (!alive) return
          setText(md)
          setBase(baseUrl)
          setState('ok')
          return
        } catch {
          /* try next candidate */
        }
      }
      if (alive) setState('error')
    })()
    return () => {
      alive = false
    }
  }, [project.url])

  if (state === 'loading') {
    return (
      <div className="h-full grid place-items-center text-[12px] text-slate-400 font-win7">
        <div className="win7 flex flex-col items-center gap-2">
          <span className="loader animate" aria-label="Loading" />
          Fetching README from GitHub…
        </div>
      </div>
    )
  }
  if (state === 'error') {
    return (
      <div className="text-[12px] text-slate-500 font-win7">
        <p>Couldn&rsquo;t load the README{project.url ? '' : ' (no public repo)'}.</p>
        <p className="mt-1 text-slate-600">{project.detail}</p>
      </div>
    )
  }
  return (
    <div className="md-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        urlTransform={makeUrlTransform(base)}
      >
        {text}
      </ReactMarkdown>
    </div>
  )
}

// ── A single project's detail window — gradient banner + Overview / README ──
export function ProjectDetail({ project }: { project: Project }) {
  const [tab, setTab] = useState<'overview' | 'readme'>('overview')
  const hasRepo = !!parseRepo(project.url)

  const tabCls = (active: boolean) =>
    `px-3 py-1.5 -mb-px border-b-2 ${active ? 'border-sky-500 text-slate-800 font-medium' : 'border-transparent text-slate-500 hover:text-slate-700'}`

  return (
    <div className="absolute inset-0 flex flex-col bg-white font-win7 text-slate-800">
      {/* image presentation (slideshow) */}
      <Presentation project={project} />

      {/* tabs */}
      <div className="flex gap-1 px-3 pt-1.5 border-b border-slate-200 text-[12px] shrink-0">
        <button onClick={() => setTab('overview')} className={tabCls(tab === 'overview')}>
          Overview
        </button>
        <button
          onClick={() => hasRepo && setTab('readme')}
          disabled={!hasRepo}
          className={`${tabCls(tab === 'readme')} ${!hasRepo ? 'opacity-40 cursor-default' : ''}`}
          title={hasRepo ? 'Live README from GitHub' : 'No public repo'}
        >
          README
        </button>
      </div>

      {/* content */}
      <div className="flex-1 overflow-auto p-4">
        {tab === 'overview' ? (
          <>
            <p className="text-[13px] leading-relaxed">{project.description}</p>
            <p className="mt-2 text-[12px] leading-relaxed text-slate-600">{project.detail}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {project.tech.map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 text-[11px] rounded-full text-slate-600 bg-slate-100 border border-slate-200"
                >
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-3.5">
              {project.url ? (
                <GitHubButton url={project.url} />
              ) : (
                <span className="text-[12px] text-slate-400 italic">No public repo for this one</span>
              )}
            </div>
          </>
        ) : (
          <ReadmeView project={project} />
        )}
      </div>
    </div>
  )
}
