import { useCallback, useEffect, useState } from 'react';
import { ROLES } from '../letter/constants.js';

const STORAGE_KEY = 'crsa-letter-draft';

let counter = 0;
function newId() {
  counter += 1;
  return `p${Date.now().toString(36)}${counter.toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

// A new page copies the details (number, date, signature) of the page it was added after.
function makePage(from) {
  return {
    id: newId(),
    html: '',
    number: from?.number ?? '',
    date: from?.date ?? null, // null = today's date
    role: from?.role ?? 'president',
    includeSignature: from?.includeSignature ?? true,
  };
}

function freshLetter() {
  const page = makePage();
  return { pages: [page], activeId: page.id };
}

function cleanPage(raw) {
  const page = makePage();
  if (typeof raw?.id === 'string' && raw.id) page.id = raw.id;
  if (typeof raw?.html === 'string') page.html = raw.html;
  if (typeof raw?.number === 'string') page.number = raw.number;
  if (typeof raw?.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw.date)) page.date = raw.date;
  if (raw?.role in ROLES) page.role = raw.role;
  if (typeof raw?.includeSignature === 'boolean') page.includeSignature = raw.includeSignature;
  return page;
}

function loadDraft() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved?.pages) && saved.pages.length > 0) {
      const pages = saved.pages.map(cleanPage);
      const activeId = pages.some((p) => p.id === saved.activeId) ? saved.activeId : pages[0].id;
      return { pages, activeId };
    }
  } catch {
    // No saved draft, or storage is unavailable - start fresh.
  }
  return freshLetter();
}

// All letter data, auto-saved on this device so a reload (which iOS does often
// to background tabs) never loses work.
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

  const updatePage = useCallback((id, patch) => {
    setLetter((l) => ({ ...l, pages: l.pages.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));
  }, []);

  const addPage = useCallback(() => {
    setLetter((l) => {
      const current = l.pages.find((p) => p.id === l.activeId) ?? l.pages[l.pages.length - 1];
      const page = makePage(current);
      return { pages: [...l.pages, page], activeId: page.id };
    });
  }, []);

  const removePage = useCallback((id) => {
    setLetter((l) => {
      if (l.pages.length <= 1) return l;
      const index = l.pages.findIndex((p) => p.id === id);
      const pages = l.pages.filter((p) => p.id !== id);
      const activeId = l.activeId === id ? pages[Math.max(0, index - 1)].id : l.activeId;
      return { pages, activeId };
    });
  }, []);

  const setActive = useCallback((id) => setLetter((l) => ({ ...l, activeId: id })), []);

  const reset = useCallback(() => setLetter(freshLetter()), []);

  const activeIndex = Math.max(0, letter.pages.findIndex((p) => p.id === letter.activeId));

  return {
    pages: letter.pages,
    activeIndex,
    activePage: letter.pages[activeIndex],
    updatePage,
    addPage,
    removePage,
    setActive,
    reset,
  };
}
