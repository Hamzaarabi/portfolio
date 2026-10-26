import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { FaBars, FaMoon, FaSun, FaXmark, FaArrowRight } from 'react-icons/fa6';
import { navLinks } from '../data/portfolio';

export default function Navbar({ theme, onToggleTheme, onOpenPalette }) {
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
        <Link to="/" className="brand" aria-label="Hamza — home">
          <span className="brand-mark">HA</span>
          <span className="brand-text">Hamza<em>.dev</em></span>
        </Link>

        <nav className="nav-links" aria-label="Primary">
          {navLinks.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="nav-actions">
          <button type="button" className="palette-hint" onClick={onOpenPalette} aria-label="Open quick navigation (Control K)">
            <span>Quick nav</span>
            <kbd>⌘K</kbd>
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {theme === 'dark' ? <FaSun /> : <FaMoon />}
          </button>
          <Link to="/contact" className="btn btn-primary btn-sm nav-cta">
            Hire me <FaArrowRight />
          </Link>
          <button
            type="button"
            className="icon-btn menu-btn"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <FaXmark /> : <FaBars />}
          </button>
        </div>
      </div>

      <div className={`mobile-menu ${open ? 'open' : ''}`}>
        <nav aria-label="Mobile">
          {navLinks.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'} className={({ isActive }) => `mobile-link ${isActive ? 'active' : ''}`}>
              {l.label}
            </NavLink>
          ))}
          <Link to="/contact" className="btn btn-primary mobile-cta">Hire me <FaArrowRight /></Link>
        </nav>
      </div>
    </header>
  );
}
