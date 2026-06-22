'use client'

import { useRef, useState } from 'react'

type Item = { label?: string; onClick?: () => void; sep?: boolean; check?: boolean }

function downloadText(fileName: string, text: string) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

// A small Win7-style Notepad with working File / Edit / Format / Help menus.
export default function Notepad({
  initialText = '',
  fileName = 'Untitled.txt',
  onExit,
}: {
  initialText?: string
  fileName?: string
  onExit?: () => void
}) {
  const taRef = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [wrap, setWrap] = useState(true)
  const [name, setName] = useState(fileName)

  const ta = () => taRef.current
  const focus = () => ta()?.focus()

  const insertAtCursor = (text: string) => {
    const t = ta()
    if (!t) return
    const s = t.selectionStart
    const e = t.selectionEnd
    t.value = t.value.slice(0, s) + text + t.value.slice(e)
    const pos = s + text.length
    t.setSelectionRange(pos, pos)
    t.focus()
  }

  const openFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => {
      if (ta()) ta()!.value = String(reader.result ?? '')
      setName(f.name)
    }
    reader.readAsText(f)
    e.target.value = ''
  }

  const menus: Record<string, Item[]> = {
    File: [
      { label: 'New', onClick: () => { if (ta()) ta()!.value = ''; focus() } },
      { label: 'Open…', onClick: () => fileRef.current?.click() },
      { label: 'Save', onClick: () => downloadText(name, ta()?.value ?? '') },
      {
        label: 'Save As…',
        onClick: () => {
          const n = window.prompt('Save as file name:', name)
          if (n) {
            setName(n)
            downloadText(n, ta()?.value ?? '')
          }
        },
      },
      { sep: true },
      { label: 'Exit', onClick: () => onExit?.() },
    ],
    Edit: [
      { label: 'Undo', onClick: () => { focus(); document.execCommand('undo') } },
      { sep: true },
      { label: 'Cut', onClick: () => { focus(); document.execCommand('cut') } },
      { label: 'Copy', onClick: () => { focus(); document.execCommand('copy') } },
      { label: 'Paste', onClick: () => navigator.clipboard?.readText().then(insertAtCursor).catch(() => {}) },
      { label: 'Delete', onClick: () => insertAtCursor('') },
      { sep: true },
      { label: 'Select All', onClick: () => ta()?.select() },
      { label: 'Time/Date', onClick: () => insertAtCursor(new Date().toLocaleString()) },
    ],
    Format: [{ label: 'Word Wrap', check: wrap, onClick: () => setWrap((w) => !w) }],
    Help: [
      {
        label: 'About Notepad',
        onClick: () => window.alert('DharaniOS Notepad\nA tiny Windows 7–style text editor.'),
      },
    ],
  }

  return (
    <div className="absolute inset-0 flex flex-col bg-white font-win7">
      {/* menu bar */}
      <div className="flex items-center bg-[#f0f0f0] border-b border-slate-300 text-[12px] select-none">
        {Object.keys(menus).map((title) => (
          <div key={title} className="relative">
            <button
              onClick={() => setOpenMenu((o) => (o === title ? null : title))}
              onMouseEnter={() => openMenu && setOpenMenu(title)}
              className={`px-3 py-1 ${openMenu === title ? 'bg-[#cce4ff]' : 'hover:bg-[#e5f0fb]'}`}
            >
              {title}
            </button>
            {openMenu === title && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
                <ul className="absolute left-0 top-full z-20 min-w-[190px] bg-white border border-slate-300 shadow-[2px_3px_6px_rgba(0,0,0,0.22)] py-1">
                  {menus[title].map((it, i) =>
                    it.sep ? (
                      <li key={i} className="my-1 border-t border-slate-200" />
                    ) : (
                      <li key={i}>
                        <button
                          onClick={() => {
                            it.onClick?.()
                            setOpenMenu(null)
                          }}
                          className="w-full text-left pl-6 pr-6 py-1 hover:bg-[#cce4ff] relative"
                        >
                          {it.check && <span className="absolute left-2">✓</span>}
                          {it.label}
                        </button>
                      </li>
                    ),
                  )}
                </ul>
              </>
            )}
          </div>
        ))}
      </div>

      {/* editor */}
      <textarea
        ref={taRef}
        defaultValue={initialText}
        spellCheck={false}
        wrap={wrap ? 'soft' : 'off'}
        style={{ whiteSpace: wrap ? 'pre-wrap' : 'pre' }}
        className="flex-1 w-full resize-none border-0 outline-none p-1.5 font-win7-mono text-[13px] text-slate-800 overflow-auto"
      />

      <input ref={fileRef} type="file" accept=".txt,.md,.log,text/*" hidden onChange={openFile} />
    </div>
  )
}
