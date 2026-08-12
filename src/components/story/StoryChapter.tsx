import type { ReactNode } from 'react'

type Align = 'left' | 'right' | 'center'

type StoryChapterProps = {
  id?: string
  index: string
  label: string
  coord: string
  align?: Align
  className?: string
  children: ReactNode
}

export default function StoryChapter({
  id,
  index,
  label,
  coord,
  align = 'left',
  className = '',
  children,
}: StoryChapterProps) {
  return (
    <section
      id={id}
      className={`chapter chapter-${align} ${className}`.trim()}
      data-chapter
      aria-labelledby={id ? `${id}-title` : undefined}
    >
      <div className="chapter-frame">
        <p className="chapter-meta">
          <span>{index}</span>
          <span className="chapter-rule" aria-hidden="true" />
          <span>{label}</span>
          <span className="chapter-coord">{coord}</span>
        </p>
        <div className="chapter-copy">{children}</div>
      </div>
    </section>
  )
}
