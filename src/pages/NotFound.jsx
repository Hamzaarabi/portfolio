import { Link } from 'react-router-dom';
import { FaHouse } from 'react-icons/fa6';
import useTitle from '../hooks/useTitle';
import { useLanguage } from '../i18n/LanguageContext';

export default function NotFound() {
  const { t } = useLanguage();
  useTitle(t('pages.notFound.title'));

  return (
    <section className="section notfound">
      <div className="container-x center-text">
        <span className="nf-code" aria-hidden="true">404</span>
        <h1>{t('pages.notFound.heading')}</h1>
        <p>{t('pages.notFound.text')}</p>
        <Link to="/" className="btn btn-primary"><FaHouse /> {t('pages.notFound.backHome')}</Link>
      </div>
    </section>
  );
}
