import { featuredProjects } from '@/content/projects'
import type { Project } from '@/content/types'

function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="glass glass-hover reveal project-card">
      {project.image && (
        <div className="project-media" aria-hidden="true">
          <img src={project.image} alt="" />
        </div>
      )}
      <div className="project-body">
        <p className="project-category">{project.category}</p>
        <h3>{project.title}</h3>
        <p className="project-role">{project.role}</p>
        <p className="project-summary">{project.summary}</p>
        <ul className="project-highlights">
          {project.highlights.slice(0, 3).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <div className="project-stack">
          {project.stack.map((tech) => (
            <span key={tech}>{tech}</span>
          ))}
        </div>
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            className="project-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            View live site
          </a>
        )}
      </div>
    </article>
  )
}

export default function ProjectsSection() {
  return (
    <section id="projects" className="section" aria-labelledby="projects-h">
      <div className="container-main">
        <div className="section-header reveal">
          <p className="section-label">Selected Work</p>
          <h2 id="projects-h" className="section-title">FEATURED <span>PROJECTS</span></h2>
          <div className="section-divider"><div className="section-dot" /></div>
        </div>
        <div className="project-grid">
          {featuredProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </div>
    </section>
  )
}
