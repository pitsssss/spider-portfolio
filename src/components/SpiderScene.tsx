'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

export default function SpiderScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
      const context = renderer.getContext()
      if (!context) throw new Error('WebGL context unavailable')
    } catch {
      setFailed(true)
      return
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2

    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x0a0a0f, 0.00018)

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 60)
    camera.position.set(0, 0.2, 6)

    scene.add(new THREE.AmbientLight(0x334466, 0.55))
    const key = new THREE.PointLight(0xe23636, 22, 14)
    key.position.set(4, 2, 5)
    scene.add(key)
    const fill = new THREE.PointLight(0x2b3784, 16, 12)
    fill.position.set(-4, -1, 3)
    scene.add(fill)

    const grid = new THREE.PolarGridHelper(8, 16, 8, 64, 0x1b1464, 0x1b1464)
    grid.position.y = -2.6
    scene.add(grid)

    const shapes: THREE.Mesh[] = []
    const geometries: THREE.BufferGeometry[] = []
    const materials: THREE.Material[] = []

    const makeMat = (color: number, emissive: number) => {
      const mat = new THREE.MeshStandardMaterial({
        color,
        wireframe: true,
        metalness: 0.55,
        roughness: 0.25,
        emissive,
        emissiveIntensity: 0.22,
      })
      materials.push(mat)
      return mat
    }

    for (let i = 0; i < 10; i++) {
      const roll = Math.random()
      let geometry: THREE.BufferGeometry
      if (roll < 0.34) geometry = new THREE.IcosahedronGeometry(0.12 + Math.random() * 0.2, 0)
      else if (roll < 0.67) geometry = new THREE.OctahedronGeometry(0.12 + Math.random() * 0.22)
      else geometry = new THREE.TorusGeometry(0.1 + Math.random() * 0.12, 0.03, 8, 12)
      geometries.push(geometry)

      const mesh = new THREE.Mesh(
        geometry,
        roll < 0.5 ? makeMat(0xe23636, 0x330000) : makeMat(0x2b3784, 0x000033),
      )
      mesh.position.set((Math.random() - 0.5) * 7, (Math.random() - 0.5) * 4.5, (Math.random() - 0.5) * 4 - 1)
      mesh.userData = { speed: 0.2 + Math.random() * 0.7, rot: 0.004 + Math.random() * 0.016, ph: Math.random() * Math.PI * 2 }
      shapes.push(mesh)
      scene.add(mesh)
    }

    const count = 280
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const t = (i / count) * Math.PI * 6
      const r = 1 + (i / count) * 5
      positions[i3] = Math.cos(t) * r + (Math.random() - 0.5) * 2
      positions[i3 + 1] = (Math.random() - 0.5) * 5
      positions[i3 + 2] = Math.sin(t) * r + (Math.random() - 0.5) * 2
      const warm = Math.random() > 0.62
      colors[i3] = warm ? 0.95 : 0.25
      colors[i3 + 1] = warm ? 0.25 : 0.1
      colors[i3 + 2] = warm ? 0.25 : 0.45
    }
    const pointsGeom = new THREE.BufferGeometry()
    pointsGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    pointsGeom.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geometries.push(pointsGeom)
    const pointsMat = new THREE.PointsMaterial({
      size: 0.03,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    materials.push(pointsMat)
    const points = new THREE.Points(pointsGeom, pointsMat)
    scene.add(points)

    const clock = new THREE.Clock()
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 }
    let scrollY = 0
    let frame = 0
    let running = true

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    let reducedMotion = motionQuery.matches

    const onMouseMove = (event: MouseEvent) => {
      mouse.tx = (event.clientX / window.innerWidth - 0.5) * 2
      mouse.ty = -(event.clientY / window.innerHeight - 0.5) * 2
    }
    const onScroll = () => {
      scrollY = window.scrollY
    }
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    const onMotionChange = () => {
      reducedMotion = motionQuery.matches
    }
    const onVisibility = () => {
      if (document.hidden) return
      clock.getDelta()
      if (running && !reducedMotion) startLoop()
    }

    const renderFrame = () => {
      const t = clock.getElapsedTime()
      mouse.x += (mouse.tx - mouse.x) * 0.05
      mouse.y += (mouse.ty - mouse.y) * 0.05
      const denom = Math.max(document.body.scrollHeight - window.innerHeight, 1)
      const sf = scrollY / denom
      camera.position.y += (0.2 - sf * 1.4 - camera.position.y) * 0.03
      camera.position.z += (6 + sf * 2 - camera.position.z) * 0.03
      camera.position.x += (mouse.x * 0.5 - camera.position.x) * 0.02
      camera.lookAt(0, -0.15 + mouse.y * 0.08, 0)
      shapes.forEach((mesh) => {
        mesh.rotation.x += mesh.userData.rot
        mesh.rotation.y += mesh.userData.rot * 0.7
        mesh.position.y += Math.sin(t * mesh.userData.speed + mesh.userData.ph) * 0.0025
      })
      points.rotation.y += 0.0005
      grid.rotation.z += 0.00025
      renderer.render(scene, camera)
    }

    const loop = () => {
      if (!running || reducedMotion || document.hidden) return
      frame = requestAnimationFrame(loop)
      renderFrame()
    }

    const startLoop = () => {
      cancelAnimationFrame(frame)
      if (!running || reducedMotion || document.hidden) {
        renderFrame()
        return
      }
      frame = requestAnimationFrame(loop)
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    document.addEventListener('visibilitychange', onVisibility)
    motionQuery.addEventListener('change', onMotionChange)

    renderFrame()
    startLoop()

    return () => {
      running = false
      cancelAnimationFrame(frame)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibility)
      motionQuery.removeEventListener('change', onMotionChange)
      geometries.forEach((geometry) => geometry.dispose())
      materials.forEach((material) => material.dispose())
      grid.geometry.dispose()
      const gridMaterial = grid.material
      if (Array.isArray(gridMaterial)) gridMaterial.forEach((material) => material.dispose())
      else gridMaterial.dispose()
      scene.clear()
      renderer.dispose()
      renderer.forceContextLoss()
    }
  }, [])

  return (
    <>
      <div className="hero-fallback" aria-hidden="true" />
      {!failed && (
        <canvas
          ref={canvasRef}
          style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
          aria-hidden="true"
        />
      )}
    </>
  )
}
