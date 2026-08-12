'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import MacbookJourney from '../macbook/MacbookJourney'
import { useJourneySmoothScroll } from '../macbook/useJourneySmoothScroll'
import { getViewportTier, type ViewportTier } from '../macbook/macbookCore'
import JourneyChapter from './JourneyChapter'
import type { JourneyChapterKey } from './chapterConfig'
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
  const [reducedMotion, setReducedMotion] = useState(false)
  const [activeChapter, setActiveChapter] = useState<JourneyChapterKey>('hero')
  const [viewportTier, setViewportTier] = useState<ViewportTier>('desktop')
  const reduce = useReducedMotion()

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReducedMotion(query.matches)
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    const sync = () => setViewportTier(getViewportTier())
    sync()
    window.addEventListener('resize', sync)
    return () => window.removeEventListener('resize', sync)
  }, [])

  const onChapterChange = (key: JourneyChapterKey) => setActiveChapter(key)

  const smoothScrollEnabled = !reducedMotion && !reduce && viewportTier !== 'mobile'

  useJourneySmoothScroll({ enabled: smoothScrollEnabled })

  return (
    <div
      ref={rootRef}
      className={[styles.root, reducedMotion ? styles.static : '', styles.headlineReady].join(' ')}
      data-active-chapter={activeChapter}
    >
      <div className={styles.atmosphere} aria-hidden="true" />
      <MacbookJourney
        rootRef={rootRef}
        reducedMotion={reducedMotion}
        onChapterChange={onChapterChange}
      />

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
          <h1 id="hero-title" className={styles.heroTitle}>
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
          <a href={profile.primaryCta.href} className={styles.cta}>
            {profile.primaryCta.label}
          </a>
        </div>
      </JourneyChapter>

      <JourneyChapter chapterKey="process" index="02" label="Process" align="right" className={styles.process}>
        <div className={styles.copyShieldRight}>
          <h2 className={styles.displayMd}>From Complexity to Clarity</h2>
          <ul className={styles.milestones}>
            {(architecture?.items ?? []).map((item, i) => (
              <li key={item}>
                <span className={styles.milestoneIndex}>0{i + 1}</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </JourneyChapter>

      <div id="projects">
        {featuredProjects.map((project, index) => (
          <JourneyChapter
            key={project.slug}
            chapterKey={`project-${index}` as JourneyChapterKey}
            index={`03.${String(index + 1).padStart(2, '0')}`}
            label="Selected Work"
            align={index % 2 === 0 ? 'left' : 'right'}
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

      <JourneyChapter chapterKey="skills" id="skills" index="04" label="Expertise" className={styles.skills}>
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
            <div className={index % 2 === 0 ? styles.copyShieldRight : undefined}>
              <p className={styles.eyebrow}>{item.period}</p>
              <h3 className={styles.displayMd}>{item.title}</h3>
              <p className={styles.role}>
                {item.organization}
                {item.employmentType ? `  ·  ${item.employmentType}` : ''}
                {item.locationType ? `  ·  ${item.locationType}` : ''}
              </p>
              <p className={styles.lede}>{item.summary}</p>
            </div>
          </JourneyChapter>
        ))}
      </div>

      <JourneyChapter chapterKey="about" id="about" index="06" label="About" align="left" className={styles.about}>
        <div className={styles.copyShieldLeft}>
          <h2 id="about-title" className={`${styles.displayMd} ${styles.serif}`}>{profile.name}</h2>
          <p className={styles.eyebrow}>{profile.title}</p>
          {profile.about.map((paragraph) => (
            <p key={paragraph} className={styles.lede}>{paragraph}</p>
          ))}
          <p className={styles.tools}>{profile.location}</p>
        </div>
      </JourneyChapter>

      <JourneyChapter chapterKey="contact" id="contact" index="07" label="Contact" align="center" className={styles.contact}>
        <div className={styles.contactCopy}>
          <h2 id="contact-title" className={`${styles.display} ${styles.serif}`}>{profile.contactLead}</h2>
          <p className={styles.lede}>{profile.contactSupport}</p>
          <a href={social.email.href} className={styles.email}>
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
        </div>
      </JourneyChapter>
    </div>
  )
}
