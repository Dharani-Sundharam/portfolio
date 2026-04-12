'use client'

/**
 * RAM Panel — "Skills"
 * DRAMATIC interactive skill display:
 * – Big floating pills (17px, 52px tall)
 * – Each chip breathes (float up/down) at different speeds
 * – Hover: 3D magnetic tilt + intense colour glow + scale
 * – Skills grouped by domain with bold category headers
 */

import { useRef } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'

const SKILL_GROUPS = [
  {
    label: 'Security',
    color: '#f87171',
    skills: ['Cybersecurity', 'Network Security', 'Penetration Testing', 'CTF Competitions'],
  },
  {
    label: 'Hardware & IoT',
    color: '#fb923c',
    skills: ['IoT & Embedded Systems', 'Arduino / RPi', 'STM32', 'PCB Designing', 'Fusion 360'],
  },
  {
    label: 'Cloud & DevOps',
    color: '#38bdf8',
    skills: ['AWS Cloud', 'Docker', 'Linux'],
  },
  {
    label: 'Languages',
    color: '#a78bfa',
    skills: ['Python', 'C++', 'Java'],
  },
  {
    label: 'Software',
    color: '#34d399',
    skills: ['React / Next.js', 'Computer Vision (OpenCV)', 'Backend Development'],
  },
]

// ── Magnetic 3D-tilt skill chip ────────────────────────────────────────────
function SkillChip({ skill, color, floatDelay }: { skill: string; color: string; floatDelay: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rotateX = useTransform(my, [-25, 25], [12, -12])
  const rotateY = useTransform(mx, [-25, 25], [-12, 12])

  const onMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    mx.set((e.clientX - (r.left + r.width  / 2)) * 0.45)
    my.set((e.clientY - (r.top  + r.height / 2)) * 0.45)
  }
  const onLeave = () => { mx.set(0); my.set(0) }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      // Breathing float
      animate={{ y: [0, -9, 0] }}
      transition={{
        duration: 2.8 + floatDelay * 0.6,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: floatDelay * 0.35,
      }}
      whileHover={{
        scale: 1.18,
        boxShadow: `0 0 0 2px ${color}60, 0 8px 40px ${color}55`,
        background: `${color}18`,
        zIndex: 10,
      }}
      style={{
        rotateX, rotateY,
        transformPerspective: 700,
        transformStyle: 'preserve-3d',
        padding: '8px 16px',
        borderRadius: 12,
        background: 'rgba(8,14,40,0.75)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        border: `1.5px solid ${color}35`,
        color: '#f1f5f9',
        fontSize: 13,
        fontWeight: 700,
        cursor: 'default',
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        letterSpacing: '-0.01em',
        userSelect: 'none',
      }}
    >
      {/* Colour dot */}
      <motion.span
        animate={{ opacity: [1, 0.4, 1], scale: [1, 1.4, 1] }}
        transition={{ duration: 2 + floatDelay * 0.4, repeat: Infinity, delay: floatDelay * 0.2 }}
        style={{
          display: 'inline-block', width: 9, height: 9,
          borderRadius: '50%', background: color,
          boxShadow: `0 0 10px ${color}`,
          flexShrink: 0,
        }}
      />
      {skill}
    </motion.div>
  )
}

// ── Panel ──────────────────────────────────────────────────────────────────
export default function RamPanel() {
  return (
    <>
      {/* Left gradient vignette */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: '58%',
          background: 'linear-gradient(to right, rgba(4,5,26,0.97) 0%, rgba(4,5,26,0.75) 50%, transparent 100%)',
          pointerEvents: 'none', zIndex: 38,
        }}
      />

      {/* Skills card — flush left, full-height scrollable */}
      <motion.div
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50, transition: { duration: 0.2 } }}
        transition={{ type: 'spring', damping: 24, stiffness: 180 }}
        style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: 540, zIndex: 40, pointerEvents: 'auto',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          paddingLeft: 48, paddingRight: 26,
          paddingTop: 32, paddingBottom: 32,
          overflowY: 'hidden',
        }}
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          style={{ marginBottom: 14, flexShrink: 0 }}
        >
          <span style={{
            fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.22em',
            padding: '5px 18px', borderRadius: 999,
            border: '1px solid rgba(167,139,250,0.5)', color: '#a78bfa', background: 'rgba(167,139,250,0.08)',
          }}>Skills</span>
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, type: 'spring' }}
          style={{
            fontSize: 44, fontWeight: 900, color: '#fff',
            letterSpacing: '-0.04em', lineHeight: 1.0, marginBottom: 22, flexShrink: 0,
          }}
        >
          What I<br />
          <span style={{
            background: 'linear-gradient(to right, #67e8f9 0%, #a7f3d0 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Know.</span>
        </motion.div>

        {/* Skill groups */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {SKILL_GROUPS.map((group, gi) => {
            let chipIdx = 0
            SKILL_GROUPS.slice(0, gi).forEach(g => { chipIdx += g.skills.length })

            return (
              <motion.div
                key={group.label}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.28 + gi * 0.09, type: 'spring', stiffness: 200, damping: 24 }}
              >
                {/* Category header */}
                <div style={{
                  fontSize: 11, fontWeight: 800, color: group.color,
                  textTransform: 'uppercase', letterSpacing: '0.22em',
                  marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <div style={{ width: 24, height: 1.5, background: group.color, borderRadius: 2 }} />
                  {group.label}
                </div>

                {/* Chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  {group.skills.map((skill, si) => (
                    <SkillChip
                      key={skill}
                      skill={skill}
                      color={group.color}
                      floatDelay={chipIdx + si}
                    />
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </>
  )
}
