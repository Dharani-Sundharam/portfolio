const SOFTWARE_RENDERER =
  /swiftshader|llvmpipe|software renderer|microsoft basic render|angle \(software/i

function getWebGLContext(canvas: HTMLCanvasElement): WebGLRenderingContext | null {
  const opts: WebGLContextAttributes = { failIfMajorPerformanceCaveat: true }
  return (
    (canvas.getContext('webgl2', opts) as WebGLRenderingContext | null) ||
    (canvas.getContext('webgl', opts) as WebGLRenderingContext | null) ||
    (canvas.getContext('experimental-webgl', opts) as WebGLRenderingContext | null)
  )
}

export function assessWebGLSupport(): { ok: boolean; reason?: string } {
  if (typeof document === 'undefined') {
    return { ok: false, reason: 'WebGL check unavailable.' }
  }

  try {
    const canvas = document.createElement('canvas')
    const gl = getWebGLContext(canvas)

    if (!gl) {
      return {
        ok: false,
        reason: 'WebGL is unavailable. Turn on hardware graphics acceleration and restart your browser.',
      }
    }

    const debug = gl.getExtension('WEBGL_debug_renderer_info')
    if (debug) {
      const renderer = gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) as string
      const vendor = gl.getParameter(debug.UNMASKED_VENDOR_WEBGL) as string
      const label = `${vendor} ${renderer}`

      if (SOFTWARE_RENDERER.test(label)) {
        return {
          ok: false,
          reason: 'Software rendering detected — enable graphics acceleration in your browser settings.',
        }
      }
    }

    return { ok: true }
  } catch {
    return {
      ok: false,
      reason: 'Could not initialize WebGL. Enable graphics acceleration and try again.',
    }
  }
}
