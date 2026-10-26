import Reveal from './Reveal';

/** Compact header used at the top of inner pages. */
export default function PageHero({ eyebrow, title, sub }) {
  return (
    <section className="page-hero">
      <div className="aurora" aria-hidden="true"><span className="blob b1" /><span className="blob b2" /></div>
      <div className="container-x">
        <Reveal>
          <span className="eyebrow">{eyebrow}</span>
          <h1 className="page-title">{title}</h1>
          {sub && <p className="page-sub">{sub}</p>}
        </Reveal>
      </div>
    </section>
  );
}
