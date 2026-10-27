import { FaCheck } from 'react-icons/fa6';
import SectionHeading from '../components/SectionHeading';
import Reveal from '../components/Reveal';
import { useLanguage } from '../i18n/LanguageContext';
import { localizeServices } from '../i18n/localizeContent';

export default function ServicesSection({ detailed = false, heading = true }) {
  const { t, language } = useLanguage();
  const services = localizeServices(language);

  return (
    <section className="section alt" id="services">
      <div className="container-x">
        {heading && (
          <SectionHeading
            eyebrow={t('sections.services.eyebrow')}
            title={t('sections.services.title')}
            sub={t('sections.services.sub')}
          />
        )}
        <div className="services-grid">
          {services.map((s, i) => (
            <Reveal key={s.title} delay={(i % 3) * 90}>
              <article className="service-card">
                <span className="service-num" aria-hidden="true">0{i + 1}</span>
                <span className="service-icon"><s.icon /></span>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                {detailed && (
                  <ul className="check-list compact">
                    {s.points.map((p) => (
                      <li key={p}><FaCheck /> {p}</li>
                    ))}
                  </ul>
                )}
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
