import { useEffect } from 'react';

/** Sets a per-page document title (good for tabs, history & SEO tools). */
export default function useTitle(title) {
  useEffect(() => {
    document.title = title
      ? `${title} — Hamza | Full-Stack Developer`
      : 'Hamza — Full-Stack Web Developer (React & Laravel)';
  }, [title]);
}
