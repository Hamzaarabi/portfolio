import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { SUPPORTED_LANGUAGES, translations } from './translations';

export const LANGUAGE_STORAGE_KEY = 'hamza-portfolio-language-v1';

const LanguageContext = createContext(null);
const supportedCodes = new Set(SUPPORTED_LANGUAGES.map((language) => language.code));

function normalizeLanguage(value) {
  if (!value) return null;
  const code = String(value).toLowerCase().split('-')[0];
  return supportedCodes.has(code) ? code : null;
}

function getInitialLanguage() {
  if (typeof window === 'undefined') return 'en';

  try {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = normalizeLanguage(params.get('lang'));
    if (fromUrl) return fromUrl;

    const stored = normalizeLanguage(window.localStorage.getItem(LANGUAGE_STORAGE_KEY));
    if (stored) return stored;

    const browserLanguages = window.navigator.languages?.length
      ? window.navigator.languages
      : [window.navigator.language];
    for (const candidate of browserLanguages) {
      const normalized = normalizeLanguage(candidate);
      if (normalized) return normalized;
    }
  } catch {
    // Storage / URL access can be unavailable in privacy-restricted contexts.
  }

  return 'en';
}

function readTranslation(language, key) {
  return key.split('.').reduce((value, part) => {
    if (value && typeof value === 'object' && part in value) return value[part];
    return undefined;
  }, translations[language]);
}

function interpolate(template, replacements = {}) {
  if (typeof template !== 'string') return template;
  return template.replace(/\{(\w+)\}/g, (match, name) => (
    Object.prototype.hasOwnProperty.call(replacements, name)
      ? String(replacements[name])
      : match
  ));
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(getInitialLanguage);

  const currentLanguage = useMemo(
    () => SUPPORTED_LANGUAGES.find((item) => item.code === language) || SUPPORTED_LANGUAGES[0],
    [language]
  );
  const direction = currentLanguage.dir;
  const isRTL = direction === 'rtl';

  const setLanguage = useCallback((nextLanguage) => {
    const normalized = normalizeLanguage(nextLanguage);
    if (normalized) setLanguageState(normalized);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language === 'ar' ? 'ar-MA' : language;
    document.documentElement.dir = direction;
    document.documentElement.dataset.language = language;

    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // The selected language still applies for the current session.
    }
  }, [direction, language]);

  const t = useCallback((key, replacements) => {
    const localized = readTranslation(language, key);
    const fallback = localized === undefined ? readTranslation('en', key) : localized;
    return interpolate(fallback === undefined ? key : fallback, replacements);
  }, [language]);

  const value = useMemo(() => ({
    language,
    setLanguage,
    direction,
    isRTL,
    languages: SUPPORTED_LANGUAGES,
    currentLanguage,
    t,
  }), [currentLanguage, direction, isRTL, language, setLanguage, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider.');
  return context;
}
