import { useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

// Pins its content to the bottom of the *visible* screen - on a phone that is
// just above the keyboard, like the formatting bar in the Notes app.
export default function KeyboardDock({ children }) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    const vv = window.visualViewport;
    let frame = 0;

    const place = () => {
      frame = 0;
      const bottom = vv ? vv.offsetTop + vv.height : window.innerHeight;
      const left = vv ? vv.offsetLeft : 0;
      el.style.width = `${vv ? vv.width : window.innerWidth}px`;
      el.style.transform = `translate3d(${left}px, ${bottom}px, 0) translateY(-100%)`;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(place);
    };

    place();
    vv?.addEventListener('resize', schedule);
    vv?.addEventListener('scroll', schedule);
    window.addEventListener('scroll', schedule, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      vv?.removeEventListener('resize', schedule);
      vv?.removeEventListener('scroll', schedule);
      window.removeEventListener('scroll', schedule);
    };
  }, []);

  return createPortal(
    <div ref={ref} className="kb-dock">
      {children}
    </div>,
    document.body,
  );
}
