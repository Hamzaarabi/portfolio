import { Link } from 'react-router-dom';
import { FaArrowUp, FaEnvelope, FaLocationDot, FaPhone, FaWhatsapp } from 'react-icons/fa6';
import { navLinks } from '../data/portfolio';
import Socials from './Socials';
import Logo from '../assets/logo.webp';
import { useLanguage } from '../i18n/LanguageContext';
import { useLocalizedProfile } from '../i18n/localizeContent';

export default function Footer() {
  const { t } = useLanguage();
  const profile = useLocalizedProfile();
  const year = new Date().getFullYear();
  const expertiseItems = t('footer.expertiseItems');

  return (
    <footer className="footer">
      <div className="container-x">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="brand" aria-label={t('nav.brandHome')}>
              <img src={Logo} alt={t('nav.logoAlt')} className="brand-logo" />
              <span className="brand-text" dir="ltr">Hamza<em>.dev</em></span>
            </Link>
            <p>{profile.tagline}</p>
            <Socials />
          </div>

          <nav className="footer-col" aria-label={t('footer.explore')}>
            <h3>{t('footer.explore')}</h3>
            {navLinks.map((l) => (
              <Link key={l.to} to={l.to}>{t(`nav.${l.key}`)}</Link>
            ))}
          </nav>

          <div className="footer-col">
            <h3>{t('footer.expertise')}</h3>
            {expertiseItems.map((item) => <span key={item}>{item}</span>)}
          </div>

          <div className="footer-col">
            <h3>{t('footer.getInTouch')}</h3>
            <a href={`mailto:${profile.email}`} dir="ltr"><FaEnvelope /> {profile.email}</a>
            <a href={profile.whatsappLink} target="_blank" rel="noreferrer"><FaWhatsapp /> WhatsApp <span dir="ltr">{profile.whatsappDisplay}</span></a>
            <a href={`tel:${profile.phone}`} dir="ltr"><FaPhone /> {profile.phoneDisplay}</a>
            <span><FaLocationDot /> {profile.location} · {t('footer.remoteWorldwide')}</span>
            <button type="button" className="to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <FaArrowUp /> {t('common.backToTop')}
            </button>
          </div>
        </div>

        <div className="footer-bottom">
          <p>{t('footer.rights', { year, name: profile.fullName })}</p>
          <p className="footer-built">{t('footer.built')}</p>
        </div>
      </div>
    </footer>
  );
}
