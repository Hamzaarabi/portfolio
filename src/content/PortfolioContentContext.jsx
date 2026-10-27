import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
} from 'react';
import {
  FaBootstrap, FaBriefcase, FaChartLine, FaCloud, FaCode, FaCss3Alt, FaDatabase,
  FaFigma, FaGear, FaGitAlt, FaHtml5, FaLaravel, FaMobileScreenButton, FaPalette,
  FaPython, FaReact, FaServer, FaWordpress,
} from 'react-icons/fa6';
import { IoLogoCapacitor, IoLogoJavascript } from 'react-icons/io5';
import { BiLogoJquery } from 'react-icons/bi';
import { SiMongodb, SiMysql, SiPhp, SiSage, SiSymfony } from 'react-icons/si';
import {
  skillGroups as defaultSkillGroups,
  projects as defaultProjects,
  experience as defaultExperience,
  emailjsConfig as defaultEmailConfig,
} from '../data/portfolio';
import {
  isAdminUser, isSupabaseConfigured, requireSupabase, supabase, supabaseErrorMessage,
} from '../lib/supabase';

/**
 * Portfolio content now comes from Supabase Postgres.
 *
 * The values in src/data/portfolio.js remain only as:
 * 1. a first-paint/offline fallback while Supabase is loading or unavailable;
 * 2. the seed/reset data used to populate or restore the database.
 *
 * The old localStorage overlay is read once so the owner can migrate it into
 * Supabase from Admin → Backup / Data. New Admin writes never use localStorage
 * as their source of truth.
 */
export const CONTENT_STORAGE_KEY = 'hamza-portfolio-content-v1';

export const SKILL_ICON_OPTIONS = [
  { key: 'code', label: 'Code / Development' },
  { key: 'html5', label: 'HTML5' },
  { key: 'css3', label: 'CSS3' },
  { key: 'react', label: 'React' },
  { key: 'javascript', label: 'JavaScript' },
  { key: 'bootstrap', label: 'Bootstrap' },
  { key: 'jquery', label: 'jQuery' },
  { key: 'laravel', label: 'Laravel' },
  { key: 'symfony', label: 'Symfony' },
  { key: 'php', label: 'PHP' },
  { key: 'python', label: 'Python' },
  { key: 'mysql', label: 'MySQL' },
  { key: 'sqlserver', label: 'SQL Server' },
  { key: 'mongodb', label: 'MongoDB' },
  { key: 'database', label: 'Database' },
  { key: 'server', label: 'Server / API' },
  { key: 'business', label: 'Business / ERP' },
  { key: 'Sage', label: 'Sage ERP' },
  { key: 'git', label: 'Git & GitHub' },
  { key: 'wordpress', label: 'WordPress' },
  { key: 'figma', label: 'Figma / Design' },
  { key: 'azure', label: 'Azure / Cloud' },
  { key: 'capacitor', label: 'Capacitor / Mobile' },
  { key: 'analytics', label: 'Analytics / Reporting' },
  { key: 'cloud', label: 'Cloud' },
  { key: 'mobile', label: 'Mobile' },
  { key: 'design', label: 'Design' },
  { key: 'tools', label: 'Tools' },
];

const SKILL_ICONS = {
  code: FaCode,
  html5: FaHtml5,
  css3: FaCss3Alt,
  react: FaReact,
  javascript: IoLogoJavascript,
  bootstrap: FaBootstrap,
  jquery: BiLogoJquery,
  laravel: FaLaravel,
  symfony: SiSymfony,
  php: SiPhp,
  python: FaPython,
  mysql: SiMysql,
  sqlserver: FaDatabase,
  mongodb: SiMongodb,
  database: FaDatabase,
  server: FaServer,
  business: FaBriefcase,
  Sage: SiSage,
  git: FaGitAlt,
  wordpress: FaWordpress,
  figma: FaFigma,
  azure: FaCloud,
  capacitor: IoLogoCapacitor,
  analytics: FaChartLine,
  cloud: FaCloud,
  mobile: FaMobileScreenButton,
  design: FaPalette,
  tools: FaGear,
};

const DEFAULT_SKILL_ICON_KEYS = {
  html5: 'html5',
  css3: 'css3',
  react: 'react',
  javascript: 'javascript',
  bootstrap: 'bootstrap',
  jquery: 'jquery',
  laravel: 'laravel',
  symfony: 'symfony',
  php: 'php',
  mysql: 'mysql',
  'sql server': 'sqlserver',
  mongodb: 'mongodb',
  python: 'python',
  'Sage erp': 'Sage',
  'git & github': 'git',
  wordpress: 'wordpress',
  'rest apis': 'server',
  figma: 'figma',
  'azure cloud': 'azure',
  capacitor: 'capacitor',
};

const PROJECT_CATEGORIES = ['Full-Stack', 'Frontend', 'Mobile'];
const EMPTY_LEGACY_CONTENT = {
  customSkills: [],
  customProjects: [],
  deletedProjectSlugs: [],
  experience: null,
  emailConfig: null,
};

const clone = (value) => JSON.parse(JSON.stringify(value));
const asArray = (value) => (Array.isArray(value) ? value : []);
const cleanText = (value, fallback = '') => String(value ?? fallback).trim();
const cleanList = (value) => asArray(value).map((item) => cleanText(item)).filter(Boolean);
const cleanNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};
const makeId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
const isUuid = (value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ''));
const sortByOrder = (a, b) => cleanNumber(a.sortOrder ?? a.sort_order) - cleanNumber(b.sortOrder ?? b.sort_order);

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

function iconKeyForSkill(raw) {
  if (SKILL_ICONS[raw?.iconKey]) return raw.iconKey;
  if (SKILL_ICONS[raw?.icon_key]) return raw.icon_key;
  return DEFAULT_SKILL_ICON_KEYS[cleanText(raw?.name).toLowerCase()] || 'code';
}

function normalizeSkill(raw, groupTitle = '', index = 0) {
  return {
    id: cleanText(raw?.id, makeId()),
    name: cleanText(raw?.name),
    group: cleanText(raw?.group || raw?.group_title || groupTitle, 'Tools & Business'),
    groupId: cleanText(raw?.groupId || raw?.group_id),
    level: Math.min(100, Math.max(0, cleanNumber(raw?.level))),
    color: /^#[0-9a-f]{6}$/i.test(raw?.color || '') ? raw.color : '#2b9e7a',
    iconKey: iconKeyForSkill(raw),
    sortOrder: cleanNumber(raw?.sortOrder ?? raw?.sort_order, index),
  };
}

function normalizeSkillGroups(rawGroups) {
  return asArray(rawGroups)
    .map((group, groupIndex) => ({
      id: cleanText(group?.id, `group-${groupIndex}`),
      title: cleanText(group?.title, 'Tools & Business'),
      sortOrder: cleanNumber(group?.sortOrder ?? group?.sort_order, groupIndex),
      skills: asArray(group?.skills)
        .map((skill, skillIndex) => normalizeSkill(skill, group?.title, skillIndex))
        .filter((skill) => skill.name)
        .sort(sortByOrder),
    }))
    .filter((group) => group.title)
    .sort(sortByOrder);
}

function normalizeProject(raw, index = 0) {
  const title = cleanText(raw?.title, 'Untitled project');
  const yearValue = cleanNumber(raw?.year ?? raw?.project_year, new Date().getFullYear());
  return {
    id: cleanText(raw?.id, makeId()),
    slug: slugify(raw?.slug || title),
    title,
    short: cleanText(raw?.short ?? raw?.short_description),
    overview: cleanText(raw?.overview, raw?.short ?? raw?.short_description),
    features: cleanList(raw?.features),
    cover: cleanText(raw?.cover ?? raw?.cover_url),
    gallery: cleanList(raw?.gallery ?? raw?.gallery_urls),
    structure: cleanText(raw?.structure ?? raw?.structure_url) || null,
    stack: cleanList(raw?.stack),
    category: PROJECT_CATEGORIES.includes(raw?.category) ? raw.category : 'Full-Stack',
    tags: cleanList(raw?.tags),
    year: yearValue >= 1990 && yearValue <= 2100 ? Math.trunc(yearValue) : new Date().getFullYear(),
    date: cleanText(raw?.date ?? raw?.display_date, String(yearValue || new Date().getFullYear())),
    role: cleanText(raw?.role, 'Design & Development'),
    live: cleanText(raw?.live ?? raw?.live_url),
    repo: cleanText(raw?.repo ?? raw?.repo_url),
    featured: Boolean(raw?.featured),
    published: raw?.published === undefined ? true : Boolean(raw.published),
    sortOrder: cleanNumber(raw?.sortOrder ?? raw?.sort_order, index),
  };
}

function normalizeExperience(value) {
  return asArray(value)
    .map((item, index) => ({
      id: cleanText(item?.id, `experience-${index}`),
      period: cleanText(item?.period),
      title: cleanText(item?.title),
      org: cleanText(item?.org),
      points: cleanList(item?.points),
      sortOrder: cleanNumber(item?.sortOrder ?? item?.sort_order, index),
    }))
    .filter((item) => item.period || item.title || item.org || item.points.length)
    .sort(sortByOrder);
}

function normalizeEmailConfig(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const config = {
    serviceId: cleanText(raw.serviceId ?? raw.emailjs_service_id),
    templateId: cleanText(raw.templateId ?? raw.emailjs_template_id),
    publicKey: cleanText(raw.publicKey ?? raw.emailjs_public_key),
  };
  return config.serviceId || config.templateId || config.publicKey ? config : null;
}

function normalizeFullContent(raw) {
  const source = raw && typeof raw === 'object' ? raw : {};
  let skillGroups = [];

  if (Array.isArray(source.skillGroups)) {
    skillGroups = normalizeSkillGroups(source.skillGroups);
  } else if (Array.isArray(source.skills)) {
    const grouped = new Map();
    source.skills.map((skill, index) => normalizeSkill(skill, skill?.group || skill?.group_title, index))
      .filter((skill) => skill.name)
      .forEach((skill) => {
        if (!grouped.has(skill.group)) {
          grouped.set(skill.group, {
            id: skill.groupId || `group-${grouped.size}`,
            title: skill.group,
            sortOrder: grouped.size,
            skills: [],
          });
        }
        grouped.get(skill.group).skills.push(skill);
      });
    skillGroups = [...grouped.values()];
  }

  return {
    skillGroups,
    projects: asArray(source.projects).map(normalizeProject).filter((project) => project.title).sort(sortByOrder),
    experience: normalizeExperience(source.experience),
    emailConfig: normalizeEmailConfig(source.emailConfig) || { ...defaultEmailConfig },
  };
}

function buildDefaultRawContent() {
  return normalizeFullContent({
    skillGroups: defaultSkillGroups.map((group, groupIndex) => ({
      id: `default-group-${groupIndex}`,
      title: group.title,
      sortOrder: groupIndex,
      skills: group.skills.map((skill, skillIndex) => ({
        id: `default-skill-${slugify(skill.name)}`,
        name: skill.name,
        level: skill.level,
        color: skill.color,
        iconKey: DEFAULT_SKILL_ICON_KEYS[skill.name.toLowerCase()] || 'code',
        sortOrder: skillIndex,
      })),
    })),
    projects: defaultProjects.map((project, index) => ({
      ...project,
      id: project.slug,
      published: true,
      sortOrder: index,
    })),
    experience: defaultExperience.map((item, index) => ({
      ...item,
      id: `default-experience-${index}`,
      sortOrder: index,
    })),
    emailConfig: defaultEmailConfig,
  });
}

const DEFAULT_RAW_CONTENT = buildDefaultRawContent();
const defaultProjectsBySlug = new Map(defaultProjects.map((project) => [project.slug, project]));

function arraysEqual(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function projectForDatabase(project) {
  const normalized = normalizeProject(project, project?.sortOrder || 0);
  const fallback = defaultProjectsBySlug.get(normalized.slug);
  if (!fallback) return normalized;

  return {
    ...normalized,
    cover: normalized.cover === fallback.cover ? '' : normalized.cover,
    gallery: arraysEqual(normalized.gallery, fallback.gallery || []) ? [] : normalized.gallery,
    structure: normalized.structure === fallback.structure ? null : normalized.structure,
  };
}

function contentForDatabase(content) {
  const normalized = normalizeFullContent(content);
  return {
    skillGroups: normalized.skillGroups.map((group, groupIndex) => ({
      ...group,
      sortOrder: groupIndex,
      skills: group.skills.map((skill, skillIndex) => ({ ...skill, sortOrder: skillIndex })),
    })),
    projects: normalized.projects.map((project, index) => ({
      ...projectForDatabase(project),
      sortOrder: index,
    })),
    experience: normalized.experience.map((item, index) => ({ ...item, sortOrder: index })),
    emailConfig: normalized.emailConfig,
  };
}

function normalizeLegacyContent(raw) {
  if (!raw || typeof raw !== 'object') return clone(EMPTY_LEGACY_CONTENT);
  return {
    customSkills: asArray(raw.customSkills).map((skill, index) => normalizeSkill(skill, skill?.group, index)).filter((skill) => skill.name),
    customProjects: asArray(raw.customProjects).map(normalizeProject).filter((project) => project.title),
    deletedProjectSlugs: [...new Set(cleanList(raw.deletedProjectSlugs))],
    experience: Array.isArray(raw.experience) ? normalizeExperience(raw.experience) : null,
    emailConfig: normalizeEmailConfig(raw.emailConfig),
  };
}

function hasLegacyChanges(legacy) {
  return Boolean(
    legacy?.customSkills?.length ||
    legacy?.customProjects?.length ||
    legacy?.deletedProjectSlugs?.length ||
    legacy?.experience !== null ||
    legacy?.emailConfig
  );
}

function buildContentFromLegacy(legacy) {
  const content = clone(DEFAULT_RAW_CONTENT);
  const normalized = normalizeLegacyContent(legacy);

  normalized.customSkills.forEach((skill) => {
    let group = content.skillGroups.find((item) => item.title.toLowerCase() === skill.group.toLowerCase());
    if (!group) {
      group = {
        id: `legacy-group-${slugify(skill.group)}`,
        title: skill.group,
        sortOrder: content.skillGroups.length,
        skills: [],
      };
      content.skillGroups.push(group);
    }
    group.skills.push({ ...skill, sortOrder: group.skills.length });
  });

  const deleted = new Set(normalized.deletedProjectSlugs);
  content.projects = content.projects.filter((project) => !deleted.has(project.slug));
  const seenSlugs = new Set(content.projects.map((project) => project.slug));
  normalized.customProjects.forEach((project) => {
    if (seenSlugs.has(project.slug)) return;
    seenSlugs.add(project.slug);
    content.projects.push({ ...project, sortOrder: content.projects.length });
  });

  if (normalized.experience !== null) content.experience = normalized.experience;
  if (normalized.emailConfig) {
    content.emailConfig = {
      serviceId: normalized.emailConfig.serviceId || defaultEmailConfig.serviceId,
      templateId: normalized.emailConfig.templateId || defaultEmailConfig.templateId,
      publicKey: normalized.emailConfig.publicKey || defaultEmailConfig.publicKey,
    };
  }

  return normalizeFullContent(content);
}

function loadLegacyContent() {
  if (typeof window === 'undefined') return clone(EMPTY_LEGACY_CONTENT);
  try {
    const raw = window.localStorage.getItem(CONTENT_STORAGE_KEY);
    return raw ? normalizeLegacyContent(JSON.parse(raw)) : clone(EMPTY_LEGACY_CONTENT);
  } catch {
    return clone(EMPTY_LEGACY_CONTENT);
  }
}

function renderProject(project) {
  const fallback = defaultProjectsBySlug.get(project.slug);
  const cover = project.cover || fallback?.cover || placeholderCover(project.title);
  const gallery = project.gallery?.length ? project.gallery : (fallback?.gallery || []);
  return {
    ...project,
    cover,
    gallery,
    structure: project.structure || fallback?.structure || null,
    live: project.live || undefined,
    repo: project.repo || undefined,
    custom: !fallback,
    isBuiltIn: Boolean(fallback),
  };
}

function mapDatabaseContent({ groups, skills, projects, experience, settings }) {
  const groupMap = new Map();
  asArray(groups).sort(sortByOrder).forEach((group, index) => {
    groupMap.set(group.id, {
      id: group.id,
      title: cleanText(group.title, 'Tools & Business'),
      sortOrder: cleanNumber(group.sort_order, index),
      skills: [],
    });
  });

  asArray(skills).sort(sortByOrder).forEach((row, index) => {
    const group = groupMap.get(row.group_id);
    const skill = normalizeSkill(row, group?.title, index);
    if (group) group.skills.push(skill);
  });

  return normalizeFullContent({
    skillGroups: [...groupMap.values()],
    projects,
    experience,
    emailConfig: normalizeEmailConfig(settings) || defaultEmailConfig,
  });
}

function assertSupabaseSuccess(error, action) {
  if (error) throw new Error(supabaseErrorMessage(error, `${action} failed.`));
}

function projectToRow(project) {
  const normalized = projectForDatabase(project);
  const row = {
    slug: normalized.slug,
    title: normalized.title,
    short_description: normalized.short,
    overview: normalized.overview,
    features: normalized.features,
    cover_url: normalized.cover || null,
    gallery_urls: normalized.gallery,
    structure_url: normalized.structure,
    stack: normalized.stack,
    category: normalized.category,
    tags: normalized.tags,
    project_year: normalized.year,
    display_date: normalized.date,
    role: normalized.role,
    live_url: normalized.live || null,
    repo_url: normalized.repo || null,
    featured: normalized.featured,
    published: normalized.published,
    sort_order: normalized.sortOrder,
  };
  if (isUuid(normalized.id)) row.id = normalized.id;
  return row;
}

const PortfolioContentContext = createContext(null);

export function PortfolioContentProvider({ children }) {
  const [legacyContent, setLegacyContent] = useState(loadLegacyContent);
  const fallbackContent = useMemo(
    () => buildContentFromLegacy(legacyContent),
    [legacyContent]
  );
  const [rawContent, setRawContent] = useState(fallbackContent);
  const [contentSource, setContentSource] = useState('fallback');
  const [contentLoading, setContentLoading] = useState(Boolean(supabase));
  const [contentError, setContentError] = useState('');
  const [supabaseUser, setSupabaseUser] = useState(null);
  const loadSequenceRef = useRef(0);
  const refreshTimerRef = useRef(null);

  const refreshContent = useCallback(async () => {
    if (!supabase) {
      setContentLoading(false);
      setContentError('Supabase is not configured in this build.');
      return null;
    }

    const sequence = ++loadSequenceRef.current;
    setContentLoading(true);

    try {
      const [groupsResult, skillsResult, projectsResult, experienceResult, settingsResult] = await Promise.all([
        supabase.from('portfolio_skill_groups').select('id,title,sort_order').order('sort_order', { ascending: true }),
        supabase.from('portfolio_skills').select('id,group_id,name,level,color,icon_key,sort_order').order('sort_order', { ascending: true }),
        supabase.from('portfolio_projects').select('*').order('sort_order', { ascending: true }),
        supabase.from('portfolio_experience').select('id,period,title,org,points,sort_order').order('sort_order', { ascending: true }),
        supabase.from('site_settings').select('emailjs_service_id,emailjs_template_id,emailjs_public_key').eq('id', 1).maybeSingle(),
      ]);

      const firstError = [groupsResult, skillsResult, projectsResult, experienceResult, settingsResult].find((result) => result.error)?.error;
      assertSupabaseSuccess(firstError, 'Loading Supabase portfolio content');

      const hasAnyRows = Boolean(
        groupsResult.data?.length ||
        skillsResult.data?.length ||
        projectsResult.data?.length ||
        experienceResult.data?.length ||
        settingsResult.data
      );

      if (sequence !== loadSequenceRef.current) return null;

      if (!hasAnyRows) {
        setContentSource('fallback');
        setContentError('Supabase is connected, but the portfolio tables are not seeded yet. Apply the migration in supabase/migrations, then refresh.');
        setRawContent(fallbackContent);
        return null;
      }

      const mapped = mapDatabaseContent({
        groups: groupsResult.data,
        skills: skillsResult.data,
        projects: projectsResult.data,
        experience: experienceResult.data,
        settings: settingsResult.data,
      });
      setRawContent(mapped);
      setContentSource('supabase');
      setContentError('');
      return mapped;
    } catch (error) {
      if (sequence !== loadSequenceRef.current) return null;
      setContentSource('fallback');
      setRawContent(fallbackContent);
      setContentError(`Supabase content could not be loaded; showing the published fallback. ${supabaseErrorMessage(error)}`);
      return null;
    } finally {
      if (sequence === loadSequenceRef.current) setContentLoading(false);
    }
  }, [fallbackContent]);

  useEffect(() => {
    refreshContent();
  }, [refreshContent]);

  useEffect(() => {
    if (!supabase) return undefined;
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setSupabaseUser(data.session?.user || null);
    }).catch(() => {
      if (mounted) setSupabaseUser(null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupabaseUser(session?.user || null);
      window.setTimeout(() => refreshContent(), 0);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [refreshContent]);

  useEffect(() => {
    if (!supabase) return undefined;

    const scheduleRefresh = () => {
      window.clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = window.setTimeout(() => refreshContent(), 350);
    };

    const channel = supabase.channel(`portfolio-content-${makeId()}`);
    [
      'portfolio_skill_groups',
      'portfolio_skills',
      'portfolio_projects',
      'portfolio_experience',
      'site_settings',
    ].forEach((table) => {
      channel.on('postgres_changes', { event: '*', schema: 'public', table }, scheduleRefresh);
    });
    channel.subscribe();

    return () => {
      window.clearTimeout(refreshTimerRef.current);
      supabase.removeChannel(channel);
    };
  }, [refreshContent]);

  const skillGroups = useMemo(() => rawContent.skillGroups
    .filter((group) => group.skills.length > 0)
    .map((group) => ({
      ...group,
      skills: group.skills.map((skill) => ({
        ...skill,
        group: group.title,
        icon: SKILL_ICONS[skill.iconKey] || FaCode,
        custom: contentSource === 'supabase',
      })),
    })), [contentSource, rawContent.skillGroups]);

  const skills = useMemo(
    () => skillGroups.flatMap((group) => group.skills.map((skill) => ({ ...skill, group: group.title }))),
    [skillGroups]
  );

  const allProjects = useMemo(
    () => rawContent.projects.map(renderProject).sort(sortByOrder),
    [rawContent.projects]
  );
  const projects = useMemo(
    () => allProjects.filter((project) => project.published !== false),
    [allProjects]
  );
  const experience = rawContent.experience;
  const emailConfig = useMemo(() => ({
    serviceId: rawContent.emailConfig?.serviceId || defaultEmailConfig.serviceId,
    templateId: rawContent.emailConfig?.templateId || defaultEmailConfig.templateId,
    publicKey: rawContent.emailConfig?.publicKey || defaultEmailConfig.publicKey,
  }), [rawContent.emailConfig]);
  const hasCustomEmailConfig = (
    emailConfig.serviceId !== defaultEmailConfig.serviceId ||
    emailConfig.templateId !== defaultEmailConfig.templateId ||
    emailConfig.publicKey !== defaultEmailConfig.publicKey
  );

  const value = useMemo(() => {
    const uniqueSlug = (title, currentId = '') => {
      const base = slugify(title);
      const used = new Set(rawContent.projects
        .filter((project) => project.id !== currentId)
        .map((project) => project.slug));
      if (!used.has(base)) return base;
      let n = 2;
      while (used.has(`${base}-${n}`)) n += 1;
      return `${base}-${n}`;
    };

    const requireAdminWrite = () => {
      const client = requireSupabase();
      if (!supabaseUser) throw new Error('Sign in to Supabase Admin before saving changes.');
      if (!isAdminUser(supabaseUser)) throw new Error('This Supabase account is not authorized as the portfolio admin.');
      return client;
    };

    const requireSeededWrite = () => {
      const client = requireAdminWrite();
      if (contentSource !== 'supabase') {
        throw new Error('Seed Supabase first from Admin → Backup / Data (published defaults or old local data), then make individual edits.');
      }
      return client;
    };

    const replaceContent = async (nextContent) => {
      const client = requireAdminWrite();
      const payload = contentForDatabase(nextContent);
      const { error } = await client.rpc('replace_portfolio_content', { p_payload: payload });
      assertSupabaseSuccess(error, 'Replacing Supabase portfolio content');
      await refreshContent();
      return payload;
    };

    return {
      skillGroups,
      skills,
      projects,
      allProjects,
      experience,
      defaultExperience: clone(defaultExperience),
      defaultProjects,
      defaultSkillGroups,
      emailConfig,
      defaultEmailConfig: { ...defaultEmailConfig },
      customEmailConfig: hasCustomEmailConfig ? emailConfig : null,
      hasCustomEmailConfig,
      contentSource,
      isDatabaseConnected: contentSource === 'supabase',
      isSupabaseConfigured,
      contentLoading,
      contentError,
      storageError: contentError,
      supabase,
      supabaseUser,
      isSupabaseAdmin: isAdminUser(supabaseUser),
      refreshContent,
      legacyContent,
      hasLegacyLocalContent: hasLegacyChanges(legacyContent),
      isCustomized: contentSource !== 'supabase' && hasLegacyChanges(legacyContent),

      // Compatibility fields for older UI code. Supabase records are all
      // editable now, so there is no separate local custom overlay.
      customSkills: [],
      customProjects: [],
      deletedProjectSlugs: [],

      async signInAdmin(email, password) {
        const client = requireSupabase();
        const { data, error } = await client.auth.signInWithPassword({
          email: cleanText(email).toLowerCase(),
          password,
        });
        assertSupabaseSuccess(error, 'Signing in');
        if (!isAdminUser(data.user)) {
          await client.auth.signOut();
          throw new Error('This account is not authorized as the portfolio admin.');
        }
        setSupabaseUser(data.user);
        await refreshContent();
        return data.user;
      },

      async signOutAdmin() {
        if (!supabase) return;
        const { error } = await supabase.auth.signOut();
        assertSupabaseSuccess(error, 'Signing out');
        setSupabaseUser(null);
        await refreshContent();
      },

      async saveSkill(input) {
        const client = requireSeededWrite();
        const candidate = normalizeSkill(input, input?.group);
        if (!candidate.name || !candidate.group) throw new Error('Please add a skill name and group.');

        const existingGroup = rawContent.skillGroups.find(
          (group) => group.title.toLowerCase() === candidate.group.toLowerCase()
        );
        const existingSkill = skills.find((skill) => skill.id === candidate.id);
        const groupSortOrder = existingGroup?.sortOrder ?? rawContent.skillGroups.length;

        const { data: groupRow, error: groupError } = await client
          .from('portfolio_skill_groups')
          .upsert({ title: existingGroup?.title || candidate.group, sort_order: groupSortOrder }, { onConflict: 'title' })
          .select('id,title,sort_order')
          .single();
        assertSupabaseSuccess(groupError, 'Saving the skill group');

        const groupSkills = rawContent.skillGroups.find((group) => group.id === groupRow.id)?.skills || existingGroup?.skills || [];
        const payload = {
          group_id: groupRow.id,
          name: candidate.name,
          level: candidate.level,
          color: candidate.color,
          icon_key: candidate.iconKey,
          sort_order: existingSkill && existingSkill.group === (existingGroup?.title || candidate.group)
            ? existingSkill.sortOrder
            : groupSkills.length,
        };
        if (isUuid(candidate.id)) payload.id = candidate.id;

        const query = client.from('portfolio_skills');
        const { data, error } = payload.id
          ? await query.upsert(payload).select('*').single()
          : await query.insert(payload).select('*').single();
        assertSupabaseSuccess(error, 'Saving the skill');
        await refreshContent();
        return normalizeSkill(data, groupRow.title, payload.sort_order);
      },

      async addSkill(input) {
        return this.saveSkill(input);
      },

      async deleteSkill(id) {
        const client = requireSeededWrite();
        if (!isUuid(id)) throw new Error('This skill is not a Supabase record yet.');
        const { error } = await client.from('portfolio_skills').delete().eq('id', id);
        assertSupabaseSuccess(error, 'Deleting the skill');
        await refreshContent();
      },

      async deleteCustomSkill(id) {
        return this.deleteSkill(id);
      },

      async uploadProjectCover(file, slug) {
        const client = requireSeededWrite();
        if (!file) return '';
        if (!file.type?.startsWith('image/')) throw new Error('Please choose an image file for the project cover.');
        if (file.size > 5_000_000) throw new Error('Please use a project cover under 5 MB.');

        const extension = (file.name?.split('.').pop() || file.type.split('/').pop() || 'webp')
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '')
          .slice(0, 8) || 'webp';
        const path = `projects/${slugify(slug)}-${Date.now()}.${extension}`;
        const { error } = await client.storage
          .from('portfolio-media')
          .upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type });
        assertSupabaseSuccess(error, 'Uploading the project cover');
        return client.storage.from('portfolio-media').getPublicUrl(path).data.publicUrl;
      },

      async saveProject(input, coverFile = null) {
        const client = requireSeededWrite();
        const existing = rawContent.projects.find((project) => project.id === input?.id);
        const slug = existing?.slug || cleanText(input?.slug) || uniqueSlug(input?.title, input?.id || '');
        let cover = cleanText(input?.cover);
        if (coverFile) cover = await this.uploadProjectCover(coverFile, slug);

        const candidate = normalizeProject({
          ...input,
          slug,
          cover,
          gallery: input?.gallery,
          structure: input?.structure ?? existing?.structure ?? null,
          published: input?.published === undefined ? (existing?.published ?? true) : input.published,
          sortOrder: existing?.sortOrder ?? rawContent.projects.length,
        }, existing?.sortOrder ?? rawContent.projects.length);
        const row = projectToRow(candidate);

        const query = client.from('portfolio_projects');
        const { data, error } = row.id
          ? await query.upsert(row).select('*').single()
          : await query.insert(row).select('*').single();
        assertSupabaseSuccess(error, 'Saving the project');
        await refreshContent();
        return renderProject(normalizeProject(data, candidate.sortOrder));
      },

      async addProject(input, coverFile = null) {
        return this.saveProject(input, coverFile);
      },

      async deleteProject(project) {
        const client = requireSeededWrite();
        if (!project) return;
        const query = client.from('portfolio_projects').delete();
        const { error } = isUuid(project.id)
          ? await query.eq('id', project.id)
          : await query.eq('slug', project.slug);
        assertSupabaseSuccess(error, 'Deleting the project');
        await refreshContent();
      },

      async setProjectPublished(project, published) {
        const client = requireSeededWrite();
        const query = client.from('portfolio_projects').update({ published: Boolean(published) });
        const { error } = isUuid(project?.id)
          ? await query.eq('id', project.id)
          : await query.eq('slug', project?.slug);
        assertSupabaseSuccess(error, 'Updating project visibility');
        await refreshContent();
      },

      async restoreProject(slug) {
        const project = allProjects.find((item) => item.slug === slug);
        if (project) await this.setProjectPublished(project, true);
      },

      async saveExperience(items) {
        const client = requireSeededWrite();
        const normalized = normalizeExperience(items).map((item, index) => ({ ...item, sortOrder: index }));
        const { error } = await client.rpc('replace_portfolio_experience', { p_items: normalized });
        assertSupabaseSuccess(error, 'Saving work experience');
        await refreshContent();
        return normalized;
      },

      async resetExperience() {
        return this.saveExperience(defaultExperience);
      },

      async saveEmailConfig(input) {
        const client = requireSeededWrite();
        const config = normalizeEmailConfig(input);
        if (!config?.serviceId || !config?.templateId || !config?.publicKey) {
          throw new Error('Please fill in the EmailJS Service ID, Template ID and Public Key.');
        }
        const { error } = await client.from('site_settings').upsert({
          id: 1,
          emailjs_service_id: config.serviceId,
          emailjs_template_id: config.templateId,
          emailjs_public_key: config.publicKey,
        });
        assertSupabaseSuccess(error, 'Saving EmailJS settings');
        await refreshContent();
        return config;
      },

      async resetEmailConfig() {
        return this.saveEmailConfig(defaultEmailConfig);
      },

      replaceContent,

      async resetContent() {
        return replaceContent(DEFAULT_RAW_CONTENT);
      },

      exportContent() {
        return JSON.stringify(
          {
            version: 2,
            source: contentSource,
            exportedAt: new Date().toISOString(),
            data: contentForDatabase(rawContent),
          },
          null,
          2
        );
      },

      async importContent(jsonText) {
        const parsed = JSON.parse(jsonText);
        const data = parsed?.data && typeof parsed.data === 'object' ? parsed.data : parsed;
        if (!data || typeof data !== 'object') throw new Error('Invalid portfolio JSON file.');

        const isLegacyBackup = (
          Array.isArray(data.customSkills) ||
          Array.isArray(data.customProjects) ||
          Array.isArray(data.deletedProjectSlugs)
        ) && !Array.isArray(data.skillGroups);

        const fullContent = isLegacyBackup
          ? buildContentFromLegacy(normalizeLegacyContent(data))
          : normalizeFullContent(data);
        await replaceContent(fullContent);
        return fullContent;
      },

      async migrateLocalContent({ clearAfterImport = false } = {}) {
        const fullContent = buildContentFromLegacy(legacyContent);
        await replaceContent(fullContent);
        if (clearAfterImport) this.clearLocalLegacyContent();
        return fullContent;
      },

      clearLocalLegacyContent() {
        try { window.localStorage.removeItem(CONTENT_STORAGE_KEY); } catch { /* storage unavailable */ }
        setLegacyContent(clone(EMPTY_LEGACY_CONTENT));
      },

      async submitContactMessage(input) {
        if (!supabase) return false;
        const { error } = await supabase.from('contact_messages').insert({
          name: cleanText(input?.name),
          email: cleanText(input?.email).toLowerCase(),
          subject: cleanText(input?.subject),
          message: cleanText(input?.message),
          status: 'new',
          source: 'portfolio-contact-form',
        });
        assertSupabaseSuccess(error, 'Saving the contact message');
        return true;
      },
    };
  }, [
    allProjects, contentError, contentLoading, contentSource, emailConfig, experience,
    hasCustomEmailConfig, legacyContent, projects, rawContent, refreshContent,
    skillGroups, skills, supabaseUser,
  ]);

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
