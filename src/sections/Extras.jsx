import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaBriefcase, FaChevronDown, FaDownload, FaRocket, FaScrewdriverWrench, FaWhatsapp } from 'react-icons/fa6';
import { traits, process, faqs, profile } from '../data/portfolio';
import SectionHeading from '../components/SectionHeading';
import Reveal from '../components/Reveal';

export function TraitsSection() {
  return (
    <section className="section" id="why-me">
      <div className="container-x">
        <SectionHeading
          eyebrow="Why hire me"
          title="More than just code"
          sub="The soft skills that make projects run smoothly and teams enjoy working together."
        />
        <div className="traits-grid">
          {traits.map((t, i) => (
            <Reveal key={t.title} delay={i * 80}>
              <article className="trait-card">
                <span className="service-icon"><t.icon /></span>
                <h3>{t.title}</h3>
                <p>{t.desc}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProcessSection() {
  return (
    <section className="section" id="process">
      <div className="container-x">
        <SectionHeading
          eyebrow="How I work"
          title="A simple, transparent process"
          sub="You always know what happens next — and you approve each step before we move on."
        />
        <div className="process-grid">
          {process.map((step, i) => (
            <Reveal key={step.step} delay={i * 90}>
              <article className="process-card">
                <span className="step-num">{step.step}</span>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FaqSection() {
  const [open, setOpen] = useState(0);
  return (
    <section className="section alt" id="faq">
      <div className="container-x narrow">
        <SectionHeading eyebrow="FAQ" title="Questions, answered" />
        <div className="faq-list">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={f.q} delay={i * 50}>
                <div className={`faq-item ${isOpen ? 'open' : ''}`}>
                  <button
                    type="button"
                    className="faq-q"
                    aria-expanded={isOpen}
                    aria-controls={`faq-a-${i}`}
                    onClick={() => setOpen(isOpen ? -1 : i)}
                  >
                    <span>{f.q}</span>
                    <FaChevronDown aria-hidden="true" />
                  </button>
                  <div className="faq-a" id={`faq-a-${i}`} hidden={!isOpen}>
                    <p>{f.a}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function WorkWithMeSection() {
  const ways = [
    {
      icon: FaRocket,
      title: 'Freelance project',
      desc: 'A website, online store or business tool — scoped clearly, designed in Figma, built and launched by me. Fastest start: message me on WhatsApp with your idea.',
      cta: 'Discuss on WhatsApp',
      href: profile.whatsappLink,
      external: true,
    },
    {
      icon: FaBriefcase,
      title: 'Full-time / contract role',
      desc: 'Looking for a full-stack developer (React · Laravel · Symfony · SQL) who can join your team and ship from week one? Grab my CV or book a short call.',
      cta: 'Download my CV',
      href: profile.cv,
      download: true,
    },
    {
      icon: FaScrewdriverWrench,
      title: 'Maintenance & support',
      desc: 'Already have a website or ERP/business tool that needs fixes, updates or new features? I keep production sites running smoothly at my current company — I can do the same for yours.',
      cta: 'Ask for support',
      href: '/contact',
    },
  ];
  return (
    <section className="section alt" id="work-with-me">
      <div className="container-x">
        <SectionHeading
          eyebrow="Work with me"
          title="Three ways we can work together"
          sub="Whether you are a business owner with a project, or a recruiter with a role to fill — pick the path that fits and let's talk today."
        />
        <div className="services-grid">
          {ways.map((w, i) => (
            <Reveal key={w.title} delay={i * 90}>
              <article className="service-card work-card">
                <span className="service-icon"><w.icon /></span>
                <h3>{w.title}</h3>
                <p>{w.desc}</p>
                {w.external ? (
                  <a className="text-link work-card-link" href={w.href} target="_blank" rel="noreferrer">
                    <FaWhatsapp /> {w.cta}
                  </a>
                ) : w.download ? (
                  <a className="text-link work-card-link" href={w.href} download="Hamza-CV.pdf">
                    <FaDownload /> {w.cta}
                  </a>
                ) : (
                  <Link className="text-link work-card-link" to={w.href}>
                    {w.cta} <FaArrowRight />
                  </Link>
                )}
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CtaBanner() {
  return (
    <section className="section cta-section">
      <div className="container-x">
        <Reveal>
          <div className="cta-banner">
            <div className="aurora" aria-hidden="true"><span className="blob b1" /><span className="blob b2" /></div>
            <h2>Have a project in mind?<br />Let's build it together.</h2>
            <p>Tell me about your idea — I'll reply with honest advice, a clear plan and a fair estimate.</p>
            <div className="hero-cta center">
              <a href={profile.whatsappLink} target="_blank" rel="noreferrer" className="btn btn-primary">
                <FaWhatsapp /> Chat on WhatsApp
              </a>
              <Link to="/contact" className="btn btn-ghost light">Start a conversation <FaArrowRight /></Link>
              <a href={profile.cv} download="Hamza-CV.pdf" className="btn btn-ghost light">
                <FaDownload /> Download CV
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
