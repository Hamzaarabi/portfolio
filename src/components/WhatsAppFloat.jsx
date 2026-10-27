import { FaWhatsapp } from 'react-icons/fa6';
import { useLanguage } from '../i18n/LanguageContext';
import { useLocalizedProfile } from '../i18n/localizeContent';

/** Floating WhatsApp button — the fastest path from visitor to conversation. */
export default function WhatsAppFloat() {
  const { t } = useLanguage();
  const profile = useLocalizedProfile();

  return (
    <a
      href={profile.whatsappLink}
      target="_blank"
      rel="noreferrer"
      className="whatsapp-float"
      aria-label={`${t('common.chatWithMe')} — WhatsApp (${profile.whatsappDisplay})`}
    >
      <FaWhatsapp aria-hidden="true" />
      <span>{t('common.chatWithMe')}</span>
    </a>
  );
}
