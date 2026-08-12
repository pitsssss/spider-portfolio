'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import WeaverJourney from './WeaverJourney'
import StoryThread from './StoryThread'
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

const CHAPTER_LABELS: Record<string, { num: string; name: string }> = {
  hero: { num: '00', name: 'Introduction' },
  process: { num: '01', name: 'Process' },
  'project-0': { num: '02', name: 'Selected Work' },
  skills: { num: '03', name: 'Expertise' },
  'experience-0': { num: '04', name: 'Experience' },
  about: { num: '05', name: 'About' },
  contact: { num: '06', name: 'Contact' },
}

export default function JourneyExperience() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [activeChapter, setActiveChapter] = useState<JourneyChapterKey>('hero')
  const reduce = useReducedMotion()

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReducedMotion(query.matches)
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])

  const onChapterChange = (key: JourneyChapterKey) => setActiveChapter(key)
  const chapterLabel = CHAPTER_LABELS[activeChapter] ?? CHAPTER_LABELS.hero

  return (
    <div
      ref={rootRef}
      className={reducedMotion ? `${styles.root} ${styles.static}` : styles.root}
      data-active-chapter={activeChapter}
      data-chapter-label={`${chapterLabel.num} ${chapterLabel.name}`}
    >
      <WeaverJourney rootRef={rootRef} reducedMotion={reducedMotion} onChapterChange={onChapterChange} />
      <StoryThread rootRef={rootRef} reducedMotion={reducedMotion} />

      <JourneyChapter chapterKey="hero" id="hero" index="00" label="Introduction" threadAnchor="hero" className={styles.hero}>
        <p className={styles.eyebrow}>{profile.positioning}</p>
        <p className={styles.name}>{profile.name}</p>
        <div className={styles.maskStack} aria-label={profile.heroMessage}>
          {['I engineer digital', 'products end to end.'].map((line) => (
            <div key={line} className={styles.lineMask}>
              <motion.h1
                className={styles.display}
                initial={reduce ? false : { y: '110%' }}
                whileInView={reduce ? undefined : { y: 0 }}
                viewport={{ once: true, amount: 0.8 }}
                transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              >
                {line}
              </motion.h1>
            </div>
          ))}
        </div>
        <p className={styles.lede}>{profile.heroSupporting}</p>
        <div className={styles.actions}>
          <a href={profile.primaryCta.href} className={styles.btnPrimary}>{profile.primaryCta.label}</a>
          <a href={profile.secondaryCta.href} className={styles.btnSecondary}>{profile.secondaryCta.label}</a>
        </div>
      </JourneyChapter>

      <JourneyChapter chapterKey="process" index="01" label="Process" align="right" threadAnchor="process" className={styles.process}>
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
            index={`02.${String(index + 1).padStart(2, '0')}`}
            label="Selected Work"
            align={index % 2 === 0 ? 'left' : 'right'}
            threadAnchor={`project-${index}`}
            className={styles.project}
          >
            {index === 0 && <h2 id="projects-title" className="sr-only">Selected Work</h2>}
            <div className={styles.projectLayout}>
              <div className={styles.projectCopy}>
                <p className={styles.eyebrow}>{project.category}</p>
                <h3 className={styles.displayMd}>{project.shortTitle ?? project.title}</h3>
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
                  initial={reduce ? false : { opacity: 0, scale: 0.96 }}
                  whileInView={reduce ? undefined : { opacity: 1, scale: 1 }}
                  viewport={{ once: false, amount: 0.45 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                  <img src={project.image} alt="" />
                </motion.div>
              )}
            </div>
          </JourneyChapter>
        ))}
      </div>

      <JourneyChapter chapterKey="skills" id="skills" index="03" label="Expertise" threadAnchor="skills" className={styles.skills}>
        <h2 id="skills-title" className={styles.displayMd}>Engineering Expertise</h2>
        <div className={styles.rails}>
          {layers.map((layer, i) => (
            <div key={layer.name} className={styles.rail} style={{ ['--rail-offset' as string]: `${i * 12}px` }}>
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
            index={`04.${String(index + 1).padStart(2, '0')}`}
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

      <JourneyChapter chapterKey="about" id="about" index="05" label="About" align="left" className={styles.about}>
        <h2 id="about-title" className={styles.displayMd}>{profile.name}</h2>
        <p className={styles.eyebrow}>{profile.title}</p>
        {profile.about.map((paragraph) => (
          <p key={paragraph} className={styles.lede}>{paragraph}</p>
        ))}
        <p className={styles.tools}>{profile.location}</p>
      </JourneyChapter>

      <JourneyChapter chapterKey="contact" id="contact" index="06" label="Contact" align="center" threadAnchor="contact" className={styles.contact}>
        <h2 id="contact-title" className={styles.display}>{profile.contactLead}</h2>
        <p className={styles.lede}>{profile.contactSupport}</p>
        <motion.a
          href={social.email.href}
          className={styles.email}
          data-thread-anchor="contact-email"
          whileHover={reduce ? undefined : { scale: 1.01 }}
          transition={{ duration: 0.25 }}
        >
          {profile.email}
        </motion.a>
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
