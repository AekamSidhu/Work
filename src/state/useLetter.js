import { useCallback, useEffect, useState } from 'react';
import { ROLES } from '../letter/constants.js';
import { PAGE_BREAK_HTML } from '../editor/pageBreak.js';

const STORAGE_KEY = 'crsa-letter-draft';

let counter = 0;
function newId() {
  counter += 1;
  return `l${Date.now().toString(36)}${counter.toString(36)}`;
}

function freshLetter() {
  return {
    id: newId(), // changes on "New letter" so the editor starts over
    html: '',
    number: '',
    date: null, // null = today's date
    role: 'president',
    includeSignature: true,
  };
}

function cleanLetter(raw) {
  const letter = freshLetter();
  if (typeof raw?.html === 'string') letter.html = raw.html;
  if (typeof raw?.number === 'string') letter.number = raw.number;
  if (typeof raw?.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw.date)) letter.date = raw.date;
  if (raw?.role in ROLES) letter.role = raw.role;
  if (typeof raw?.includeSignature === 'boolean') letter.includeSignature = raw.includeSignature;
  return letter;
}

// Drafts saved by the first React version kept each page separately.
// Join them into one letter, with a page break where each page ended.
function fromSeparatePages(pages) {
  const first = pages[0] ?? {};
  const last = pages[pages.length - 1] ?? {};
  return cleanLetter({
    html: pages.map((p) => (typeof p?.html === 'string' ? p.html : '')).join(PAGE_BREAK_HTML),
    number: first.number,
    date: first.date,
    role: last.role,
    includeSignature: last.includeSignature,
  });
}

function loadDraft() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved?.pages) && saved.pages.length) return fromSeparatePages(saved.pages);
    if (saved && typeof saved === 'object') return cleanLetter(saved);
  } catch {
    // No saved draft, or storage is unavailable - start fresh.
  }
  return freshLetter();
}

// The letter being written, auto-saved on this device so a reload (which iOS
// does often to background tabs) never loses work.
export function useLetter() {
  const [letter, setLetter] = useState(loadDraft);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(letter));
      } catch {
        // Storage full or blocked - nothing useful to do.
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [letter]);

  const update = useCallback((patch) => setLetter((l) => ({ ...l, ...patch })), []);
  const reset = useCallback(() => setLetter(freshLetter()), []);

  return { letter, update, reset };
}
