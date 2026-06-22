'use client'

import { useState } from 'react'

const ICON = {
  computer: '/win7/icons/computer.png',
  folder: '/win7/icons/folder.png',
  pdf: '/win7/icons/pdf.png',
  txt: '/win7/icons/txt.png',
  github: '/win7/icons/github.png',
}

// A node in the (fake) file system. Leaves carry an `open` action.
export type FsNode = {
  name: string
  type: 'drive' | 'folder' | 'file'
  icon?: string
  used?: number // GB used (drives)
  total?: number // GB total (drives)
  open?: { app?: string; url?: string }
  children?: FsNode[]
}

// "Computer" — drives → folders → the CV, with a couple that jump to real apps.
export const COMPUTER: FsNode = {
  name: 'Computer',
  type: 'folder',
  children: [
    {
      name: 'Local Disk (C:)',
      type: 'drive',
      icon: ICON.computer,
      used: 142,
      total: 256,
      children: [
        {
          name: 'Users',
          type: 'folder',
          children: [
            {
              name: 'Dharani',
              type: 'folder',
              children: [
                { name: 'Desktop', type: 'folder', children: [] },
                {
                  name: 'Documents',
                  type: 'folder',
                  children: [
                    { name: 'Dharani_CV.pdf', type: 'file', icon: ICON.pdf, open: { app: 'resume' } },
                    { name: 'About-Me.txt', type: 'file', icon: ICON.txt, open: { app: 'control-panel' } },
                  ],
                },
                { name: 'Projects', type: 'folder', icon: ICON.folder, open: { app: 'projects' } },
              ],
            },
          ],
        },
        { name: 'Windows', type: 'folder', children: [{ name: 'System32', type: 'folder', children: [] }] },
        { name: 'Program Files', type: 'folder', children: [] },
      ],
    },
    { name: 'Projects (D:)', type: 'drive', icon: ICON.folder, used: 88, total: 120, open: { app: 'projects' } },
    { name: 'GitHub (\\\\cloud)', type: 'drive', icon: ICON.github, open: { url: 'https://github.com/Dharani-Sundharam' } },
    { name: 'Removable Disk (F:)', type: 'drive', icon: ICON.computer, used: 0, total: 16, children: [] },
  ],
}

function DriveTile({ node, onOpen }: { node: FsNode; onOpen: () => void }) {
  const pct = node.total ? Math.round(((node.used ?? 0) / node.total) * 100) : 0
  const low = node.total ? node.total - (node.used ?? 0) < node.total * 0.12 : false
  return (
    <button
      onDoubleClick={onOpen}
      className="flex items-center gap-3 w-full max-w-[320px] p-2 rounded border border-transparent hover:border-[#dcebfb] hover:bg-[#eaf3fd] text-left"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={node.icon ?? ICON.computer} alt="" className="w-10 h-10 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="text-[12px] text-slate-700 truncate">{node.name}</div>
        {node.total ? (
          <>
            <div className="mt-1 h-3 rounded-sm bg-slate-200 border border-slate-300 overflow-hidden">
              <div
                className={`h-full ${low ? 'bg-gradient-to-b from-[#ff9a8b] to-[#e23b3b]' : 'bg-gradient-to-b from-[#bce6ff] to-[#3f97e0]'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {(node.total - (node.used ?? 0)).toFixed(0)} GB free of {node.total} GB
            </div>
          </>
        ) : (
          <div className="text-[10px] text-slate-400">Network location</div>
        )}
      </div>
    </button>
  )
}

export default function FileExplorer({
  root = COMPUTER,
  onOpenApp,
  onOpenUrl,
}: {
  root?: FsNode
  onOpenApp: (id: string) => void
  onOpenUrl: (url: string) => void
}) {
  const [path, setPath] = useState<FsNode[]>([root])
  const node = path[path.length - 1]
  const items = node.children ?? []
  const drivesView = items.some((c) => c.type === 'drive')

  const activate = (child: FsNode) => {
    if (child.open?.app) return onOpenApp(child.open.app)
    if (child.open?.url) return onOpenUrl(child.open.url)
    if (child.children) setPath((p) => [...p, child])
  }

  return (
    <div className="absolute inset-0 flex flex-col bg-white font-win7 text-slate-800">
      {/* toolbar / address bar */}
      <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-slate-200 bg-gradient-to-b from-white to-slate-50 text-[12px]">
        <button
          onClick={() => setPath((p) => (p.length > 1 ? p.slice(0, -1) : p))}
          disabled={path.length <= 1}
          className="grid place-items-center w-6 h-6 rounded hover:bg-slate-200 disabled:opacity-30"
          title="Back"
        >
          ←
        </button>
        <div className="flex items-center gap-1 min-w-0">
          {path.map((n, i) => (
            <span key={i} className="flex items-center gap-1 min-w-0">
              {i > 0 && <span className="text-slate-400">▸</span>}
              <button
                onClick={() => setPath((p) => p.slice(0, i + 1))}
                className={`truncate px-1 rounded hover:bg-slate-100 ${i === path.length - 1 ? 'font-medium text-slate-700' : 'text-slate-500'}`}
              >
                {n.name}
              </button>
            </span>
          ))}
        </div>
        <span className="ml-auto text-slate-400">{items.length} items</span>
      </div>

      {/* contents */}
      <div className="flex-1 overflow-auto p-3">
        {items.length === 0 ? (
          <div className="h-full grid place-items-center text-[12px] text-slate-400">This folder is empty.</div>
        ) : drivesView ? (
          <div className="space-y-1">
            {items.map((c) => (
              <DriveTile key={c.name} node={c} onOpen={() => activate(c)} />
            ))}
          </div>
        ) : (
          <div className="grid gap-1.5 content-start" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(98px, 1fr))' }}>
            {items.map((c) => (
              <button
                key={c.name}
                onDoubleClick={() => activate(c)}
                className="flex flex-col items-center gap-1 p-2 rounded border border-transparent hover:border-[#dcebfb] hover:bg-[#eaf3fd]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.icon ?? ICON.folder} alt="" className="w-12 h-12" />
                <span className="text-[12px] leading-tight text-center text-slate-700 break-words">{c.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
