import { useEffect, useState } from 'react'
import { scrollState } from '@/lib/scrollState'
import { isSnapping } from '@/lib/snapNav'

function getSection(t: number): string {
  if (t < 0.18) return 'intro'
  if (t < 0.38) return 'about'
  if (t < 0.57) return 'skills'
  if (t < 0.75) return 'projects'
  if (t < 0.95) return 'contact'
  return 'outro'
}

export interface ScrollUiState {
  sectionId: string
  snapping: boolean
  heroVisible: boolean
  isOutro: boolean
}

/** Single RAF loop for overlay UI — avoids 2+ competing loops in Chrome */
export function useScrollUi(): ScrollUiState {
  const [ui, setUi] = useState<ScrollUiState>({
    sectionId: 'intro',
    snapping: false,
    heroVisible: true,
    isOutro: false,
  })

  useEffect(() => {
    let id = 0
    const tick = () => {
      const t = scrollState.offset
      const next: ScrollUiState = {
        sectionId: getSection(t),
        snapping: isSnapping(),
        heroVisible: t < 0.12 || t > 0.92,
        isOutro: t > 0.92,
      }
      setUi((prev) =>
        prev.sectionId === next.sectionId &&
        prev.snapping === next.snapping &&
        prev.heroVisible === next.heroVisible &&
        prev.isOutro === next.isOutro
          ? prev
          : next,
      )
      id = requestAnimationFrame(tick)
    }
    id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [])

  return ui
}
