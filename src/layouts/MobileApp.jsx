import { useRef, useState } from 'react';
import { EditorContent } from '@tiptap/react';
import Toolbar from '../editor/Toolbar.jsx';
import { useLetterEditor } from '../editor/useLetterEditor.js';
import KeyboardDock from '../components/KeyboardDock.jsx';
import LetterDetails from '../components/LetterDetails.jsx';
import Icon from '../components/Icon.jsx';
import LetterPreview from '../letter/LetterPreview.jsx';
import { confirmNewLetter, useKeyboardOpen, useLingering } from '../hooks/hooks.js';

// Phone layout: one scrolling screen - write, details, then a live preview.
export default function MobileApp({ letter, update, reset, layout, onExport, onSwitchView }) {
  const [focused, setFocused] = useState(false);
  const docked = useLingering(focused, 250);
  const keyboardOpen = useKeyboardOpen();
  const previewRef = useRef(null);
  const pageCount = layout.pages.length;

  const editor = useLetterEditor({
    letter,
    onChange: (html) => update({ html }),
    onFocusChange: setFocused,
    bottomSpace: 110,
  });

  const showPreview = () => previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <div className="m-app">
      <header className="m-header">
        <img className="m-logo" src="/apple-touch-icon.png" alt="" width="40" height="40" />
        <div className="m-title">
          <h1>CRSA Letters</h1>
          <p>Chandigarh Roller Skating Association</p>
        </div>
        <button type="button" className="m-new" onClick={() => confirmNewLetter(reset)}>
          <Icon name="refresh" size={16} /> New
        </button>
      </header>

      <main className="m-main">
        <section className="card editor-card" aria-label="Letter text">
          <div className="tb-slot">
            {docked ? (
              <p className="tb-slot-note">Styling tools are above the keyboard</p>
            ) : (
              <Toolbar editor={editor} variant="mobile" popoverSide="below" />
            )}
          </div>
          <EditorContent editor={editor} className="editor-box" />
        </section>

        <div className="m-hint-row">
          <p className="m-hint">Select words, then tap B, U, size or color.</p>
          <button type="button" className="m-jump" onClick={showPreview}>
            Preview{pageCount > 1 ? ` · ${pageCount} pages` : ''} <Icon name="arrowDown" size={16} />
          </button>
        </div>

        <section className="card">
          <h2 className="card-title">Details</h2>
          <LetterDetails letter={letter} onChange={update} />
        </section>

        <section className="m-preview" ref={previewRef} aria-label="Live preview">
          <div className="m-preview-head">
            <h2>Live preview</h2>
            <span>{pageCount === 1 ? '1 page' : `${pageCount} pages`}</span>
          </div>
          <LetterPreview letter={letter} layout={layout} />
          <p className="m-hint m-hint-center">Pinch with two fingers to zoom in.</p>
        </section>
      </main>

      <footer className="app-foot">
        <p>Your letter is saved automatically on this phone.</p>
        <button type="button" className="link-button" onClick={onSwitchView}>
          <Icon name="monitor" size={15} /> Switch to PC view
        </button>
      </footer>

      <div className={`m-actions ${keyboardOpen ? 'is-hidden' : ''}`}>
        <button type="button" className="btn btn-primary btn-lg" onClick={() => onExport('pdf')}>
          <Icon name="file" /> PDF
        </button>
        <button type="button" className="btn btn-secondary btn-lg" onClick={() => onExport('image')}>
          <Icon name="image" /> Image
        </button>
      </div>

      {docked && (
        <KeyboardDock>
          <Toolbar editor={editor} variant="mobile" popoverSide="above" onDone={() => editor.commands.blur()} />
        </KeyboardDock>
      )}
    </div>
  );
}
