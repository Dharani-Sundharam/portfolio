'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { AppIcon } from '@/components/desktop/TaskbarSystem'

const TASKBAR_H = 48 // px, matches the taskbar height (h-12)

type Props = {
  title: string
  iconSrc: string
  z: number
  focused: boolean
  minimized: boolean
  initial: { x: number; y: number; w: number; h: number }
  onFocus: () => void
  onClose: () => void
  onMinimize: () => void
  children?: ReactNode
}

// Window chrome comes from 7.css (.window / .title-bar / .title-bar-controls /
// .window-body). We supply the behaviour: drag by the title bar, resize from the
// corner, maximize/restore, minimize to the taskbar, focus to front.
export default function Window({
  title,
  iconSrc,
  z,
  focused,
  minimized,
  initial,
  onFocus,
  onClose,
  onMinimize,
  children,
}: Props) {
  const [pos, setPos] = useState({ x: initial.x, y: initial.y })
  const [size, setSize] = useState({ w: initial.w, h: initial.h })
  const [maximized, setMaximized] = useState(false)
  const [closing, setClosing] = useState(false)

  const dragRef = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null)
  const resizeRef = useRef<{ sx: number; sy: number; ow: number; oh: number } | null>(null)

  // ── Dragging ──
  const onDragMove = useCallback((e: PointerEvent) => {
    const d = dragRef.current
    if (!d) return
    setPos({ x: d.ox + (e.clientX - d.sx), y: Math.max(0, d.oy + (e.clientY - d.sy)) })
  }, [])
  const onDragEnd = useCallback(() => {
    dragRef.current = null
    window.removeEventListener('pointermove', onDragMove)
    window.removeEventListener('pointerup', onDragEnd)
  }, [onDragMove])
  const startDrag = (e: React.PointerEvent) => {
    if (maximized) return
    onFocus()
    dragRef.current = { sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y }
    window.addEventListener('pointermove', onDragMove)
    window.addEventListener('pointerup', onDragEnd)
  }

  // ── Resizing ──
  const onResizeMove = useCallback((e: PointerEvent) => {
    const r = resizeRef.current
    if (!r) return
    setSize({
      w: Math.max(260, r.ow + (e.clientX - r.sx)),
      h: Math.max(120, r.oh + (e.clientY - r.sy)),
    })
  }, [])
  const onResizeEnd = useCallback(() => {
    resizeRef.current = null
    window.removeEventListener('pointermove', onResizeMove)
    window.removeEventListener('pointerup', onResizeEnd)
  }, [onResizeMove])
  const startResize = (e: React.PointerEvent) => {
    e.stopPropagation()
    onFocus()
    resizeRef.current = { sx: e.clientX, sy: e.clientY, ow: size.w, oh: size.h }
    window.addEventListener('pointermove', onResizeMove)
    window.addEventListener('pointerup', onResizeEnd)
  }

  useEffect(() => () => {
    window.removeEventListener('pointermove', onDragMove)
    window.removeEventListener('pointerup', onDragEnd)
    window.removeEventListener('pointermove', onResizeMove)
    window.removeEventListener('pointerup', onResizeEnd)
  }, [onDragMove, onDragEnd, onResizeMove, onResizeEnd])

  const handleClose = () => {
    setClosing(true)
    setTimeout(onClose, 140)
  }

  const frameStyle: React.CSSProperties = maximized
    ? { top: 0, left: 0, width: '100vw', height: `calc(100vh - ${TASKBAR_H}px)`, zIndex: z }
    : { top: pos.y, left: pos.x, width: size.w, zIndex: z }

  const bodyHeight = maximized ? `calc(100vh - ${TASKBAR_H}px - 42px)` : size.h

  return (
    <div
      onMouseDown={onFocus}
      style={{ position: 'absolute', ...frameStyle, display: minimized ? 'none' : 'block' }}
      className={`window absolute ${maximized ? '!rounded-none' : ''}
                  ${focused ? 'active' : 'brightness-[0.98]'}
                  ${closing ? 'animate-win-pop-out' : 'animate-win-pop-in'}`}
    >
      {/* Title bar (drag handle) */}
      <div className="title-bar" onPointerDown={startDrag} onDoubleClick={() => setMaximized((v) => !v)}>
        <div className="title-bar-text flex items-center gap-1.5">
          <AppIcon src={iconSrc} className="w-4 h-4 shrink-0" />
          <span className="truncate">{title}</span>
        </div>
        <div className="title-bar-controls" onPointerDown={(e) => e.stopPropagation()}>
          <button aria-label="Minimize" onClick={onMinimize} />
          <button aria-label={maximized ? 'Restore' : 'Maximize'} onClick={() => setMaximized((v) => !v)} />
          <button aria-label="Close" onClick={handleClose} />
        </div>
      </div>

      {/* Body */}
      <div className="window-body has-space overflow-auto" style={{ height: bodyHeight }}>
        {children}
      </div>

      {/* Resize handle */}
      {!maximized && (
        <div
          onPointerDown={startResize}
          className="absolute right-0 bottom-0 w-4 h-4 cursor-se-resize z-10"
          aria-label="Resize"
        />
      )}
    </div>
  )
}
