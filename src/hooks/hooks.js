import { useEffect, useRef, useState } from 'react';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Cycles through words with a typewriter effect. */
export function useTypewriter(words, typeMs = 75, deleteMs = 38, pauseMs = 1700) {
  const [text, setText] = useState('');
  useEffect(() => {
    if (prefersReducedMotion()) { setText(words[0]); return; }
    let word = 0, char = 0, deleting = false, timer;
    const tick = () => {
      const current = words[word];
      char += deleting ? -1 : 1;
      setText(current.slice(0, char));
      let delay = deleting ? deleteMs : typeMs;
      if (!deleting && char === current.length) { delay = pauseMs; deleting = true; }
      else if (deleting && char === 0) { deleting = false; word = (word + 1) % words.length; delay = 350; }
      timer = setTimeout(tick, delay);
    };
    timer = setTimeout(tick, 400);
    return () => clearTimeout(timer);
  }, [words, typeMs, deleteMs, pauseMs]);
  return text;
}

/** Animates a number from 0 → target when its element scrolls into view. */
export function useCounter(target, duration = 1400) {
  const ref = useRef(null);
  const [value, setValue] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) { setValue(target); return; }
    let raf;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const step = (now) => {
          const p = Math.min((now - start) / duration, 1);
          setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
          if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => { observer.disconnect(); cancelAnimationFrame(raf); };
  }, [target, duration]);
  return [ref, value];
}

/** Dark / light theme state, persisted to localStorage. */
export function useTheme() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'dark');
  const toggleTheme = () =>
    setTheme((t) => {
      const next = t === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem('theme', next); } catch { /* private mode */ }
      return next;
    });
  return [theme, toggleTheme];
}
