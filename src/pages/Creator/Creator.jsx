import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { googleAvatarUrl, supabase } from '../../lib/creatorAuth.js';
import { ArrowUpRight, CheckCircle2, ChevronDown, ImagePlus, Images, LoaderCircle, LogOut, MoreVertical, Pencil, Plus, Search, Trash2, UserRound, X } from 'lucide-react';
import BrandMark from '../../components/BrandMark.jsx';
import DesignCardDevices from '../DesignCardDevices.jsx';
import DesignGridSkeleton from '../DesignGridSkeleton.jsx';
import AccountLoading from '../../components/AccountLoading.jsx';
import CreatorAvatar from './CreatorAvatar.jsx';
import { creatorAvatarKeys } from '../../../shared/creatorAvatars.js';
import { communityWallpaperStyle } from '../../../shared/communityWallpaperStyle.js';
import { sampleSchedule } from '../../assets/sampleSchedule.js';
import { CREATOR_PATH, SUBMIT_DESIGN_PATH } from '../../../shared/seo.js';
import { mobileResolution, galleryScheduleFor } from '../../assets/wallpaperPresets.js';
import { createCustomBackground } from '../../lib/customBackground.js';
import { inspectImage, prepareAvatar, prepareImage } from '../../utils/imageHelpers.js';
import ImageCropDialog from '../ScheduleWallpaper/ImageCropDialog.jsx';
import { WallpaperCanvas } from '../ScheduleWallpaper/CanvasPreview.jsx';
import '../ScheduleWallpaper/classEditDialog.css';
import googleSignIn from './google-sign-in.png';
import '../designCards.css';
import './creator.css';

const ratio = mobileResolution.width / mobileResolution.height;
const schedule = galleryScheduleFor('mobile');
const artworkCardSize = { id: 'mobile', width: 270, height: 600 };
const gallery = `${CREATOR_PATH}?device=mobile`;
const statuses = { in_review: 'In review', needs_changes: 'Needs changes', publishing: 'Publishing', published: 'Published', declined: 'Declined' };
let initialSession;

async function openSession() {
  const callback = new URL(window.location.href);
  const code = callback.searchParams.get('code');
  const failed = callback.searchParams.has('error');
  for (const name of ['code', 'error', 'error_code', 'error_description']) callback.searchParams.delete(name);
  if (code || failed) window.history.replaceState(window.history.state, '', callback);
  if (failed) throw new Error('Google sign-in didn’t finish. Please try again.');
  const { data, error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : await supabase.auth.getSession();
  if (error) throw new Error('Google sign-in didn’t finish. Please try again.');
  return data.session;
}

async function submissionsRequest(change, signal) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Your session expired. Sign in again.');
  const response = await fetch('/api/creator-submissions', {
    method: change ? 'POST' : 'GET',
    headers: { Authorization: `Bearer ${session.access_token}`, ...(change && { 'Content-Type': 'application/json' }) },
    body: change && JSON.stringify(change),
    signal,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error?.message || 'Could not reach your submissions. Please try again.');
  return data;
}

function CreatorBrand() {
  return <Link to="/" className="site-brand"><BrandMark /> SchedSnap</Link>;
}

function placeCardMenu(details) {
  const menu = details.querySelector('.creator-card-menu');
  if (!menu) return;
  const trigger = details.getBoundingClientRect();
  const openUp = trigger.bottom + menu.offsetHeight + 8 > window.innerHeight && trigger.top >= menu.offsetHeight + 8;
  details.dataset.menuPlacement = openUp ? 'top' : 'bottom';
}

function CreatorEntry({ children, action }) {
  return <div className="creator-entry">
    <section className="creator-entry-body">
      <div className="creator-entry-mascot" aria-hidden="true">
        <img src="/images/maker/maker-capybara-static-320.webp" alt="" width="320" height="320" />
      </div>
      {children}
      {action}
    </section>
  </div>;
}

function CreatorWorkspace({ profile, onProfileChange, googlePhoto, onSignOut, signingOut, authError }) {
  const [params, setParams] = useSearchParams();
  const profileOpen = params.get('view') === 'profile';
  const [editing, setEditing] = useState(undefined);
  const [rows, setRows] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const request = useRef(null);
  const heading = useRef(null);

  const loadRows = useCallback(async () => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setLoading(true);
    setError('');
    try {
      const data = await submissionsRequest(undefined, controller.signal);
      if (!controller.signal.aborted) setRows(data.submissions);
    } catch (error) {
      if (!controller.signal.aborted) setError(error.message);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => { if (active) void loadRows(); });
    return () => { active = false; request.current?.abort(); };
  }, [loadRows]);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(''), 5000);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  function showProfile(show) {
    const updated = new URLSearchParams(params);
    if (show) updated.set('view', 'profile');
    else updated.delete('view');
    setParams(updated, { replace: true });
  }

  async function remove(row) {
    setSaving(true);
    setError('');
    setNotice('');
    try {
      await submissionsRequest({ action: 'delete', id: row.id, revision: row.revision });
      setRows(current => current.filter(item => item.id !== row.id));
      setConfirmDelete(null);
      setNotice('Artwork deleted.');
      heading.current?.focus();
    } catch (error) { setError(error.message); }
    finally { setSaving(false); }
  }

  const search = query.trim().toLowerCase();
  const visible = rows?.filter(row => (filter === 'all' || row.status === filter || (filter === 'in_review' && row.status === 'publishing'))
    && row.title.toLowerCase().includes(search));
  const filters = [['all', 'All'], ['in_review', statuses.in_review], ['needs_changes', statuses.needs_changes], ['published', statuses.published], ['declined', statuses.declined]];
  const accountMenu = (inSidebar = false) => <details className="creator-account" onBlur={event => {
      if (!event.currentTarget.contains(event.relatedTarget)) event.currentTarget.open = false;
    }} onKeyDown={event => {
      if (event.key !== 'Escape' || !event.currentTarget.open) return;
      event.currentTarget.open = false;
      event.currentTarget.querySelector('summary')?.focus();
    }}>
      <summary aria-label={`Creator account for ${profile.creatorName}`}>
        <CreatorAvatar avatar={profile.avatar} googlePhoto={googlePhoto} />
        {inSidebar && <span className="creator-account-name">{profile.creatorName}</span>}
        <ChevronDown size={15} aria-hidden="true" />
      </summary>
      <div className="creator-account-menu">
        <button type="button" aria-haspopup="dialog" disabled={saving} onClick={event => {
          const menu = event.currentTarget.closest('details');
          menu.open = false;
          menu.querySelector('summary')?.focus();
          showProfile(true);
        }}><UserRound size={16} aria-hidden="true" />My profile</button>
        <button type="button" disabled={signingOut || saving} onClick={onSignOut}><LogOut size={16} aria-hidden="true" />{signingOut ? 'Signing out…' : 'Sign out'}</button>
      </div>
    </details>;
  return <div className="creator-portal">
    <aside className="creator-sidebar" aria-label="Creator portal sidebar">
      <CreatorBrand />
      <nav aria-label="Creator portal" className="creator-nav">
        <button type="button" aria-current="page"><Images size={18} aria-hidden="true" />My designs</button>
        <Link to={gallery}><ArrowUpRight size={18} aria-hidden="true" />Gallery</Link>
      </nav>
      {accountMenu(true)}
    </aside>
    <div className="creator-workspace">
      <header className="creator-topbar">
        <h1 ref={heading} tabIndex={-1}>My designs</h1>
        {accountMenu()}
      </header>
      <div className="creator-content">
        {authError && <p className="creator-error" role="alert">{authError}</p>}
        <section className="creator-submissions" aria-label="Artwork list" aria-busy={loading}>
            <div className="creator-toolbar">
              <label className="creator-search">
                <Search size={17} aria-hidden="true" />
                <span className="sr-only">Search designs</span>
                <input type="search" value={query} placeholder="Search designs" onChange={event => setQuery(event.target.value)} />
              </label>
              <button className="button-primary" type="button" aria-haspopup="dialog" disabled={saving} onClick={() => setEditing(null)}><ImagePlus size={18} aria-hidden="true" />Upload design</button>
            </div>
            <div className="creator-filters" role="group" aria-label="Filter by status">
              {filters.map(([value, label]) => <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>)}
            </div>
            {error && <div className="creator-error" role="alert">{error} <button className="creator-link" type="button" onClick={loadRows}>Refresh artwork</button></div>}
            {loading && !rows && <DesignGridSkeleton label="Loading artwork" />}
            {!loading && !error && visible?.length === 0 && <div className="gallery-empty-state" role="status">
              <p>{rows?.length ? 'No artwork matches your filters.' : 'No artwork yet.'}</p>
              {!!rows?.length && <button className="button-secondary" type="button" onClick={() => { setFilter('all'); setQuery(''); }}>Clear filters</button>}
            </div>}
            {!!visible?.length && <div className="admin-design-grid creator-design-grid">{visible.map(row => <article key={row.id} className="admin-design">
              <div className="admin-design-artwork">
                <WallpaperCanvas lazy showLoadingSkeleton={false} schedule={sampleSchedule} template={{ ...communityWallpaperStyle, id: row.id, device: 'mobile', image: row.preview }}
                  resolution={artworkCardSize} className="block w-full h-auto" label={`${row.title} preview`} />
                <span className={`admin-status ${row.status === 'published' ? 'admin-status-published' : ['in_review', 'needs_changes'].includes(row.status) ? 'admin-status-draft' : ''}`}>{statuses[row.status]}</span>
              </div>
              <div className="admin-design-footer">
                <div className="admin-design-info">
                  <h2 title={row.title}>{row.title}</h2>
                  <div className="admin-design-meta"><DesignCardDevices devices={['mobile']} /><span className="text-muted">Community</span></div>
                </div>
                  {row.status !== 'publishing' && <details className="creator-card-actions admin-design-actions" onToggle={event => { if (event.currentTarget.open) placeCardMenu(event.currentTarget); }} onBlur={event => {
                    if (!event.currentTarget.contains(event.relatedTarget)) event.currentTarget.open = false;
                  }} onKeyDown={event => {
                    if (event.key !== 'Escape') return;
                    event.currentTarget.open = false;
                    event.currentTarget.querySelector('summary')?.focus();
                  }}>
                    <summary aria-label={`Actions for ${row.title}`}><MoreVertical size={20} aria-hidden="true" /></summary>
                    <div className="creator-card-menu" onClick={event => { event.currentTarget.parentElement.open = false; }}>
                      {row.status === 'published' ? <Link to={`${CREATOR_PATH}/community-${row.id}?device=mobile`}><ArrowUpRight size={16} aria-hidden="true" />View design</Link> : <>
                        <button type="button" disabled={saving || loading} onClick={() => { setConfirmDelete(null); setEditing(row); }}><Pencil size={16} aria-hidden="true" />Edit</button>
                        <button type="button" className="creator-danger" disabled={saving || loading} onClick={() => setConfirmDelete(row.id)}><Trash2 size={16} aria-hidden="true" />Delete</button>
                      </>}
                    </div>
                  </details>}
              </div>
                {row.reviewNote && <p className="creator-review-note">{row.reviewNote}</p>}
                {confirmDelete === row.id && <div className="creator-row-actions">
                  <p>Delete this artwork?</p>
                  <button className="creator-link" type="button" disabled={saving} onClick={() => setConfirmDelete(null)}>Cancel</button>
                  <button className="creator-link creator-danger" type="button" disabled={saving} onClick={() => remove(row)}>{saving ? 'Deleting…' : 'Confirm delete'}</button>
                </div>}
            </article>)}</div>}
        </section>
      </div>
    </div>
    {notice && <div className="creator-toast" role="status" aria-live="polite"><CheckCircle2 size={18} aria-hidden="true" /><span>{notice}</span><button type="button" className="creator-toast-close" aria-label="Dismiss notification" onClick={() => setNotice('')}><X size={16} aria-hidden="true" /></button></div>}
    {profileOpen && <CreatorProfileDialog profile={profile} googlePhoto={googlePhoto} onClose={() => showProfile(false)} onSaved={next => {
      onProfileChange(next);
      showProfile(false);
    }} />}
    {editing !== undefined && <SubmissionDialog editing={editing} busy={saving} setBusy={setSaving} onClose={() => setEditing(undefined)} onSaved={() => {
      setEditing(undefined);
      setNotice(editing ? 'Changes submitted for review.' : 'Submitted for review.');
      setFilter('all');
      setQuery('');
      void loadRows();
    }} />}
  </div>;
}

function CreatorDialog({ heading, busy, onClose, children, className = '' }) {
  const dialog = useRef(null);
  const title = useRef(null);

  useEffect(() => {
    const node = dialog.current;
    const trigger = document.activeElement;
    node.showModal();
    title.current?.focus();
    return () => {
      node.close();
      if (trigger instanceof HTMLElement && trigger.isConnected) trigger.focus();
    };
  }, []);

  return <dialog ref={dialog} className={`creator-dialog ${className}`} aria-labelledby="creator-dialog-title" onCancel={event => {
    if (event.target !== event.currentTarget) return;
    event.preventDefault();
    if (!busy) onClose();
  }}>
    <header>
      <h2 id="creator-dialog-title" ref={title} tabIndex={-1}>{heading}</h2>
      <button type="button" className="creator-dialog-close" aria-label="Close dialog" disabled={busy} onClick={onClose}><X size={20} aria-hidden="true" /></button>
    </header>
    {children}
  </dialog>;
}

function SubmissionDialog({ editing, busy, setBusy, onClose, onSaved }) {
  return <CreatorDialog heading={editing ? 'Edit design' : 'Upload design'} busy={busy} onClose={onClose} className="creator-upload-dialog">
    <SubmissionForm editing={editing} busy={busy} setBusy={setBusy} onCancel={onClose} onSaved={onSaved} />
  </CreatorDialog>;
}

function CreatorProfileDialog({ profile, googlePhoto, onClose, onSaved }) {
  const [name, setName] = useState(profile.creatorName);
  const [avatar, setAvatar] = useState(profile.avatar ?? null);
  const [busy, setBusy] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [error, setError] = useState('');

  async function pickAvatar(event) {
    const [file] = event.target.files;
    event.target.value = '';
    if (!file) return;
    setAvatarBusy(true);
    setError('');
    try {
      setAvatar(await prepareAvatar(file));
    } catch (error) {
      setError(error.message);
    } finally {
      setAvatarBusy(false);
    }
  }

  async function save(event) {
    event.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setError('');
    try {
      onSaved(await submissionsRequest({ action: 'profile', creatorName: name.trim(), avatar }));
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }

  const custom = typeof avatar === 'string' && avatar.startsWith('data:image/');
  const disabled = busy || avatarBusy;
  return <CreatorDialog heading="Creator profile" busy={disabled} onClose={onClose}>
    <form className="creator-profile-form" onSubmit={save}>
      <label className="creator-field">Name<input className="field-input" value={name} maxLength={60} required disabled={disabled} onChange={event => setName(event.target.value)} /></label>
      <fieldset disabled={disabled}>
        <legend>Profile photo</legend>
        <div className="creator-avatar-options">
          {[null, ...creatorAvatarKeys].map(option => <label key={option ?? 'google'} title={option ?? (googlePhoto ? 'Google photo' : 'Default avatar')}>
            <input className="sr-only" type="radio" name="creator-avatar" checked={avatar === option} onChange={() => setAvatar(option)} />
            <CreatorAvatar avatar={option} googlePhoto={googlePhoto} />
            <span className="sr-only">{option ?? (googlePhoto ? 'Google photo' : 'Default avatar')}</span>
          </label>)}
          <label className={`creator-avatar-upload ${custom ? 'is-selected' : ''}`} title="Upload photo">
            <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" disabled={disabled} onChange={pickAvatar} />
            {avatarBusy ? <LoaderCircle size={20} className="motion-safe:animate-spin" aria-hidden="true" /> : custom ? <CreatorAvatar avatar={avatar} /> : <Plus size={20} aria-hidden="true" />}
            <span className="sr-only">Upload profile photo</span>
          </label>
        </div>
      </fieldset>
      {error && <p className="creator-error" role="alert">{error}</p>}
      <div className="creator-dialog-actions">
        <button type="button" className="button-secondary" disabled={disabled} onClick={onClose}>Cancel</button>
        <button type="submit" className="button-primary" disabled={disabled || !name.trim()}>{busy ? 'Saving…' : 'Save profile'}</button>
      </div>
    </form>
  </CreatorDialog>;
}

function SubmissionForm({ editing, busy, setBusy, onCancel, onSaved }) {
  const [source, setSource] = useState(null);
  const [cropping, setCropping] = useState(false);
  const [prepared, setPrepared] = useState(null);
  const [error, setError] = useState('');
  const [cropError, setCropError] = useState('');
  const [title, setTitle] = useState(editing?.title ?? '');
  const [rights, setRights] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(editing?.aiGenerated === true);
  const submissionId = useRef(editing?.id ?? crypto.randomUUID());
  const fileInput = useRef(null);
  useEffect(() => () => { if (source) URL.revokeObjectURL(source.url); }, [source]);

  async function pick(event) {
    const [file] = event.target.files;
    event.target.value = '';
    if (file) await openCrop(file);
  }

  async function openCrop(file) {
    setError('');
    setBusy(true);
    try {
      const bitmap = await inspectImage(file);
      const { width, height } = bitmap;
      bitmap.close();
      setSource({ file, url: URL.createObjectURL(file), width, height });
      setCropError('');
      setCropping(true);
    } catch (error) { setError(error.message); }
    finally { setBusy(false); }
  }

  async function crop(region) {
    setBusy(true);
    setCropError('');
    try {
      setPrepared({ ...await prepareImage(source.file, region), file: source.file });
      setCropping(false);
      setSource(null);
      fileInput.current?.focus();
    } catch (error) { setCropError(error.message); }
    finally { setBusy(false); }
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    if (!editing && !prepared) {
      setError('Choose and crop an artwork image first.');
      fileInput.current?.focus();
      return;
    }
    setBusy(true);
    try {
      const change = editing ? { action: 'update', revision: editing.revision } : { action: 'create' };
      await submissionsRequest({
        ...change, id: submissionId.current, title, rights, aiGenerated,
        ...(prepared && { image: prepared.image }),
      });
      onSaved();
    } catch (error) { setError(error.message); }
    finally { setBusy(false); }
  }

  const hasArtwork = Boolean(prepared || editing);
  return <>
    <form className="creator-form" onSubmit={submit} aria-busy={busy}>
      <div className="creator-form-fields">
        <div className="creator-file" onDragOver={event => event.preventDefault()} onDrop={event => {
          event.preventDefault();
          const [file] = event.dataTransfer.files;
          if (!busy && file) void openCrop(file);
        }}>
          <input className="sr-only" id="creator-artwork" ref={fileInput} type="file" aria-describedby="creator-file-help" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={pick} />
          <label className="creator-file-target" htmlFor="creator-artwork">
            <ImagePlus size={21} aria-hidden="true" />
            <strong>{hasArtwork ? 'Replace image' : <>Choose<span className="creator-drop-hint"> or drop</span> an image</>}</strong>
            <span id="creator-file-help">JPG, PNG or WebP · up to 10 MB</span>
          </label>
          {prepared && <button type="button" className="creator-link" disabled={busy} onClick={() => openCrop(prepared.file)}>Crop again</button>}
        </div>
        <label className="creator-field">Design name<input required maxLength={80} className="field-input" placeholder="e.g. Moonlit Garden" value={title} disabled={busy} onChange={event => setTitle(event.target.value)} /></label>
        <label className="creator-ai-setting">
          <span><strong id="creator-ai-label">Label as AI-generated</strong><small id="creator-ai-help">Turn this on if any part of the image was generated with AI.</small></span>
          <input className="sr-only" type="checkbox" role="switch" aria-labelledby="creator-ai-label" aria-describedby="creator-ai-help" checked={aiGenerated} disabled={busy} onChange={event => setAiGenerated(event.target.checked)} />
          <span className="creator-ai-switch" aria-hidden="true" />
        </label>
        <div className="creator-rights">
          <input id="creator-rights" type="checkbox" aria-labelledby="creator-rights-text" required checked={rights} disabled={busy} onChange={event => setRights(event.target.checked)} />
          <span id="creator-rights-text"><label htmlFor="creator-rights">I own this design or have permission to share it, and I agree to the </label><Link className="text-link" to="/terms#community-submissions" target="_blank" rel="noopener noreferrer">Community submission terms</Link>.</span>
        </div>
        {error && <p className="creator-error" role="alert">{error}</p>}
      </div>
      <figure className="creator-preview">
        {prepared ? <WallpaperCanvas schedule={schedule} template={createCustomBackground(prepared.preview)} resolution={mobileResolution} label="Artwork with a sample class schedule" /> :
          editing ? <img src={editing.preview} referrerPolicy="no-referrer" alt="Current submitted artwork" width="1080" height="2400" /> :
            <div className="creator-preview-placeholder" aria-hidden="true"><Images size={24} /></div>}
        <figcaption>{prepared ? 'Wallpaper preview' : editing ? 'Current artwork' : 'Mobile preview'}</figcaption>
      </figure>
      <footer className="creator-dialog-actions creator-upload-actions">
        <button type="button" className="button-secondary" disabled={busy} onClick={onCancel}>Cancel</button>
        <button type="submit" className="button-primary" disabled={busy}>{busy ? 'Working…' : editing ? 'Resubmit for review' : 'Submit for review'}</button>
      </footer>
    </form>
    {cropping && source && <ImageCropDialog source={source} background aspectRatio={ratio} busy={busy} error={cropError} onClose={() => {
      setCropping(false);
      setSource(null);
      fileInput.current?.focus();
    }} onConfirm={crop} />}
  </>;
}

function CreatorAccount({ onSignOut, signingOut, authError, googlePhoto }) {
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');

  async function loadProfile(creatorName, signal) {
    try {
      const next = await submissionsRequest({ action: 'profile', ...(creatorName && { creatorName }) }, signal);
      if (!signal?.aborted) setProfile(next);
    } catch (error) {
      if (!signal?.aborted) setError(error.message);
    } finally {
      if (!signal?.aborted) setBusy(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    submissionsRequest({ action: 'profile' }, controller.signal).then(next => {
      if (!controller.signal.aborted) setProfile(next);
    }).catch(error => {
      if (!controller.signal.aborted) setError(error.message);
    }).finally(() => {
      if (!controller.signal.aborted) setBusy(false);
    });
    return () => controller.abort();
  }, []);

  if (profile?.creatorName) return <CreatorWorkspace profile={profile} onProfileChange={setProfile} googlePhoto={googlePhoto} onSignOut={onSignOut} signingOut={signingOut} authError={authError} />;
  const signOut = <button className="creator-link" type="button" disabled={signingOut} onClick={onSignOut}>{signingOut ? 'Signing out…' : 'Sign out'}</button>;
  if (!profile && busy) return <AccountLoading />;
  if (!profile) return <CreatorEntry action={signOut}>
      <p className="creator-error" role="alert">{authError || error}</p>
      <button className="creator-link" type="button" onClick={() => { setBusy(true); setError(''); void loadProfile(); }}>Try again</button>
  </CreatorEntry>;

  return <CreatorEntry action={signOut}>
    <h1>Choose your creator name</h1>
    <p>This is the name students will see with your published artwork.</p>
    {(authError || error) && <p className="creator-error" role="alert">{authError || error}</p>}
    <form className="creator-name-form" aria-busy={busy} onSubmit={event => {
      event.preventDefault();
      if (name.trim()) {
        setBusy(true);
        setError('');
        void loadProfile(name.trim());
      }
    }}>
      <label className="creator-field">Creator name<input className="field-input" value={name} onChange={event => setName(event.target.value)} maxLength={60} required disabled={busy} /></label>
      <button className="button-primary" type="submit" disabled={busy || !name.trim()}>{busy ? 'Saving…' : 'Continue'}</button>
    </form>
  </CreatorEntry>;
}

export default function Creator() {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(Boolean(supabase));
  const [authBusy, setAuthBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    initialSession ??= openSession().finally(() => { initialSession = undefined; });
    initialSession.then(async () => {
      if (!active) return;
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      setSession(data.session);
    }).catch(error => { if (active) setError(error.message); })
      .finally(() => { if (active) setChecking(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  async function signIn() {
    setError('');
    setAuthBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}${SUBMIT_DESIGN_PATH}` },
      });
      if (!error) return;
      throw error;
    } catch {
      setError('Could not start Google sign-in. Please try again.');
      setAuthBusy(false);
    }
  }

  async function signOut() {
    setAuthBusy(true);
    setError('');
    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      if (error) throw error;
    } catch { setError('Could not sign out. Please try again.'); }
    finally { setAuthBusy(false); }
  }

  if (checking) return <AccountLoading />;
  if (session) return <CreatorAccount key={session.user.id} googlePhoto={googleAvatarUrl(session.user)} onSignOut={signOut} signingOut={authBusy} authError={error} />;
  return <CreatorEntry>
    <h1>Sign in to submit artwork</h1>
    <p>Upload your artwork and track its review.</p>
    <form className="creator-auth-form" onSubmit={event => { event.preventDefault(); if (supabase && !authBusy) void signIn(); }}>
    <button className="creator-sign-in" type="submit" disabled={!supabase || authBusy} aria-busy={authBusy}>
      {authBusy ? <span className="creator-sign-in-progress"><LoaderCircle size={18} className="motion-safe:animate-spin" aria-hidden="true" />Opening Google…</span> :
        <img src={googleSignIn} alt="Sign in with Google" width="195" height="44" />}
    </button>
    <span className="sr-only" role="status">{authBusy ? 'Opening Google sign-in.' : ''}</span>
    {!supabase && <p className="creator-error" role="status">Creator sign-in is temporarily unavailable.</p>}
    {error && <p className="creator-error" role="alert">{error}</p>}
    </form>
  </CreatorEntry>;
}
