import useMobileSheetDismiss from '../../lib/useMobileSheetDismiss.js';
import { Link } from 'react-router';
import { createPortal } from 'react-dom';
import { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Ban, CircleAlert, ImageUp, ListChecks, Maximize2, Pencil, X } from 'lucide-react';
import { inspectImage, prepareImage } from '../../utils/imageHelpers.js';
import ImageCropDialog from './ImageCropDialog.jsx';
import { trackEvent } from '../../lib/analytics.js';
import WallpaperViewer from './WallpaperViewer.jsx';

const importStages = ['Reading the image…', 'Identifying courses…', 'Finding days and times…', 'Checking rooms and course codes…', 'Preparing your classes…'];

function UploadTipsDialog({ onContinue, onClose }) {
  const dialog = useRef(null);
  useMobileSheetDismiss(dialog, onClose);
  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, []);
  return <dialog ref={dialog} className="class-edit-dialog" aria-labelledby="upload-tips-title" aria-describedby="upload-tips-list" onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <header>
      <h2 id="upload-tips-title" className="upload-tips-title">Upload guide</h2>
      <button type="button" className="icon-button" aria-label="Close upload guide" onClick={onClose}><X size={20} aria-hidden="true" /></button>
    </header>
    <div className="upload-tips-example-frame"><img className="upload-tips-example" src="/upload-tips-example-960.webp" srcSet="/upload-tips-example-480.webp 480w, /upload-tips-example-960.webp 960w" sizes="(max-width: 640px) 120vw, 504px" width="960" height="640" fetchPriority="high" decoding="async" alt="Example of a clear timetable with every day, time, subject and room fully in frame." /></div>
    <ul id="upload-tips-list" className="upload-guide">
      <li>Include the whole schedule, with all days and times.</li>
      <li>Use a clear, straight-on image without glare.</li>
    </ul>
    <div className="upload-tips-actions">
      <button type="button" className="button-secondary" onClick={onClose}>Cancel</button>
      <button type="button" className="button-primary" autoFocus onClick={onContinue}>I understand</button>
    </div>
  </dialog>;
}

function ReplaceConfirmDialog({ onConfirm, onClose }) {
  const dialog = useRef(null);
  useMobileSheetDismiss(dialog, onClose);
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
    <img className="replace-classes-visual" src="/replace-classes-example-960.webp" srcSet="/replace-classes-example-480.webp 480w, /replace-classes-example-960.webp 960w" sizes="(max-width: 640px) calc(100vw - 40px), 420px" width="960" height="480" fetchPriority="high" decoding="async" alt="" />
    <ul className="placement-note import-replace-notes"><li>Replaces your current classes and edits after import.</li><li>Uses one daily AI import.</li></ul>
    <div className="upload-tips-actions">
      <button type="button" className="button-secondary" onClick={onClose}>Cancel</button>
      <button type="button" className="button-primary" autoFocus onClick={onConfirm}>Import classes</button>
    </div>
  </dialog>;
}

function ImportProgress({ image }) {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setStage(current => Math.min(current + 1, importStages.length - 1)), 2400);
    return () => clearInterval(timer);
  }, []);
  return <div className="import-loading" role="status" aria-live="polite" aria-busy="true">
    <div className="import-scan-preview" aria-hidden="true">
      <img src={image.preview} alt="" />
      <div className="import-scan-track"><span className="import-scan-beam" /></div>
    </div>
    <p className="import-loading-label">{importStages[stage]}</p>
    <p className="import-loading-hint">Finding subjects, days, times and rooms</p>
  </div>;
}

export default function Uploader({ image, onImage, onAnalyze, busy, error, importUsage, usageUnavailable, onError, onManual, onSample, hasSchedule, pickerRef, onPreparing, onCancel, onOpen }) {
  const limitReached = !!importUsage && importUsage.used >= importUsage.limit;
  const locked = usageUnavailable || limitReached;
  const importBlocked = !importUsage || locked;
  const input = useRef(null);
  const importArea = useRef(null);
  const uploadButton = useRef(null);
  const requestId = useRef(0);
  const [preparing, setPreparing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [enlarged, setEnlarged] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 1080, height: 1080 });
  const [tipsOpen, setTipsOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cropSource, setCropSource] = useState(null);
  const [cropError, setCropError] = useState('');
  useEffect(() => () => { if (cropSource) URL.revokeObjectURL(cropSource.url); }, [cropSource]);
  useImperativeHandle(pickerRef, () => ({ openPicker() { if (busy || preparing) return; setTipsOpen(true); }, focusUpload() { uploadButton.current?.focus(); } }), [busy, preparing]);
  useEffect(() => () => { requestId.current += 1; }, []);

  const choose = useCallback(async (file) => {
    if (!file || busy || preparing || importBlocked) return;
    const id = ++requestId.current;
    setPreparing(true);
    onPreparing?.(true);
    onError('');
    const properties = { file_type: ['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ? file.type : 'other', file_size_bytes: file.size };
    trackEvent('schedule_upload_started', properties);
    try {
      const bitmap = await inspectImage(file);
      const dimensions = { width: bitmap.width, height: bitmap.height };
      bitmap.close();
      if (id === requestId.current) { setCropError(''); setCropSource({ file, ...dimensions, url: URL.createObjectURL(file), properties }); }
    } catch (failure) { if (id === requestId.current) { onError(failure.message); trackEvent('schedule_upload_failed', { ...properties, error_type: 'image_preparation' }); } }
    finally { if (id === requestId.current) { setPreparing(false); onPreparing?.(false); } }
  }, [busy, preparing, importBlocked, onPreparing, onError]);

  const confirmCrop = async crop => {
    if (preparing || !cropSource) return;
    const id = ++requestId.current;
    setPreparing(true);
    onPreparing?.(true);
    setCropError('');
    try {
      const prepared = await prepareImage(cropSource.file, crop);
      if (id === requestId.current) { onImage(prepared); trackEvent('schedule_upload_succeeded', cropSource.properties); setCropSource(null); }
    } catch (failure) {
      if (id === requestId.current) { setCropError(failure.message); trackEvent('schedule_upload_failed', { ...cropSource.properties, error_type: 'image_preparation' }); }
    } finally { if (id === requestId.current) { setPreparing(false); onPreparing?.(false); } }
  };

  useEffect(() => {
    const paste = event => {
      if (window.matchMedia('(max-width: 640px)').matches || busy || preparing || importBlocked) return;
      if (!importArea.current || importArea.current.closest('[hidden]') || document.querySelector('dialog:modal')) return;
      if (event.target instanceof Element && event.target.closest('input, textarea, [contenteditable="true"]')) return;
      const files = Array.from(event.clipboardData?.items || []).filter(item => item.kind === 'file' && item.type.startsWith('image/')).map(item => item.getAsFile()).filter(Boolean);
      if (!files.length) return;
      event.preventDefault();
      if (files.length > 1) { onError('Paste one schedule image at a time.'); return; }
      onOpen?.();
      void choose(files[0]);
    };
    window.addEventListener('paste', paste);
    return () => window.removeEventListener('paste', paste);
  }, [busy, preparing, importBlocked, onError, onOpen, choose]);

  const dropEvents = {
    onDragOver: (event) => { event.preventDefault(); event.dataTransfer.dropEffect = busy || preparing || locked ? 'none' : 'copy'; if (!busy && !preparing && !locked) setDragging(true); },
    onDragLeave: (event) => { if (!event.currentTarget.contains(event.relatedTarget)) setDragging(false); },
    onDrop: (event) => { event.preventDefault(); setDragging(false); if (event.dataTransfer.files.length > 1) { onError('Drop one schedule image at a time.'); return; } choose(event.dataTransfer.files[0]); },
  };

  return <section ref={importArea} id="schedule-import" aria-label="Import your schedule" className="schedule-import">
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
      {busy ? <ImportProgress image={image} /> : <div className="uploaded-image-frame"><button type="button" className={`schedule-image-preview ${dragging ? 'is-dragging' : ''}`} aria-label="Enlarge uploaded schedule" aria-haspopup="dialog" onClick={() => setEnlarged(true)} {...dropEvents}><img src={image.preview} alt="Selected schedule" onLoad={(event) => setImageSize({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })} /><span className="preview-enlarge" aria-hidden="true"><Maximize2 size={16} /></span></button>
      <button type="button" className="button-secondary upload-change-mobile" disabled={preparing || importBlocked} onClick={() => { setTipsOpen(true); }}><ImageUp size={16} aria-hidden="true" />Change image</button></div>}
      <div className="import-footer-row"><p id="upload-data-disclosure" className="upload-privacy">Processed by AI. Not stored here. <Link to="/terms" target="_blank" rel="noopener noreferrer">Terms</Link> · <Link to="/privacy" target="_blank" rel="noopener noreferrer">Privacy</Link></p><div className="import-footer"><div className="import-submit-actions"><button type="button" className="button-secondary import-cancel" disabled={preparing} onClick={onCancel}>Cancel</button><button type="button" disabled={busy || preparing || importBlocked} aria-describedby="daily-import-usage upload-data-disclosure" onClick={() => hasSchedule ? setConfirmOpen(true) : onAnalyze()} className="button-primary">Import classes</button></div></div></div>
    </> : <>
      <button ref={uploadButton} type="button" className={`schedule-dropzone ${dragging ? 'is-dragging' : ''} ${locked ? 'is-locked' : ''}`} disabled={busy || preparing || locked} onClick={() => { setTipsOpen(true); }} {...dropEvents}>
        {locked ? <Ban size={32} strokeWidth={1.5} aria-hidden="true" /> : <ImageUp size={32} strokeWidth={1.5} aria-hidden="true" />}
        <span className="upload-label">{preparing ? 'Preparing…' : dragging ? 'Drop image here' : locked ? limitReached ? 'Daily AI limit reached' : 'AI import unavailable' : 'Upload image'}</span>
        <span className="upload-drop-hint">{locked ? 'Need more? Add classes manually instead.' : 'or drag, drop, or paste an image'}</span>
        {!locked && <span className="upload-formats">JPG, PNG, WebP · 10 MB max</span>}
      </button>
      {!hasSchedule && <div className="upload-alternatives"><button type="button" disabled={busy || preparing} onClick={onManual} className="button-secondary upload-manual"><Pencil size={16} aria-hidden="true" />Enter manually</button><button type="button" disabled={busy || preparing} onClick={onSample} className="button-secondary"><ListChecks size={16} aria-hidden="true" />Try a sample</button></div>}
      {hasSchedule && <div className="import-footer-row"><p id="upload-data-disclosure" className="upload-privacy">Processed by AI. Not stored here. <Link to="/terms" target="_blank" rel="noopener noreferrer">Terms</Link> · <Link to="/privacy" target="_blank" rel="noopener noreferrer">Privacy</Link></p><div className="import-footer"><div className="import-submit-actions"><button type="button" className="button-secondary import-cancel" disabled={preparing} onClick={onCancel}>Cancel</button><button type="button" className="button-primary" disabled onClick={onAnalyze}>Import classes</button></div></div></div>}
    </>}
    {error && <p className="import-inline-error" role="alert"><CircleAlert size={16} aria-hidden="true" />{error}</p>}
    {enlarged && image && <WallpaperViewer title="Schedule image" resolution={imageSize} onClose={() => setEnlarged(false)}><img src={image.preview} alt="Uploaded schedule" className="block h-auto w-full" /></WallpaperViewer>}
    {tipsOpen && createPortal(<UploadTipsDialog onClose={() => setTipsOpen(false)} onContinue={() => { setTipsOpen(false); onOpen?.(); input.current?.click(); }} />, document.body)}
    {cropSource && createPortal(<ImageCropDialog source={cropSource} busy={preparing} error={cropError} onClose={() => setCropSource(null)} onConfirm={confirmCrop} />, document.body)}
    {confirmOpen && <ReplaceConfirmDialog onClose={() => setConfirmOpen(false)} onConfirm={() => { setConfirmOpen(false); onAnalyze(); }} />}
  </section>;
}
