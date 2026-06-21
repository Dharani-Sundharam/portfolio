'use client'

import { useCallback, useEffect, useRef } from 'react'

// The "login" step is now just the Win7 welcome video clip (trimmed 9–13s of
// the source). It plays once and then hands off to the desktop.
export default function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const done = useRef(false)
  const finish = useCallback(() => {
    if (done.current) return
    done.current = true
    onLogin()
  }, [onLogin])

  // Safety fallback in case `onEnded` doesn't fire (clip is ~4s).
  useEffect(() => {
    const t = setTimeout(finish, 5200)
    return () => clearTimeout(t)
  }, [finish])

  return (
    <div className="fixed inset-0 bg-black">
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        src="/win7/login/login-clip.mp4"
        autoPlay
        muted
        playsInline
        onEnded={finish}
        className="w-full h-full object-cover"
      />
    </div>
  )
}
