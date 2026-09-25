import { EditorContent } from '@tiptap/react';
import Toolbar from '../editor/Toolbar.jsx';
import { useLetterEditor } from '../editor/useLetterEditor.js';
import LetterDetails from '../components/LetterDetails.jsx';
import Icon from '../components/Icon.jsx';
import LetterPreview from '../letter/LetterPreview.jsx';
import { confirmNewLetter } from '../hooks/hooks.js';

const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
const mod = isMac ? '⌘' : 'Ctrl';

// PC layout: writing on the left, live preview of every page on the right.
export default function DesktopApp({ letter, update, reset, layout, onExport, onSwitchView }) {
  const editor = useLetterEditor({ letter, onChange: (html) => update({ html }) });

  return (
    <div className="d-app">
      <header className="d-header">
        <div className="d-brand">
          <img src="/apple-touch-icon.png" alt="" width="44" height="44" />
          <div>
            <h1>CRSA Letter Generator</h1>
            <p>Chandigarh Roller Skating Association</p>
          </div>
        </div>
        <div className="d-actions">
          <button type="button" className="btn btn-ghost" onClick={() => confirmNewLetter(reset)}>
            <Icon name="refresh" size={18} /> New letter
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => onExport('image')}>
            <Icon name="image" size={18} /> Download image
          </button>
          <button type="button" className="btn btn-primary" onClick={() => onExport('pdf')}>
            <Icon name="download" size={18} /> Download PDF
          </button>
        </div>
      </header>

      <main className="d-main">
        <section className="d-left" aria-label="Write the letter">
          <div className="card editor-card">
            <Toolbar editor={editor} variant="desktop" popoverSide="below" />
            <EditorContent editor={editor} className="editor-box" />
          </div>
          <p className="d-hint">
            Select text, then use the toolbar. Long letters continue onto a new page by themselves. Shortcuts:{' '}
            <kbd>{mod}</kbd>+<kbd>B</kbd> bold, <kbd>{mod}</kbd>+<kbd>I</kbd> italic, <kbd>{mod}</kbd>+<kbd>U</kbd>{' '}
            underline, <kbd>{mod}</kbd>+<kbd>Z</kbd> undo.
          </p>

          <div className="card">
            <h2 className="card-title">Letter details</h2>
            <LetterDetails letter={letter} onChange={update} />
          </div>

          <footer className="app-foot app-foot-left">
            <p>Your letter is saved automatically in this browser.</p>
            <button type="button" className="link-button" onClick={onSwitchView}>
              <Icon name="phone" size={15} /> Switch to phone view
            </button>
          </footer>
        </section>

        <section className="d-right" aria-label="Live preview">
          <LetterPreview letter={letter} layout={layout} />
        </section>
      </main>
    </div>
  );
}
