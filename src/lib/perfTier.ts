export type PerfTier = 'high' | 'medium' | 'low'

/** Chrome / Edge (not Brave) — heavier compositing with layered WebGL + blend modes */
export function isStrictChromium(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  if (!ua.includes('Chrome') && !ua.includes('Edg/')) return false
  // Brave exposes navigator.brave; UA still contains "Chrome"
  if ('brave' in navigator) return false
  return true
}

function downgradeTier(tier: PerfTier): PerfTier {
  if (tier === 'high') return 'medium'
  if (tier === 'medium') return 'low'
  return 'low'
}

/**
 * Heuristic device capability tier for 3D workloads.
 * Chrome/Edge get one step lower — they struggle with dual-canvas compositing.
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

  let tier: PerfTier = 'high'
  if (isMobile || coarsePointer) tier = 'low'
  else if (cores <= 4 || (memory !== undefined && memory <= 4)) tier = 'low'
  else if (cores <= 6 || smallScreen || (memory !== undefined && memory <= 8)) tier = 'medium'

  if (isStrictChromium()) tier = downgradeTier(tier)
  return tier
}

/** Cap device pixel ratio — keeps Chrome/Edge fill-rate in check */
export function canvasDprForTier(tier: PerfTier): number {
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio : 1
  switch (tier) {
    case 'low':
      return 1
    case 'medium':
      return Math.min(1, dpr)
    default:
      return Math.min(1.25, dpr)
  }
}
