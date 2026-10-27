import { FaGithub, FaLinkedin, FaEnvelope, FaWhatsapp } from 'react-icons/fa6';
import { useLanguage } from '../i18n/LanguageContext';
import { useLocalizedProfile } from '../i18n/localizeContent';

export default function Socials({ className = '' }) {
  const { t } = useLanguage();
  const profile = useLocalizedProfile();

  return (
    <div className={`socials ${className}`}>
      <a href="https://github.com/Hamzaarabi" target="_blank" rel="noreferrer" aria-label={t('socials.github', { name: profile.fullName })} className="social-btn">
        <FaGithub />
      </a>
      <a href="https://www.linkedin.com/in/hamza-arabi/" target="_blank" rel="noreferrer" aria-label={t('socials.linkedin', { name: profile.fullName })} className="social-btn">
        <FaLinkedin />
      </a>
      <a href={profile.whatsappLink} target="_blank" rel="noreferrer" aria-label={t('socials.whatsapp', { name: profile.fullName })} className="social-btn">
        <FaWhatsapp />
      </a>
      <a href={`mailto:${profile.email}`} aria-label={t('socials.email', { name: profile.fullName })} className="social-btn">
        <FaEnvelope />
      </a>
    </div>
  );
}
