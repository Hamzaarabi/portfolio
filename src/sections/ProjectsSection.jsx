import { useMemo, useState } from 'react';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import { projectFilters } from '../data/portfolio';
import { usePortfolioContent } from '../content/PortfolioContentContext';
import SectionHeading from '../components/SectionHeading';
import ProjectCard from '../components/ProjectCard';
import Reveal from '../components/Reveal';
import { useLanguage } from '../i18n/LanguageContext';
import { localizeProjectFilter, localizeProjects } from '../i18n/localizeContent';

export default function ProjectsSection({ heading = true, withSearch = false }) {
  const { t, language } = useLanguage();
  const { projects: rawProjects } = usePortfolioContent();
  const projects = useMemo(() => localizeProjects(language, rawProjects), [language, rawProjects]);
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...projects]
      .sort((a, b) => b.year - a.year)
      .filter((p) => filter === 'All' || p.category === filter)
      .filter((p) => !q || (p.searchText || '').includes(q));
  }, [filter, query, projects]);

  return (
    <section className="section" id="projects">
      <div className="container-x">
        {heading && (
          <SectionHeading
            eyebrow={t('sections.projects.eyebrow')}
            title={t('sections.projects.title')}
            sub={t('sections.projects.sub')}
          />
        )}

        <Reveal>
          <div className="filter-row">
            <div className="filter-group" role="group" aria-label={t('projects.filterByType')}>
              {projectFilters.map((f) => (
                <button
                  key={f}
                  type="button"
                  className={`filter-btn ${filter === f ? 'active' : ''}`}
                  aria-pressed={filter === f}
                  onClick={() => setFilter(f)}
                >
                  {localizeProjectFilter(language, f)}
                </button>
              ))}
            </div>
            {withSearch && (
              <label className="search-box">
                <FaMagnifyingGlass aria-hidden="true" />
                <span className="sr-only">{t('projects.searchLabel')}</span>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('projects.searchPlaceholder')}
                />
              </label>
            )}
          </div>
        </Reveal>

        {visible.length === 0 ? (
          <p className="empty-state">{t('projects.empty')}</p>
        ) : (
          <div className="projects-grid">
            {visible.map((p, i) => (
              <Reveal key={p.slug} delay={(i % 3) * 90}>
                <ProjectCard project={p} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
