import { useRef } from 'react';
import { useEditor } from '@tiptap/react';
import { clipboardTextParser, extensions, transformPastedHTML } from './extensions.js';

// One rich-text editor for the page being edited. It is rebuilt when you switch
// pages, so undo never jumps into another page's text.
export function useLetterEditor({ page, onChange, onFocusChange, bottomSpace = 24 }) {
  const callbacks = useRef({ onChange, onFocusChange });
  callbacks.current = { onChange, onFocusChange };

  const margin = { top: 24, bottom: bottomSpace, left: 0, right: 0 };

  return useEditor(
    {
      extensions,
      content: page.html || '',
      shouldRerenderOnTransaction: false,
      editorProps: {
        attributes: {
          class: 'rich-editor',
          'aria-label': 'Letter text',
          autocapitalize: 'sentences',
          autocorrect: 'on',
          spellcheck: 'true',
        },
        clipboardTextParser,
        transformPastedHTML,
        // Keep the cursor clear of the formatting bar that sits above the keyboard.
        scrollMargin: margin,
        scrollThreshold: margin,
      },
      onUpdate: ({ editor }) => callbacks.current.onChange?.(editor.getHTML()),
      onFocus: () => callbacks.current.onFocusChange?.(true),
      onBlur: () => callbacks.current.onFocusChange?.(false),
    },
    [page.id],
  );
}
