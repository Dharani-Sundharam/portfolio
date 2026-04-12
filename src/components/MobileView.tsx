'use client'

/**
 * MobileView — shown on small screens instead of the full 3D experience.
 * Simple, elegant vertical scroll with LightPillar background.
 */

import { motion } from 'framer-motion'
import portfolio from '@/data/portfolio.json'
import projectsData from '@/data/projects.json'
import LightPillar from '@/components/LightPillar'

// Reusing SKILL_GROUPS from RamPanel
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

export default function MobileView() {
  const { profile, education, experience } = portfolio
  const { projects } = projectsData

  return (
    <div style={{
      position: 'relative', width: '100%', minHeight: '100vh',
      background: 'radial-gradient(ellipse 120% 80% at 60% 40%, #0d0b2a 0%, #04051a 45%, #020310 100%)',
      overflowX: 'hidden', display: 'flex', flexDirection: 'column',
    }}>
      {/* LightPillar background - Fixed */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
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
          quality="low"
        />
      </div>

      {/* Main Content Container */}
      <div style={{
        position: 'relative', zIndex: 10,
        display: 'flex', flexDirection: 'column',
        padding: '60px 24px', maxWidth: 600, margin: '0 auto', width: '100%'
      }}>
        
        {/* -- HERO SECTION -- */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ marginBottom: 60, textAlign: 'center' }}
        >
          <div style={{
            fontSize: 42, fontWeight: 900, color: '#f1f5f9',
            letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: 12,
          }}>
            Dharani<br />
            <span style={{
              background: 'linear-gradient(to right, #67e8f9, #a7f3d0)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>Sundharam</span>
          </div>

          <div style={{
            fontSize: 15, fontWeight: 600, color: '#f59e0b',
            letterSpacing: '0.06em', marginBottom: 24,
            textTransform: 'uppercase',
          }}>
            {profile.role}
          </div>

          <p style={{
            fontSize: 15, color: '#94a3b8', lineHeight: 1.7, marginBottom: 30,
            textAlign: 'center'
          }}>
            {profile.tagline}
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {profile.github && (
              <a href={profile.github} target="_blank" rel="noopener noreferrer" style={{
                padding: '10px 22px', borderRadius: 12,
                background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(103,232,249,0.3)',
                color: '#67e8f9', fontWeight: 700, fontSize: 13.5, textDecoration: 'none',
              }}>
                GitHub ↗
              </a>
            )}
            {profile.linkedin && (
              <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" style={{
                padding: '10px 22px', borderRadius: 12,
                background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(167,139,250,0.3)',
                color: '#a78bfa', fontWeight: 700, fontSize: 13.5, textDecoration: 'none',
              }}>
                LinkedIn ↗
              </a>
            )}
          </div>
        </motion.section>

        {/* -- EXPERIENCE -- */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          style={{ marginBottom: 50 }}
        >
          <div style={{
            fontSize: 14, fontWeight: 800, color: '#475569',
            textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 16,
          }}>Experience</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {experience.map((exp, i) => (
              <div key={i} style={{
                padding: '16px', borderRadius: 16,
                background: 'rgba(30,41,59,0.4)', border: '1px solid rgba(71,85,105,0.2)',
                backdropFilter: 'blur(8px)'
              }}>
                <div style={{ fontSize: 17, color: '#e2e8f0', fontWeight: 700, marginBottom: 4 }}>{exp.role}</div>
                <div style={{ fontSize: 14.5, color: '#f59e0b', fontWeight: 500, marginBottom: 12 }}>{exp.company}</div>
                <ul style={{ paddingLeft: 16, margin: 0, color: '#94a3b8', fontSize: 14, lineHeight: 1.6 }}>
                  {exp.description.slice(0, 2).map((desc, di) => (
                    <li key={di} style={{ marginBottom: 6 }}>{desc}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.section>

        {/* -- EDUCATION -- */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          style={{ marginBottom: 50 }}
        >
          <div style={{
            fontSize: 14, fontWeight: 800, color: '#475569',
            textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 16,
          }}>Education</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {education.map((edu, i) => (
              <div key={i} style={{
                padding: '16px', borderRadius: 16,
                background: 'rgba(30,41,59,0.4)', border: '1px solid rgba(71,85,105,0.2)',
                backdropFilter: 'blur(8px)'
              }}>
                <div style={{ fontSize: 16, color: '#e2e8f0', fontWeight: 700, marginBottom: 4 }}>{edu.degree}</div>
                <div style={{ fontSize: 14, color: '#94a3b8', marginBottom: 8 }}>{edu.school}</div>
                <div style={{ fontSize: 13, color: '#f59e0b', fontWeight: 700 }}>{edu.date}</div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* -- SKILLS -- */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          style={{ marginBottom: 50 }}
        >
          <div style={{
            fontSize: 14, fontWeight: 800, color: '#475569',
            textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 20,
          }}>Skills</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {SKILL_GROUPS.map((group, gi) => (
              <div key={gi}>
                <div style={{
                  fontSize: 12, fontWeight: 800, color: group.color,
                  textTransform: 'uppercase', letterSpacing: '0.15em',
                  marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <div style={{ width: 16, height: 2, background: group.color, borderRadius: 2 }} />
                  {group.label}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {group.skills.map(skill => (
                    <span key={skill} style={{
                      padding: '6px 12px', borderRadius: 10,
                      background: 'rgba(8,14,40,0.6)', border: `1px solid ${group.color}35`,
                      color: '#f1f5f9', fontSize: 13, fontWeight: 600,
                      backdropFilter: 'blur(8px)'
                    }}>
                      <span style={{
                        display: 'inline-block', width: 6, height: 6,
                        borderRadius: '50%', background: group.color, marginRight: 8,
                        boxShadow: `0 0 8px ${group.color}`
                      }} />
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* -- PROJECTS -- */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          style={{ marginBottom: 60 }}
        >
          <div style={{
            fontSize: 14, fontWeight: 800, color: '#475569',
            textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 20,
          }}>Projects</div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {projects.map((p, i) => (
              <div key={i} style={{
                borderRadius: 20, overflow: 'hidden', padding: 1,
                background: `linear-gradient(to bottom, ${p.color}40, rgba(30,41,59,0.3))`
              }}>
                <div style={{
                  background: '#04051a', borderRadius: 19, padding: '20px',
                  display: 'flex', flexDirection: 'column'
                }}>
                  
                  {/* Image (just taking first image if array) */}
                  <div style={{
                    width: '100%', height: 180, borderRadius: 12, overflow: 'hidden', marginBottom: 16,
                    border: `1px solid ${p.color}20`,
                  }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={p.images ? p.images[0] : p.image} 
                      alt={p.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  </div>

                  <div style={{ fontSize: 20, fontWeight: 800, color: '#f1f5f9', lineHeight: 1.2, marginBottom: 8 }}>
                    {p.title}
                  </div>
                  
                  <p style={{ fontSize: 13.5, color: '#94a3b8', lineHeight: 1.6, marginBottom: 16 }}>
                    {p.description}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                    {p.tech.map((tag: string) => (
                      <span key={tag} style={{
                        fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 999,
                        background: `${p.color}10`, border: `1px solid ${p.color}35`, color: p.color,
                      }}>{tag}</span>
                    ))}
                  </div>

                  {p.url && (
                    <a href={p.url} target="_blank" rel="noopener noreferrer" style={{
                      alignSelf: 'flex-start',
                      padding: '8px 16px', borderRadius: 10,
                      background: 'rgba(255,255,255,0.05)', border: `1px solid ${p.color}40`,
                      color: p.color, fontWeight: 700, fontSize: 13, textDecoration: 'none',
                    }}>
                      View Project ↗
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Footer */}
        <div style={{ textAlign: 'center', padding: '20px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ fontSize: 13, color: '#64748b' }}>
            Built by Dharani Sundharam<br/>
            Best experienced in 3D on a Desktop
          </p>
        </div>

      </div>
    </div>
  )
}
