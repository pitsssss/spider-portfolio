'use client'
import { useState } from 'react'
import { skillGroups } from '@/content/skills'
import type { SkillGroup } from '@/content/types'

function SkillCard({ group }: { group: SkillGroup }) {
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0, scale: 1 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setTransform({
      rotateX: (y - rect.height / 2) / 10,
      rotateY: (rect.width / 2 - x) / 10,
      scale: 1.02,
    })
  }

  return (
    <div
      className="glass reveal skill-card"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setTransform({ rotateX: 0, rotateY: 0, scale: 1 })}
      style={{
        transform: `perspective(1000px) rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg) scale(${transform.scale})`,
      }}
    >
      <h3>{group.title}</h3>
      <div className="skill-tags">
        {group.items.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </div>
  )
}

export default function SkillsSection() {
  return (
    <section id="skills" className="section section-alt" aria-labelledby="skills-h">
      <div className="container-main">
        <div className="section-header reveal">
          <p className="section-label">Capabilities</p>
          <h2 id="skills-h" className="section-title">ENGINEERING <span>EXPERTISE</span></h2>
          <div className="section-divider"><div className="section-dot" /></div>
        </div>
        <div className="skills-grid">
          {skillGroups.map((group) => (
            <SkillCard key={group.title} group={group} />
          ))}
        </div>
      </div>
    </section>
  )
}
