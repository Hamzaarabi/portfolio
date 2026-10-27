import { useState } from 'react';
import emailjs from '@emailjs/browser';
import {
  FaCheck, FaCopy, FaEnvelope, FaLocationDot, FaPaperPlane, FaPhone, FaTriangleExclamation, FaWhatsapp,
} from 'react-icons/fa6';
import useTitle from '../hooks/useTitle';
import { emailjsConfig } from '../data/portfolio';
import PageHero from '../components/PageHero';
import Socials from '../components/Socials';
import Reveal from '../components/Reveal';
import { FaqSection } from '../sections/Extras';
import { useLanguage } from '../i18n/LanguageContext';
import { useLocalizedProfile } from '../i18n/localizeContent';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const TOPIC_VALUES = [
  'Freelance project',
  'Job opportunity',
  'Business website',
  'E-commerce store',
  'ERP / management software',
  'Maintenance / support',
  'Other',
];

export default function Contact() {
  const { t } = useLanguage();
  const profile = useLocalizedProfile();
  useTitle(t('pages.contact.title'));
  const topicLabels = t('pages.contact.topics');

  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '', company: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [copied, setCopied] = useState(false);

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((err) => ({ ...err, [field]: undefined }));
  };

  const validate = () => {
    const err = {};
    if (form.name.trim().length < 2) err.name = t('pages.contact.errors.name');
    if (!EMAIL_RE.test(form.email.trim())) err.email = t('pages.contact.errors.email');
    if (form.message.trim().length < 10) err.message = t('pages.contact.errors.message');
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (form.company) return; // honeypot: bots fill hidden fields
    if (!validate()) return;
    setStatus('sending');
    try {
      await emailjs.send(
        emailjsConfig.serviceId,
        emailjsConfig.templateId,
        {
          user_name: form.name.trim(),
          user_email: form.email.trim(),
          subject: form.subject.trim() || t('pages.contact.defaultSubject'),
          message: form.message.trim(),
        },
        emailjsConfig.publicKey
      );
      setStatus('success');
      setForm({ name: '', email: '', subject: '', message: '', company: '' });
    } catch {
      setStatus('error');
    }
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard unavailable */ }
  };

  return (
    <>
      <PageHero
        eyebrow={t('pages.contact.eyebrow')}
        title={t('pages.contact.heroTitle')}
        sub={t('pages.contact.heroSub')}
      />

      <section className="section">
        <div className="container-x">
          <div className="contact-grid">
            <Reveal>
              <div className="contact-info">
                <h2>{t('pages.contact.sendHeading')}</h2>
                <p>{t('pages.contact.intro')}</p>

                <div className="contact-card">
                  <span className="service-icon"><FaEnvelope /></span>
                  <div>
                    <small>{t('pages.contact.email')}</small>
                    <a href={`mailto:${profile.email}`} dir="ltr">{profile.email}</a>
                  </div>
                  <button type="button" className="copy-btn" onClick={copyEmail} aria-label={t('pages.contact.copyEmail')}>
                    {copied ? <FaCheck /> : <FaCopy />}
                    {copied ? t('pages.contact.copied') : t('pages.contact.copy')}
                  </button>
                </div>

                <div className="contact-card whatsapp-card">
                  <span className="service-icon"><FaWhatsapp /></span>
                  <div>
                    <small>{t('pages.contact.whatsappFastest')}</small>
                    <a href={profile.whatsappLink} target="_blank" rel="noreferrer" dir="ltr">{profile.whatsappDisplay}</a>
                  </div>
                </div>

                <div className="contact-card">
                  <span className="service-icon"><FaPhone /></span>
                  <div>
                    <small>{t('pages.contact.phone')}</small>
                    <a href={`tel:${profile.phone}`} dir="ltr">{profile.phoneDisplay}</a>
                  </div>
                </div>

                <div className="contact-card">
                  <span className="service-icon"><FaLocationDot /></span>
                  <div>
                    <small>{t('pages.contact.location')}</small>
                    <span>{profile.location} · {t('footer.remoteWorldwide')}</span>
                  </div>
                </div>

                <div className="contact-socials">
                  <span>{t('pages.contact.elsewhere')}</span>
                  <Socials />
                </div>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <form className="form" onSubmit={onSubmit} noValidate>
                <div className="form-row">
                  <div className="field">
                    <label htmlFor="name">{t('pages.contact.name')}</label>
                    <input id="name" name="user_name" type="text" autoComplete="name" placeholder={t('pages.contact.namePlaceholder')}
                      value={form.name} onChange={set('name')} aria-invalid={!!errors.name} aria-describedby={errors.name ? 'err-name' : undefined} />
                    {errors.name && <p className="field-error" id="err-name">{errors.name}</p>}
                  </div>
                  <div className="field">
                    <label htmlFor="email">{t('pages.contact.emailLabel')}</label>
                    <input id="email" name="user_email" type="email" autoComplete="email" placeholder={t('pages.contact.emailPlaceholder')} dir="ltr"
                      value={form.email} onChange={set('email')} aria-invalid={!!errors.email} aria-describedby={errors.email ? 'err-email' : undefined} />
                    {errors.email && <p className="field-error" id="err-email">{errors.email}</p>}
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="subject">{t('pages.contact.needHelp')}</label>
                  <select id="subject" name="subject" value={form.subject} onChange={set('subject')}>
                    <option value="">{t('pages.contact.selectTopic')}</option>
                    {TOPIC_VALUES.map((value, index) => (
                      <option key={value} value={value}>{topicLabels[index]}</option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="message">{t('pages.contact.message')}</label>
                  <textarea id="message" name="message" rows="6" placeholder={t('pages.contact.messagePlaceholder')}
                    value={form.message} onChange={set('message')} aria-invalid={!!errors.message} aria-describedby={errors.message ? 'err-message' : undefined} />
                  {errors.message && <p className="field-error" id="err-message">{errors.message}</p>}
                </div>

                {/* Honeypot — invisible to humans, catches bots */}
                <div className="honeypot" aria-hidden="true">
                  <label>{t('pages.contact.company')}<input type="text" tabIndex={-1} autoComplete="off" value={form.company} onChange={set('company')} /></label>
                </div>

                <div aria-live="polite">
                  {status === 'success' && (
                    <p className="form-status success"><FaCheck /> {t('pages.contact.success')}</p>
                  )}
                  {status === 'error' && (
                    <p className="form-status error">
                      <FaTriangleExclamation /> {t('pages.contact.error', { email: profile.email })}
                    </p>
                  )}
                </div>

                <button type="submit" className="btn btn-primary form-submit" disabled={status === 'sending'}>
                  {status === 'sending' ? t('pages.contact.sending') : <>{t('pages.contact.send')} <FaPaperPlane /></>}
                </button>
              </form>
            </Reveal>
          </div>
        </div>
      </section>

      <FaqSection />
    </>
  );
}
