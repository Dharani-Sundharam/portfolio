import { Cpu, MemoryStick, HardDrive, Plug } from 'lucide-react'
import type { ComponentType } from 'react'

export type SectionId = 'intro' | 'about' | 'skills' | 'projects' | 'contact'

export interface BoardSection {
  id: SectionId
  label: string            // Component label shown on the board
  title: string            // Panel heading
  /** Normalized scroll range [start, end] within 0–1 */
  scrollRange: [number, number]
  /** World-space camera position for this section */
  cameraPos: [number, number, number]
  /** World-space point the camera looks at */
  cameraTarget: [number, number, number]
  /** Hex colour for the activation point light */
  lightColor: string
  /** World-space position of the activation point light */
  lightPos: [number, number, number]
  /** Lucide icon component — used in the side nav dots */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Icon: ComponentType<any>
}

export const sections: BoardSection[] = [
  {
    id: 'intro',
    label: 'Board',
    title: 'Welcome',
    scrollRange: [0, 0.15],
    cameraPos: [-6.706, 0.526, 8.367],
    cameraTarget: [5.423, 0.683, 0.606],
    lightColor: '#818cf8',
    lightPos: [5.423, 1.5, 0.606],
    Icon: Cpu,
  },
  {
    id: 'about',
    label: 'CPU',
    title: 'About Me',
    scrollRange: [0.15, 0.38],
    cameraPos: [0.308, 0.105, 1.726],
    cameraTarget: [0.307, 0.832, 0.670],
    lightColor: '#f59e0b',
    lightPos: [0.307, 1.2, 0.670],   // above CPU look-at target
    Icon: Cpu,
  },
  {
    id: 'skills',
    label: 'RAM',
    title: 'Skills',
    scrollRange: [0.38, 0.62],
    cameraPos: [5.723, 1.933, 2.777],
    cameraTarget: [2.994, 2.043, 1.766],
    lightColor: '#93c5fd',
    lightPos: [2.994, 2.8, 1.766],   // above RAM look-at target
    Icon: MemoryStick,
  },
  {
    id: 'projects',
    label: 'NVMe',
    title: 'Projects',
    scrollRange: [0.62, 0.82],
    cameraPos: [-0.477, -1.239, 2.679],
    cameraTarget: [-0.459, -0.985, 1.712],
    lightColor: '#34d399',
    lightPos: [-0.459, -0.3, 1.712],  // above NVMe look-at target
    Icon: HardDrive,
  },
  {
    id: 'contact',
    label: 'I/O',
    title: 'Contact',
    scrollRange: [0.82, 1.0],
    cameraPos: [-8.582, 2.001, 1.395],
    cameraTarget: [-4.377, 1.998, 1.353],
    lightColor: '#22d3ee',
    lightPos: [-4.377, 2.8, 1.353],   // above I/O look-at target
    Icon: Plug,
  },
]



/** Given a 0-1 scroll offset, return the active section */
export function getActiveSection(offset: number): BoardSection {
  for (const section of sections) {
    const [start, end] = section.scrollRange
    if (offset >= start && offset < end) return section
  }
  return sections[sections.length - 1]
}

/** Linearly interpolate between two camera states based on progress t (0-1) */
export function lerpCameraState(
  from: BoardSection,
  to: BoardSection,
  t: number,
): { pos: [number, number, number]; target: [number, number, number] } {
  const lerp = (a: number, b: number) => a + (b - a) * t
  return {
    pos: [
      lerp(from.cameraPos[0], to.cameraPos[0]),
      lerp(from.cameraPos[1], to.cameraPos[1]),
      lerp(from.cameraPos[2], to.cameraPos[2]),
    ],
    target: [
      lerp(from.cameraTarget[0], to.cameraTarget[0]),
      lerp(from.cameraTarget[1], to.cameraTarget[1]),
      lerp(from.cameraTarget[2], to.cameraTarget[2]),
    ],
  }
}
