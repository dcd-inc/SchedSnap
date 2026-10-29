import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, ChevronDown, X } from 'lucide-react';
import confetti from 'canvas-confetti';

const examples = {
  'Feature request': 'e.g. Add a way to change the font size.',
  'Design suggestion': 'e.g. Add more capybara designs.',
  'Report a problem': 'e.g. My wallpaper won’t download.',
  'Other feedback': 'Tell us what you think about SchedSnap.',
};

export default function FeedbackDialog({ footer = false }) {
  const dialog = useRef(null);
  const canvas = useRef(null);
  const titleId = useId();
  const countId = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [category, setCategory] = useState('Feature request');
  const [message, setMessage] = useState('');
  const [limitReset, setLimitReset] = useState(0);
  useEffect(() => {
    if (!limitReset) return;
    const timer = window.setTimeout(() => setLimitReset(0), Math.max(0, limitReset - Date.now()));
    return () => window.clearTimeout(timer);
  }, [limitReset]);
  useEffect(() => {
    if (!sent || !dialog.current?.open || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const burst = confetti.create(canvas.current, { resize: true, useWorker: true });
    const rect = dialog.current.getBoundingClientRect();
    const origin = { x: (rect.left + rect.width / 2) / window.innerWidth, y: Math.min(0.9, Math.max(0.06, rect.top / window.innerHeight)) };
    let timer;
    let cancelled = false;
    const celebrate = async () => {
      await burst({ particleCount: 90, spread: 85, startVelocity: 24, gravity: 0.85, scalar: 0.85, ticks: 160, origin, colors: ['#0f172a', '#1e293b', '#334155', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0', '#ffffff'], shapes: ['circle', 'square'], disableForReducedMotion: true });
      if (!cancelled) timer = window.setTimeout(celebrate, 900);
    };
    void celebrate();
    return () => { cancelled = true; window.clearTimeout(timer); burst.reset(); };
  }, [sent]);
  async function submit(event) {
    event.preventDefault();
    if (busy || limitReset || !message.trim()) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ category: data.get('category'), message: data.get('message') }), signal: AbortSignal.timeout(10000) });
      const result = await response.json();
      if (response.status === 429) {
        const now = Date.now();
        setLimitReset((Math.floor((now + 28800000) / 86400000) + 1) * 86400000 - 28800000);
        return;
      }
      if (!response.ok) throw new Error(result.error?.message || 'Could not send feedback. Please try again.');
      setSent(true); setMessage(''); form.reset();
    } catch (failure) { setError(failure.message || 'Could not send feedback. Please try again.'); }
    finally { setBusy(false); }
  }
  function open() {
    setError(''); setSent(false); dialog.current?.showModal();
  }
  return <>
    <button type="button" className={footer ? 'feedback-footer-link' : 'button-primary'} onClick={open}>{footer ? 'Feedback' : <>Share feedback <ArrowRight size={18} aria-hidden="true" /></>}</button>
    {typeof document !== 'undefined' && createPortal(<dialog ref={dialog} className="feedback-dialog" aria-labelledby={titleId} onClose={() => setSent(false)} onClick={event => { if (event.target === event.currentTarget) event.currentTarget.close(); }}>
      <div className="feedback-dialog-header"><h2 id={titleId} tabIndex={-1} autoFocus>{sent ? 'Feedback sent' : limitReset ? 'We’ve received your feedback' : 'Share your feedback'}</h2><button type="button" className="feedback-close" aria-label="Close feedback" onClick={() => dialog.current.close()}><X size={20} /></button></div>
      {limitReset > 0 && !sent ? <div className="feedback-success"><div className="feedback-success-message" role="status"><img className="feedback-success-mascot" src="/images/maker/maker-capybara-static-320.webp" alt="" width="320" height="320" /><p>You’ve reached today’s feedback limit. We’ll review them and look into what you’ve shared. You can send more tomorrow.</p><p>Need help or have more to share? Email us at <a className="underline underline-offset-4" href="mailto:dcd.inc.mail@gmail.com">dcd.inc.mail@gmail.com</a>.</p></div><div className="feedback-dialog-actions"><button type="button" className="button-primary" onClick={() => dialog.current.close()}>Close</button></div></div> : <>
      {sent ? <div className="feedback-success"><div role="status" className="feedback-success-message"><img className="feedback-success-mascot" src="/images/maker/maker-capybara-static-320.webp" alt="" width="320" height="320" /><p>Thank you for taking the time to write to us! We’ll review your message and look into it.</p></div><div className="feedback-dialog-actions"><button type="button" className="button-primary" onClick={() => dialog.current.close()}>Close</button></div></div> : <>
        <p>Tell us what’s on your mind. Leave out personal or sensitive details.</p>
        <form className="feedback-form" onSubmit={submit}>
          <label>What’s this about?<span className="feedback-select"><select name="category" value={category} onChange={event => setCategory(event.target.value)}><option value="Feature request">Request a feature</option><option value="Design suggestion">Request a new design</option><option value="Report a problem">Report a problem</option><option value="Other feedback">Other feedback</option></select><ChevronDown size={18} aria-hidden="true" /></span></label>
          <label>Your message<textarea name="message" required maxLength={500} placeholder={examples[category]} value={message} onChange={event => setMessage(event.target.value)} aria-describedby={countId} /></label>
          <p className="feedback-note feedback-count" id={countId}>{message.length} / 500</p>
          {error && <p role="alert" className="feedback-error">{error}</p>}
          <div className="feedback-dialog-actions"><button className="button-primary" type="submit" disabled={busy || limitReset > 0 || !message.trim()}>{busy ? 'Sending…' : limitReset > 0 ? 'Daily limit reached' : 'Send feedback'}</button></div>
        </form>
      </>}
      </>}
      {sent && <canvas ref={canvas} className="import-success-confetti" aria-hidden="true" />}
    </dialog>, document.body)}
  </>;
}
