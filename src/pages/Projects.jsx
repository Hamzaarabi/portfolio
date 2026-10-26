import useTitle from '../hooks/useTitle';
import PageHero from '../components/PageHero';
import ProjectsSection from '../sections/ProjectsSection';
import { CtaBanner } from '../sections/Extras';

export default function Projects() {
  useTitle('Projects');
  return (
    <>
      <PageHero
        eyebrow="Projects"
        title="Work that went live"
        sub="Filter by type or search by technology. Every project opens into a full case study with screenshots and implementation details — and more are underway."
      />
      <ProjectsSection heading={false} withSearch />
      <CtaBanner />
    </>
  );
}
