import { FaBriefcase, FaCheck, FaDownload, FaLanguage, FaLocationDot, FaEnvelope, FaPhone } from 'react-icons/fa6';
import useTitle from '../hooks/useTitle';
import { profile } from '../data/portfolio';
import PageHero from '../components/PageHero';
import Socials from '../components/Socials';
import Reveal from '../components/Reveal';
import JourneySection from '../sections/JourneySection';
import { TraitsSection, CtaBanner } from '../sections/Extras';

export default function About() {
  useTitle('About Me');
  return (
    <>
      <PageHero
        eyebrow="About me"
        title="The developer behind the code"
        sub="Full-stack developer from morocco, building web products for local companies and international clients since 2021."
      />

      <section className="section">
        <div className="container-x">
          <div className="about-grid">
            <Reveal>
              <aside className="profile-card">
                <div className="avatar" aria-hidden="true">HA</div>
                <h3>{profile.fullName}</h3>
                <p className="profile-role">{profile.role}</p>
                <ul className="fact-list">
                  <li><FaLocationDot /> {profile.location}</li>
                  <li><FaBriefcase /> {profile.currentRole}</li>
                  <li><FaLanguage /> {profile.languages.join(' · ')}</li>
                  <li><FaEnvelope /> {profile.email}</li>
                  <li><FaPhone /> {profile.phoneDisplay}</li>
                </ul>
                <Socials />
                <a href={profile.cv} download="Hamza-CV.pdf" className="btn btn-primary profile-cv">
                  <FaDownload /> Download CV
                </a>
              </aside>
            </Reveal>

            <Reveal delay={120}>
              <div className="about-copy">
                <h2 className="about-title">My story</h2>
                {profile.about.map((p) => (
                  <p key={p.slice(0, 24)}>{p}</p>
                ))}
                <h3 className="about-subtitle">What I bring to every project</h3>
                <ul className="check-list">
                  {profile.highlights.map((h) => (
                    <li key={h}><FaCheck /> {h}</li>
                  ))}
                </ul>
                <h3 className="about-subtitle">Languages</h3>
                <div className="chip-row">
                  {profile.languages.map((l) => (
                    <span key={l} className="stack-chip big">{l}</span>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <JourneySection />
      <TraitsSection />
      <CtaBanner />
    </>
  );
}
