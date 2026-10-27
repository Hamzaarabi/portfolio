import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaHouse, FaUser, FaBriefcase, FaCode, FaFolderOpen, FaEnvelope,
  FaDownload, FaCopy, FaCheck, FaGithub, FaLinkedin, FaMoon, FaSun, FaMagnifyingGlass, FaWhatsapp, FaLock,
} from 'react-icons/fa6';
import { profile } from '../data/portfolio';

/** ⌘K / Ctrl+K quick-navigation palette. */
export default function CommandPalette({ open, onClose, theme, onToggleTheme }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);

  const actions = useMemo(
    () => [
      { label: 'Go to Home', icon: FaHouse, run: () => navigate('/') },
      { label: 'Go to About', icon: FaUser, run: () => navigate('/about') },
      { label: 'Go to Services', icon: FaBriefcase, run: () => navigate('/services') },
      { label: 'Go to Skills', icon: FaCode, run: () => navigate('/skills') },
      { label: 'Go to Projects', icon: FaFolderOpen, run: () => navigate('/projects') },
      { label: 'Go to Contact', icon: FaEnvelope, run: () => navigate('/contact') },
      { label: 'Open Admin — manage skills, projects & experience', icon: FaLock, run: () => navigate('/admin') },
      { label: `Chat on WhatsApp — ${profile.whatsappDisplay}`, icon: FaWhatsapp, run: () => window.open(profile.whatsappLink, '_blank') },
      { label: 'Download my CV (PDF)', icon: FaDownload, run: () => window.open(profile.cv, '_blank') },
      {
        label: copied ? 'Email copied!' : `Copy email — ${profile.email}`,
        icon: copied ? FaCheck : FaCopy,
        keepOpen: true,
        run: async () => {
          try { await navigator.clipboard.writeText(profile.email); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch { /* clipboard unavailable */ }
        },
      },
      { label: 'Open GitHub', icon: FaGithub, run: () => window.open('https://github.com/Hamzaarabi', '_blank') },
      { label: 'Open LinkedIn', icon: FaLinkedin, run: () => window.open('https://www.linkedin.com/in/hamza-arabi/', '_blank') },
      { label: theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme', icon: theme === 'dark' ? FaSun : FaMoon, run: onToggleTheme },
    ],
    [navigate, copied, theme, onToggleTheme]
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
        aria-label="Quick navigation"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <div className="palette-search">
          <FaMagnifyingGlass aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages and actions…"
            aria-label="Search pages and actions"
          />
          <kbd>esc</kbd>
        </div>
        <ul className="palette-list" role="listbox" aria-label="Actions">
          {filtered.length === 0 && <li className="palette-empty">No results for “{query}”</li>}
          {filtered.map((a, i) => (
            <li key={a.label}>
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
          <span><kbd>↑↓</kbd> navigate</span>
          <span><kbd>↵</kbd> select</span>
          <span><kbd>esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}
