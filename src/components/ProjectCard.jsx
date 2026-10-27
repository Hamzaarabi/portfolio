import { Link } from 'react-router-dom';
import { FaArrowRight, FaArrowUpRightFromSquare, FaGithub } from 'react-icons/fa6';
import { useLanguage } from '../i18n/LanguageContext';
import { localizeCategory } from '../i18n/localizeContent';

export default function ProjectCard({ project }) {
  const { t, language } = useLanguage();
  const category = project.categoryLabel || localizeCategory(language, project.category);

  return (
    <article className="project-card">
      <Link to={`/projects/${project.slug}`} className="project-media" aria-label={t('projects.viewCaseStudy', { title: project.title })}>
        <img src={project.cover} alt={t('projects.preview', { title: project.title })} loading="lazy" decoding="async" />
        <span className="project-cat">{category}</span>
        <span className="project-view">{t('projects.view')} <FaArrowRight className="directional-icon" /></span>
      </Link>
      <div className="project-body">
        <div className="project-meta">
          <span>{project.year}</span>
          <span aria-hidden="true">·</span>
          <span>{project.role}</span>
        </div>
        <h3>
          <Link to={`/projects/${project.slug}`}>{project.title}</Link>
        </h3>
        <p>{project.short}</p>
        <ul className="stack-row" aria-label={t('projects.technologiesUsed')}>
          {project.stack.slice(0, 4).map((s) => (
            <li key={s} className="stack-chip">{s}</li>
          ))}
          {project.stack.length > 4 && <li className="stack-chip more">+{project.stack.length - 4}</li>}
        </ul>
        <div className="project-actions">
          <Link to={`/projects/${project.slug}`} className="text-link">
            {t('projects.caseStudy')} <FaArrowRight className="directional-icon" />
          </Link>
          <span className="project-ext">
            {project.live && (
              <a href={project.live} target="_blank" rel="noreferrer" aria-label={t('projects.visitLive', { title: project.title })}>
                <FaArrowUpRightFromSquare />
              </a>
            )}
            {project.repo && (
              <a href={project.repo} target="_blank" rel="noreferrer" aria-label={t('projects.viewGithub', { title: project.title })}>
                <FaGithub />
              </a>
            )}
          </span>
        </div>
      </div>
    </article>
  );
}
