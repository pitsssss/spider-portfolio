import * as THREE from 'three'
import type { ViewportTier } from './weaverCore'
import { smoothstep } from './weaverCore'

export const INTRO_NODES = [
  'CharacterRoot',
  'BodyRig',
  'AbdomenRig',
  'SpinnerRig',
  'Leg_L1_Hip',
  'Leg_L1_Knee',
  'Leg_L1_Ankle',
  'Leg_L2_Hip',
  'Leg_L2_Knee',
  'Leg_L2_Ankle',
  'Leg_L3_Hip',
  'Leg_L3_Knee',
  'Leg_L3_Ankle',
  'Leg_L4_Hip',
  'Leg_L4_Knee',
  'Leg_L4_Ankle',
  'Leg_R1_Hip',
  'Leg_R1_Knee',
  'Leg_R1_Ankle',
  'Leg_R2_Hip',
  'Leg_R2_Knee',
  'Leg_R2_Ankle',
  'Leg_R3_Hip',
  'Leg_R3_Knee',
  'Leg_R3_Ankle',
  'Leg_R4_Hip',
  'Leg_R4_Knee',
  'Leg_R4_Ankle',
] as const

type IntroNodeName = (typeof INTRO_NODES)[number]

type NodeCache = {
  object: THREE.Object3D
  position: THREE.Vector3
  quaternion: THREE.Quaternion
}

export type HeroScreenBounds = {
  modelLeft: number
  modelRight: number
  modelTop: number
  modelBottom: number
  copyRightMax: number
  minGapPx: number
}

export type IntroSnapshot = {
  phase: 'establish' | 'descend' | 'settle' | 'web' | 'reveal' | 'blend'
  spinnerScreen: { x: number; y: number } | null
  webProgress: number
  threadTension: number
}

type LegKey = `${'L' | 'R'}${1 | 2 | 3 | 4}`

const LEG_ORDER: LegKey[] = ['L1', 'R1', 'L4', 'R4', 'L2', 'R3', 'R2', 'L3']

const FOLD: Record<LegKey, { hip: THREE.Euler; knee: THREE.Euler; ankle: THREE.Euler }> = {
  L1: {
    hip: new THREE.Euler(0.55, 0.22, -0.38),
    knee: new THREE.Euler(-1.05, 0.08, 0),
    ankle: new THREE.Euler(0.72, -0.05, 0.12),
  },
  R1: {
    hip: new THREE.Euler(0.48, -0.18, 0.34),
    knee: new THREE.Euler(-0.98, -0.06, 0),
    ankle: new THREE.Euler(0.65, 0.08, -0.1),
  },
  L2: {
    hip: new THREE.Euler(0.42, 0.14, -0.28),
    knee: new THREE.Euler(-0.88, 0.05, 0),
    ankle: new THREE.Euler(0.58, -0.04, 0.08),
  },
  R2: {
    hip: new THREE.Euler(0.38, -0.12, 0.26),
    knee: new THREE.Euler(-0.82, -0.04, 0),
    ankle: new THREE.Euler(0.52, 0.06, -0.08),
  },
  L3: {
    hip: new THREE.Euler(0.35, 0.1, -0.22),
    knee: new THREE.Euler(-0.78, 0.04, 0),
    ankle: new THREE.Euler(0.48, -0.03, 0.06),
  },
  R3: {
    hip: new THREE.Euler(0.32, -0.08, 0.2),
    knee: new THREE.Euler(-0.74, -0.03, 0),
    ankle: new THREE.Euler(0.44, 0.05, -0.06),
  },
  L4: {
    hip: new THREE.Euler(0.62, 0.16, -0.42),
    knee: new THREE.Euler(-1.12, 0.06, 0),
    ankle: new THREE.Euler(0.78, -0.06, 0.14),
  },
  R4: {
    hip: new THREE.Euler(0.58, -0.14, 0.36),
    knee: new THREE.Euler(-1.08, -0.05, 0),
    ankle: new THREE.Euler(0.74, 0.07, -0.12),
  },
}

export function getHeroScreenBounds(tier: ViewportTier, width: number): HeroScreenBounds {
  if (tier === 'mobile') {
    return {
      modelLeft: width * 0.48,
      modelRight: width * 0.96,
      modelTop: window.innerHeight * 0.08,
      modelBottom: window.innerHeight * 0.42,
      copyRightMax: width * 0.92,
      minGapPx: 24,
    }
  }
  if (tier === 'tablet') {
    return {
      modelLeft: width * 0.52,
      modelRight: width * 0.92,
      modelTop: window.innerHeight * 0.17,
      modelBottom: window.innerHeight * 0.78,
      copyRightMax: width * 0.5,
      minGapPx: 40,
    }
  }
  return {
    modelLeft: width * 0.51,
    modelRight: width * 0.94,
    modelTop: window.innerHeight * 0.17,
    modelBottom: window.innerHeight * 0.79,
    copyRightMax: width * 0.46,
    minGapPx: 64,
  }
}

export function tuneWeaverMaterials(root: THREE.Object3D): void {
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return
    const materials = Array.isArray(object.material) ? object.material : [object.material]
    const nextMats = materials.map((mat) => {
      const next = mat.clone()
      if (!(next instanceof THREE.MeshStandardMaterial || next instanceof THREE.MeshPhysicalMaterial)) {
        return next
      }
      next.flatShading = false
      const name = next.name
      if (name === 'BlackCeramicShell') {
        next.color.setRGB(0.22, 0.24, 0.27)
        next.metalness = 0.58
        next.roughness = 0.32
        if (next instanceof THREE.MeshPhysicalMaterial) {
          next.clearcoat = 0.12
          next.clearcoatRoughness = 0.4
        }
      } else if (name === 'CarbonFiberPanels') {
        next.color.setRGB(0.32, 0.34, 0.36)
        next.metalness = 0.42
        next.roughness = 0.38
      } else if (name === 'GunmetalJoints' || name === 'DarkJointCore') {
        next.color.setRGB(0.38, 0.4, 0.43)
        next.metalness = 0.72
        next.roughness = 0.34
      } else if (name === 'AmberSpinner') {
        next.emissive = new THREE.Color(0xf3a63b)
        next.emissiveIntensity = 0.42
      } else if (name === 'CyanOptics' || name.startsWith('PrimaryOptical') || name.startsWith('AuxOptic')) {
        next.emissive = new THREE.Color(0x36cbe8)
        next.emissiveIntensity = 0.22
      }
      return next
    })
    object.material = Array.isArray(object.material) ? nextMats : nextMats[0]
  })
}

export function normalizeModelVisual(modelVisual: THREE.Group, model: THREE.Object3D): THREE.Vector3 {
  modelVisual.clear()
  modelVisual.add(model)
  const box = new THREE.Box3().setFromObject(modelVisual)
  const center = box.getCenter(new THREE.Vector3())
  model.position.sub(center)
  const grounded = new THREE.Box3().setFromObject(modelVisual)
  model.position.y -= grounded.min.y
  return new THREE.Box3().setFromObject(modelVisual).getSize(new THREE.Vector3())
}

export function findNode(root: THREE.Object3D, name: string): THREE.Object3D | null {
  let found: THREE.Object3D | null = null
  root.traverse((obj) => {
    if (obj.name === name) found = obj
  })
  return found
}

export function validateRearFacing(
  head: THREE.Object3D | null,
  spinner: THREE.Object3D | null,
  camera: THREE.Camera,
): boolean {
  if (!head || !spinner) return false
  const hv = new THREE.Vector3()
  const sv = new THREE.Vector3()
  head.getWorldPosition(hv)
  spinner.getWorldPosition(sv)
  hv.project(camera)
  sv.project(camera)
  return Math.abs(sv.x - hv.x) < 0.35 && sv.z <= hv.z
}

const _proj = new THREE.Vector3()

export function projectObjectBounds(
  object: THREE.Object3D,
  camera: THREE.Camera,
  width: number,
  height: number,
): { left: number; right: number; top: number; bottom: number } {
  const box = new THREE.Box3().setFromObject(object)
  const corners = [
    new THREE.Vector3(box.min.x, box.min.y, box.min.z),
    new THREE.Vector3(box.min.x, box.min.y, box.max.z),
    new THREE.Vector3(box.min.x, box.max.y, box.min.z),
    new THREE.Vector3(box.min.x, box.max.y, box.max.z),
    new THREE.Vector3(box.max.x, box.min.y, box.min.z),
    new THREE.Vector3(box.max.x, box.min.y, box.max.z),
    new THREE.Vector3(box.max.x, box.max.y, box.min.z),
    new THREE.Vector3(box.max.x, box.max.y, box.max.z),
  ]
  let left = Infinity
  let right = -Infinity
  let top = Infinity
  let bottom = -Infinity
  for (const corner of corners) {
    _proj.copy(corner).project(camera)
    const sx = (_proj.x * 0.5 + 0.5) * width
    const sy = (-_proj.y * 0.5 + 0.5) * height
    left = Math.min(left, sx)
    right = Math.max(right, sx)
    top = Math.min(top, sy)
    bottom = Math.max(bottom, sy)
  }
  return { left, right, top, bottom }
}

export function fitModelToHeroRegion(
  placementGroup: THREE.Group,
  modelVisual: THREE.Group,
  camera: THREE.Camera,
  bounds: HeroScreenBounds,
  heroYaw: number,
  copyRightPx?: number,
): number {
  placementGroup.rotation.set(0, heroYaw, 0)
  placementGroup.position.set(0, 0, 0)
  modelVisual.scale.setScalar(1)

  let targetLeft = bounds.modelLeft
  if (copyRightPx !== undefined) {
    targetLeft = Math.max(targetLeft, copyRightPx + bounds.minGapPx)
  }
  const targetRight = bounds.modelRight
  const targetTop = bounds.modelTop
  const targetBottom = bounds.modelBottom
  const targetW = targetRight - targetLeft
  const targetH = targetBottom - targetTop
  const targetCx = (targetLeft + targetRight) * 0.5
  const targetCy = (targetTop + targetBottom) * 0.5

  let scale = 1
  for (let i = 0; i < 16; i++) {
    modelVisual.scale.setScalar(scale)
    camera.updateMatrixWorld(true)
    const proj = projectObjectBounds(modelVisual, camera, window.innerWidth, window.innerHeight)
    const pw = Math.max(proj.right - proj.left, 1)
    const ph = Math.max(proj.bottom - proj.top, 1)
    scale *= Math.min(targetW / pw, targetH / ph, 1.05)
  }
  modelVisual.scale.setScalar(scale)

  for (let pass = 0; pass < 6; pass++) {
    camera.updateMatrixWorld(true)
    const proj = projectObjectBounds(modelVisual, camera, window.innerWidth, window.innerHeight)
    const pcx = (proj.left + proj.right) * 0.5
    const pcy = (proj.top + proj.bottom) * 0.5
    placementGroup.position.x += (targetCx - pcx) * 0.0032
    placementGroup.position.y -= (pcy - targetCy) * 0.0032
    if (proj.left < targetLeft) placementGroup.position.x += (targetLeft - proj.left) * 0.0035
    if (proj.right > targetRight) placementGroup.position.x -= (proj.right - targetRight) * 0.0035
    if (proj.top < targetTop) placementGroup.position.y -= (targetTop - proj.top) * 0.0035
    if (proj.bottom > targetBottom) placementGroup.position.y += (proj.bottom - targetBottom) * 0.0035
  }

  return scale
}

export class HeroJointController {
  private cache = new Map<IntroNodeName, NodeCache>()
  private tmpQ = new THREE.Quaternion()
  private blendStart = 0
  private blending = false
  private blendFrom = new Map<IntroNodeName, THREE.Quaternion>()

  constructor(private root: THREE.Object3D) {
    for (const name of INTRO_NODES) {
      const object = findNode(root, name)
      if (!object) continue
      this.cache.set(name, {
        object,
        position: object.position.clone(),
        quaternion: object.quaternion.clone(),
      })
    }
  }

  resetAll(): void {
    for (const { object, position, quaternion } of this.cache.values()) {
      object.position.copy(position)
      object.quaternion.copy(quaternion)
      object.scale.setScalar(1)
    }
  }

  beginFrame(): void {
    if (this.blending) return
    this.resetAll()
  }

  startBlendOut(): void {
    this.blending = true
    this.blendStart = performance.now()
    this.blendFrom.clear()
    for (const [name, { object, quaternion }] of this.cache) {
      this.blendFrom.set(name, object.quaternion.clone())
      object.quaternion.copy(quaternion)
    }
  }

  updateBlendOut(durationMs: number): boolean {
    if (!this.blending) return true
    const t = Math.min(1, (performance.now() - this.blendStart) / durationMs)
    const e = smoothstep(t)
    for (const [name, { object, quaternion, position }] of this.cache) {
      const from = this.blendFrom.get(name)
      if (from) object.quaternion.slerpQuaternions(from, quaternion, e)
      object.position.lerp(position, e)
      object.scale.setScalar(1)
    }
    if (t >= 1) {
      this.resetAll()
      this.blending = false
      return true
    }
    return false
  }

  applyFold(amount: number): void {
    for (const leg of LEG_ORDER) {
      this.applyLeg(leg, amount, 0)
    }
    const body = this.cache.get('BodyRig')
    const abdomen = this.cache.get('AbdomenRig')
    if (body) {
      this.applyOffset(body, new THREE.Euler(0.06 * amount, 0, 0.02 * amount))
    }
    if (abdomen) {
      this.applyOffset(abdomen, new THREE.Euler(-0.04 * amount, 0, 0))
    }
  }

  applyDescent(
    legUnfold: number,
    bodyLag: number,
    sway: { roll: number; yaw: number },
  ): void {
    this.applyFold(Math.max(0, 1 - legUnfold))
    for (let i = 0; i < LEG_ORDER.length; i++) {
      const leg = LEG_ORDER[i]
      const stagger = Math.max(0, Math.min(1, (legUnfold - i * 0.09) / 0.28))
      this.applyLeg(leg, 1 - stagger, stagger * 0.12)
    }

    const body = this.cache.get('BodyRig')
    const bodyBase = this.cache.get('BodyRig')
    const abdomen = this.cache.get('AbdomenRig')
    if (body && bodyBase) {
      this.applyOffset(body, new THREE.Euler(0.04 * bodyLag, sway.yaw * 0.4, sway.roll * 0.5))
      body.position.y = bodyBase.position.y - bodyLag * 0.04
    }
    if (abdomen) {
      this.applyOffset(abdomen, new THREE.Euler(-0.03 * bodyLag, sway.yaw * 0.25, 0))
    }
    const spinner = this.cache.get('SpinnerRig')
    if (spinner) {
      this.applyOffset(spinner, new THREE.Euler(0, sway.yaw * 0.15, sway.roll * 0.2))
    }
  }

  applySettle(t: number, rebound: number): void {
    this.applyDescent(1, 0.25 * (1 - t), { roll: 0, yaw: 0 })
    for (const leg of LEG_ORDER) {
      this.applyLeg(leg, 0, rebound * 0.08)
    }
    const body = this.cache.get('BodyRig')
    const abdomen = this.cache.get('AbdomenRig')
    if (body) {
      this.applyOffset(body, new THREE.Euler(rebound * 0.06, 0, 0))
    }
    if (abdomen) {
      this.applyOffset(abdomen, new THREE.Euler(-rebound * 0.04, 0, 0))
    }
  }

  applyWebShot(progress: number, tension: number): void {
    const p = smoothstep(progress)
    const body = this.cache.get('BodyRig')
    const abdomen = this.cache.get('AbdomenRig')
    const spinner = this.cache.get('SpinnerRig')
    if (body) {
      this.applyOffset(body, new THREE.Euler(-0.05 * p, -0.04 * p, 0.02 * tension))
    }
    if (abdomen) {
      this.applyOffset(abdomen, new THREE.Euler(0.04 * p, 0.03 * p, 0))
    }
    if (spinner) {
      this.applyOffset(spinner, new THREE.Euler(0.08 * p, -0.06 * p, 0.04 * tension))
    }
    const counter = (side: 'L' | 'R', sign: number) => {
      for (let i = 1; i <= 4; i++) {
        const hip = this.cache.get(`Leg_${side}${i}_Hip` as IntroNodeName)
        if (hip) this.applyOffset(hip, new THREE.Euler(0, sign * 0.03 * p, sign * 0.02 * tension))
      }
    }
    counter('L', 1)
    counter('R', -1)
  }

  setSpinnerPulse(intensity: number): void {
    const spinner = this.cache.get('SpinnerRig')
    if (!spinner) return
    spinner.object.scale.setScalar(1 + intensity * 0.04)
  }

  private applyLeg(leg: LegKey, foldAmount: number, overshoot: number): void {
    const spec = FOLD[leg]
    const side = leg[0]
    const idx = leg[1]
    const hip = this.cache.get(`Leg_${side}${idx}_Hip` as IntroNodeName)
    const knee = this.cache.get(`Leg_${side}${idx}_Knee` as IntroNodeName)
    const ankle = this.cache.get(`Leg_${side}${idx}_Ankle` as IntroNodeName)
    const f = Math.max(0, Math.min(1, foldAmount))
    const o = overshoot
    if (hip) this.applyOffset(hip, new THREE.Euler(
      spec.hip.x * f,
      spec.hip.y * f,
      spec.hip.z * f + o * (side === 'L' ? 1 : -1),
    ))
    if (knee) this.applyOffset(knee, new THREE.Euler(spec.knee.x * f + o * 0.15, spec.knee.y * f, 0))
    if (ankle) this.applyOffset(ankle, new THREE.Euler(spec.ankle.x * f - o * 0.1, spec.ankle.y * f, spec.ankle.z * f))
  }

  private applyOffset(entry: NodeCache, euler: THREE.Euler): void {
    this.tmpQ.setFromEuler(euler)
    entry.object.quaternion.copy(entry.quaternion).multiply(this.tmpQ)
  }
}

export type IntroTimings = {
  establish: number
  descendEnd: number
  settleEnd: number
  webEnd: number
  revealEnd: number
  total: number
}

export function getIntroTimings(tier: ViewportTier): IntroTimings {
  if (tier === 'mobile') {
    return { establish: 0.45, descendEnd: 2.0, settleEnd: 2.55, webEnd: 3.2, revealEnd: 3.85, total: 4.2 }
  }
  return { establish: 0.55, descendEnd: 2.35, settleEnd: 3.15, webEnd: 4.25, revealEnd: 5.2, total: 5.8 }
}

export function computeIntroSnapshot(t: number, timings: IntroTimings): IntroSnapshot {
  if (t < timings.establish) {
    return { phase: 'establish', spinnerScreen: null, webProgress: 0, threadTension: 0 }
  }
  if (t < timings.descendEnd) {
    return { phase: 'descend', spinnerScreen: null, webProgress: 0, threadTension: 0 }
  }
  if (t < timings.settleEnd) {
    return { phase: 'settle', spinnerScreen: null, webProgress: 0, threadTension: 0 }
  }
  if (t < timings.webEnd) {
    const u = (t - timings.settleEnd) / (timings.webEnd - timings.settleEnd)
    return { phase: 'web', spinnerScreen: null, webProgress: smoothstep(u), threadTension: u > 0.88 ? (u - 0.88) / 0.12 : 0 }
  }
  if (t < timings.revealEnd) {
    return { phase: 'reveal', spinnerScreen: null, webProgress: 1, threadTension: 1 - (t - timings.webEnd) / (timings.revealEnd - timings.webEnd) }
  }
  return { phase: 'blend', spinnerScreen: null, webProgress: 1, threadTension: 0 }
}

export function projectWorldToScreen(
  object: THREE.Object3D,
  camera: THREE.Camera,
  width: number,
  height: number,
): { x: number; y: number } {
  const v = new THREE.Vector3()
  object.getWorldPosition(v)
  v.project(camera)
  return {
    x: (v.x * 0.5 + 0.5) * width,
    y: (-v.y * 0.5 + 0.5) * height,
  }
}
