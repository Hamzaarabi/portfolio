import { useMemo, useState } from 'react';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import { projects, projectFilters } from '../data/portfolio';
import SectionHeading from '../components/SectionHeading';
import ProjectCard from '../components/ProjectCard';
import Reveal from '../components/Reveal';

export default function ProjectsSection({ heading = true, withSearch = false }) {
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...projects]
      .sort((a, b) => b.year - a.year)
      .filter((p) => filter === 'All' || p.category === filter)
      .filter(
        (p) =>
          !q ||
          p.title.toLowerCase().includes(q) ||
          p.stack.some((s) => s.toLowerCase().includes(q)) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
  }, [filter, query]);

  return (
    <section className="section" id="projects">
      <div className="container-x">
        {heading && (
          <SectionHeading
            eyebrow="Selected work"
            title="Projects I'm proud of"
            sub="Real products for real clients — plus the personal projects that started it all. Open any case study for the full story and gallery."
          />
        )}

        <Reveal>
          <div className="filter-row">
            <div className="filter-group" role="group" aria-label="Filter projects by type">
              {projectFilters.map((f) => (
                <button
                  key={f}
                  type="button"
                  className={`filter-btn ${filter === f ? 'active' : ''}`}
                  aria-pressed={filter === f}
                  onClick={() => setFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
            {withSearch && (
              <label className="search-box">
                <FaMagnifyingGlass aria-hidden="true" />
                <span className="sr-only">Search projects by name or technology</span>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search React, Laravel…"
                />
              </label>
            )}
          </div>
        </Reveal>

        {visible.length === 0 ? (
          <p className="empty-state">No projects match your search yet — try another keyword or filter.</p>
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
