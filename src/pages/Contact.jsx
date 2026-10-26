import { useState } from 'react';
import emailjs from '@emailjs/browser';
import {
  FaCheck, FaCopy, FaEnvelope, FaLocationDot, FaPaperPlane, FaPhone, FaTriangleExclamation,
} from 'react-icons/fa6';
import useTitle from '../hooks/useTitle';
import { profile, emailjsConfig } from '../data/portfolio';
import PageHero from '../components/PageHero';
import Socials from '../components/Socials';
import Reveal from '../components/Reveal';
import { FaqSection } from '../sections/Extras';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function Contact() {
  useTitle('Contact');
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
    if (form.name.trim().length < 2) err.name = 'Please enter your name.';
    if (!EMAIL_RE.test(form.email.trim())) err.email = 'Please enter a valid email address.';
    if (form.message.trim().length < 10) err.message = 'Please write a message of at least 10 characters.';
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
          subject: form.subject.trim() || 'New message from portfolio',
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
        eyebrow="Contact"
        title="Let's start a conversation"
        sub="A project, a job opportunity, or just a hello — my inbox is always open and I usually reply within 24–48 hours."
      />

      <section className="section">
        <div className="container-x">
          <div className="contact-grid">
            <Reveal>
              <div className="contact-info">
                <h2>Send me a message</h2>
                <p>
                  Whether you want to discuss a new idea or have a project ready to build,
                  fill in the form and I'll get back to you soon.
                </p>

                <div className="contact-card">
                  <span className="service-icon"><FaEnvelope /></span>
                  <div>
                    <small>Email</small>
                    <a href={`mailto:${profile.email}`}>{profile.email}</a>
                  </div>
                  <button type="button" className="copy-btn" onClick={copyEmail} aria-label="Copy email address">
                    {copied ? <FaCheck /> : <FaCopy />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>

                <div className="contact-card">
                  <span className="service-icon"><FaPhone /></span>
                  <div>
                    <small>Phone / WhatsApp</small>
                    <a href={`tel:${profile.phone}`}>{profile.phoneDisplay}</a>
                  </div>
                </div>

                <div className="contact-card">
                  <span className="service-icon"><FaLocationDot /></span>
                  <div>
                    <small>Location</small>
                    <span>{profile.location} · Remote worldwide</span>
                  </div>
                </div>

                <div className="contact-socials">
                  <span>Elsewhere</span>
                  <Socials />
                </div>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <form className="form" onSubmit={onSubmit} noValidate>
                <div className="form-row">
                  <div className="field">
                    <label htmlFor="name">Your name *</label>
                    <input id="name" name="user_name" type="text" autoComplete="name" placeholder="Jane Smith"
                      value={form.name} onChange={set('name')} aria-invalid={!!errors.name} aria-describedby={errors.name ? 'err-name' : undefined} />
                    {errors.name && <p className="field-error" id="err-name">{errors.name}</p>}
                  </div>
                  <div className="field">
                    <label htmlFor="email">Your email *</label>
                    <input id="email" name="user_email" type="email" autoComplete="email" placeholder="jane@company.com"
                      value={form.email} onChange={set('email')} aria-invalid={!!errors.email} aria-describedby={errors.email ? 'err-email' : undefined} />
                    {errors.email && <p className="field-error" id="err-email">{errors.email}</p>}
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="subject">Subject</label>
                  <input id="subject" name="subject" type="text" placeholder="New project, job opportunity…"
                    value={form.subject} onChange={set('subject')} />
                </div>

                <div className="field">
                  <label htmlFor="message">Your message *</label>
                  <textarea id="message" name="message" rows="6" placeholder="Tell me about your project, timeline and goals…"
                    value={form.message} onChange={set('message')} aria-invalid={!!errors.message} aria-describedby={errors.message ? 'err-message' : undefined} />
                  {errors.message && <p className="field-error" id="err-message">{errors.message}</p>}
                </div>

                {/* Honeypot — invisible to humans, catches bots */}
                <div className="honeypot" aria-hidden="true">
                  <label>Company<input type="text" tabIndex={-1} autoComplete="off" value={form.company} onChange={set('company')} /></label>
                </div>

                <div aria-live="polite">
                  {status === 'success' && (
                    <p className="form-status success"><FaCheck /> Message sent successfully — thank you! I'll reply soon.</p>
                  )}
                  {status === 'error' && (
                    <p className="form-status error">
                      <FaTriangleExclamation /> Something went wrong. Please try again or email me directly at {profile.email}.
                    </p>
                  )}
                </div>

                <button type="submit" className="btn btn-primary form-submit" disabled={status === 'sending'}>
                  {status === 'sending' ? 'Sending…' : <>Send message <FaPaperPlane /></>}
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
