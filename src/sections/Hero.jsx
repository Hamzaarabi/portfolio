import { Link } from 'react-router-dom';
import { FaArrowRight, FaDownload, FaChevronDown, FaWhatsapp } from 'react-icons/fa6';
import { profile, techMarquee } from '../data/portfolio';
import { useTypewriter, useCounter } from '../hooks/hooks';
import Socials from '../components/Socials';
import Reveal from '../components/Reveal';
import { usePortfolioContent } from '../content/PortfolioContentContext';

function Stat({ value, suffix, label }) {
  const [ref, display] = useCounter(value);
  return (
    <div className="stat" ref={ref}>
      <span className="stat-num">{display}{suffix}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

function CodeCard() {
  return (
    <div className="code-card" aria-hidden="true">
      <div className="code-head">
        <span className="dot red" /><span className="dot yellow" /><span className="dot green" />
        <span className="code-file">hamza.js</span>
        <span className="code-live"><span className="pulse" /> online</span>
      </div>
      <pre className="code-body">{`const developer = {
  name: 'Hamza',
  based: 'Morocco',
  stack: ['React', 'Laravel',
          'MySQL', 'MongoDB'],
  focus: 'Fast, responsive UIs',
  openToWork: true,
};

// currentlyshipping
deploy(developer.build());
`}</pre>
      <div className="code-foot">
        <span className="chip-float cf1">React</span>
        <span className="chip-float cf2">Laravel</span>
        <span className="chip-float cf3">REST APIs</span>
      </div>
    </div>
  );
}

export default function Hero() {
  const { projects, skillGroups } = usePortfolioContent();
  const typed = useTypewriter(profile.roles);
  const stats = profile.stats.map((stat) => {
    if (stat.label === 'Featured projects') return { ...stat, value: projects.length };
    if (stat.label === 'Technologies & tools') {
      return { ...stat, value: skillGroups.reduce((sum, group) => sum + group.skills.length, 0) };
    }
    return stat;
  });
  return (
    <section className="hero">
      <div className="aurora" aria-hidden="true">
        <span className="blob b1" /><span className="blob b2" /><span className="blob b3" />
      </div>
      <div className="grid-bg" aria-hidden="true" />
      <div className="container-x hero-grid">
        <div className="hero-copy">
          <Reveal>
            <span className="badge-avail">
              <span className="pulse" />
              {profile.available ? profile.availabilityLabel : profile.currentRole}
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="hero-title">
              Hi, I'm <span className="grad-text">Hamza</span>
              <span className="hero-role">
                a <span className="typewriter">{typed}</span><span className="caret" aria-hidden="true" />
              </span>
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="hero-sub">{profile.tagline}</p>
          </Reveal>
          <Reveal delay={240}>
            <div className="hero-cta">
              <a href={profile.whatsappLink} target="_blank" rel="noreferrer" className="btn btn-primary">
                <FaWhatsapp /> Chat on WhatsApp
              </a>
              <Link to="/projects" className="btn btn-ghost">View my work <FaArrowRight /></Link>
              <a href={profile.cv} download="Hamza-CV.pdf" className="btn btn-ghost">
                <FaDownload /> Download CV
              </a>
            </div>
          </Reveal>
          <Reveal delay={320}>
            <div className="hero-socials">
              <Socials />
              <span className="hero-loc">Based in morocco · Working remotely worldwide</span>
            </div>
          </Reveal>
        </div>

        <Reveal delay={200} className="hero-visual">
          <CodeCard />
        </Reveal>
      </div>

      <div className="container-x">
        <Reveal delay={120}>
          <div className="stats-row">
            {stats.map((s) => (
              <Stat key={s.label} {...s} />
            ))}
          </div>
        </Reveal>
        <button
          type="button"
          className="scroll-hint"
          aria-label="Scroll down to about section"
          onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <FaChevronDown />
        </button>
      </div>
    </section>
  );
}

export function TechMarquee() {
  const items = [...techMarquee, ...techMarquee];
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {items.map((t, i) => (
          <span key={`${t}-${i}`} className="marquee-item">
            <span className="marquee-dot" /> {t}
          </span>
        ))}
      </div>
    </div>
  );
}
