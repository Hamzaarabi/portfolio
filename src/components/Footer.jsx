import { Link } from 'react-router-dom';
import { FaArrowUp, FaEnvelope, FaLocationDot, FaPhone } from 'react-icons/fa6';
import { navLinks, profile } from '../data/portfolio';
import Socials from './Socials';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container-x">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="brand">
              <span className="brand-mark">HA</span>
              <span className="brand-text">Hamza<em>.dev</em></span>
            </Link>
            <p>{profile.tagline}</p>
            <Socials />
          </div>

          <nav className="footer-col" aria-label="Footer">
            <h3>Explore</h3>
            {navLinks.map((l) => (
              <Link key={l.to} to={l.to}>{l.label}</Link>
            ))}
          </nav>

          <div className="footer-col">
            <h3>Expertise</h3>
            <span>React Development</span>
            <span>Laravel & REST APIs</span>
            <span>UI/UX Design</span>
            <span>SEO & Performance</span>
            <span>Mobile Apps (Capacitor)</span>
          </div>

          <div className="footer-col">
            <h3>Get in touch</h3>
            <a href={`mailto:${profile.email}`}><FaEnvelope /> {profile.email}</a>
            <a href={`tel:${profile.phone}`}><FaPhone /> {profile.phoneDisplay}</a>
            <span><FaLocationDot /> {profile.location} · Remote worldwide</span>
            <button type="button" className="to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <FaArrowUp /> Back to top
            </button>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {year} {profile.fullName}. All rights reserved.</p>
          <p className="footer-built">Built with React & Vite · Designed with care in morocco</p>
        </div>
      </div>
    </footer>
  );
}
