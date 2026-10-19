import { useEffect, useRef } from 'react';
import { Check, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import ProviderIcon from './ProviderIcon.jsx';

export default function ImportSuccessDialog({ provider, classCount, onView, onClose }) {
  const dialog = useRef(null);
  const canvas = useRef(null);
  const name = provider === 'deepseek' ? 'DeepSeek' : 'Gemini';
  useEffect(() => {
    const node = dialog.current;
    node.showModal();
    const burst = confetti.create(canvas.current, { resize: true, useWorker: true });
    const colors = ['#f43f5e', '#fb923c', '#facc15', '#4ade80', '#38bdf8', '#a78bfa', '#f472b6'];
    let cancelled = false;
    (async () => {
      // ponytail: three small bursts over one big one; tune counts here if it feels busy
      for (let count = 0; count < 3 && !cancelled; count += 1) {
        await burst({ particleCount: 60, spread: 75, startVelocity: 32, gravity: 0.9, scalar: 0.9, ticks: 190, origin: { x: 0.5, y: 0.4 }, colors, disableForReducedMotion: true });
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    })();
    return () => { cancelled = true; burst.reset(); node.close(); };
  }, []);
  return <dialog ref={dialog} className="import-success-dialog" aria-labelledby="import-success-title" aria-describedby="import-success-description" onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <button type="button" className="icon-button import-success-close" aria-label="Close import success message" onClick={onClose}><X size={20} aria-hidden="true" /></button>
    <span className="import-success-icon"><Check size={30} strokeWidth={2.5} aria-hidden="true" /></span>
    <h2 id="import-success-title">Schedule imported successfully!</h2>
    <p id="import-success-description">Your schedule has been analyzed and imported. Double-check that everything looks correct, then make any adjustments you need.</p>
    <p className="import-success-provider"><ProviderIcon provider={provider} />Analyzed with {name} · {classCount} {classCount === 1 ? 'class' : 'classes'}</p>
    <button type="button" className="button-primary import-success-action" autoFocus onClick={onView}>View my schedule</button>
    <canvas ref={canvas} className="import-success-confetti" aria-hidden="true" />
  </dialog>;
}
