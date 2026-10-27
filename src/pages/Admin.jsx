import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import {
  FaBriefcase, FaCheck, FaCode, FaDatabase, FaDownload, FaEnvelope, FaEnvelopeOpen,
  FaEye, FaEyeSlash, FaFloppyDisk, FaFolderOpen, FaGears, FaInbox, FaLock,
  FaPaperPlane, FaPen, FaPlus, FaRightFromBracket, FaRotateLeft, FaTrashCan,
  FaTriangleExclamation, FaUpload,
} from 'react-icons/fa6';
import useTitle from '../hooks/useTitle';
import PageHero from '../components/PageHero';
import { profile } from '../data/portfolio';
import { SKILL_ICON_OPTIONS, usePortfolioContent } from '../content/PortfolioContentContext';
import {
  ADMIN_EMAIL, SUPABASE_PROJECT_REF, SUPABASE_URL, isAdminUser, supabase, supabaseErrorMessage,
} from '../lib/supabase';

const PROJECT_CATEGORIES = ['Full-Stack', 'Frontend', 'Mobile'];
const MESSAGE_STATUSES = ['new', 'read', 'replied', 'archived'];

const splitLines = (value) => String(value || '').split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
const splitComma = (value) => String(value || '').split(/[,\n]/).map((item) => item.trim()).filter(Boolean);
const toExperienceDraft = (items) => items.map((item, index) => ({
  id: item.id || '',
  draftId: item.id || `${index}-${item.title || 'experience'}-${item.period || ''}`,
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
    skillGroups, skills, projects, allProjects, experience, defaultExperience,
    emailConfig, defaultEmailConfig, hasCustomEmailConfig,
    contentSource, contentLoading, contentError, isDatabaseConnected,
    isSupabaseConfigured, supabaseUser, hasLegacyLocalContent,
  } = content;

  const [sessionChecked, setSessionChecked] = useState(!supabase);
  const [authEmail, setAuthEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [notice, setNotice] = useState('');
  const importInputRef = useRef(null);
  const isUnlocked = isAdminUser(supabaseUser);

  const [editingSkillId, setEditingSkillId] = useState('');
  const [skillForm, setSkillForm] = useState({
    name: '', group: 'Tools & Business', newGroup: '', level: 70, color: '#2b9e7a', iconKey: 'code',
  });

  const emptyProjectForm = () => ({
    slug: '', title: '', category: 'Full-Stack', year: new Date().getFullYear(), date: '', role: 'Design & Development',
    short: '', overview: '', featuresText: '', stackText: '', tagsText: '', cover: '', galleryText: '',
    structure: '', live: '', repo: '', featured: false, published: true,
  });
  const [editingProjectId, setEditingProjectId] = useState('');
  const [projectForm, setProjectForm] = useState(emptyProjectForm);
  const [projectCoverFile, setProjectCoverFile] = useState(null);

  const [draftExperience, setDraftExperience] = useState(() => toExperienceDraft(experience));
  const [experienceDirty, setExperienceDirty] = useState(false);

  const [emailForm, setEmailForm] = useState(() => ({ ...emailConfig }));
  const [emailDirty, setEmailDirty] = useState(false);
  const [emailTestBusy, setEmailTestBusy] = useState(false);

  const [contactMessages, setContactMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState('');
  const [messageStatusFilter, setMessageStatusFilter] = useState('all');

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

  useEffect(() => {
    if (!supabase) {
      setSessionChecked(true);
      return undefined;
    }
    let mounted = true;
    supabase.auth.getSession()
      .catch(() => null)
      .finally(() => {
        if (mounted) setSessionChecked(true);
      });
    return () => { mounted = false; };
  }, []);

  const fetchContactMessages = useCallback(async () => {
    if (!supabase || !isUnlocked) return;
    setMessagesLoading(true);
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) {
      setMessagesError(supabaseErrorMessage(error, 'Could not load contact messages.'));
    } else {
      setContactMessages(data || []);
      setMessagesError('');
    }
    setMessagesLoading(false);
  }, [isUnlocked]);

  useEffect(() => {
    if (!supabase || !isUnlocked) return undefined;
    fetchContactMessages();
    const channel = supabase
      .channel(`admin-contact-messages-${Date.now()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_messages' }, () => fetchContactMessages())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchContactMessages, isUnlocked]);

  const notify = (message) => setNotice(message);
  const totalSkills = skillGroups.reduce((sum, group) => sum + group.skills.length, 0);
  const unpublishedProjects = allProjects.filter((project) => !project.published);
  const unreadMessages = contactMessages.filter((message) => message.status === 'new').length;
  const visibleContactMessages = messageStatusFilter === 'all'
    ? contactMessages
    : contactMessages.filter((message) => message.status === messageStatusFilter);

  const runDatabaseAction = async (action, successMessage) => {
    if (saving) return null;
    setSaving(true);
    try {
      const result = await action();
      if (successMessage) notify(successMessage);
      return result;
    } catch (error) {
      notify(supabaseErrorMessage(error, 'The Supabase action failed.'));
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleAuth = async (event) => {
    event.preventDefault();
    setAuthError('');
    if (!isSupabaseConfigured) {
      setAuthError('Supabase is not configured in this build.');
      return;
    }
    if (!authEmail.trim() || !password) {
      setAuthError('Enter the admin email and password.');
      return;
    }
    setAuthBusy(true);
    try {
      await content.signInAdmin(authEmail, password);
      setPassword('');
      notify('Signed in to Supabase. Admin changes now publish for every visitor.');
    } catch (error) {
      setAuthError(supabaseErrorMessage(error, 'Could not sign in. Check the email/password and confirm the user exists in Supabase Authentication.'));
    } finally {
      setAuthBusy(false);
    }
  };

  const signOutAdmin = async () => {
    setAuthBusy(true);
    try {
      await content.signOutAdmin();
      setPassword('');
      setActiveTab('overview');
    } catch (error) {
      notify(supabaseErrorMessage(error, 'Could not sign out.'));
    } finally {
      setAuthBusy(false);
    }
  };

  const handleSkillSubmit = async (event) => {
    event.preventDefault();
    const group = skillForm.group === '__new' ? skillForm.newGroup.trim() : skillForm.group;
    if (!skillForm.name.trim() || !group) {
      notify('Please add a skill name and choose or create a group.');
      return;
    }
    const saved = await runDatabaseAction(() => content.addSkill({
      id: editingSkillId || undefined,
      name: skillForm.name,
      group,
      level: Number(skillForm.level),
      color: skillForm.color,
      iconKey: skillForm.iconKey,
    }));
    if (!saved) return;
    notify(`${saved.name} ${editingSkillId ? 'updated' : 'added'} in Supabase and published to Skills.`);
    setEditingSkillId('');
    setSkillForm({ name: '', group: 'Tools & Business', newGroup: '', level: 70, color: '#2b9e7a', iconKey: 'code' });
  };

  const handleDeleteSkill = async (skill) => {
    if (!window.confirm(`Delete ${skill.name} from Supabase for every visitor?`)) return;
    await runDatabaseAction(() => content.deleteSkill(skill.id), `${skill.name} deleted from Supabase.`);
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
    if (file.size > 5_000_000) {
      notify('Please use a project cover under 5 MB, or paste an image URL.');
      return;
    }
    setProjectCoverFile(file);
    const reader = new FileReader();
    reader.onload = () => setProjectForm((form) => ({ ...form, cover: String(reader.result || '') }));
    reader.onerror = () => notify('The selected image could not be previewed.');
    reader.readAsDataURL(file);
  };

  const handleProjectSubmit = async (event) => {
    event.preventDefault();
    if (!projectForm.title.trim() || !projectForm.short.trim()) {
      notify('Please add at least a project title and short description.');
      return;
    }
    const saved = await runDatabaseAction(() => content.addProject({
      id: editingProjectId || undefined,
      slug: projectForm.slug,
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
      cover: projectCoverFile ? '' : projectForm.cover,
      gallery: splitLines(projectForm.galleryText),
      structure: projectForm.structure,
      live: projectForm.live,
      repo: projectForm.repo,
      featured: projectForm.featured,
      published: projectForm.published,
    }, projectCoverFile));
    if (!saved) return;
    notify(`${saved.title} ${editingProjectId ? 'updated' : 'added'} in Supabase${saved.published ? ' and published.' : ' as a draft.'}`);
    setEditingProjectId('');
    setProjectForm(emptyProjectForm());
    setProjectCoverFile(null);
  };

  const startEditProject = (project) => {
    setEditingProjectId(project.id || '');
    setProjectForm({
      slug: project.slug || '',
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
      structure: project.structure || '',
      live: project.live || '',
      repo: project.repo || '',
      featured: Boolean(project.featured),
      published: project.published !== false,
    });
    setProjectCoverFile(null);
    setActiveTab('projects');
  };

  const handleDeleteProject = async (project) => {
    if (!window.confirm(`Delete ${project.title} from Supabase for every visitor? This cannot be undone from Admin.`)) return;
    await runDatabaseAction(() => content.deleteProject(project), `${project.title} deleted from Supabase.`);
  };

  const handleToggleProjectPublished = async (project) => {
    await runDatabaseAction(
      () => content.setProjectPublished(project, !project.published),
      `${project.title} is now ${project.published ? 'a draft' : 'published'}.`
    );
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

  const handleExperienceSave = async (event) => {
    event.preventDefault();
    const cleaned = draftExperience.map((item) => ({
      id: item.id || undefined,
      period: item.period.trim(),
      title: item.title.trim(),
      org: item.org.trim(),
      points: splitLines(item.pointsText),
    })).filter((item) => item.period || item.title || item.org || item.points.length);
    if (!cleaned.length || cleaned.some((item) => !item.period || !item.title || !item.org)) {
      notify('Each experience needs a period, job title and organisation.');
      return;
    }
    const saved = await runDatabaseAction(() => content.saveExperience(cleaned));
    if (!saved) return;
    setExperienceDirty(false);
    notify('Work experience saved in Supabase and updated on Home and About.');
  };

  const handleResetExperience = async () => {
    if (!window.confirm('Replace the Supabase work-experience timeline with the published code defaults?')) return;
    const saved = await runDatabaseAction(() => content.resetExperience());
    if (!saved) return;
    setDraftExperience(toExperienceDraft(defaultExperience));
    setExperienceDirty(false);
    notify('Work experience reset in Supabase to the published defaults.');
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

  const handleEmailConfigSave = async (event) => {
    event.preventDefault();
    const config = cleanedEmailForm();
    if (!validateEmailForm(config)) return;
    const saved = await runDatabaseAction(() => content.saveEmailConfig(config));
    if (!saved) return;
    setEmailForm(config);
    setEmailDirty(false);
    notify('EmailJS configuration saved in Supabase. Every visitor now uses it.');
  };

  const resetEmailConfig = async () => {
    const saved = await runDatabaseAction(() => content.resetEmailConfig());
    if (!saved) return;
    setEmailForm({ ...defaultEmailConfig });
    setEmailDirty(false);
    notify('EmailJS configuration reset in Supabase to the published defaults.');
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
    if (!window.confirm('Import this JSON into Supabase? It will replace the live skills, projects, experience and EmailJS settings for every visitor.')) return;
    const saved = await runDatabaseAction(async () => content.importContent(await file.text()));
    if (saved) {
      setExperienceDirty(false);
      setEmailDirty(false);
      notify('Portfolio content imported into Supabase successfully.');
    }
    if (importInputRef.current) importInputRef.current.value = '';
  };

  const handleSeedDefaults = async () => {
    const message = isDatabaseConnected
      ? 'Reset all Supabase portfolio content to the published code defaults? Export a backup first if needed.'
      : 'Seed Supabase with the currently published portfolio defaults?';
    if (!window.confirm(message)) return;
    const saved = await runDatabaseAction(() => content.resetContent());
    if (!saved) return;
    setDraftExperience(toExperienceDraft(defaultExperience));
    setExperienceDirty(false);
    setEmailForm({ ...defaultEmailConfig });
    setEmailDirty(false);
    notify(isDatabaseConnected ? 'Supabase content reset to published defaults.' : 'Supabase seeded with the published portfolio defaults.');
  };

  const handleMigrateLocalContent = async (clearAfterImport) => {
    if (!window.confirm('Copy this browser’s old local Admin data into Supabase? This replaces the live database content with the local merged version.')) return;
    const saved = await runDatabaseAction(() => content.migrateLocalContent({ clearAfterImport }));
    if (!saved) return;
    setExperienceDirty(false);
    setEmailDirty(false);
    notify(clearAfterImport
      ? 'Old local Admin data migrated to Supabase and cleared from this browser.'
      : 'Old local Admin data migrated to Supabase. You can clear the local copy after checking the site.');
  };

  const handleClearLocalLegacy = () => {
    if (!window.confirm('Remove the old local Admin content copy from this browser? Supabase data will not be changed.')) return;
    content.clearLocalLegacyContent();
    try {
      window.localStorage.removeItem('hamza-portfolio-admin-hash-v1');
      window.sessionStorage.removeItem('hamza-portfolio-admin-session-v1');
    } catch { /* storage unavailable */ }
    notify('Old local Admin data removed from this browser.');
  };

  const handleMessageStatus = async (message, status) => {
    if (!supabase) return;
    const saved = await runDatabaseAction(async () => {
      const { error } = await supabase.from('contact_messages').update({ status }).eq('id', message.id);
      if (error) throw error;
      await fetchContactMessages();
      return true;
    });
    if (saved) notify(`Message from ${message.name} marked as ${status}.`);
  };

  const handleDeleteMessage = async (message) => {
    if (!supabase || !window.confirm(`Delete the message from ${message.name}?`)) return;
    const saved = await runDatabaseAction(async () => {
      const { error } = await supabase.from('contact_messages').delete().eq('id', message.id);
      if (error) throw error;
      await fetchContactMessages();
      return true;
    });
    if (saved) notify('Contact message deleted.');
  };

  if (!sessionChecked || (supabase && !supabaseUser && contentLoading && !isUnlocked)) {
    return (
      <>
        <PageHero
          eyebrow="Private area"
          title="Portfolio administration"
          sub="Checking your Supabase session…"
        />
        <section className="section admin-auth-section">
          <div className="container-x narrow">
            <div className="form admin-auth-card" role="status">
              <span className="service-icon admin-auth-icon"><FaDatabase aria-hidden="true" /></span>
              <h2>Connecting to Supabase…</h2>
              <p>Loading the real portfolio database and your admin session.</p>
            </div>
          </div>
        </section>
      </>
    );
  }

  if (!isUnlocked) {
    const authUsersUrl = SUPABASE_PROJECT_REF
      ? `https://supabase.com/dashboard/project/${SUPABASE_PROJECT_REF}/auth/users`
      : 'https://supabase.com/dashboard';
    return (
      <>
        <PageHero
          eyebrow="Private area"
          title="Portfolio administration"
          sub="Sign in with Supabase Auth to manage the real portfolio database. Changes publish for every visitor."
        />
        <section className="section admin-auth-section">
          <div className="container-x narrow">
            <form className="form admin-auth-card" onSubmit={handleAuth}>
              <span className="service-icon admin-auth-icon"><FaLock aria-hidden="true" /></span>
              <h2>Supabase admin sign-in</h2>
              <p>
                Use the owner account <strong>{ADMIN_EMAIL}</strong>. Row Level Security allows writes only from
                this authenticated admin email (or an account with app role <code>admin</code>).
              </p>
              {!isSupabaseConfigured && (
                <p className="form-status error" role="alert">
                  <FaTriangleExclamation aria-hidden="true" /> Supabase is not configured in this build.
                </p>
              )}
              {supabaseUser && !isUnlocked && (
                <p className="form-status error" role="alert">
                  <FaTriangleExclamation aria-hidden="true" /> {supabaseUser.email} is signed in, but it is not the authorized portfolio admin.
                </p>
              )}
              {contentError && (
                <p className="form-status error" role="alert">
                  <FaTriangleExclamation aria-hidden="true" /> {contentError}
                </p>
              )}
              {authError && <p className="form-status error" role="alert"><FaTriangleExclamation aria-hidden="true" /> {authError}</p>}
              <Field id="admin-email" label="Admin email">
                <input
                  id="admin-email"
                  type="email"
                  value={authEmail}
                  onChange={(event) => setAuthEmail(event.target.value)}
                  autoComplete="username"
                  required
                />
              </Field>
              <Field id="admin-password" label="Password">
                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                />
              </Field>
              <button type="submit" className="btn btn-primary form-submit" disabled={authBusy || !isSupabaseConfigured}>
                <FaLock aria-hidden="true" /> {authBusy ? 'Signing in…' : 'Sign in to Admin'}
              </button>
              {supabaseUser && !isUnlocked && (
                <button type="button" className="btn btn-ghost form-submit" onClick={signOutAdmin} disabled={authBusy}>
                  <FaRightFromBracket aria-hidden="true" /> Sign out this account
                </button>
              )}
              <div className="admin-note">
                <FaDatabase aria-hidden="true" />
                <p>
                  First time? In Supabase Dashboard → Authentication → Users, create and confirm a user with
                  {' '}<strong>{ADMIN_EMAIL}</strong>, then disable public sign-ups in Authentication settings.
                  The database tables are created by the migration in <code>supabase/migrations</code>.
                </p>
              </div>
              <div className="admin-actions-row">
                <a className="btn btn-ghost btn-sm" href={authUsersUrl} target="_blank" rel="noreferrer">Open Supabase Auth users</a>
                <a className="btn btn-ghost btn-sm" href={SUPABASE_URL} target="_blank" rel="noreferrer">Project API URL</a>
              </div>
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
    { id: 'messages', label: unreadMessages ? `Messages (${unreadMessages})` : 'Messages', icon: FaInbox },
    { id: 'email', label: 'EmailJS', icon: FaEnvelope },
    { id: 'data', label: 'Backup / Data', icon: FaFloppyDisk },
  ];

  return (
    <>
      <PageHero
        eyebrow="Administration"
        title="Manage your portfolio"
        sub="Manage real Supabase data: skills, projects, experience, contact messages and EmailJS settings publish for every visitor."
      />

      <section className="section admin-section">
        <div className="container-x">
          {contentError && (
            <p className="form-status error admin-status" role="alert">
              <FaTriangleExclamation aria-hidden="true" /> {contentError}
            </p>
          )}
          {notice && (
            <p className="form-status success admin-status" role="status">
              <FaCheck aria-hidden="true" /> {notice}
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
              <button type="button" className="btn btn-ghost btn-sm" onClick={signOutAdmin} disabled={authBusy}><FaRightFromBracket aria-hidden="true" /> Sign out</button>
            </div>
          </div>

          {activeTab === 'overview' && (
            <div className="admin-panel">
              <div className="admin-stat-grid">
                <article><strong>{totalSkills}</strong><span>Skills</span><small>{skillGroups.length} groups in {isDatabaseConnected ? 'Supabase' : 'fallback'}</small></article>
                <article><strong>{projects.length}</strong><span>Published projects</span><small>{unpublishedProjects.length} draft{unpublishedProjects.length === 1 ? '' : 's'} · {allProjects.length} total</small></article>
                <article><strong>{contactMessages.length}</strong><span>Contact messages</span><small>{unreadMessages} new · {experience.length} work experiences</small></article>
              </div>
              <div className="admin-info-card">
                <h2><FaDatabase aria-hidden="true" /> Supabase publishing is {isDatabaseConnected ? 'live' : 'waiting for seed'}</h2>
                <p>
                  Signed in as <strong>{supabaseUser?.email}</strong>. Portfolio content is stored in Supabase Postgres
                  {SUPABASE_PROJECT_REF ? <> (<code>{SUPABASE_PROJECT_REF}</code>)</> : null}; visitors read it with the publishable key,
                  while Row Level Security allows only your admin account to create, update or delete records.
                  Realtime refreshes are enabled for content tables.
                </p>
                {!isDatabaseConnected && (
                  <p>
                    The site is showing the code/legacy fallback until the database is seeded. Go to
                    <strong> Backup / Data</strong> and seed the published defaults or migrate this browser’s old local Admin data.
                  </p>
                )}
                <div className="admin-actions-row">
                  <button type="button" className="btn btn-primary" onClick={() => setActiveTab('skills')}><FaPlus aria-hidden="true" /> Add a skill</button>
                  <button type="button" className="btn btn-ghost" onClick={() => setActiveTab('projects')}><FaPlus aria-hidden="true" /> Add a project</button>
                  <button type="button" className="btn btn-ghost" onClick={() => setActiveTab('messages')}><FaInbox aria-hidden="true" /> Messages</button>
                  <button type="button" className="btn btn-ghost" onClick={() => setActiveTab('email')}><FaEnvelope aria-hidden="true" /> Email settings</button>
                  <button type="button" className="btn btn-ghost" onClick={exportData}><FaDownload aria-hidden="true" /> Export backup</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="admin-grid">
              <form className="form admin-form" onSubmit={handleSkillSubmit}>
                <h2>{editingSkillId ? 'Edit skill' : 'Add a skill'}</h2>
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
                  <button type="submit" className="btn btn-primary" disabled={saving}><FaFloppyDisk aria-hidden="true" /> {saving ? 'Saving…' : editingSkillId ? 'Save skill' : 'Add skill'}</button>
                  {editingSkillId && (
                    <button type="button" className="btn btn-ghost" onClick={() => { setEditingSkillId(''); setSkillForm({ name: '', group: 'Tools & Business', newGroup: '', level: 70, color: '#2b9e7a', iconKey: 'code' }); }}>Cancel edit</button>
                  )}
                </div>
              </form>

              <aside className="admin-side-list">
                <h2>Supabase skills ({skills.length})</h2>
                {skills.length === 0 ? (
                  <p className="empty-state">No skills yet. Seed the database from Backup / Data or add the first skill.</p>
                ) : skills.map((skill) => (
                  <article className="admin-list-item" key={skill.id}>
                    <span className="admin-colour-dot" style={{ background: skill.color }} aria-hidden="true" />
                    <span><strong>{skill.name}</strong><small>{skill.group} · {skill.level}%</small></span>
                    <span className="admin-item-actions">
                      <button type="button" onClick={() => startEditSkill(skill)} aria-label={`Edit ${skill.name}`}><FaPen aria-hidden="true" /></button>
                      <button type="button" onClick={() => handleDeleteSkill(skill)} disabled={saving} aria-label={`Delete ${skill.name}`}><FaTrashCan aria-hidden="true" /></button>
                    </span>
                  </article>
                ))}
                <p className="admin-hint">Every skill is now a real Supabase record. Deleting here removes it for every visitor.</p>
              </aside>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="admin-grid projects-admin-grid">
              <form className="form admin-form" onSubmit={handleProjectSubmit}>
                <h2>{editingProjectId ? 'Edit project' : 'Add a project'}</h2>
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
                <Field id="project-cover" label="Cover image URL" hint="Paste an image URL, or upload below to Supabase Storage. Empty = automatic branded cover or the built-in project image.">
                  <input
                    id="project-cover"
                    value={projectForm.cover}
                    onChange={(e) => { setProjectCoverFile(null); setProjectForm({ ...projectForm, cover: e.target.value }); }}
                    placeholder="https://…"
                  />
                </Field>
                <Field
                  id="project-cover-file"
                  label="…or upload a cover to Supabase Storage (max 5 MB)"
                  hint={projectCoverFile ? `Selected: ${projectCoverFile.name} — it will upload when you save.` : undefined}
                >
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
                <label className="admin-checkbox">
                  <input type="checkbox" checked={projectForm.published} onChange={(e) => setProjectForm({ ...projectForm, published: e.target.checked })} />
                  Published (visible to visitors)
                </label>
                <div className="admin-actions-row">
                  <button type="submit" className="btn btn-primary" disabled={saving}><FaFloppyDisk aria-hidden="true" /> {saving ? 'Saving…' : editingProjectId ? 'Save project' : 'Add project'}</button>
                  {editingProjectId && (
                    <button type="button" className="btn btn-ghost" onClick={() => { setEditingProjectId(''); setProjectForm(emptyProjectForm()); setProjectCoverFile(null); }}>Cancel edit</button>
                  )}
                </div>
              </form>

              <aside className="admin-side-list">
                <h2>Supabase projects ({allProjects.length})</h2>
                {allProjects.length === 0 ? (
                  <p className="empty-state">No projects in Supabase yet. Seed the published defaults from Backup / Data.</p>
                ) : allProjects.map((project) => (
                  <article className="admin-list-item project" key={project.id || project.slug}>
                    <img src={project.cover} alt="" loading="lazy" />
                    <span>
                      <strong>{project.title}</strong>
                      <small>{project.category} · {project.year} · {project.published ? 'Published' : 'Draft'}{project.featured ? ' · Featured' : ''}</small>
                    </span>
                    <span className="admin-item-actions">
                      {project.published && (
                        <Link to={`/projects/${project.slug}`} aria-label={`View ${project.title}`}><FaEye aria-hidden="true" /></Link>
                      )}
                      <button type="button" onClick={() => startEditProject(project)} aria-label={`Edit ${project.title}`}><FaPen aria-hidden="true" /></button>
                      <button
                        type="button"
                        onClick={() => handleToggleProjectPublished(project)}
                        disabled={saving}
                        aria-label={`${project.published ? 'Unpublish' : 'Publish'} ${project.title}`}
                        title={project.published ? 'Move to draft' : 'Publish project'}
                      >
                        {project.published ? <FaEyeSlash aria-hidden="true" /> : <FaEye aria-hidden="true" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProject(project)}
                        disabled={saving}
                        aria-label={`Delete ${project.title}`}
                        title="Delete project from Supabase"
                      >
                        <FaTrashCan aria-hidden="true" />
                      </button>
                    </span>
                  </article>
                ))}
                <p className="admin-hint">Drafts are visible only to your signed-in admin account through RLS. Published projects appear to all visitors.</p>
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
                <button type="submit" className="btn btn-primary" disabled={saving}><FaFloppyDisk aria-hidden="true" /> {saving ? 'Saving…' : 'Save experience'}</button>
                <button type="button" className="btn btn-ghost" onClick={handleResetExperience} disabled={saving}>
                  <FaRotateLeft aria-hidden="true" /> Reset to defaults
                </button>
                {experienceDirty && <span className="admin-dirty">Unsaved changes</span>}
              </div>
            </form>
          )}

          {activeTab === 'messages' && (
            <div className="admin-panel">
              <div className="admin-info-card">
                <div className="admin-form-head">
                  <div>
                    <h2><FaInbox aria-hidden="true" /> Contact messages</h2>
                    <p>Messages saved by the public Contact form in Supabase. EmailJS still sends an email copy when available.</p>
                  </div>
                  <span className={`admin-status-pill${unreadMessages ? ' is-custom' : ''}`}>{unreadMessages} new</span>
                </div>
                <div className="admin-actions-row">
                  <label className="admin-inline-filter">
                    Status
                    <select value={messageStatusFilter} onChange={(e) => setMessageStatusFilter(e.target.value)} aria-label="Filter contact messages by status">
                      <option value="all">All statuses</option>
                      {MESSAGE_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </label>
                  <button type="button" className="btn btn-ghost" onClick={fetchContactMessages} disabled={messagesLoading}>
                    <FaRotateLeft aria-hidden="true" /> {messagesLoading ? 'Refreshing…' : 'Refresh'}
                  </button>
                  <Link className="btn btn-ghost" to="/contact"><FaEye aria-hidden="true" /> Open Contact form</Link>
                </div>
                {messagesError && (
                  <p className="form-status error" role="alert"><FaTriangleExclamation aria-hidden="true" /> {messagesError}</p>
                )}
              </div>

              {messagesLoading && contactMessages.length === 0 ? (
                <p className="empty-state">Loading contact messages from Supabase…</p>
              ) : visibleContactMessages.length === 0 ? (
                <p className="empty-state">No contact messages match this filter yet.</p>
              ) : (
                <div className="admin-message-list">
                  {visibleContactMessages.map((message) => (
                    <article className="admin-message-card" key={message.id}>
                      <div className="admin-message-head">
                        <div>
                          <h3>{message.name}</h3>
                          <p>
                            <a href={`mailto:${message.email}`}>{message.email}</a>
                            <span aria-hidden="true"> · </span>
                            <time dateTime={message.created_at}>{new Date(message.created_at).toLocaleString()}</time>
                          </p>
                        </div>
                        <span className={`admin-status-pill${message.status === 'new' ? ' is-custom' : ''}`}>{message.status}</span>
                      </div>
                      {message.subject && <p className="admin-message-subject"><strong>Subject:</strong> {message.subject}</p>}
                      <p className="admin-message-body">{message.message}</p>
                      <div className="admin-actions-row">
                        <a
                          className="btn btn-primary btn-sm"
                          href={`mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject || 'Your message to Hamza'}`)}&body=${encodeURIComponent(`Hello ${message.name},\n\nThanks for your message.\n\n---\n${message.message}`)}`}
                        >
                          <FaEnvelopeOpen aria-hidden="true" /> Reply by email
                        </a>
                        <label className="admin-inline-filter">
                          Status
                          <select
                            value={message.status}
                            onChange={(e) => handleMessageStatus(message, e.target.value)}
                            disabled={saving}
                            aria-label={`Status for message from ${message.name}`}
                          >
                            {MESSAGE_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                          </select>
                        </label>
                        <button type="button" className="btn btn-danger-ghost btn-sm" onClick={() => handleDeleteMessage(message)} disabled={saving}>
                          <FaTrashCan aria-hidden="true" /> Delete
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'email' && (
            <div className="admin-grid">
              <form className="form admin-form" onSubmit={handleEmailConfigSave}>
                <div className="admin-form-head">
                  <div>
                    <h2><FaEnvelope aria-hidden="true" /> EmailJS configuration</h2>
                    <p>These public EmailJS values are stored in Supabase <code>site_settings</code> and used by every visitor’s Contact form.</p>
                  </div>
                  <span className={`admin-status-pill${isDatabaseConnected ? ' is-custom' : ''}`}>
                    {isDatabaseConnected ? 'Supabase live' : 'Fallback defaults'}
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
                  <button type="submit" className="btn btn-primary" disabled={saving}><FaFloppyDisk aria-hidden="true" /> {saving ? 'Saving…' : 'Save email settings'}</button>
                  <button type="button" className="btn btn-ghost" onClick={sendTestEmail} disabled={emailTestBusy}>
                    <FaPaperPlane aria-hidden="true" /> {emailTestBusy ? 'Sending…' : 'Send test email'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    disabled={saving}
                    onClick={() => {
                      if (!window.confirm('Reset the Supabase EmailJS settings to the published defaults for every visitor?')) return;
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
                  <span>{isDatabaseConnected ? 'Supabase' : contentSource}</span>
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
                    Saving updates Supabase for every visitor. These are front-end public values only; the destination
                    inbox is still controlled by your EmailJS template, and a private/secret key must never be entered here.
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
                <h2><FaDatabase aria-hidden="true" /> Supabase status</h2>
                <p>
                  Source: <strong>{isDatabaseConnected ? 'Supabase Postgres (live)' : 'Published/legacy fallback'}</strong>
                  {SUPABASE_PROJECT_REF ? <> · Project <code>{SUPABASE_PROJECT_REF}</code></> : null}
                  {contentLoading ? ' · Loading…' : ''}. Skills, projects, experience, EmailJS settings and contact messages are database-backed.
                </p>
                <div className="admin-actions-row">
                  <button type="button" className="btn btn-primary" onClick={() => content.refreshContent()} disabled={contentLoading}>
                    <FaRotateLeft aria-hidden="true" /> Refresh from Supabase
                  </button>
                  {SUPABASE_PROJECT_REF && (
                    <a
                      className="btn btn-ghost"
                      href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_REF}/editor`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open Table Editor
                    </a>
                  )}
                </div>
              </article>

              <article className="admin-info-card">
                <h2><FaDownload aria-hidden="true" /> Export backup</h2>
                <p>Download the current Supabase skills, projects, work experience and EmailJS settings as a version-2 JSON backup. Contact messages stay private in the Messages inbox and are not included.</p>
                <button type="button" className="btn btn-primary" onClick={exportData}><FaDownload aria-hidden="true" /> Download JSON</button>
              </article>

              <article className="admin-info-card">
                <h2><FaUpload aria-hidden="true" /> Import backup</h2>
                <p>Restore a version-2 Supabase backup or an older local-overlay backup. Importing replaces live Supabase content for every visitor, so export first.</p>
                <input ref={importInputRef} className="sr-only" type="file" accept="application/json,.json" onChange={(e) => importData(e.target.files?.[0])} aria-label="Import portfolio JSON backup" />
                <button type="button" className="btn btn-ghost" onClick={() => importInputRef.current?.click()} disabled={saving}><FaUpload aria-hidden="true" /> Choose JSON file</button>
              </article>

              <article className="admin-info-card">
                <h2><FaDatabase aria-hidden="true" /> Migrate old local data</h2>
                <p>
                  {hasLegacyLocalContent
                    ? 'This browser still has old local Admin changes. Copy the merged local version into Supabase once, check the public site, then clear the local copy.'
                    : 'No old local Admin content was found in this browser. New changes already save directly to Supabase.'}
                </p>
                <div className="admin-actions-row">
                  <button type="button" className="btn btn-primary" onClick={() => handleMigrateLocalContent(false)} disabled={!hasLegacyLocalContent || saving}>
                    <FaUpload aria-hidden="true" /> Import local data
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => handleMigrateLocalContent(true)} disabled={!hasLegacyLocalContent || saving}>
                    Import & clear local
                  </button>
                  <button type="button" className="btn btn-danger-ghost" onClick={handleClearLocalLegacy} disabled={!hasLegacyLocalContent || saving}>
                    Clear local only
                  </button>
                </div>
              </article>

              <article className="admin-info-card danger">
                <h2><FaRotateLeft aria-hidden="true" /> {isDatabaseConnected ? 'Reset database defaults' : 'Seed database defaults'}</h2>
                <p>
                  {isDatabaseConnected
                    ? 'Replace all live Supabase skills, projects, experience and EmailJS settings with the defaults currently published in code.'
                    : 'Populate empty Supabase tables with the currently published skills, projects, experience and EmailJS settings from code.'}
                </p>
                <button type="button" className="btn btn-danger-ghost" onClick={handleSeedDefaults} disabled={saving}>
                  <FaRotateLeft aria-hidden="true" /> {isDatabaseConnected ? 'Reset Supabase content' : 'Seed Supabase defaults'}
                </button>
              </article>

              <article className="admin-info-card">
                <h2><FaLock aria-hidden="true" /> Security model</h2>
                <p>
                  Supabase Auth identifies the owner; Postgres Row Level Security allows public reads and contact-message inserts,
                  but only {ADMIN_EMAIL} can write content or read the inbox. The browser uses the publishable key only—never add a secret/service-role key to this site.
                </p>
                <button type="button" className="btn btn-ghost" onClick={signOutAdmin} disabled={authBusy}>
                  <FaRightFromBracket aria-hidden="true" /> Sign out now
                </button>
              </article>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
