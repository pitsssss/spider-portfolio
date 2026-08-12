import type { JourneyChapterKey } from '../weaver/chapterConfig'
import type { ViewportTier } from './macbookCore'

export const MACBOOK_JOURNEY_MODEL_SCALE = 0.62

export type MacbookNarrativeKey =
  | 'hero'
  | 'process'
  | 'projects'
  | 'skills'
  | 'experience'
  | 'about'
  | 'contact'

export type ContentAlign = 'left' | 'right' | 'center'

export type MacbookJourneyPose = {
  offset: { x: number; y: number; z: number }
  rotation: { x: number; y: number; z: number }
  scaleMul: number
}

type SidePreset = {
  x: number
  y: number
  z: number
  rotX: number
  rotY: number
  rotZ: number
  scale: number
}

type NarrativeTweak = { y: number; z: number; rotX: number; scale: number }

/** Laptop sits on the side opposite the text column. */
const sideByContentAlign: Record<ViewportTier, Record<ContentAlign, SidePreset>> = {
  desktop: {
    left: { x: 1.28, y: 0.02, z: 0.04, rotX: 0.02, rotY: -0.15, rotZ: 0, scale: 0.66 },
    right: { x: -1.28, y: 0.02, z: 0.04, rotX: 0.02, rotY: 0.17, rotZ: 0, scale: 0.66 },
    center: { x: 1.02, y: -0.2, z: -0.04, rotX: 0.03, rotY: -0.06, rotZ: 0, scale: 0.58 },
  },
  tablet: {
    left: { x: 0.82, y: 0.01, z: 0.02, rotX: 0.01, rotY: -0.13, rotZ: 0, scale: 0.62 },
    right: { x: -0.82, y: 0.01, z: 0.02, rotX: 0.01, rotY: 0.14, rotZ: 0, scale: 0.62 },
    center: { x: 0.68, y: -0.12, z: -0.02, rotX: 0.02, rotY: -0.05, rotZ: 0, scale: 0.56 },
  },
  mobile: {
    left: { x: 0.72, y: 0, z: 0.02, rotX: 0, rotY: -0.12, rotZ: 0, scale: 0.6 },
    right: { x: -0.72, y: 0, z: 0.02, rotX: 0, rotY: 0.12, rotZ: 0, scale: 0.6 },
    center: { x: 0.58, y: -0.08, z: 0, rotX: 0.01, rotY: -0.04, rotZ: 0, scale: 0.54 },
  },
}

const narrativeTweak: Record<MacbookNarrativeKey, NarrativeTweak> = {
  hero: { y: 0.04, z: 0.02, rotX: -0.01, scale: 1.04 },
  process: { y: -0.06, z: 0, rotX: 0.02, scale: 0.98 },
  projects: { y: 0.06, z: 0.06, rotX: 0, scale: 1.02 },
  skills: { y: -0.1, z: -0.02, rotX: 0.03, scale: 0.94 },
  experience: { y: 0.03, z: 0, rotX: 0, scale: 0.96 },
  about: { y: -0.14, z: 0.04, rotX: 0.03, scale: 0.95 },
  contact: { y: -0.1, z: -0.04, rotX: 0.02, scale: 0.9 },
}

export function chapterToNarrative(key: JourneyChapterKey): MacbookNarrativeKey {
  if (key === 'hero' || key === 'process') return key
  if (key.startsWith('project-')) return 'projects'
  if (key === 'skills') return 'skills'
  if (key.startsWith('experience-')) return 'experience'
  if (key === 'about') return 'about'
  if (key === 'contact') return 'contact'
  return 'hero'
}

export function getPoseForAlign(
  align: ContentAlign,
  tier: ViewportTier,
  narrative: MacbookNarrativeKey,
): MacbookJourneyPose {
  const side = sideByContentAlign[tier][align]
  const tweak = narrativeTweak[narrative]
  return {
    offset: {
      x: side.x,
      y: side.y + tweak.y,
      z: side.z + tweak.z,
    },
    rotation: {
      x: side.rotX + tweak.rotX,
      y: side.rotY,
      z: side.rotZ,
    },
    scaleMul: side.scale * tweak.scale,
  }
}

/** @deprecated kept for mobile static hero fallback */
export function getMacbookPoses(tier: ViewportTier): Record<MacbookNarrativeKey, MacbookJourneyPose> {
  const hero = getPoseForAlign('left', tier, 'hero')
  return {
    hero,
    process: getPoseForAlign('right', tier, 'process'),
    projects: getPoseForAlign('left', tier, 'projects'),
    skills: getPoseForAlign('left', tier, 'skills'),
    experience: getPoseForAlign('right', tier, 'experience'),
    about: getPoseForAlign('left', tier, 'about'),
    contact: getPoseForAlign('center', tier, 'contact'),
  }
}

export function interpolateMacbookPose(
  a: MacbookJourneyPose,
  b: MacbookJourneyPose,
  t: number,
): MacbookJourneyPose {
  const s = Math.max(0, Math.min(1, smoothstep(t)))
  const mix = (va: number, vb: number) => va + (vb - va) * s
  return {
    offset: {
      x: mix(a.offset.x, b.offset.x),
      y: mix(a.offset.y, b.offset.y),
      z: mix(a.offset.z, b.offset.z),
    },
    rotation: {
      x: mix(a.rotation.x, b.rotation.x),
      y: mix(a.rotation.y, b.rotation.y),
      z: mix(a.rotation.z, b.rotation.z),
    },
    scaleMul: mix(a.scaleMul, b.scaleMul),
  }
}

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t)
}
