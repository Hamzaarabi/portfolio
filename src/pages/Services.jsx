import useTitle from '../hooks/useTitle';
import PageHero from '../components/PageHero';
import ServicesSection from '../sections/ServicesSection';
import { ProcessSection, FaqSection, CtaBanner } from '../sections/Extras';

export default function Services() {
  useTitle('Services');
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Everything your website needs, under one roof"
        sub="Design, development, SEO and long-term maintenance — delivered by one developer who owns the whole process."
      />
      <ServicesSection detailed heading={false} />
      <ProcessSection />
      <FaqSection />
      <CtaBanner />
    </>
  );
}
