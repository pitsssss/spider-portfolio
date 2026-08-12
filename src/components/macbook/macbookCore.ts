import * as THREE from 'three'

export const MACBOOK_TARGET_CENTER = new THREE.Vector3(2.8, 0.3, 0)
export const MACBOOK_CAMERA_LOOK_AT = new THREE.Vector3(2.5, 1.2, 0)
export const MACBOOK_CAMERA_POSITION = new THREE.Vector3(12, 7, 18)

export function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export type ViewportTier = 'desktop' | 'tablet' | 'mobile'

export function getViewportTier(): ViewportTier {
  const w = window.innerWidth
  if (w < 768) return 'mobile'
  if (w < 1100) return 'tablet'
  return 'desktop'
}

export function disposeObject(root: THREE.Object3D): void {
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return
    object.geometry.dispose()
    const materials = Array.isArray(object.material) ? object.material : [object.material]
    for (const material of materials) {
      for (const value of Object.values(material)) {
        if (value instanceof THREE.Texture) value.dispose()
      }
      material.dispose()
    }
  })
}

export function isFiniteBox3(box: THREE.Box3): boolean {
  return (
    Number.isFinite(box.min.x) &&
    Number.isFinite(box.min.y) &&
    Number.isFinite(box.min.z) &&
    Number.isFinite(box.max.x) &&
    Number.isFinite(box.max.y) &&
    Number.isFinite(box.max.z)
  )
}

export function tuneMacbookMaterials(root: THREE.Object3D, env: THREE.Texture | null): void {
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return
    const materials = Array.isArray(object.material) ? object.material : [object.material]
    for (const mat of materials) {
      if (!(mat instanceof THREE.MeshStandardMaterial)) continue
      if (env) mat.envMap = env
      mat.envMapIntensity = mat.name === 'aluminium' ? 1.35 : mat.name === 'blackmatte' ? 0.85 : 0.65
      if (mat.name === 'aluminium') {
        mat.metalness = 0.92
        mat.roughness = 0.22
      } else if (mat.name === 'blackmatte') {
        mat.metalness = 0.35
        mat.roughness = 0.38
      } else if (mat.name === 'matte') {
        mat.metalness = 0.08
        mat.roughness = 0.42
      }
      mat.needsUpdate = true
    }
  })
}

export function placePresentationGroup(
  presentationGroup: THREE.Group,
  model: THREE.Object3D,
  scaleFactor = 1,
) {
  model.updateMatrixWorld(true)
  const box = new THREE.Box3().setFromObject(model)

  if (!isFiniteBox3(box)) {
    presentationGroup.scale.setScalar(0.11)
    presentationGroup.position.copy(MACBOOK_TARGET_CENTER)
    return { scale: 0.11, size: new THREE.Vector3(), center: new THREE.Vector3(), box }
  }

  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.y, size.z)

  let scale = 0.11
  if (maxDim > 0 && Number.isFinite(maxDim)) {
    scale = (10 / maxDim) * scaleFactor
  }
  if (!Number.isFinite(scale) || scale <= 0) {
    scale = 0.11
  }

  presentationGroup.scale.setScalar(scale)
  presentationGroup.position.set(
    MACBOOK_TARGET_CENTER.x - center.x * scale,
    MACBOOK_TARGET_CENTER.y - center.y * scale,
    MACBOOK_TARGET_CENTER.z - center.z * scale,
  )
  presentationGroup.visible = true
  model.visible = true
  presentationGroup.updateMatrixWorld(true)

  return { scale, size, center, box }
}

export function placeShadowFloor(floor: THREE.Mesh, model: THREE.Object3D) {
  model.updateMatrixWorld(true)
  const worldBox = new THREE.Box3().setFromObject(model)
  if (!isFiniteBox3(worldBox)) return

  const footprint = Math.max(worldBox.max.x - worldBox.min.x, worldBox.max.z - worldBox.min.z, 0.4)
  floor.position.set(
    (worldBox.min.x + worldBox.max.x) * 0.5,
    worldBox.min.y + 0.001,
    (worldBox.min.z + worldBox.max.z) * 0.5,
  )
  floor.scale.setScalar(Math.max(footprint * 0.55, 0.35))
  floor.visible = true
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function damp(current: number, target: number, lambda: number, dt: number): number {
  return lerp(current, target, 1 - Math.exp(-lambda * dt))
}

export function dampVec3(
  current: THREE.Vector3,
  target: THREE.Vector3,
  lambda: number,
  dt: number,
  out: THREE.Vector3,
): THREE.Vector3 {
  out.x = damp(current.x, target.x, lambda, dt)
  out.y = damp(current.y, target.y, lambda, dt)
  out.z = damp(current.z, target.z, lambda, dt)
  return out
}

export function dampEuler(
  current: THREE.Euler,
  target: THREE.Euler,
  lambda: number,
  dt: number,
  out: THREE.Euler,
): THREE.Euler {
  out.x = damp(current.x, target.x, lambda, dt)
  out.y = damp(current.y, target.y, lambda, dt)
  out.z = damp(current.z, target.z, lambda, dt)
  return out
}
