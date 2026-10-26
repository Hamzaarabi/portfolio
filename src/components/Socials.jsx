import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa6';
import { profile } from '../data/portfolio';

export default function Socials({ className = '' }) {
  return (
    <div className={`socials ${className}`}>
      <a href="https://github.com/Hamzaarabi" target="_blank" rel="noreferrer" aria-label="Hamza on GitHub" className="social-btn">
        <FaGithub />
      </a>
      <a href="https://www.linkedin.com/in/hamza-arabi/" target="_blank" rel="noreferrer" aria-label="Hamza on LinkedIn" className="social-btn">
        <FaLinkedin />
      </a>
      <a href={`mailto:${profile.email}`} aria-label={`Email ${profile.fullName}`} className="social-btn">
        <FaEnvelope />
      </a>
    </div>
  );
}
