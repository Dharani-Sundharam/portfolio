'use client'

/**
 * CPU Panel — "About Me"
 *
 * Clean single-column design:
 * • No SVG trace wire
 * • No right-side domain/social panel
 * • Left-side gradient vignette lets the CPU sit prominently in the center
 * • Large typography — name at 48px, body at 15-16px
 */

import { motion } from 'framer-motion'
import portfolio from '@/data/portfolio.json'

const SPRING = { type: 'spring', damping: 26, stiffness: 190 } as const

export default function CpuPanel() {
  const { profile, education, experience } = portfolio

  return (
    <>
      {/* ── Left gradient vignette — makes text readable against the 3D ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: '54%',
          background: 'linear-gradient(to right, rgba(4,5,26,0.92) 0%, rgba(4,5,26,0.7) 55%, transparent 100%)',
          pointerEvents: 'none', zIndex: 38,
        }}
      />

      {/* ── About Me card — flush left, vertically centered ── */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -40, transition: { duration: 0.22 } }}
        transition={SPRING}
        style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: 500, zIndex: 40, pointerEvents: 'auto',
          display: 'flex', alignItems: 'center',
          paddingLeft: 52, paddingRight: 32,
        }}
      >
        <div style={{ width: '100%' }}>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ marginBottom: 26 }}
          >
            <span style={{
              fontSize: 15, fontWeight: 800, textTransform: 'uppercase',
              letterSpacing: '0.22em', padding: '6px 18px', borderRadius: 999,
              border: '1px solid rgba(245,158,11,0.5)',
              color: '#f59e0b', background: 'rgba(245,158,11,0.08)',
            }}>About Me</span>
          </motion.div>

          {/* Big name */}
          <motion.div
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: 'spring' }}
          >
            <div style={{
              fontSize: 54, fontWeight: 800, color: '#fff',
              letterSpacing: '-0.03em', lineHeight: 1.0, marginBottom: 12,
            }}>
              Dharani<br />Sundharam
            </div>
            <div style={{
              fontSize: 19, color: '#f59e0b', fontWeight: 700,
              letterSpacing: '0.06em', marginBottom: 22,
            }}>{profile.role}</div>
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.44 }}
            style={{ fontSize: 19.5, color: '#94a3b8', lineHeight: 1.75, marginBottom: 30, maxWidth: 440 }}
          >
            {profile.tagline}
          </motion.p>

          {/* Education */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.54 }}>
            <div style={{
              fontSize: 14.5, fontWeight: 700, color: '#475569',
              textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 10,
            }}>Education</div>
            {education.map((edu, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '11px 15px', borderRadius: 13, marginBottom: 8,
                background: 'rgba(30,41,59,0.38)', border: '1px solid rgba(71,85,105,0.2)',
              }}>
                <div>
                  <div style={{ fontSize: 17.5, color: '#e2e8f0', fontWeight: 600 }}>{edu.degree}</div>
                  <div style={{ fontSize: 15.5, color: '#64748b' }}>{edu.school}</div>
                </div>
                <div style={{ fontSize: 15.5, color: '#f59e0b', fontWeight: 700, whiteSpace: 'nowrap', marginLeft: 14 }}>{edu.date}</div>
              </div>
            ))}
          </motion.div>

          {/* Experience */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.64 }}>
            <div style={{
              fontSize: 14.5, fontWeight: 700, color: '#475569',
              textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 10, marginTop: 18,
            }}>Experience</div>
            {experience.map((exp, i) => (
              <div key={i} style={{
                padding: '12px 15px', borderRadius: 13,
                background: 'rgba(30,41,59,0.38)', border: '1px solid rgba(71,85,105,0.2)',
              }}>
                <div style={{ fontSize: 18, color: '#e2e8f0', fontWeight: 700 }}>{exp.role}</div>
                <div style={{ fontSize: 16.5, color: '#f59e0b', fontWeight: 500, marginBottom: 6 }}>{exp.company}</div>
                <div style={{ fontSize: 16, color: '#64748b', lineHeight: 1.6 }}>{exp.description[0]}</div>
              </div>
            ))}
          </motion.div>

        </div>
      </motion.div>
    </>
  )
}
