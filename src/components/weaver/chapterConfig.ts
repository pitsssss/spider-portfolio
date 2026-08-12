import type { WeaverClip } from './weaverConfig'
import type { ViewportTier } from './weaverCore'

export type JourneyChapterKey =
  | 'hero'
  | 'process'
  | 'project-0'
  | 'project-1'
  | 'project-2'
  | 'project-3'
  | 'skills'
  | 'experience-0'
  | 'experience-1'
  | 'experience-2'
  | 'about'
  | 'contact'

export const JOURNEY_CHAPTER_ORDER: JourneyChapterKey[] = [
  'hero',
  'process',
  'project-0',
  'project-1',
  'project-2',
  'project-3',
  'skills',
  'experience-0',
  'experience-1',
  'experience-2',
  'about',
  'contact',
]

export type Vec3 = { x: number; y: number; z: number }

export type ChapterPose = {
  model: { position: Vec3; rotation: Vec3; scale: number }
  camera: { position: Vec3; lookAt: Vec3 }
  lights: { key: number; rim: number; fill: number }
  entryClip?: WeaverClip
}

/** Rear spinner toward +Z camera: yaw near 0 (HeadRig at -Z behind spinner). */
export const HERO_YAW = 0.05

const desktop: Record<JourneyChapterKey, ChapterPose> = {
  hero: {
    model: { position: { x: 0.55, y: 0.08, z: 0 }, rotation: { x: 0.02, y: 0, z: 0 }, scale: 1 },
    camera: { position: { x: 0, y: 0.42, z: 5.6 }, lookAt: { x: 0.55, y: 0.38, z: 0 } },
    lights: { key: 2.2, rim: 0.85, fill: 0.6 },
  },
  process: {
    model: { position: { x: 1.2, y: 0.2, z: 0.2 }, rotation: { x: 0.02, y: HERO_YAW + 0.2, z: 0 }, scale: 1 },
    camera: { position: { x: 0.25, y: 0.4, z: 5.8 }, lookAt: { x: 0.7, y: 0.35, z: 0 } },
    lights: { key: 2.2, rim: 0.8, fill: 0.5 },
    entryClip: 'Crawl',
  },
  'project-0': {
    model: { position: { x: 1.4, y: 0.12, z: 0.1 }, rotation: { x: 0, y: HERO_YAW - 0.15, z: 0 }, scale: 0.98 },
    camera: { position: { x: 0.15, y: 0.35, z: 5.6 }, lookAt: { x: 0.85, y: 0.3, z: 0 } },
    lights: { key: 2.3, rim: 0.85, fill: 0.5 },
    entryClip: 'WebPulse',
  },
  'project-1': {
    model: { position: { x: -1.25, y: 0.14, z: 0.15 }, rotation: { x: 0, y: Math.PI + HERO_YAW, z: 0 }, scale: 0.98 },
    camera: { position: { x: -0.1, y: 0.35, z: 5.6 }, lookAt: { x: -0.7, y: 0.3, z: 0 } },
    lights: { key: 2.3, rim: 0.85, fill: 0.5 },
    entryClip: 'Inspect',
  },
  'project-2': {
    model: { position: { x: 1.35, y: 0.1, z: 0.12 }, rotation: { x: 0, y: HERO_YAW - 0.1, z: 0 }, scale: 0.96 },
    camera: { position: { x: 0.12, y: 0.32, z: 5.55 }, lookAt: { x: 0.8, y: 0.28, z: 0 } },
    lights: { key: 2.25, rim: 0.8, fill: 0.48 },
    entryClip: 'WebPulse',
  },
  'project-3': {
    model: { position: { x: -1.2, y: 0.12, z: 0.14 }, rotation: { x: 0, y: Math.PI + HERO_YAW, z: 0 }, scale: 0.96 },
    camera: { position: { x: -0.08, y: 0.32, z: 5.55 }, lookAt: { x: -0.68, y: 0.28, z: 0 } },
    lights: { key: 2.25, rim: 0.8, fill: 0.48 },
    entryClip: 'Inspect',
  },
  skills: {
    model: { position: { x: 1.05, y: 0.18, z: -0.05 }, rotation: { x: 0.04, y: HERO_YAW + 0.1, z: 0 }, scale: 0.9 },
    camera: { position: { x: 0.05, y: 0.4, z: 6.1 }, lookAt: { x: 0.55, y: 0.32, z: 0 } },
    lights: { key: 2.0, rim: 0.7, fill: 0.45 },
    entryClip: 'Idle',
  },
  'experience-0': {
    model: { position: { x: 1.1, y: 0.3, z: 0.08 }, rotation: { x: 0, y: HERO_YAW, z: 0 }, scale: 0.88 },
    camera: { position: { x: 0.2, y: 0.45, z: 5.9 }, lookAt: { x: 0.65, y: 0.38, z: 0 } },
    lights: { key: 2.05, rim: 0.72, fill: 0.45 },
    entryClip: 'Crawl',
  },
  'experience-1': {
    model: { position: { x: 0.95, y: 0.12, z: 0.1 }, rotation: { x: 0, y: HERO_YAW, z: 0 }, scale: 0.88 },
    camera: { position: { x: 0.15, y: 0.35, z: 5.85 }, lookAt: { x: 0.55, y: 0.28, z: 0 } },
    lights: { key: 2.0, rim: 0.7, fill: 0.42 },
    entryClip: 'Idle',
  },
  'experience-2': {
    model: { position: { x: 0.85, y: -0.02, z: 0.12 }, rotation: { x: 0, y: HERO_YAW, z: 0 }, scale: 0.86 },
    camera: { position: { x: 0.12, y: 0.28, z: 5.8 }, lookAt: { x: 0.5, y: 0.2, z: 0 } },
    lights: { key: 1.95, rim: 0.68, fill: 0.4 },
    entryClip: 'Crawl',
  },
  about: {
    model: { position: { x: 1.3, y: 0.05, z: 0.2 }, rotation: { x: 0, y: HERO_YAW - 0.05, z: 0 }, scale: 0.82 },
    camera: { position: { x: 0.25, y: 0.25, z: 6 }, lookAt: { x: 0.75, y: 0.18, z: 0 } },
    lights: { key: 1.6, rim: 0.45, fill: 0.35 },
    entryClip: 'Idle',
  },
  contact: {
    model: { position: { x: 0.7, y: 0.1, z: 0.05 }, rotation: { x: 0, y: HERO_YAW, z: 0 }, scale: 0.9 },
    camera: { position: { x: 0, y: 0.22, z: 5.3 }, lookAt: { x: 0.4, y: 0.15, z: 0 } },
    lights: { key: 2.5, rim: 1.0, fill: 0.6 },
    entryClip: 'WebPulse',
  },
}

const mobile: Record<JourneyChapterKey, ChapterPose> = {
  hero: {
    model: { position: { x: 0.35, y: 0.35, z: 0 }, rotation: { x: 0.04, y: 0, z: 0 }, scale: 1 },
    camera: { position: { x: 0, y: 0.2, z: 6.2 }, lookAt: { x: 0.35, y: 0.32, z: 0 } },
    lights: { key: 2.0, rim: 0.75, fill: 0.55 },
  },
  process: {
    model: { position: { x: 0.65, y: -0.15, z: 0.1 }, rotation: { x: 0, y: HERO_YAW + 0.15, z: 0 }, scale: 0.58 },
    camera: { position: { x: 0, y: 0.05, z: 6.8 }, lookAt: { x: 0.4, y: 0, z: 0 } },
    lights: { key: 1.9, rim: 0.7, fill: 0.45 },
    entryClip: 'Crawl',
  },
  'project-0': {
    model: { position: { x: 0.68, y: -0.2, z: 0.08 }, rotation: { x: 0, y: HERO_YAW, z: 0 }, scale: 0.55 },
    camera: { position: { x: 0, y: 0.02, z: 6.7 }, lookAt: { x: 0.42, y: -0.05, z: 0 } },
    lights: { key: 2.0, rim: 0.75, fill: 0.45 },
    entryClip: 'WebPulse',
  },
  'project-1': {
    model: { position: { x: 0.66, y: -0.18, z: 0.1 }, rotation: { x: 0, y: HERO_YAW, z: 0 }, scale: 0.55 },
    camera: { position: { x: 0, y: 0.02, z: 6.7 }, lookAt: { x: 0.4, y: -0.04, z: 0 } },
    lights: { key: 2.0, rim: 0.75, fill: 0.45 },
    entryClip: 'Inspect',
  },
  'project-2': {
    model: { position: { x: 0.67, y: -0.19, z: 0.09 }, rotation: { x: 0, y: HERO_YAW, z: 0 }, scale: 0.54 },
    camera: { position: { x: 0, y: 0.02, z: 6.7 }, lookAt: { x: 0.41, y: -0.05, z: 0 } },
    lights: { key: 1.95, rim: 0.72, fill: 0.42 },
    entryClip: 'WebPulse',
  },
  'project-3': {
    model: { position: { x: 0.65, y: -0.17, z: 0.1 }, rotation: { x: 0, y: HERO_YAW, z: 0 }, scale: 0.54 },
    camera: { position: { x: 0, y: 0.02, z: 6.7 }, lookAt: { x: 0.4, y: -0.04, z: 0 } },
    lights: { key: 1.95, rim: 0.72, fill: 0.42 },
    entryClip: 'Inspect',
  },
  skills: {
    model: { position: { x: 0.6, y: -0.12, z: 0 }, rotation: { x: 0.03, y: HERO_YAW, z: 0 }, scale: 0.52 },
    camera: { position: { x: 0, y: 0.08, z: 6.9 }, lookAt: { x: 0.35, y: 0, z: 0 } },
    lights: { key: 1.8, rim: 0.6, fill: 0.4 },
    entryClip: 'Idle',
  },
  'experience-0': {
    model: { position: { x: 0.62, y: -0.05, z: 0.05 }, rotation: { x: 0, y: HERO_YAW, z: 0 }, scale: 0.52 },
    camera: { position: { x: 0.02, y: 0.1, z: 6.85 }, lookAt: { x: 0.38, y: 0.05, z: 0 } },
    lights: { key: 1.85, rim: 0.65, fill: 0.4 },
    entryClip: 'Crawl',
  },
  'experience-1': {
    model: { position: { x: 0.6, y: -0.1, z: 0.06 }, rotation: { x: 0, y: HERO_YAW, z: 0 }, scale: 0.52 },
    camera: { position: { x: 0.02, y: 0.06, z: 6.85 }, lookAt: { x: 0.36, y: 0, z: 0 } },
    lights: { key: 1.8, rim: 0.6, fill: 0.38 },
    entryClip: 'Idle',
  },
  'experience-2': {
    model: { position: { x: 0.58, y: -0.14, z: 0.08 }, rotation: { x: 0, y: HERO_YAW, z: 0 }, scale: 0.5 },
    camera: { position: { x: 0.02, y: 0.04, z: 6.85 }, lookAt: { x: 0.34, y: -0.02, z: 0 } },
    lights: { key: 1.75, rim: 0.58, fill: 0.36 },
    entryClip: 'Crawl',
  },
  about: {
    model: { position: { x: 0.65, y: -0.22, z: 0.12 }, rotation: { x: 0, y: HERO_YAW, z: 0 }, scale: 0.5 },
    camera: { position: { x: 0.02, y: 0, z: 6.8 }, lookAt: { x: 0.4, y: -0.08, z: 0 } },
    lights: { key: 1.5, rim: 0.4, fill: 0.32 },
    entryClip: 'Idle',
  },
  contact: {
    model: { position: { x: 0.45, y: -0.08, z: 0.02 }, rotation: { x: 0, y: HERO_YAW, z: 0 }, scale: 0.52 },
    camera: { position: { x: 0, y: 0.08, z: 6.4 }, lookAt: { x: 0.25, y: 0.02, z: 0 } },
    lights: { key: 2.2, rim: 0.9, fill: 0.55 },
    entryClip: 'WebPulse',
  },
}

export function getChapterPoses(tier: ViewportTier): Record<JourneyChapterKey, ChapterPose> {
  if (tier === 'mobile') return mobile
  if (tier === 'tablet') {
    return Object.fromEntries(
      JOURNEY_CHAPTER_ORDER.map((key) => {
        const d = desktop[key]
        const m = mobile[key]
        return [
          key,
          {
            model: {
              position: {
                x: (d.model.position.x + m.model.position.x) / 2,
                y: (d.model.position.y + m.model.position.y) / 2,
                z: (d.model.position.z + m.model.position.z) / 2,
              },
              rotation: d.model.rotation,
              scale: (d.model.scale + m.model.scale) / 2,
            },
            camera: d.camera,
            lights: {
              key: (d.lights.key + m.lights.key) / 2,
              rim: (d.lights.rim + m.lights.rim) / 2,
              fill: (d.lights.fill + m.lights.fill) / 2,
            },
            entryClip: d.entryClip,
          },
        ]
      }),
    ) as Record<JourneyChapterKey, ChapterPose>
  }
  return desktop
}

export function interpolatePose(a: ChapterPose, b: ChapterPose, t: number): ChapterPose {
  const s = smoothstep(t)
  const mix = (va: Vec3, vb: Vec3): Vec3 => ({
    x: lerp(va.x, vb.x, s),
    y: lerp(va.y, vb.y, s),
    z: lerp(va.z, vb.z, s),
  })
  return {
    model: {
      position: mix(a.model.position, b.model.position),
      rotation: mix(a.model.rotation, b.model.rotation),
      scale: lerp(a.model.scale, b.model.scale, s),
    },
    camera: {
      position: mix(a.camera.position, b.camera.position),
      lookAt: mix(a.camera.lookAt, b.camera.lookAt),
    },
    lights: {
      key: lerp(a.lights.key, b.lights.key, s),
      rim: lerp(a.lights.rim, b.lights.rim, s),
      fill: lerp(a.lights.fill, b.lights.fill, s),
    },
  }
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function smoothstep(t: number): number {
  const x = Math.max(0, Math.min(1, t))
  return x * x * (3 - 2 * x)
}

export function resolveProjectClip(local: number, played: Set<string>, key: string): WeaverClip {
  if (local > 0.2 && !played.has(`${key}-pulse`)) return 'WebPulse'
  if (local >= 0.55 && !played.has(`${key}-inspect`)) return 'Inspect'
  return 'Idle'
}

export const INTRO_SESSION_KEY = 'weaver-intro-seen'
