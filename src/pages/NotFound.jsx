import { Link } from 'react-router-dom';
import { FaHouse } from 'react-icons/fa6';
import useTitle from '../hooks/useTitle';

export default function NotFound() {
  useTitle('Page Not Found');
  return (
    <section className="section notfound">
      <div className="container-x center-text">
        <span className="nf-code" aria-hidden="true">404</span>
        <h1>This page wandered off</h1>
        <p>The page you're looking for doesn't exist — but plenty of good stuff does.</p>
        <Link to="/" className="btn btn-primary"><FaHouse /> Back to home</Link>
      </div>
    </section>
  );
}
