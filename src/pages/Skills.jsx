import { FaAward, FaBuilding, FaCloud, FaDatabase, FaFileLines, FaGear, FaGitAlt, FaMagnifyingGlassChart, FaPalette } from 'react-icons/fa6';
import useTitle from '../hooks/useTitle';
import { certifications } from '../data/portfolio';
import PageHero from '../components/PageHero';
import SectionHeading from '../components/SectionHeading';
import Reveal from '../components/Reveal';
import SkillsSection from '../sections/SkillsSection';
import { TraitsSection, CtaBanner } from '../sections/Extras';

const additional = [
  { icon: FaGitAlt, title: 'Git & GitHub', desc: 'Version control and collaborative workflows — branching, pull requests and clean commit history on every project.' },
  { icon: FaGear, title: 'RESTful APIs', desc: 'Designing and consuming clean REST APIs with proper HTTP methods, status codes and JSON contracts.' },
  { icon: FaCloud, title: 'Cloud (Azure)', desc: 'Deploying and managing applications and services on Microsoft Azure cloud infrastructure.' },
  { icon: FaFileLines, title: 'Agile / Scrum', desc: 'Iterative delivery in sprints with constant feedback — small cross-functional steps, visible progress.' },
  { icon: FaPalette, title: 'Figma & Canva', desc: 'From wireframes to final visuals — designing interfaces and brand assets before development begins.' },
  { icon: FaMagnifyingGlassChart, title: 'SEO & Web Scraping', desc: 'Technical SEO that helps sites get found, plus pragmatic data collection from real agency work.' },
  { icon: FaDatabase, title: 'SQL Server & Databases', desc: 'Designing and querying reliable databases across SQL Server, MySQL and MongoDB — clean schemas, safe migrations and useful reports for business teams.' },
  { icon: FaBuilding, title: 'Sage ERP & Business Tools', desc: 'Working with Sage ERP and business management tools: company data, day-to-day operations, user support and connecting business needs with the right software.' },
];

export default function Skills() {
  useTitle('Skills');
  return (
    <>
      <PageHero
        eyebrow="Skills"
        title="A complete full-stack toolkit"
        sub="Front end, back end, databases, design and deployment — everything needed to ship a product solo or in a team."
      />
      <SkillsSection heading={false} />

      <section className="section">
        <div className="container-x">
          <SectionHeading eyebrow="Beyond the core" title="Additional skills" />
          <div className="services-grid">
            {additional.map((a, i) => (
              <Reveal key={a.title} delay={(i % 3) * 90}>
                <article className="service-card">
                  <span className="service-icon"><a.icon /></span>
                  <h3>{a.title}</h3>
                  <p>{a.desc}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container-x">
          <SectionHeading eyebrow="Credentials" title="Certifications" sub="Foundational web technology certifications earned along the way." />
          <div className="cert-row">
            {certifications.map((c) => (
              <Reveal key={c}>
                <div className="cert-card">
                  <FaAward aria-hidden="true" />
                  <span>{c}</span>
                  <small>Certified</small>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <TraitsSection />
      <CtaBanner />
    </>
  );
}
