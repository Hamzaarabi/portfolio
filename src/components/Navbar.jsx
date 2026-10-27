import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { FaBars, FaMoon, FaSun, FaXmark, FaArrowRight } from 'react-icons/fa6';
import { navLinks } from '../data/portfolio';
import Logo from '../assets/logo.webp';
import { useLanguage } from '../i18n/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar({ theme, onToggleTheme }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => { setOpen(false); }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container-x nav-inner">
        <Link to="/" className="brand" aria-label={t('nav.brandHome')}>
          <img src={Logo} alt={t('nav.logoAlt')} className="brand-logo" />
        </Link>

        <nav className="nav-links" aria-label={t('nav.primary')}>
          {navLinks.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              {t(`nav.${l.key}`)}
            </NavLink>
          ))}
        </nav>

        <div className="nav-actions">
          <LanguageSwitcher />
          <button
            type="button"
            className="icon-btn"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? t('nav.switchLight') : t('nav.switchDark')}
          >
            {theme === 'dark' ? <FaSun /> : <FaMoon />}
          </button>
          <Link to="/contact" className="btn btn-primary btn-sm nav-cta">
            {t('nav.hireMe')} <FaArrowRight className="directional-icon" />
          </Link>
          <button
            type="button"
            className="icon-btn menu-btn"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={open ? t('nav.closeMenu') : t('nav.openMenu')}
          >
            {open ? <FaXmark /> : <FaBars />}
          </button>
        </div>
      </div>

      <div className={`mobile-menu ${open ? 'open' : ''}`}>
        <nav aria-label={t('nav.mobile')}>
          {navLinks.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'} className={({ isActive }) => `mobile-link ${isActive ? 'active' : ''}`}>
              {t(`nav.${l.key}`)}
            </NavLink>
          ))}
          <Link to="/contact" className="btn btn-primary mobile-cta">{t('nav.hireMe')} <FaArrowRight className="directional-icon" /></Link>
        </nav>
      </div>
    </header>
  );
}
