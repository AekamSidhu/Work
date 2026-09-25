import { useState } from 'react';
import { EditorContent } from '@tiptap/react';
import Toolbar from '../editor/Toolbar.jsx';
import { useLetterEditor } from '../editor/useLetterEditor.js';
import PageTabs from '../components/PageTabs.jsx';
import LetterDetails from '../components/LetterDetails.jsx';
import Icon from '../components/Icon.jsx';
import LetterPage from '../letter/LetterPage.jsx';
import ScaledPage from '../letter/ScaledPage.jsx';
import { confirmNewLetter } from '../hooks/hooks.js';

const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
const mod = isMac ? '⌘' : 'Ctrl';

export default function DesktopApp({ letter, onExport, onSwitchView }) {
  const { pages, activeIndex, activePage, updatePage, setActive } = letter;
  const [overflowing, setOverflowing] = useState({});
  const onFit = (id, over) => setOverflowing((o) => (o[id] === over ? o : { ...o, [id]: over }));

  const editor = useLetterEditor({
    page: activePage,
    onChange: (html) => updatePage(activePage.id, { html }),
  });

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
          <button type="button" className="btn btn-ghost" onClick={() => confirmNewLetter(letter.reset)}>
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
          <PageTabs letter={letter} />

          <div className="card editor-card">
            <Toolbar editor={editor} variant="desktop" popoverSide="below" />
            <EditorContent editor={editor} className="editor-box" />
          </div>
          <p className="d-hint">
            Select text, then use the toolbar. Shortcuts: <kbd>{mod}</kbd>+<kbd>B</kbd> bold, <kbd>{mod}</kbd>+
            <kbd>I</kbd> italic, <kbd>{mod}</kbd>+<kbd>U</kbd> underline, <kbd>{mod}</kbd>+<kbd>Z</kbd> undo.
          </p>

          <div className="card">
            <h2 className="card-title">Details for page {activeIndex + 1}</h2>
            <LetterDetails page={activePage} onChange={(patch) => updatePage(activePage.id, patch)} />
          </div>

          <footer className="app-foot app-foot-left">
            <p>Your letter is saved automatically in this browser.</p>
            <button type="button" className="link-button" onClick={onSwitchView}>
              <Icon name="phone" size={15} /> Switch to phone view
            </button>
          </footer>
        </section>

        <section className="d-right" aria-label="Preview">
          {pages.map((page, i) => (
            <div key={page.id} className={`d-preview ${i === activeIndex ? 'is-active' : ''}`}>
              <button type="button" className="preview-label" onClick={() => setActive(page.id)}>
                <span>
                  Page {i + 1} of {pages.length}
                </span>
                {i === activeIndex ? <em>Editing</em> : <em className="muted">Click to edit</em>}
              </button>
              {overflowing[page.id] && (
                <p className="warning">Too much text for one page. Move some of it to a new page.</p>
              )}
              <div className="paper" onClick={() => setActive(page.id)}>
                <ScaledPage>
                  <LetterPage page={page} onFit={onFit} />
                </ScaledPage>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
