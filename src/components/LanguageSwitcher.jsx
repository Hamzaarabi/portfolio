import { FaGlobe } from 'react-icons/fa6';
import { useLanguage } from '../i18n/LanguageContext';

export default function LanguageSwitcher({ className = '' }) {
  const { language, setLanguage, languages, t } = useLanguage();
  const label = t('nav.language');

  return (
    <label className={`language-switcher ${className}`} title={label}>
      <FaGlobe aria-hidden="true" />
      <span className="sr-only">{label}</span>
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value)}
        aria-label={label}
      >
        {languages.map((item) => (
          <option key={item.code} value={item.code} lang={item.code}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  );
}
