import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  FaBriefcase, FaChartLine, FaCloud, FaCode, FaDatabase, FaGear,
  FaMobileScreenButton, FaPalette, FaServer,
} from 'react-icons/fa6';
import {
  skillGroups as defaultSkillGroups,
  projects as defaultProjects,
  experience as defaultExperience,
} from '../data/portfolio';

/**
 * Editable portfolio content layer.
 *
 * The published defaults live in code (src/data/portfolio.js). Anything created
 * in /admin is stored as a serializable overlay in localStorage and merged at
 * runtime, so no backend or API key is required for this static site.
 */
export const CONTENT_STORAGE_KEY = 'hamza-portfolio-content-v1';

export const SKILL_ICON_OPTIONS = [
  { key: 'code', label: 'Code / Development' },
  { key: 'database', label: 'Database' },
  { key: 'server', label: 'Server / API' },
  { key: 'business', label: 'Business / ERP' },
  { key: 'analytics', label: 'Analytics / Reporting' },
  { key: 'cloud', label: 'Cloud' },
  { key: 'mobile', label: 'Mobile' },
  { key: 'design', label: 'Design' },
  { key: 'tools', label: 'Tools' },
];

const SKILL_ICONS = {
  code: FaCode,
  database: FaDatabase,
  server: FaServer,
  business: FaBriefcase,
  analytics: FaChartLine,
  cloud: FaCloud,
  mobile: FaMobileScreenButton,
  design: FaPalette,
  tools: FaGear,
};

const EMPTY_CONTENT = {
  customSkills: [],
  customProjects: [],
  deletedProjectSlugs: [],
  experience: null,
};

const clone = (value) => JSON.parse(JSON.stringify(value));
const asArray = (value) => (Array.isArray(value) ? value : []);
const cleanText = (value, fallback = '') => String(value ?? fallback).trim();
const cleanList = (value) => asArray(value).map((item) => cleanText(item)).filter(Boolean);
const makeId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export function slugify(value) {
  return cleanText(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72) || 'new-project';
}

function placeholderCover(title) {
  const initials = cleanText(title, 'Project')
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('') || 'P';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800" viewBox="0 0 1280 800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#07301f"/><stop offset=".55" stop-color="#0a4630"/><stop offset="1" stop-color="#065a63"/></linearGradient></defs><rect width="1280" height="800" fill="url(#g)"/><circle cx="1080" cy="120" r="260" fill="#34d399" opacity=".18"/><circle cx="170" cy="700" r="220" fill="#22d3ee" opacity=".14"/><text x="50%" y="52%" text-anchor="middle" dominant-baseline="middle" font-family="Arial,sans-serif" font-size="180" font-weight="700" fill="#eafff5">${initials}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function normalizeSkill(raw) {
  return {
    id: cleanText(raw?.id, makeId()),
    name: cleanText(raw?.name),
    group: cleanText(raw?.group, 'Tools & Business'),
    level: Math.min(100, Math.max(0, Number(raw?.level) || 0)),
    color: /^#[0-9a-f]{6}$/i.test(raw?.color || '') ? raw.color : '#2b9e7a',
    iconKey: SKILL_ICONS[raw?.iconKey] ? raw.iconKey : 'code',
  };
}

function normalizeProject(raw) {
  const title = cleanText(raw?.title, 'Untitled project');
  const yearValue = Number(raw?.year);
  return {
    id: cleanText(raw?.id, makeId()),
    slug: slugify(raw?.slug || title),
    title,
    short: cleanText(raw?.short),
    overview: cleanText(raw?.overview, raw?.short),
    features: cleanList(raw?.features),
    cover: cleanText(raw?.cover) || placeholderCover(title),
    gallery: cleanList(raw?.gallery),
    structure: cleanText(raw?.structure) || null,
    stack: cleanList(raw?.stack),
    category: ['Full-Stack', 'Frontend', 'Mobile'].includes(raw?.category) ? raw.category : 'Full-Stack',
    tags: cleanList(raw?.tags),
    year: Number.isFinite(yearValue) && yearValue >= 1990 ? yearValue : new Date().getFullYear(),
    date: cleanText(raw?.date, String(yearValue || new Date().getFullYear())),
    role: cleanText(raw?.role, 'Design & Development'),
    live: cleanText(raw?.live) || undefined,
    repo: cleanText(raw?.repo) || undefined,
    featured: Boolean(raw?.featured),
    custom: true,
  };
}

function normalizeExperience(value) {
  return asArray(value)
    .map((item) => ({
      period: cleanText(item?.period),
      title: cleanText(item?.title),
      org: cleanText(item?.org),
      points: cleanList(item?.points),
    }))
    .filter((item) => item.period || item.title || item.org || item.points.length);
}

function normalizeStoredContent(raw) {
  if (!raw || typeof raw !== 'object') return clone(EMPTY_CONTENT);
  return {
    customSkills: asArray(raw.customSkills).map(normalizeSkill).filter((skill) => skill.name),
    customProjects: asArray(raw.customProjects).map(normalizeProject).filter((project) => project.title),
    deletedProjectSlugs: [...new Set(cleanList(raw.deletedProjectSlugs))],
    experience: Array.isArray(raw.experience) ? normalizeExperience(raw.experience) : null,
  };
}

function loadStoredContent() {
  if (typeof window === 'undefined') return clone(EMPTY_CONTENT);
  try {
    const raw = window.localStorage.getItem(CONTENT_STORAGE_KEY);
    return raw ? normalizeStoredContent(JSON.parse(raw)) : clone(EMPTY_CONTENT);
  } catch {
    return clone(EMPTY_CONTENT);
  }
}

const PortfolioContentContext = createContext(null);

export function PortfolioContentProvider({ children }) {
  const [stored, setStored] = useState(loadStoredContent);
  const [storageError, setStorageError] = useState('');

  useEffect(() => {
    try {
      window.localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(stored));
      setStorageError('');
    } catch {
      setStorageError('Browser storage is full or unavailable. Export your data and use smaller project images.');
    }
  }, [stored]);

  const skillGroups = useMemo(() => {
    const groups = defaultSkillGroups.map((group) => ({
      title: group.title,
      skills: group.skills.map((skill) => ({ ...skill, custom: false })),
    }));

    stored.customSkills.forEach((rawSkill) => {
      const skill = normalizeSkill(rawSkill);
      const rendered = {
        id: skill.id,
        name: skill.name,
        level: skill.level,
        color: skill.color,
        icon: SKILL_ICONS[skill.iconKey] || FaCode,
        iconKey: skill.iconKey,
        custom: true,
      };
      const existing = groups.find((group) => group.title.toLowerCase() === skill.group.toLowerCase());
      if (existing) existing.skills.push(rendered);
      else groups.push({ title: skill.group, skills: [rendered] });
    });

    return groups;
  }, [stored.customSkills]);

  const projects = useMemo(() => {
    const deleted = new Set(stored.deletedProjectSlugs);
    const merged = defaultProjects
      .filter((project) => !deleted.has(project.slug))
      .map((project) => ({ ...project, custom: false }));
    const seen = new Set(merged.map((project) => project.slug));

    stored.customProjects.forEach((rawProject) => {
      const project = normalizeProject(rawProject);
      if (seen.has(project.slug)) return;
      seen.add(project.slug);
      merged.push(project);
    });

    return merged;
  }, [stored.customProjects, stored.deletedProjectSlugs]);

  const experience = useMemo(
    () => (stored.experience === null ? clone(defaultExperience) : normalizeExperience(stored.experience)),
    [stored.experience]
  );

  const value = useMemo(() => {
    const uniqueSlug = (title, currentId = '') => {
      const base = slugify(title);
      const used = new Set([
        ...defaultProjects.map((project) => project.slug),
        ...stored.customProjects
          .filter((project) => project.id !== currentId)
          .map((project) => project.slug || slugify(project.title)),
      ]);
      if (!used.has(base)) return base;
      let n = 2;
      while (used.has(`${base}-${n}`)) n += 1;
      return `${base}-${n}`;
    };

    return {
      skillGroups,
      projects,
      experience,
      defaultExperience: clone(defaultExperience),
      customSkills: stored.customSkills,
      customProjects: stored.customProjects,
      deletedProjectSlugs: stored.deletedProjectSlugs,
      defaultProjects,
      storageError,
      isCustomized:
        stored.customSkills.length > 0 ||
        stored.customProjects.length > 0 ||
        stored.deletedProjectSlugs.length > 0 ||
        stored.experience !== null,

      addSkill(input) {
        const skill = normalizeSkill({ ...input, id: input?.id || makeId() });
        setStored((prev) => {
          const exists = prev.customSkills.some((item) => item.id === skill.id);
          return {
            ...prev,
            customSkills: exists
              ? prev.customSkills.map((item) => (item.id === skill.id ? skill : item))
              : [skill, ...prev.customSkills],
          };
        });
        return skill;
      },

      deleteCustomSkill(id) {
        setStored((prev) => ({
          ...prev,
          customSkills: prev.customSkills.filter((skill) => skill.id !== id),
        }));
      },

      addProject(input) {
        const id = input?.id || makeId();
        const project = normalizeProject({ ...input, id, slug: uniqueSlug(input?.title, id) });
        setStored((prev) => {
          const exists = prev.customProjects.some((item) => item.id === id);
          return {
            ...prev,
            deletedProjectSlugs: prev.deletedProjectSlugs.filter((slug) => slug !== project.slug),
            customProjects: exists
              ? prev.customProjects.map((item) => (item.id === id ? project : item))
              : [project, ...prev.customProjects],
          };
        });
        return project;
      },

      deleteProject(project) {
        if (!project) return;
        setStored((prev) => {
          if (project.custom || prev.customProjects.some((item) => item.slug === project.slug)) {
            return {
              ...prev,
              customProjects: prev.customProjects.filter((item) => item.slug !== project.slug),
            };
          }
          return {
            ...prev,
            deletedProjectSlugs: [...new Set([...prev.deletedProjectSlugs, project.slug])],
          };
        });
      },

      restoreProject(slug) {
        setStored((prev) => ({
          ...prev,
          deletedProjectSlugs: prev.deletedProjectSlugs.filter((item) => item !== slug),
        }));
      },

      saveExperience(items) {
        setStored((prev) => ({ ...prev, experience: normalizeExperience(items) }));
      },

      resetExperience() {
        setStored((prev) => ({ ...prev, experience: null }));
      },

      resetContent() {
        setStored(clone(EMPTY_CONTENT));
      },

      exportContent() {
        return JSON.stringify(
          { version: 1, exportedAt: new Date().toISOString(), data: stored },
          null,
          2
        );
      },

      importContent(jsonText) {
        const parsed = JSON.parse(jsonText);
        const data = parsed?.data && typeof parsed.data === 'object' ? parsed.data : parsed;
        if (!data || typeof data !== 'object') throw new Error('Invalid portfolio JSON file.');
        setStored(normalizeStoredContent(data));
      },
    };
  }, [experience, projects, skillGroups, storageError, stored]);

  return (
    <PortfolioContentContext.Provider value={value}>
      {children}
    </PortfolioContentContext.Provider>
  );
}

export function usePortfolioContent() {
  const context = useContext(PortfolioContentContext);
  if (!context) throw new Error('usePortfolioContent must be used inside PortfolioContentProvider.');
  return context;
}
