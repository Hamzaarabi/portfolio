import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import {
  FaArrowLeft, FaArrowRight, FaArrowUpRightFromSquare, FaCalendarDays,
  FaCheck, FaFolderTree, FaGithub, FaLayerGroup, FaTag, FaUserGear,
} from 'react-icons/fa6';
import useTitle from '../hooks/useTitle';
import { projects } from '../data/portfolio';
import PageHero from '../components/PageHero';
import Lightbox from '../components/Lightbox';
import Reveal from '../components/Reveal';
import { CtaBanner } from '../sections/Extras';

export default function ProjectDetails() {
  const { slug } = useParams();
  const index = projects.findIndex((p) => p.slug === slug);
  const project = projects[index];
  const [lightbox, setLightbox] = useState(null);

  useTitle(project ? project.title : 'Project not found');

  if (!project) return <Navigate to="/404" replace />;

  const allImages = [project.cover, ...project.gallery];
  const prev = projects[(index - 1 + projects.length) % projects.length];
  const next = projects[(index + 1) % projects.length];

  return (
    <>
      <PageHero eyebrow={`Case study · ${project.category}`} title={project.title} sub={project.short} />

      <section className="section detail-section">
        <div className="container-x">
          <Reveal>
            <button type="button" className="detail-cover" onClick={() => setLightbox(0)} aria-label={`Open ${project.title} cover image`}>
              <img src={project.cover} alt={`${project.title} — main preview`} />
            </button>
          </Reveal>

          <div className="detail-grid">
            <Reveal>
              <div className="detail-main">
                <h2>Overview</h2>
                <p>{project.overview}</p>
                <h2>Key features</h2>
                <ul className="check-list">
                  {project.features.map((f) => (
                    <li key={f}><FaCheck /> {f}</li>
                  ))}
                </ul>

                <h2>Gallery</h2>
                <div className="gallery-grid">
                  {project.gallery.map((img, i) => (
                    <button
                      key={img}
                      type="button"
                      className="thumb"
                      onClick={() => setLightbox(i + 1)}
                      aria-label={`Open screenshot ${i + 1} of ${project.title}`}
                    >
                      <img src={img} alt="" loading="lazy" decoding="async" />
                    </button>
                  ))}
                </div>

                {project.structure && (
                  <details className="structure-box">
                    <summary><FaFolderTree /> Project file structure</summary>
                    <img src={project.structure} alt={`File structure of ${project.title}`} loading="lazy" decoding="async" />
                  </details>
                )}
              </div>
            </Reveal>

            <Reveal delay={120}>
              <aside className="detail-side">
                <dl className="meta-list">
                  <div>
                    <dt><FaCalendarDays /> Date</dt>
                    <dd>{project.date}</dd>
                  </div>
                  <div>
                    <dt><FaUserGear /> My role</dt>
                    <dd>{project.role}</dd>
                  </div>
                  <div>
                    <dt><FaLayerGroup /> Tech stack</dt>
                    <dd>
                      <span className="chip-row">
                        {project.stack.map((s) => (
                          <span key={s} className="stack-chip">{s}</span>
                        ))}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt><FaTag /> Tags</dt>
                    <dd>{project.tags.join(' · ')}</dd>
                  </div>
                </dl>

                <div className="detail-actions">
                  {project.live && (
                    <a href={project.live} target="_blank" rel="noreferrer" className="btn btn-primary">
                      Visit live site <FaArrowUpRightFromSquare />
                    </a>
                  )}
                  {project.repo && (
                    <a href={project.repo} target="_blank" rel="noreferrer" className="btn btn-ghost">
                      <FaGithub /> View on GitHub
                    </a>
                  )}
                  <Link to="/projects" className="text-link"><FaArrowLeft /> All projects</Link>
                </div>
              </aside>
            </Reveal>
          </div>

          <nav className="prev-next" aria-label="More projects">
            <Link to={`/projects/${prev.slug}`} className="pn-card">
              <span><FaArrowLeft /> Previous project</span>
              <strong>{prev.title}</strong>
            </Link>
            <Link to={`/projects/${next.slug}`} className="pn-card align-end">
              <span>Next project <FaArrowRight /></span>
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
