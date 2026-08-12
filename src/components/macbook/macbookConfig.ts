export const MACBOOK_MODEL_URL = '/models/macbook/macbook-pro-realistic-animated.glb'

export const MACBOOK_CLIPS = ['Open', 'Close', 'HeroLoop'] as const

export type MacbookClip = (typeof MACBOOK_CLIPS)[number]

export const MACBOOK_CROSSFADE = 0.38

export const MACBOOK_LOOPING = new Set<MacbookClip>(['HeroLoop'])

export const MACBOOK_MAX_DPR = 1.5

export const MACBOOK_DRACO_PATH = '/draco/'
