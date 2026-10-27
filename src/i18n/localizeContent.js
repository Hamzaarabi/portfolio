import { useMemo } from 'react';
import {
  education as defaultEducation,
  experience as defaultExperience,
  faqs as defaultFaqs,
  process as defaultProcess,
  profile as defaultProfile,
  services as defaultServices,
  traits as defaultTraits,
} from '../data/portfolio';
import { translations } from './translations';
import { useLanguage } from './LanguageContext';

const WHATSAPP_MESSAGES = {
  en: "Hello Hamza, I found your portfolio and I'd like to discuss a project / opportunity.",
  fr: 'Bonjour Hamza, j’ai trouvé votre portfolio et j’aimerais discuter d’un projet ou d’une opportunité.',
  ar: 'مرحباً حمزة، وجدت ملفك الشخصي وأود مناقشة مشروع أو فرصة عمل.',
};

const PROFILE_TRANSLATIONS = {
  fr: {
    fullName: 'Arabi Hamza',
    role: 'Développeur Web Full-Stack',
    roles: ['Développeur Full-Stack', 'Développeur React', 'Développeur Laravel & Symfony', 'Développeur Web Freelance'],
    location: 'Maroc',
    languages: ['Arabe', 'Français', 'Anglais'],
    currentRole: 'Développeur Full-Stack @ Delta Holding',
    availabilityLabel: 'Ouvert aux projets freelance et aux postes full-time',
    tagline:
      'J’aide les entreprises et les recruteurs à livrer des sites et applications métier rapides et professionnels — interfaces React, back-ends Laravel & Symfony, bases de données SQL et outils compatibles ERP qui transforment les visiteurs en clients.',
    about: [
      'Je suis Arabi Hamza, développeur web full-stack basé au Maroc. Je construis et maintiens actuellement des plateformes web chez Delta Holding à Rabat. J’interviens sur toute la chaîne : React et JavaScript côté front-end, Laravel, Symfony et PHP côté back-end, MySQL, SQL Server et MongoDB pour les données — sans oublier des outils métier comme Sage ERP au quotidien.',
      'Mon parcours a commencé par un diplôme en Développement Digital (option web full-stack) à l’ISTA NTIC Settat, suivi d’expériences concrètes en agence et en entreprise : sites d’entreprise, plateforme et application mobile d’assurance, améliorations SEO et outils de données. J’ai récemment obtenu une Licence en Génie Informatique & Digitalisation à l’ENSA Kénitra.',
      'Je soigne les détails que les utilisateurs ressentent : des interfaces propres conçues sur Figma, un comportement responsive fluide sur tous les écrans et un code qui reste maintenable longtemps après le lancement.',
    ],
    highlights: [
      'Livraison de bout en bout : design Figma → interface React → API Laravel/Symfony → base de données SQL',
      'Expérience professionnelle en entreprise (Delta Holding), en agence et avec un client international',
      'Vision business : des sites et outils internes conçus pour gagner du temps et générer des prospects',
      'Communication rapide et directe sur WhatsApp — en arabe, français et anglais',
    ],
    statsLabels: ['Années d’expérience', 'Projets à la une', 'Technologies et outils', 'Langues parlées'],
  },
  ar: {
    fullName: 'العربي حمزة',
    role: 'مطوّر ويب شامل',
    roles: ['مطوّر شامل', 'مطوّر React', 'مطوّر Laravel و Symfony', 'مطوّر ويب مستقل'],
    location: 'المغرب',
    languages: ['العربية', 'الفرنسية', 'الإنجليزية'],
    currentRole: 'مطوّر شامل لدى Delta Holding',
    availabilityLabel: 'متاح لمشاريع مستقلة ووظائف بدوام كامل',
    tagline:
      'أساعد الشركات ومسؤولي التوظيف على إطلاق مواقع وتطبيقات أعمال سريعة واحترافية — واجهات React، وواجهات خلفية بـ Laravel وSymfony، وقواعد بيانات SQL، وأدوات جاهزة لبيئات ERP تحوّل الزوار إلى عملاء.',
    about: [
      'أنا العربي حمزة، مطوّر ويب شامل مقيم في المغرب، أعمل حالياً على بناء منصات ويب وصيانتها لدى Delta Holding في الرباط. أعمل عبر السلسلة كاملة: React وJavaScript في الواجهة الأمامية، وLaravel وSymfony وPHP في الواجهة الخلفية، مع MySQL وSQL Server وMongoDB للبيانات — إضافة إلى أدوات أعمال مثل Sage ERP في العمل اليومي.',
      'بدأت مسيرتي بدبلوم في التطوير الرقمي (تخصص الويب الشامل) من ISTA NTIC سطات، ثم خضت تجارب عملية في الوكالات والشركات: مواقع شركات، ومنصة وتطبيق تأمين، وتحسينات SEO وأدوات للبيانات. وقد أكملت حديثاً إجازة في الهندسة المعلوماتية والرقمنة في ENSA القنيطرة.',
      'أهتم بالتفاصيل التي يشعر بها المستخدم: واجهات نظيفة مصممة على Figma، وسلوك متجاوب وسلس على كل الشاشات، وكود يبقى قابلاً للصيانة بعد الإطلاق بوقت طويل.',
    ],
    highlights: [
      'تسليم متكامل من البداية إلى النهاية: تصميم Figma ← واجهة React ← واجهة Laravel/Symfony البرمجية ← قاعدة بيانات SQL',
      'خبرة مهنية في الشركات (Delta Holding) والوكالات ومع عميل دولي',
      'عقلية موجهة للأعمال: مواقع وأدوات داخلية مصممة لتوفير الوقت وجذب العملاء',
      'تواصل سريع ومباشر عبر واتساب — بالعربية والفرنسية والإنجليزية',
    ],
    statsLabels: ['سنوات من الخبرة', 'مشاريع مميزة', 'تقنية وأداة', 'لغات أتحدثها'],
  },
};

const SERVICE_TRANSLATIONS = {
  fr: [
    { title: 'Sites & applications web', desc: 'Des sites professionnels et applications web sur mesure, rapides, crédibles, qui transforment les visiteurs en demandes, réservations et ventes.', points: ['Sites d’entreprise et portfolios', 'Applications web sur mesure (React)', 'Pages d’atterrissage qui convertissent'] },
    { title: 'Boutiques e-commerce', desc: 'Des boutiques conçues pour vendre : fiches produits claires, parcours d’achat simples et catalogue facile à mettre à jour par votre équipe.', points: ['Catalogues et catégories produits', 'Panier et parcours de commande', 'Intégration WhatsApp commandes/contact'] },
    { title: 'ERP & logiciels métier', desc: 'Des outils internes et logiciels de gestion pour les entreprises — le type de systèmes que j’accompagne au quotidien chez Delta Holding, environnements Sage ERP inclus.', points: ['Tableaux de bord et panneaux d’administration', 'Support Sage ERP et données métier', 'Outils internes qui font gagner du temps'] },
    { title: 'Back-end & APIs', desc: 'Des back-ends Laravel et Symfony sûrs et maintenables : authentification, APIs REST et logique métier sur lesquelles vos interfaces et applications mobiles peuvent compter.', points: ['Développement Laravel & Symfony', 'Conception et intégration d’APIs REST', 'Systèmes d’administration / back-office'] },
    { title: 'Bases de données & données', desc: 'Des couches de données bien structurées avec MySQL, SQL Server et MongoDB — plus nettoyage, migration et reporting pour garder des chiffres fiables.', points: ['Conception de bases (SQL Server / MySQL)', 'Requêtes, rapports et optimisation', 'Import, nettoyage et migration de données'] },
    { title: 'UI/UX & design web', desc: 'Des interfaces conçues sur Figma avant la première ligne de code, pour un produit final soigné qui guide l’utilisateur sans effort vers l’action.', points: ['Wireframes et prototypes Figma', 'Design de pages aligné à la marque', 'Logos et visuels graphiques'] },
    { title: 'Applications mobiles & responsive', desc: 'Des sites mobile-first impeccables sur tous les téléphones — et des applications hybrides Android/iOS avec Capacitor à partir d’un seul code.', points: ['Design responsive mobile-first', 'Applications hybrides Capacitor', 'Tests multi-appareils'] },
    { title: 'SEO & vitesse', desc: 'Être trouvé sur Google et garder vos visiteurs : SEO technique, pages sémantiques et optimisation des performances fondés sur une vraie expérience en production.', points: ['SEO on-page et technique', 'Optimisation Core Web Vitals', 'Structure prête pour l’analytics'] },
    { title: 'Maintenance & support', desc: 'Un suivi continu pour vos sites et outils métier en production : mises à jour, correctifs, nouvelles fonctionnalités et support convivial, y compris par WhatsApp.', points: ['Mises à jour, correctifs et nouveautés', 'Gestion de contenu et de données', 'Support rapide pour votre équipe'] },
  ],
  ar: [
    { title: 'المواقع وتطبيقات الويب', desc: 'مواقع أعمال احترافية وتطبيقات ويب مخصصة تُحمَّل بسرعة وتبدو جديرة بالثقة وتحوّل الزوار إلى طلبات وحجوزات ومبيعات.', points: ['مواقع الشركات والملفات الشخصية', 'تطبيقات ويب مخصصة (React)', 'صفحات هبوط تحوّل الزوار إلى عملاء'] },
    { title: 'المتاجر الإلكترونية', desc: 'متاجر مصممة للبيع: صفحات منتجات واضحة ومسارات شراء بسيطة وكتالوج يسهل على فريقك تحديثه.', points: ['كتالوجات وفئات للمنتجات', 'سلة ومسارات طلب', 'ربط الطلبات والتواصل عبر واتساب'] },
    { title: 'أنظمة ERP وبرامج الأعمال', desc: 'أدوات داخلية وبرامج إدارة للشركات — من النوع الذي أدعمه يومياً لدى Delta Holding، بما في ذلك بيئات Sage ERP.', points: ['لوحات معلومات وواجهات إدارة', 'دعم Sage ERP وبيانات الأعمال', 'أدوات داخلية توفّر وقت الفرق'] },
    { title: 'الواجهة الخلفية وواجهات API', desc: 'واجهات خلفية آمنة وقابلة للصيانة باستخدام Laravel وSymfony: مصادقة وواجهات REST ومنطق أعمال تعتمد عليه واجهاتك وتطبيقات هاتفك.', points: ['تطوير Laravel وSymfony', 'تصميم واجهات REST ودمجها', 'أنظمة إدارة ومكاتب خلفية'] },
    { title: 'قواعد البيانات والبيانات', desc: 'طبقات بيانات منظمة جيداً عبر MySQL وSQL Server وMongoDB — مع التنظيف والترحيل وإعداد التقارير حتى تبقى أرقامك موثوقة.', points: ['تصميم قواعد البيانات (SQL Server / MySQL)', 'الاستعلامات والتقارير والتحسين', 'استيراد البيانات وتنظيفها وترحيلها'] },
    { title: 'واجهة وتجربة المستخدم وتصميم الويب', desc: 'واجهات تُصمَّم على Figma قبل كتابة أول سطر برمجي، ليبدو المنتج النهائي أنيقاً ويقود المستخدمين إلى الإجراء المطلوب بلا جهد.', points: ['مخططات ونماذج أولية على Figma', 'تصميم صفحات منسجم مع هويتك', 'شعارات وعناصر بصرية'] },
    { title: 'تطبيقات الهاتف والتصميم المتجاوب', desc: 'مواقع تُصمَّم للهاتف أولاً وتعمل بجمال على كل الأجهزة — إضافة إلى تطبيقات هجينة لنظامي Android وiOS باستخدام Capacitor من قاعدة كود واحدة.', points: ['تصميم متجاوب يبدأ من الهاتف', 'تطبيقات هجينة بـ Capacitor', 'اختبار عبر مختلف الأجهزة'] },
    { title: 'تحسين محركات البحث والسرعة', desc: 'ليجدك الناس على Google ويبقوا في موقعك: تحسين تقني لمحركات البحث وصفحات ذات بنية دلالية وضبط للأداء مستند إلى خبرة إنتاجية حقيقية.', points: ['تحسين SEO داخل الصفحات وتقنياً', 'تحسين مؤشرات Core Web Vitals', 'بنية جاهزة لأدوات القياس والتحليل'] },
    { title: 'الصيانة والدعم', desc: 'رعاية مستمرة للمواقع وأدوات الأعمال المباشرة: تحديثات وإصلاحات ومزايا جديدة ودعم ودود، بما في ذلك عبر واتساب.', points: ['تحديثات وإصلاحات ومزايا جديدة', 'إدارة المحتوى والبيانات', 'دعم سريع لفريقك'] },
  ],
};

const PROCESS_TRANSLATIONS = {
  fr: [
    { title: 'Découvrir', desc: 'Nous clarifions vos objectifs, votre audience et les fonctionnalités indispensables. Vous recevez un avis honnête sur le périmètre, la stack et les délais avant tout développement.' },
    { title: 'Concevoir', desc: 'Je transforme vos besoins en designs Figma cliquables que vous pouvez valider — aucune surprise au démarrage du développement.' },
    { title: 'Développer', desc: 'Front-end, back-end et base de données se rejoignent par increments propres et testés, avec un avancement que vous pouvez suivre.' },
    { title: 'Lancer & accompagner', desc: 'Déploiement, vérifications SEO et réglages de performance — puis maintenance continue pour faire progresser votre site après le lancement.' },
  ],
  ar: [
    { title: 'الاكتشاف', desc: 'نوضح أهدافك وجمهورك والمزايا الضرورية، وتحصل على رأي صادق حول النطاق والتقنيات والآجال قبل بناء أي شيء.' },
    { title: 'التصميم', desc: 'أحوّل المتطلبات إلى تصاميم Figma قابلة للنقر يمكنك مراجعتها والموافقة عليها — بلا مفاجآت عند بدء التطوير.' },
    { title: 'البناء', desc: 'تجتمع الواجهة الأمامية والخلفية وقاعدة البيانات عبر مراحل نظيفة ومختبرة، مع تقدم يمكنك مراجعته أولاً بأول.' },
    { title: 'الإطلاق والدعم', desc: 'النشر وفحوص SEO وضبط الأداء — ثم صيانة مستمرة حتى يواصل موقعك التحسن بعد الإطلاق.' },
  ],
};

const TRAIT_TRANSLATIONS = {
  fr: [
    { title: 'Communicatif', desc: 'J’équilibre parole et écoute pour une communication claire, honnête et efficace.' },
    { title: 'Collaboratif', desc: 'Le travail d’équipe fait réussir les projets : la collaboration d’abord, l’excellence ensuite.' },
    { title: 'Travailleur', desc: 'Je m’investis pleinement pour atteindre les objectifs et livrer à temps, à chaque fois.' },
    { title: 'Résolution de problèmes', desc: 'Je découpe les problèmes complexes en étapes simples et pratiques — puis je les exécute méthodiquement.' },
  ],
  ar: [
    { title: 'متواصل فعّال', desc: 'أوازن بين التحدث والإصغاء لأحافظ على تواصل واضح وصادق وفعّال.' },
    { title: 'روح الفريق', desc: 'العمل الجماعي يصنع النجاح: التعاون أولاً، ثم يأتي العمل الممتاز.' },
    { title: 'مجتهد', desc: 'أبذل كامل جهدي في العمل لتحقيق الأهداف والتسليم في الوقت، في كل مرة.' },
    { title: 'حلّال للمشاكل', desc: 'أقسّم المشاكل المعقدة إلى خطوات بسيطة وعملية — ثم أنفّذها بمنهجية.' },
  ],
};

const EXPERIENCE_TRANSLATIONS = {
  fr: [
    { period: '2024 — Aujourd’hui', title: 'Développeur Web Full-Stack', org: 'Delta Holding · Skhirat, Rabat', points: ['Concevoir, développer et livrer de nouveaux sites et pages internes de l’entreprise', 'Maintenir et faire évoluer les sites existants : fonctionnalités, correctifs et contenus', 'Gérer les données métier et assurer le support technique quotidien aux équipes'] },
    { period: '2023 — 2024', title: 'Développeur Web Full-Stack', org: 'Marketing Support Services · Settat', points: ['Créer et modifier des sites clients de bout en bout', 'Améliorer la visibilité grâce au SEO technique et on-page', 'Automatiser la collecte de données par web scraping et gérer les données de l’entreprise'] },
    { period: 'Mars 2023', title: 'Stage', org: 'Tribunal de première instance · Settat', points: ['Renforcer communication, résolution de problèmes et travail d’équipe dans un environnement administratif formel'] },
  ],
  ar: [
    { period: '2024 — حتى الآن', title: 'مطوّر ويب شامل', org: 'Delta Holding · الصخيرات، الرباط', points: ['تصميم مواقع وصفحات داخلية جديدة للشركة وبناؤها وإطلاقها', 'صيانة المواقع الحالية وتطويرها: مزايا وإصلاحات وتحديثات محتوى', 'إدارة بيانات الأعمال وتقديم الدعم التقني اليومي للفرق'] },
    { period: '2023 — 2024', title: 'مطوّر ويب شامل', org: 'Marketing Support Services · سطات', points: ['إنشاء مواقع العملاء وتعديلها من البداية إلى النهاية', 'تحسين الظهور عبر SEO التقني وداخل الصفحات', 'أتمتة جمع البيانات باستخراجها من الويب وإدارة بيانات الشركة'] },
    { period: 'مارس 2023', title: 'تدريب مهني', org: 'المحكمة الابتدائية · سطات', points: ['تقوية مهارات التواصل وحل المشاكل والعمل الجماعي في بيئة إدارية رسمية'] },
  ],
};

const EDUCATION_TRANSLATIONS = {
  fr: [
    { period: '2024 — 2025', title: 'Licence — Génie Informatique & Digitalisation', org: 'ENSA Kénitra', points: ['Études avancées en informatique et transformation digitale'] },
    { period: '2021 — 2023', title: 'Diplôme en Développement Digital — Web Full-Stack', org: 'ISTA NTIC Settat', points: ['Programme spécialisé de deux ans : front-end, back-end et bases de données'] },
    { period: '2020 — 2021', title: 'Baccalauréat — Sciences de la Vie et de la Terre', org: 'Lycée Al Amal', points: ['Diplôme du baccalauréat, filière scientifique'] },
  ],
  ar: [
    { period: '2024 — 2025', title: 'إجازة — الهندسة المعلوماتية والرقمنة', org: 'ENSA القنيطرة', points: ['دراسات متقدمة في علوم الحاسوب والتحول الرقمي'] },
    { period: '2021 — 2023', title: 'دبلوم التطوير الرقمي — الويب الشامل', org: 'ISTA NTIC سطات', points: ['برنامج متخصص لمدة سنتين يشمل الواجهة الأمامية والخلفية وقواعد البيانات'] },
    { period: '2020 — 2021', title: 'بكالوريا — علوم الحياة والأرض', org: 'ثانوية الأمل', points: ['شهادة بكالوريا في الشعبة العلمية'] },
  ],
};

const FAQ_TRANSLATIONS = {
  fr: [
    { q: 'Êtes-vous disponible pour de nouveaux projets ou postes ?', a: 'Oui — je suis ouvert aux projets freelance et aux postes full-time. Le plus rapide est WhatsApp au 06 20 86 16 34 (bouton vert du site) ; vous pouvez aussi utiliser le formulaire ou l’e-mail, et je réponds généralement sous 24 à 48 heures.' },
    { q: 'Travaillez-vous à distance ?', a: 'Absolument. Je suis basé au Maroc et j’ai déjà livré un projet pour un client international (suisse). Je communique couramment en arabe, français et anglais, ce qui fluidifie la collaboration transfrontalière.' },
    { q: 'Quelles technologies maîtrisez-vous ?', a: 'Ma stack principale : React et JavaScript côté front-end, Laravel, Symfony et PHP côté back-end, MySQL, SQL Server et MongoDB pour les données. Je conçois sur Figma et peux aussi livrer des sites WordPress et des applications mobiles hybrides avec Capacitor.' },
    { q: 'Pouvez-vous refondre ou maintenir un site existant ?', a: 'Oui — une grande partie de mon travail professionnel consiste à maintenir et améliorer des sites en production : nouvelles fonctionnalités, refontes, performance, SEO et mises à jour de contenu/données.' },
    { q: 'Combien de temps faut-il pour un site typique ?', a: 'Cela dépend du périmètre : un site d’entreprise soigné prend généralement 2 à 4 semaines, tandis que les applications plus larges sont planifiées par jalons. Après un court échange découverte, je vous donnerai une estimation claire et honnête.' },
  ],
  ar: [
    { q: 'هل أنت متاح لمشاريع أو وظائف جديدة؟', a: 'نعم — أنا منفتح على المشاريع المستقلة ووظائف الدوام الكامل. أسرع وسيلة للتواصل هي واتساب على 06 20 86 16 34 (الزر الأخضر في هذا الموقع)؛ ويمكنك أيضاً استخدام نموذج التواصل أو البريد الإلكتروني، وأرد عادة خلال 24 إلى 48 ساعة.' },
    { q: 'هل تعمل عن بُعد؟', a: 'بالتأكيد. أنا مقيم في المغرب وقد سلّمت عملاً لعميل دولي (سويسري). أتواصل بطلاقة بالعربية والفرنسية والإنجليزية، ما يجعل التعاون عبر الحدود سلساً.' },
    { q: 'ما التقنيات التي تتخصص فيها؟', a: 'تقنياتي الأساسية هي React وJavaScript في الواجهة الأمامية، وLaravel وSymfony وPHP في الواجهة الخلفية، مع MySQL وSQL Server وMongoDB للبيانات. أصمم باستخدام Figma ويمكنني أيضاً تقديم مواقع WordPress وتطبيقات هاتف هجينة بـ Capacitor.' },
    { q: 'هل يمكنك إعادة تصميم موقع قائم أو صيانته؟', a: 'نعم — جزء كبير من عملي المهني يتعلق بصيانة مواقع مباشرة وتحسينها: مزايا جديدة وإعادة تصميم وإصلاحات للأداء وSEO وتحديثات للمحتوى والبيانات.' },
    { q: 'كم يستغرق بناء موقع عادة؟', a: 'يعتمد ذلك على النطاق: يحتاج موقع أعمال متقن عادة من أسبوعين إلى أربعة أسابيع، بينما تُخطط التطبيقات الأكبر على مراحل. بعد محادثة اكتشاف قصيرة سأعطيك تقديراً واضحاً وصادقاً.' },
  ],
};

const GROUP_TRANSLATIONS = {
  fr: {
    'Front-End': 'Front-End',
    'Back-End & Data': 'Back-End & Données',
    'Tools & Business': 'Outils & Métier',
  },
  ar: {
    'Front-End': 'الواجهة الأمامية',
    'Back-End & Data': 'الواجهة الخلفية والبيانات',
    'Tools & Business': 'الأدوات والأعمال',
  },
};

const ROLE_TRANSLATIONS = {
  fr: {
    'Design & Full-Stack Development': 'Design & développement full-stack',
    'Front-End Development': 'Développement front-end',
    'Full-Stack Development': 'Développement full-stack',
    'Mobile Development': 'Développement mobile',
    'Design & Development': 'Design & développement',
  },
  ar: {
    'Design & Full-Stack Development': 'التصميم والتطوير الشامل',
    'Front-End Development': 'تطوير الواجهة الأمامية',
    'Full-Stack Development': 'التطوير الشامل',
    'Mobile Development': 'تطوير تطبيقات الهاتف',
    'Design & Development': 'التصميم والتطوير',
  },
};

const TAG_TRANSLATIONS = {
  fr: {
    Restaurant: 'Restaurant', Corporate: 'Entreprise', Responsive: 'Responsive', 'Live Site': 'Site en ligne',
    Insurance: 'Assurance', 'International Client': 'Client international', 'Mobile App': 'Application mobile',
    Portfolio: 'Portfolio', 'Design System': 'Système de design', 'E-Commerce': 'E-commerce', 'First Project': 'Premier projet',
  },
  ar: {
    Restaurant: 'مطعم', Corporate: 'شركة', Responsive: 'تصميم متجاوب', 'Live Site': 'موقع مباشر',
    Insurance: 'تأمين', 'International Client': 'عميل دولي', 'Mobile App': 'تطبيق هاتف',
    Portfolio: 'ملف شخصي', 'Design System': 'نظام تصميم', 'E-Commerce': 'تجارة إلكترونية', 'First Project': 'أول مشروع',
  },
};

const MONTH_TRANSLATIONS = {
  fr: { Jan: 'Janv.', Feb: 'Févr.', Mar: 'Mars', Apr: 'Avr.', May: 'Mai', Jun: 'Juin', Jul: 'Juil.', Aug: 'Août', Sep: 'Sept.', Oct: 'Oct.', Nov: 'Nov.', Dec: 'Déc.' },
  ar: { Jan: 'يناير', Feb: 'فبراير', Mar: 'مارس', Apr: 'أبريل', May: 'مايو', Jun: 'يونيو', Jul: 'يوليو', Aug: 'أغسطس', Sep: 'سبتمبر', Oct: 'أكتوبر', Nov: 'نوفمبر', Dec: 'ديسمبر' },
};

const PROJECT_TRANSLATIONS = {
  fr: {
    'chefood-restaurant': {
      title: 'Chefood — Site web de restaurant',
      short: 'Une plateforme de restaurant responsive conçue sur Figma, avec un front-end React alimenté par une API REST Laravel et MySQL.',
      overview: 'Chefood est un site de restaurant full-stack réalisé comme projet de fin d’études. L’expérience a d’abord été conçue sur Figma, puis implémentée en SPA React rapide communiquant avec une API REST Laravel adossée à MySQL. Les visiteurs explorent le menu et les offres puis avancent naturellement vers la réservation — le tout dans une identité visuelle appétissante, entièrement responsive du téléphone au bureau.',
      features: ['Processus Figma d’abord, traduit fidèlement en composants React', 'API REST Laravel avec une base MySQL structurée derrière le front-end', 'Menu, offres et appels à la réservation pensés pour convertir', 'Mise en page entièrement responsive en grille Bootstrap et CSS personnalisé'],
    },
    'voip-it-ltd': {
      title: 'VoIP IT Ltd — Site corporate',
      short: 'Un site corporate en ligne, mobile-first, pour une entreprise VoIP, construit à la main en HTML, CSS et JavaScript pour la vitesse et la clarté.',
      overview: 'Un site corporate en production pour Voipitltds, entreprise de services VoIP. Développé mobile-first en HTML sémantique, CSS moderne et JavaScript vanilla, il privilégie chargement rapide, navigation fluide entre sections et interface agréable sur tous les appareils. Ce projet a aiguisé mon goût d’un front-end propre, sans dépendance inutile — le site est en ligne et utilisé chaque jour par l’entreprise.',
      features: ['En production sur voipitltds.com', 'Développement mobile-first, puis enrichi progressivement pour le bureau', 'Navigation fluide par défilement entre les sections', 'Aucun framework : poids minimal, compatibilité maximale'],
    },
    'previssime-insurance': {
      title: 'Previssime — Plateforme suisse d’assurance',
      short: 'Un site Laravel pour une agence d’assurance suisse, avec templates Blade, Bootstrap et JavaScript.',
      overview: 'Previssime est une plateforme web réalisée pour une agence d’assurance suisse avec Laravel. Rendue côté serveur en Blade pour la fiabilité et le SEO, stylée avec Bootstrap et du CSS sur mesure, puis enrichie d’interactions JavaScript. Travailler pour un client international dans un secteur réglementé m’a appris la valeur de la clarté, de la confiance et de la précision dans chaque écran.',
      features: ['Back-end Laravel avec templating Blade propre', 'UX assurance axée confiance pour un client international (suisse)', 'Mise en page Bootstrap responsive affinée en CSS personnalisé', 'Code structuré et maintenable, prêt à évoluer'],
    },
    'insurance-mobile-app': {
      title: 'Application mobile d’assurance — Capacitor',
      short: 'L’application mobile compagnon de l’agence d’assurance suisse, construite avec CapacitorJS sur les technologies web.',
      overview: 'Après la plateforme web Previssime, j’ai construit une application mobile pour la même agence suisse avec CapacitorJS. Un seul code web (HTML, CSS, JavaScript) empaqueté en application au ressenti natif — une voie efficace vers le mobile pour le client, et une belle leçon d’architecture hybride et de patterns UX mobiles pour moi.',
      features: ['Un seul code livré comme application mobile via CapacitorJS', 'Parcours et navigation d’assurance optimisés mobile', 'Expérience cohérente avec la plateforme web associée', 'Entièrement en technologies web : rapide à faire évoluer et maintenir'],
    },
    'personal-portfolio': {
      title: 'Portfolio personnel — Ce site web',
      short: 'Mon petit coin du web : d’abord construit avec React, aujourd’hui reconstruit sur Vite avec un système de design personnalisé, thèmes sombre/clair et images optimisées WebP.',
      overview: 'Ce site même. J’ai d’abord créé mon portfolio avec Create React App et Bootstrap ; la version actuelle est une reconstruction complète sur Vite + React avec un système de design CSS artisanal : thèmes sombre/clair, animations à l’apparition, palette ⌘K, études de cas filtrables avec galeries lightbox, et images passées d’environ 22 Mo de PNG à 2,6 Mo de WebP. Il est à la fois ma vitrine et mon terrain de jeu pour les pratiques front-end modernes.',
      features: ['Reconstruit sur Vite + React avec découpage de code par route', 'Système de design personnalisé, thèmes sombre/clair persistants', 'Palette de commandes ⌘K, statistiques animées et sections révélées au scroll', 'SEO complet : Open Graph, JSON-LD, sitemap et HTML sémantique'],
    },
    'firstcode-ecommerce': {
      title: 'FirstCode — Boutique e-commerce',
      short: 'Là où tout a commencé : ma toute première application web — une boutique de vêtements pour hommes, femmes et enfants, en HTML, CSS, JavaScript et jQuery.',
      overview: 'FirstCode est la première vraie application web que j’ai construite, en 2021 : une boutique de vêtements en ligne pour hommes, femmes et enfants, codée à la main en HTML, CSS, JavaScript et jQuery. Elle m’a appris les fondamentaux : mise en page, manipulation du DOM, grilles produits et interactions de type panier — et a allumé l’étincelle de la carrière qui a suivi. Je la garde ici comme rappel du chemin parcouru.',
      features: ['Ma première application web complète (2021)', 'Navigation par catégories : hommes, femmes et enfants', 'Listings produits interactifs en JavaScript & jQuery', 'HTML/CSS écrits à la main — les fondamentaux, appris proprement'],
    },
  },
  ar: {
    'chefood-restaurant': {
      title: 'Chefood — موقع مطعم',
      short: 'منصة مطعم متجاوبة صُممت على Figma وبُنيت بواجهة React تعتمد على واجهة Laravel REST وقاعدة MySQL.',
      overview: 'Chefood هو موقع مطعم شامل أنجزته كمشروع نهاية الدراسة. صُممت التجربة أولاً على Figma، ثم نُفذت كتطبيق React سريع يتصل بواجهة Laravel REST مدعومة بـ MySQL. يمكن للزوار استكشاف القائمة والعروض والانتقال بسلاسة نحو الحجز، ضمن هوية بصرية جريئة تفتح الشهية وتبقى متجاوبة بالكامل من الهاتف إلى الحاسوب.',
      features: ['عملية تبدأ من Figma وتُترجم بدقة إلى مكوّنات React', 'واجهة Laravel REST مع قاعدة MySQL منظمة خلف الواجهة الأمامية', 'قائمة وعروض ودعوات للحجز مصممة لتحويل الزوار إلى عملاء', 'تخطيط متجاوب بالكامل باستخدام شبكة Bootstrap وCSS مخصص'],
    },
    'voip-it-ltd': {
      title: 'VoIP IT Ltd — موقع شركة',
      short: 'موقع شركة مباشر يبدأ من الهاتف، بُني يدوياً باستخدام HTML وCSS وJavaScript من أجل السرعة والوضوح.',
      overview: 'موقع شركة إنتاجي لشركة Voipitltds المتخصصة في خدمات الصوت عبر الإنترنت. بُني للهاتف أولاً باستخدام HTML دلالي وCSS حديث وJavaScript خالص، ويركز على التحميل السريع والتنقل السلس داخل الصفحة وواجهة مريحة على كل جهاز. صقل هذا المشروع اهتمامي بحرفية الواجهة الأمامية النظيفة دون تبعيات زائدة — والموقع مباشر وتستخدمه الشركة يومياً.',
      features: ['مباشر في الإنتاج على voipitltds.com', 'تطوير يبدأ من الهاتف ثم يُحسَّن تدريجياً للحاسوب', 'تنقل سلس بالتمرير بين الأقسام', 'بناء بلا أطر عمل: وزن أدنى وتوافق أقصى'],
    },
    'previssime-insurance': {
      title: 'Previssime — منصة تأمين سويسرية',
      short: 'موقع يعمل بـ Laravel لوكالة تأمين سويسرية، باستخدام قوالب Blade وBootstrap وJavaScript.',
      overview: 'Previssime منصة ويب بُنيت لوكالة تأمين سويسرية باستخدام Laravel. تُعرض من الخادم بقوالب Blade من أجل الموثوقية وSEO، وتُنسَّق بـ Bootstrap وCSS مخصص، وتُعزَّز بتفاعلات JavaScript. علمني العمل لعميل دولي في قطاع منظم قيمة الوضوح والثقة والدقة في كل شاشة.',
      features: ['واجهة خلفية بـ Laravel وقوالب Blade نظيفة', 'تجربة تأمين تركز على الثقة لعميل دولي (سويسري)', 'تخطيط Bootstrap متجاوب مُحسَّن بـ CSS مخصص', 'قاعدة كود منظمة وقابلة للصيانة وجاهزة للتطور'],
    },
    'insurance-mobile-app': {
      title: 'تطبيق تأمين للهاتف — Capacitor',
      short: 'تطبيق مرافق عبر المنصات لوكالة التأمين السويسرية، بُني باستخدام CapacitorJS وتقنيات الويب.',
      overview: 'بعد منصة Previssime على الويب، بنيت تطبيق هاتف لوكالة التأمين السويسرية نفسها باستخدام CapacitorJS. قاعدة كود ويب واحدة (HTML وCSS وJavaScript) حُزّمت في تطبيق بإحساس أصلي — طريق فعال نحو الهاتف للعميل، ودرس مهم لي في بنية التطبيقات الهجينة وأنماط تجربة استخدام الهاتف.',
      features: ['قاعدة كود واحدة تُشحن كتطبيق هاتف عبر CapacitorJS', 'مسارات وتنقل تأمين محسّنة للهاتف', 'تجربة منسجمة مع منصة الويب المرافقة', 'بُني بالكامل بتقنيات الويب: سريع التكرار والصيانة'],
    },
    'personal-portfolio': {
      title: 'ملفي الشخصي — هذا الموقع',
      short: 'ركني الخاص على الويب: بُني في البداية باستخدام React، والآن أُعيد بناؤه على Vite مع نظام تصميم مخصص ومظهرين داكن وفاتح وصور WebP محسّنة.',
      overview: 'هذا الموقع نفسه. بنيت ملفي الشخصي أولاً باستخدام Create React App وBootstrap؛ أما النسخة الحالية فهي إعادة بناء كاملة على Vite وReact مع نظام تصميم CSS مصنوع يدوياً: مظهران داكن وفاتح، وحركات عند التمرير، ولوحة أوامر ⌘K، ودراسات حالة قابلة للتصفية مع معارض منبثقة، وصور حُسّنت من نحو 22 ميغابايت PNG إلى نحو 2.6 ميغابايت WebP. إنه واجهتي وميدان تجاربي لممارسات الواجهة الأمامية الحديثة في آن.',
      features: ['أُعيد بناؤه على Vite وReact مع تقسيم الكود حسب المسارات', 'نظام تصميم مخصص مع مظهرين داكن وفاتح محفوظين', 'لوحة أوامر ⌘K وإحصاءات متحركة وأقسام تظهر عند التمرير', 'إعداد SEO كامل: Open Graph وJSON-LD وخريطة موقع وHTML دلالي'],
    },
    'firstcode-ecommerce': {
      title: 'FirstCode — متجر إلكتروني',
      short: 'من هنا بدأ كل شيء: أول تطبيق ويب لي على الإطلاق — متجر ملابس للرجال والنساء والأطفال، بُني باستخدام HTML وCSS وJavaScript وjQuery.',
      overview: 'FirstCode هو أول تطبيق ويب حقيقي بنيته في 2021: متجر ملابس إلكتروني للرجال والنساء والأطفال، كتبته يدوياً باستخدام HTML وCSS وJavaScript وjQuery. علمني الأساسيات — التخطيط والتعامل مع DOM وشبكات المنتجات وتفاعلات تشبه سلة الشراء — وأطلق المسيرة التي تلت ذلك. أحتفظ به هنا تذكيراً بمدى ما قطعته الرحلة.',
      features: ['أول تطبيق ويب كامل لي (2021)', 'تصفح حسب فئات ملابس الرجال والنساء والأطفال', 'قوائم منتجات تفاعلية بـ JavaScript وjQuery', 'HTML وCSS مكتوبان يدوياً — الأساسيات كما يجب أن تُتعلم'],
    },
  },
};

const CATEGORY_KEYS = {
  'Full-Stack': 'fullStack',
  Frontend: 'frontend',
  Mobile: 'mobile',
};

function localizedWhatsAppLink(language) {
  const message = WHATSAPP_MESSAGES[language] || WHATSAPP_MESSAGES.en;
  return `https://wa.me/${defaultProfile.whatsapp}?text=${encodeURIComponent(message)}`;
}

export function localizeProfile(language) {
  const localized = PROFILE_TRANSLATIONS[language];
  if (!localized) return { ...defaultProfile, whatsappLink: localizedWhatsAppLink('en') };

  return {
    ...defaultProfile,
    fullName: localized.fullName,
    role: localized.role,
    roles: localized.roles,
    location: localized.location,
    languages: localized.languages,
    currentRole: localized.currentRole,
    availabilityLabel: localized.availabilityLabel,
    tagline: localized.tagline,
    about: localized.about,
    highlights: localized.highlights,
    whatsappLink: localizedWhatsAppLink(language),
    stats: defaultProfile.stats.map((stat, index) => ({
      ...stat,
      label: localized.statsLabels[index] || stat.label,
    })),
  };
}

export function useLocalizedProfile() {
  const { language } = useLanguage();
  return useMemo(() => localizeProfile(language), [language]);
}

function mapByIndex(items, localizedItems) {
  if (!localizedItems) return items;
  return items.map((item, index) => ({ ...item, ...(localizedItems[index] || {}) }));
}

export function localizeServices(language, items = defaultServices) {
  return mapByIndex(items, SERVICE_TRANSLATIONS[language]);
}

export function localizeProcess(language, items = defaultProcess) {
  return mapByIndex(items, PROCESS_TRANSLATIONS[language]);
}

export function localizeTraits(language, items = defaultTraits) {
  return mapByIndex(items, TRAIT_TRANSLATIONS[language]);
}

export function localizeFaqs(language, items = defaultFaqs) {
  return mapByIndex(items, FAQ_TRANSLATIONS[language]);
}

export function localizeEducation(language, items = defaultEducation) {
  return mapByIndex(items, EDUCATION_TRANSLATIONS[language]);
}

function isDefaultExperience(items) {
  if (!Array.isArray(items) || items.length !== defaultExperience.length) return false;
  return items.every((item, index) => {
    const expected = defaultExperience[index];
    return item.period === expected.period
      && item.title === expected.title
      && item.org === expected.org
      && JSON.stringify(item.points || []) === JSON.stringify(expected.points || []);
  });
}

export function localizeExperience(language, items) {
  if (!EXPERIENCE_TRANSLATIONS[language] || !isDefaultExperience(items)) return items;
  return mapByIndex(items, EXPERIENCE_TRANSLATIONS[language]);
}

export function localizeSkillGroups(language, groups) {
  const groupNames = GROUP_TRANSLATIONS[language] || {};
  return groups.map((group) => ({
    ...group,
    canonicalTitle: group.title,
    title: groupNames[group.title] || group.title,
  }));
}

export function localizeCategory(language, category) {
  const key = CATEGORY_KEYS[category];
  if (!key) return category;
  return translations[language]?.projects?.categories?.[key]
    || translations.en.projects.categories[key]
    || category;
}

export function localizeProjectFilter(language, filter) {
  if (filter === 'All') return translations[language]?.projects?.filters?.all || filter;
  return localizeCategory(language, filter);
}

function localizeDate(language, date) {
  const months = MONTH_TRANSLATIONS[language];
  if (!months || !date) return date;
  return Object.entries(months).reduce(
    (value, [english, localized]) => value.replace(new RegExp(`^${english}\\b`), localized),
    String(date)
  );
}

function localizeTag(language, tag) {
  return TAG_TRANSLATIONS[language]?.[tag] || tag;
}

export function localizeProject(language, project) {
  const localized = PROJECT_TRANSLATIONS[language]?.[project.slug];
  const title = localized?.title || project.title;
  const short = localized?.short || project.short;
  const overview = localized?.overview || project.overview;
  const features = localized?.features || project.features;
  const tags = (project.tags || []).map((tag) => localizeTag(language, tag));
  const searchText = [
    project.title, project.short, project.overview, project.category, project.role,
    title, short, overview,
    ...(project.stack || []), ...(project.tags || []), ...tags,
  ].filter(Boolean).join(' ').toLowerCase();

  return {
    ...project,
    title,
    short,
    overview,
    features,
    tags,
    canonicalTitle: project.title,
    categoryLabel: localizeCategory(language, project.category),
    role: ROLE_TRANSLATIONS[language]?.[project.role] || project.role,
    date: localizeDate(language, project.date),
    searchText,
  };
}

export function localizeProjects(language, projects) {
  return projects.map((project) => localizeProject(language, project));
}
