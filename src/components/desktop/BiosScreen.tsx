'use client'

import { useEffect, useRef, useState } from 'react'

const MEM = '%MEM%'
const MEM_TOTAL = 16384

// AMI-style POST log — themed to Dharani's hardware/security identity.
const LINES: string[] = [
  'AMIBIOS(C) 2026 American Megatrends, Inc.',
  'BIOS Date: 03/14/26   Ver: 04.08.DHARANI',
  '',
  '================================================',
  '   AMERICAN MEGATRENDS               (C) 2026',
  '   AMIBIOS  -  ENERGY STAR Compliant  -  v4.8',
  '================================================',
  '',
  'Main Processor : Intel(R) Core(TM) i7-9750H',
  'CPU Speed      : 3.20 GHz   (Turbo 4.50 GHz)',
  'CPU Cores      : 8    Threads : 16',
  'Cache          : L1 512K   L2 2048K   L3 12288K',
  '',
  MEM,
  '',
  'Initializing USB Controllers ......... Done.',
  'USB Device(s)  : 1 Keyboard, 1 Mouse, 2 Storage',
  '',
  'Auto-Detecting SATA Drives ...',
  '  SATA Port 0 : FLOWAX-SSD  512GB        [ OK ]',
  '  SATA Port 1 : DRIVESYNC-HDD  2TB       [ OK ]',
  '  SATA Port 2 : Not Detected',
  '',
  'IoT Peripheral Bus ..................... [ OK ]',
  'CTF Secure Boot ........................ [ ON ]',
  'TPM 2.0 Device ......................... [ OK ]',
  '',
  'Verifying DMI Pool Data ............... Done',
  'Boot Device    : DharaniOS  (P0: FLOWAX-SSD)',
  '',
  'Press DEL to enter SETUP,   F11 for Boot Menu',
  'Loading DharaniOS ...',
]
const MEM_INDEX = LINES.indexOf(MEM)

export default function BiosScreen({ onProceed }: { onProceed: () => void }) {
  const [shown, setShown] = useState(0)
  const [mem, setMem] = useState(0)
  const [ready, setReady] = useState(false)
  const fired = useRef(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Reveal lines one-by-one — pauses while the memory test is counting up.
  useEffect(() => {
    if (shown >= LINES.length) {
      setReady(true)
      return
    }
    const waitingMem = shown === MEM_INDEX + 1 && mem < MEM_TOTAL
    if (waitingMem) return
    const t = setTimeout(() => setShown((n) => n + 1), shown === 0 ? 200 : 70)
    return () => clearTimeout(t)
  }, [shown, mem])

  // Count the RAM up once the memory line is on screen.
  useEffect(() => {
    if (shown <= MEM_INDEX || mem >= MEM_TOTAL) return
    const t = setTimeout(() => setMem((m) => Math.min(MEM_TOTAL, m + 1024)), 35)
    return () => clearTimeout(t)
  }, [shown, mem])

  // Keep the newest line in view (scrolling POST feel).
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [shown, mem])

  // Once POST is done, any key/click is the gesture that unlocks fullscreen + audio.
  useEffect(() => {
    if (!ready) return
    const go = () => {
      if (fired.current) return
      fired.current = true
      onProceed()
    }
    window.addEventListener('keydown', go)
    window.addEventListener('mousedown', go)
    window.addEventListener('touchstart', go)
    return () => {
      window.removeEventListener('keydown', go)
      window.removeEventListener('mousedown', go)
      window.removeEventListener('touchstart', go)
    }
  }, [ready, onProceed])

  const renderLine = (line: string) =>
    line === MEM ? `Memory Testing : ${mem}M ${mem >= MEM_TOTAL ? ' OK' : '...'}` : line

  return (
    <div
      ref={scrollRef}
      className="fixed inset-0 bg-black text-[#cfcfcf] font-win7-mono text-[12px] md:text-[13px]
                 leading-[1.55] p-5 md:p-8 overflow-y-auto cursor-default
                 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {LINES.slice(0, shown).map((line, i) => (
        <div key={i} className="whitespace-pre">{renderLine(line) || ' '}</div>
      ))}
      {ready && (
        <div className="mt-4 text-white">
          Press any key to continue<span className="animate-pulse">_</span>
        </div>
      )}
    </div>
  )
}
