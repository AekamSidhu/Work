import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { BASE_FONT_SIZE, ROLES } from './constants.js';
import { createMeasurer, layoutLetter } from './paginate.js';

// Waits until typing pauses briefly before re-laying out the pages.
function useSettled(value, delay) {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return settled;
}

// Works out the pages (and text size) for the whole letter.
export function useLetterLayout(letter) {
  const html = useSettled(letter.html, 120);
  const { role, includeSignature } = letter;
  const measurer = useRef(null);
  const [layout, setLayout] = useState({
    fontSize: BASE_FONT_SIZE,
    pages: [{ html: '', signature: includeSignature }],
  });

  useLayoutEffect(() => {
    measurer.current = createMeasurer();
    return () => measurer.current.destroy();
  }, []);

  useLayoutEffect(() => {
    setLayout(layoutLetter(measurer.current, html, ROLES[role] ?? ROLES.president, includeSignature));
  }, [html, role, includeSignature]);

  return layout;
}
