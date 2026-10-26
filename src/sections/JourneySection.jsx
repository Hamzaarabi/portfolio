import { FaBriefcase, FaGraduationCap } from 'react-icons/fa6';
import { experience, education } from '../data/portfolio';
import SectionHeading from '../components/SectionHeading';
import Reveal from '../components/Reveal';

export function Timeline({ items, icon: Icon, heading }) {
  return (
    <div className="timeline-wrap">
      <h3 className="timeline-heading"><Icon /> {heading}</h3>
      <ol className="timeline">
        {items.map((item, i) => (
          <Reveal key={`${item.period}-${item.title}`} delay={i * 80}>
            <li className="tl-item">
              <span className="tl-dot" aria-hidden="true" />
              <div className="tl-card">
                <span className="tl-period">{item.period}</span>
                <h4>{item.title}</h4>
                <p className="tl-org">{item.org}</p>
                <ul>
                  {item.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            </li>
          </Reveal>
        ))}
      </ol>
    </div>
  );
}

export default function JourneySection() {
  return (
    <section className="section" id="journey">
      <div className="container-x">
        <SectionHeading
          eyebrow="My journey"
          title="Experience & education"
          sub="From a first line of HTML in 2021 to full-stack roles in corporate and agency teams."
        />
        <div className="journey-grid">
          <Timeline items={experience} icon={FaBriefcase} heading="Experience" />
          <Timeline items={education} icon={FaGraduationCap} heading="Education" />
        </div>
      </div>
    </section>
  );
}
