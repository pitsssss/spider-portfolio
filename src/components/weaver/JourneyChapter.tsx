'use client'

import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'
import type { JourneyChapterKey } from './chapterConfig'
import styles from './JourneyExperience.module.css'

type JourneyChapterProps = {
  chapterKey: JourneyChapterKey
  id?: string
  index: string
  label: string
  align?: 'left' | 'right' | 'center'
  threadAnchor?: string
  hideMeta?: boolean
  className?: string
  children: ReactNode
}

export default function JourneyChapter({
  chapterKey,
  id,
  index,
  label,
  align = 'left',
  threadAnchor,
  hideMeta = false,
  className = '',
  children,
}: JourneyChapterProps) {
  const reduce = useReducedMotion()

  return (
    <section
      id={id}
      data-journey-chapter={chapterKey}
      data-thread-anchor={threadAnchor ?? chapterKey}
      className={`${styles.chapter} ${styles[align]} ${className}`.trim()}
    >
      <motion.div
        className={styles.inner}
        initial={reduce ? false : { opacity: 0.15, y: 36 }}
        whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.35, margin: '-8% 0px -20% 0px' }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      >
        {!hideMeta && (
          <p className={styles.meta}>
            <span>{index}</span>
            <span className={styles.rule} aria-hidden="true" />
            <span>{label}</span>
          </p>
        )}
        <div className={styles.copy}>{children}</div>
      </motion.div>
    </section>
  )
}
