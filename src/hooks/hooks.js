import { useEffect, useState, useSyncExternalStore } from 'react';

export function useMediaQuery(query) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
  );
}

// Stays true for `delay` ms after `value` turns false. Keeps the keyboard
// toolbar on screen through the brief blur some phones fire on a toolbar tap.
export function useLingering(value, delay) {
  const [lingering, setLingering] = useState(value);
  useEffect(() => {
    if (value) {
      setLingering(true);
      return undefined;
    }
    const timer = setTimeout(() => setLingering(false), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return value || lingering;
}

const NON_TYPING_INPUTS = new Set(['checkbox', 'radio', 'button', 'submit', 'date', 'color', 'range', 'file']);

function isTypingTarget(el) {
  if (!el) return false;
  if (el.isContentEditable || el.tagName === 'TEXTAREA') return true;
  return el.tagName === 'INPUT' && !NON_TYPING_INPUTS.has(el.type);
}

// True while the phone keyboard is likely open (a text field has focus).
export function useKeyboardOpen() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const check = () => setOpen(isTypingTarget(document.activeElement));
    const onFocusOut = () => setTimeout(check, 0);
    document.addEventListener('focusin', check);
    document.addEventListener('focusout', onFocusOut);
    return () => {
      document.removeEventListener('focusin', check);
      document.removeEventListener('focusout', onFocusOut);
    };
  }, []);
  return open;
}

export function confirmNewLetter(reset) {
  if (window.confirm('Start a new letter? This clears the current letter from this device.')) reset();
}
