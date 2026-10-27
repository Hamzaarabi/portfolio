import { FaAward, FaBuilding, FaCloud, FaDatabase, FaFileLines, FaGear, FaGitAlt, FaMagnifyingGlassChart, FaPalette } from 'react-icons/fa6';
import useTitle from '../hooks/useTitle';
import { certifications } from '../data/portfolio';
import PageHero from '../components/PageHero';
import SectionHeading from '../components/SectionHeading';
import Reveal from '../components/Reveal';
import SkillsSection from '../sections/SkillsSection';
import { TraitsSection, CtaBanner } from '../sections/Extras';
import { useLanguage } from '../i18n/LanguageContext';

const additionalIcons = [FaGitAlt, FaGear, FaCloud, FaFileLines, FaPalette, FaMagnifyingGlassChart, FaDatabase, FaBuilding];

export default function Skills() {
  const { t } = useLanguage();
  useTitle(t('pages.skills.title'));
  const additional = t('pages.skills.additional').map((item, index) => ({
    ...item,
    icon: additionalIcons[index],
  }));

  return (
    <>
      <PageHero
        eyebrow={t('pages.skills.eyebrow')}
        title={t('pages.skills.heroTitle')}
        sub={t('pages.skills.heroSub')}
      />
      <SkillsSection heading={false} />

      <section className="section">
        <div className="container-x">
          <SectionHeading eyebrow={t('pages.skills.additionalEyebrow')} title={t('pages.skills.additionalTitle')} />
          <div className="services-grid">
            {additional.map((a, i) => (
              <Reveal key={a.title} delay={(i % 3) * 90}>
                <article className="service-card">
                  <span className="service-icon"><a.icon /></span>
                  <h3>{a.title}</h3>
                  <p>{a.desc}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container-x">
          <SectionHeading
            eyebrow={t('pages.skills.certificationsEyebrow')}
            title={t('pages.skills.certificationsTitle')}
            sub={t('pages.skills.certificationsSub')}
          />
          <div className="cert-row">
            {certifications.map((c) => (
              <Reveal key={c}>
                <div className="cert-card">
                  <FaAward aria-hidden="true" />
                  <span>{c}</span>
                  <small>{t('pages.skills.certified')}</small>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <TraitsSection />
      <CtaBanner />
    </>
  );
}
