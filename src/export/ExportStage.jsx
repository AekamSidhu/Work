import { createPortal } from 'react-dom';
import LetterPage from '../letter/LetterPage.jsx';

// Full-size, un-scaled copies of the pages that the PDF / image is made from.
// Only mounted while a file is being made; hidden behind the "working" overlay.
export default function ExportStage({ stageRef, pages }) {
  return createPortal(
    <div className="export-stage" ref={stageRef} aria-hidden="true">
      {pages.map((page) => (
        <LetterPage key={page.id} page={page} />
      ))}
    </div>,
    document.body,
  );
}
