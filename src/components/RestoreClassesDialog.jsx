import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import './restoreClassesDialog.css';

export default function RestoreClassesDialog({ count, onRestore, onDiscard }) {
  const dialog = useRef(null);
  useEffect(() => {
    const element = dialog.current;
    const previousFocus = document.activeElement;
    element.showModal();
    return () => { element.close(); previousFocus?.focus(); };
  }, []);
  return <dialog ref={dialog} className="restore-classes-dialog" aria-labelledby="restore-classes-title" aria-describedby="restore-classes-description" onCancel={event => event.preventDefault()}>
    <header>
      <h2 id="restore-classes-title">Restore your classes?</h2>
      <button type="button" className="icon-button" aria-label="Close restore classes dialog" onClick={onDiscard}><X size={20} aria-hidden="true" /></button>
    </header>
    <p id="restore-classes-description">You have {count} {count === 1 ? 'class' : 'classes'} saved from earlier. Restore it to keep editing, or start fresh.</p>
    <p className="restore-classes-note">Note: Drafts are saved temporarily in this browser tab only.</p>
    <div className="restore-classes-actions">
      <button type="button" className="button-secondary" onClick={onDiscard}>Discard draft</button>
      <button type="button" className="button-primary" autoFocus onClick={onRestore}>Restore classes</button>
    </div>
  </dialog>;
}
