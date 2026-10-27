import { useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import {
  FaArrowLeft, FaArrowRight, FaArrowUpRightFromSquare, FaCalendarDays,
  FaCheck, FaFolderTree, FaGithub, FaLayerGroup, FaTag, FaUserGear,
} from 'react-icons/fa6';
import useTitle from '../hooks/useTitle';
import { usePortfolioContent } from '../content/PortfolioContentContext';
import PageHero from '../components/PageHero';
import Lightbox from '../components/Lightbox';
import Reveal from '../components/Reveal';
import { CtaBanner } from '../sections/Extras';
import { useLanguage } from '../i18n/LanguageContext';
import { localizeProjects } from '../i18n/localizeContent';

export default function ProjectDetails() {
  const { t, language, isRTL } = useLanguage();
  const { projects: rawProjects } = usePortfolioContent();
  const projects = useMemo(() => localizeProjects(language, rawProjects), [language, rawProjects]);
  const { slug } = useParams();
  const index = projects.findIndex((p) => p.slug === slug);
  const project = projects[index];
  const [lightbox, setLightbox] = useState(null);

  useTitle(project ? project.title : t('pages.details.notFound'));

  if (!project) return <Navigate to="/404" replace />;

  const allImages = [project.cover, ...project.gallery];
  const prev = projects[(index - 1 + projects.length) % projects.length];
  const next = projects[(index + 1) % projects.length];
  const PreviousIcon = isRTL ? FaArrowRight : FaArrowLeft;
  const NextIcon = isRTL ? FaArrowLeft : FaArrowRight;

  return (
    <>
      <PageHero
        eyebrow={t('pages.details.caseStudy', { category: project.categoryLabel || project.category })}
        title={project.title}
        sub={project.short}
      />

      <section className="section detail-section">
        <div className="container-x">
          <Reveal>
            <button type="button" className="detail-cover" onClick={() => setLightbox(0)} aria-label={t('pages.details.openCover', { title: project.title })}>
              <img src={project.cover} alt={t('pages.details.mainPreview', { title: project.title })} />
            </button>
          </Reveal>

          <div className="detail-grid">
            <Reveal>
              <div className="detail-main">
                <h2>{t('pages.details.overview')}</h2>
                <p>{project.overview}</p>
                {project.features?.length > 0 && (
                  <>
                    <h2>{t('pages.details.keyFeatures')}</h2>
                    <ul className="check-list">
                      {project.features.map((f) => (
                        <li key={f}><FaCheck /> {f}</li>
                      ))}
                    </ul>
                  </>
                )}

                {project.gallery?.length > 0 && (
                  <>
                    <h2>{t('pages.details.gallery')}</h2>
                    <div className="gallery-grid">
                      {project.gallery.map((img, i) => (
                        <button
                          key={`${img}-${i}`}
                          type="button"
                          className="thumb"
                          onClick={() => setLightbox(i + 1)}
                          aria-label={t('pages.details.openScreenshot', { index: i + 1, title: project.title })}
                        >
                          <img src={img} alt="" loading="lazy" decoding="async" />
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {project.structure && (
                  <details className="structure-box">
                    <summary><FaFolderTree /> {t('pages.details.fileStructure')}</summary>
                    <img src={project.structure} alt={t('pages.details.fileStructureAlt', { title: project.title })} loading="lazy" decoding="async" />
                  </details>
                )}
              </div>
            </Reveal>

            <Reveal delay={120}>
              <aside className="detail-side">
                <dl className="meta-list">
                  <div>
                    <dt><FaCalendarDays /> {t('pages.details.date')}</dt>
                    <dd>{project.date}</dd>
                  </div>
                  <div>
                    <dt><FaUserGear /> {t('pages.details.role')}</dt>
                    <dd>{project.role}</dd>
                  </div>
                  <div>
                    <dt><FaLayerGroup /> {t('pages.details.techStack')}</dt>
                    <dd>
                      <span className="chip-row">
                        {project.stack.map((s) => (
                          <span key={s} className="stack-chip">{s}</span>
                        ))}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt><FaTag /> {t('pages.details.tags')}</dt>
                    <dd>{project.tags.join(' · ')}</dd>
                  </div>
                </dl>

                <div className="detail-actions">
                  {project.live && (
                    <a href={project.live} target="_blank" rel="noreferrer" className="btn btn-primary">
                      {t('pages.details.visitLive')} <FaArrowUpRightFromSquare />
                    </a>
                  )}
                  {project.repo && (
                    <a href={project.repo} target="_blank" rel="noreferrer" className="btn btn-ghost">
                      <FaGithub /> {t('pages.details.viewGithub')}
                    </a>
                  )}
                  <Link to="/projects" className="text-link"><PreviousIcon /> {t('pages.details.allProjects')}</Link>
                </div>
              </aside>
            </Reveal>
          </div>

          <nav className="prev-next" aria-label={t('pages.details.moreProjects')}>
            <Link to={`/projects/${prev.slug}`} className="pn-card">
              <span><PreviousIcon /> {t('pages.details.previous')}</span>
              <strong>{prev.title}</strong>
            </Link>
            <Link to={`/projects/${next.slug}`} className="pn-card align-end">
              <span>{t('pages.details.next')} <NextIcon /></span>
              <strong>{next.title}</strong>
            </Link>
          </nav>
        </div>
      </section>

      <CtaBanner />
      <Lightbox
        images={allImages}
        index={lightbox}
        title={project.title}
        onClose={() => setLightbox(null)}
        onNavigate={setLightbox}
      />
    </>
  );
}
