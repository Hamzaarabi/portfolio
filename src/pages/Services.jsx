import useTitle from '../hooks/useTitle';
import PageHero from '../components/PageHero';
import ServicesSection from '../sections/ServicesSection';
import { ProcessSection, FaqSection, CtaBanner } from '../sections/Extras';
import { useLanguage } from '../i18n/LanguageContext';

export default function Services() {
  const { t } = useLanguage();
  useTitle(t('pages.services.title'));

  return (
    <>
      <PageHero
        eyebrow={t('pages.services.eyebrow')}
        title={t('pages.services.heroTitle')}
        sub={t('pages.services.heroSub')}
      />
      <ServicesSection detailed heading={false} />
      <ProcessSection />
      <FaqSection />
      <CtaBanner />
    </>
  );
}
