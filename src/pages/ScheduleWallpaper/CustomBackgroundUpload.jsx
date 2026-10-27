import '../../components/restoreClassesDialog.css';
import useMobileSheetDismiss from '../../lib/useMobileSheetDismiss.js';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, ImageUp, Laptop, LoaderCircle, Maximize2, Smartphone, Tablet, TriangleAlert, X } from 'lucide-react';
import { deviceResolutions } from '../../assets/wallpaperPresets.js';
import { scheduleLayoutOptions } from '../../utils/canvasHelpers.js';
import { inspectImage, prepareImage } from '../../utils/imageHelpers.js';
import { clearBackgroundDraft, createCustomBackground, readSavedBackgroundForDevice, saveBackgroundDraft } from '../../lib/customBackground.js';
import { customizeWallpaperTemplate } from '../../utils/wallpaperTheme.js';
import { trackEvent } from '../../lib/analytics.js';
import ImageCropDialog from './ImageCropDialog.jsx';
import { DesignPreview } from './TemplateGallery.jsx';
import WallpaperViewer from './WallpaperViewer.jsx';

const devices = [
  { id: 'mobile', label: 'Mobile', orientation: 'Portrait', icon: Smartphone },
  { id: 'tablet', label: 'Tablet', orientation: 'Portrait', icon: Tablet },
  { id: 'laptop', label: 'Laptop', orientation: 'Landscape', icon: Laptop },
];

export function BackgroundDeviceDialog({ device, onClose, onContinue }) {
  const dialog = useRef(null);
  useMobileSheetDismiss(dialog, onClose);
  const [selected, setSelected] = useState(device);
  useEffect(() => {
    const element = dialog.current;
    const trigger = document.activeElement;
    element.showModal();
    return () => { element.close(); if (trigger?.isConnected) trigger.focus(); };
  }, []);
  return <dialog ref={dialog} className="class-edit-dialog background-device-dialog" aria-labelledby="background-device-title" onCancel={event => { event.preventDefault(); onClose(); }}>
    <header><h2 id="background-device-title">Select device</h2><button type="button" className="icon-button" aria-label="Close" onClick={onClose}><X size={20} aria-hidden="true" /></button></header>
    <p>Choose a layout size for your wallpaper.</p>
    <fieldset className="background-device-options"><legend className="sr-only">Wallpaper device and orientation</legend>
      {devices.map(({ id, label, orientation, icon: Icon }) => <label key={id} data-selected={selected === id}>
        <input type="radio" name="background-device" value={id} checked={selected === id} onChange={() => setSelected(id)} />
        <Icon size={24} aria-hidden="true" /><span><strong>{label}</strong><span>{orientation} · {deviceResolutions[id].width} × {deviceResolutions[id].height}</span></span>
      </label>)}
    </fieldset>
    <footer><button type="button" className="button-secondary" onClick={onClose}>Cancel</button><button type="button" className="button-primary" onClick={() => onContinue(selected)}>Next</button></footer>
  </dialog>;
}

function BackgroundUploadGuide({ onContinue, onClose }) {
  const dialog = useRef(null);
  useMobileSheetDismiss(dialog, onClose);
  useEffect(() => {
    const element = dialog.current;
    const trigger = document.activeElement;
    element.showModal();
    return () => { element.close(); if (trigger?.isConnected) trigger.focus(); };
  }, []);
  return <dialog ref={dialog} className="class-edit-dialog background-upload-guide" aria-labelledby="background-guide-title" aria-describedby="background-guide-list" onCancel={event => { event.preventDefault(); onClose(); }}>
    <header><h2 id="background-guide-title">Before you upload</h2><button type="button" className="icon-button" aria-label="Close upload guide" onClick={onClose}><X size={20} aria-hidden="true" /></button></header>
    <img className="background-guide-image" src="/background-upload-guide-960.webp" srcSet="/background-upload-guide-480.webp 480w, /background-upload-guide-960.webp 960w" sizes="(max-width: 640px) calc(100vw - 40px), 420px" width="960" height="640" decoding="async" alt="A landscape photo is framed with portrait crop handles, with space left for schedule rows." />
    <ul id="background-guide-list" className="upload-guide">
      <li>Pick any photo for your schedule background.</li>
      <li>You can crop and position it to fit your screen perfectly.</li>
    </ul>
    <div className="upload-tips-actions"><button type="button" className="button-secondary" onClick={onClose}>Cancel</button><button type="button" className="button-primary" autoFocus onClick={onContinue}>I understand</button></div>
  </dialog>;
}

function RestorePhotoDialog({ image, onConfirm, onClose }) {
  const dialog = useRef(null);
  useMobileSheetDismiss(dialog, onClose);
  useEffect(() => {
    const element = dialog.current;
    const trigger = document.activeElement;
    element.showModal();
    const title = element.querySelector('#restore-photo-title');
    title.tabIndex = -1;
    title.focus({ preventScroll: true });
    return () => { element.close(); if (trigger?.isConnected) trigger.focus(); };
  }, []);
  return <dialog ref={dialog} className="restore-classes-dialog restore-photo-dialog" aria-labelledby="restore-photo-title" aria-describedby="restore-photo-description" onCancel={event => { event.preventDefault(); onClose(); }}>
    <header>
      <h2 id="restore-photo-title" tabIndex={-1}>Restore your photo?</h2>
      <button type="button" className="icon-button" aria-label="Close restore photo dialog" onClick={onClose}><X size={20} aria-hidden="true" /></button>
    </header>
    <img className="restore-classes-visual restore-photo-visual" src={image.image} alt="Your saved wallpaper background" />
    <p id="restore-photo-description">Your photo is saved in this tab.</p>
    <ul className="restore-classes-notes">
      <li><strong>Restore</strong> to keep editing.</li>
      <li><strong>Discard</strong> to start fresh.</li>
    </ul>
    <div className="restore-classes-actions">
      <button type="button" className="button-secondary" onClick={onClose}><span className="restore-label-desktop">Discard draft</span><span className="restore-label-mobile">Discard</span></button>
      <button type="button" className="button-primary" onClick={onConfirm}><span className="restore-label-desktop">Restore photo</span><span className="restore-label-mobile">Restore</span></button>
    </div>
  </dialog>;
}

function ReplacePhotoDialog({ image, onConfirm, onClose }) {
  const dialog = useRef(null);
  useMobileSheetDismiss(dialog, onClose);
  useEffect(() => {
    const element = dialog.current;
    const trigger = document.activeElement;
    element.showModal();
    const title = element.querySelector('#replace-photo-title');
    title.tabIndex = -1;
    title.focus({ preventScroll: true });
    return () => { element.close(); if (trigger?.isConnected) trigger.focus(); };
  }, []);
  return <dialog ref={dialog} className="class-edit-dialog replace-photo-dialog" aria-labelledby="replace-photo-title" aria-describedby="replace-photo-notes" onCancel={event => { event.preventDefault(); onClose(); }}>
    <header>
      <h2 id="replace-photo-title" tabIndex={-1}>Replace your image?</h2>
      <button type="button" className="icon-button" aria-label="Close" onClick={onClose}><X size={20} aria-hidden="true" /></button>
    </header>
    <img className="replace-classes-visual" src={image.image} alt="Your current wallpaper background" />
    <div id="replace-photo-notes" className="background-warning-notes">
      <p>Your image and crop will be replaced after you choose a new one.</p>
      <p>Your classes and layout will stay the same.</p>
    </div>
    <div className="class-dialog-actions">
      <button type="button" className="button-secondary" onClick={onClose}>Cancel</button>
      <button type="button" className="button-primary" onClick={onConfirm}>Choose new image</button>
    </div>
  </dialog>;
}

export default function CustomBackgroundUpload({ customTemplate, device, schedule, scheduleTitle, previewLayout, previewStyle, onLayoutChange, onSelect, onDiscardSaved, onDeviceChange }) {
  const input = useRef(null);
  const uploadButton = useRef(null);
  const active = useRef(true);
  const locked = useRef(false);
  const [uploadDevice, setUploadDevice] = useState(device);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [storageWarning, setStorageWarning] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [source, setSource] = useState(null);
  const [candidate, setCandidate] = useState(null);
  const [guideOpen, setGuideOpen] = useState(false);
  const [replaceOpen, setReplaceOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [enlarged, setEnlarged] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [pendingRestore, setPendingRestore] = useState(() => {
    try { return readSavedBackgroundForDevice(window.sessionStorage, device, customTemplate); }
    catch { return customTemplate?.device === device ? customTemplate : null; }
  });
  const resolution = deviceResolutions[uploadDevice];
  const selectedDevice = devices.find(item => item.id === uploadDevice);
  const layout = scheduleLayoutOptions(uploadDevice).some(option => option.value === previewLayout) ? previewLayout : 'stacked';
  useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);
  useEffect(() => () => { if (source) URL.revokeObjectURL(source.url); }, [source]);
  useEffect(() => {
    if (!storageWarning || !candidate) return;
    const warn = event => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [storageWarning, candidate]);

  function focusUpload() { requestAnimationFrame(() => uploadButton.current?.focus()); }
  function updateCandidate(next) {
    let saved = false;
    try { saved = saveBackgroundDraft(window.sessionStorage, next); } catch { /* Keep the image in memory. */ }
    setCandidate(next); setStorageWarning(!saved);
  }
  const startUpload = useCallback((files = []) => {
    if (locked.current) return;
    setError('');
    if (files.length > 1) { setError('Choose one background image at a time.'); return; }
    setPendingFile(files[0] || null);
    if (candidate) setReplaceOpen(true);
    else setGuideOpen(true);
  }, [candidate]);
  useEffect(() => {
    const paste = event => {
      if (window.matchMedia('(max-width: 640px)').matches || busy) return;
      if (document.querySelector('dialog:modal')) return;
      if (event.target instanceof Element && event.target.closest('input, textarea, [contenteditable="true"]')) return;
      const files = Array.from(event.clipboardData?.items || []).filter(item => item.kind === 'file' && item.type.startsWith('image/')).map(item => item.getAsFile()).filter(Boolean);
      if (!files.length) return;
      event.preventDefault();
      startUpload(files);
    };
    window.addEventListener('paste', paste);
    return () => window.removeEventListener('paste', paste);
  }, [busy, startUpload]);
  async function choose(files) {
    if (locked.current || !files.length) return;
    setError('');
    if (files.length !== 1) { setError('Choose one background image at a time.'); return; }
    const file = files[0];
    trackEvent('custom_background_upload_started', { device: uploadDevice });
    locked.current = true;
    setBusy(true);
    try {
      const bitmap = await inspectImage(file);
      const dimensions = { width: bitmap.width, height: bitmap.height };
      bitmap.close();
      if (active.current) setSource({ file, url: URL.createObjectURL(file), ...dimensions });
    } catch (failure) { if (active.current) { setError(failure.message); trackEvent('custom_background_upload_failed', { device: uploadDevice, stage: 'inspect' }); } }
    finally { locked.current = false; if (active.current) setBusy(false); }
  }
  async function confirmCrop(crop) {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    setError('');
    try {
      const prepared = await prepareImage(source.file, crop);
      if (active.current) { updateCandidate(createCustomBackground(prepared.preview, uploadDevice)); trackEvent('custom_background_upload_succeeded', { device: uploadDevice }); setSource(null); focusUpload(); }
    } catch (failure) { if (active.current) { setError(failure.message); trackEvent('custom_background_upload_failed', { device: uploadDevice, stage: 'crop' }); } }
    finally { locked.current = false; if (active.current) setBusy(false); }
  }
  function cancelImage() {
    try { clearBackgroundDraft(window.sessionStorage); } catch { /* Storage may be disabled. */ }
    setCandidate(null); setStorageWarning(false); setError(''); focusUpload();
  }
  function discardSaved() {
    try { clearBackgroundDraft(window.sessionStorage); } catch { /* Storage may be disabled. */ }
    onDiscardSaved?.(); setPendingRestore(null);
  }
  const preview = candidate && { ...customizeWallpaperTemplate(candidate, { scheduleLayout: layout, containerStyle: previewStyle }, uploadDevice), device: uploadDevice, scheduleTitle };
  const headerActions = typeof document === 'undefined' ? null : document.getElementById('wallpaper-flow-header-actions');
  const dropEvents = {
    onDragOver: event => { event.preventDefault(); if (!busy) setDragging(true); },
    onDragLeave: event => { if (!event.currentTarget.contains(event.relatedTarget)) setDragging(false); },
    onDrop: event => { event.preventDefault(); setDragging(false); startUpload(Array.from(event.dataTransfer.files)); },
  };
  return <div className="background-upload-page">
    <section className="background-upload-main" aria-label="Upload your background">
    <p className="background-size-summary">{selectedDevice.label} • {selectedDevice.orientation} • {resolution.width} × {resolution.height}</p>
    <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" tabIndex={-1} aria-label="Background image" disabled={busy} onChange={event => { void choose(event.target.files); event.target.value = ''; }} />
    {candidate ? <>
      {headerActions && createPortal(<button type="button" className="button-secondary import-change background-header-change" disabled={busy} onClick={() => startUpload()}><ImageUp size={16} aria-hidden="true" /><span className="import-change-desktop">Change image</span><span className="import-change-mobile">Change</span></button>, headerActions)}
      <div className={`background-selected-image uploaded-image-frame${dragging ? ' is-dragging' : ''}`} {...dropEvents}>
        <button ref={uploadButton} type="button" className="schedule-image-preview background-image-preview" aria-label="Enlarge uploaded background" aria-haspopup="dialog" onClick={() => setEnlarged(true)}><img src={candidate.image} width={resolution.width} height={resolution.height} alt="Your cropped wallpaper background" /><span className="preview-enlarge" aria-hidden="true"><Maximize2 size={16} /></span></button>
        <button type="button" className="button-secondary upload-change-mobile background-mobile-change" disabled={busy} onClick={() => startUpload()}><ImageUp size={16} aria-hidden="true" />Change image</button>
      </div>
      <div className="background-upload-actions"><button type="button" className="button-secondary" disabled={busy} onClick={cancelImage}>Cancel</button><button type="button" className="button-primary background-continue" disabled={busy} onClick={() => setPreviewOpen(true)}>Continue<ArrowRight size={16} aria-hidden="true" /></button></div>
    </> : <>
      <button ref={uploadButton} type="button" className={`schedule-dropzone background-image-dropzone${dragging ? ' is-dragging' : ''}`} disabled={busy} aria-describedby="background-upload-formats" onClick={() => startUpload()} {...dropEvents}>
        {busy ? <LoaderCircle size={32} className="motion-safe:animate-spin" aria-hidden="true" /> : <ImageUp size={32} aria-hidden="true" />}
        <span className="upload-label">{busy ? 'Preparing your image…' : 'Click or drop image here'}</span>
        <span id="background-upload-formats" className="upload-drop-hint">Supports JPG, PNG, WebP up to 10 MB</span>
      </button>
      <p className="background-upload-formats">Your image is processed locally and stays in your browser.</p>
    </>}
    {storageWarning && <p className="background-storage-warning" role="status"><TriangleAlert size={18} aria-hidden="true" />Your browser couldn't save this image. Keep this page open until you download.</p>}
    {error && !source && <p role="alert" className="import-inline-error">{error}</p>}
    </section>
    {pendingRestore && <RestorePhotoDialog image={pendingRestore} onConfirm={() => { setUploadDevice(pendingRestore.device); onDeviceChange(pendingRestore.device); updateCandidate(pendingRestore); setPendingRestore(null); focusUpload(); }} onClose={() => { discardSaved(); focusUpload(); }} />}
    {replaceOpen && <ReplacePhotoDialog image={candidate} onClose={() => { setReplaceOpen(false); setPendingFile(null); focusUpload(); }} onConfirm={() => { setReplaceOpen(false); setGuideOpen(true); }} />}
    {guideOpen && <BackgroundUploadGuide onClose={() => { setGuideOpen(false); setPendingFile(null); focusUpload(); }} onContinue={() => {
      setGuideOpen(false);
      if (pendingFile) { void choose([pendingFile]); setPendingFile(null); }
      else input.current?.click();
    }} />}
    {source && <ImageCropDialog key={source.url} source={source} busy={busy} error={error} onClose={() => { setSource(null); setError(''); focusUpload(); }} onConfirm={confirmCrop} background aspectRatio={resolution.width / resolution.height} />}
    {previewOpen && preview && <DesignPreview template={preview} schedule={schedule} resolution={resolution} onClose={() => { setPreviewOpen(false); requestAnimationFrame(() => document.querySelector('.background-continue')?.focus()); }} onLayoutChange={onLayoutChange} onSelect={() => {
      try { clearBackgroundDraft(window.sessionStorage); } catch { /* The selected image stays in memory. */ }
      onSelect(candidate);
    }} selectLabel="Use this wallpaper" />}
    {enlarged && candidate && <WallpaperViewer resolution={resolution} title="Your background" onClose={() => setEnlarged(false)}><img src={candidate.image} width={resolution.width} height={resolution.height} className="block h-auto w-full" alt="Your uploaded background enlarged" /></WallpaperViewer>}
  </div>;
}
