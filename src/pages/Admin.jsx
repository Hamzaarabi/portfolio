import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import {
  FaBriefcase, FaCheck, FaCode, FaDownload, FaEnvelope, FaEye, FaFloppyDisk, FaFolderOpen,
  FaGears, FaLock, FaPaperPlane, FaPen, FaPlus, FaRotateLeft, FaTrashCan, FaTriangleExclamation, FaUpload,
} from 'react-icons/fa6';
import useTitle from '../hooks/useTitle';
import PageHero from '../components/PageHero';
import { profile } from '../data/portfolio';
import { SKILL_ICON_OPTIONS, usePortfolioContent } from '../content/PortfolioContentContext';

const ADMIN_HASH_KEY = 'hamza-portfolio-admin-hash-v1';
const ADMIN_SESSION_KEY = 'hamza-portfolio-admin-session-v1';
const PROJECT_CATEGORIES = ['Full-Stack', 'Frontend', 'Mobile'];

async function hashPassword(password) {
  const source = `hamza-portfolio-admin:${password}`;
  if (window.crypto?.subtle) {
    const buffer = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(source));
    return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  }
  // Fallback for non-secure contexts. This local lock is only an editing guard,
  // not server authentication.
  let hash = 5381;
  for (let i = 0; i < source.length; i++) hash = ((hash << 5) + hash + source.charCodeAt(i)) >>> 0;
  return `fallback-${hash.toString(16)}`;
}

function initialAuthState() {
  try {
    const hasHash = Boolean(window.localStorage.getItem(ADMIN_HASH_KEY));
    if (window.sessionStorage.getItem(ADMIN_SESSION_KEY) === 'yes' && hasHash) return 'unlocked';
    return hasHash ? 'locked' : 'setup';
  } catch {
    return 'setup';
  }
}

const splitLines = (value) => String(value || '').split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
const splitComma = (value) => String(value || '').split(/[,\n]/).map((item) => item.trim()).filter(Boolean);
const toExperienceDraft = (items) => items.map((item, index) => ({
  draftId: `${index}-${item.title || 'experience'}-${item.period || ''}`,
  period: item.period || '',
  title: item.title || '',
  org: item.org || '',
  pointsText: (item.points || []).join('\n'),
}));

function Field({ id, label, children, hint }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && <p className="admin-hint">{hint}</p>}
    </div>
  );
}

export default function Admin() {
  useTitle('Admin');
  const content = usePortfolioContent();
  const {
    skillGroups, projects, experience, defaultExperience, defaultProjects,
    customSkills, customProjects, deletedProjectSlugs, storageError, isCustomized,
    emailConfig, defaultEmailConfig, hasCustomEmailConfig,
  } = content;

  const [authState, setAuthState] = useState(initialAuthState);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [notice, setNotice] = useState('');
  const importInputRef = useRef(null);

  const [editingSkillId, setEditingSkillId] = useState('');
  const [skillForm, setSkillForm] = useState({
    name: '', group: 'Tools & Business', newGroup: '', level: 70, color: '#2b9e7a', iconKey: 'code',
  });

  const emptyProjectForm = () => ({
    title: '', category: 'Full-Stack', year: new Date().getFullYear(), date: '', role: 'Design & Development',
    short: '', overview: '', featuresText: '', stackText: '', tagsText: '', cover: '', galleryText: '',
    live: '', repo: '', featured: false,
  });
  const [editingProjectId, setEditingProjectId] = useState('');
  const [projectForm, setProjectForm] = useState(emptyProjectForm);

  const [draftExperience, setDraftExperience] = useState(() => toExperienceDraft(experience));
  const [experienceDirty, setExperienceDirty] = useState(false);

  const [emailForm, setEmailForm] = useState(() => ({ ...emailConfig }));
  const [emailDirty, setEmailDirty] = useState(false);
  const [emailTestBusy, setEmailTestBusy] = useState(false);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(''), 4500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if (!experienceDirty) setDraftExperience(toExperienceDraft(experience));
  }, [experience, experienceDirty]);

  useEffect(() => {
    if (!emailDirty) setEmailForm({ ...emailConfig });
  }, [emailConfig, emailDirty]);

  const notify = (message) => setNotice(message);
  const totalSkills = skillGroups.reduce((sum, group) => sum + group.skills.length, 0);
  const hiddenDefaultProjects = defaultProjects.filter((project) => deletedProjectSlugs.includes(project.slug));

  const unlockSession = () => {
    try { window.sessionStorage.setItem(ADMIN_SESSION_KEY, 'yes'); } catch { /* session only */ }
    setAuthState('unlocked');
    setPassword('');
    setConfirmPassword('');
    setAuthError('');
  };

  const handleAuth = async (event) => {
    event.preventDefault();
    setAuthError('');
    if (password.length < 6) {
      setAuthError('Use at least 6 characters for the local admin password.');
      return;
    }
    if (authState === 'setup' && password !== confirmPassword) {
      setAuthError('The two passwords do not match.');
      return;
    }
    setAuthBusy(true);
    try {
      const hash = await hashPassword(password);
      if (authState === 'setup') {
        window.localStorage.setItem(ADMIN_HASH_KEY, hash);
        unlockSession();
        notify('Local admin password created. You can now manage portfolio content in this browser.');
      } else if (hash === window.localStorage.getItem(ADMIN_HASH_KEY)) {
        unlockSession();
      } else {
        setAuthError('Incorrect password. Please try again.');
      }
    } catch {
      setAuthError('Browser storage is unavailable, so the admin lock could not be checked.');
    } finally {
      setAuthBusy(false);
    }
  };

  const lockAdmin = () => {
    try { window.sessionStorage.removeItem(ADMIN_SESSION_KEY); } catch { /* ignore */ }
    setAuthState('locked');
  };

  const resetAdminLock = () => {
    if (!window.confirm('Reset the local admin password on this browser? Your saved content will not be deleted.')) return;
    try {
      window.localStorage.removeItem(ADMIN_HASH_KEY);
      window.sessionStorage.removeItem(ADMIN_SESSION_KEY);
    } catch { /* ignore */ }
    setPassword('');
    setConfirmPassword('');
    setAuthError('');
    setAuthState('setup');
  };

  const handleSkillSubmit = (event) => {
    event.preventDefault();
    const group = skillForm.group === '__new' ? skillForm.newGroup.trim() : skillForm.group;
    if (!skillForm.name.trim() || !group) {
      notify('Please add a skill name and choose or create a group.');
      return;
    }
    const saved = content.addSkill({
      id: editingSkillId || undefined,
      name: skillForm.name,
      group,
      level: Number(skillForm.level),
      color: skillForm.color,
      iconKey: skillForm.iconKey,
    });
    notify(`${saved.name} ${editingSkillId ? 'updated' : 'added'} to the Skills page.`);
    setEditingSkillId('');
    setSkillForm({ name: '', group: 'Tools & Business', newGroup: '', level: 70, color: '#2b9e7a', iconKey: 'code' });
  };

  const startEditSkill = (skill) => {
    const knownGroup = skillGroups.some((group) => group.title === skill.group);
    setEditingSkillId(skill.id);
    setSkillForm({
      name: skill.name,
      group: knownGroup ? skill.group : '__new',
      newGroup: knownGroup ? '' : skill.group,
      level: skill.level,
      color: skill.color,
      iconKey: skill.iconKey || 'code',
    });
    setActiveTab('skills');
  };

  const readProjectImage = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      notify('Please choose an image file for the project cover.');
      return;
    }
    if (file.size > 1_500_000) {
      notify('This image is too large for browser storage. Please use an image under 1.5 MB or paste an image URL.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setProjectForm((form) => ({ ...form, cover: String(reader.result || '') }));
    reader.onerror = () => notify('The selected image could not be read.');
    reader.readAsDataURL(file);
  };

  const handleProjectSubmit = (event) => {
    event.preventDefault();
    if (!projectForm.title.trim() || !projectForm.short.trim()) {
      notify('Please add at least a project title and short description.');
      return;
    }
    const saved = content.addProject({
      id: editingProjectId || undefined,
      title: projectForm.title,
      category: projectForm.category,
      year: Number(projectForm.year),
      date: projectForm.date,
      role: projectForm.role,
      short: projectForm.short,
      overview: projectForm.overview || projectForm.short,
      features: splitLines(projectForm.featuresText),
      stack: splitComma(projectForm.stackText),
      tags: splitComma(projectForm.tagsText),
      cover: projectForm.cover,
      gallery: splitLines(projectForm.galleryText),
      live: projectForm.live,
      repo: projectForm.repo,
      featured: projectForm.featured,
    });
    notify(`${saved.title} ${editingProjectId ? 'updated' : 'added'}. It is now visible in Projects.`);
    setEditingProjectId('');
    setProjectForm(emptyProjectForm());
  };

  const startEditProject = (project) => {
    setEditingProjectId(project.id || '');
    setProjectForm({
      title: project.title || '',
      category: project.category || 'Full-Stack',
      year: project.year || new Date().getFullYear(),
      date: project.date || '',
      role: project.role || '',
      short: project.short || '',
      overview: project.overview || '',
      featuresText: (project.features || []).join('\n'),
      stackText: (project.stack || []).join(', '),
      tagsText: (project.tags || []).join(', '),
      cover: project.cover || '',
      galleryText: (project.gallery || []).join('\n'),
      live: project.live || '',
      repo: project.repo || '',
      featured: Boolean(project.featured),
    });
    setActiveTab('projects');
  };

  const updateExperienceItem = (draftId, field, value) => {
    setExperienceDirty(true);
    setDraftExperience((items) => items.map((item) => (
      item.draftId === draftId ? { ...item, [field]: value } : item
    )));
  };

  const moveExperienceItem = (index, direction) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= draftExperience.length) return;
    setExperienceDirty(true);
    setDraftExperience((items) => {
      const next = [...items];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  };

  const handleExperienceSave = (event) => {
    event.preventDefault();
    const cleaned = draftExperience.map((item) => ({
      period: item.period.trim(),
      title: item.title.trim(),
      org: item.org.trim(),
      points: splitLines(item.pointsText),
    })).filter((item) => item.period || item.title || item.org || item.points.length);
    if (!cleaned.length || cleaned.some((item) => !item.period || !item.title || !item.org)) {
      notify('Each experience needs a period, job title and organisation.');
      return;
    }
    content.saveExperience(cleaned);
    setExperienceDirty(false);
    notify('Work experience updated on the Home and About pages.');
  };

  const updateEmailForm = (field, value) => {
    setEmailDirty(true);
    setEmailForm((form) => ({ ...form, [field]: value }));
  };

  const cleanedEmailForm = () => ({
    serviceId: emailForm.serviceId.trim(),
    templateId: emailForm.templateId.trim(),
    publicKey: emailForm.publicKey.trim(),
  });

  const validateEmailForm = (config) => {
    if (!config.serviceId || !config.templateId || !config.publicKey) {
      notify('Please fill in the EmailJS Service ID, Template ID and Public Key.');
      return false;
    }
    if (/\s/.test(config.serviceId) || /\s/.test(config.templateId) || /\s/.test(config.publicKey)) {
      notify('EmailJS IDs and the Public Key cannot contain spaces.');
      return false;
    }
    return true;
  };

  const handleEmailConfigSave = (event) => {
    event.preventDefault();
    const config = cleanedEmailForm();
    if (!validateEmailForm(config)) return;
    content.saveEmailConfig(config);
    setEmailForm(config);
    setEmailDirty(false);
    notify('EmailJS configuration saved in this browser. The Contact form now uses it here.');
  };

  const resetEmailConfig = () => {
    content.resetEmailConfig();
    setEmailForm({ ...defaultEmailConfig });
    setEmailDirty(false);
    notify('EmailJS configuration reset to the published defaults.');
  };

  const discardEmailChanges = () => {
    setEmailForm({ ...emailConfig });
    setEmailDirty(false);
  };

  const sendTestEmail = async () => {
    const config = cleanedEmailForm();
    if (!validateEmailForm(config) || emailTestBusy) return;
    setEmailTestBusy(true);
    try {
      await emailjs.send(
        config.serviceId,
        config.templateId,
        {
          user_name: 'Portfolio Admin',
          user_email: profile.email,
          subject: 'EmailJS test from portfolio admin',
          message: `This is a test message from the portfolio Admin EmailJS settings.\n\nService ID: ${config.serviceId}\nTemplate ID: ${config.templateId}\nSent: ${new Date().toLocaleString()}`,
        },
        config.publicKey
      );
      notify('Test email sent. Check the inbox configured in your EmailJS template.');
    } catch {
      notify('Test email failed. Check the Service ID, Template ID, Public Key and EmailJS template settings.');
    } finally {
      setEmailTestBusy(false);
    }
  };

  const exportData = () => {
    const blob = new Blob([content.exportContent()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'portfolio-content-backup.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 500);
    notify('Portfolio content backup downloaded.');
  };

  const importData = async (file) => {
    if (!file) return;
    try {
      content.importContent(await file.text());
      setExperienceDirty(false);
      setEmailDirty(false);
      notify('Portfolio content imported successfully.');
    } catch {
      notify('Import failed. Please choose a valid portfolio-content-backup.json file.');
    } finally {
      if (importInputRef.current) importInputRef.current.value = '';
    }
  };

  if (authState !== 'unlocked') {
    const isSetup = authState === 'setup';
    return (
      <>
        <PageHero
          eyebrow="Private area"
          title="Portfolio administration"
          sub="Manage skills, projects, work experience and EmailJS settings from this browser. A local password protects the editor on this device."
        />
        <section className="section admin-auth-section">
          <div className="container-x narrow">
            <form className="form admin-auth-card" onSubmit={handleAuth}>
              <span className="service-icon admin-auth-icon"><FaLock aria-hidden="true" /></span>
              <h2>{isSetup ? 'Create your local admin password' : 'Unlock administration'}</h2>
              <p>
                {isSetup
                  ? 'This password is stored as a hash in this browser only. Do not reuse an important banking/email password.'
                  : 'Enter the local password created on this device to manage portfolio content.'}
              </p>
              {authError && <p className="form-status error" role="alert"><FaTriangleExclamation aria-hidden="true" /> {authError}</p>}
              <Field id="admin-password" label={isSetup ? 'New password' : 'Password'}>
                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete={isSetup ? 'new-password' : 'current-password'}
                  minLength={6}
                  required
                />
              </Field>
              {isSetup && (
                <Field id="admin-password-confirm" label="Confirm password">
                  <input
                    id="admin-password-confirm"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    autoComplete="new-password"
                    minLength={6}
                    required
                  />
                </Field>
              )}
              <button type="submit" className="btn btn-primary form-submit" disabled={authBusy}>
                <FaLock aria-hidden="true" /> {authBusy ? 'Checking…' : isSetup ? 'Create password & open admin' : 'Unlock admin'}
              </button>
              {!isSetup && (
                <button type="button" className="text-link admin-reset-lock" onClick={resetAdminLock}>
                  Forgot it? Reset the local lock on this browser
                </button>
              )}
              <p className="admin-hint">
                Static-site note: there is no server account/database yet, so edited content is saved in this browser and can be exported as JSON.
              </p>
            </form>
          </div>
        </section>
      </>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaGears },
    { id: 'skills', label: 'Skills', icon: FaCode },
    { id: 'projects', label: 'Projects', icon: FaFolderOpen },
    { id: 'experience', label: 'Experience', icon: FaBriefcase },
    { id: 'email', label: 'EmailJS', icon: FaEnvelope },
    { id: 'data', label: 'Backup / Data', icon: FaFloppyDisk },
  ];

  return (
    <>
      <PageHero
        eyebrow="Administration"
        title="Manage your portfolio"
        sub="Add skills and projects, edit work experience, configure EmailJS, then preview the public site. Changes save automatically in this browser."
      />

      <section className="section admin-section">
        <div className="container-x">
          {(notice || storageError) && (
            <p className={`form-status ${storageError ? 'error' : 'success'} admin-status`} role="status">
              {storageError ? <FaTriangleExclamation aria-hidden="true" /> : <FaCheck aria-hidden="true" />}
              {storageError || notice}
            </p>
          )}

          <div className="admin-toolbar">
            <div className="admin-tabs" role="tablist" aria-label="Admin sections">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <tab.icon aria-hidden="true" /> {tab.label}
                </button>
              ))}
            </div>
            <div className="admin-toolbar-actions">
              <Link to="/" className="btn btn-ghost btn-sm"><FaEye aria-hidden="true" /> View site</Link>
              <button type="button" className="btn btn-ghost btn-sm" onClick={lockAdmin}><FaLock aria-hidden="true" /> Lock</button>
            </div>
          </div>

          {activeTab === 'overview' && (
            <div className="admin-panel">
              <div className="admin-stat-grid">
                <article><strong>{totalSkills}</strong><span>Skills displayed</span><small>{customSkills.length} added in admin</small></article>
                <article><strong>{projects.length}</strong><span>Projects displayed</span><small>{customProjects.length} added in admin</small></article>
                <article><strong>{experience.length}</strong><span>Work experiences</span><small>{isCustomized ? 'Local changes active' : 'Using published defaults'}</small></article>
              </div>
              <div className="admin-info-card">
                <h2>How publishing works</h2>
                <p>
                  This portfolio is currently a static GitHub Pages site. Admin changes are stored safely in
                  <strong> this browser</strong>, so you can test new skills/projects immediately. They do not automatically
                  change the public website for every visitor until the content is exported and committed to the code,
                  or a real backend/CMS (for example Supabase/Firebase) is connected.
                </p>
                <div className="admin-actions-row">
                  <button type="button" className="btn btn-primary" onClick={() => setActiveTab('skills')}><FaPlus aria-hidden="true" /> Add a skill</button>
                  <button type="button" className="btn btn-ghost" onClick={() => setActiveTab('projects')}><FaPlus aria-hidden="true" /> Add a project</button>
                  <button type="button" className="btn btn-ghost" onClick={() => setActiveTab('email')}><FaEnvelope aria-hidden="true" /> Email settings</button>
                  <button type="button" className="btn btn-ghost" onClick={exportData}><FaDownload aria-hidden="true" /> Export backup</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="admin-grid">
              <form className="form admin-form" onSubmit={handleSkillSubmit}>
                <h2>{editingSkillId ? 'Edit custom skill' : 'Add a skill'}</h2>
                <Field id="skill-name" label="Skill name *">
                  <input id="skill-name" value={skillForm.name} onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })} placeholder="e.g. Docker, Power BI, Sage Paie…" required />
                </Field>
                <div className="form-row">
                  <Field id="skill-group" label="Group">
                    <select id="skill-group" value={skillForm.group} onChange={(e) => setSkillForm({ ...skillForm, group: e.target.value })}>
                      {skillGroups.map((group) => <option key={group.title} value={group.title}>{group.title}</option>)}
                      <option value="__new">+ Create a new group…</option>
                    </select>
                  </Field>
                  <Field id="skill-icon" label="Icon style">
                    <select id="skill-icon" value={skillForm.iconKey} onChange={(e) => setSkillForm({ ...skillForm, iconKey: e.target.value })}>
                      {SKILL_ICON_OPTIONS.map((option) => <option key={option.key} value={option.key}>{option.label}</option>)}
                    </select>
                  </Field>
                </div>
                {skillForm.group === '__new' && (
                  <Field id="skill-new-group" label="New group name *">
                    <input id="skill-new-group" value={skillForm.newGroup} onChange={(e) => setSkillForm({ ...skillForm, newGroup: e.target.value })} placeholder="e.g. DevOps & Cloud" required />
                  </Field>
                )}
                <div className="form-row">
                  <Field id="skill-level" label={`Level: ${skillForm.level}%`}>
                    <input id="skill-level" type="range" min="0" max="100" value={skillForm.level} onChange={(e) => setSkillForm({ ...skillForm, level: Number(e.target.value) })} />
                  </Field>
                  <Field id="skill-color" label="Bar colour">
                    <input id="skill-color" type="color" value={skillForm.color} onChange={(e) => setSkillForm({ ...skillForm, color: e.target.value })} />
                  </Field>
                </div>
                <div className="admin-actions-row">
                  <button type="submit" className="btn btn-primary"><FaFloppyDisk aria-hidden="true" /> {editingSkillId ? 'Save skill' : 'Add skill'}</button>
                  {editingSkillId && (
                    <button type="button" className="btn btn-ghost" onClick={() => { setEditingSkillId(''); setSkillForm({ name: '', group: 'Tools & Business', newGroup: '', level: 70, color: '#2b9e7a', iconKey: 'code' }); }}>Cancel edit</button>
                  )}
                </div>
              </form>

              <aside className="admin-side-list">
                <h2>Skills added in Admin ({customSkills.length})</h2>
                {customSkills.length === 0 ? (
                  <p className="empty-state">No custom skills yet. Add one with the form and it appears instantly on the public Skills section in this browser.</p>
                ) : customSkills.map((skill) => (
                  <article className="admin-list-item" key={skill.id}>
                    <span className="admin-colour-dot" style={{ background: skill.color }} aria-hidden="true" />
                    <span><strong>{skill.name}</strong><small>{skill.group} · {skill.level}%</small></span>
                    <span className="admin-item-actions">
                      <button type="button" onClick={() => startEditSkill(skill)} aria-label={`Edit ${skill.name}`}><FaPen aria-hidden="true" /></button>
                      <button type="button" onClick={() => { content.deleteCustomSkill(skill.id); notify(`${skill.name} deleted.`); }} aria-label={`Delete ${skill.name}`}><FaTrashCan aria-hidden="true" /></button>
                    </span>
                  </article>
                ))}
                <p className="admin-hint">Built-in published skills are edited in <code>src/data/portfolio.js</code>; admin additions are a local overlay.</p>
              </aside>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="admin-grid projects-admin-grid">
              <form className="form admin-form" onSubmit={handleProjectSubmit}>
                <h2>{editingProjectId ? 'Edit custom project' : 'Add a project'}</h2>
                <Field id="project-title" label="Project title *">
                  <input id="project-title" value={projectForm.title} onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })} placeholder="e.g. Stock Management App — Symfony" required />
                </Field>
                <div className="form-row">
                  <Field id="project-category" label="Category">
                    <select id="project-category" value={projectForm.category} onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value })}>
                      {PROJECT_CATEGORIES.map((category) => <option key={category}>{category}</option>)}
                    </select>
                  </Field>
                  <Field id="project-year" label="Year">
                    <input id="project-year" type="number" min="1990" max="2100" value={projectForm.year} onChange={(e) => setProjectForm({ ...projectForm, year: e.target.value })} />
                  </Field>
                </div>
                <div className="form-row">
                  <Field id="project-date" label="Display date">
                    <input id="project-date" value={projectForm.date} onChange={(e) => setProjectForm({ ...projectForm, date: e.target.value })} placeholder="e.g. Oct 2026" />
                  </Field>
                  <Field id="project-role" label="Your role">
                    <input id="project-role" value={projectForm.role} onChange={(e) => setProjectForm({ ...projectForm, role: e.target.value })} />
                  </Field>
                </div>
                <Field id="project-short" label="Short description *">
                  <textarea id="project-short" rows="3" value={projectForm.short} onChange={(e) => setProjectForm({ ...projectForm, short: e.target.value })} required />
                </Field>
                <Field id="project-overview" label="Full overview">
                  <textarea id="project-overview" rows="5" value={projectForm.overview} onChange={(e) => setProjectForm({ ...projectForm, overview: e.target.value })} />
                </Field>
                <Field id="project-features" label="Key features" hint="One feature per line.">
                  <textarea id="project-features" rows="4" value={projectForm.featuresText} onChange={(e) => setProjectForm({ ...projectForm, featuresText: e.target.value })} />
                </Field>
                <div className="form-row">
                  <Field id="project-stack" label="Tech stack" hint="Comma-separated.">
                    <input id="project-stack" value={projectForm.stackText} onChange={(e) => setProjectForm({ ...projectForm, stackText: e.target.value })} placeholder="Symfony, SQL Server, React" />
                  </Field>
                  <Field id="project-tags" label="Tags" hint="Comma-separated.">
                    <input id="project-tags" value={projectForm.tagsText} onChange={(e) => setProjectForm({ ...projectForm, tagsText: e.target.value })} placeholder="ERP, Dashboard, Business" />
                  </Field>
                </div>
                <Field id="project-cover" label="Cover image URL" hint="Paste an image URL, or upload below. Empty = an automatic branded cover.">
                  <input id="project-cover" value={projectForm.cover} onChange={(e) => setProjectForm({ ...projectForm, cover: e.target.value })} placeholder="https://…" />
                </Field>
                <Field id="project-cover-file" label="…or upload a cover (max 1.5 MB)">
                  <input id="project-cover-file" type="file" accept="image/*" onChange={(e) => readProjectImage(e.target.files?.[0])} />
                </Field>
                {projectForm.cover && <img className="admin-cover-preview" src={projectForm.cover} alt="Project cover preview" />}
                <Field id="project-gallery" label="Gallery image URLs" hint="One URL per line (optional).">
                  <textarea id="project-gallery" rows="3" value={projectForm.galleryText} onChange={(e) => setProjectForm({ ...projectForm, galleryText: e.target.value })} />
                </Field>
                <div className="form-row">
                  <Field id="project-live" label="Live site URL">
                    <input id="project-live" value={projectForm.live} onChange={(e) => setProjectForm({ ...projectForm, live: e.target.value })} placeholder="https://…" />
                  </Field>
                  <Field id="project-repo" label="GitHub URL">
                    <input id="project-repo" value={projectForm.repo} onChange={(e) => setProjectForm({ ...projectForm, repo: e.target.value })} placeholder="https://github.com/…" />
                  </Field>
                </div>
                <label className="admin-checkbox">
                  <input type="checkbox" checked={projectForm.featured} onChange={(e) => setProjectForm({ ...projectForm, featured: e.target.checked })} />
                  Mark as featured
                </label>
                <div className="admin-actions-row">
                  <button type="submit" className="btn btn-primary"><FaFloppyDisk aria-hidden="true" /> {editingProjectId ? 'Save project' : 'Add project'}</button>
                  {editingProjectId && (
                    <button type="button" className="btn btn-ghost" onClick={() => { setEditingProjectId(''); setProjectForm(emptyProjectForm()); }}>Cancel edit</button>
                  )}
                </div>
              </form>

              <aside className="admin-side-list">
                <h2>Displayed projects ({projects.length})</h2>
                {projects.map((project) => (
                  <article className="admin-list-item project" key={project.slug}>
                    <img src={project.cover} alt="" loading="lazy" />
                    <span><strong>{project.title}</strong><small>{project.category} · {project.year} · {project.custom ? 'Added in Admin' : 'Built-in'}</small></span>
                    <span className="admin-item-actions">
                      <Link to={`/projects/${project.slug}`} aria-label={`View ${project.title}`}><FaEye aria-hidden="true" /></Link>
                      {project.custom && (
                        <button type="button" onClick={() => startEditProject(project)} aria-label={`Edit ${project.title}`}><FaPen aria-hidden="true" /></button>
                      )}
                      <button
                        type="button"
                        onClick={() => { content.deleteProject(project); notify(project.custom ? `${project.title} deleted.` : `${project.title} hidden in this browser.`); }}
                        aria-label={`${project.custom ? 'Delete' : 'Hide'} ${project.title}`}
                        title={project.custom ? 'Delete custom project' : 'Hide built-in project locally'}
                      >
                        <FaTrashCan aria-hidden="true" />
                      </button>
                    </span>
                  </article>
                ))}
                {hiddenDefaultProjects.length > 0 && (
                  <>
                    <h3>Hidden built-in projects</h3>
                    {hiddenDefaultProjects.map((project) => (
                      <article className="admin-list-item" key={project.slug}>
                        <span><strong>{project.title}</strong><small>Hidden locally</small></span>
                        <button type="button" className="text-link" onClick={() => { content.restoreProject(project.slug); notify(`${project.title} restored.`); }}>
                          <FaRotateLeft aria-hidden="true" /> Restore
                        </button>
                      </article>
                    ))}
                  </>
                )}
              </aside>
            </div>
          )}

          {activeTab === 'experience' && (
            <form className="form admin-form admin-wide-form" onSubmit={handleExperienceSave}>
              <div className="admin-form-head">
                <span>
                  <h2>Work experience</h2>
                  <p>Edit the timeline used on Home and About. One achievement/responsibility per line.</p>
                </span>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setExperienceDirty(true);
                    setDraftExperience((items) => [{
                      draftId: `new-${Date.now()}`, period: '', title: '', org: '', pointsText: '',
                    }, ...items]);
                  }}
                >
                  <FaPlus aria-hidden="true" /> Add experience
                </button>
              </div>

              {draftExperience.map((item, index) => (
                <fieldset className="admin-experience-item" key={item.draftId}>
                  <legend>Experience #{index + 1}</legend>
                  <div className="form-row">
                    <Field id={`exp-period-${item.draftId}`} label="Period *">
                      <input id={`exp-period-${item.draftId}`} value={item.period} onChange={(e) => updateExperienceItem(item.draftId, 'period', e.target.value)} placeholder="2026 — Present" />
                    </Field>
                    <Field id={`exp-title-${item.draftId}`} label="Job title *">
                      <input id={`exp-title-${item.draftId}`} value={item.title} onChange={(e) => updateExperienceItem(item.draftId, 'title', e.target.value)} placeholder="Full-Stack Developer" />
                    </Field>
                  </div>
                  <Field id={`exp-org-${item.draftId}`} label="Company / organisation *">
                    <input id={`exp-org-${item.draftId}`} value={item.org} onChange={(e) => updateExperienceItem(item.draftId, 'org', e.target.value)} placeholder="Company · City" />
                  </Field>
                  <Field id={`exp-points-${item.draftId}`} label="Responsibilities / achievements" hint="One bullet per line.">
                    <textarea id={`exp-points-${item.draftId}`} rows="4" value={item.pointsText} onChange={(e) => updateExperienceItem(item.draftId, 'pointsText', e.target.value)} />
                  </Field>
                  <div className="admin-actions-row">
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => moveExperienceItem(index, -1)} disabled={index === 0}>Move up</button>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => moveExperienceItem(index, 1)} disabled={index === draftExperience.length - 1}>Move down</button>
                    <button
                      type="button"
                      className="btn btn-danger-ghost btn-sm"
                      onClick={() => { setExperienceDirty(true); setDraftExperience((items) => items.filter((entry) => entry.draftId !== item.draftId)); }}
                    >
                      <FaTrashCan aria-hidden="true" /> Delete
                    </button>
                  </div>
                </fieldset>
              ))}

              <div className="admin-actions-row sticky-actions">
                <button type="submit" className="btn btn-primary"><FaFloppyDisk aria-hidden="true" /> Save experience</button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    content.resetExperience();
                    setDraftExperience(toExperienceDraft(defaultExperience));
                    setExperienceDirty(false);
                    notify('Work experience reset to the published defaults.');
                  }}
                >
                  <FaRotateLeft aria-hidden="true" /> Reset to defaults
                </button>
                {experienceDirty && <span className="admin-dirty">Unsaved changes</span>}
              </div>
            </form>
          )}

          {activeTab === 'email' && (
            <div className="admin-grid">
              <form className="form admin-form" onSubmit={handleEmailConfigSave}>
                <div className="admin-form-head">
                  <div>
                    <h2><FaEnvelope aria-hidden="true" /> EmailJS configuration</h2>
                    <p>These are the values the Contact form uses. Published defaults are prefilled; saving here overrides them in this browser.</p>
                  </div>
                  <span className={`admin-status-pill${hasCustomEmailConfig ? ' is-custom' : ''}`}>
                    {hasCustomEmailConfig ? 'Admin override' : 'Published defaults'}
                  </span>
                </div>

                <Field id="emailjs-service-id" label="Service ID *">
                  <input
                    id="emailjs-service-id"
                    type="text"
                    value={emailForm.serviceId}
                    onChange={(e) => updateEmailForm('serviceId', e.target.value)}
                    placeholder="service_xxxxxxxxx"
                    autoComplete="off"
                    spellCheck="false"
                    required
                  />
                </Field>

                <Field id="emailjs-template-id" label="Template ID *">
                  <input
                    id="emailjs-template-id"
                    type="text"
                    value={emailForm.templateId}
                    onChange={(e) => updateEmailForm('templateId', e.target.value)}
                    placeholder="template_xxxxxxxxx"
                    autoComplete="off"
                    spellCheck="false"
                    required
                  />
                </Field>

                <Field id="emailjs-public-key" label="Public Key *">
                  <input
                    id="emailjs-public-key"
                    type="text"
                    value={emailForm.publicKey}
                    onChange={(e) => updateEmailForm('publicKey', e.target.value)}
                    placeholder="EmailJS account Public Key"
                    autoComplete="off"
                    spellCheck="false"
                    required
                  />
                </Field>

                <div className="admin-hint">
                  Find the Service ID under Email Services, the Template ID under Email Templates, and the Public Key under
                  Account → General in your EmailJS dashboard. Never paste a private key here.
                </div>

                <div className="admin-actions-row">
                  <button type="submit" className="btn btn-primary"><FaFloppyDisk aria-hidden="true" /> Save email settings</button>
                  <button type="button" className="btn btn-ghost" onClick={sendTestEmail} disabled={emailTestBusy}>
                    <FaPaperPlane aria-hidden="true" /> {emailTestBusy ? 'Sending…' : 'Send test email'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => {
                      if (!window.confirm('Reset EmailJS settings to the published defaults?')) return;
                      resetEmailConfig();
                    }}
                  >
                    <FaRotateLeft aria-hidden="true" /> Reset to defaults
                  </button>
                  {emailDirty && (
                    <button type="button" className="btn btn-danger-ghost" onClick={discardEmailChanges}>Discard changes</button>
                  )}
                  {emailDirty && <span className="admin-dirty">Unsaved changes</span>}
                </div>
              </form>

              <aside className="admin-side-list admin-email-summary" aria-label="Current EmailJS configuration">
                <div className="admin-list-head">
                  <h3>Currently used</h3>
                  <span>{hasCustomEmailConfig ? 'Admin' : 'Code'}</span>
                </div>
                <dl className="admin-email-values">
                  <div>
                    <dt>Service ID</dt>
                    <dd><code>{emailConfig.serviceId}</code></dd>
                  </div>
                  <div>
                    <dt>Template ID</dt>
                    <dd><code>{emailConfig.templateId}</code></dd>
                  </div>
                  <div>
                    <dt>Public Key</dt>
                    <dd><code>{emailConfig.publicKey}</code></dd>
                  </div>
                  <div>
                    <dt>Messages go through</dt>
                    <dd>{profile.email} (set in the EmailJS template)</dd>
                  </div>
                </dl>

                <div className="admin-note">
                  <FaTriangleExclamation aria-hidden="true" />
                  <p>
                    This is a static GitHub Pages site, so Admin saves are browser-local. They take effect for the Contact form
                    in this browser and are included in JSON backups, but publishing new defaults for every visitor still requires
                    updating the site code/environment and redeploying.
                  </p>
                </div>

                <div className="admin-actions-row">
                  <Link className="btn btn-primary" to="/contact"><FaEye aria-hidden="true" /> Open Contact form</Link>
                  <a className="btn btn-ghost" href="https://dashboard.emailjs.com/admin" target="_blank" rel="noreferrer">Open EmailJS dashboard</a>
                </div>
              </aside>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="admin-panel admin-data-grid">
              <article className="admin-info-card">
                <h2><FaDownload aria-hidden="true" /> Export backup</h2>
                <p>Download every local admin change (custom skills/projects, hidden projects, work experience and EmailJS settings) as JSON. Keep it as a backup or send it to a developer to publish permanently in code.</p>
                <button type="button" className="btn btn-primary" onClick={exportData}><FaDownload aria-hidden="true" /> Download JSON</button>
              </article>
              <article className="admin-info-card">
                <h2><FaUpload aria-hidden="true" /> Import backup</h2>
                <p>Restore a previously exported JSON file on this or another browser. Importing replaces the current local overlay.</p>
                <input ref={importInputRef} className="sr-only" type="file" accept="application/json,.json" onChange={(e) => importData(e.target.files?.[0])} aria-label="Import portfolio JSON backup" />
                <button type="button" className="btn btn-ghost" onClick={() => importInputRef.current?.click()}><FaUpload aria-hidden="true" /> Choose JSON file</button>
              </article>
              <article className="admin-info-card danger">
                <h2><FaRotateLeft aria-hidden="true" /> Reset local content</h2>
                <p>Remove all admin additions/changes from this browser and return to the portfolio exactly as published in code.</p>
                <button
                  type="button"
                  className="btn btn-danger-ghost"
                  onClick={() => {
                    if (!window.confirm('Reset all local admin content in this browser? Export a backup first if needed.')) return;
                    content.resetContent();
                    setDraftExperience(toExperienceDraft(defaultExperience));
                    setExperienceDirty(false);
                    setEmailForm({ ...defaultEmailConfig });
                    setEmailDirty(false);
                    notify('Local portfolio content reset to published defaults.');
                  }}
                >
                  <FaRotateLeft aria-hidden="true" /> Reset everything local
                </button>
              </article>
              <article className="admin-info-card">
                <h2><FaLock aria-hidden="true" /> Security reality check</h2>
                <p>
                  The password only locks this editing screen on this device. A public, multi-device admin with a real database
                  requires a backend/CMS and proper authentication; never put private API keys in this front-end code.
                </p>
                <button type="button" className="btn btn-ghost" onClick={lockAdmin}><FaLock aria-hidden="true" /> Lock admin now</button>
              </article>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
