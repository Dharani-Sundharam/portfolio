/**
 * snapNav.ts — shared snap navigation state.
 * Extracted here to avoid circular imports between InteractiveBoard and ScrollProgressNav.
 */

import { scrollState } from '@/lib/scrollState'

export const SNAP_TARGETS = [0.00, 0.28, 0.48, 0.65, 0.83, 1.00]

let snapIdx   = 0
let snapAnimId: number | null = null
let snapStart = 0
let snapFrom  = 0
let snapTo    = 0
const SNAP_MS = 1500

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export function snapToSection(idx: number) {
  const clamped = Math.max(0, Math.min(SNAP_TARGETS.length - 1, idx))
  if (clamped === snapIdx && snapAnimId === null) return
  snapIdx = clamped
  if (snapAnimId) { cancelAnimationFrame(snapAnimId); snapAnimId = null }
  snapFrom  = scrollState.offset
  snapTo    = SNAP_TARGETS[clamped]
  snapStart = performance.now()

  function step() {
    const p = Math.min(1, (performance.now() - snapStart) / SNAP_MS)
    scrollState.offset = snapFrom + (snapTo - snapFrom) * easeInOutCubic(p)
    if (p < 1) { snapAnimId = requestAnimationFrame(step) }
    else { scrollState.offset = snapTo; snapAnimId = null }
  }
  snapAnimId = requestAnimationFrame(step)
}

export function isSnapping() { return snapAnimId !== null }
export function getCurrentSnapIdx() { return snapIdx }
export function getSnapAnimId() { return snapAnimId }
export const SNAP_MS_VAL = SNAP_MS
