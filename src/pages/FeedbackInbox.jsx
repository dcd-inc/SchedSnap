import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Archive, ArrowLeft, CheckCircle2, ChevronDown, Inbox, Mail, MailOpen, RotateCcw, Search, Star, Trash2, X } from 'lucide-react';
import { createFeedbackMutations } from '../lib/feedbackMutations.js';
import { feedbackTime } from '../utils/feedbackTime.js';

const categories = ['Feature request', 'Design suggestion', 'Report a problem', 'Other feedback'];
const folders = { open: 'Inbox', starred: 'Starred', resolved: 'Resolved', archived: 'Archive' };
const folderIcons = { open: Inbox, starred: Star, resolved: CheckCircle2, archived: Archive };
const inFolder = (item, folder) => !item.deleted && (folder === 'starred' ? item.starred : item.status === folder);
const date = value => new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

export default function FeedbackInbox({ request }) {
  const [items, setItems] = useState(null);
  const [counts, setCounts] = useState({});
  const [error, setError] = useState('');
  const [folder, setFolder] = useState('open');
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [checked, setChecked] = useState(new Set());
  const [overrides, setOverrides] = useState({});
  const [deleteTargets, setDeleteTargets] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [revision, setRevision] = useState(0);
  const [now, setNow] = useState(Date.now);
  const [sentinel, setSentinel] = useState(null);
  const loader = useRef(null);
  const selectAll = useRef(null);
  const mutations = useMemo(() => createFeedbackMutations({ request,
    publish(previous, next) {
      setOverrides(old => ({ ...old, [next.id]: { ...old[next.id], ...Object.fromEntries(['status', 'starred', 'read', 'deleted'].filter(key => next[key] !== previous[key]).map(key => [key, next[key]])) } }));
      setCounts(old => {
        const result = { ...old };
        for (const value of Object.keys(folders)) result[value] = Math.max(0, (result[value] || 0) + Number(inFolder(next, value)) - Number(inFolder(previous, value)));
        return result;
      });
    },
    onError: setError,
  }), [request]);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(query.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [query]);
  useEffect(() => {
    let cancelled = false, inFlight = false, cursor = null, started = false;
    async function load() {
      if (cancelled || inFlight) return;
      inFlight = true; setLoading(true); setError('');
      const params = new URLSearchParams({ limit: '20', folder, category, q: search });
      if (cursor) params.set('cursor', cursor);
      try {
        let data;
        // Do not let an older page response overwrite clicks still being saved.
        do {
          await mutations.idle();
          const version = mutations.version();
          data = await request(`feedback&${params}`);
          if (cancelled) return;
          if (version === mutations.version()) break;
        } while (!cancelled);
        if (cancelled) return;
        const append = started;
        setItems(previous => append ? [...previous, ...data.feedback.filter(item => !previous.some(old => old.id === item.id))] : data.feedback);
        setCounts(data.counts); cursor = data.nextCursor; started = true;
        setHasMore(Boolean(cursor));
      } catch (failure) { if (!cancelled) setError(failure.message); }
      finally { inFlight = false; if (!cancelled) setLoading(false); }
    }
    loader.current = load;
    queueMicrotask(() => {
      if (cancelled) return;
      setItems(null); setChecked(new Set()); setSelected(null); setHasMore(false);
      void load();
    });
    return () => { cancelled = true; };
  }, [request, mutations, folder, category, search, revision]);
  useEffect(() => {
    if (!sentinel || !hasMore || loading || error || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) void loader.current?.();
    }, { rootMargin: '300px' });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sentinel, hasMore, loading, error]);
  const visibleItems = (items || []).map(item => ({ ...item, ...overrides[item.id] })).filter(item => inFolder(item, folder));
  const selectable = visibleItems.slice(0, 100);
  const allChecked = selectable.length > 0 && selectable.every(item => checked.has(item.id));
  useEffect(() => { if (selectAll.current) selectAll.current.indeterminate = checked.size > 0 && !allChecked; }, [checked, allChecked]);
  const current = visibleItems.find(item => item.id === selected);
  function toggleChecked(id) {
    setChecked(previous => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else if (next.size < 100) next.add(id);
      return next;
    });
  }
  function change(ids, changes) {
    setError('');
    const targets = visibleItems.filter(item => ids.includes(item.id));
    if (!targets.length) return;
    if (changes.deleted) { setDeleteTargets(targets); return; }
    void mutations.change(targets, changes);
    if (changes.deleted || changes.status || (folder === 'starred' && changes.starred === false)) {
      setSelected(null); setChecked(new Set());
    }
  }
  async function refresh() {
    await mutations.idle();
    mutations.clear(); setOverrides({}); setRevision(value => value + 1);
  }
  const actionIds = current ? [current.id] : [...checked];
  const status = current?.status || folder;
  const allRead = current ? current.read : actionIds.length > 0 && actionIds.every(id => visibleItems.find(item => item.id === id)?.read);
  const actionButtons = <>
    <button type="button" title={allRead ? 'Mark as unread' : 'Mark as read'} aria-label={allRead ? 'Mark as unread' : 'Mark as read'} onClick={() => change(actionIds, { read: !allRead })}>{allRead ? <Mail size={19} /> : <MailOpen size={19} />}</button>
    {status !== 'resolved' && <button type="button" title="Mark as resolved" aria-label="Mark as resolved" onClick={() => change(actionIds, { status: 'resolved' })}><CheckCircle2 size={19} /></button>}
    {status !== 'archived' && <button type="button" title="Archive" aria-label="Archive" onClick={() => change(actionIds, { status: 'archived' })}><Archive size={19} /></button>}
    <button type="button" title="Delete permanently" aria-label="Delete permanently" onClick={() => change(actionIds, { deleted: true })}><Trash2 size={19} /></button>
    {(status === 'archived' || status === 'resolved') && <button type="button" title="Move to inbox" aria-label="Move to inbox" onClick={() => change(actionIds, { status: 'open' })}><RotateCcw size={19} /></button>}
  </>;
  return <section className="feedback-inbox" aria-label="Feedback inbox">
    <div className="feedback-inbox-toolbar">
      <div className="feedback-folders" role="group" aria-label="Feedback folders">{Object.entries(folders).map(([value, label]) => { const Icon = folderIcons[value]; return <button type="button" key={value} aria-pressed={folder === value} onClick={() => setFolder(value)}><Icon size={17} aria-hidden="true" />{label} <span>{counts[value] ?? '–'}</span></button>; })}</div>
      <div className="feedback-inbox-filters"><label className="feedback-search"><Search size={17} aria-hidden="true" /><span className="sr-only">Search feedback</span><input type="search" placeholder="Search feedback" value={query} onChange={event => setQuery(event.target.value)} /></label><label className="feedback-category-select"><span className="sr-only">Filter by category</span><select value={category} onChange={event => setCategory(event.target.value)}><option value="all">All categories</option>{categories.map(value => <option key={value} value={value}>{value}</option>)}</select><ChevronDown size={17} aria-hidden="true" /></label></div>
    </div>
    {error && <p className="feedback-inbox-error" role="alert">{error} <button type="button" className="text-link" onClick={() => loader.current?.()}>Try again</button></p>}
    <div className="feedback-mailbox">
      {current ? <>
        <div className="feedback-mail-toolbar"><button type="button" onClick={() => setSelected(null)}><ArrowLeft size={17} />Back to feedback</button>{actionButtons}</div>
        <article className="feedback-message-detail"><div className="feedback-detail-top"><div><h2>{current.category}</h2><time dateTime={current.createdAt}>{date(current.createdAt)}</time></div><span className={`feedback-status ${current.resolved ? 'is-resolved' : ''}`}>{current.status === 'archived' ? 'Archived' : folders[current.status]}</span></div><p className="feedback-detail-message">{current.message}</p>{current.status === 'open' && <button type="button" className="button-secondary feedback-resolve" onClick={() => change([current.id], { status: 'resolved' })}><CheckCircle2 size={17} />Mark as resolved</button>}</article>
      </> : <>
        <div className="feedback-mail-toolbar">
          <label className="feedback-select-all" title="Select up to 100 loaded messages"><input ref={selectAll} type="checkbox" aria-label="Select loaded messages (up to 100)" disabled={!selectable.length} checked={allChecked} onChange={() => setChecked(allChecked ? new Set() : new Set(selectable.map(item => item.id)))} /><span>{checked.size ? `${checked.size} selected` : 'Select loaded'}</span></label>
          {checked.size > 0 ? actionButtons : <button type="button" disabled={loading} onClick={refresh}><RotateCcw size={17} />Refresh</button>}
          <span className="feedback-loaded-count">{visibleItems.length} loaded</span>
        </div>
        <div className="feedback-message-list" aria-label={`${folders[folder]} feedback`} aria-busy={loading}>
          {visibleItems.map(item => <div className="feedback-mail-row" data-selected={checked.has(item.id)} data-read={item.read} key={item.id}>
            <label className="feedback-row-check"><input type="checkbox" aria-label={`Select ${item.category}: ${item.message.slice(0, 60)}`} checked={checked.has(item.id)} disabled={!checked.has(item.id) && checked.size >= 100} onChange={() => toggleChecked(item.id)} /></label>
            <button type="button" className="feedback-star" aria-label={`${item.starred ? 'Unstar' : 'Star'} ${item.category}: ${item.message.slice(0, 60)}`} aria-pressed={item.starred} onClick={() => change([item.id], { starred: !item.starred })}><Star size={18} fill={item.starred ? 'currentColor' : 'none'} aria-hidden="true" /></button>
            <button type="button" className="feedback-mail-open" onClick={() => { setSelected(item.id); if (!item.read) void change([item.id], { read: true }); }}><span className="feedback-row-category"><span className="feedback-unread-dot" title={item.read ? 'Read' : 'Unread'}><span className="sr-only">{item.read ? 'Read: ' : 'Unread: '}</span></span><strong>{item.category}</strong></span><span className="feedback-row-preview">{item.message}</span><time dateTime={item.createdAt} title={date(item.createdAt)}>{feedbackTime(item.createdAt, now)}</time></button>
          </div>)}
          {!loading && !visibleItems.length && <div className="feedback-list-empty"><Inbox size={24} aria-hidden="true" /><p>{search || category !== 'all' ? 'No feedback matches these filters.' : folder === 'open' ? 'Your inbox is empty.' : `No ${folder === 'archived' ? 'archived' : folder} feedback.`}</p></div>}
        </div>
        <div ref={setSentinel} className="feedback-pagination">{loading ? <p role="status">Loading messages…</p> : hasMore ? <button type="button" className="button-secondary" onClick={() => loader.current?.()}>Load more messages</button> : visibleItems.length > 0 ? <p>All messages loaded.</p> : null}</div>
      </>}
    </div>
    {deleteTargets && <DeleteFeedbackDialog count={deleteTargets.length} onClose={() => setDeleteTargets(null)} onDelete={() => {
      setError(''); void mutations.change(deleteTargets, { deleted: true });
      setDeleteTargets(null); setSelected(null); setChecked(new Set());
    }} />}
  </section>;
}

function DeleteFeedbackDialog({ count, onClose, onDelete }) {
  const dialog = useRef(null);
  const title = useId();
  const description = useId();
  useEffect(() => {
    const node = dialog.current;
    const trigger = document.activeElement;
    node.showModal();
    return () => { node.close(); if (trigger?.isConnected) trigger.focus(); };
  }, []);
  return <dialog ref={dialog} className="admin-delete-dialog" aria-labelledby={title} aria-describedby={description} onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <header><h2 id={title}>Delete {count === 1 ? 'this message' : `${count} messages`}?</h2><button type="button" aria-label="Close delete confirmation" onClick={onClose}><X size={20} /></button></header>
    <p id={description}>This permanently deletes {count === 1 ? 'the message' : 'these messages'}. You can’t undo this.</p>
    <footer><button type="button" className="button-secondary" autoFocus onClick={onClose}>Cancel</button><button type="button" className="admin-delete-confirm" onClick={onDelete}>Delete</button></footer>
  </dialog>;
}
