'use client'

/**
 * I/O Panel — "Contact"
 * RIGHT-side vignette. Content slides in from the RIGHT.
 * Uses real SVG brand icons — no emojis.
 */

import { motion } from 'framer-motion'
import portfolio from '@/data/portfolio.json'

// ── Brand icon image paths ───────────────────────────────────────────────────
const GmailIcon   = () => <img src="/images/google.png"   alt="Gmail"    width={28} height={28} style={{ objectFit: 'contain' }} />
const GitHubIcon  = () => <img src="/images/git.png"      alt="GitHub"   width={28} height={28} style={{ objectFit: 'contain' }} />
const LinkedInIcon= () => <img src="/images/linkedin.png" alt="LinkedIn" width={28} height={28} style={{ objectFit: 'contain' }} />

const LINKS = [
  {
    Icon: GmailIcon,
    label: 'Email',
    value: portfolio.profile.social.email,
    color: '#ea4335',
    href: `mailto:${portfolio.profile.social.email}`,
  },
  {
    Icon: GitHubIcon,
    label: 'GitHub',
    value: 'Dharani-Sundharam',
    color: '#94a3b8',
    href: portfolio.profile.social.github,
  },
  {
    Icon: LinkedInIcon,
    label: 'LinkedIn',
    value: 'Dharani Sundharam',
    color: '#0a66c2',
    href: portfolio.profile.social.linkedin,
  },
]

export default function IoPanel() {
  return (
    <>
      {/* ── Right gradient vignette ────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          position: 'absolute', right: 0, top: 0, bottom: 0, width: '52%',
          background: 'linear-gradient(to left, rgba(4,5,26,0.92) 0%, rgba(4,5,26,0.65) 55%, transparent 100%)',
          pointerEvents: 'none', zIndex: 38,
        }}
      />

      {/* ── Contact card — flush right, vertically centered ────────── */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 40, transition: { duration: 0.22 } }}
        transition={{ type: 'spring', damping: 26, stiffness: 190 }}
        style={{
          position: 'absolute', right: 0, top: 0, bottom: 0,
          width: 520, zIndex: 40, pointerEvents: 'auto',
          display: 'flex', alignItems: 'center',
          paddingRight: 52, paddingLeft: 32,
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
              border: '1px solid rgba(34,211,238,0.5)',
              color: '#22d3ee', background: 'rgba(34,211,238,0.08)',
            }}>I/O — Contact</span>
          </motion.div>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, type: 'spring' }}
            style={{ fontSize: 50, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: 16 }}
          >
            Get in<br />
            <span style={{ background: 'linear-gradient(to right, #67e8f9, #a7f3d0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Touch
            </span>
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.38 }}
            style={{ fontSize: 16, color: '#475569', lineHeight: 1.65, marginBottom: 36, fontWeight: 500 }}
          >
            Open to internships, hackathons, and collabs.<br />
            Hardware · Security · Full-Stack.
          </motion.p>

          {/* Contact links — real SVG icons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {LINKS.map(({ Icon, label, value, color, href }, i) => (
              <motion.a
                key={label}
                href={href}
                target={label !== 'Email' ? '_blank' : undefined}
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: 28 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.42 + i * 0.1, type: 'spring', stiffness: 220, damping: 24 }}
                whileHover={{ scale: 1.03, boxShadow: `0 0 32px ${color}20`, borderColor: `${color}55` }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 18,
                  padding: '16px 20px', borderRadius: 18,
                  background: 'rgba(5,8,26,0.7)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                  border: `1px solid ${color}18`, textDecoration: 'none', cursor: 'pointer',
                }}
              >
                {/* Brand icon */}
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}10`, border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 14.5, color: '#e2e8f0', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</div>
                </div>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
                  style={{ color: `${color}70`, fontSize: 20, flexShrink: 0 }}
                >→</motion.div>
              </motion.a>
            ))}
          </div>

          {/* Availability pulse */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }}
            style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 28 }}
          >
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ width: 9, height: 9, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 10px #34d399', flexShrink: 0 }}
            />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#34d399', letterSpacing: '0.06em' }}>Available for opportunities</span>
            <span style={{ fontSize: 12, color: '#334155' }}>· Chennai, India · Remote OK</span>
          </motion.div>

        </div>
      </motion.div>
    </>
  )
}
