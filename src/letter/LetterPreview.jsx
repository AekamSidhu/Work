import LetterPage from './LetterPage.jsx';
import ScaledPage from './ScaledPage.jsx';

// Every page of the letter, shrunk to fit the screen. Updates live as you type.
export default function LetterPreview({ letter, layout }) {
  const count = layout.pages.length;
  return layout.pages.map((page, i) => (
    <section key={i} className="preview-item" aria-label={`Page ${i + 1} of ${count}`}>
      {count > 1 && (
        <p className="preview-label">
          Page {i + 1} of {count}
        </p>
      )}
      <div className="paper">
        <ScaledPage>
          <LetterPage page={page} fontSize={layout.fontSize} letter={letter} />
        </ScaledPage>
      </div>
    </section>
  ));
}
