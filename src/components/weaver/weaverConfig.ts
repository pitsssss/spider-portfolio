export const WEAVER_MODEL_URL = '/models/weaver-01.glb'

export const WEAVER_CLIPS = [
  'Idle',
  'Crawl',
  'Descend',
  'Land',
  'Inspect',
  'WebPulse',
] as const

export type WeaverClip = (typeof WEAVER_CLIPS)[number]

export const WEAVER_LOOPING = new Set<WeaverClip>(['Idle', 'Crawl'])
export const WEAVER_CROSSFADE = 0.3
export const WEAVER_MAX_DPR = 1.5
