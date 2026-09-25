import { useLayoutEffect, useRef, useState } from 'react';
import { PAGE_HEIGHT, PAGE_WIDTH } from './constants.js';

// Shrinks a full-size letter page to fit the width of its container.
export default function ScaledPage({ children }) {
  const ref = useRef(null);
  const [scale, setScale] = useState(0);

  useLayoutEffect(() => {
    const el = ref.current;
    const update = () => setScale(Math.min(1, el.clientWidth / PAGE_WIDTH));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="scaled-page" style={{ height: PAGE_HEIGHT * scale }}>
      <div className="scaled-page-inner" style={{ transform: `scale(${scale})` }}>
        {children}
      </div>
    </div>
  );
}
