export type PerfTier = 'high' | 'medium' | 'low'

/**
 * Heuristic device capability tier for 3D + shader workloads.
 * Used to scale DPR, shadows, environment maps, and the LightPillar shader.
 */
export function getPerfTier(): PerfTier {
  if (typeof window === 'undefined') return 'medium'

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'low'

  const cores = navigator.hardwareConcurrency ?? 8
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  )
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches
  const smallScreen = window.innerWidth < 1280

  if (isMobile || coarsePointer) return 'low'
  if (cores <= 4 || (memory !== undefined && memory <= 4)) return 'low'
  if (cores <= 6 || smallScreen || (memory !== undefined && memory <= 8)) return 'medium'
  return 'high'
}

export function canvasDprForTier(tier: PerfTier): [number, number] {
  switch (tier) {
    case 'low':
      return [1, 1]
    case 'medium':
      return [1, 1.25]
    default:
      return [1, 2]
  }
}
