'use client'

import dynamic from 'next/dynamic'

const InteractiveBoard = dynamic(
  () => import('@/components/InteractiveBoard'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <p className="text-slate-500 text-sm tracking-widest uppercase">Initialising</p>
        </div>
      </div>
    ),
  }
)

export default function Home() {
  return (
    <main className="w-full h-screen overflow-hidden bg-slate-950">
      <InteractiveBoard />
    </main>
  )
}
