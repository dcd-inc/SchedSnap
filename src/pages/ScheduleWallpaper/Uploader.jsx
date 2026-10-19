import { Link } from 'react-router';
import { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Ban, CircleAlert, ImageUp, ListChecks, LoaderCircle, Maximize2, Pencil, X } from 'lucide-react';
import { prepareImage } from '../../utils/imageHelpers.js';
import { trackEvent } from '../../lib/analytics.js';
import WallpaperViewer from './WallpaperViewer.jsx';

const importStages = ['Reading the image…', 'Identifying courses…', 'Finding days and times…', 'Checking rooms and course codes…', 'Preparing your classes…'];

function UploadTipsDialog({ onContinue, onClose }) {
  const dialog = useRef(null);
  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, []);
  return <dialog ref={dialog} className="class-edit-dialog" aria-labelledby="upload-tips-title" aria-describedby="upload-tips-list" onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <header>
      <h2 id="upload-tips-title" className="upload-tips-title"><ImageUp size={20} aria-hidden="true" />Upload tips</h2>
      <button type="button" className="icon-button" aria-label="Close upload tips" onClick={onClose}><X size={20} aria-hidden="true" /></button>
    </header>
    <ul id="upload-tips-list" className="upload-guide">
      <li>Use a screenshot or a straight-on photo in good lighting.</li>
      <li>Keep the whole schedule in frame, including every day and time.</li>
      <li>Avoid blur, glare, and shadows over the text.</li>
    </ul>
    <div className="upload-tips-actions">
      <button type="button" className="button-secondary" onClick={onClose}>Cancel</button>
      <button type="button" className="button-primary" autoFocus onClick={onContinue}>I understand</button>
    </div>
  </dialog>;
}

function ReplaceConfirmDialog({ onConfirm, onClose }) {
  const dialog = useRef(null);
  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, []);
  return <dialog ref={dialog} className="class-edit-dialog" aria-labelledby="replace-confirm-title" onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <header>
      <h2 id="replace-confirm-title">Replace your classes?</h2>
      <button type="button" className="icon-button" aria-label="Close" onClick={onClose}><X size={20} aria-hidden="true" /></button>
    </header>
    <p className="placement-note">Importing this image replaces your current classes and edits. The AI reads the new schedule and your existing classes are removed once the import finishes. This uses one of your daily AI imports.</p>
    <div className="upload-tips-actions">
      <button type="button" className="button-secondary" onClick={onClose}>Cancel</button>
      <button type="button" className="button-primary" autoFocus onClick={onConfirm}>Import classes</button>
    </div>
  </dialog>;
}

function ImportProgress() {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setStage(current => Math.min(current + 1, importStages.length - 1)), 2400);
    return () => clearInterval(timer);
  }, []);
  return <div className="import-loading" role="status" aria-live="polite" aria-busy="true"><LoaderCircle size={32} strokeWidth={1.5} className="motion-safe:animate-spin" aria-hidden="true" /><p className="import-loading-label">{importStages[stage]}</p><p className="import-loading-hint">This can take a few seconds. You can cancel anytime.</p></div>;
}

export default function Uploader({ image, onImage, onAnalyze, busy, error, importUsage, usageUnavailable, onError, onManual, onSample, hasSchedule, pickerRef, onPreparing, onCancel, onOpen }) {
  const limitReached = !!importUsage && importUsage.used >= importUsage.limit;
  const locked = usageUnavailable || limitReached;
  const importBlocked = !importUsage || locked;
  const input = useRef(null);
  const uploadButton = useRef(null);
  const requestId = useRef(0);
  const [preparing, setPreparing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [enlarged, setEnlarged] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 1080, height: 1080 });
  const [tipsOpen, setTipsOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  useImperativeHandle(pickerRef, () => ({ openPicker() { if (busy || preparing) return; onOpen?.(); input.current?.click(); }, focusUpload() { uploadButton.current?.focus(); } }), [busy, preparing, onOpen]);
  useEffect(() => () => { requestId.current += 1; }, []);

  async function choose(file) {
    if (!file || busy || preparing || importBlocked) return;
    const id = ++requestId.current;
    setPreparing(true);
    onPreparing?.(true);
    onError('');
    const properties = { file_type: ['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ? file.type : 'other', file_size_bytes: file.size };
    trackEvent('schedule_upload_started', properties);
    try {
      const prepared = await prepareImage(file);
      if (id === requestId.current) { onImage(prepared); trackEvent('schedule_upload_succeeded', properties); }
    } catch (failure) { if (id === requestId.current) { onError(failure.message); trackEvent('schedule_upload_failed', { ...properties, error_type: 'image_preparation' }); } }
    finally { if (id === requestId.current) { setPreparing(false); onPreparing?.(false); } }
  }

  const dropEvents = {
    onDragOver: (event) => { event.preventDefault(); event.dataTransfer.dropEffect = busy || preparing || locked ? 'none' : 'copy'; if (!busy && !preparing && !locked) setDragging(true); },
    onDragLeave: (event) => { if (!event.currentTarget.contains(event.relatedTarget)) setDragging(false); },
    onDrop: (event) => { event.preventDefault(); setDragging(false); if (event.dataTransfer.files.length > 1) { onError('Drop one schedule image at a time.'); return; } choose(event.dataTransfer.files[0]); },
  };

  return <section id="schedule-import" aria-label="Import your schedule" className="schedule-import">
    <div id="daily-import-usage" className="upload-usage" role="status">
      {usageUnavailable ? <p>AI import is unavailable right now. You can still enter classes manually.</p> : importUsage ? limitReached ? <>
        <p className="upload-usage-title"><Ban size={18} aria-hidden="true" />Daily AI Limit Reached ({importUsage.used}/{importUsage.limit})</p>
        <p>AI uploads locked until midnight. Add your schedule manually to continue.</p>
      </> : <>
        <p className="upload-usage-title">{importUsage.used} of {importUsage.limit} AI Imports Used</p>
        <p>Limit resets at midnight. Manual class entry is always free and unlimited.</p>
      </> : <p>Checking your AI import allowance…</p>}
    </div>
    <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" tabIndex={-1} aria-label="Schedule image" onChange={(event) => { choose(event.target.files[0]); event.target.value = ''; }} disabled={busy || preparing} />
    {image ? <>
      {busy ? <ImportProgress /> : <button type="button" className={`schedule-image-preview ${dragging ? 'is-dragging' : ''}`} aria-label="Enlarge uploaded schedule" aria-haspopup="dialog" onClick={() => setEnlarged(true)} {...dropEvents}><img src={image.preview} alt="Selected schedule" onLoad={(event) => setImageSize({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })} /><span className="preview-enlarge" aria-hidden="true"><Maximize2 size={16} /></span></button>}
      <div className="import-footer-row"><p id="upload-data-disclosure" className="upload-privacy">Processed by AI. Not stored here. <Link to="/terms" target="_blank" rel="noopener noreferrer">Terms</Link> · <Link to="/privacy" target="_blank" rel="noopener noreferrer">Privacy</Link></p><div className="import-footer"><div className="import-submit-actions"><button type="button" className="button-secondary import-cancel" disabled={preparing} onClick={onCancel}>Cancel</button><button type="button" disabled={busy || preparing || importBlocked} aria-describedby="daily-import-usage upload-data-disclosure" onClick={() => hasSchedule ? setConfirmOpen(true) : onAnalyze()} className="button-primary">Import classes</button></div></div></div>
    </> : <>
      <button ref={uploadButton} type="button" className={`schedule-dropzone ${dragging ? 'is-dragging' : ''} ${locked ? 'is-locked' : ''}`} disabled={busy || preparing || locked} onClick={() => setTipsOpen(true)} {...dropEvents}>
        {locked ? <Ban size={32} strokeWidth={1.5} aria-hidden="true" /> : <ImageUp size={32} strokeWidth={1.5} aria-hidden="true" />}
        <span className="upload-label">{preparing ? 'Preparing…' : dragging ? 'Drop image here' : locked ? limitReached ? 'Daily AI limit reached' : 'AI import unavailable' : 'Upload image'}</span>
        <span className="upload-drop-hint">{locked ? 'Need more? Add classes manually instead.' : 'or drag and drop it here'}</span>
        {!locked && <span className="upload-formats">JPG, PNG, WebP · 10 MB max</span>}
      </button>
      {!hasSchedule && <div className="upload-alternatives"><button type="button" disabled={busy || preparing} onClick={onManual} className="button-secondary upload-manual"><Pencil size={16} aria-hidden="true" />Enter manually</button><button type="button" disabled={busy || preparing} onClick={onSample} className="button-secondary"><ListChecks size={16} aria-hidden="true" />Try a sample</button></div>}
      {hasSchedule && <div className="import-footer-row"><p id="upload-data-disclosure" className="upload-privacy">Processed by AI. Not stored here. <Link to="/terms" target="_blank" rel="noopener noreferrer">Terms</Link> · <Link to="/privacy" target="_blank" rel="noopener noreferrer">Privacy</Link></p><div className="import-footer"><div className="import-submit-actions"><button type="button" className="button-secondary import-cancel" disabled={preparing} onClick={onCancel}>Cancel</button><button type="button" className="button-primary" disabled onClick={onAnalyze}>Import classes</button></div></div></div>}
    </>}
    {error && <p className="import-inline-error" role="alert"><CircleAlert size={16} aria-hidden="true" />{error}</p>}
    {enlarged && image && <WallpaperViewer title="Schedule image" resolution={imageSize} onClose={() => setEnlarged(false)}><img src={image.preview} alt="Uploaded schedule" className="block h-auto w-full" /></WallpaperViewer>}
    {tipsOpen && <UploadTipsDialog onClose={() => setTipsOpen(false)} onContinue={() => { setTipsOpen(false); input.current?.click(); }} />}
    {confirmOpen && <ReplaceConfirmDialog onClose={() => setConfirmOpen(false)} onConfirm={() => { setConfirmOpen(false); onAnalyze(); }} />}
  </section>;
}
