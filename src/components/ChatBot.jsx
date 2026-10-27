import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaArrowRight, FaDownload, FaPaperPlane, FaRobot, FaWhatsapp, FaXmark } from 'react-icons/fa6';
import { usePortfolioContent } from '../content/PortfolioContentContext';
import { useLanguage } from '../i18n/LanguageContext';
import {
  localizeEducation,
  localizeExperience,
  localizeProcess,
  localizeProfile,
  localizeProjects,
  localizeServices,
  localizeSkillGroups,
  useLocalizedProfile,
} from '../i18n/localizeContent';

const normalize = (text) => String(text || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f\u064b-\u065f\u0670]/g, '')
  .replace(/[إأآٱ]/g, 'ا')
  .replace(/ى/g, 'ي')
  .replace(/ة/g, 'ه')
  .replace(/ؤ/g, 'و')
  .replace(/ئ/g, 'ي');

const includesAny = (text, words) => words.some((word) => text.includes(normalize(word)));
const hasArabic = (text) => /[\u0600-\u06FF]/.test(text);
const pickFor = (language, en, fr, ar) => (language === 'fr' ? fr : language === 'ar' ? ar : en);

function MessageLinks({ links, onInternalClick }) {
  const { isRTL } = useLanguage();
  if (!links?.length) return null;
  const ArrowIcon = isRTL ? FaArrowLeft : FaArrowRight;

  return (
    <span className="chat-links">
      {links.map((link) => {
        if (link.to) {
          return (
            <Link key={`${link.label}-${link.to}`} to={link.to} onClick={onInternalClick}>
              {link.label} <ArrowIcon aria-hidden="true" />
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
  const { language: siteLanguage, t } = useLanguage();
  const profile = useLocalizedProfile();
  const {
    projects: rawProjects,
    skillGroups: rawSkillGroups,
    experience: rawExperience,
  } = usePortfolioContent();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const idRef = useRef(2);
  const timeoutRef = useRef(null);
  const messagesRef = useRef(null);
  const inputRef = useRef(null);

  const createInitialMessage = () => ({
    id: 1,
    from: 'bot',
    initial: true,
    text: t('chat.welcome'),
    links: [
      { label: t('common.viewServices'), to: '/services' },
      { label: t('common.whatsappHamza'), href: profile.whatsappLink, external: true, whatsapp: true },
    ],
  });

  const [messages, setMessages] = useState(() => [createInitialMessage()]);
  const quickPrompts = t('chat.quickPrompts');

  useEffect(() => {
    setMessages((previous) => (
      previous.length === 1 && previous[0]?.initial ? [createInitialMessage()] : previous
    ));
    // The initial message follows the selected site language until a conversation starts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteLanguage]);

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
    const arabic = hasArabic(rawInput);
    const french = !arabic && includesAny(query, [
      'bonjour', 'bonsoir', 'salut', 'merci', 'competence', 'experience', 'projet',
      'prix', 'tarif', 'devis', 'embauch', 'recrut', 'vous', 'vos ', 'votre',
      'je veux', "j'ai", 'site web', 'delai', 'combien', 'quels', 'quelles',
    ]);
    const replyLanguage = arabic ? 'ar' : french ? 'fr' : siteLanguage;
    const pick = (en, fr, ar) => pickFor(replyLanguage, en, fr, ar);

    const replyProfile = localizeProfile(replyLanguage);
    const projects = localizeProjects(replyLanguage, rawProjects);
    const skillGroups = localizeSkillGroups(replyLanguage, rawSkillGroups);
    const experience = localizeExperience(replyLanguage, rawExperience);
    const education = localizeEducation(replyLanguage);
    const services = localizeServices(replyLanguage);
    const process = localizeProcess(replyLanguage);

    const allSkills = skillGroups.flatMap((group) => group.skills.map((skill) => ({ ...skill, group: group.title })));
    const matchedSkill = allSkills.find((skill) => query.includes(normalize(skill.name)));
    const relevantProjects = projects
      .map((project) => {
        const haystack = normalize(project.searchText || [
          project.title, project.short, project.category,
          ...(project.stack || []), ...(project.tags || []),
        ].join(' '));
        const score = query.split(/[^a-z0-9+#.\u0600-\u06FF]+/).filter((word) => word.length > 2 && haystack.includes(word)).length;
        return { project, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || b.project.year - a.project.year)
      .slice(0, 3)
      .map((item) => item.project);

    const downloadCvLabel = pick('Download CV', 'Télécharger le CV', 'تحميل السيرة الذاتية');
    const contactLinks = [
      {
        label: pick('Chat on WhatsApp', 'WhatsApp direct', 'التحدث عبر واتساب'),
        href: replyProfile.whatsappLink,
        external: true,
        whatsapp: true,
      },
      {
        label: pick('Contact form', 'Formulaire de contact', 'نموذج التواصل'),
        to: '/contact',
      },
    ];
    const projectLinks = (items) => items.map((project) => ({ label: project.title, to: `/projects/${project.slug}` }));

    if (includesAny(query, [
      'admin', 'dashboard', 'edit content', 'add a skill', 'add skill', 'add a project', 'add project', 'change experience',
      'ajouter', 'modifier le contenu', 'gerer le contenu', 'modifier experience',
      'لوحة التحكم', 'ادارة الموقع', 'ادارة المحتوي', 'داشبورد', 'اضافة مهارة', 'اضافة مشروع', 'تعديل الخبرة',
    ])) {
      return {
        text: pick(
          'Portfolio administration is private: it is not linked from any public page, and only the owner can access it with the direct dashboard URL and local password.',
          "L'administration du portfolio est privée : elle n'est liée depuis aucune page publique et seul le propriétaire peut y accéder avec son adresse directe et son mot de passe local.",
          'إدارة الملف الشخصي خاصة: ليست مرتبطة بأي صفحة عامة، ولا يمكن الوصول إليها إلا من طرف المالك عبر رابط لوحة التحكم المباشر وكلمة المرور المحلية.'
        ),
      };
    }

    if (includesAny(query, ['whatsapp', 'telephone', 'phone', 'numero', 'number', 'call', 'appeler', 'واتساب', 'هاتف', 'رقم الهاتف', 'اتصال', 'اتصل'])) {
      return {
        text: pick(
          `The fastest way is WhatsApp on ${replyProfile.whatsappDisplay} (+212). You can also call ${replyProfile.phoneDisplay} or use the contact form.`,
          `Le moyen le plus rapide est WhatsApp au ${replyProfile.whatsappDisplay} (+212). Vous pouvez aussi appeler le ${replyProfile.phoneDisplay} ou utiliser le formulaire de contact.`,
          `أسرع وسيلة هي واتساب على ${replyProfile.whatsappDisplay} ‎(+212)‎. يمكنك أيضاً الاتصال بـ ${replyProfile.phoneDisplay} أو استخدام نموذج التواصل.`
        ),
        links: contactLinks,
      };
    }

    if (includesAny(query, ['price', 'pricing', 'cost', 'quote', 'budget', 'prix', 'tarif', 'devis', 'combien coute', 'سعر', 'الثمن', 'تكلفة', 'ميزانية', 'عرض سعر', 'بكم', 'كم يكلف'])) {
      return {
        text: pick(
          'Pricing depends on scope: pages, features, content, timeline and maintenance. Send a short description on WhatsApp and Hamza can reply with an honest estimate and a clear plan — no obligation.',
          'Le prix dépend du périmètre : pages, fonctionnalités, contenu, délais et maintenance. Envoyez une courte description sur WhatsApp : Hamza pourra vous donner une estimation honnête et un plan clair, sans engagement.',
          'يعتمد السعر على نطاق العمل: الصفحات والمزايا والمحتوى والآجال والصيانة. أرسل وصفاً قصيراً لاحتياجك عبر واتساب وسيرد حمزة بتقدير صادق وخطة واضحة — دون أي التزام.'
        ),
        links: contactLinks,
      };
    }

    if (includesAny(query, ['hire', 'job', 'recruit', 'freelance', 'full-time', 'full time', 'contract', 'opportunity', 'embauch', 'recrut', 'emploi', 'poste', 'mission', 'travailler avec', 'توظيف', 'وظيفة', 'عمل حر', 'دوام كامل', 'فرصة عمل', 'عقد عمل'])) {
      return {
        text: pick(
          'Good news: Hamza is open to freelance projects and full-time/contract roles. He is based in Morocco, works remotely, and communicates in Arabic, French and English.',
          'Bonne nouvelle : Hamza est ouvert aux projets freelance ainsi qu’aux postes full-time/contrat. Il est basé au Maroc, travaille à distance et communique en arabe, français et anglais.',
          'خبر سار: حمزة متاح لمشاريع مستقلة ووظائف بدوام كامل أو بعقود. يقيم في المغرب ويعمل عن بُعد ويتواصل بالعربية والفرنسية والإنجليزية.'
        ),
        links: [
          { label: downloadCvLabel, href: replyProfile.cv, download: 'Hamza-CV.pdf' },
          ...contactLinks,
        ],
      };
    }

    if (includesAny(query, ['cv', 'resume', 'curriculum', 'سيرة ذاتية', 'السيرة'])) {
      return {
        text: pick("Here is Hamza's CV as a PDF:", 'Voici le CV de Hamza en PDF :', 'إليك السيرة الذاتية لحمزة بصيغة PDF:'),
        links: [
          { label: downloadCvLabel, href: replyProfile.cv, download: 'Hamza-CV.pdf' },
          { label: pick('View experience', 'Voir son expérience', 'عرض الخبرة'), to: '/about' },
        ],
      };
    }

    if (includesAny(query, ['sage', 'erp', 'gestion', 'management software', 'business software', 'internal tool', 'outil interne', 'برنامج ادارة', 'برامج الاعمال', 'اداة داخلية', 'تسيير', 'المخزون'])) {
      const service = services[2];
      return {
        text: pick(
          `Yes. Hamza works with business management tools including Sage ERP, company data and team support in his current role, and can also build custom dashboards/internal tools. ${service ? service.desc : ''}`,
          `Oui. Hamza travaille avec des outils de gestion d'entreprise, y compris Sage ERP, les données métier et le support aux équipes dans son poste actuel. Il peut aussi créer des dashboards et outils internes sur mesure. ${service ? service.desc : ''}`,
          `نعم. يعمل حمزة مع أدوات إدارة الأعمال بما فيها Sage ERP وبيانات الشركات ودعم الفرق في منصبه الحالي، ويمكنه أيضاً بناء لوحات معلومات وأدوات داخلية مخصصة. ${service ? service.desc : ''}`
        ),
        links: [{ label: pick('See services', 'Voir les services', 'عرض الخدمات'), to: '/services' }, ...contactLinks.slice(0, 1)],
      };
    }

    if (includesAny(query, ['ecommerce', 'e-commerce', 'online store', 'shop', 'boutique', 'magasin', 'vendre en ligne', 'متجر', 'تجارة الكترونية', 'بيع عبر الانترنت'])) {
      const ecommerce = projects.filter((project) => /e-commerce|ecommerce|store|shop|boutique|متجر/i.test(`${project.canonicalTitle || ''} ${project.title} ${project.short}`));
      return {
        text: pick(
          'Hamza can build an online store with a product catalogue, cart/order flow and WhatsApp contact to make selling easier. Here is an e-commerce example from the portfolio:',
          'Hamza peut créer une boutique en ligne avec catalogue produits, panier/parcours de commande et contact WhatsApp pour faciliter les ventes. Voici un exemple e-commerce de son portfolio :',
          'يمكن لحمزة بناء متجر إلكتروني مع كتالوج منتجات ومسار سلة/طلب وتواصل عبر واتساب لتسهيل البيع. إليك مثالاً من ملفه:'
        ),
        links: [...projectLinks(ecommerce.slice(0, 2)), ...contactLinks.slice(0, 1)],
      };
    }

    if (includesAny(query, ['service', 'offer', 'propose', 'what can you do', 'que pouvez', 'que fais', 'prestation', 'خدمات', 'خدمة', 'ماذا تقدم', 'ماذا تستطيع'])) {
      const list = services.map((service) => service.title).join('، ');
      return {
        text: pick(
          `Hamza offers: ${services.map((service) => service.title).join(', ')}. Tell me what you need — business website, store, business app, ERP/data help, or maintenance — and I will point you to the right next step.`,
          `Hamza propose : ${services.map((service) => service.title).join(', ')}. Dites-moi votre besoin (site vitrine, boutique, application métier, ERP/données, maintenance) et je vous orienterai vers la bonne solution.`,
          `يقدم حمزة: ${list}. أخبرني بما تحتاجه — موقع شركة أو متجر أو تطبيق أعمال أو مساعدة في ERP/البيانات أو صيانة — وسأوجّهك إلى الخطوة المناسبة.`
        ),
        links: [{ label: pick('Service details', 'Détail des services', 'تفاصيل الخدمات'), to: '/services' }, ...contactLinks.slice(0, 1)],
      };
    }

    if (matchedSkill && !includesAny(query, ['project', 'projet', 'مشروع', 'مشاريع'])) {
      return {
        text: pick(
          `Yes, ${matchedSkill.name} is in Hamza's stack (${matchedSkill.group}, listed at ${matchedSkill.level}%). You can explore the full stack on the Skills page.`,
          `Oui, ${matchedSkill.name} fait partie de ses compétences (${matchedSkill.group}, niveau affiché ${matchedSkill.level}%). Vous pouvez voir toute la stack sur la page Compétences.`,
          `نعم، ${matchedSkill.name} ضمن مهارات حمزة (${matchedSkill.group}، بمستوى معروض ${matchedSkill.level}٪). يمكنك استكشاف تقنياته كاملة في صفحة المهارات.`
        ),
        links: [
          { label: pick('View skills', 'Voir les compétences', 'عرض المهارات'), to: '/skills' },
          ...(relevantProjects.length ? projectLinks(relevantProjects.slice(0, 2)) : []),
        ],
      };
    }

    if (includesAny(query, ['skill', 'competence', 'technolog', 'stack', 'outils', 'مهارات', 'مهارة', 'تقنيات', 'تقنية', 'ادوات'])) {
      const names = allSkills.map((skill) => skill.name).join(', ');
      return {
        text: pick(
          `His current skills include: ${names}. For client work, the most requested are React, Laravel, Symfony, SQL Server/MySQL and Sage ERP.`,
          `Ses compétences actuelles incluent : ${names}. Les plus demandées côté clients sont React, Laravel, Symfony, SQL Server/MySQL et Sage ERP.`,
          `تشمل مهارات حمزة الحالية: ${names}. والأكثر طلباً لدى العملاء هي React وLaravel وSymfony وSQL Server/MySQL وSage ERP.`
        ),
        links: [{ label: pick('Skills page', 'Page Compétences', 'صفحة المهارات'), to: '/skills' }],
      };
    }

    if (includesAny(query, ['project', 'projet', 'portfolio', 'realisation', 'work', 'example', 'exemple', 'مشاريع', 'مشروع', 'اعمال', 'نماذج'])) {
      const items = relevantProjects.length ? relevantProjects : projects.filter((project) => project.featured).slice(0, 3);
      return {
        text: pick(
          `Here are ${relevantProjects.length ? 'the most relevant projects' : 'some featured projects'} from Hamza. Open any one for the full case study and gallery.`,
          `Voici ${relevantProjects.length ? 'les projets les plus pertinents' : 'quelques projets phares'} de Hamza. Cliquez sur un projet pour ouvrir son étude de cas complète avec galerie.`,
          `إليك ${relevantProjects.length ? 'أكثر مشاريع حمزة صلة بطلبك' : 'بعض مشاريع حمزة المميزة'}. افتح أي مشروع لعرض دراسة الحالة الكاملة والمعرض.`
        ),
        links: projectLinks(items),
      };
    }

    if (includesAny(query, ['experience', 'parcours', 'career', 'Delta', 'travail actuel', 'current job', 'education', 'etude', 'diplome', 'ensa', 'ista', 'خبرة', 'مسار', 'تعليم', 'دراسة', 'شهادة', 'وظيفة حالية'])) {
      const separator = ' · ';
      const jobs = experience.slice(0, 3).map((job) => `${job.title} — ${job.org} (${job.period})`).join(separator);
      const schools = education.map((item) => `${item.title} — ${item.org}`).join(separator);
      return {
        text: pick(
          `Experience: ${jobs}. Education: ${schools}.`,
          `Expérience : ${jobs}. Formation : ${schools}.`,
          `الخبرة: ${jobs}. التعليم: ${schools}.`
        ),
        links: [
          { label: pick('Full journey', 'Parcours complet', 'المسيرة الكاملة'), to: '/about' },
          { label: downloadCvLabel, href: replyProfile.cv, download: 'Hamza-CV.pdf' },
        ],
      };
    }

    if (includesAny(query, ['process', 'etape', 'how do you work', 'comment vous travaillez', 'delai', 'timeline', 'how long', 'combien de temps', 'خطوات', 'طريقة العمل', 'مدة', 'كم من الوقت', 'اجال'])) {
      const steps = process.map((step) => `${step.step} ${step.title}`).join(replyLanguage === 'ar' ? ' ← ' : ' → ');
      return {
        text: pick(
          `The process is simple and transparent: ${steps}. A polished business website often takes 2–4 weeks depending on scope; larger applications are planned in milestones you approve.`,
          `Le processus est simple et transparent : ${steps}. Un site professionnel prend souvent 2 à 4 semaines selon le périmètre ; les applications plus grandes sont découpées en étapes validées avec vous.`,
          `العملية بسيطة وشفافة: ${steps}. يحتاج موقع أعمال متقن غالباً من أسبوعين إلى أربعة أسابيع حسب النطاق، أما التطبيقات الأكبر فتُخطط على مراحل توافق عليها.`
        ),
        links: [{ label: pick('See the process', 'Voir le processus', 'عرض خطوات العمل'), to: '/services' }, ...contactLinks.slice(0, 1)],
      };
    }

    if (includesAny(query, ['where', 'location', 'based', 'remote', 'maroc', 'morocco', 'distance', 'langue', 'language', 'parlez', 'اين', 'موقعك', 'المغرب', 'عن بعد', 'لغة', 'لغات', 'تتحدث'])) {
      return {
        text: pick(
          `Hamza is based in Morocco and works remotely with local and international clients. He speaks ${replyProfile.languages.join(', ')}.`,
          `Hamza est basé au Maroc et travaille à distance avec des clients locaux et internationaux. Il parle ${replyProfile.languages.join(', ')}.`,
          `يقيم حمزة في المغرب ويعمل عن بُعد مع عملاء محليين ودوليين. يتحدث ${replyProfile.languages.join(' و')}.`
        ),
        links: contactLinks,
      };
    }

    if (includesAny(query, ['email', 'mail', 'contact', 'joindre', 'reach', 'بريد', 'ايميل', 'تواصل'])) {
      return {
        text: pick(
          `You can email ${replyProfile.email}, use the contact form, or choose the fastest option: WhatsApp (${replyProfile.whatsappDisplay}).`,
          `Vous pouvez écrire à ${replyProfile.email}, utiliser le formulaire de contact, ou aller au plus rapide sur WhatsApp (${replyProfile.whatsappDisplay}).`,
          `يمكنك مراسلة ${replyProfile.email}، أو استخدام نموذج التواصل، أو اختيار الأسرع: واتساب (${replyProfile.whatsappDisplay}).`
        ),
        links: [{ label: replyProfile.email, href: `mailto:${replyProfile.email}` }, ...contactLinks],
      };
    }

    if (includesAny(query, ['who are you', 'qui es-tu', 'qui est hamza', 'about hamza', 'presente', 'presentation', 'من انت', 'من هو حمزه', 'عرف بنفسك', 'نبذة'])) {
      return {
        text: pick(
          `${replyProfile.fullName} is a full-stack web developer in Morocco, currently at Delta Holding (Rabat). He builds websites and business applications with React, Laravel, Symfony and SQL databases, with agency and international-client experience.`,
          `${replyProfile.fullName} est développeur web full-stack au Maroc, actuellement chez Delta Holding (Rabat). Il crée des sites et applications métier avec React, Laravel, Symfony et les bases de données SQL, avec une expérience agence et client international.`,
          `${replyProfile.fullName} مطوّر ويب شامل في المغرب ويعمل حالياً لدى Delta Holding في الرباط. يبني مواقع وتطبيقات أعمال باستخدام React وLaravel وSymfony وقواعد بيانات SQL، ولديه خبرة مع وكالات وعملاء دوليين.`
        ),
        links: [{ label: pick('About Hamza', 'À propos de Hamza', 'نبذة عن حمزة'), to: '/about' }],
      };
    }

    if (includesAny(query, ['thank', 'merci', 'shukran', 'great', 'parfait', 'شكرا'])) {
      return {
        text: pick(
          'You are welcome. If you would like to go further, WhatsApp is the fastest way to speak directly with Hamza.',
          'Avec plaisir. Si vous voulez aller plus loin, WhatsApp est le moyen le plus rapide de parler directement avec Hamza.',
          'على الرحب والسعة. إذا أردت المتابعة، فإن واتساب هو أسرع وسيلة للتحدث مباشرة مع حمزة.'
        ),
        links: contactLinks.slice(0, 1),
      };
    }

    if (query.trim().length <= 22 && includesAny(query, ['hello', 'hi', 'hey', 'bonjour', 'bonsoir', 'salut', 'salam', 'alo', 'مرحبا', 'السلام', 'اهلا'])) {
      return {
        text: pick(
          'Hello and welcome. I can help you explore services, projects and skills, download the CV, or contact Hamza on WhatsApp. What are you looking for?',
          'Bonjour et bienvenue. Je peux vous aider à choisir un service, voir les projets/compétences de Hamza, télécharger son CV ou le contacter sur WhatsApp. Que cherchez-vous ?',
          'مرحباً بك. يمكنني مساعدتك في استكشاف الخدمات والمشاريع والمهارات أو تحميل السيرة الذاتية أو التواصل مع حمزة عبر واتساب. ما الذي تبحث عنه؟'
        ),
        links: contactLinks,
      };
    }

    if (relevantProjects.length) {
      return {
        text: pick(
          'These portfolio projects look closest to what you asked for. Open a case study, or send the details on WhatsApp for a personalised answer.',
          'Je trouve ces projets proches de votre demande. Ouvrez une étude de cas, ou envoyez les détails sur WhatsApp pour une réponse personnalisée.',
          'تبدو مشاريع هذا الملف الأقرب إلى طلبك. افتح دراسة حالة، أو أرسل التفاصيل عبر واتساب للحصول على رد مخصص.'
        ),
        links: [...projectLinks(relevantProjects), ...contactLinks.slice(0, 1)],
      };
    }

    return {
      text: pick(
        "I can answer questions about Hamza's services, projects, skills, experience, timelines, CV and contact options. For a specific request — pricing, a custom project or a role — WhatsApp is fastest.",
        'Je peux répondre sur les services, projets, compétences, expérience, délais, CV et contact de Hamza. Pour une demande précise (prix, projet sur mesure, opportunité), WhatsApp est le plus rapide.',
        'يمكنني الإجابة عن أسئلة حول خدمات حمزة ومشاريعه ومهاراته وخبرته والآجال والسيرة الذاتية وطرق التواصل. ولطلب محدد — سعر أو مشروع على مقاسك أو وظيفة — فواتساب هو الأسرع.'
      ),
      links: [
        { label: pick('View services', 'Voir les services', 'عرض الخدمات'), to: '/services' },
        { label: pick('View projects', 'Voir les projets', 'عرض المشاريع'), to: '/projects' },
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
        aria-label={open ? t('chat.closeAssistant') : t('chat.openAssistant')}
      >
        {open ? <FaXmark aria-hidden="true" /> : <FaRobot aria-hidden="true" />}
        <span>{open ? t('common.close') : t('common.askAi')}</span>
      </button>

      {open && (
        <section className="chatbot-panel" id="portfolio-chatbot" aria-label={t('chat.panelLabel')}>
          <header className="chatbot-head">
            <span className="chatbot-avatar" aria-hidden="true"><FaRobot /></span>
            <span>
              <strong>{t('chat.assistantName')}</strong>
              <small><span className="pulse" aria-hidden="true" /> {t('chat.online')}</small>
            </span>
            <button type="button" className="chatbot-close" onClick={() => setOpen(false)} aria-label={t('chat.closeChatbot')}>
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
              <div className="chat-message-row bot" aria-label={t('chat.typing')}>
                <div className="chat-message bot typing"><span /><span /><span /></div>
              </div>
            )}
          </div>

          <div className="chat-quick" aria-label={t('chat.suggested')}>
            {quickPrompts.map((prompt) => (
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
            <label className="sr-only" htmlFor="chatbot-input">{t('chat.inputLabel')}</label>
            <input
              id="chatbot-input"
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={t('chat.placeholder')}
              autoComplete="off"
            />
            <button type="submit" disabled={!input.trim() || typing} aria-label={t('chat.send')}>
              <FaPaperPlane aria-hidden="true" />
            </button>
          </form>
          <p className="chatbot-note">{t('chat.note')}</p>
        </section>
      )}
    </>
  );
}
