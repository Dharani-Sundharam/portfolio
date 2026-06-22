'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import BiosScreen from '@/components/desktop/BiosScreen'
import LoginScreen from '@/components/desktop/LoginScreen'
import Desktop from '@/components/desktop/Desktop'
import MobileLayer from '@/components/desktop/MobileLayer'

type Phase = 'bios' | 'booting' | 'login' | 'desktop'

export default function Home() {
  const [phase, setPhase] = useState<Phase>('bios')
  const rootRef = useRef<HTMLDivElement>(null)
  const chimeRef = useRef<HTMLAudioElement | null>(null)

  // Fired from the BIOS "press any key" — the one user gesture that lets us
  // (a) go fullscreen and (b) preload the startup chime for later playback.
  const startBoot = useCallback(() => {
    const el = rootRef.current ?? document.documentElement
    // Fullscreen is blocked in some embeds (iframes/webviews) — ignore failure.
    // On mobile, lock to landscape once we're fullscreen (best-effort).
    Promise.resolve(el.requestFullscreen?.())
      .then(() => {
        const orient = screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> }
        orient?.lock?.('landscape').catch(() => {})
      })
      .catch(() => {})

    // Startup chime plays NOW, over the "Starting Windows" screen. Firing it
    // inside this gesture handler guarantees autoplay is allowed. Keep the ref
    // so it isn't garbage-collected mid-playback.
    const a = new Audio('/win7/sounds/startup.mp3')
    a.play().catch(() => {})
    chimeRef.current = a

    setPhase('booting')
  }, [])

  // Boot video finished → reveal the login screen.
  const onBootEnd = useCallback(() => setPhase('login'), [])

  return (
    <main ref={rootRef} className="fixed inset-0 overflow-hidden bg-black font-win7 win7-cursor">
      {phase === 'bios' && <BiosScreen onProceed={startBoot} />}
      {phase === 'booting' && <BootVideo onEnd={onBootEnd} />}
      {phase === 'login' && <LoginScreen onLogin={() => setPhase('desktop')} />}
      {phase === 'desktop' && <Desktop />}
      <MobileLayer />
    </main>
  )
}

// "Starting Windows" boot screen. The video is only the glowing flag (no text),
// so we overlay "Starting Windows" + the copyright. Muted guarantees autoplay
// (video has no audio); plays to completion. The text fades in as the flag forms
// and fades back out as the flag fades, so they disappear together.
function BootVideo({ onEnd }: { onEnd: () => void }) {
  const done = useRef(false)
  const [textVisible, setTextVisible] = useState(false)
  const finish = useCallback(() => {
    if (done.current) return
    done.current = true
    onEnd()
  }, [onEnd])

  useEffect(() => {
    const end = setTimeout(finish, 13000) // video is ~11.75s
    const fadeIn = setTimeout(() => setTextVisible(true), 2200) // flag forming
    const fadeOut = setTimeout(() => setTextVisible(false), 9300) // flag fading out
    return () => {
      clearTimeout(end)
      clearTimeout(fadeIn)
      clearTimeout(fadeOut)
    }
  }, [finish])

  const fade = `transition-opacity duration-[1500ms] ${textVisible ? 'opacity-100' : 'opacity-0'}`

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center">
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        src="/win7/boot/boot.mp4"
        autoPlay
        muted
        playsInline
        onEnded={finish}
        className="w-[240px] max-w-[55vw] h-auto"
      />
      <div className={`-mt-3 text-[26px] font-light tracking-wide text-white/90 ${fade}`}>
        Starting Windows
      </div>
      <p className={`absolute bottom-[6%] text-[13px] tracking-wide text-white/45 ${fade}`}>
        © Microsoft Corporation
      </p>
    </div>
  )
}
