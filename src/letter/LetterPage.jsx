import { useLayoutEffect, useRef, useState } from 'react';
import { ROLES, SIGNATURE_GAP, TEXT_TOP, signatureImageHeight, signatureWidth } from './constants.js';
import { formatDate, pageDate } from '../state/dates.js';

// One letter page drawn at full size (680x1020). Wrap it in <ScaledPage> to
// show it smaller on screen. The page's text has already been fitted by
// paginate.js; this just draws it and puts the signature right below it.
export default function LetterPage({ page, fontSize, letter }) {
  const textRef = useRef(null);
  const role = ROLES[letter.role] ?? ROLES.president;
  const [textHeight, setTextHeight] = useState(0);

  useLayoutEffect(() => {
    setTextHeight(textRef.current.offsetHeight);
  }, [page.html, fontSize]);

  const signWidth = signatureWidth(fontSize);
  const signHeight = signatureImageHeight(role, fontSize);
  const signTop = TEXT_TOP + textHeight + SIGNATURE_GAP;

  return (
    <div className="letter-page">
      <div className="lp-number">{letter.number}</div>
      <div className="lp-date">{formatDate(pageDate(letter))}</div>

      <div
        ref={textRef}
        className="lp-text"
        style={{ fontSize }}
        dangerouslySetInnerHTML={{ __html: page.html }}
      />

      {page.signature && (
        <>
          <img
            className="lp-sign"
            src={role.image}
            alt=""
            width={signWidth}
            height={signHeight}
            style={{ top: signTop, width: signWidth, height: signHeight }}
          />
          {role.lines && (
            <div className="lp-sign-text" style={{ top: signTop + signHeight, fontSize }}>
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
