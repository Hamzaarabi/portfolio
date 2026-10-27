import { FaBriefcase, FaCheck, FaDownload, FaLanguage, FaLocationDot, FaEnvelope, FaPhone } from 'react-icons/fa6';
import useTitle from '../hooks/useTitle';
import PageHero from '../components/PageHero';
import Socials from '../components/Socials';
import Reveal from '../components/Reveal';
import JourneySection from '../sections/JourneySection';
import { TraitsSection, CtaBanner } from '../sections/Extras';
import { useLanguage } from '../i18n/LanguageContext';
import { useLocalizedProfile } from '../i18n/localizeContent';

export default function About() {
  const { t } = useLanguage();
  const profile = useLocalizedProfile();
  useTitle(t('pages.about.title'));

  return (
    <>
      <PageHero
        eyebrow={t('pages.about.eyebrow')}
        title={t('pages.about.heroTitle')}
        sub={t('pages.about.heroSub')}
      />

      <section className="section">
        <div className="container-x">
          <div className="about-grid">
            <Reveal>
              <aside className="profile-card">
                <div className="avatar" aria-hidden="true">HA</div>
                <h3>{profile.fullName}</h3>
                <p className="profile-role">{profile.role}</p>
                <ul className="fact-list">
                  <li><FaLocationDot /> {profile.location}</li>
                  <li><FaBriefcase /> {profile.currentRole}</li>
                  <li><FaLanguage /> {profile.languages.join(' · ')}</li>
                  <li><FaEnvelope /> <span dir="ltr">{profile.email}</span></li>
                  <li><FaPhone /> <span dir="ltr">{profile.phoneDisplay}</span></li>
                </ul>
                <Socials />
                <a href={profile.cv} download="Hamza-CV.pdf" className="btn btn-primary profile-cv">
                  <FaDownload /> {t('common.downloadCv')}
                </a>
              </aside>
            </Reveal>

            <Reveal delay={120}>
              <div className="about-copy">
                <h2 className="about-title">{t('pages.about.story')}</h2>
                {profile.about.map((p) => (
                  <p key={p.slice(0, 24)}>{p}</p>
                ))}
                <h3 className="about-subtitle">{t('pages.about.brings')}</h3>
                <ul className="check-list">
                  {profile.highlights.map((h) => (
                    <li key={h}><FaCheck /> {h}</li>
                  ))}
                </ul>
                <h3 className="about-subtitle">{t('pages.about.languages')}</h3>
                <div className="chip-row">
                  {profile.languages.map((language) => (
                    <span key={language} className="stack-chip big">{language}</span>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <JourneySection />
      <TraitsSection />
      <CtaBanner />
    </>
  );
}
