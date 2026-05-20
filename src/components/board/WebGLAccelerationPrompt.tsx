'use client'

interface WebGLAccelerationPromptProps {
  reason?: string | null
}

const STEPS: Record<string, string[]> = {
  Chrome: [
    'Open Settings → System',
    'Turn on "Use graphics acceleration when available"',
    'Relaunch Chrome',
  ],
  Edge: [
    'Open Settings → System and performance',
    'Enable "Use graphics acceleration when available"',
    'Restart Edge',
  ],
  Brave: [
    'Open Settings → System',
    'Enable "Use graphics acceleration when available"',
    'Restart Brave',
  ],
  Default: [
    'Open your browser settings',
    'Find "Hardware acceleration" or "Graphics acceleration"',
    'Turn it on and restart the browser',
  ],
}

function detectBrowser(): keyof typeof STEPS {
  if (typeof navigator === 'undefined') return 'Default'
  const ua = navigator.userAgent
  if (ua.includes('Edg/')) return 'Edge'
  if ('brave' in navigator) return 'Brave'
  if (ua.includes('Chrome')) return 'Chrome'
  return 'Default'
}

export default function WebGLAccelerationPrompt({ reason }: WebGLAccelerationPromptProps) {
  const browser = detectBrowser()
  const steps = STEPS[browser] ?? STEPS.Default

  return (
    <div
      className="w-full h-screen flex items-center justify-center px-6"
      style={{
        background:
          'radial-gradient(ellipse 120% 80% at 60% 40%, #0d0b2a 0%, #04051a 45%, #020310 100%)',
      }}
    >
      <div
        style={{
          maxWidth: 480,
          padding: '32px 28px',
          borderRadius: 16,
          background: 'rgba(15,23,42,0.85)',
          border: '1px solid rgba(148,163,184,0.2)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            margin: '0 auto 20px',
            borderRadius: 12,
            background: 'rgba(99,102,241,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
          }}
        >
          ⚡
        </div>

        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: '#f1f5f9',
            marginBottom: 12,
            letterSpacing: '-0.02em',
          }}
        >
          Enable graphics acceleration
        </h1>

        <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.6, marginBottom: 24 }}>
          This 3D experience needs your GPU. {reason ?? 'WebGL is blocked or running in software mode.'}
        </p>

        <ol
          style={{
            textAlign: 'left',
            fontSize: 14,
            color: '#cbd5e1',
            lineHeight: 1.8,
            paddingLeft: 20,
            marginBottom: 24,
          }}
        >
          {steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>

        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            padding: '12px 24px',
            borderRadius: 10,
            border: 'none',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#fff',
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          Reload after enabling
        </button>
      </div>
    </div>
  )
}
