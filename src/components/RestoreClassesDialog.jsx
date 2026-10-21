import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import './restoreClassesDialog.css';

export default function RestoreClassesDialog({ count, onRestore, onDiscard }) {
  const dialog = useRef(null);
  useEffect(() => {
    const element = dialog.current;
    const previousFocus = document.activeElement;
    element.showModal();
    element.querySelector('#restore-classes-title').focus({ preventScroll: true });
    return () => { element.close(); previousFocus?.focus(); };
  }, []);
  return <dialog ref={dialog} className="restore-classes-dialog" aria-labelledby="restore-classes-title" aria-describedby="restore-classes-description" onCancel={event => event.preventDefault()}>
    <header>
      <h2 id="restore-classes-title" tabIndex={-1}>Restore your classes?</h2>
      <button type="button" className="icon-button" aria-label="Close restore classes dialog" onClick={onDiscard}><X size={20} aria-hidden="true" /></button>
    </header>
    <img className="restore-classes-visual" src="/restore-classes-example.png" width="1774" height="887" alt="" />
    <p id="restore-classes-description">{count} {count === 1 ? 'class is' : 'classes are'} saved in this tab.</p>
    <ul className="restore-classes-notes">
      <li><strong>Restore</strong> to keep editing.</li>
      <li><strong>Discard</strong> to start fresh.</li>
    </ul>
    <div className="restore-classes-actions">
      <button type="button" className="button-secondary" onClick={onDiscard}><span className="restore-label-desktop">Discard draft</span><span className="restore-label-mobile">Discard</span></button>
      <button type="button" className="button-primary" onClick={onRestore}><span className="restore-label-desktop">Restore classes</span><span className="restore-label-mobile">Restore</span></button>
    </div>
  </dialog>;
}
