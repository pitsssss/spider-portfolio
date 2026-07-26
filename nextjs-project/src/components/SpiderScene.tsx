'use client'
import { useEffect, useRef } from 'react'

export default function SpiderScene() {
  const mounted = useRef(false)

  useEffect(() => {
    if (mounted.current) return
    mounted.current = true

    const importMap = document.createElement('script')
    importMap.type = 'importmap'
    importMap.textContent = JSON.stringify({ 
      imports: { 
        three: 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js' 
      } 
    })
    document.head.appendChild(importMap)

    // Small delay to ensure import map is processed
    setTimeout(() => {
      import('three').then((THREE) => {
        initScene(THREE)
      }).catch(() => {
        // Fallback to CDN
        const script = document.createElement('script')
        script.type = 'module'
        script.innerHTML = getSceneCode()
        document.body.appendChild(script)
      })
    }, 50)

    return () => {
      if (document.head.contains(importMap)) {
        document.head.removeChild(importMap)
      }
    }
  }, [])

  return <canvas id="three-canvas" style={{ position:'fixed',inset:0,zIndex:0,pointerEvents:'none' }} aria-hidden="true" />
}

function initScene(THREE: any) {
  const canvas = document.getElementById('three-canvas') as HTMLCanvasElement
  if (!canvas) return

  const renderer = new THREE.WebGLRenderer({canvas, antialias: true, alpha: true})
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.3

  const scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0x0A0A0F, 0.00015)
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 60)
  camera.position.set(0, 0.3, 6)

  scene.add(new THREE.AmbientLight(0x334466, 0.6))
  const kl = new THREE.PointLight(0xE23636, 30, 12)
  kl.position.set(4,2,5)
  scene.add(kl)
  const fl = new THREE.PointLight(0x2B3784, 18, 10)
  fl.position.set(-4,-1,3)
  scene.add(fl)
  const rl = new THREE.SpotLight(0xffffff, 25, 15, 0.6, 0.6)
  rl.position.set(0,4,6)
  scene.add(rl)

  const grid = new THREE.PolarGridHelper(8, 32, 24, 64, 0x1B1464, 0x1B1464)
  grid.position.y = -3
  scene.add(grid)

  const bMat = new THREE.MeshStandardMaterial({color:0x1a1a2e,metalness:0.3,roughness:0.8,emissive:0x000011,emissiveIntensity:0.2})
  const wMat = new THREE.MeshBasicMaterial({color:0x2B3784,wireframe:true,transparent:true,opacity:0.15})
  for(let i=0;i<40;i++){
    const h=0.3+Math.random()*3.5,w=0.15+Math.random()*0.5,d=0.15+Math.random()*0.5
    const a=(Math.random()-0.5)*Math.PI*0.7,rad=2.5+Math.random()*4
    const x=Math.cos(a)*rad,z=Math.sin(a)*rad-1
    const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),bMat)
    b.position.set(x,-3.5+h/2,z)
    scene.add(b)
    const wr=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),wMat)
    wr.position.copy(b.position)
    scene.add(wr)
  }

  const eg=new THREE.Group()
  const sh=new THREE.Shape()
  const s=0.9
  sh.moveTo(0,s*0.8)
  sh.bezierCurveTo(s*0.4,s*0.8,s*0.6,s*0.3,s*0.55,0)
  sh.bezierCurveTo(s*0.5,-s*0.1,s*0.3,-s*0.35,0,-s*0.65)
  sh.bezierCurveTo(-s*0.3,-s*0.35,-s*0.5,-s*0.1,-s*0.55,0)
  sh.bezierCurveTo(-s*0.6,s*0.3,-s*0.4,s*0.8,0,s*0.8)
  const bg=new THREE.ExtrudeGeometry(sh,{depth:0.1,bevelEnabled:true,bevelThickness:0.05,bevelSize:0.05,bevelSegments:3})
  const bm=new THREE.MeshStandardMaterial({color:0xB11310,metalness:0.85,roughness:0.15,emissive:0x330000,emissiveIntensity:0.5})
  eg.add(new THREE.Mesh(bg,bm))
  const em=new THREE.MeshStandardMaterial({color:0xffffff,metalness:0.1,roughness:0.1,emissive:0xffffff,emissiveIntensity:0.8})
  const eyePositions = [-0.25, 0.25]
  eyePositions.forEach(ex=>{
    const e=new THREE.Mesh(new THREE.SphereGeometry(0.1,16,16),em)
    e.position.set(ex,0.35,0.08)
    e.scale.set(1.2,0.7,0.4)
    eg.add(e)
  })
  const lm=new THREE.MeshStandardMaterial({color:0x1B1464,metalness:0.7,roughness:0.25,emissive:0x000022,emissiveIntensity:0.2})
  for(let side=-1;side<=1;side+=2){
    for(let i=0;i<4;i++){
      const angle=(Math.PI/5)*(i+1)*0.75,len=0.4+i*0.12
      const l=new THREE.Mesh(new THREE.CapsuleGeometry(0.028,len,6,10),lm)
      l.position.set(side*0.38*Math.cos(angle),0.08-i*0.22,0)
      l.rotation.z=side*angle
      eg.add(l)
    }
  }
  scene.add(eg)

  const wl: any[] = []
  const wM=new THREE.LineBasicMaterial({color:0xB11310,transparent:true,opacity:0.25})
  for(let i=0;i<20;i++){
    const sa=(i/20)*Math.PI*2,sr=1.2,er=2+Math.random()*3
    const sy=Math.sin(i*0.7)*0.3,ey=-2+Math.random()*2
    const p=[
      new THREE.Vector3(Math.cos(sa)*sr,sy,Math.sin(sa)*sr),
      new THREE.Vector3(Math.cos(sa)*(sr+er)/2+(Math.random()-0.5)*0.5,(sy+ey)/2+Math.random()*0.5,Math.sin(sa)*(sr+er)/2),
      new THREE.Vector3(Math.cos(sa)*er+(Math.random()-0.5)*1.5,ey,Math.sin(sa)*er+(Math.random()-0.5)*1.5)
    ]
    const c=new THREE.QuadraticBezierCurve3(p[0],p[1],p[2])
    const ln=new THREE.Line(new THREE.BufferGeometry().setFromPoints(c.getPoints(30)),wM)
    scene.add(ln)
    wl.push({line:ln,base:0.15+Math.random()*0.2})
  }

  const shapes: any[] = []
  for(let i=0;i<12;i++){
    let m
    const r=Math.random()
    const mk=(c: number,e: number)=>new THREE.MeshStandardMaterial({color:c,wireframe:true,metalness:0.6,roughness:0.2,emissive:e,emissiveIntensity:0.25})
    if(r<0.3) m=new THREE.Mesh(new THREE.OctahedronGeometry(0.12+Math.random()*0.22),mk(0xE23636,0x330000))
    else if(r<0.6) m=new THREE.Mesh(new THREE.IcosahedronGeometry(0.1+Math.random()*0.2),mk(0x2B3784,0x000033))
    else if(r<0.8) m=new THREE.Mesh(new THREE.TorusGeometry(0.1+Math.random()*0.15,0.035,8,8),mk(0xB11310,0x330000))
    else m=new THREE.Mesh(new THREE.TetrahedronGeometry(0.12+Math.random()*0.18),mk(0xE23636,0x330000))
    m.position.set((Math.random()-0.5)*7,(Math.random()-0.5)*5,(Math.random()-0.5)*4-1)
    m.userData={speed:0.2+Math.random()*0.8,rot:0.005+Math.random()*0.02,ph:Math.random()*Math.PI*2}
    shapes.push(m)
    scene.add(m)
  }

  const pc=500,pg=new THREE.BufferGeometry(),pos=new Float32Array(pc*3),col=new Float32Array(pc*3)
  for(let i=0;i<pc;i++){
    const i3=i*3,t=(i/pc)*Math.PI*6,r=1+(i/pc)*5
    pos[i3]=Math.cos(t)*r+(Math.random()-0.5)*2
    pos[i3+1]=(Math.random()-0.5)*5
    pos[i3+2]=Math.sin(t)*r+(Math.random()-0.5)*2
    const mx=Math.random()
    col[i3]=mx>0.6?0.95:0.25
    col[i3+1]=mx>0.6?0.25:0.1
    col[i3+2]=mx>0.6?0.25:0.45
  }
  pg.setAttribute('position',new THREE.BufferAttribute(pos,3))
  pg.setAttribute('color',new THREE.BufferAttribute(col,3))
  const pts=new THREE.Points(pg,new THREE.PointsMaterial({size:0.03,vertexColors:true,transparent:true,opacity:0.7,blending:THREE.AdditiveBlending,depthWrite:false}))
  scene.add(pts)

  const mouse={x:0,y:0,tx:0,ty:0}
  window.addEventListener('mousemove',e=>{
    mouse.tx=(e.clientX/window.innerWidth-0.5)*2
    mouse.ty=-(e.clientY/window.innerHeight-0.5)*2
  })
  const clk=new THREE.Clock()
  let sy=0
  window.addEventListener('scroll',()=>{sy=window.scrollY})
  
  function anim(){
    requestAnimationFrame(anim)
    const t=clk.getElapsedTime()
    mouse.x+=(mouse.tx-mouse.x)*0.05
    mouse.y+=(mouse.ty-mouse.y)*0.05
    const sf=sy/(document.body.scrollHeight-window.innerHeight)
    camera.position.y+=(0.3-sf*1.5-camera.position.y)*0.03
    camera.position.z+=(6+sf*2-camera.position.z)*0.03
    camera.position.x+=(mouse.x*0.6-camera.position.x)*0.02
    camera.lookAt(0,-0.2+mouse.y*0.1,0)
    eg.rotation.y=Math.sin(t*0.35)*0.35+mouse.x*0.2
    eg.rotation.z=Math.sin(t*0.5)*0.1
    eg.position.y=Math.sin(t*0.55)*0.2
    eg.position.x=mouse.x*0.15
    shapes.forEach((m)=>{
      m.rotation.x+=m.userData.rot
      m.rotation.y+=m.userData.rot*0.7
      m.position.y+=Math.sin(t*m.userData.speed+m.userData.ph)*0.003
    })
    pts.rotation.y+=0.0006
    pts.rotation.x=Math.sin(t*0.06)*0.05
    wl.forEach((w,i)=>{
      w.line.material.opacity=w.base+Math.sin(t*1.5+i)*0.08
    })
    grid.rotation.z+=0.0003
    renderer.render(scene,camera)
  }
  anim()
  
  window.addEventListener('resize',()=>{
    camera.aspect=window.innerWidth/window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth,window.innerHeight)
  })
}

function getSceneCode() {
  return `
    import * as THREE from 'three';
    console.log('Loading Three.js from CDN');
  `
}
