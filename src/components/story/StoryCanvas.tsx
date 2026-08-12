'use client'

import { useEffect, useRef, type MutableRefObject } from 'react'
import * as THREE from 'three'
import type { StoryState } from './StoryController'

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

type StoryCanvasProps = {
  stateRef: MutableRefObject<StoryState>
  reducedMotion: boolean
}

export default function StoryCanvas({ stateRef, reducedMotion }: StoryCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (!hasWebGL()) {
      canvas.style.display = 'none'
      return
    }

    const mobile = window.innerWidth < 768
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.25 : 1.75))
    renderer.setClearColor(0x000000, 0)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.02

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 40)
    const geometries: THREE.BufferGeometry[] = []
    const materials: THREE.Material[] = []

    scene.add(new THREE.AmbientLight(0x6b7382, 0.28))
    const cyanLight = new THREE.PointLight(0x78e7ff, 12, 16)
    cyanLight.position.set(2.4, 1.8, 3.4)
    scene.add(cyanLight)
    const amberLight = new THREE.PointLight(0xff8b5c, 6, 14)
    amberLight.position.set(-2.6, -1.4, 2.2)
    scene.add(amberLight)

    const system = new THREE.Group()
    scene.add(system)

    const coreGeom = new THREE.SphereGeometry(0.24, mobile ? 20 : 32, mobile ? 20 : 32)
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x78e7ff,
      emissive: 0x78e7ff,
      emissiveIntensity: 1.35,
      roughness: 0.22,
      metalness: 0.4,
    })
    geometries.push(coreGeom)
    materials.push(coreMat)
    const core = new THREE.Mesh(coreGeom, coreMat)
    system.add(core)

    const haloGeom = new THREE.SphereGeometry(0.38, 20, 20)
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x78e7ff,
      transparent: true,
      opacity: 0.1,
      depthWrite: false,
    })
    geometries.push(haloGeom)
    materials.push(haloMat)
    system.add(new THREE.Mesh(haloGeom, haloMat))

    const ringDefs = [
      { radius: 0.9, tube: 0.01, rot: [Math.PI / 2, 0.06, 0], color: 0x78e7ff },
      { radius: 1.26, tube: 0.008, rot: [1.12, 0.32, 0.16], color: 0xf1efe8 },
      { radius: 1.6, tube: 0.007, rot: [0.52, 0.88, 0.1], color: 0xff8b5c },
      { radius: 1.94, tube: 0.006, rot: [1.32, 0.18, 0.38], color: 0x78e7ff },
    ]
    const rings = ringDefs.map((def) => {
      const geom = new THREE.TorusGeometry(def.radius, def.tube, 10, mobile ? 48 : 96)
      const mat = new THREE.MeshStandardMaterial({
        color: def.color,
        emissive: def.color,
        emissiveIntensity: 0.16,
        metalness: 0.72,
        roughness: 0.3,
        transparent: true,
        opacity: 0.72,
      })
      geometries.push(geom)
      materials.push(mat)
      const mesh = new THREE.Mesh(geom, mat)
      mesh.rotation.set(def.rot[0], def.rot[1], def.rot[2])
      system.add(mesh)
      return mesh
    })

    const nodeCount = mobile ? 5 : 8
    const nodeGeom = new THREE.SphereGeometry(0.032, 10, 10)
    geometries.push(nodeGeom)
    const nodes: THREE.Mesh[] = []
    const nodeBase: THREE.Vector3[] = []
    const scatter: THREE.Vector3[] = []
    const nodeMats: THREE.MeshStandardMaterial[] = []

    for (let i = 0; i < nodeCount; i++) {
      const a = (i / nodeCount) * Math.PI * 2
      nodeBase.push(new THREE.Vector3(Math.cos(a) * 1.6, Math.sin(a * 1.7) * 0.28, Math.sin(a) * 1.6))
      scatter.push(new THREE.Vector3(Math.cos(a * 1.8) * 2.6, i % 2 === 0 ? 1.4 : -1.5, Math.sin(a * 1.3) * 2.4))
      const mat = new THREE.MeshStandardMaterial({
        color: 0xf1efe8,
        emissive: 0x78e7ff,
        emissiveIntensity: 0.35,
        roughness: 0.32,
        metalness: 0.55,
      })
      materials.push(mat)
      nodeMats.push(mat)
      const node = new THREE.Mesh(nodeGeom, mat)
      node.position.copy(nodeBase[i])
      nodes.push(node)
      system.add(node)
    }

    const lineGeom = new THREE.BufferGeometry()
    lineGeom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(nodeCount * 4 * 3), 3))
    const lineMat = new THREE.LineBasicMaterial({ color: 0x78e7ff, transparent: true, opacity: 0.2 })
    geometries.push(lineGeom)
    materials.push(lineMat)
    system.add(new THREE.LineSegments(lineGeom, lineMat))

    const makeOrbit = (x: number, z: number, rotX: number, rotZ: number) => {
      const curve = new THREE.EllipseCurve(0, 0, x, z, 0, Math.PI * 2, false, 0)
      const pts = curve.getPoints(mobile ? 40 : 72).map((p) => new THREE.Vector3(p.x, 0, p.y))
      const geom = new THREE.BufferGeometry().setFromPoints(pts)
      const mat = new THREE.LineBasicMaterial({ color: 0x9299a8, transparent: true, opacity: 0.18 })
      geometries.push(geom)
      materials.push(mat)
      const line = new THREE.LineLoop(geom, mat)
      line.rotation.x = rotX
      line.rotation.z = rotZ
      system.add(line)
      return line
    }
    const orbitA = makeOrbit(2.15, 1.35, 0.18, 0.12)
    const orbitB = makeOrbit(1.7, 2.05, 1.05, -0.2)

    const pointer = { x: 0, y: 0, tx: 0, ty: 0 }
    let frame = 0
    let running = true
    const tmp = new THREE.Vector3()
    const pathPos = new THREE.Vector3()
    const origin = new THREE.Vector3()

    const fit = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      camera.aspect = w / Math.max(h, 1)
      camera.updateProjectionMatrix()
      renderer.setSize(w, h, false)
    }

    const apply = () => {
      const s = stateRef.current
      const scatterAmt = 1 - s.assemble
      nodes.forEach((node, i) => {
        tmp.copy(nodeBase[i]).addScaledVector(scatter[i], scatterAmt)
        pathPos.set(0, (i - (nodeCount - 1) / 2) * 0.42, 0)
        tmp.lerp(pathPos, s.path)
        tmp.lerp(origin, s.converge * 0.82)
        node.position.copy(tmp)
        const portalHeat = Math.max(0, 1 - Math.abs(s.portal - (i * 4) / Math.max(nodeCount - 1, 1)))
        nodeMats[i].emissiveIntensity = 0.25 + portalHeat * 0.9 * Math.min(s.portal, 1) + s.signal * 0.5
      })

      const pos = lineGeom.getAttribute('position') as THREE.BufferAttribute
      let p = 0
      nodes.forEach((node, i) => {
        pos.setXYZ(p++, 0, 0, 0)
        pos.setXYZ(p++, node.position.x, node.position.y, node.position.z)
        const next = nodes[(i + 1) % nodes.length]
        pos.setXYZ(p++, node.position.x, node.position.y, node.position.z)
        pos.setXYZ(p++, next.position.x, next.position.y, next.position.z)
      })
      pos.needsUpdate = true
      lineMat.opacity = 0.08 + s.assemble * 0.18 + s.signal * 0.12

      rings.forEach((ring, i) => {
        const along = i - 1.5
        ring.position.set(along * s.layers * 0.55, along * s.open * 0.32, along * s.layers * -0.12)
        ring.scale.setScalar(1 + s.open * 0.12 - s.converge * 0.18 + s.signal * 0.2)
      })

      core.scale.setScalar(s.coreScale)
      coreMat.emissiveIntensity = 1.15 + s.signal * 1.35
      orbitA.rotation.y = s.rotY * 0.15
      orbitB.rotation.y = -s.rotY * 0.1
      system.rotation.set(s.rotX + pointer.y * 0.12, s.rotY + pointer.x * 0.16, pointer.x * -0.04)
      cyanLight.intensity = s.cyan
      amberLight.intensity = s.amber
      camera.position.set(s.camX + pointer.x * 0.18, s.camY + pointer.y * 0.12, s.camZ)
      camera.lookAt(0, s.camLookY, 0)
    }

    const loop = () => {
      if (!running) return
      frame = requestAnimationFrame(loop)
      if (document.hidden) return
      pointer.x += (pointer.tx - pointer.x) * 0.045
      pointer.y += (pointer.ty - pointer.y) * 0.045
      apply()
      renderer.render(scene, camera)
    }

    const onPointer = (event: PointerEvent) => {
      if (reducedMotion) return
      pointer.tx = (event.clientX / window.innerWidth - 0.5) * 2
      pointer.ty = -(event.clientY / window.innerHeight - 0.5) * 2
    }
    const onVisibility = () => {
      if (!document.hidden && running) {
        cancelAnimationFrame(frame)
        frame = requestAnimationFrame(loop)
      }
    }

    fit()
    apply()
    renderer.render(scene, camera)
    frame = requestAnimationFrame(loop)

    window.addEventListener('pointermove', onPointer, { passive: true })
    window.addEventListener('resize', fit)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      running = false
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('resize', fit)
      document.removeEventListener('visibilitychange', onVisibility)
      geometries.forEach((geometry) => geometry.dispose())
      materials.forEach((material) => material.dispose())
      scene.clear()
      renderer.dispose()
      renderer.forceContextLoss()
    }
  }, [reducedMotion, stateRef])

  return (
    <>
      <div className="story-fallback" aria-hidden="true">
        <div className="core-fallback">
          <span className="core-ring" />
          <span className="core-ring" />
          <span className="core-ring" />
          <span className="core-ring" />
          <span className="core-nucleus" />
        </div>
      </div>
      <canvas ref={canvasRef} className="story-canvas" aria-hidden="true" />
    </>
  )
}
