import useTitle from '../hooks/useTitle';
import Hero, { TechMarquee } from '../sections/Hero';
import AboutSection from '../sections/AboutSection';
import ServicesSection from '../sections/ServicesSection';
import ProjectsSection from '../sections/ProjectsSection';
import SkillsSection from '../sections/SkillsSection';
import JourneySection from '../sections/JourneySection';
import { CtaBanner } from '../sections/Extras';

export default function Home() {
  useTitle('');
  return (
    <>
      <Hero />
      <TechMarquee />
      <AboutSection />
      <ServicesSection />
      <ProjectsSection />
      <SkillsSection />
      <JourneySection />
      <CtaBanner />
    </>
  );
}
