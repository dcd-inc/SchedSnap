import ResponsiveDisclosure from '../../components/ResponsiveDisclosure.jsx';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, Download, Eye, Heart, Images, Maximize2, Pencil, SlidersHorizontal, TriangleAlert } from 'lucide-react';
import { getScheduleIssues } from '../../../shared/scheduleSchema.js';
import { canvasBlob, drawWallpaper, findOverlaps } from '../../utils/canvasHelpers.js';
import { prepareWallpaperAssets } from '../../utils/wallpaperAssets.js';
import { galleryScheduleFor } from '../../assets/wallpaperPresets.js';
import { downloadBlob } from '../../utils/downloadBlob.js';
import { templateProperties, trackEvent } from '../../lib/analytics.js';
import { WallpaperCanvas } from './CanvasPreview.jsx';
import WallpaperViewer from './WallpaperViewer.jsx';
import TemplateControls from './TemplateControls.jsx';
import ScheduleLayoutPicker from './ScheduleLayoutPicker.jsx';
import Editor from './Editor.jsx';
import Uploader from './Uploader.jsx';
import Toast from '../../components/Toast.jsx';
import useDesignDownloads, { recordDesignDownload } from '../../lib/useDesignDownloads.js';
import useDesignLikes from '../../lib/useDesignLikes.js';
import DownloadThanksDialog from '../../components/DownloadThanksDialog.jsx';

export default function TemplateWorkspace({ step, onStep, template, defaultTemplate, schedule, resolution, scheduleSource, onScheduleSourceChange, onScheduleChange, onAppearanceChange, onResetAppearance, onUndoAppearance, canUndoAppearance, image, onImage, busy, onError, onAnalyze, importUsage, usageUnavailable, importError, onSample, importOpen, onImportOpenChange: setImportOpen, onTitleChange, canCancelEntry, onCancelEntryChange: setCanCancelEntry, onCancelImport, imagePickerRef: imagePicker, preparingImage, onPreparingImageChange: setPreparingImage }) {
  const [enlarged, setEnlarged] = useState(false);
  const [showClock, setShowClock] = useState(true);
  const previewClock = step !== 'classes' && showClock;
  const [customizing, setCustomizing] = useState(false);
  const [previewStuck, setPreviewStuck] = useState(false);
  const [previewAtHeader, setPreviewAtHeader] = useState(false);
  const changeCustomizing = useCallback(next => { setCustomizing(next); setPreviewStuck(false); }, []);
  const [reviewVersion, setReviewVersion] = useState(0);
  const [layout, setLayout] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [exportResult, setExportResult] = useState(null);
  const [thankYouDesign, setThankYouDesign] = useState(null);
  const { likes, pending: pendingLikes, error: likeError, refresh: refreshLikes, toggle: toggleLike } = useDesignLikes();
  const vote = likes[template.id];
  const { downloads, error: downloadError, refresh: refreshDownloads } = useDesignDownloads(resolution.id);
  const [message, setMessage] = useState('');
  const [messageKind, setMessageKind] = useState('success');
  const classEditor = useRef(null);
  const previewAnchor = useRef(null);
  const stickyPreview = useRef(null);
  const active = useRef(true);
  const hasSchedule = !!schedule.classes.length;
  const manualEntry = scheduleSource === 'manual' && canCancelEntry;
  const shownSchedule = hasSchedule ? schedule : galleryScheduleFor(template);
  const exportKey = JSON.stringify([schedule, template, resolution]);
  const updateLayout = useCallback((next) => setLayout({ ...next, key: exportKey }), [exportKey]);
  const issues = getScheduleIssues(schedule);
  const overlapWarnings = findOverlaps(schedule);
  const warnings = [...new Set([...schedule.warnings, ...overlapWarnings])];
  const currentLayout = layout?.key === exportKey ? layout : null;
  const canDownload = !busy && !exporting && !issues.length && !warnings.length && currentLayout?.ready && !currentLayout.overflow && !currentLayout.error;
  const exportStatus = busy ? 'Reading schedule…' : issues.length ? issues[0] : warnings.length ? 'Resolve the review notes before continuing.' : currentLayout?.error ? 'Preview could not load. Try another design.' : currentLayout?.overflow ? 'Classes don’t fit. Reduce the top margin, shorten names or choose another design.' : !currentLayout?.ready ? 'Preparing preview…' : '';
  useEffect(() => {
    active.current = true;
    return () => { active.current = false; };
  }, []);
  const dismissNotification = useCallback(() => setMessage(''), []);
  useEffect(() => {
    if (step !== 'preview' || !customizing || !previewAnchor.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      setPreviewStuck(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    }, { rootMargin: '0px', threshold: 0 });
    observer.observe(previewAnchor.current);
    return () => observer.disconnect();
  }, [step, customizing]);

  useEffect(() => {
    if (step !== 'preview') return;
    const header = document.querySelector('.site-header');
    const anchor = previewAnchor.current?.parentElement;
    if (!header || !anchor) return;
    const update = () => {
      // Measure the untransformed header edge so hiding it cannot change the trigger.
      const headerBottom = header.offsetHeight + (parseFloat(getComputedStyle(header).top) || 0);
      setPreviewAtHeader(window.matchMedia('(max-width: 640px)').matches && anchor.getBoundingClientRect().top <= headerBottom);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    const observer = new ResizeObserver(update);
    observer.observe(header);
    observer.observe(anchor);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      observer.disconnect();
    };
  }, [step]);

  useEffect(() => {
    const node = stickyPreview.current;
    if (step !== 'preview' || !customizing || !node) return;
    const observer = new ResizeObserver(([entry]) => {
      node.parentElement.style.setProperty('--sticky-preview-height', `${entry.borderBoxSize?.[0]?.blockSize ?? node.getBoundingClientRect().height}px`);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [step, customizing]);

  function enterManually() {
    onScheduleSourceChange('manual');
    trackEvent('manual_schedule_started', templateProperties(template));
    setImportOpen(false);
    setCanCancelEntry(true);
    if (!hasSchedule) onScheduleChange({ classes: [], warnings: [] });
  }

  function cancelEntry() {
    setCanCancelEntry(false);
    setImportOpen(false);
    onScheduleChange({ classes: [], warnings: [] });
    onScheduleSourceChange('unknown');
    onImage(null);
    onError('');
    requestAnimationFrame(() => imagePicker.current?.focusUpload());
  }

  async function recordDownload() {
    const saved = await recordDesignDownload(template.id, resolution.id);
    if (saved && active.current) refreshDownloads();
  }

  async function download() {
    if (!canDownload) return;
    setExporting(true);
    setMessage('');
    const started = performance.now();
    const properties = { ...templateProperties(template), schedule_source: scheduleSource, class_count: schedule.classes.length, width: resolution.width, height: resolution.height };
    trackEvent('wallpaper_download_requested', properties);
    let stage = 'render';
    try {
      const backgroundImage = await prepareWallpaperAssets(template, resolution);
      if (!active.current) return;
      const output = document.createElement('canvas');
      const rendered = drawWallpaper(output, { schedule, template, resolution, backgroundImage });
      if (rendered.overflow) throw new Error('Classes don’t fit. Shorten names or choose another design.');
      const blob = await canvasBlob(output);
      if (!active.current) return;
      const filename = `schedsnap-${template.id}-${resolution.width}x${resolution.height}.png`;
      stage = 'download';
      const { inApp } = downloadBlob(blob, filename);
      void recordDownload();
      trackEvent('wallpaper_download_started', { ...properties, download_method: inApp ? 'new_tab' : 'download_link', duration_ms: Math.round(performance.now() - started) });
      setExportResult({ key: exportKey });
      if (!vote?.liked) setThankYouDesign(template.id);
      setMessageKind('success');
      setMessage(
        inApp
          ? 'Image opened in a new tab — long-press it and tap Save to Photos / Download.'
          : 'Download started.'
      );
    } catch (failure) { trackEvent('wallpaper_download_failed', { ...properties, stage }); setMessageKind('error'); setMessage(failure.message); }
    finally { setExporting(false); }
  }

  const preview = <><div className="flow-preview-art preview-size-md">
    <button type="button" aria-label="Enlarge wallpaper" aria-haspopup="dialog" onClick={() => { setEnlarged(true); trackEvent('wallpaper_preview_enlarged', templateProperties(template)); }} className="flow-wallpaper">
      <WallpaperCanvas schedule={shownSchedule} template={template} resolution={resolution} showClock={previewClock} onLayout={updateLayout} className="block h-auto w-full" label={`${template.name} ${hasSchedule ? 'with your classes' : 'with sample classes'}${previewClock && resolution.id !== 'laptop' ? ', sample clock at 9:41 AM' : ''}`} />
      <span className="preview-enlarge" aria-hidden="true"><Maximize2 size={16} /></span>
    </button>
    {step === 'preview' && <div className="inline-preview-controls"><button type="button" aria-label="View full-screen preview" onClick={() => setEnlarged(true)}><Eye size={18} aria-hidden="true" /></button></div>}
  </div>

  </>;

  return <>
    {step === 'classes' ? <div className="classes-layout">
      <section className="classes-content" aria-label="Add and review classes">
        <div hidden={(hasSchedule || manualEntry) && !importOpen && !importError}><Uploader importUsage={importUsage} usageUnavailable={usageUnavailable} pickerRef={imagePicker} image={image} error={importError} onOpen={() => setImportOpen(true)} onImage={(next) => { onImage(next); setImportOpen(true); }} onPreparing={setPreparingImage} onCancel={onCancelImport} onAnalyze={async () => { if (await onAnalyze()) { setCanCancelEntry(true); setImportOpen(false); setReviewVersion((value) => value + 1); } }} busy={busy} onError={onError} hasSchedule={hasSchedule} onManual={enterManually} onSample={() => { onSample(); setCanCancelEntry(true); setImportOpen(false); }} /></div>
        {(hasSchedule || manualEntry) && <div hidden={importOpen}>
          <fieldset disabled={busy} aria-busy={busy} className="flow-class-editor"><Editor scheduleSource={scheduleSource} validationRef={classEditor} key={reviewVersion} schedule={schedule} scheduleTitle={template.scheduleTitle} onTitleChange={onTitleChange} onChange={onScheduleChange} onImport={() => imagePicker.current?.openPicker()} preparingImage={preparingImage} /></fieldset>
          {!!warnings.length && <section className="review-warning-rows" aria-label="Review notes"><ul>{warnings.map(warning => <li key={warning} className="review-warning-row"><TriangleAlert size={20} aria-hidden="true" /><p>{warning}</p>{schedule.warnings.includes(warning) && !overlapWarnings.includes(warning) && <button type="button" className="button-secondary" onClick={() => onScheduleChange({ ...schedule, warnings: schedule.warnings.filter(note => note !== warning) })}>Mark resolved</button>}</li>)}</ul></section>}
          {warnings.length > 0 && <p id="class-validation-status" className="class-validation-note" role="status">Resolve the review notes to continue.</p>}
          <div className="classes-next"><div className="classes-next-actions">{canCancelEntry && <button type="button" disabled={busy || preparingImage} className="button-secondary" onClick={cancelEntry}>Cancel</button>}<button type="button" disabled={busy || preparingImage || issues.length > 0 || warnings.length > 0} aria-describedby={warnings.length ? "class-validation-status" : undefined} className="button-primary preview" onClick={() => { if (issues.length) classEditor.current?.validate(); else if (!warnings.length) onStep('preview'); }}>Continue<ArrowRight size={16} aria-hidden="true" /></button></div></div>
        </div>}
      </section>
      <aside className="classes-design-preview" aria-label="Selected design">
        {preview}
        <div className="selected-design"><div><p className="font-semibold">{template.name}</p>{!hasSchedule && <p className="text-xs text-muted">Sample classes</p>}</div></div>
      </aside>
    </div> : <div className="download-layout" data-customizing={customizing} data-preview-stuck={previewStuck} data-preview-at-header={previewAtHeader}>
      <div ref={previewAnchor} className="preview-sticky-anchor" aria-hidden="true" />
      <section ref={stickyPreview} className="download-preview" aria-label="Wallpaper preview">{preview}<div className="desktop-preview-clock">{step !== 'classes' && resolution.id !== 'laptop' && <div className="preview-clock-control">
      <label className="appearance-switch"><input type="checkbox" checked={showClock} onChange={(event) => setShowClock(event.target.checked)} />Show clock preview</label>
    </div>}</div></section>
      {resolution.id !== 'laptop' && <div className="download-clock-row">{step !== 'classes' && resolution.id !== 'laptop' && <div className="preview-clock-control">
      <label className="appearance-switch"><input type="checkbox" checked={showClock} onChange={(event) => setShowClock(event.target.checked)} />Show clock preview</label>
    </div>}</div>}
      <section className="download-options" aria-label="Download and customize">
        <h2>{template.name}</h2>
        <p className="download-meta">{schedule.classes.length} {schedule.classes.length === 1 ? 'class' : 'classes'} · {resolution.width} × {resolution.height}</p>
        <div className="download-design-stats" role="group" aria-label="Design totals">
          <span role="img" title={downloadError || 'Total downloads'} aria-label={`${downloads[template.id]?.toLocaleString() ?? 'Unavailable'} downloads`}><Download size={18} aria-hidden="true" /><span aria-hidden="true">{downloads[template.id]?.toLocaleString() ?? '—'}</span></span>
          <span role="img" className="download-design-hearts" data-liked={vote?.liked || false} title="Total hearts" aria-label={`${vote?.count.toLocaleString() ?? 'Unavailable'} hearts`}><Heart size={18} fill={vote?.liked ? 'currentColor' : 'none'} aria-hidden="true" /><span aria-hidden="true">{vote?.count.toLocaleString() ?? '—'}</span></span>
          {downloadError && <button type="button" className="text-link" onClick={refreshDownloads}>Retry downloads</button>}
          {likeError && <button type="button" className="text-link" disabled={!!pendingLikes} onClick={() => refreshLikes(true)}>Retry hearts</button>}
        </div>
        <button type="button" onClick={download} disabled={!canDownload} aria-describedby={exportStatus ? 'wallpaper-export-status' : undefined} className="button-primary download-wallpaper"><Download size={18} aria-hidden="true" />{exporting ? 'Creating PNG…' : exportResult?.key === exportKey ? 'Download again' : 'Download wallpaper'}</button>
        {exportStatus && <div className={`export-status${issues.length || warnings.length || currentLayout?.overflow ? ' class-dialog-incomplete export-warning' : ''}`} role="status" id="wallpaper-export-status">{(issues.length > 0 || warnings.length > 0 || currentLayout?.overflow) && <TriangleAlert size={20} aria-hidden="true" />}<div><p>{exportStatus}</p>{(issues.length > 0 || warnings.length > 0 || currentLayout?.overflow) && <button type="button" className="text-link" onClick={() => onStep('classes')}>{schedule.classes.length ? 'Fix class details' : 'Add classes'}</button>}{currentLayout?.error && <button type="button" className="text-link" onClick={() => onStep('design')}>Change design</button>}</div></div>}
        <ResponsiveDisclosure title="Customize wallpaper" description="Adjust colors, fonts and layout" icon={SlidersHorizontal} className="flow-customize customize-appearance" open={customizing} onOpenChange={changeCustomizing} inlineMobile><TemplateControls onTitleChange={onTitleChange} positionOffset={{ horizontal: Math.round((layout?.positionOffset?.horizontal || 0) * resolution.width), vertical: Math.round((layout?.positionOffset?.vertical || 0) * resolution.height) }} layoutPicker={<ScheduleLayoutPicker template={template} onChange={onAppearanceChange} inline />} onUndo={onUndoAppearance} canUndo={canUndoAppearance} template={template} defaultTemplate={defaultTemplate} enablePlacement onChange={onAppearanceChange} onReset={onResetAppearance} /></ResponsiveDisclosure>
        <div className="wallpaper-edit-actions"><button type="button" className="button-secondary" onClick={() => onStep('classes')}><Pencil size={16} aria-hidden="true" />Edit classes</button><button type="button" className="button-secondary" onClick={() => onStep('design')}><Images size={16} aria-hidden="true" />Change design</button></div>
      </section>
    </div>}
    {enlarged && <WallpaperViewer resolution={resolution} onClose={() => setEnlarged(false)}><WallpaperCanvas schedule={shownSchedule} template={template} resolution={resolution} showClock={previewClock} className="block h-auto w-full" label={`${template.name} enlarged wallpaper${previewClock && resolution.id !== 'laptop' ? ', sample clock at 9:41 AM' : ''}`} /></WallpaperViewer>}
    {thankYouDesign === template.id && <DownloadThanksDialog name={template.name} vote={vote} pending={pendingLikes} error={likeError} onHeart={() => toggleLike(template.id)} onRetry={() => refreshLikes(true)} onClose={() => setThankYouDesign(null)} />}
    <Toast message={message} kind={messageKind} onClose={dismissNotification} />
  </>;
}
