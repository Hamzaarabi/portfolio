import { FaWhatsapp } from 'react-icons/fa6';
import { profile } from '../data/portfolio';

/** Floating WhatsApp button — the fastest path from visitor to conversation. */
export default function WhatsAppFloat() {
  return (
    <a
      href={profile.whatsappLink}
      target="_blank"
      rel="noreferrer"
      className="whatsapp-float"
      aria-label={`Chat with me on WhatsApp (${profile.whatsappDisplay})`}
    >
      <FaWhatsapp aria-hidden="true" />
      <span>Chat with me</span>
    </a>
  );
}
