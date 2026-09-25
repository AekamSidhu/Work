import { useLayoutEffect, useRef, useState } from 'react';
import {
  BASE_FONT_SIZE,
  MIN_FONT_SIZE,
  PAGE_HEIGHT,
  ROLES,
  SIGNATURE_BOTTOM_LIMIT,
  SIGNATURE_GAP,
  SIGNATURE_WIDTH,
  SIGNATURE_WIDTH_SMALL,
  TEXT_MAX_HEIGHT,
  TEXT_TOP,
} from './constants.js';
import { formatDate, pageDate } from '../state/dates.js';

const sameLayout = (a, b) => Object.keys(a).every((k) => a[k] === b[k]);

// One letter page drawn at full size (680x1020). Wrap it in <ScaledPage> to
// show it smaller on screen. `onFit(pageId, overflowing)` reports when the
// text is too long to fit even at the smallest font size.
export default function LetterPage({ page, onFit }) {
  const textRef = useRef(null);
  const signTextRef = useRef(null);
  const onFitRef = useRef(onFit);
  onFitRef.current = onFit;

  const role = ROLES[page.role] ?? ROLES.president;
  const [layout, setLayout] = useState(null);

  // Same fitting rules as the original: shrink the text from 16px to 12px until
  // it fits, then place the signature just below the text.
  useLayoutEffect(() => {
    const text = textRef.current;
    let size = BASE_FONT_SIZE;
    text.style.fontSize = `${size}px`;
    while (text.scrollHeight > TEXT_MAX_HEIGHT && size > MIN_FONT_SIZE) {
      size -= 1;
      text.style.fontSize = `${size}px`;
    }
    const overflowing = text.scrollHeight > TEXT_MAX_HEIGHT + 1;

    const signWidth = size === MIN_FONT_SIZE ? SIGNATURE_WIDTH_SMALL : SIGNATURE_WIDTH;
    const signHeight = Math.round(signWidth * role.aspect);
    const signTop = Math.min(
      TEXT_TOP + text.offsetHeight + SIGNATURE_GAP,
      PAGE_HEIGHT - signHeight - SIGNATURE_BOTTOM_LIMIT,
    );

    let signTextTop = 0;
    const signText = signTextRef.current;
    if (signText) {
      signText.style.fontSize = `${size}px`;
      signTextTop = Math.min(signTop + signHeight, PAGE_HEIGHT - signText.offsetHeight);
    }

    const next = { size, signWidth, signHeight, signTop, signTextTop };
    setLayout((prev) => (prev && sameLayout(prev, next) ? prev : next));
    onFitRef.current?.(page.id, overflowing);
  }, [page.id, page.html, page.includeSignature, role]);

  const l = layout ?? {
    size: BASE_FONT_SIZE,
    signWidth: SIGNATURE_WIDTH,
    signHeight: Math.round(SIGNATURE_WIDTH * role.aspect),
    signTop: 0,
    signTextTop: 0,
  };

  return (
    <div className="letter-page">
      <div className="lp-number">{page.number}</div>
      <div className="lp-date">{formatDate(pageDate(page))}</div>

      <div
        ref={textRef}
        className="lp-text"
        style={{ fontSize: l.size }}
        dangerouslySetInnerHTML={{ __html: page.html || '' }}
      />

      {page.includeSignature && (
        <>
          <img
            className="lp-sign"
            src={role.image}
            alt=""
            width={l.signWidth}
            height={l.signHeight}
            style={{ top: l.signTop, width: l.signWidth, height: l.signHeight }}
          />
          {role.lines && (
            <div ref={signTextRef} className="lp-sign-text" style={{ top: l.signTextTop, fontSize: l.size }}>
              {role.lines.map((line) => (
                <div key={line}>{line}</div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
