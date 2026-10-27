import { useEffect, useRef, useState } from 'react';
import { usePortfolioContent } from '../content/PortfolioContentContext';
import SectionHeading from '../components/SectionHeading';
import Reveal from '../components/Reveal';

const levelLabel = (level) =>
  level >= 90 ? 'Expert' : level >= 75 ? 'Advanced' : level >= 55 ? 'Intermediate' : 'Familiar';

function SkillBar({ skill }) {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setWidth(skill.level);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [skill.level]);

  return (
    <div className="skill-row" ref={ref}>
      <div className="skill-info">
        <span className="skill-name">
          <skill.icon style={{ color: skill.color }} aria-hidden="true" />
          {skill.name}
        </span>
        <span className="skill-level">{levelLabel(skill.level)} · {skill.level}%</span>
      </div>
      <div className="skill-bar" role="progressbar" aria-valuenow={skill.level} aria-valuemin={0} aria-valuemax={100} aria-label={`${skill.name} proficiency`}>
        <span className="skill-fill" style={{ width: `${width}%`, background: `linear-gradient(90deg, ${skill.color}, var(--accent))` }} />
      </div>
    </div>
  );
}

export default function SkillsSection({ heading = true }) {
  const { skillGroups } = usePortfolioContent();
  return (
    <section className="section alt" id="skills">
      <div className="container-x">
        {heading && (
          <SectionHeading
            eyebrow="My stack"
            title="Skills & technologies"
            sub="The tools I reach for every day to design, build and ship complete web products."
          />
        )}
        <div className="skills-grid">
          {skillGroups.map((group, i) => (
            <Reveal key={group.title} delay={i * 100}>
              <div className="skill-group">
                <h3>{group.title}</h3>
                {group.skills.map((s) => (
                  <SkillBar key={s.name} skill={s} />
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
