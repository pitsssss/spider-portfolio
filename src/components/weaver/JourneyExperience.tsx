'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import WeaverJourney, { type IntroPhase } from './WeaverJourney'
import StoryThread from './StoryThread'
import JourneyChapter from './JourneyChapter'
import type { JourneyChapterKey } from './chapterConfig'
import type { IntroSnapshot } from './heroIntro'
import { profile } from '@/content/profile'
import { featuredProjects } from '@/content/projects'
import { skillGroups } from '@/content/skills'
import { experience } from '@/content/experience'
import { social, socialLinks } from '@/content/social'
import styles from './JourneyExperience.module.css'

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

export default function JourneyExperience() {
  const rootRef = useRef<HTMLDivElement>(null)
  const heroThreadRef = useRef<SVGPathElement>(null)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [activeChapter, setActiveChapter] = useState<JourneyChapterKey>('hero')
  const [introPhase, setIntroPhase] = useState<IntroPhase>('idle')
  const [introSnapshot, setIntroSnapshot] = useState<IntroSnapshot | null>(null)
  const [headlineReady, setHeadlineReady] = useState(false)
  const reduce = useReducedMotion()

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReducedMotion(query.matches)
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (reduce || reducedMotion) {
      setHeadlineReady(true)
      return
    }
    if (introPhase === 'reveal' || introPhase === 'idle' || introPhase === 'skipped') {
      setHeadlineReady(true)
    }
  }, [introPhase, reduce, reducedMotion])

  useEffect(() => {
    const timer = window.setTimeout(() => setHeadlineReady(true), 5800)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    const root = rootRef.current
    const path = heroThreadRef.current
    if (!root || !path) return

    const draw = () => {
      const cta = root.querySelector<HTMLElement>('[data-thread-anchor="cta"]')
      if (!cta) return

      const endRect = cta.getBoundingClientRect()
      const end = { x: endRect.left + 8, y: endRect.top + endRect.height * 0.75 }
      const start = introSnapshot?.spinnerScreen ?? {
        x: window.innerWidth * (window.innerWidth < 768 ? 0.72 : 0.68),
        y: window.innerHeight * (window.innerWidth < 768 ? 0.2 : 0.24),
      }
      const progress = introSnapshot?.webProgress ?? 0
      const overshoot = {
        x: end.x + (start.x - end.x) * 0.06 * (1 - progress),
        y: end.y + (start.y - end.y) * 0.04 * (1 - progress),
      }
      const c1 = {
        x: start.x + (end.x - start.x) * 0.25,
        y: start.y + (end.y - start.y) * 0.15 + window.innerHeight * 0.04,
      }
      const c2 = {
        x: overshoot.x - window.innerWidth * 0.03,
        y: overshoot.y - window.innerHeight * 0.02,
      }
      path.setAttribute(
        'd',
        `M ${start.x} ${start.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${overshoot.x} ${overshoot.y} S ${end.x} ${end.y}, ${end.x} ${end.y}`,
      )
      const len = path.getTotalLength()
      path.style.strokeDasharray = `${len}`
      path.style.strokeDashoffset = `${len * (1 - progress)}`
    }

    draw()
    window.addEventListener('resize', draw)
    return () => window.removeEventListener('resize', draw)
  }, [introSnapshot])

  const onChapterChange = (key: JourneyChapterKey) => setActiveChapter(key)

  return (
    <div
      ref={rootRef}
      className={[
        styles.root,
        reducedMotion ? styles.static : '',
        headlineReady ? styles.headlineReady : '',
      ].filter(Boolean).join(' ')}
      data-active-chapter={activeChapter}
      data-intro-phase={introPhase}
    >
      <div className={styles.atmosphere} aria-hidden="true" />
      <WeaverJourney
        rootRef={rootRef}
        reducedMotion={reducedMotion}
        onChapterChange={onChapterChange}
        onIntroPhase={setIntroPhase}
        onIntroSnapshot={setIntroSnapshot}
      />
      {activeChapter !== 'hero' && (
        <StoryThread rootRef={rootRef} reducedMotion={reducedMotion} />
      )}
      <svg
        className={[
          styles.heroThread,
          introPhase === 'pulse' || introPhase === 'reveal' || reducedMotion ? styles.heroThreadVisible : '',
        ].filter(Boolean).join(' ')}
        aria-hidden="true"
      >
        <path
          ref={heroThreadRef}
          d=""
          fill="none"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <JourneyChapter
        chapterKey="hero"
        id="hero"
        index="01"
        label="Introduction"
        hideMeta
        className={styles.hero}
      >
        <div className={styles.heroCopy}>
        <p className={styles.eyebrow}>{profile.title}</p>
        <h1 id="hero-title" className={styles.heroTitle} data-thread-anchor="headline">
          <span className={styles.lineMask}>
            <span className={`${styles.heroLine} ${styles.serif}`}>I engineer systems that</span>
          </span>
          <span className={styles.lineMask}>
            <span className={`${styles.heroLine} ${styles.serif}`}>
              move ideas <em>forward.</em>
            </span>
          </span>
        </h1>
        <p className={styles.lede}>{profile.heroSupporting}</p>
        <a href={profile.primaryCta.href} className={styles.cta} data-thread-anchor="cta">
          {profile.primaryCta.label}
        </a>
        </div>
      </JourneyChapter>

      <JourneyChapter chapterKey="process" index="02" label="Process" align="right" threadAnchor="process" className={styles.process}>
        <h2 className={styles.displayMd}>From Complexity to Clarity</h2>
        <ul className={styles.milestones}>
          {(architecture?.items ?? []).map((item, i) => (
            <li key={item}>
              <span className={styles.milestoneIndex}>0{i + 1}</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </JourneyChapter>

      <div id="projects">
        {featuredProjects.map((project, index) => (
          <JourneyChapter
            key={project.slug}
            chapterKey={`project-${index}` as JourneyChapterKey}
            index={`03.${String(index + 1).padStart(2, '0')}`}
            label="Selected Work"
            align={index % 2 === 0 ? 'left' : 'right'}
            threadAnchor={`project-${index}`}
            className={styles.project}
          >
            {index === 0 && <h2 id="projects-title" className="sr-only">Selected Work</h2>}
            <div className={styles.projectLayout}>
              <div className={styles.projectCopy}>
                <p className={styles.eyebrow}>{project.category}</p>
                <h3 className={`${styles.displayMd} ${styles.serif}`}>{project.shortTitle ?? project.title}</h3>
                {project.shortTitle && <p className={styles.subtitle}>{project.title}</p>}
                <p className={styles.role}>{project.role}</p>
                <p className={styles.lede}>{project.summary}</p>
                <ul className={styles.list}>
                  {project.highlights.slice(0, 2).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className={styles.stack}>{project.stack.slice(0, 6).join('  ·  ')}</p>
                {project.liveUrl && (
                  <a href={project.liveUrl} className={styles.textLink} {...linkProps}>View live site</a>
                )}
              </div>
              {project.image && (
                <motion.div
                  className={styles.artPlane}
                  initial={reduce ? false : { opacity: 0, y: 18 }}
                  whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                >
                  <img src={project.image} alt="" />
                </motion.div>
              )}
            </div>
          </JourneyChapter>
        ))}
      </div>

      <JourneyChapter chapterKey="skills" id="skills" index="04" label="Expertise" threadAnchor="skills" className={styles.skills}>
        <h2 id="skills-title" className={styles.displayMd}>Engineering Expertise</h2>
        <div className={styles.rails}>
          {layers.map((layer, i) => (
            <div key={layer.name} className={styles.rail} style={{ ['--rail-offset' as string]: `${i * 10}px` }}>
              <h3>{layer.name}</h3>
              <p>{layer.items.join('  /  ')}</p>
            </div>
          ))}
        </div>
        {tools && <p className={styles.tools}>{tools.title}: {tools.items.join('  ·  ')}</p>}
      </JourneyChapter>

      <div id="experience">
        {experience.map((item, index) => (
          <JourneyChapter
            key={`${item.organization}-${item.title}`}
            chapterKey={`experience-${index}` as JourneyChapterKey}
            index={`05.${String(index + 1).padStart(2, '0')}`}
            label="Experience"
            align={index % 2 === 0 ? 'right' : 'left'}
            className={styles.experience}
          >
            {index === 0 && <h2 id="experience-title" className="sr-only">Experience</h2>}
            <p className={styles.eyebrow}>{item.period}</p>
            <h3 className={styles.displayMd}>{item.title}</h3>
            <p className={styles.role}>
              {item.organization}
              {item.employmentType ? `  ·  ${item.employmentType}` : ''}
              {item.locationType ? `  ·  ${item.locationType}` : ''}
            </p>
            <p className={styles.lede}>{item.summary}</p>
          </JourneyChapter>
        ))}
      </div>

      <JourneyChapter chapterKey="about" id="about" index="06" label="About" align="left" className={styles.about}>
        <h2 id="about-title" className={`${styles.displayMd} ${styles.serif}`}>{profile.name}</h2>
        <p className={styles.eyebrow}>{profile.title}</p>
        {profile.about.map((paragraph) => (
          <p key={paragraph} className={styles.lede}>{paragraph}</p>
        ))}
        <p className={styles.tools}>{profile.location}</p>
      </JourneyChapter>

      <JourneyChapter chapterKey="contact" id="contact" index="07" label="Contact" align="center" threadAnchor="contact" className={styles.contact}>
        <h2 id="contact-title" className={`${styles.display} ${styles.serif}`}>{profile.contactLead}</h2>
        <p className={styles.lede}>{profile.contactSupport}</p>
        <a href={social.email.href} className={styles.email} data-thread-anchor="contact-email">
          {profile.email}
        </a>
        <div className={styles.actions}>
          {socialLinks.map((link) => (
            <a key={link.label} href={link.href} className={styles.textLink} {...(link.external ? linkProps : {})}>
              {link.label}
            </a>
          ))}
        </div>
        <footer className={styles.finale}>
          <p>{profile.location}</p>
          <p>&copy; {new Date().getFullYear()} {profile.name}</p>
          <a href="#hero" className={styles.textLink}>Back to top</a>
        </footer>
      </JourneyChapter>
    </div>
  )
}
