'use client'

import { useEffect, useRef, useState } from 'react'
import StoryCanvas from './StoryCanvas'
import StoryChapter from './StoryChapter'
import { createStoryState, createStoryTimeline } from './StoryController'
import { profile } from '@/content/profile'
import { featuredProjects } from '@/content/projects'
import { skillGroups } from '@/content/skills'
import { experience } from '@/content/experience'
import { social, socialLinks } from '@/content/social'
import Footer from '@/components/Footer'

const architecture = skillGroups.find((group) => group.title === 'Software Engineering')
const backend = skillGroups.find((group) => group.title === 'Backend')
const frontend = skillGroups.find((group) => group.title === 'Frontend')
const appliedAi = skillGroups.find((group) => group.title === 'Applied AI')
const tools = skillGroups.find((group) => group.title === 'Engineering Tools')

const layers = [
  { name: 'Architecture', items: architecture?.items ?? [] },
  { name: 'Backend', items: backend?.items ?? [] },
  { name: 'Frontend', items: frontend?.items ?? [] },
  { name: 'Applied AI', items: appliedAi?.items ?? [] },
]

const linkProps = { target: '_blank', rel: 'noopener noreferrer' } as const

export default function StoryExperience() {
  const rootRef = useRef<HTMLDivElement>(null)
  const stateRef = useRef(createStoryState())
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReducedMotion(query.matches)
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    return createStoryTimeline(root, stateRef.current, reducedMotion)
  }, [reducedMotion])

  return (
    <div ref={rootRef} className={reducedMotion ? 'story-root is-static' : 'story-root'}>
      <StoryCanvas stateRef={stateRef} reducedMotion={reducedMotion} />

      <StoryChapter id="hero" index="00" label="Introduction" coord="SYS.CORE / 00" className="chapter-hero">
        <p className="eyebrow">{profile.positioning}</p>
        <p className="hero-name">{profile.name}</p>
        <h1 id="hero-title" className="display">
          I engineer digital<br />
          products end to end.
        </h1>
        <p className="lede">{profile.heroSupporting}</p>
        <div className="hero-actions">
          <a href={profile.primaryCta.href} className="btn-primary">{profile.primaryCta.label}</a>
          <a href={profile.secondaryCta.href} className="btn-secondary">{profile.secondaryCta.label}</a>
        </div>
      </StoryChapter>

      <StoryChapter index="01" label="Process" coord="LAYERS / 01" align="right" className="chapter-process">
        <h2 className="display-md">From Complexity to Clarity</h2>
        <p className="lede">{architecture?.title}</p>
        <ul className="plain-list">
          {architecture?.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </StoryChapter>

      <div id="projects">
        {featuredProjects.map((project, index) => (
          <StoryChapter
            key={project.slug}
            index={`02.${String(index + 1).padStart(2, '0')}`}
            label="Selected Work"
            coord={`PORTAL / 0${index + 1}`}
            align={index % 2 === 0 ? 'left' : 'right'}
            className="chapter-project"
          >
            {index === 0 && <h2 id="projects-title" className="sr-only">Selected Work</h2>}
            {project.image && (
              <img className="project-plane" src={project.image} alt="" aria-hidden="true" />
            )}
            <p className="eyebrow">{project.category}</p>
            <h3 className="display-md">{project.shortTitle ?? project.title}</h3>
            {project.shortTitle && <p className="project-full-title">{project.title}</p>}
            <p className="role">{project.role}</p>
            <p className="lede">{project.summary}</p>
            <ul className="plain-list">
              {project.highlights.slice(0, 2).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="stack-line">{project.stack.slice(0, 6).join('  ·  ')}</p>
            {project.liveUrl && (
              <a href={project.liveUrl} className="text-link" {...linkProps}>View live site</a>
            )}
          </StoryChapter>
        ))}
      </div>

      <StoryChapter id="skills" index="03" label="Expertise" coord="LAYERS / 04" className="chapter-skills">
        <h2 id="skills-title" className="display-md">Engineering Expertise</h2>
        <div className="layer-stack">
          {layers.map((layer) => (
            <div key={layer.name} className="layer-row">
              <h3>{layer.name}</h3>
              <p>{layer.items.join('  /  ')}</p>
            </div>
          ))}
        </div>
        {tools && (
          <p className="tools-line">{tools.title}: {tools.items.join('  ·  ')}</p>
        )}
      </StoryChapter>

      <div id="experience">
        {experience.map((item, index) => (
          <StoryChapter
            key={`${item.organization}-${item.title}`}
            index={`04.${String(index + 1).padStart(2, '0')}`}
            label="Experience"
            coord={`NODE / 0${index + 1}`}
            align={index % 2 === 0 ? 'right' : 'left'}
            className="chapter-experience"
          >
            {index === 0 && <h2 id="experience-title" className="sr-only">Experience</h2>}
            <p className="eyebrow">{item.period}</p>
            <h3 className="display-md">{item.title}</h3>
            <p className="role">
              {item.organization}
              {item.employmentType ? `  ·  ${item.employmentType}` : ''}
              {item.locationType ? `  ·  ${item.locationType}` : ''}
            </p>
            <p className="lede">{item.summary}</p>
          </StoryChapter>
        ))}
      </div>

      <StoryChapter id="about" index="05" label="About" coord="STABLE / 01" className="chapter-about">
        <h2 id="about-title" className="display-md">{profile.name}</h2>
        <p className="eyebrow">{profile.title}</p>
        {profile.about.map((paragraph) => (
          <p key={paragraph} className="lede">{paragraph}</p>
        ))}
        <p className="tools-line">{profile.location}</p>
      </StoryChapter>

      <StoryChapter id="contact" index="06" label="Contact" coord="SIGNAL / END" align="center" className="chapter-contact">
        <h2 id="contact-title" className="display">{profile.contactLead}</h2>
        <p className="lede">{profile.contactSupport}</p>
        <a href={social.email.href} className="contact-email">{profile.email}</a>
        <div className="hero-actions">
          {socialLinks.map((link) => (
            <a key={link.label} href={link.href} className="text-link" {...(link.external ? linkProps : {})}>
              {link.label}
            </a>
          ))}
        </div>
      </StoryChapter>

      <Footer />
    </div>
  )
}
