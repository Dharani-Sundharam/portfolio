'use client'

/**
 * NVMe Panel — "Projects"
 * Data sourced from src/data/projects.json — add new projects there.
 * Right-side vignette. Manual arrow carousel.
 */

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import projectsData from '@/data/projects.json'

const PROJECTS = projectsData.projects

function AutoImageSlider({ images, alt }: { images: string[], alt: string }) {
  const [imgIdx, setImgIdx] = useState(0)

  useEffect(() => {
    if (!images || images.length <= 1) return
    const id = setInterval(() => {
      setImgIdx(prev => (prev + 1) % images.length)
    }, 2000)
    return () => clearInterval(id)
  }, [images])

  if (!images || images.length === 0) return null

  return (
    <AnimatePresence>
      <motion.img
        key={imgIdx}
        src={images[imgIdx]}
        alt={alt}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', position: 'absolute', inset: 0 }}
      />
    </AnimatePresence>
  )
}

export default function NvmePanel() {
  const [idx, setIdx] = useState(0)
  const [dir, setDir] = useState<1 | -1>(1)
  const panelRef = useRef<HTMLDivElement>(null)

  const go = (d: 1 | -1) => {
    const next = idx + d
    if (next < 0 || next >= PROJECTS.length) return
    setDir(d)
    setIdx(next)
  }

  const jumpTo = (i: number) => {
    if (i === idx) return
    setDir(i > idx ? 1 : -1)
    setIdx(i)
  }

  useEffect(() => {
    let lastTime = 0
    let accX = 0

    const handleWheel = (e: WheelEvent) => {
      e.stopPropagation() // Prevents InteractiveBoard global vertical snap scroll
      
      const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY)
      if (isHorizontal) {
        e.preventDefault() // prevent Chrome/Safari global back/forward swipes
        const now = performance.now()
        if (now - lastTime < 600) {
          accX = 0
          return
        }
        
        accX += e.deltaX
        if (Math.abs(accX) > 40) {
          go(accX > 0 ? 1 : -1)
          lastTime = now
          accX = 0
        }
      }
    }

    const node = panelRef.current
    if (node) {
      node.addEventListener('wheel', handleWheel, { passive: false })
    }
    return () => {
      if (node) node.removeEventListener('wheel', handleWheel)
    }
  }, [idx])

  const cardVariants = {
    initial: (d: number) => ({ x: d * 90, opacity: 0 }),
    animate: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d * -70, opacity: 0 }),
  }

  const p = PROJECTS[idx]

  return (
    <>
      {/* ── Right gradient vignette ───────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'absolute', right: 0, top: 0, bottom: 0, width: '62%',
          background: 'linear-gradient(to left, rgba(4,5,26,0.96) 0%, rgba(4,5,26,0.75) 45%, transparent 100%)',
          pointerEvents: 'none', zIndex: 38,
        }}
      />

      {/* ── Full-height card flush right ─────────────────────── */}
      <motion.div
        ref={panelRef}
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 50, transition: { duration: 0.2 } }}
        transition={{ type: 'spring', damping: 24, stiffness: 180 }}
        style={{
          position: 'absolute', right: 0, top: 0, bottom: 0,
          width: 555, zIndex: 40, pointerEvents: 'auto',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          paddingLeft: 26, paddingRight: 58,
          paddingTop: 32, paddingBottom: 32,
          overflowY: 'hidden',
        }}
      >
        {/* Header — badge + counter */}
        <motion.div
          initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
          style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16, flexShrink: 0 }}
        >
          <span style={{
            fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em',
            padding: '5px 16px', borderRadius: 999,
            border: '1px solid rgba(52,211,153,0.5)', color: '#34d399', background: 'rgba(52,211,153,0.08)',
          }}>Projects</span>
          <span style={{ fontSize: 12, color: '#334155', fontWeight: 600 }}>{idx + 1} / {PROJECTS.length}</span>
          {/* Stars */}
          {p.stars > 0 && (
            <span style={{ fontSize: 12, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
              ★ {p.stars}
            </span>
          )}
        </motion.div>

        {/* Animated project card */}
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={idx}
            custom={dir}
            variants={cardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column', minHeight: 0 }}
          >
            {/* ── Project image ─────────────────────────────── */}
            <div style={{
              width: '100%', height: 420, borderRadius: 18, overflow: 'hidden', marginBottom: 16,
              border: `1px solid ${p.color}28`,
              boxShadow: `0 10px 40px rgba(0,0,0,0.55), 0 0 0 1px ${p.color}12`,
              position: 'relative', flexShrink: 0,
            }}>
              <AutoImageSlider images={p.images || [p.image]} alt={p.title} />
            </div>

            {/* Title */}
            <div style={{
              fontSize: 22, fontWeight: 800, color: '#f1f5f9',
              letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 7, flexShrink: 0,
            }}>{p.title}</div>

            {/* Description */}
            <p style={{
              fontSize: 13.5, color: '#94a3b8', lineHeight: 1.65,
              marginBottom: 12, flexShrink: 0,
            }}>{p.description}</p>

            {/* Tech chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14, flexShrink: 0 }}>
              {p.tech.map((tag: string) => (
                <span key={tag} style={{
                  fontSize: 12, fontWeight: 600, padding: '5px 13px', borderRadius: 999,
                  background: `${p.color}0e`, border: `1px solid ${p.color}35`, color: p.color,
                }}>{tag}</span>
              ))}
            </div>

            {/* GitHub link — only if URL exists */}
            {p.url && (
              <motion.a
                href={p.url} target="_blank" rel="noopener noreferrer"
                whileHover={{ scale: 1.04, background: `${p.color}18` }} whileTap={{ scale: 0.97 }}
                style={{
                  alignSelf: 'flex-start', padding: '10px 22px', borderRadius: 12,
                  background: 'rgba(15,23,42,0.5)', border: `1px solid ${p.color}40`,
                  color: p.color, fontWeight: 700, fontSize: 13.5, flexShrink: 0,
                  display: 'inline-flex', alignItems: 'center', gap: 7, textDecoration: 'none',
                }}
              >
                GitHub ↗
              </motion.a>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ── Arrow navigation row ──────────────────────────── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, marginTop: 18, flexShrink: 0,
          pointerEvents: 'auto',
        }}>
          {/* ← arrow */}
          <motion.button
            onClick={() => go(-1)}
            whileHover={idx > 0 ? { scale: 1.1, background: 'rgba(52,211,153,0.16)' } : {}}
            whileTap={idx > 0 ? { scale: 0.9 } : {}}
            style={{
              width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
              background: idx > 0 ? 'rgba(15,23,42,0.7)' : 'rgba(15,23,42,0.3)',
              backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
              border: `1.5px solid ${idx > 0 ? 'rgba(52,211,153,0.4)' : 'rgba(71,85,105,0.12)'}`,
              color: idx > 0 ? '#34d399' : '#1e293b',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: idx > 0 ? 'pointer' : 'default', fontSize: 22, fontWeight: 700,
            }}
          >‹</motion.button>

          <span style={{ flex: 1, textAlign: 'center', fontSize: 13, color: '#334155', fontWeight: 600 }}>
            {idx + 1} / {PROJECTS.length}
          </span>

          {/* → arrow */}
          <motion.button
            onClick={() => go(1)}
            whileHover={idx < PROJECTS.length - 1 ? { scale: 1.1, background: 'rgba(52,211,153,0.16)' } : {}}
            whileTap={idx < PROJECTS.length - 1 ? { scale: 0.9 } : {}}
            style={{
              width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
              background: idx < PROJECTS.length - 1 ? 'rgba(15,23,42,0.7)' : 'rgba(15,23,42,0.3)',
              backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
              border: `1.5px solid ${idx < PROJECTS.length - 1 ? 'rgba(52,211,153,0.4)' : 'rgba(71,85,105,0.12)'}`,
              color: idx < PROJECTS.length - 1 ? '#34d399' : '#1e293b',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: idx < PROJECTS.length - 1 ? 'pointer' : 'default', fontSize: 22, fontWeight: 700,
            }}
          >›</motion.button>
        </div>
      </motion.div>
    </>
  )
}
