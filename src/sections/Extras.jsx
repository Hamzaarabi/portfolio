import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaBriefcase, FaChevronDown, FaDownload, FaRocket, FaScrewdriverWrench, FaWhatsapp } from 'react-icons/fa6';
import SectionHeading from '../components/SectionHeading';
import Reveal from '../components/Reveal';
import { useLanguage } from '../i18n/LanguageContext';
import {
  localizeFaqs,
  localizeProcess,
  localizeTraits,
  useLocalizedProfile,
} from '../i18n/localizeContent';

export function TraitsSection() {
  const { t, language } = useLanguage();
  const traits = localizeTraits(language);

  return (
    <section className="section" id="why-me">
      <div className="container-x">
        <SectionHeading
          eyebrow={t('sections.traits.eyebrow')}
          title={t('sections.traits.title')}
          sub={t('sections.traits.sub')}
        />
        <div className="traits-grid">
          {traits.map((trait, i) => (
            <Reveal key={trait.title} delay={i * 80}>
              <article className="trait-card">
                <span className="service-icon"><trait.icon /></span>
                <h3>{trait.title}</h3>
                <p>{trait.desc}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProcessSection() {
  const { t, language } = useLanguage();
  const process = localizeProcess(language);

  return (
    <section className="section" id="process">
      <div className="container-x">
        <SectionHeading
          eyebrow={t('sections.process.eyebrow')}
          title={t('sections.process.title')}
          sub={t('sections.process.sub')}
        />
        <div className="process-grid">
          {process.map((step, i) => (
            <Reveal key={step.step} delay={i * 90}>
              <article className="process-card">
                <span className="step-num">{step.step}</span>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FaqSection() {
  const { t, language } = useLanguage();
  const faqs = localizeFaqs(language);
  const [open, setOpen] = useState(0);

  return (
    <section className="section alt" id="faq">
      <div className="container-x narrow">
        <SectionHeading eyebrow={t('sections.faq.eyebrow')} title={t('sections.faq.title')} />
        <div className="faq-list">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={f.q} delay={i * 50}>
                <div className={`faq-item ${isOpen ? 'open' : ''}`}>
                  <button
                    type="button"
                    className="faq-q"
                    aria-expanded={isOpen}
                    aria-controls={`faq-a-${i}`}
                    onClick={() => setOpen(isOpen ? -1 : i)}
                  >
                    <span>{f.q}</span>
                    <FaChevronDown aria-hidden="true" />
                  </button>
                  <div className="faq-a" id={`faq-a-${i}`} hidden={!isOpen}>
                    <p>{f.a}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function WorkWithMeSection() {
  const { t } = useLanguage();
  const profile = useLocalizedProfile();
  const cardText = t('extras.workCards');
  const icons = [FaRocket, FaBriefcase, FaScrewdriverWrench];
  const ways = cardText.map((card, index) => ({
    ...card,
    icon: icons[index],
    href: index === 0 ? profile.whatsappLink : index === 1 ? profile.cv : '/contact',
    external: index === 0,
    download: index === 1,
  }));

  return (
    <section className="section alt" id="work-with-me">
      <div className="container-x">
        <SectionHeading
          eyebrow={t('sections.work.eyebrow')}
          title={t('sections.work.title')}
          sub={t('sections.work.sub')}
        />
        <div className="services-grid">
          {ways.map((way, i) => (
            <Reveal key={way.title} delay={i * 90}>
              <article className="service-card work-card">
                <span className="service-icon"><way.icon /></span>
                <h3>{way.title}</h3>
                <p>{way.desc}</p>
                {way.external ? (
                  <a className="text-link work-card-link" href={way.href} target="_blank" rel="noreferrer">
                    <FaWhatsapp /> {way.cta}
                  </a>
                ) : way.download ? (
                  <a className="text-link work-card-link" href={way.href} download="Hamza-CV.pdf">
                    <FaDownload /> {way.cta}
                  </a>
                ) : (
                  <Link className="text-link work-card-link" to={way.href}>
                    {way.cta} <FaArrowRight className="directional-icon" />
                  </Link>
                )}
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CtaBanner() {
  const { t } = useLanguage();
  const profile = useLocalizedProfile();
  const titleLines = t('extras.ctaTitle').split('\n');

  return (
    <section className="section cta-section">
      <div className="container-x">
        <Reveal>
          <div className="cta-banner">
            <div className="aurora" aria-hidden="true"><span className="blob b1" /><span className="blob b2" /></div>
            <h2>
              {titleLines.map((line, index) => (
                <span key={line}>
                  {line}
                  {index < titleLines.length - 1 && <br />}
                </span>
              ))}
            </h2>
            <p>{t('extras.ctaText')}</p>
            <div className="hero-cta center">
              <a href={profile.whatsappLink} target="_blank" rel="noreferrer" className="btn btn-primary">
                <FaWhatsapp /> {t('common.chatOnWhatsApp')}
              </a>
              <Link to="/contact" className="btn btn-ghost light">{t('extras.startConversation')} <FaArrowRight className="directional-icon" /></Link>
              <a href={profile.cv} download="Hamza-CV.pdf" className="btn btn-ghost light">
                <FaDownload /> {t('common.downloadCv')}
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
