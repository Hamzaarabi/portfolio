import { Link } from 'react-router-dom';
import { FaArrowRight, FaBriefcase, FaCheck, FaDownload, FaLanguage, FaLocationDot } from 'react-icons/fa6';
import SectionHeading from '../components/SectionHeading';
import Socials from '../components/Socials';
import Reveal from '../components/Reveal';
import { useLanguage } from '../i18n/LanguageContext';
import { useLocalizedProfile } from '../i18n/localizeContent';

export default function AboutSection() {
  const { t } = useLanguage();
  const profile = useLocalizedProfile();

  return (
    <section className="section" id="about">
      <div className="container-x">
        <SectionHeading eyebrow={t('aboutSection.eyebrow')} title={t('aboutSection.title')} />
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
              </ul>
              <Socials />
              <a href={profile.cv} download="Hamza-CV.pdf" className="btn btn-primary profile-cv">
                <FaDownload /> {t('common.downloadCv')}
              </a>
            </aside>
          </Reveal>

          <Reveal delay={120}>
            <div className="about-copy">
              {profile.about.slice(0, 2).map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
              <ul className="check-list">
                {profile.highlights.map((h) => (
                  <li key={h}><FaCheck /> {h}</li>
                ))}
              </ul>
              <Link to="/about" className="text-link big">
                {t('aboutSection.more')} <FaArrowRight className="directional-icon" />
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
