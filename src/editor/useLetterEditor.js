import { useRef } from 'react';
import { useEditor } from '@tiptap/react';
import { clipboardTextParser, extensions, transformPastedHTML } from './extensions.js';

// The rich-text editor for the whole letter. It is rebuilt only when a new
// letter is started, so undo never brings back an old letter.
export function useLetterEditor({ letter, onChange, onFocusChange, bottomSpace = 24 }) {
  const callbacks = useRef({ onChange, onFocusChange });
  callbacks.current = { onChange, onFocusChange };

  const margin = { top: 24, bottom: bottomSpace, left: 0, right: 0 };

  return useEditor(
    {
      extensions,
      content: letter.html || '',
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
    [letter.id],
  );
}
