import { useState } from 'react';
import { EditorContent } from '@tiptap/react';
import Toolbar from '../editor/Toolbar.jsx';
import { useLetterEditor } from '../editor/useLetterEditor.js';
import KeyboardDock from '../components/KeyboardDock.jsx';
import PageTabs from '../components/PageTabs.jsx';
import LetterDetails from '../components/LetterDetails.jsx';
import Icon from '../components/Icon.jsx';
import LetterPage from '../letter/LetterPage.jsx';
import ScaledPage from '../letter/ScaledPage.jsx';
import { confirmNewLetter, useKeyboardOpen, useLingering } from '../hooks/hooks.js';

function WriteTab({ letter }) {
  const { activePage, updatePage } = letter;
  const [focused, setFocused] = useState(false);
  const docked = useLingering(focused, 250);

  const editor = useLetterEditor({
    page: activePage,
    onChange: (html) => updatePage(activePage.id, { html }),
    onFocusChange: setFocused,
    bottomSpace: 110,
  });

  return (
    <main className="m-main">
      <PageTabs letter={letter} />

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
      <p className="m-hint">Select any words, then tap B, U, size or color to style them.</p>

      <section className="card">
        <h2 className="card-title">Details</h2>
        <LetterDetails page={activePage} onChange={(patch) => updatePage(activePage.id, patch)} />
      </section>

      {docked && (
        <KeyboardDock>
          <Toolbar editor={editor} variant="mobile" popoverSide="above" onDone={() => editor.commands.blur()} />
        </KeyboardDock>
      )}
    </main>
  );
}

function PreviewTab({ letter, onEdit }) {
  const { pages } = letter;
  const [overflowing, setOverflowing] = useState({});
  const onFit = (id, over) => setOverflowing((o) => (o[id] === over ? o : { ...o, [id]: over }));

  return (
    <main className="m-main">
      {pages.map((page, i) => (
        <section key={page.id} className="preview-item">
          <div className="preview-label">
            <span>
              Page {i + 1} of {pages.length}
            </span>
            <button type="button" className="link-button" onClick={() => onEdit(page.id)}>
              <Icon name="pen" size={15} /> Edit
            </button>
          </div>
          {overflowing[page.id] && (
            <p className="warning">Too much text for one page. Move some of it to a new page.</p>
          )}
          <div className="paper">
            <ScaledPage>
              <LetterPage page={page} onFit={onFit} />
            </ScaledPage>
          </div>
        </section>
      ))}
      <p className="m-hint m-hint-center">Pinch with two fingers to zoom in.</p>
    </main>
  );
}

export default function MobileApp({ letter, onExport, onSwitchView }) {
  const [tab, setTab] = useState('write');
  const keyboardOpen = useKeyboardOpen();

  const editPage = (id) => {
    letter.setActive(id);
    setTab('write');
    window.scrollTo(0, 0);
  };

  return (
    <div className="m-app">
      <header className="m-header">
        <img className="m-logo" src="/apple-touch-icon.png" alt="" width="40" height="40" />
        <div className="m-title">
          <h1>CRSA Letters</h1>
          <p>Chandigarh Roller Skating Association</p>
        </div>
        <button type="button" className="m-new" onClick={() => confirmNewLetter(letter.reset)}>
          <Icon name="refresh" size={16} /> New
        </button>
      </header>

      <div className="m-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'write'} onClick={() => setTab('write')}>
          <Icon name="pen" size={17} /> Write
        </button>
        <button type="button" role="tab" aria-selected={tab === 'preview'} onClick={() => setTab('preview')}>
          <Icon name="eye" size={17} /> Preview
        </button>
      </div>

      {tab === 'write' ? <WriteTab letter={letter} /> : <PreviewTab letter={letter} onEdit={editPage} />}

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
    </div>
  );
}
