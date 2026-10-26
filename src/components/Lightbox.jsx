import { useCallback, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight, FaXmark } from 'react-icons/fa6';

/** Accessible image lightbox with keyboard navigation. */
export default function Lightbox({ images, index, onClose, onNavigate, title }) {
  const next = useCallback(() => onNavigate((index + 1) % images.length), [index, images.length, onNavigate]);
  const prev = useCallback(() => onNavigate((index - 1 + images.length) % images.length), [index, images.length, onNavigate]);

  useEffect(() => {
    if (index === null) return undefined; // closed: no listeners, no scroll lock
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [next, prev, onClose, index]);

  if (index === null || !images?.length) return null;

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={`${title} image viewer`} onClick={onClose}>
      <button type="button" className="lightbox-btn close" onClick={onClose} aria-label="Close image viewer">
        <FaXmark />
      </button>
      <button type="button" className="lightbox-btn prev" onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Previous image">
        <FaChevronLeft />
      </button>
      <figure className="lightbox-figure" onClick={(e) => e.stopPropagation()}>
        <img src={images[index]} alt={`${title} screenshot ${index + 1}`} />
        <figcaption>{index + 1} / {images.length}</figcaption>
      </figure>
      <button type="button" className="lightbox-btn next" onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Next image">
        <FaChevronRight />
      </button>
    </div>
  );
}
