'use client'

// The Recycle Bin is "empty" — everything here has already been learned from / fixed.
const ITEMS = [
  { name: 'impostor_syndrome.exe', note: 'deleted — turns out I do belong here', date: 'Origin date unknown' },
  { name: 'bug_#42.log', note: 'solved at 3 AM ☕', date: 'Friday' },
  { name: 'self_doubt.tmp', note: 'cleared', date: 'Every Monday' },
  { name: 'old_portfolio.psd', note: 'replaced by this whole OS', date: 'Last month' },
  { name: 'segfault.core', note: 'fixed (it was a pointer — it always is)', date: '2 AM' },
  { name: 'mistakes/', note: 'being learned from…', date: 'Ongoing' },
]

export default function RecycleBin() {
  return (
    <div className="absolute inset-0 flex flex-col bg-white font-win7 text-slate-800">
      {/* toolbar */}
      <div className="flex items-center gap-2 px-2.5 py-1.5 border-b border-slate-200 bg-gradient-to-b from-white to-slate-50 text-[12px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/win7/icons/recycle-empty.png" alt="" className="w-4 h-4" />
        <span className="text-slate-400">Computer ▸</span>
        <span className="font-medium text-slate-700">Recycle Bin</span>
        <span className="ml-auto text-slate-400">{ITEMS.length} resolved</span>
      </div>

      {/* list */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-[1fr_auto] gap-x-3 px-3 py-1.5 border-b border-slate-100 text-[11px] font-medium text-slate-400">
          <span>Name</span>
          <span>Date deleted</span>
        </div>
        {ITEMS.map((it) => (
          <div
            key={it.name}
            className="grid grid-cols-[1fr_auto] items-center gap-x-3 px-3 py-1.5 border-b border-slate-50 hover:bg-[#eaf3fd]"
          >
            <div className="min-w-0">
              <div className="text-[12px] text-slate-400 line-through truncate">{it.name}</div>
              <div className="text-[11px] text-emerald-600">✓ {it.note}</div>
            </div>
            <span className="text-[11px] text-slate-400 whitespace-nowrap">{it.date}</span>
          </div>
        ))}
      </div>

      {/* status bar */}
      <div className="px-3 py-1.5 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500 italic">
        This Recycle Bin is empty — nothing left to recover. It all turned into lessons. 🌱
      </div>
    </div>
  )
}
