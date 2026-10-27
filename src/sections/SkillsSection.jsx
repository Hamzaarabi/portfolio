import { useEffect, useRef, useState } from 'react';
import { usePortfolioContent } from '../content/PortfolioContentContext';
import SectionHeading from '../components/SectionHeading';
import Reveal from '../components/Reveal';
import { useLanguage } from '../i18n/LanguageContext';
import { localizeSkillGroups } from '../i18n/localizeContent';

function SkillBar({ skill }) {
  const { t } = useLanguage();
  const ref = useRef(null);
  const [width, setWidth] = useState(0);
  const levelLabel = skill.level >= 90
    ? t('skills.expert')
    : skill.level >= 75
      ? t('skills.advanced')
      : skill.level >= 55
        ? t('skills.intermediate')
        : t('skills.familiar');

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
        <span className="skill-level">{levelLabel} · {skill.level}%</span>
      </div>
      <div className="skill-bar" role="progressbar" aria-valuenow={skill.level} aria-valuemin={0} aria-valuemax={100} aria-label={t('skills.proficiency', { name: skill.name })}>
        <span className="skill-fill" style={{ width: `${width}%`, background: `linear-gradient(90deg, ${skill.color}, var(--accent))` }} />
      </div>
    </div>
  );
}

export default function SkillsSection({ heading = true }) {
  const { t, language } = useLanguage();
  const { skillGroups: rawSkillGroups } = usePortfolioContent();
  const skillGroups = localizeSkillGroups(language, rawSkillGroups);

  return (
    <section className="section alt" id="skills">
      <div className="container-x">
        {heading && (
          <SectionHeading
            eyebrow={t('sections.skills.eyebrow')}
            title={t('sections.skills.title')}
            sub={t('sections.skills.sub')}
          />
        )}
        <div className="skills-grid">
          {skillGroups.map((group, i) => (
            <Reveal key={group.canonicalTitle || group.title} delay={i * 100}>
              <div className="skill-group">
                <h3>{group.title}</h3>
                {group.skills.map((s) => (
                  <SkillBar key={s.id || s.name} skill={s} />
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
