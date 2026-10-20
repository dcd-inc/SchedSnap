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
    const colors = ['#0f172a', '#1e293b', '#334155', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0', '#ffffff'];
    // Burst from the top of the dialog so mobile bottom-sheets do not spray from mid-screen.
    const rect = node.getBoundingClientRect();
    const origin = { x: (rect.left + rect.width / 2) / window.innerWidth, y: Math.min(0.9, Math.max(0.06, rect.top / window.innerHeight)) };
    let cancelled = false;
    (async () => {
      // ponytail: five small bursts over one big one; tune counts here if it feels busy
      for (let count = 0; count < 5 && !cancelled; count += 1) {
        await burst({ particleCount: 90, spread: 90, startVelocity: 36, gravity: 0.9, scalar: 1, ticks: 210, origin, colors, disableForReducedMotion: true });
        await new Promise(resolve => setTimeout(resolve, 260));
      }
    })();
    return () => { cancelled = true; burst.reset(); node.close(); };
  }, []);
  return <dialog ref={dialog} className="import-success-dialog" aria-labelledby="import-success-title" aria-describedby="import-success-description" onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <button type="button" className="icon-button import-success-close" aria-label="Close import success message" onClick={onClose}><X size={20} aria-hidden="true" /></button>
    <span className="import-success-icon"><Check size={30} strokeWidth={2.5} aria-hidden="true" /></span>
    <h2 id="import-success-title">Schedule imported successfully!</h2>
    <p id="import-success-description">Your schedule has been analyzed and imported. Double-check that everything looks correct, then make any adjustments you need.</p>
    <p className="import-success-provider" title={`AI provider: ${name}`}><ProviderIcon provider={provider} />Analyzed with AI · {classCount} {classCount === 1 ? 'class' : 'classes'}</p>
    <button type="button" className="button-primary import-success-action" autoFocus onClick={onView}>View my schedule</button>
    <canvas ref={canvas} className="import-success-confetti" aria-hidden="true" />
  </dialog>;
}
