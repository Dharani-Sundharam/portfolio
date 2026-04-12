'use client'

import { Suspense, useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, useGLTF, useProgress } from '@react-three/drei'
import * as THREE from 'three'
import { Toaster } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { sections } from '@/data/sections'
import ScrollProgressNav from '@/components/ui/ScrollProgressNav'
import { scrollState } from '@/lib/scrollState'
import { snapToSection, getCurrentSnapIdx, getSnapAnimId, isSnapping, SNAP_MS_VAL } from '@/lib/snapNav'
import portfolio from '@/data/portfolio.json'
import CpuPanel from '@/components/overlays/CpuPanel'
import RamPanel from '@/components/overlays/RamPanel'
import NvmePanel from '@/components/overlays/NvmePanel'
import IoPanel from '@/components/overlays/IoPanel'
import LightPillar from '@/components/LightPillar'

// ─────────────────────────────────────────────────────────────────────────────
// KEYFRAMES
// ─────────────────────────────────────────────────────────────────────────────
interface Keyframe {
  t: number
  pos: [number, number, number]
  look: [number, number, number]
}

const KEYFRAMES: Keyframe[] = [
  { t: 0.00, pos: [-5.365, 1.328, 4.679], look: [1.450, 1.093, 1.060] },
  { t: 0.07, pos: [-5.365, 1.328, 4.679], look: [1.450, 1.093, 1.060] },
  { t: 0.28, pos: [0.308, 0.105, 1.726], look: [0.307, 0.832, 0.670] },
  { t: 0.48, pos: [6.830, 2.161, 2.761], look: [0.050, 1.726, 1.216] },
  { t: 0.65, pos: [-2.533, -0.318, 0.502], look: [-0.295, -0.444, 0.272] },
  { t: 0.83, pos: [-6.381, 1.027, -3.534], look: [-2.604, 2.031, 0.984] },
  { t: 1.00, pos: [-5.365, 1.328, 4.679], look: [1.450, 1.093, 1.060] },
]

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function sampleKeyframes(t: number): { pos: THREE.Vector3; look: THREE.Vector3 } {
  const tc = Math.max(0, Math.min(1, t))
  let fromIdx = 0
  for (let i = 0; i < KEYFRAMES.length - 1; i++) {
    if (tc >= KEYFRAMES[i].t && tc <= KEYFRAMES[i + 1].t) { fromIdx = i; break }
  }
  const from = KEYFRAMES[fromIdx]
  const to = KEYFRAMES[Math.min(fromIdx + 1, KEYFRAMES.length - 1)]
  const span = to.t - from.t
  const e = easeInOutCubic(Math.max(0, Math.min(1, span < 0.0001 ? 1 : (tc - from.t) / span)))
  return {
    pos: new THREE.Vector3(
      THREE.MathUtils.lerp(from.pos[0], to.pos[0], e),
      THREE.MathUtils.lerp(from.pos[1], to.pos[1], e),
      THREE.MathUtils.lerp(from.pos[2], to.pos[2], e),
    ),
    look: new THREE.Vector3(
      THREE.MathUtils.lerp(from.look[0], to.look[0], e),
      THREE.MathUtils.lerp(from.look[1], to.look[1], e),
      THREE.MathUtils.lerp(from.look[2], to.look[2], e),
    ),
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION DETECTION
// ─────────────────────────────────────────────────────────────────────────────
function getSection(t: number): string {
  if (t < 0.18) return 'intro'
  if (t < 0.38) return 'about'
  if (t < 0.57) return 'skills'
  if (t < 0.75) return 'projects'
  if (t < 0.95) return 'contact'
  return 'outro'
}

// ─── Motherboard ─────────────────────────────────────────────────────────────
function Motherboard() {
  const { scene } = useGLTF('/motherboard.glb')
  const groupRef = useRef<THREE.Group>(null!)

  useMemo(() => {
    scene.traverse((child) => {
      const mesh = child as THREE.Mesh
      if (!mesh.isMesh) return
      mesh.castShadow = true; mesh.receiveShadow = true
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      mats.forEach((mat) => {
        const m = mat as THREE.MeshStandardMaterial
        if (m?.isMeshStandardMaterial) { m.envMapIntensity = 0.8; m.needsUpdate = true }
      })
    })
  }, [scene])

  useFrame((state) => {
    if (!groupRef.current) return
    const targetX = (state.pointer.x * Math.PI) / 90
    const targetY = (state.pointer.y * Math.PI) / 90
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetX, 0.06)
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -targetY, 0.06)
  })

  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={1} position={[-0.318, 0.051, 7.244]} />
    </group>
  )
}

function LoadingMesh() {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame((_, dt) => { ref.current.rotation.y += dt * 0.4 })
  return <mesh ref={ref}><boxGeometry args={[3, 0.1, 4]} /><meshStandardMaterial color="#334155" wireframe /></mesh>
}

// ─── Dynamic Activation Lights ───────────────────────────────────────────────
function DynamicLights() {
  const activeSections = sections.slice(1)
  const lightRefs = useRef<(THREE.PointLight | null)[]>(new Array(activeSections.length).fill(null))

  useFrame(() => {
    const sectionId = getSection(scrollState.offset)
    activeSections.forEach((section, i) => {
      const light = lightRefs.current[i]
      if (!light) return
      const isActive = section.id === sectionId
      light.intensity = THREE.MathUtils.lerp(light.intensity, isActive ? 5 : 0, 0.05)
      light.color.lerp(new THREE.Color(isActive ? section.lightColor : '#000000'), 0.05)
    })
  })

  return (
    <>
      {activeSections.map((section, i) => (
        <pointLight key={section.id} ref={(el) => { lightRefs.current[i] = el }}
          position={section.lightPos} intensity={0} distance={5} decay={2} color={section.lightColor} />
      ))}
    </>
  )
}

// ─── Camera Rig — reads scrollState directly ─────────────────────────────────
function CameraRig() {
  const { camera } = useThree()
  
  // Initialize far away and high up, so the initial lerp creates a cinematic zoom-in!
  const posRef = useRef(new THREE.Vector3(-12.0, 10.0, 15.0))
  const lookRef = useRef(new THREE.Vector3(1.450, 1.093, 1.060))

  useFrame(() => {
    const { pos, look } = sampleKeyframes(scrollState.offset)
    posRef.current.lerp(pos, 0.03)
    lookRef.current.lerp(look, 0.03)
    camera.position.copy(posRef.current)
    camera.lookAt(lookRef.current)
  })

  return null
}

// ─── Section Panel Router ─────────────────────────────────────────────────────
function ScreenPanels() {
  const [activeId, setActiveId] = useState('intro')
  const [transitioning, setTransitioning] = useState(false)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const tick = () => {
      const id = getSection(scrollState.offset)
      const snapping = isSnapping()
      setActiveId(prev => prev === id ? prev : id)
      setTransitioning(prev => prev === snapping ? prev : snapping)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  // Hide all panels while camera is flying — they exit with slide animations,
  // then the destination panel slides in once the snap settles.
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 40 }}>
      {/* Profile avatar — fixed top-right, shown only on About Me section */}
      <AnimatePresence>
        {!transitioning && activeId === 'about' && (
          <motion.img
            key="avatar"
            src={portfolio.profile.avatar}
            alt="DS"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            style={{
              position: 'fixed', top: 22, right: 24, zIndex: 100,
              width: 96, height: 96, borderRadius: '50%', objectFit: 'cover',
              border: '2.5px solid rgba(245,158,11,0.55)',
              boxShadow: '0 0 28px rgba(245,158,11,0.4), 0 4px 24px rgba(0,0,0,0.5)',
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!transitioning && activeId === 'about' && <CpuPanel key="cpu" />}
        {!transitioning && activeId === 'skills' && <RamPanel key="ram" />}
        {!transitioning && activeId === 'projects' && <NvmePanel key="nvme" />}
        {!transitioning && activeId === 'contact' && <IoPanel key="io" />}
      </AnimatePresence>
    </div>
  )
}

// ─── Intro / Outro Hero ─────────────────────────────────────────────────────
function IntroHero() {
  const [visible, setVisible] = useState(true)
  const [isOutro, setIsOutro] = useState(false)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const tick = () => {
      const t = scrollState.offset
      const outro = t > 0.92
      setVisible(t < 0.12 || outro)
      setIsOutro(outro)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <div style={{
          position: 'absolute', right: '6%', top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 40, textAlign: 'right', pointerEvents: 'none',
        }}>
          <motion.div
            initial={{ opacity: 0, x: 70 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 70 }}
            transition={{ type: 'spring', damping: 28, stiffness: 150 }}
          >


            {/* Intro name | Outro big message */}
            {!isOutro ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, type: 'spring' }}
                style={{ fontSize: 'clamp(52px, 7vw, 112px)', fontWeight: 800, lineHeight: 1.05, color: '#f1f5f9', textShadow: '0 0 60px rgba(129,140,248,0.5)', marginBottom: 20, letterSpacing: '-0.03em' }}
              >
                Dharani<br />
                <span style={{ background: 'linear-gradient(to right, #67e8f9, #a7f3d0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Sundharam
                </span>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, type: 'spring' }}
                style={{ fontSize: 'clamp(36px, 5vw, 78px)', fontWeight: 800, lineHeight: 1.08, textShadow: '0 0 60px rgba(168,85,247,0.55)', marginBottom: 20, letterSpacing: '-0.03em' }}
              >
                <span style={{ color: '#f1f5f9' }}>You've come<br />this far !!</span><br />
                <span style={{ fontSize: '0.55em', fontWeight: 700, background: 'linear-gradient(to right, #67e8f9, #a7f3d0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Looks like you're interested.
                </span>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              style={{ fontSize: 22, color: '#94a3b8', fontWeight: 500, marginBottom: 44, letterSpacing: '-0.01em' }}
            >
              {!isOutro ? portfolio.profile.role : ''}
            </motion.div>

            {/* Intro: scroll hint  |  Outro: resume CTA */}
            {!isOutro ? (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'flex-end', opacity: 0.8, pointerEvents: 'none' }}
              >
                <span style={{ fontSize: 13, color: '#cbd5e1', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600 }}>Scroll down to explore</span>
                <div style={{ width: 2, height: 48, background: 'linear-gradient(#67e8f9, transparent)' }} />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, type: 'spring' }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 16, pointerEvents: 'auto' }}
              >
                <motion.a
                  href="/resume.pdf"
                  target="_blank" rel="noopener noreferrer"
                  whileHover={{ scale: 1.06, boxShadow: '0 0 32px rgba(168,85,247,0.5)' }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 10,
                    padding: '14px 30px', borderRadius: 16,
                    background: '#ffffff',
                    border: 'none',
                    color: '#0a0a0a', fontWeight: 800, fontSize: 16,
                    textDecoration: 'none', letterSpacing: '-0.01em',
                  }}
                >
                  Here is my Resume
                </motion.a>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}


// ─── 3D Scene ─────────────────────────────────────────────────────────────────
function Scene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <Suspense fallback={null}><Environment preset="city" background={false} /></Suspense>
      <hemisphereLight args={['#7c3aed', '#1e1b4b', 3.5]} />
      <directionalLight position={[0, 12, 3]} intensity={1.8} color="#fff5e0" castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
      <directionalLight position={[-8, 4, 4]} intensity={2.0} color="#8484fcff" />
      <directionalLight position={[8, 4, 4]} intensity={2.0} color="#38bdf8" />
      <DynamicLights />
      <CameraRig />
      <ContactShadows position={[0, -0.5, 0]} opacity={0.55} scale={16} blur={3.5} far={3} color="#1e1b4b" />
      <Suspense fallback={<LoadingMesh />}><Motherboard /></Suspense>
    </>
  )
}

// ─── Global Loader ────────────────────────────────────────────────────────────
function GlobalLoading() {
  const { active, progress } = useProgress()
  
  return (
    <AnimatePresence>
      {active && (
        <motion.div
           initial={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           transition={{ duration: 0.8, ease: 'easeOut' }}
           style={{
             position: 'fixed', inset: 0, zIndex: 9999, background: '#020617',
             display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20
           }}
        >
          <div style={{ width: 44, height: 44, borderRadius: '50%', border: '2.5px solid #8b5cf6', borderTopColor: 'transparent' }} className="animate-spin" />
          <p style={{ color: '#94a3b8', fontSize: 13, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600 }}>
            Initialising !! {Math.max(0, Math.round(progress))}%
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function InteractiveBoard() {

  useEffect(() => {
    let lastScrollTime = 0
    let accumulatedDelta = 0
    const cooldown = SNAP_MS_VAL * 0.8 // 1200ms

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      const now = performance.now()

      if (now - lastScrollTime < cooldown) {
        accumulatedDelta = 0 // Ignore lingering trackpad inertia during the cooldown phase
        return
      }

      accumulatedDelta += e.deltaY

      if (Math.abs(accumulatedDelta) > 50) {
        if (accumulatedDelta > 0) snapToSection(getCurrentSnapIdx() + 1)
        else snapToSection(getCurrentSnapIdx() - 1)
        
        lastScrollTime = now
        accumulatedDelta = 0
      }
    }

    const handleKey = (e: KeyboardEvent) => {
      if (['ArrowDown', 'PageDown'].includes(e.key)) {
        e.preventDefault(); snapToSection(getCurrentSnapIdx() + 1)
      } else if (['ArrowUp', 'PageUp'].includes(e.key)) {
        e.preventDefault(); snapToSection(getCurrentSnapIdx() - 1)
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('keydown', handleKey)
    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('keydown', handleKey)
      const id = getSnapAnimId()
      if (id) cancelAnimationFrame(id)
    }
  }, [])

  return (
    <div style={{
      position: 'relative', width: '100%', height: '100vh', overflow: 'hidden',
      background: 'radial-gradient(ellipse 120% 80% at 60% 40%, #0d0b2a 0%, #04051a 45%, #020310 100%)',
    }}>
      <GlobalLoading />
      
      {/* Grain overlay */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.75\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.03\'/%3E%3C/svg%3E")',
        backgroundSize: '200px 200px', opacity: 0.4,
      }} />

      {/* LightPillar background — zIndex 1, below Three.js canvas */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
        <LightPillar
          topColor="#047857"
          bottomColor="#0e7490"
          intensity={1.2}
          rotationSpeed={0.3}
          glowAmount={0.0025}
          pillarWidth={4.4}
          pillarHeight={0.8}
          noiseIntensity={0.4}
          pillarRotation={125}
          interactive={false}
          mixBlendMode="screen"
          quality="high"
        />
      </div>


      <ScrollProgressNav />
      <IntroHero />
      <ScreenPanels />

      <Canvas
        camera={{ position: [-5.365, 1.328, 4.679], fov: 50, near: 0.1, far: 100 }}
        gl={{ antialias: true, toneMappingExposure: 1.3, toneMapping: THREE.ACESFilmicToneMapping, alpha: true }}
        style={{ position: 'absolute', inset: 0, zIndex: 2, background: 'transparent' }}
        shadows="soft"
        dpr={[1, 2]}
      >
        <Scene />
      </Canvas>
    </div>
  )
}

useGLTF.preload('/motherboard.glb')
