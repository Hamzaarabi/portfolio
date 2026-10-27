import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaDownload, FaPaperPlane, FaRobot, FaWhatsapp, FaXmark } from 'react-icons/fa6';
import { education, process, profile, services } from '../data/portfolio';
import { usePortfolioContent } from '../content/PortfolioContentContext';

const QUICK_PROMPTS = [
  'What services do you offer?',
  'Show me your best projects',
  'How can I hire you?',
  'Quelles sont vos compétences ?',
  'Contact WhatsApp',
];

const normalize = (text) =>
  String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const includesAny = (text, words) => words.some((word) => text.includes(word));

function MessageLinks({ links, onInternalClick }) {
  if (!links?.length) return null;
  return (
    <span className="chat-links">
      {links.map((link) => {
        if (link.to) {
          return (
            <Link key={`${link.label}-${link.to}`} to={link.to} onClick={onInternalClick}>
              {link.label} <FaArrowRight aria-hidden="true" />
            </Link>
          );
        }
        return (
          <a
            key={`${link.label}-${link.href}`}
            href={link.href}
            {...(link.download ? { download: link.download } : {})}
            {...(link.external ? { target: '_blank', rel: 'noreferrer' } : {})}
          >
            {link.whatsapp ? <FaWhatsapp aria-hidden="true" /> : link.download ? <FaDownload aria-hidden="true" /> : null}
            {link.label}
          </a>
        );
      })}
    </span>
  );
}

export default function ChatBot() {
  const { projects, skillGroups, experience } = usePortfolioContent();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const idRef = useRef(2);
  const timeoutRef = useRef(null);
  const messagesRef = useRef(null);
  const inputRef = useRef(null);
  const [messages, setMessages] = useState([
    {
      id: 1,
      from: 'bot',
      text: `Hi, I'm Hamza's assistant. Ask me about his services, projects, skills (React, Laravel, Symfony, SQL Server, Sage ERP), availability, or the fastest way to contact him.`,
      links: [
        { label: 'View services', to: '/services' },
        { label: 'WhatsApp Hamza', href: profile.whatsappLink, external: true, whatsapp: true },
      ],
    },
  ]);

  useEffect(() => () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
  }, []);

  useEffect(() => {
    if (!open) return;
    const container = messagesRef.current;
    if (container) container.scrollTop = container.scrollHeight;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 80);
    return () => window.clearTimeout(timer);
  }, [messages, typing, open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const getReply = (rawInput) => {
    const query = normalize(rawInput);
    const french = includesAny(query, [
      'bonjour', 'bonsoir', 'salut', 'merci', 'competence', 'experience', 'projet',
      'prix', 'tarif', 'devis', 'embauch', 'recrut', 'vous', 'vos ', 'votre',
      'je veux', "j'ai", 'site web', 'delai', 'combien', 'quels', 'quelles',
    ]);
    const allSkills = skillGroups.flatMap((group) => group.skills.map((skill) => ({ ...skill, group: group.title })));
    const matchedSkill = allSkills.find((skill) => query.includes(normalize(skill.name)));
    const relevantProjects = projects
      .map((project) => {
        const haystack = normalize([
          project.title, project.short, project.category,
          ...(project.stack || []), ...(project.tags || []),
        ].join(' '));
        const score = query.split(/[^a-z0-9+#.]+/).filter((word) => word.length > 2 && haystack.includes(word)).length;
        return { project, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || b.project.year - a.project.year)
      .slice(0, 3)
      .map((item) => item.project);

    const contactLinks = [
      { label: french ? 'WhatsApp direct' : 'Chat on WhatsApp', href: profile.whatsappLink, external: true, whatsapp: true },
      { label: french ? 'Formulaire de contact' : 'Contact form', to: '/contact' },
    ];
    const projectLinks = (items) => items.map((project) => ({ label: project.title, to: `/projects/${project.slug}` }));

    if (includesAny(query, ['admin', 'ajouter', 'modifier le contenu', 'gerer', 'dashboard', 'edit content', 'add a skill', 'add skill', 'add a project', 'add project', 'change experience', 'modifier experience'])) {
      return {
        text: french
          ? "Hamza peut gérer le contenu depuis la partie Admin : ajouter des compétences et des projets, et modifier l'expérience professionnelle. Les changements sont enregistrés dans ce navigateur (site statique, sans base de données serveur), avec export/import JSON pour les sauvegarder."
          : 'Hamza can manage content from the Admin area: add skills and projects, and edit work experience. Changes are saved in this browser (this is a static site with no server database), with JSON export/import for backup.',
        links: [{ label: french ? "Ouvrir l'administration" : 'Open Admin', to: '/admin' }],
      };
    }

    if (includesAny(query, ['whatsapp', 'telephone', 'phone', 'numero', 'number', 'call', 'appeler'])) {
      return {
        text: french
          ? `Le moyen le plus rapide est WhatsApp au ${profile.whatsappDisplay} (+212). Vous pouvez aussi appeler le ${profile.phoneDisplay} ou utiliser le formulaire de contact.`
          : `The fastest way is WhatsApp on ${profile.whatsappDisplay} (+212). You can also call ${profile.phoneDisplay} or use the contact form.`,
        links: contactLinks,
      };
    }

    if (includesAny(query, ['price', 'pricing', 'cost', 'quote', 'budget', 'prix', 'tarif', 'devis', 'combien coute', 'combien ça coute'])) {
      return {
        text: french
          ? "Le prix dépend du périmètre : pages, fonctionnalités, contenu, délais et maintenance. Envoyez une courte description de votre besoin sur WhatsApp : Hamza pourra vous donner une estimation honnête et un plan clair, sans engagement."
          : 'Pricing depends on scope: pages, features, content, timeline and maintenance. Send a short description on WhatsApp and Hamza can reply with an honest estimate and a clear plan — no obligation.',
        links: contactLinks,
      };
    }

    if (includesAny(query, ['hire', 'job', 'recruit', 'freelance', 'full-time', 'full time', 'contract', 'opportunity', 'embauch', 'recrut', 'emploi', 'poste', 'mission', 'travailler avec'])) {
      return {
        text: french
          ? `Bonne nouvelle : Hamza est ouvert aux projets freelance ainsi qu'aux postes full-time/contrat. Il est basé au Maroc, travaille à distance et communique en arabe, français et anglais.`
          : 'Good news: Hamza is open to freelance projects and full-time/contract roles. He is based in morocco, works remotely, and communicates in Arabic, French and English.',
        links: [
          { label: 'Download CV', href: profile.cv, download: 'Hamza-CV.pdf' },
          ...contactLinks,
        ],
      };
    }

    if (includesAny(query, ['cv', 'resume', 'curriculum'])) {
      return {
        text: french ? 'Voici le CV de Hamza en PDF :' : "Here is Hamza's CV as a PDF:",
        links: [
          { label: 'Download CV', href: profile.cv, download: 'Hamza-CV.pdf' },
          { label: french ? 'Voir son expérience' : 'View experience', to: '/about' },
        ],
      };
    }

    if (includesAny(query, ['sage', 'erp', 'gestion', 'management software', 'business software', 'internal tool', 'outil interne'])) {
      const service = services.find((item) => item.title.includes('ERP'));
      return {
        text: french
          ? `Oui. Hamza travaille avec des outils de gestion d'entreprise, y compris Sage ERP, les données métier et le support aux équipes dans son poste actuel. Il peut aussi créer des dashboards et outils internes sur mesure. ${service ? service.desc : ''}`
          : `Yes. Hamza works with business management tools including Sage ERP, company data and team support in his current role, and can also build custom dashboards/internal tools. ${service ? service.desc : ''}`,
        links: [{ label: french ? 'Voir les services' : 'See services', to: '/services' }, ...contactLinks.slice(0, 1)],
      };
    }

    if (includesAny(query, ['ecommerce', 'e-commerce', 'online store', 'shop', 'boutique', 'magasin', 'vendre en ligne'])) {
      const ecommerce = projects.filter((project) => /e-commerce|store|shop/i.test(`${project.title} ${project.short}`));
      return {
        text: french
          ? 'Hamza peut créer une boutique en ligne avec catalogue produits, panier/parcours de commande et contact WhatsApp pour faciliter les ventes. Voici un exemple e-commerce de son portfolio :'
          : 'Hamza can build an online store with a product catalogue, cart/order flow and WhatsApp contact to make selling easier. Here is an e-commerce example from the portfolio:',
        links: [...projectLinks(ecommerce.slice(0, 2)), ...contactLinks.slice(0, 1)],
      };
    }

    if (includesAny(query, ['service', 'offer', 'propose', 'what can you do', 'que pouvez', 'que fais', 'prestation'])) {
      const list = services.map((service) => service.title).join(', ');
      return {
        text: french
          ? `Hamza propose : ${list}. Dites-moi votre besoin (site vitrine, boutique, application métier, ERP/données, maintenance) et je vous orienterai vers la bonne solution.`
          : `Hamza offers: ${list}. Tell me what you need — business website, store, business app, ERP/data help, or maintenance — and I will point you to the right next step.`,
        links: [{ label: french ? 'Détail des services' : 'Service details', to: '/services' }, ...contactLinks.slice(0, 1)],
      };
    }

    if (matchedSkill && !includesAny(query, ['projects', 'projets'])) {
      return {
        text: french
          ? `Oui, ${matchedSkill.name} fait partie de ses compétences (${matchedSkill.group}, niveau affiché ${matchedSkill.level}%). Vous pouvez voir toute la stack sur la page Compétences.`
          : `Yes, ${matchedSkill.name} is in Hamza's stack (${matchedSkill.group}, listed at ${matchedSkill.level}%). You can explore the full stack on the Skills page.`,
        links: [
          { label: french ? 'Voir les compétences' : 'View skills', to: '/skills' },
          ...(relevantProjects.length ? projectLinks(relevantProjects.slice(0, 2)) : []),
        ],
      };
    }

    if (includesAny(query, ['skill', 'competence', 'technolog', 'stack', 'outils'])) {
      const names = allSkills.map((skill) => skill.name).join(', ');
      return {
        text: french
          ? `Ses compétences actuelles incluent : ${names}. Les plus demandées côté clients sont React, Laravel, Symfony, SQL Server/MySQL et Sage ERP.`
          : `His current skills include: ${names}. For client work, the most requested are React, Laravel, Symfony, SQL Server/MySQL and Sage ERP.`,
        links: [{ label: french ? 'Page Compétences' : 'Skills page', to: '/skills' }],
      };
    }

    if (includesAny(query, ['project', 'projet', 'portfolio', 'realisation', 'work', 'example', 'exemple'])) {
      const items = relevantProjects.length ? relevantProjects : projects.filter((project) => project.featured).slice(0, 3);
      return {
        text: french
          ? `Voici ${relevantProjects.length ? 'les projets les plus pertinents' : 'quelques projets phares'} de Hamza. Cliquez sur un projet pour ouvrir son étude de cas complète avec galerie.`
          : `Here are ${relevantProjects.length ? 'the most relevant projects' : 'some featured projects'} from Hamza. Open any one for the full case study and gallery.`,
        links: projectLinks(items),
      };
    }

    if (includesAny(query, ['experience', 'parcours', 'career', 'Delta', 'travail actuel', 'current job', 'education', 'etude', 'diplome', 'ensa', 'ista'])) {
      const jobs = experience.slice(0, 3).map((job) => `${job.title} — ${job.org} (${job.period})`).join(' · ');
      const schools = education.map((item) => `${item.title} — ${item.org}`).join(' · ');
      return {
        text: french
          ? `Expérience : ${jobs}. Formation : ${schools}.`
          : `Experience: ${jobs}. Education: ${schools}.`,
        links: [{ label: french ? 'Parcours complet' : 'Full journey', to: '/about' }, { label: 'Download CV', href: profile.cv, download: 'Hamza-CV.pdf' }],
      };
    }

    if (includesAny(query, ['process', 'etape', 'how do you work', 'comment vous travaillez', 'delai', 'timeline', 'how long', 'combien de temps'])) {
      const steps = process.map((step) => `${step.step} ${step.title}`).join(' → ');
      return {
        text: french
          ? `Le processus est simple et transparent : ${steps}. Un site professionnel prend souvent 2 à 4 semaines selon le périmètre ; les applications plus grandes sont découpées en étapes validées avec vous.`
          : `The process is simple and transparent: ${steps}. A polished business website often takes 2–4 weeks depending on scope; larger applications are planned in milestones you approve.`,
        links: [{ label: french ? 'Voir le processus' : 'See the process', to: '/services' }, ...contactLinks.slice(0, 1)],
      };
    }

    if (includesAny(query, ['where', 'location', 'based', 'remote', 'maroc', 'morocco', 'distance', 'langue', 'language', 'parlez'])) {
      return {
        text: french
          ? `Hamza est basé au Maroc et travaille à distance avec des clients locaux et internationaux. Il parle ${profile.languages.join(', ')}.`
          : `Hamza is based in morocco and works remotely with local and international clients. He speaks ${profile.languages.join(', ')}.`,
        links: contactLinks,
      };
    }

    if (includesAny(query, ['email', 'mail', 'contact', 'joindre', 'reach'])) {
      return {
        text: french
          ? `Vous pouvez écrire à ${profile.email}, utiliser le formulaire de contact, ou aller au plus rapide sur WhatsApp (${profile.whatsappDisplay}).`
          : `You can email ${profile.email}, use the contact form, or choose the fastest option: WhatsApp (${profile.whatsappDisplay}).`,
        links: [{ label: profile.email, href: `mailto:${profile.email}` }, ...contactLinks],
      };
    }

    if (includesAny(query, ['who are you', 'qui es-tu', 'qui est hamza', 'about hamza', 'presente', 'presentation'])) {
      return {
        text: french
          ? `${profile.fullName} est développeur web full-stack au Maroc, actuellement chez Delta Holding (Rabat). Il crée des sites et applications métier avec React, Laravel, Symfony et les bases de données SQL, avec une expérience agence et client international.`
          : `${profile.fullName} is a full-stack web developer in morocco, currently at Delta Holding (Rabat). He builds websites and business applications with React, Laravel, Symfony and SQL databases, with agency and international-client experience.`,
        links: [{ label: french ? 'À propos de Hamza' : 'About Hamza', to: '/about' }],
      };
    }

    if (includesAny(query, ['thank', 'merci', 'shukran', 'great', 'parfait'])) {
      return {
        text: french
          ? 'Avec plaisir. Si vous voulez aller plus loin, WhatsApp est le moyen le plus rapide de parler directement avec Hamza.'
          : 'You are welcome. If you would like to go further, WhatsApp is the fastest way to speak directly with Hamza.',
        links: contactLinks.slice(0, 1),
      };
    }

    if (query.trim().length <= 18 && includesAny(query, ['hello', 'hi', 'hey', 'bonjour', 'bonsoir', 'salut', 'salam', 'alo'])) {
      return {
        text: french
          ? 'Bonjour et bienvenue. Je peux vous aider à choisir un service, voir les projets/compétences de Hamza, télécharger son CV ou le contacter sur WhatsApp. Que cherchez-vous ?'
          : 'Hello and welcome. I can help you explore services, projects and skills, download the CV, or contact Hamza on WhatsApp. What are you looking for?',
        links: contactLinks,
      };
    }

    if (relevantProjects.length) {
      return {
        text: french
          ? 'Je trouve ces projets proches de votre demande. Ouvrez une étude de cas, ou envoyez les détails sur WhatsApp pour une réponse personnalisée.'
          : 'These portfolio projects look closest to what you asked for. Open a case study, or send the details on WhatsApp for a personalised answer.',
        links: [...projectLinks(relevantProjects), ...contactLinks.slice(0, 1)],
      };
    }

    return {
      text: french
        ? "Je peux répondre sur les services, projets, compétences, expérience, délais, CV et contact de Hamza. Pour une demande précise (prix, projet sur mesure, opportunité), WhatsApp est le plus rapide."
        : "I can answer questions about Hamza's services, projects, skills, experience, timelines, CV and contact options. For a specific request — pricing, a custom project or a role — WhatsApp is fastest.",
      links: [
        { label: french ? 'Voir les services' : 'View services', to: '/services' },
        { label: french ? 'Voir les projets' : 'View projects', to: '/projects' },
        ...contactLinks.slice(0, 1),
      ],
    };
  };

  const send = (rawText) => {
    const text = rawText.trim();
    if (!text || typing) return;
    const userMessage = { id: idRef.current++, from: 'user', text };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setTyping(true);
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      const reply = getReply(text);
      setMessages((prev) => [...prev, { id: idRef.current++, from: 'bot', ...reply }]);
      setTyping(false);
    }, 420);
  };

  return (
    <>
      <button
        type="button"
        className={`chatbot-toggle ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="portfolio-chatbot"
        aria-label={open ? 'Close portfolio assistant' : 'Open portfolio assistant chatbot'}
      >
        {open ? <FaXmark aria-hidden="true" /> : <FaRobot aria-hidden="true" />}
        <span>{open ? 'Close' : 'Ask AI'}</span>
      </button>

      {open && (
        <section className="chatbot-panel" id="portfolio-chatbot" aria-label="Portfolio assistant chatbot">
          <header className="chatbot-head">
            <span className="chatbot-avatar" aria-hidden="true"><FaRobot /></span>
            <span>
              <strong>Hamza Assistant</strong>
              <small><span className="pulse" aria-hidden="true" /> Online · replies instantly</small>
            </span>
            <button type="button" className="chatbot-close" onClick={() => setOpen(false)} aria-label="Close chatbot">
              <FaXmark aria-hidden="true" />
            </button>
          </header>

          <div className="chatbot-messages" ref={messagesRef} aria-live="polite">
            {messages.map((message) => (
              <div key={message.id} className={`chat-message-row ${message.from}`}>
                <div className={`chat-message ${message.from}`}>
                  <p>{message.text}</p>
                  <MessageLinks links={message.links} onInternalClick={() => setOpen(false)} />
                </div>
              </div>
            ))}
            {typing && (
              <div className="chat-message-row bot" aria-label="Assistant is typing">
                <div className="chat-message bot typing"><span /><span /><span /></div>
              </div>
            )}
          </div>

          <div className="chat-quick" aria-label="Suggested questions">
            {QUICK_PROMPTS.map((prompt) => (
              <button key={prompt} type="button" onClick={() => send(prompt)} disabled={typing}>
                {prompt}
              </button>
            ))}
          </div>

          <form
            className="chatbot-form"
            onSubmit={(event) => {
              event.preventDefault();
              send(input);
            }}
          >
            <label className="sr-only" htmlFor="chatbot-input">Ask about services, projects, skills or hiring</label>
            <input
              id="chatbot-input"
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about services, projects, hiring…"
              autoComplete="off"
            />
            <button type="submit" disabled={!input.trim() || typing} aria-label="Send message">
              <FaPaperPlane aria-hidden="true" />
            </button>
          </form>
          <p className="chatbot-note">Smart FAQ assistant · For a personal reply, use WhatsApp.</p>
        </section>
      )}
    </>
  );
}
