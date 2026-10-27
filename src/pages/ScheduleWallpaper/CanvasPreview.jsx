import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Download, LayoutTemplate, Maximize2 } from 'lucide-react';
import { canvasBlob, drawWallpaper } from '../../utils/canvasHelpers.js';
import { prepareWallpaperAssets } from '../../utils/wallpaperAssets.js';
import { downloadBlob } from '../../utils/downloadBlob.js';
import WallpaperViewer from './WallpaperViewer.jsx';
import Toast from '../../components/Toast.jsx';

export function WallpaperCanvas({ schedule, template, resolution, className = '', label = 'Schedule wallpaper preview', onLayout, lazy = false }) {
  const canvas = useRef(null);
  const [failure, setFailure] = useState('');
  const [readyKey, setReadyKey] = useState('');
  const [nearby, setNearby] = useState(!lazy);
  const renderResolution = useMemo(() => {
    const scale = Math.min(1, 960 / resolution.width, 1200 / resolution.height);
    return { ...resolution, width: Math.round(resolution.width * scale), height: Math.round(resolution.height * scale) };
  }, [resolution]);
  const renderKey = JSON.stringify([schedule, template, renderResolution]);
  // Gallery parents recreate these objects on likes, downloads and catalog refreshes.
  // Keep drawing inputs stable until their values actually change.
  const [drawSchedule, drawTemplate, drawResolution] = useMemo(() => JSON.parse(renderKey), [renderKey]);
  const pending = readyKey !== renderKey;
  useEffect(() => {
    const node = canvas.current;
    let version = 0;
    let visible = false;
    const render = () => {
      const currentVersion = ++version;
      return prepareWallpaperAssets(drawTemplate, drawResolution).then(async (backgroundImage) => {
        // Give input and painting a turn between gallery canvases that become ready together.
        if (lazy) await new Promise(resolve => setTimeout(resolve, 0));
        if (version !== currentVersion) return;
        try {
          const layout = drawWallpaper(node, { schedule: drawSchedule, template: drawTemplate, resolution: drawResolution, backgroundImage });
          setReadyKey(renderKey);
          setFailure('');
          onLayout?.({ overflow: layout.overflow, positionOffset: layout.positionOffset, error: '', ready: true });
        } catch (error) { setReadyKey(renderKey); setFailure(error.message); onLayout?.({ overflow: true, error: error.message, ready: true }); }
      }).catch((error) => { if (version === currentVersion) { setReadyKey(renderKey); setFailure(error.message); onLayout?.({ overflow: true, error: error.message, ready: true }); } });
    };
    let observer;
    if (lazy && typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver((entries) => {
        const nearby = entries.some((entry) => entry.isIntersecting);
        if (nearby === visible) return;
        visible = nearby;
        setNearby(nearby);
        if (nearby) render();
        else {
          ++version;
          // Release pixels without changing the card's CSS aspect ratio or scroll position.
          node.width = 1; node.height = 1;
          setReadyKey('');
          setFailure('');
        }
      }, { rootMargin: '600px 0px' });
      observer.observe(node);
    } else render();
    return () => { ++version; observer?.disconnect(); if (lazy) { node.width = 1; node.height = 1; } };
  }, [drawSchedule, drawTemplate, drawResolution, renderKey, onLayout, lazy]);
  return <><canvas ref={canvas} width={lazy ? 1 : renderResolution.width} height={lazy ? 1 : renderResolution.height} role="img" aria-label={pending ? `Loading ${label}` : label} aria-busy={pending} className={`${className} ${pending && nearby ? 'wallpaper-skeleton' : ''}`} style={{ backgroundColor: template.background, aspectRatio: `${renderResolution.width} / ${renderResolution.height}` }} />{!pending && failure && <span role="alert" className="text-xs text-muted">{failure}</span>}</>;
}

export default function CanvasPreview({ schedule, template, resolution, confirmed, issues, onChangeTemplate }) {
  const [enlarged, setEnlarged] = useState(false);
  const [layout, setLayout] = useState({ overflow: false, error: '', ready: false });
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageKind, setMessageKind] = useState('success');
  const [exportResult, setExportResult] = useState(null);
  const lastUrl = useRef(null);
  const exportKey = JSON.stringify([schedule, template, resolution.id]);
  useEffect(() => () => { if (lastUrl.current) URL.revokeObjectURL(lastUrl.current); }, []);
  const dismissNotification = useCallback(() => setMessage(''), []);
  const updateLayout = useCallback((next) => {
    setLayout(next);
    if (next.overflow) { setMessage(next.error || 'Schedule too long. Shorten names or remove optional details in Upload & review.'); setMessageKind('error'); }
  }, []);

  async function download() {
    if (!confirmed || issues.length || !layout.ready || layout.overflow || exporting) return;
    setExporting(true);
    setMessage('');
    try {
      const backgroundImage = await prepareWallpaperAssets(template, resolution);
      const output = document.createElement('canvas');
      const rendered = drawWallpaper(output, { schedule, template, resolution, backgroundImage });
      if (rendered.overflow) throw new Error('This schedule does not fit. Shorten subject names or reduce optional details.');
      const blob = await canvasBlob(output);
      const filename = `schedsnap-${template.id}-${resolution.width}x${resolution.height}.png`;
      const { inApp } = downloadBlob(blob, filename);
      // Keep a fresh object URL for the "Save again" link
      if (lastUrl.current) URL.revokeObjectURL(lastUrl.current);
      const url = URL.createObjectURL(blob);
      lastUrl.current = url;
      setExportResult({ url, filename, key: exportKey });
      setMessageKind('success');
      setMessage(
        inApp
          ? 'Image opened in a new tab — long-press it and tap Save to Photos / Download.'
          : 'PNG ready. Download started.'
      );
    } catch (error) { setMessageKind('error'); setMessage(error.message); }
    finally { setExporting(false); }
  }

  return (
    <section aria-label="Wallpaper preview and download" className="mx-auto max-w-[440px] space-y-4">
      <div className="flex items-center gap-2">
        <button type="button" onClick={onChangeTemplate} className="button-secondary flex-1"><LayoutTemplate className="size-4" aria-hidden="true" />Change template</button>
        <button type="button" aria-label="Zoom wallpaper preview" aria-haspopup="dialog" onClick={() => setEnlarged(true)} className="button-secondary size-11 shrink-0 p-0"><Maximize2 className="size-4" aria-hidden="true" /></button>
      </div>
      <div className="flex min-w-0 justify-center rounded-xl bg-soft p-4">
        <button type="button" aria-label="Enlarge wallpaper preview" aria-haspopup="dialog" onClick={() => setEnlarged(true)} className="block w-full max-w-[360px] cursor-zoom-in rounded-lg">
          <WallpaperCanvas schedule={schedule} template={template} resolution={resolution} onLayout={updateLayout} className="block h-auto w-full rounded-lg" />
        </button>
      </div>
      <div>
      <button type="button" onClick={download} disabled={!confirmed || issues.length > 0 || !layout.ready || layout.overflow || exporting} className="button-primary w-full"><Download className="size-4" aria-hidden="true" />{exporting ? 'Creating PNG…' : 'Download PNG'}</button>
      <p className="mt-3 text-center text-xs tabular-nums text-muted">{resolution.width} × {resolution.height}</p>
      {exportResult?.key === exportKey && <p className="mt-3 text-center text-sm text-accent"><a className="underline font-semibold" href={exportResult.url} download={exportResult.filename}>Save PNG again</a></p>}
      </div>
      {enlarged && <WallpaperViewer resolution={resolution} onClose={() => setEnlarged(false)}><WallpaperCanvas schedule={schedule} template={template} resolution={resolution} className="block h-auto w-full" /></WallpaperViewer>}
      <Toast message={message} kind={messageKind} onClose={dismissNotification} />
    </section>
  );
}
