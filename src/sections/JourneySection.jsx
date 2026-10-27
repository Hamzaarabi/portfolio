import { FaBriefcase, FaGraduationCap } from 'react-icons/fa6';
import { usePortfolioContent } from '../content/PortfolioContentContext';
import SectionHeading from '../components/SectionHeading';
import Reveal from '../components/Reveal';
import { useLanguage } from '../i18n/LanguageContext';
import { localizeEducation, localizeExperience } from '../i18n/localizeContent';

export function Timeline({ items, icon: Icon, heading }) {
  return (
    <div className="timeline-wrap">
      <h3 className="timeline-heading"><Icon /> {heading}</h3>
      <ol className="timeline">
        {items.map((item, i) => (
          <Reveal key={`${item.period}-${item.title}`} delay={i * 80}>
            <li className="tl-item">
              <span className="tl-dot" aria-hidden="true" />
              <div className="tl-card">
                <span className="tl-period">{item.period}</span>
                <h4>{item.title}</h4>
                <p className="tl-org">{item.org}</p>
                <ul>
                  {item.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            </li>
          </Reveal>
        ))}
      </ol>
    </div>
  );
}

export default function JourneySection() {
  const { t, language } = useLanguage();
  const { experience: rawExperience } = usePortfolioContent();
  const experience = localizeExperience(language, rawExperience);
  const education = localizeEducation(language);

  return (
    <section className="section" id="journey">
      <div className="container-x">
        <SectionHeading
          eyebrow={t('sections.journey.eyebrow')}
          title={t('sections.journey.title')}
          sub={t('sections.journey.sub')}
        />
        <div className="journey-grid">
          <Timeline items={experience} icon={FaBriefcase} heading={t('sections.journey.experience')} />
          <Timeline items={education} icon={FaGraduationCap} heading={t('sections.journey.education')} />
        </div>
      </div>
    </section>
  );
}
