/**
 * ─────────────────────────────────────────────────────────────
 *  SINGLE SOURCE OF TRUTH for all portfolio content.
 *  Edit text, links, skills and projects here — every page
 *  updates automatically.
 * ─────────────────────────────────────────────────────────────
 */
import {
  FaReact, FaLaravel, FaHtml5, FaCss3Alt, FaBootstrap, FaFigma, FaWordpress,
  FaPython, FaGitAlt, FaCloud, FaCode, FaServer, FaMobileScreenButton,
  FaGaugeHigh, FaScrewdriverWrench, FaPenRuler, FaComments, FaHandshake,
  FaBolt, FaLightbulb,
} from 'react-icons/fa6';
import { IoLogoJavascript, IoLogoCapacitor } from 'react-icons/io5';
import { BiLogoJquery } from 'react-icons/bi';
import { SiMysql, SiMongodb, SiPhp } from 'react-icons/si';

import chefoodCover from '../assets/webp/chefood.webp';
import voipCover from '../assets/webp/voip.webp';
import previssimeCover from '../assets/webp/previssime.webp';
import mobileCover from '../assets/webp/mobile-app.webp';
import portfolioCover from '../assets/webp/portfolio.webp';
import firstcodeCover from '../assets/webp/firstcode.webp';

import structureChefood from '../assets/webp/file_structure/file_structure_Chefood.webp';
import structureVoip from '../assets/webp/file_structure/file_structure_voip.webp';
import structurePrevissime from '../assets/webp/file_structure/file_structure_previssime.webp';
import structureApp from '../assets/webp/file_structure/file_structure_application.webp';
import structurePortfolio from '../assets/webp/file_structure/file_structure_Portfolio.webp';
import structureFirstCode from '../assets/webp/file_structure/file_structure_firstCode.webp';

/** Collect a gallery folder's WebP images in numeric order. */
const galleryOf = (modules) =>
  Object.entries(modules)
    .sort(([a], [b]) => (parseInt(a.match(/(\d+)\.webp$/)?.[1] ?? 0, 10) - parseInt(b.match(/(\d+)\.webp$/)?.[1] ?? 0, 10)))
    .map(([, src]) => src);

const galleries = {
  project1: galleryOf(import.meta.glob('../assets/webp/project1/*.webp', { eager: true, import: 'default' })),
  project2: galleryOf(import.meta.glob('../assets/webp/project2/*.webp', { eager: true, import: 'default' })),
  project3: galleryOf(import.meta.glob('../assets/webp/project3/*.webp', { eager: true, import: 'default' })),
  project4: galleryOf(import.meta.glob('../assets/webp/project4/*.webp', { eager: true, import: 'default' })),
  project5: galleryOf(import.meta.glob('../assets/webp/project5/*.webp', { eager: true, import: 'default' })),
  project6: galleryOf(import.meta.glob('../assets/webp/project6/*.webp', { eager: true, import: 'default' })),
};

/* ── Profile ──────────────────────────────────────────────── */
export const profile = {
  firstName: 'Hamza',
  fullName: 'Arabi Hamza',
  role: 'Full-Stack Web Developer',
  roles: ['Full-Stack Developer', 'React Developer', 'Laravel Developer', 'UI-Focused Engineer'],
  location: 'morocco',
  email: 'arabihamzaaa@gmail.com',
  phone: '+212-698336744',
  phoneDisplay: '+212 698-336744',
  languages: ['Arabic', 'French', 'English'],
  currentRole: 'Full-Stack Developer @ Delta Holding',
  available: true,
  cv: `${import.meta.env.BASE_URL}Hamza-CV.pdf`,
  tagline:
    'I design and build fast, responsive web applications — from pixel-perfect React interfaces to robust Laravel APIs and well-structured databases.',
  about: [
    "I'm Arabi Hamza, a full-stack web developer based in morocco, currently building and maintaining web platforms at Delta Holding in Rabat. I work across the whole stack: React and JavaScript on the front end, Laravel and PHP on the back end, with MySQL and MongoDB for data.",
    'My path started with a diploma in Digital Development (full-stack web option) at ISTA NTIC Settat, followed by hands-on agency and corporate roles — shipping company websites, an insurance platform and mobile app, SEO improvements and data tooling. I recently completed a Licence in Computer Engineering & Digitalisation at ENSA Kénitra.',
    'I care about the details users feel: clean interfaces designed in Figma, smooth responsive behaviour on every screen, and code that stays maintainable long after launch.',
  ],
  highlights: [
    'End-to-end delivery: Figma design → React UI → Laravel API → database',
    'Professional experience in corporate (Delta Holding) and agency settings',
    'Responsive, mobile-first builds that work on every device',
    'Trilingual communication — Arabic, French and English',
  ],
  stats: [
    { value: 3, suffix: '+', label: 'Years of experience' },
    { value: 6, suffix: '', label: 'Featured projects' },
    { value: 15, suffix: '+', label: 'Technologies mastered' },
    { value: 3, suffix: '', label: 'Languages spoken' },
  ],
};

export const socials = [
  { label: 'GitHub', url: 'https://github.com/Hamzaarabi' },
  { label: 'LinkedIn', url: 'https://www.linkedin.com/in/hamza-arabi/' },
];

export const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/services', label: 'Services' },
  { to: '/skills', label: 'Skills' },
  { to: '/projects', label: 'Projects' },
  { to: '/contact', label: 'Contact' },
];

/* ── Services ─────────────────────────────────────────────── */
export const services = [
  {
    icon: FaCode,
    title: 'Web Development',
    desc: 'Custom websites and web applications built with React and Laravel — clean architecture, fast loads, and code that is easy to extend.',
    points: ['Business & portfolio websites', 'Full-stack web applications', 'E-commerce storefronts'],
  },
  {
    icon: FaPenRuler,
    title: 'UI/UX & Web Design',
    desc: 'Interfaces designed in Figma before a line of code is written, so the final product looks sharp and guides users effortlessly.',
    points: ['Figma wireframes & prototypes', 'Design systems & branding', 'Logo & graphic design'],
  },
  {
    icon: FaServer,
    title: 'APIs & Back-End',
    desc: 'Secure, well-structured back ends with Laravel and PHP — REST APIs, authentication, and MySQL / MongoDB data layers that scale.',
    points: ['REST API development', 'Database design & optimisation', 'Admin panels & dashboards'],
  },
  {
    icon: FaMobileScreenButton,
    title: 'Responsive & Mobile',
    desc: 'Mobile-first layouts that adapt beautifully to every screen — and hybrid mobile apps with Capacitor when you need to reach app stores.',
    points: ['Mobile-first responsive design', 'Capacitor hybrid apps', 'Cross-browser testing'],
  },
  {
    icon: FaGaugeHigh,
    title: 'SEO & Performance',
    desc: 'Technical SEO and performance tuning from real production work: semantic markup, optimised assets and Core-Web-Vitals-friendly pages.',
    points: ['On-page & technical SEO', 'Image & asset optimisation', 'Speed audits & fixes'],
  },
  {
    icon: FaScrewdriverWrench,
    title: 'Maintenance & Support',
    desc: 'Ongoing care for live websites — content and data updates, feature tweaks, bug fixes and friendly technical support for your team.',
    points: ['Website updates & fixes', 'Data & content management', 'Technical support'],
  },
];

export const process = [
  { step: '01', title: 'Discover', desc: 'We clarify your goals, audience and must-have features. You get honest advice on scope, stack and timeline before anything is built.' },
  { step: '02', title: 'Design', desc: 'I turn requirements into Figma designs you can click through and approve — no surprises when development starts.' },
  { step: '03', title: 'Build', desc: 'Front end, back end and database come together in clean, tested increments, with progress you can review as we go.' },
  { step: '04', title: 'Launch & Support', desc: 'Deployment, SEO checks and performance tuning — then ongoing maintenance so your site keeps improving after launch.' },
];

/* ── Skills ───────────────────────────────────────────────── */
export const skillGroups = [
  {
    title: 'Front-End',
    skills: [
      { name: 'HTML5', level: 98, icon: FaHtml5, color: '#e34c26' },
      { name: 'CSS3', level: 95, icon: FaCss3Alt, color: '#264ce4' },
      { name: 'React', level: 80, icon: FaReact, color: '#61dafb' },
      { name: 'JavaScript', level: 70, icon: IoLogoJavascript, color: '#f7df1e' },
      { name: 'Bootstrap', level: 85, icon: FaBootstrap, color: '#7952b3' },
      { name: 'jQuery', level: 85, icon: BiLogoJquery, color: '#0868ac' },
    ],
  },
  {
    title: 'Back-End & Data',
    skills: [
      { name: 'Laravel', level: 75, icon: FaLaravel, color: '#ff2d20' },
      { name: 'PHP', level: 75, icon: SiPhp, color: '#777bb4' },
      { name: 'MySQL', level: 75, icon: SiMysql, color: '#f29111' },
      { name: 'MongoDB', level: 85, icon: SiMongodb, color: '#47a248' },
      { name: 'Python', level: 40, icon: FaPython, color: '#ffd343' },
    ],
  },
  {
    title: 'Tools & Design',
    skills: [
      { name: 'Git & GitHub', level: 85, icon: FaGitAlt, color: '#f05032' },
      { name: 'WordPress', level: 65, icon: FaWordpress, color: '#21759b' },
      { name: 'REST APIs', level: 80, icon: FaServer, color: '#2b9e7a' },
      { name: 'Figma', level: 55, icon: FaFigma, color: '#f24e1e' },
      { name: 'Azure Cloud', level: 50, icon: FaCloud, color: '#0078d4' },
      { name: 'Capacitor', level: 65, icon: IoLogoCapacitor, color: '#119eff' },
    ],
  },
];

export const techMarquee = [
  'React', 'Laravel', 'JavaScript', 'PHP', 'MySQL', 'MongoDB', 'HTML5', 'CSS3',
  'Bootstrap', 'REST APIs', 'Figma', 'Git & GitHub', 'WordPress', 'Capacitor', 'Azure', 'Python',
];

export const certifications = ['HTML', 'CSS', 'JavaScript', 'PHP'];

export const traits = [
  { icon: FaComments, title: 'Communicative', desc: 'I balance talking and listening to keep communication clear, honest and effective.' },
  { icon: FaHandshake, title: 'Collaborative', desc: 'Teamwork makes the dream work — collaboration first, then great work follows.' },
  { icon: FaBolt, title: 'Hard-Working', desc: 'I put myself fully into action to reach goals and ship on time, every time.' },
  { icon: FaLightbulb, title: 'Problem Solver', desc: 'I break complex problems into simple, practical steps — then execute them methodically.' },
];

/* ── Journey ──────────────────────────────────────────────── */
export const experience = [
  {
    period: '2024 — Present',
    title: 'Full-Stack Web Developer',
    org: 'Delta Holding · Skhirat, Rabat',
    points: [
      'Design, build and ship new company websites and internal web pages',
      'Maintain and evolve existing sites — features, fixes and content updates',
      'Manage business data and provide day-to-day technical support to teams',
    ],
  },
  {
    period: '2023 — 2024',
    title: 'Full-Stack Web Developer',
    org: 'Marketing Support Services · Settat',
    points: [
      'Created and modified client websites end to end',
      'Improved visibility with technical and on-page SEO',
      'Automated data collection with web scraping and managed company data',
    ],
  },
  {
    period: 'Mar 2023',
    title: 'Internship',
    org: 'Court of First Instance · Settat',
    points: [
      'Strengthened communication, problem-solving and teamwork skills in a formal administrative environment',
    ],
  },
];

export const education = [
  {
    period: '2024 — 2025',
    title: 'Licence — Computer Engineering & Digitalisation',
    org: 'ENSA Kénitra',
    points: ['Advanced studies in computer science and digital transformation'],
  },
  {
    period: '2021 — 2023',
    title: 'Diploma in Digital Development — Full-Stack Web',
    org: 'ISTA NTIC Settat',
    points: ['Two-year specialised programme covering front-end, back-end and databases'],
  },
  {
    period: '2020 — 2021',
    title: 'Baccalaureate — Life & Earth Sciences',
    org: 'Lycée Al Amal',
    points: ['High school diploma, science stream'],
  },
];

/* ── Projects ─────────────────────────────────────────────── */
export const projectFilters = ['All', 'Full-Stack', 'Frontend', 'Mobile'];

export const projects = [
  {
    slug: 'chefood-restaurant',
    title: 'Chefood — Restaurant Website',
    short: 'A responsive restaurant platform designed in Figma and built as a React front end powered by a Laravel REST API and MySQL.',
    overview:
      'Chefood is a full-stack restaurant website created as my end-of-studies project. The experience was designed first in Figma, then implemented as a fast React SPA talking to a Laravel REST API backed by MySQL. Visitors can explore the menu and offers and move smoothly towards booking — all wrapped in a bold, appetite-driven visual identity that stays fully responsive from phone to desktop.',
    features: [
      'Figma-first design process, translated pixel-faithfully into React components',
      'Laravel REST API with a structured MySQL database behind the front end',
      'Menu, offers and booking calls-to-action designed to convert visitors',
      'Fully responsive layout built with Bootstrap grid and custom CSS',
    ],
    cover: chefoodCover,
    gallery: galleries.project1,
    structure: structureChefood,
    stack: ['React', 'Laravel', 'MySQL', 'REST API', 'Bootstrap', 'Figma'],
    category: 'Full-Stack',
    tags: ['Restaurant', 'React', 'Laravel', 'REST API'],
    year: 2023,
    date: 'May 2023',
    role: 'Design & Full-Stack Development',
    repo: 'https://github.com/Hamzaarabi',
    featured: true,
  },
  {
    slug: 'voip-it-ltd',
    title: 'VoIP IT Ltd — Corporate Website',
    short: 'A live, mobile-first corporate website for a VoIP company, hand-built with HTML, CSS and JavaScript for speed and clarity.',
    overview:
      'A production corporate website for Voipitltds, a VoIP services company. Built mobile-first with semantic HTML, modern CSS and vanilla JavaScript, it prioritises fast loading, smooth in-page navigation and a pleasant interface on every device. This project sharpened my eye for clean, dependency-free front-end craftsmanship — the site is live and in daily use by the company.',
    features: [
      'Live in production at voipitltds.com',
      'Mobile-first development, then progressively enhanced for desktop',
      'Smooth scrolling navigation between sections',
      'Zero-framework build — minimal weight, maximum compatibility',
    ],
    cover: voipCover,
    gallery: galleries.project2,
    structure: structureVoip,
    stack: ['HTML5', 'CSS3', 'JavaScript'],
    category: 'Frontend',
    tags: ['Corporate', 'Responsive', 'Live Site'],
    year: 2023,
    date: 'Nov 2023',
    role: 'Front-End Development',
    live: 'https://voipitltds.com/',
    featured: true,
  },
  {
    slug: 'previssime-insurance',
    title: 'Previssime — Swiss Insurance Platform',
    short: 'A Laravel-powered website for a Swiss insurance agency, built with Blade templates, Bootstrap and JavaScript.',
    overview:
      'Previssime is a web platform built for a Swiss insurance agency using Laravel. Server-rendered with Blade for reliability and SEO, styled with Bootstrap and custom CSS, and enhanced with JavaScript interactions. Working for an international client in a regulated industry taught me to value clarity, trust and precision in every screen.',
    features: [
      'Laravel back end with clean Blade templating',
      'Trust-focused insurance UX for an international (Swiss) client',
      'Responsive Bootstrap layout refined with custom CSS',
      'Structured, maintainable codebase ready to evolve',
    ],
    cover: previssimeCover,
    gallery: galleries.project3,
    structure: structurePrevissime,
    stack: ['Laravel', 'PHP', 'Blade', 'Bootstrap', 'JavaScript'],
    category: 'Full-Stack',
    tags: ['Insurance', 'Laravel', 'International Client'],
    year: 2023,
    date: 'Dec 2023',
    role: 'Full-Stack Development',
    repo: 'https://github.com/Hamzaarabi',
    featured: true,
  },
  {
    slug: 'insurance-mobile-app',
    title: 'Insurance Mobile App — Capacitor',
    short: 'A cross-platform mobile companion app for the Swiss insurance agency, built with CapacitorJS on web technologies.',
    overview:
      'Following the Previssime web platform, I built a mobile application for the same Swiss insurance agency using CapacitorJS. One web codebase (HTML, CSS, JavaScript) packaged into a native-feeling app — an efficient route to mobile for the client, and a great lesson for me in hybrid app architecture and mobile UX patterns.',
    features: [
      'Single codebase shipped as a mobile app via CapacitorJS',
      'Mobile-optimised insurance flows and navigation',
      'Consistent experience with the companion web platform',
      'Built entirely with web technologies — fast to iterate and maintain',
    ],
    cover: mobileCover,
    gallery: galleries.project4,
    structure: structureApp,
    stack: ['Capacitor', 'JavaScript', 'HTML5', 'CSS3'],
    category: 'Mobile',
    tags: ['Mobile App', 'Capacitor', 'Insurance'],
    year: 2024,
    date: 'Jan 2024',
    role: 'Mobile Development',
    repo: 'https://github.com/Hamzaarabi',
  },
  {
    slug: 'personal-portfolio',
    title: 'Personal Portfolio — This Website',
    short: 'My own corner of the web: originally built with React, now rebuilt on Vite with a custom design system, dark/light themes and WebP-optimised imagery.',
    overview:
      'This very website. I first built my portfolio with Create React App and Bootstrap; the current version is a ground-up rebuild on Vite + React with a hand-crafted CSS design system — dark/light themes, scroll-reveal animations, a ⌘K command palette, filterable project case studies with lightbox galleries, and images optimised from ~22 MB of PNG down to ~2.6 MB of WebP. It is both my showcase and my playground for modern front-end practice.',
    features: [
      'Rebuilt on Vite + React with route-level code splitting',
      'Custom design system with persistent dark / light themes',
      '⌘K command palette, animated stats and scroll-reveal sections',
      'Full SEO setup: Open Graph, JSON-LD, sitemap and semantic HTML',
    ],
    cover: portfolioCover,
    gallery: galleries.project5,
    structure: structurePortfolio,
    stack: ['React', 'Vite', 'CSS', 'Figma'],
    category: 'Frontend',
    tags: ['Portfolio', 'React', 'Design System'],
    year: 2024,
    date: 'Jan 2024',
    role: 'Design & Development',
    repo: 'https://github.com/hamzaarabi/portfolio',
  },
  {
    slug: 'firstcode-ecommerce',
    title: 'FirstCode — E-Commerce Storefront',
    short: 'Where it all began: my very first web app — a clothing e-commerce storefront for men, women and kids, built with HTML, CSS, JavaScript and jQuery.',
    overview:
      'FirstCode is the first real web application I ever built, back in 2021: an online clothing shop for men, women and kids, hand-coded with HTML, CSS, JavaScript and jQuery. It taught me the fundamentals — layout, DOM manipulation, product grids and cart-style interactions — and sparked the career that followed. I keep it here as a reminder of how far the journey has come.',
    features: [
      'My first complete web application (2021)',
      'Category browsing for men, women and kids clothing',
      'Interactive product listings powered by JavaScript & jQuery',
      'Hand-written HTML/CSS — the fundamentals, learned properly',
    ],
    cover: firstcodeCover,
    gallery: galleries.project6,
    structure: structureFirstCode,
    stack: ['HTML5', 'CSS3', 'JavaScript', 'jQuery'],
    category: 'Frontend',
    tags: ['E-Commerce', 'First Project'],
    year: 2021,
    date: 'Nov 2021',
    role: 'Front-End Development',
    repo: 'https://github.com/Hamzaarabi',
  },
];

/* ── FAQ ──────────────────────────────────────────────────── */
export const faqs = [
  {
    q: 'Are you available for new projects or roles?',
    a: "Yes — I'm open to full-time opportunities and freelance projects. The fastest way to reach me is the contact form or email; I usually reply within 24–48 hours.",
  },
  {
    q: 'Do you work remotely?',
    a: 'Absolutely. I am based in morocco and have already delivered work for an international (Swiss) client. I communicate fluently in Arabic, French and English, which makes cross-border collaboration smooth.',
  },
  {
    q: 'What technologies do you specialise in?',
    a: 'My core stack is React and JavaScript on the front end, Laravel and PHP on the back end, with MySQL and MongoDB for data. I design in Figma and can also deliver WordPress sites and hybrid mobile apps with Capacitor.',
  },
  {
    q: 'Can you redesign or maintain an existing website?',
    a: 'Yes — a large part of my professional work involves maintaining and improving live websites: new features, redesigns, performance and SEO fixes, and data/content updates.',
  },
  {
    q: 'How long does a typical website take?',
    a: 'It depends on scope: a polished business website usually takes 2–4 weeks, while larger web applications are planned in milestones. After a short discovery chat I will give you a clear, honest estimate.',
  },
];

/* ── EmailJS (override via .env — see .env.example) ───────── */
export const emailjsConfig = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_ivf641j',
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_mmzghiq',
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'AgiXKpwtjZv_5nBNa',
};
