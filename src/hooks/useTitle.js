import { useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

/** Sets a localized per-page document title (good for tabs, history & SEO tools). */
export default function useTitle(title) {
  const { t } = useLanguage();

  useEffect(() => {
    document.title = title
      ? `${title} — ${t('meta.titleSuffix')}`
      : t('meta.homeTitle');
  }, [t, title]);
}
