import { useCallback, useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import MobileSheet from './MobileSheet.jsx';

export default function ResponsiveDisclosure({ title, description, icon: Icon, className, open: controlledOpen, onOpenChange, mobilePreview, onPreview, inlineMobile = false, children }) {
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 640px)').matches);
  const [localOpen, setLocalOpen] = useState(false);
  const open = controlledOpen ?? localOpen;
  const setOpen = useCallback(value => { setLocalOpen(value); onOpenChange?.(value); }, [onOpenChange]);
  const close = useCallback(() => setOpen(false), [setOpen]);
  useEffect(() => {
    const query = window.matchMedia('(max-width: 640px)');
    const update = () => { setMobile(query.matches); setOpen(false); };
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, [setOpen]);
  const heading = <><span><Icon size={16} aria-hidden="true" /><span className="disclosure-label">{title}{description && <small className="disclosure-description">{description}</small>}</span></span><ChevronDown className="disclosure-icon size-4" aria-hidden="true" /></>;
  if (mobile && !inlineMobile) return <div className={className}><button type="button" className="disclosure-summary mobile-disclosure-trigger" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}>{heading}</button>{open && <MobileSheet title={title} onClose={close} preview={mobilePreview} onPreview={onPreview}>{children}</MobileSheet>}</div>;
  return <details className={className} open={open} onToggle={event => setOpen(event.currentTarget.open)}><summary className="disclosure-summary">{heading}</summary>{children}</details>;
}
