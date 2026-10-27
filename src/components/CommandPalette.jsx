import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaHouse, FaUser, FaBriefcase, FaCode, FaFolderOpen, FaEnvelope,
  FaDownload, FaCopy, FaCheck, FaGithub, FaLinkedin, FaMoon, FaSun, FaMagnifyingGlass, FaWhatsapp, FaGlobe,
} from 'react-icons/fa6';
import { useLanguage } from '../i18n/LanguageContext';
import { useLocalizedProfile } from '../i18n/localizeContent';

/** ⌘K / Ctrl+K quick-navigation palette. */
export default function CommandPalette({ open, onClose, theme, onToggleTheme }) {
  const { t, languages, setLanguage } = useLanguage();
  const profile = useLocalizedProfile();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);

  const actions = useMemo(
    () => [
      { id: 'home', label: t('palette.goTo', { page: t('nav.home') }), icon: FaHouse, run: () => navigate('/') },
      { id: 'about', label: t('palette.goTo', { page: t('nav.about') }), icon: FaUser, run: () => navigate('/about') },
      { id: 'services', label: t('palette.goTo', { page: t('nav.services') }), icon: FaBriefcase, run: () => navigate('/services') },
      { id: 'skills', label: t('palette.goTo', { page: t('nav.skills') }), icon: FaCode, run: () => navigate('/skills') },
      { id: 'projects', label: t('palette.goTo', { page: t('nav.projects') }), icon: FaFolderOpen, run: () => navigate('/projects') },
      { id: 'contact', label: t('palette.goTo', { page: t('nav.contact') }), icon: FaEnvelope, run: () => navigate('/contact') },
      { id: 'whatsapp', label: t('palette.chatWhatsApp', { number: profile.whatsappDisplay }), icon: FaWhatsapp, run: () => window.open(profile.whatsappLink, '_blank') },
      { id: 'cv', label: t('palette.downloadCvPdf'), icon: FaDownload, run: () => window.open(profile.cv, '_blank') },
      {
        id: 'copy-email',
        label: copied ? t('palette.emailCopied') : t('palette.copyEmail', { email: profile.email }),
        icon: copied ? FaCheck : FaCopy,
        keepOpen: true,
        run: async () => {
          try { await navigator.clipboard.writeText(profile.email); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch { /* clipboard unavailable */ }
        },
      },
      { id: 'github', label: t('palette.openGithub'), icon: FaGithub, run: () => window.open('https://github.com/Hamzaarabi', '_blank') },
      { id: 'linkedin', label: t('palette.openLinkedin'), icon: FaLinkedin, run: () => window.open('https://www.linkedin.com/in/hamza-arabi/', '_blank') },
      ...languages.map((item) => ({
        id: `language-${item.code}`,
        label: t('palette.language', { language: item.label }),
        icon: FaGlobe,
        run: () => setLanguage(item.code),
      })),
      { id: 'theme', label: theme === 'dark' ? t('palette.switchLight') : t('palette.switchDark'), icon: theme === 'dark' ? FaSun : FaMoon, run: onToggleTheme },
    ],
    [copied, languages, navigate, onToggleTheme, profile, setLanguage, t, theme]
  );

  const filtered = actions.filter((a) => a.label.toLowerCase().includes(query.trim().toLowerCase()));

  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => { setActive(0); }, [query]);

  if (!open) return null;

  const runAction = (action) => {
    action.run();
    if (!action.keepOpen) onClose();
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, filtered.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    if (e.key === 'Enter' && filtered[active]) runAction(filtered[active]);
    if (e.key === 'Escape') onClose();
  };

  return (
    <div className="palette-overlay" onClick={onClose} role="presentation">
      <div
        className="palette"
        role="dialog"
        aria-modal="true"
        aria-label={t('palette.dialog')}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <div className="palette-search">
          <FaMagnifyingGlass aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('palette.searchPlaceholder')}
            aria-label={t('palette.searchLabel')}
          />
          <kbd>esc</kbd>
        </div>
        <ul className="palette-list" role="listbox" aria-label={t('palette.actions')}>
          {filtered.length === 0 && <li className="palette-empty">{t('palette.noResults', { query })}</li>}
          {filtered.map((a, i) => (
            <li key={a.id}>
              <button
                type="button"
                className={`palette-item ${i === active ? 'active' : ''}`}
                onMouseEnter={() => setActive(i)}
                onClick={() => runAction(a)}
              >
                <a.icon aria-hidden="true" />
                <span>{a.label}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="palette-foot">
          <span><kbd>↑↓</kbd> {t('palette.navigate')}</span>
          <span><kbd>↵</kbd> {t('palette.select')}</span>
          <span><kbd>esc</kbd> {t('palette.close')}</span>
        </div>
      </div>
    </div>
  );
}
