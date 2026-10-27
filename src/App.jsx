import { Suspense, lazy, useEffect, useState } from 'react';
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { FaArrowUp } from 'react-icons/fa6';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CommandPalette from './components/CommandPalette';
import WhatsAppFloat from './components/WhatsAppFloat';
import ChatBot from './components/ChatBot';
import { PortfolioContentProvider } from './content/PortfolioContentContext';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import { useTheme } from './hooks/hooks';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Services = lazy(() => import('./pages/Services'));
const Skills = lazy(() => import('./pages/Skills'));
const Projects = lazy(() => import('./pages/Projects'));
const ProjectDetails = lazy(() => import('./pages/ProjectDetails'));
const Contact = lazy(() => import('./pages/Contact'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Admin = lazy(() => import('./pages/Admin'));

function RouteEffects() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }, [pathname]);
  return null;
}

/**
 * Skip-to-content link for keyboard/screen-reader users.
 * Uses a click handler instead of a bare href="#main" because with
 * HashRouter changing location.hash would be parsed as a route change.
 */
function SkipLink() {
  const { t } = useLanguage();
  return (
    <a
      href="#main"
      className="skip-link"
      onClick={(e) => {
        e.preventDefault();
        const main = document.getElementById('main');
        if (main) {
          main.focus({ preventScroll: false });
          main.scrollIntoView();
        }
      }}
    >
      {t('common.skipToContent')}
    </a>
  );
}

function ScrollChrome() {
  const { t } = useLanguage();
  const [progress, setProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(max > 0 ? Math.min(window.scrollY / max, 1) : 0);
        setShowTop(window.scrollY > 700);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <>
      <div className="scroll-progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />
      <button
        type="button"
        className={`back-top ${showTop ? 'show' : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label={t('common.backToTop')}
        tabIndex={showTop ? 0 : -1}
      >
        <FaArrowUp />
      </button>
    </>
  );
}

function PageFallback() {
  const { t } = useLanguage();
  return (
    <div className="page-fallback" role="status" aria-label={t('common.loadingPage')}>
      <span className="spinner" />
    </div>
  );
}

export default function App() {
  const [theme, toggleTheme] = useTheme();
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <LanguageProvider>
    <PortfolioContentProvider>
    <HashRouter>
      <SkipLink />
      <RouteEffects />
      <ScrollChrome />
      <Navbar theme={theme} onToggleTheme={toggleTheme} />
      <main id="main" tabIndex={-1}>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/skills" element={<Skills />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:slug" element={<ProjectDetails />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin" element={<div dir="ltr" lang="en"><Admin /></div>} />
            {/* Legacy routes from v1 — keep old links & bookmarks working */}
            <Route path="/AboutMe" element={<Navigate to="/about" replace />} />
            <Route path="/Services" element={<Navigate to="/services" replace />} />
            <Route path="/Skills" element={<Navigate to="/skills" replace />} />
            <Route path="/Projects" element={<Navigate to="/projects" replace />} />
            <Route path="/Contact" element={<Navigate to="/contact" replace />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <WhatsAppFloat />
      <ChatBot />
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    </HashRouter>
    </PortfolioContentProvider>
    </LanguageProvider>
  );
}
