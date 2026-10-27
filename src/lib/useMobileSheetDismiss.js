import { useEffect, useEffectEvent } from 'react';

export default function useMobileSheetDismiss(dialogRef, onDismiss, disabled = false) {
  const dismiss = useEffectEvent(onDismiss);
  const isDisabled = useEffectEvent(() => disabled);

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    const mobile = window.matchMedia('(max-width: 640px)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const originalTransform = node.style.transform;
    const originalWillChange = node.style.willChange;
    let gesture, animation, frame;
    node.dataset.mobileSwipe = '';

    function reset() {
      cancelAnimationFrame(frame);
      animation?.cancel();
      animation = undefined;
      node.style.transform = originalTransform;
      node.style.willChange = originalWillChange;
      delete node.dataset.sheetDragging;
    }

    function settle(close, distance) {
      cancelAnimationFrame(frame);
      const target = close ? node.getBoundingClientRect().height + 32 : 0;
      const finish = () => {
        if (close && node.isConnected && node.open && !isDisabled()) dismiss();
        else reset();
      };
      if (reducedMotion.matches) { finish(); return; }
      animation = node.animate([
        { transform: `translate3d(0, ${distance}px, 0)` },
        { transform: `translate3d(0, ${target}px, 0)` },
      ], { duration: close ? 180 : 220, easing: close ? 'cubic-bezier(0.3,0,1,1)' : 'cubic-bezier(0.2,0,0,1)', fill: 'forwards' });
      animation.finished.then(finish).catch(() => {});
    }

    function start(event) {
      if (event.touches.length !== 1) { gesture = undefined; reset(); return; }
      if (!mobile.matches || !node.open || isDisabled() || animation) return;
      const target = event.target;
      if (!(target instanceof Element) || target.closest('dialog') !== node || target.closest('button, a, input, select, textarea, summary, [contenteditable="true"]')) return;
      const touch = event.touches[0];
      const bounds = node.getBoundingClientRect();
      const inHeader = target.closest('header, .viewer-header');
      const inGrip = node.scrollTop === 0 && touch.clientY >= bounds.top && touch.clientY <= bounds.top + 32;
      if (!inHeader && !inGrip) return;
      event.preventDefault();
      gesture = { id: touch.identifier, x: touch.clientX, y: touch.clientY, lastY: touch.clientY, lastTime: event.timeStamp, velocity: 0, distance: 0 };
    }

    function move(event) {
      if (!gesture) return;
      const touch = Array.from(event.touches).find(item => item.identifier === gesture.id);
      if (!touch || event.touches.length !== 1 || isDisabled()) { gesture = undefined; reset(); return; }
      const dx = touch.clientX - gesture.x, dy = touch.clientY - gesture.y;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) { gesture = undefined; reset(); return; }
      event.preventDefault();
      gesture.velocity = (touch.clientY - gesture.lastY) / Math.max(1, event.timeStamp - gesture.lastTime);
      gesture.lastY = touch.clientY;
      gesture.lastTime = event.timeStamp;
      gesture.distance = Math.max(0, dy);
      const distance = gesture.distance;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        node.dataset.sheetDragging = '';
        node.style.willChange = 'transform';
        node.style.transform = `translate3d(0, ${distance}px, 0)`;
      });
    }

    function end(event) {
      if (!gesture) return;
      const { distance, velocity, lastTime } = gesture;
      gesture = undefined;
      const threshold = Math.min(120, Math.max(72, node.getBoundingClientRect().height * 0.2));
      const flick = event.timeStamp - lastTime < 100 && velocity > 0.65 && distance >= 32;
      settle(!isDisabled() && (distance >= threshold || flick), distance);
    }
    function cancel() { if (gesture) { const { distance } = gesture; gesture = undefined; settle(false, distance); } }
    function resize() { if (!mobile.matches) { gesture = undefined; reset(); } }

    node.addEventListener('touchstart', start, { passive: false });
    node.addEventListener('touchmove', move, { passive: false });
    node.addEventListener('touchend', end);
    node.addEventListener('touchcancel', cancel);
    mobile.addEventListener('change', resize);
    return () => {
      node.removeEventListener('touchstart', start);
      node.removeEventListener('touchmove', move);
      node.removeEventListener('touchend', end);
      node.removeEventListener('touchcancel', cancel);
      mobile.removeEventListener('change', resize);
      delete node.dataset.mobileSwipe;
      reset();
    };
  }, [dialogRef]);
}
