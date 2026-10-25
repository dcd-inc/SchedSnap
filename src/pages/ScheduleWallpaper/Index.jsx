import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ImageUp, SlidersHorizontal } from 'lucide-react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import Toast from '../../components/Toast.jsx';
import BackToTop from '../../components/BackToTop.jsx';
import RestoreClassesDialog from '../../components/RestoreClassesDialog.jsx';
import { readDraft, saveDraft } from '../../lib/scheduleDraft.js';
import { api, getAnalysisErrorMessage } from '../../lib/api.js';
import { loadImportUsage, rememberImportUsage } from '../../lib/importUsage.js';
import { templateProperties, trackEvent } from '../../lib/analytics.js';
import { deviceResolutions } from '../../assets/wallpaperPresets.js';
import { useTemplates, useCatalogStatus } from '../../lib/catalogContext.js';
import { scheduleLayoutOptions } from '../../utils/canvasHelpers.js';
import { sampleSchedule } from '../../assets/sampleSchedule.js';
import { scheduleSchema } from '../../../shared/scheduleSchema.js';
import { customizeWallpaperTemplate, galleryPreviewTemplate } from '../../utils/wallpaperTheme.js';
import TemplateGallery from './TemplateGallery.jsx';
import TemplateWorkspace from './TemplateWorkspace.jsx';
import WallpaperSearch from '../../components/WallpaperSearch.jsx';
import WallpaperLoading from '../../components/WallpaperLoading.jsx';
import ImportSuccessDialog from './ImportSuccessDialog.jsx';
import { useDebouncedSearch } from '../../lib/useWallpaperSearch.js';
import { clearCustomBackground, customBackgroundId, readCustomBackground, saveCustomBackground } from '../../lib/customBackground.js';
import CustomBackgroundUpload, { BackgroundDeviceDialog } from './CustomBackgroundUpload.jsx';

export default function ScheduleWallpaper() {
  const catalogTemplates = useTemplates();
  const [customTemplate, setCustomTemplate] = useState(() => {
    try { return readCustomBackground(window.sessionStorage); } catch { return null; }
  });
  const [backgroundSaved, setBackgroundSaved] = useState(true);
  const wallpaperTemplates = useMemo(() => customTemplate ? [...catalogTemplates, customTemplate] : catalogTemplates, [catalogTemplates, customTemplate]);
  const catalogStatus = useCatalogStatus();
  const { '*': templateId } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useSearchParams();
  const uploadingBackground = templateId === 'upload';
  const requestedDevice = ['mobile', 'tablet', 'laptop'].includes(search.get('device')) ? search.get('device') : 'mobile';
  const device = templateId === customBackgroundId && customTemplate ? customTemplate.device : requestedDevice;
  const [choosingBackgroundDevice, setChoosingBackgroundDevice] = useState(false);
  function changeDevice(next) {
    setSearch((previous) => { const params = new URLSearchParams(previous); params.set('device', next); return params; });
  }
  function devicePath(path, targetDevice = device) {
    const [pathname, query = ''] = path.split('?');
    const params = new URLSearchParams(query);
    params.set('device', targetDevice);
    if (search.get('sort')) params.set('sort', search.get('sort'));
    params.set('layout', previewLayout);
    params.set('style', previewStyle);
    if (search.get('collection')) params.set('collection', search.get('collection'));
    return `${pathname}?${params}`;
  }
  const [templateSettings, setTemplateSettings] = useState({});
  const [appearanceUndo, setAppearanceUndo] = useState(null);
  const [customizeRequest, setCustomizeRequest] = useState(0);
  const resolution = deviceResolutions[device];
  const previewLayout = scheduleLayoutOptions(device).some(option => option.value === search.get('layout')) ? search.get('layout') : 'stacked';
  const previewStyle = ['glass', 'solid', 'colored', 'colored-glass', 'outline'].includes(search.get('style')) ? search.get('style') : 'glass';
  function changeStyle(next) {
    setSearch(previous => { const params = new URLSearchParams(previous); params.set('style', next); return params; });
  }
  function changeLayout(next) {
    if (templateId && !uploadingBackground) {
      setTemplateSettings(previous => {
        const current = { ...previous[templateId] };
        delete current.fontScale;
        return { ...previous, [templateId]: { ...current, scheduleLayout: next } };
      });
    }
    setSearch(previous => { const params = new URLSearchParams(previous); params.set('layout', next); return params; });
  }
  const [schedule, setSchedule] = useState({ classes: [], warnings: [] });
  const [scheduleSource, setScheduleSource] = useState('unknown');
  const [image, setImage] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const [scheduleTitle, setScheduleTitle] = useState('Class Schedule');
  const [searchQuery, setSearchQuery] = useState('');
  const sort = ['likes', 'downloads', 'newest', 'oldest'].includes(search.get('sort')) ? search.get('sort') : 'likes';
  function changeSort(next) {
    setSearch(previous => { const params = new URLSearchParams(previous); params.set('sort', next); return params; });
  }
  function changeCategory(next) {
    setSearch(previous => { const params = new URLSearchParams(previous); params.set('collection', next); return params; });
  }
  const debouncedSearchQuery = useDebouncedSearch(searchQuery);
  const [pendingDraft, setPendingDraft] = useState(() => {
    try { return readDraft(window.sessionStorage); } catch { return null; }
  });
  useEffect(() => {
    if (pendingDraft) return;
    try { saveDraft(window.sessionStorage, schedule, scheduleTitle, scheduleSource); }
    catch { /* The unload guard remains active when storage is unavailable. */ }
  }, [schedule, scheduleTitle, scheduleSource, pendingDraft]);
  const [canCancelEntry, setCanCancelEntry] = useState(false);
  const [preparingImage, setPreparingImage] = useState(false);
  const [busy, setBusy] = useState(false);
  const [importUsage, setImportUsage] = useState(null);
  const [usageUnavailable, setUsageUnavailable] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [importResult, setImportResult] = useState(null);
  const request = useRef(null);
  const heading = useRef(null);
  const imagePicker = useRef(null);
  const lastTrackedStep = useRef(null);
  const template = useMemo(() => {
    const preset = customizeWallpaperTemplate(galleryPreviewTemplate(wallpaperTemplates.find((item) => item.id === templateId && (!item.mobileOnly || device === 'mobile'))), { ...(search.has('layout') ? { scheduleLayout: previewLayout } : {}), ...(search.has('style') ? { containerStyle: previewStyle } : {}), ...templateSettings[templateId] }, device);
    return preset ? { ...preset, scheduleTitle, device } : undefined;
  }, [templateId, templateSettings, scheduleTitle, device, wallpaperTemplates, previewLayout, previewStyle, search]);
  const returnId = search.get('return');
  const previousTemplate = wallpaperTemplates.find((item) => item.id === returnId && (!item.mobileOnly || device === 'mobile'));
  const selectedId = template?.id || previousTemplate?.id;
  const step = uploadingBackground ? 'upload' : template ? search.get('step') === 'preview' ? 'preview' : 'classes' : 'design';
  const basePath = '/services/schedule-wallpaper';
  const choosingImage = step === 'classes' && !!image && (importOpen || !schedule.classes.length);
  const showingImport = step === 'classes' && (importOpen || (!schedule.classes.length && !(scheduleSource === 'manual' && canCancelEntry)));
  useEffect(() => {
    if (!showingImport) return;
    let active = true;
    let checking = false;
    let resetTimer;
    async function refreshUsage() {
      if (checking || document.hidden) return;
      checking = true;
      try {
        const usage = await loadImportUsage();
        if (active) {
          setImportUsage(usage); setUsageUnavailable(false);
          window.clearTimeout(resetTimer);
          resetTimer = window.setTimeout(refreshUsage, Math.max(1000, usage.resetsAt - Date.now()));
        }
      } catch { if (active) setUsageUnavailable(true); }
      finally { checking = false; }
    }
    refreshUsage();
    window.addEventListener('focus', refreshUsage);
    return () => { active = false; window.clearTimeout(resetTimer); window.removeEventListener('focus', refreshUsage); };
  }, [showingImport]);
  const hasUnsavedChanges = !backgroundSaved || schedule.classes.length > 0 || !!image || scheduleTitle !== 'Class Schedule' || Object.values(templateSettings).some((settings) => Object.keys(settings).length > 0);
  useEffect(() => {
    if (templateId && !template && !uploadingBackground) return;
    const key = `${step}:${templateId || ''}`;
    if (lastTrackedStep.current === key) return;
    lastTrackedStep.current = key;
    const properties = { step, ...(template ? templateProperties(template) : {}), schedule_source: scheduleSource, class_count: schedule.classes.length };
    trackEvent('wallpaper_step_viewed', properties);
    if (step === 'preview') trackEvent('schedule_previewed', properties);
  }, [step, templateId, template, scheduleSource, schedule.classes.length, uploadingBackground]);
  useEffect(() => {
    const unsavedAppearance = Object.values(templateSettings).some(settings => Object.keys(settings).length > 0);
    if (!hasUnsavedChanges) return;
    function confirmRefresh(event) {
      try {
        if (backgroundSaved && !pendingDraft && saveDraft(window.sessionStorage, schedule, scheduleTitle, scheduleSource) && (schedule.classes.length > 0 || (!image && !unsavedAppearance && scheduleTitle === 'Class Schedule'))) return;
      } catch { /* Warn before losing edits when storage is unavailable. */ }
      event.preventDefault();
      event.returnValue = '';
    }
    window.addEventListener('beforeunload', confirmRefresh);
    return () => window.removeEventListener('beforeunload', confirmRefresh);
  }, [hasUnsavedChanges, pendingDraft, image, templateSettings, schedule, scheduleTitle, scheduleSource, backgroundSaved]);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [step]);

  function openStep(next) {
    if (next === step) return;
    setImportOpen(false);
    if (busy) { request.current?.abort(); setBusy(false); }
    if (next === 'design') navigate(devicePath(`${basePath}${selectedId ? `?return=${selectedId}&step=${step === 'preview' ? 'preview' : 'classes'}` : ''}`));
    else if (selectedId) navigate(devicePath(`${basePath}/${selectedId}${next === 'preview' ? '?step=preview' : ''}`));
  }

  function selectTemplate(id) {
    if (busy) return;
    setTemplateSettings(previous => ({ ...previous, [id]: { ...previous[id], scheduleLayout: previewLayout, containerStyle: previewStyle } }));
    const selected = wallpaperTemplates.find((item) => item.id === id);
    if (selected) trackEvent('template_selected', templateProperties(selected));
    navigate(devicePath(`${basePath}/${id}${previousTemplate && search.get('step') === 'preview' ? '?step=preview' : ''}`));
  }
  useEffect(() => () => request.current?.abort(), []);
  useEffect(() => {
    if (template) document.title = `${template.name} — SchedSnap`;
  }, [template]);

  async function analyze() {
    if (!image || busy) return;
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    setError('');
    setSuccess('');
    const started = performance.now();
    const properties = templateProperties(template);
    trackEvent('schedule_import_started', properties);
    try {
      const { data } = await api.post('/analyze', { image: image.image, mimeType: image.mimeType }, { signal: controller.signal });
      if (data.usage) { rememberImportUsage(data.usage); setImportUsage(data.usage); setUsageUnavailable(false); }
      if (controller.signal.aborted) { trackEvent('schedule_import_cancelled', properties); return; }
      const checked = scheduleSchema.safeParse(data.schedule);
      if (!checked.success) throw new Error('The schedule response was incomplete. Try another image.');
      setSchedule(checked.data);
      setImage(null);
      setScheduleSource('image');
      trackEvent('schedule_import_succeeded', { ...properties, class_count: checked.data.classes.length, warning_count: checked.data.warnings.length, duration_ms: Math.round(performance.now() - started) });
      setImportResult({ provider: data.provider === 'deepseek' ? 'deepseek' : 'gemini', classCount: checked.data.classes.length });
      return true;
    } catch (failure) {
      if (failure.response?.data?.usage) { rememberImportUsage(failure.response.data.usage); setImportUsage(failure.response.data.usage); setUsageUnavailable(false); }
      else rememberImportUsage(null);
      if (controller.signal.aborted) trackEvent('schedule_import_cancelled', properties);
      else trackEvent('schedule_import_failed', { ...properties, http_status: failure.response?.status || 0, error_type: failure.code === 'ECONNABORTED' ? 'timeout' : failure.response ? 'server_error' : 'invalid_response_or_network', duration_ms: Math.round(performance.now() - started) });
      if (!controller.signal.aborted) setError(getAnalysisErrorMessage(failure));
    } finally {
      if (request.current === controller) { setBusy(false); request.current = null; }
    }
  }

  const dismissNotification = useCallback(() => { setError(''); setSuccess(''); }, []);
  const changeSchedule = useCallback((next) => { setSchedule(next); setSuccess(''); }, []);
  function cancelImport() {
    if (busy) { request.current?.abort(); setBusy(false); }
    setImage(null);
    setImportOpen(false);
    dismissNotification();
    requestAnimationFrame(() => heading.current?.closest('.wallpaper-flow')?.querySelector(schedule.classes.length ? '[data-import-trigger]' : '.schedule-dropzone')?.focus());
  }
  function goBack() {
    if (step === 'upload') {
      navigate(devicePath(`${basePath}${selectedId ? `?return=${selectedId}&step=${search.get('step') === 'preview' ? 'preview' : 'classes'}` : ''}`));
      return;
    }
    if (step === 'classes' && importOpen && schedule.classes.length) {
      cancelImport();
    } else openStep(step === 'classes' ? 'design' : 'classes');
  }

  if (catalogStatus.loading && templateId && templateId !== customBackgroundId && !uploadingBackground) return <WallpaperLoading />;
  if (templateId && !template && !uploadingBackground) return <section className="page-wrap py-12">
    <h1 className="text-2xl font-semibold">{templateId === customBackgroundId ? 'Upload your background again' : 'Template not found'}</h1>
    <p className="mt-3 text-muted">{templateId === customBackgroundId ? 'Your image is saved only in this browser tab. Choose a design to upload it again.' : 'Choose a template from the collection to start editing.'}</p>
    <Link to="/services/schedule-wallpaper" className="button-primary mt-6">Choose template</Link>
  </section>;

  return <section className="page-wrap wallpaper-flow" data-uploading={showingImport} data-device={device} data-orientation={resolution.width > resolution.height ? 'landscape' : 'portrait'} style={{ '--wallpaper-ratio': `${resolution.width} / ${resolution.height}`, '--wallpaper-ratio-value': resolution.width / resolution.height }}>
    {(step === 'classes' || step === 'preview') && pendingDraft && <RestoreClassesDialog count={pendingDraft.schedule.classes.length} onRestore={() => {
      setSchedule(pendingDraft.schedule);
      setScheduleTitle(pendingDraft.title);
      setScheduleSource(pendingDraft.source || 'draft');
      setCanCancelEntry(true);
      setPendingDraft(null);
      if (template && step !== 'preview') navigate(devicePath(`${basePath}/${template.id}`), { replace: true });
      requestAnimationFrame(() => heading.current?.focus());
    }} onDiscard={() => { setPendingDraft(null); if (step === 'preview' && template) navigate(devicePath(`${basePath}/${template.id}`), { replace: true }); requestAnimationFrame(() => heading.current?.focus()); }} />}
    {step === 'design' ? <Link to="/" className="tool-back"><ArrowLeft className="size-4" aria-hidden="true" />Back</Link> : <button type="button" className="tool-back" onClick={goBack}><ArrowLeft className="size-4" aria-hidden="true" />{step === 'classes' && importOpen && schedule.classes.length ? 'Back to classes' : 'Back'}</button>}
    {choosingBackgroundDevice && <BackgroundDeviceDialog device={device} onClose={() => setChoosingBackgroundDevice(false)} onContinue={next => {
      setChoosingBackgroundDevice(false);
      navigate(devicePath(`${basePath}/upload${selectedId ? `?return=${selectedId}&step=${step === 'preview' || search.get('step') === 'preview' ? 'preview' : 'classes'}` : ''}`, next));
    }} />}
    <header className="wallpaper-flow-header" data-importing={choosingImage}>
      <h1 tabIndex={-1} ref={heading}>{step === 'upload' ? 'Upload your background' : step === 'design' ? 'Choose a design' : step === 'classes' ? 'Add your classes' : 'Live Preview'}</h1>
      <div id="wallpaper-flow-header-actions" className="wallpaper-flow-header-actions">
        {step === 'preview' && <button type="button" className="button-secondary preview-customize" aria-controls="wallpaper-customization" onClick={() => setCustomizeRequest(value => value + 1)}><SlidersHorizontal size={16} aria-hidden="true" />Customize</button>}
        {step === 'design' && <WallpaperSearch value={searchQuery} onChange={setSearchQuery} />}
        {choosingImage && <button type="button" className="button-secondary import-change" aria-label={preparingImage ? 'Preparing image' : 'Change image'} disabled={busy || preparingImage} onClick={() => imagePicker.current?.openPicker()}><ImageUp size={16} aria-hidden="true" />{preparingImage ? 'Preparing…' : <><span className="import-change-desktop">Change image</span><span className="import-change-mobile">Change</span></>}</button>}
      </div>
    </header>
    {template ? <TemplateWorkspace defaultTemplate={customizeWallpaperTemplate(galleryPreviewTemplate(wallpaperTemplates.find(item => item.id === templateId)), { scheduleLayout: template.scheduleLayout }, device)}
      step={step} onStep={openStep} customizeRequest={customizeRequest}
      template={template} schedule={schedule} resolution={resolution} onScheduleChange={changeSchedule}
      scheduleSource={scheduleSource} onScheduleSourceChange={setScheduleSource}
      onAppearanceChange={(key, value) => { if (key === 'scheduleLayout') changeLayout(value); else setTemplateSettings(previous => { const settings = { ...previous[templateId] }; if (value === undefined) delete settings[key]; else settings[key] = value; return { ...previous, [templateId]: settings }; }); setAppearanceUndo(null); trackEvent('wallpaper_appearance_changed', { ...templateProperties(template), setting: key }); }}
      canUndoAppearance={appearanceUndo?.id === templateId} onUndoAppearance={() => { if (appearanceUndo?.id === templateId) { setTemplateSettings(previous => ({ ...previous, [templateId]: appearanceUndo.settings })); setAppearanceUndo(null); } }}
      onResetAppearance={() => { setAppearanceUndo({ id: templateId, settings: templateSettings[templateId] || {} }); setTemplateSettings((previous) => ({ ...previous, [templateId]: {} })); trackEvent('wallpaper_appearance_reset', templateProperties(template)); }}
      image={image} busy={busy}
      importOpen={importOpen} onImportOpenChange={setImportOpen}
      onTitleChange={setScheduleTitle}
      canCancelEntry={canCancelEntry} onCancelEntryChange={setCanCancelEntry}
      onCancelImport={cancelImport}
      imagePickerRef={imagePicker} preparingImage={preparingImage} onPreparingImageChange={setPreparingImage}
      onImage={(next) => { setImage(next); dismissNotification(); }}
      onError={(message) => { setError(message); setSuccess(''); }} onAnalyze={analyze} importUsage={importUsage} usageUnavailable={usageUnavailable} importError={error}
      onSample={() => {
        const sample = structuredClone(sampleSchedule);
        setSchedule(sample);
        setScheduleSource('sample');
        trackEvent('sample_schedule_loaded', templateProperties(template));
        dismissNotification();
      }}
    /> : uploadingBackground ? <CustomBackgroundUpload customTemplate={customTemplate} device={device} onDeviceChange={changeDevice} schedule={schedule} scheduleTitle={scheduleTitle} previewLayout={previewLayout} previewStyle={previewStyle} onLayoutChange={changeLayout} onDiscardSaved={() => {
      setCustomTemplate(null); setBackgroundSaved(true);
      try { clearCustomBackground(window.sessionStorage); } catch { /* Storage may be disabled. */ }
    }} onSelect={next => {
      setCustomTemplate(next);
      let saved = false;
      try { saved = saveCustomBackground(window.sessionStorage, next); } catch { /* Continue with the in-memory image. */ }
      setBackgroundSaved(saved);
      setTemplateSettings(previous => ({ ...previous, [next.id]: { ...previous[next.id], scheduleLayout: previewLayout, containerStyle: previewStyle } }));
      if (!saved) setError('Your image is ready, but browser storage is full. Keep this page open until you download.');
      navigate(devicePath(`${basePath}/${next.id}${step === 'preview' || (previousTemplate && search.get('step') === 'preview') ? '?step=preview' : ''}`, next.device));
    }} /> : <>
      <TemplateGallery onUpload={() => setChoosingBackgroundDevice(true)} previewStyle={previewStyle} onStyleChange={changeStyle} previewLayout={previewLayout} onLayoutChange={changeLayout} sort={sort} onSortChange={changeSort} device={device} onDeviceChange={changeDevice} category={search.get('collection')} onCategoryChange={changeCategory} selectedId={selectedId} settings={templateSettings} schedule={schedule} scheduleTitle={scheduleTitle} resolution={resolution} onSelect={selectTemplate} searchQuery={debouncedSearchQuery} onClearSearch={() => setSearchQuery('')} />
    </>}
    {step === 'design' && <BackToTop />}
    {importResult && <ImportSuccessDialog provider={importResult.provider} classCount={importResult.classCount} onClose={() => setImportResult(null)} onView={() => { setImportResult(null); requestAnimationFrame(() => document.querySelector('.flow-class-editor')?.scrollIntoView({ behavior: 'smooth', block: 'start' })); }} />}
    <Toast message={success} kind="success" onClose={dismissNotification} />
    {!showingImport && <Toast message={error} kind="error" onClose={dismissNotification} />}
  </section>;
}
