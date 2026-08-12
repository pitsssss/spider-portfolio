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
  lights: { cyan: number; amber: number }
  entryClip?: WeaverClip
}

const desktop: Record<JourneyChapterKey, ChapterPose> = {
  hero: {
    model: { position: { x: 1.55, y: 0.05, z: 0.1 }, rotation: { x: 0, y: -0.55, z: 0 }, scale: 1 },
    camera: { position: { x: 0.15, y: 0.45, z: 5.8 }, lookAt: { x: 0.9, y: 0.35, z: 0 } },
    lights: { cyan: 2.2, amber: 0.55 },
    entryClip: 'Descend',
  },
  process: {
    model: { position: { x: 1.1, y: 0.15, z: 0.35 }, rotation: { x: 0, y: -0.35, z: 0 }, scale: 0.98 },
    camera: { position: { x: 0.35, y: 0.35, z: 6.1 }, lookAt: { x: 0.5, y: 0.25, z: 0 } },
    lights: { cyan: 2.4, amber: 0.65 },
    entryClip: 'Crawl',
  },
  'project-0': {
    model: { position: { x: 1.45, y: 0.1, z: 0.15 }, rotation: { x: 0, y: -0.7, z: 0 }, scale: 0.96 },
    camera: { position: { x: 0.2, y: 0.3, z: 5.9 }, lookAt: { x: 0.85, y: 0.28, z: 0 } },
    lights: { cyan: 2.5, amber: 0.7 },
    entryClip: 'WebPulse',
  },
  'project-1': {
    model: { position: { x: -1.35, y: 0.12, z: 0.2 }, rotation: { x: 0, y: 0.65, z: 0 }, scale: 0.96 },
    camera: { position: { x: -0.15, y: 0.32, z: 5.9 }, lookAt: { x: -0.75, y: 0.28, z: 0 } },
    lights: { cyan: 2.5, amber: 0.68 },
    entryClip: 'WebPulse',
  },
  'project-2': {
    model: { position: { x: 1.4, y: 0.08, z: 0.18 }, rotation: { x: 0, y: -0.68, z: 0 }, scale: 0.95 },
    camera: { position: { x: 0.18, y: 0.28, z: 5.85 }, lookAt: { x: 0.8, y: 0.26, z: 0 } },
    lights: { cyan: 2.45, amber: 0.66 },
    entryClip: 'WebPulse',
  },
  'project-3': {
    model: { position: { x: -1.3, y: 0.1, z: 0.22 }, rotation: { x: 0, y: 0.62, z: 0 }, scale: 0.95 },
    camera: { position: { x: -0.12, y: 0.3, z: 5.85 }, lookAt: { x: -0.72, y: 0.26, z: 0 } },
    lights: { cyan: 2.45, amber: 0.66 },
    entryClip: 'WebPulse',
  },
  skills: {
    model: { position: { x: 0.95, y: 0.22, z: -0.15 }, rotation: { x: 0.08, y: -0.45, z: 0 }, scale: 0.92 },
    camera: { position: { x: 0.05, y: 0.42, z: 6.4 }, lookAt: { x: 0.45, y: 0.32, z: 0 } },
    lights: { cyan: 2.1, amber: 0.5 },
    entryClip: 'Idle',
  },
  'experience-0': {
    model: { position: { x: 1.05, y: 0.35, z: 0.1 }, rotation: { x: 0, y: -0.4, z: 0 }, scale: 0.9 },
    camera: { position: { x: 0.25, y: 0.48, z: 6.2 }, lookAt: { x: 0.65, y: 0.38, z: 0 } },
    lights: { cyan: 2.15, amber: 0.52 },
    entryClip: 'Crawl',
  },
  'experience-1': {
    model: { position: { x: 0.85, y: 0.15, z: 0.12 }, rotation: { x: 0, y: -0.38, z: 0 }, scale: 0.9 },
    camera: { position: { x: 0.2, y: 0.35, z: 6.15 }, lookAt: { x: 0.55, y: 0.28, z: 0 } },
    lights: { cyan: 2.1, amber: 0.5 },
    entryClip: 'Crawl',
  },
  'experience-2': {
    model: { position: { x: 0.7, y: -0.05, z: 0.15 }, rotation: { x: 0, y: -0.32, z: 0 }, scale: 0.88 },
    camera: { position: { x: 0.15, y: 0.25, z: 6.1 }, lookAt: { x: 0.45, y: 0.18, z: 0 } },
    lights: { cyan: 2.05, amber: 0.48 },
    entryClip: 'Crawl',
  },
  about: {
    model: { position: { x: 1.25, y: 0.02, z: 0.25 }, rotation: { x: 0, y: -0.52, z: 0 }, scale: 0.86 },
    camera: { position: { x: 0.3, y: 0.22, z: 6.3 }, lookAt: { x: 0.75, y: 0.15, z: 0 } },
    lights: { cyan: 1.5, amber: 0.35 },
    entryClip: 'Idle',
  },
  contact: {
    model: { position: { x: 0.55, y: 0.08, z: 0.05 }, rotation: { x: 0, y: -0.25, z: 0 }, scale: 0.88 },
    camera: { position: { x: 0, y: 0.18, z: 5.5 }, lookAt: { x: 0.35, y: 0.12, z: 0 } },
    lights: { cyan: 2.8, amber: 0.85 },
    entryClip: 'WebPulse',
  },
}

const mobile: Record<JourneyChapterKey, ChapterPose> = {
  hero: {
    model: { position: { x: 0.85, y: -0.35, z: 0.05 }, rotation: { x: 0, y: -0.45, z: 0 }, scale: 0.62 },
    camera: { position: { x: 0, y: 0.05, z: 6.8 }, lookAt: { x: 0.55, y: -0.05, z: 0 } },
    lights: { cyan: 1.8, amber: 0.45 },
    entryClip: 'Descend',
  },
  process: {
    model: { position: { x: 0.72, y: -0.28, z: 0.2 }, rotation: { x: 0, y: -0.3, z: 0 }, scale: 0.6 },
    camera: { position: { x: 0.05, y: 0.02, z: 7 }, lookAt: { x: 0.45, y: -0.08, z: 0 } },
    lights: { cyan: 1.9, amber: 0.5 },
    entryClip: 'Crawl',
  },
  'project-0': {
    model: { position: { x: 0.78, y: -0.32, z: 0.12 }, rotation: { x: 0, y: -0.55, z: 0 }, scale: 0.58 },
    camera: { position: { x: 0, y: 0, z: 6.9 }, lookAt: { x: 0.5, y: -0.1, z: 0 } },
    lights: { cyan: 2, amber: 0.55 },
    entryClip: 'WebPulse',
  },
  'project-1': {
    model: { position: { x: 0.75, y: -0.3, z: 0.15 }, rotation: { x: 0, y: -0.5, z: 0 }, scale: 0.58 },
    camera: { position: { x: 0, y: 0.02, z: 6.9 }, lookAt: { x: 0.48, y: -0.08, z: 0 } },
    lights: { cyan: 2, amber: 0.55 },
    entryClip: 'WebPulse',
  },
  'project-2': {
    model: { position: { x: 0.76, y: -0.31, z: 0.14 }, rotation: { x: 0, y: -0.52, z: 0 }, scale: 0.57 },
    camera: { position: { x: 0, y: 0.01, z: 6.9 }, lookAt: { x: 0.49, y: -0.09, z: 0 } },
    lights: { cyan: 1.95, amber: 0.52 },
    entryClip: 'WebPulse',
  },
  'project-3': {
    model: { position: { x: 0.74, y: -0.29, z: 0.16 }, rotation: { x: 0, y: -0.48, z: 0 }, scale: 0.57 },
    camera: { position: { x: 0, y: 0.02, z: 6.9 }, lookAt: { x: 0.47, y: -0.08, z: 0 } },
    lights: { cyan: 1.95, amber: 0.52 },
    entryClip: 'WebPulse',
  },
  skills: {
    model: { position: { x: 0.68, y: -0.25, z: -0.05 }, rotation: { x: 0.05, y: -0.35, z: 0 }, scale: 0.55 },
    camera: { position: { x: 0, y: 0.08, z: 7.2 }, lookAt: { x: 0.4, y: -0.02, z: 0 } },
    lights: { cyan: 1.7, amber: 0.4 },
    entryClip: 'Idle',
  },
  'experience-0': {
    model: { position: { x: 0.7, y: -0.18, z: 0.08 }, rotation: { x: 0, y: -0.32, z: 0 }, scale: 0.54 },
    camera: { position: { x: 0.05, y: 0.12, z: 7.1 }, lookAt: { x: 0.42, y: 0.02, z: 0 } },
    lights: { cyan: 1.75, amber: 0.42 },
    entryClip: 'Crawl',
  },
  'experience-1': {
    model: { position: { x: 0.66, y: -0.22, z: 0.1 }, rotation: { x: 0, y: -0.3, z: 0 }, scale: 0.54 },
    camera: { position: { x: 0.04, y: 0.08, z: 7.1 }, lookAt: { x: 0.4, y: -0.02, z: 0 } },
    lights: { cyan: 1.7, amber: 0.4 },
    entryClip: 'Crawl',
  },
  'experience-2': {
    model: { position: { x: 0.62, y: -0.26, z: 0.12 }, rotation: { x: 0, y: -0.28, z: 0 }, scale: 0.52 },
    camera: { position: { x: 0.03, y: 0.05, z: 7.1 }, lookAt: { x: 0.38, y: -0.05, z: 0 } },
    lights: { cyan: 1.65, amber: 0.38 },
    entryClip: 'Crawl',
  },
  about: {
    model: { position: { x: 0.72, y: -0.34, z: 0.18 }, rotation: { x: 0, y: -0.42, z: 0 }, scale: 0.52 },
    camera: { position: { x: 0.05, y: -0.02, z: 7 }, lookAt: { x: 0.45, y: -0.12, z: 0 } },
    lights: { cyan: 1.35, amber: 0.3 },
    entryClip: 'Idle',
  },
  contact: {
    model: { position: { x: 0.5, y: -0.2, z: 0.05 }, rotation: { x: 0, y: -0.22, z: 0 }, scale: 0.54 },
    camera: { position: { x: 0, y: 0.05, z: 6.6 }, lookAt: { x: 0.28, y: 0, z: 0 } },
    lights: { cyan: 2.2, amber: 0.65 },
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
            lights: d.lights,
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
      cyan: lerp(a.lights.cyan, b.lights.cyan, s),
      amber: lerp(a.lights.amber, b.lights.amber, s),
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

export function resolveHeroClip(local: number, played: Set<string>): WeaverClip {
  if (!played.has('hero-descend')) return 'Descend'
  if (!played.has('hero-land') && local >= 0.35) return 'Land'
  return 'Idle'
}

export function resolveProjectClip(local: number, played: Set<string>, key: string): WeaverClip {
  if (local > 0.15 && !played.has(`${key}-pulse`)) return 'WebPulse'
  if (local >= 0.42 && !played.has(`${key}-inspect`)) return 'Inspect'
  return 'Idle'
}
