import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, ClipboardCheck, MoreVertical, X } from 'lucide-react';
import { communityWallpaperStyle } from '../../shared/communityWallpaperStyle.js';
import AdminDesignArtwork from './AdminDesignArtwork.jsx';
import DesignCardDevices from './DesignCardDevices.jsx';
import DesignGridSkeleton from './DesignGridSkeleton.jsx';
import { WallpaperSearchField } from '../components/WallpaperSearch.jsx';
import { useDebouncedSearch } from '../lib/useWallpaperSearch.js';

export default function CreatorReviewQueue({ request, onPublished, onSessionExpired }) {
  const [page, setPage] = useState(1);
  const [version, setVersion] = useState(0);
  const [result, setResult] = useState(null);
  const [selected, setSelected] = useState(null);
  const [confirming, setConfirming] = useState(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [menu, setMenu] = useState(null);
  const [query, setQuery] = useState('');
  const search = useDebouncedSearch(query.trim());

  useEffect(() => {
    if (query.trim() !== search) return;
    let active = true;
    request(`creator-submissions&page=${page}&query=${encodeURIComponent(search)}`).then(data => {
      if (active) { setResult(data); setLoading(false); }
    }).catch(error => {
      if (!active) return;
      if (error.status === 401) onSessionExpired(false);
      setError(error.message);
      setLoading(false);
    });
    return () => { active = false; };
  }, [request, onSessionExpired, page, version, query, search]);

  useEffect(() => {
    if (!menu) return;
    const dismiss = event => { if (!event.target.closest('.admin-design-actions')) setMenu(null); };
    const escape = event => {
      if (event.key !== 'Escape') return;
      document.getElementById(`review-actions-${menu}`)?.focus();
      setMenu(null);
    };
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', dismiss); document.removeEventListener('keydown', escape); };
  }, [menu]);

  function reload(nextPage = page) {
    setLoading(true);
    setSelected(null);
    setConfirming(null);
    setError('');
    setPage(nextPage);
    setVersion(value => value + 1);
  }

  function changeSearch(value) {
    const next = value.slice(0, 100);
    setQuery(next);
    if (next.trim() === query.trim()) return;
    setMenu(null);
    setResult(null);
    reload(1);
  }

  async function review(row, decision) {
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const result = await request('creator-review', {
        id: row.id, revision: row.revision, decision,
        ...(decision !== 'approve' && { note }),
      });
      if (result.status === 'published') {
        setNotice('Design published and added to the Template library.');
        void onPublished();
      } else setNotice(result.status === 'needs_changes' ? 'Changes requested.' : 'Submission declined.');
      reload(1);
    } catch (error) {
      if (error.status === 401) onSessionExpired(false);
      setError(error.message);
    } finally { setSaving(false); }
  }

  function openReview(row) {
    setSelected(row);
    setNote('');
    setError('');
    setNotice('');
    setMenu(null);
  }

  function openApprove(row) {
    setConfirming(row);
    setError('');
    setNotice('');
    setMenu(null);
  }

  return <section className="admin-review" aria-label="Pending creator requests" aria-busy={loading}>
    <div className="admin-review-toolbar">
      <WallpaperSearchField value={query} onChange={changeSearch} label="Search submissions by design or creator"
        placeholder="Search by design or creator" iconLeft showPopular={false} />
    </div>
    {notice && <p role="status">{notice}</p>}
    {error && !selected && !confirming && <p className="admin-error" role="alert">{error}</p>}
    {loading ? <DesignGridSkeleton label="Loading creator submissions" /> : result?.submissions.length === 0 && !error ?
      <div className="gallery-empty-state admin-review-empty" role="status">
        <h2>{search ? 'No matching submissions' : 'You’re all caught up'}</h2>
        <p>{search ? 'Try a different design or creator name.' : 'New submissions will appear here when they’re ready for review.'}</p>
        {search && <button type="button" className="button-secondary" onClick={() => changeSearch('')}>Clear search</button>}
      </div> : result &&
      <div className="admin-design-grid admin-grid-mobile">
        {result.submissions.map(row => {
          const status = row.status === 'publishing' ? 'Publishing' : 'In review';
          return <article key={row.id} className="admin-design">
            <AdminDesignArtwork template={{ ...communityWallpaperStyle, id: row.id, name: row.title, image: row.preview }}
              device="mobile" previewLayout="stacked" status={status}
              statusClass={row.status === 'in_review' ? 'admin-status-draft' : ''}
              actionLabel={`Review ${row.title}, ${status}`} id={`review-${row.id}`} onOpen={() => openReview(row)} />
            <div className="admin-design-footer">
              <div className="admin-design-info">
                <h2 title={row.title}>{row.title}</h2>
                <div className="admin-design-meta"><DesignCardDevices devices={['mobile']} /><span className="text-muted">{row.artist}</span></div>
              </div>
              <div className="admin-design-actions">
                <button id={`review-actions-${row.id}`} type="button" className="admin-icon-action" aria-label={`Actions for ${row.title}`} title="Actions" aria-expanded={menu === row.id} aria-controls={`review-menu-${row.id}`} onClick={() => setMenu(menu === row.id ? null : row.id)}><MoreVertical size={20} aria-hidden="true" /></button>
                {menu === row.id && <div id={`review-menu-${row.id}`} className="admin-action-menu" onClick={() => setMenu(null)}>
                  <button type="button" className="admin-icon-action" onClick={() => openReview(row)}><ClipboardCheck size={16} aria-hidden="true" />Review artwork</button>
                  {row.status !== 'publishing' && <button type="button" className="admin-icon-action" onClick={() => openApprove(row)}><CheckCircle2 size={16} aria-hidden="true" />Approve and publish</button>}
                </div>}
              </div>
            </div>
          </article>;
        })}
      </div>}
    {!selected && !confirming && !loading && (page > 1 || result?.hasMore) && <nav className="admin-review-pagination" aria-label="Review pages">
      <button type="button" className="button-secondary" disabled={page === 1 || saving} onClick={() => reload(page - 1)}>Previous</button>
      <span>Page {page}</span>
      <button type="button" className="button-secondary" disabled={!result?.hasMore || saving} onClick={() => reload(page + 1)}>Next</button>
    </nav>}
    {selected && <ReviewDialog row={selected} busy={saving} error={error} note={note} setNote={setNote}
      onClose={() => { setSelected(null); setError(''); }} onSubmit={decision => review(selected, decision)} />}
    {confirming && <ApproveDialog row={confirming} busy={saving} error={error}
      onClose={() => { setConfirming(null); setError(''); }} onConfirm={() => review(confirming, 'approve')} />}
  </section>;
}

function ReviewDialog({ row, busy, error, note, setNote, onClose, onSubmit }) {
  const dialog = useRef(null);
  useEffect(() => {
    const node = dialog.current;
    const trigger = document.activeElement;
    node.showModal();
    return () => { node.close(); if (trigger?.isConnected) trigger.focus(); };
  }, []);
  const publishing = row.status === 'publishing';
  return <dialog ref={dialog} className="admin-delete-dialog admin-review-dialog" aria-labelledby="review-title" onCancel={event => { event.preventDefault(); if (!busy) onClose(); }}>
    <header><h2 id="review-title">{row.title}</h2><button type="button" aria-label="Close review" disabled={busy} onClick={onClose}><X size={20} aria-hidden="true" /></button></header>
    <div className="admin-review-detail">
      <img src={row.preview} referrerPolicy="no-referrer" alt={`Artwork for ${row.title}`} width="1080" height="2400" />
      <form onSubmit={event => { event.preventDefault(); if (!busy) onSubmit('approve'); }}>
        <p>By {row.artist}</p>
        <p>AI disclosure: {row.aiGenerated == null ? 'Not provided' : row.aiGenerated ? 'AI-generated' : 'No AI-generated content declared'}</p>
        {publishing ? <p>Retry to finish publishing.</p> : <label>Note to creator<textarea className="field-input" value={note} onChange={event => setNote(event.target.value)} maxLength={500} disabled={busy} rows={4} aria-describedby="review-note-help" /><small id="review-note-help">Required to request changes or decline.</small></label>}
        {error && <p className="admin-error" role="alert">{error}</p>}
        <footer className="admin-review-actions">
          <button type="button" className="button-secondary" disabled={busy} onClick={onClose}>Cancel</button>
          {!publishing && <>
            <button type="button" className="button-secondary admin-delete" disabled={busy || !note.trim()} onClick={() => onSubmit('declined')}>Decline</button>
            <button type="button" className="button-secondary" disabled={busy || !note.trim()} onClick={() => onSubmit('needs_changes')}>Request changes</button>
          </>}
          <button type="submit" className="button-primary" disabled={busy}>{busy ? 'Saving…' : publishing ? 'Retry publishing' : 'Approve and publish'}</button>
        </footer>
      </form>
    </div>
  </dialog>;
}

function ApproveDialog({ row, busy, error, onClose, onConfirm }) {
  const dialog = useRef(null);
  useEffect(() => {
    const node = dialog.current;
    const trigger = document.activeElement;
    node.showModal();
    return () => { node.close(); if (trigger?.isConnected) trigger.focus(); };
  }, []);
  return <dialog ref={dialog} className="admin-delete-dialog" aria-labelledby="approve-title" onCancel={event => { event.preventDefault(); if (!busy) onClose(); }}>
    <header><h2 id="approve-title">Approve and publish?</h2><button type="button" aria-label="Close approval" disabled={busy} onClick={onClose}><X size={20} aria-hidden="true" /></button></header>
    <p>“{row.title}” by {row.artist} will be added to the Template library.</p>
    {error && <p className="admin-error" role="alert">{error}</p>}
    <footer><button type="button" className="button-secondary" disabled={busy} onClick={onClose} autoFocus>Cancel</button><button type="button" className="button-primary" disabled={busy} onClick={onConfirm}>{busy ? 'Publishing…' : 'Approve and publish'}</button></footer>
  </dialog>;
}
