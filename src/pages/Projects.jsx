import useTitle from '../hooks/useTitle';
import PageHero from '../components/PageHero';
import ProjectsSection from '../sections/ProjectsSection';
import { CtaBanner } from '../sections/Extras';
import { useLanguage } from '../i18n/LanguageContext';

export default function Projects() {
  const { t } = useLanguage();
  useTitle(t('pages.projects.title'));

  return (
    <>
      <PageHero
        eyebrow={t('pages.projects.eyebrow')}
        title={t('pages.projects.heroTitle')}
        sub={t('pages.projects.heroSub')}
      />
      <ProjectsSection heading={false} withSearch />
      <CtaBanner />
    </>
  );
}
