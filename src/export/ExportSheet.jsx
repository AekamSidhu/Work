import { downloadFiles, formatFileSize } from '../letter/exportLetter.js';
import Icon from '../components/Icon.jsx';

function canShareFiles(files) {
  try {
    return typeof navigator.canShare === 'function' && navigator.canShare({ files });
  } catch {
    return false;
  }
}

function Busy({ kind }) {
  return (
    <div className="busy" role="status" aria-live="polite">
      <div className="busy-card">
        <span className="spinner" aria-hidden="true" />
        <p>{kind === 'pdf' ? 'Making your PDF…' : 'Making your image…'}</p>
      </div>
    </div>
  );
}

function Sheet({ onClose, children }) {
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-grip" aria-hidden="true" />
        {children}
      </div>
    </div>
  );
}

// Shows progress while a file is being made, then (on phones) the result with
// big Share / Open buttons.
export default function ExportSheet({ job, onClose }) {
  if (!job) return null;
  if (job.status === 'working') return <Busy kind={job.kind} />;

  if (job.status === 'error') {
    return (
      <Sheet onClose={onClose}>
        <h2 className="sheet-title">Something went wrong</h2>
        <p className="sheet-text">The file could not be made. Please try again.</p>
        <button type="button" className="btn btn-primary btn-block" onClick={onClose}>
          OK
        </button>
      </Sheet>
    );
  }

  const { files, urls, kind } = job;
  const isPdf = kind === 'pdf';
  const shareable = canShareFiles(files);
  const totalSize = files.reduce((sum, f) => sum + f.size, 0);

  const share = async () => {
    try {
      await navigator.share({ files });
    } catch (error) {
      if (error?.name !== 'AbortError') downloadFiles(files);
    }
  };

  return (
    <Sheet onClose={onClose}>
      <h2 className="sheet-title">
        <span className="sheet-check" aria-hidden="true">
          <Icon name="check" size={18} />
        </span>
        {isPdf ? 'Your PDF is ready' : files.length > 1 ? 'Your images are ready' : 'Your image is ready'}
      </h2>

      {isPdf ? (
        <div className="sheet-file">
          <Icon name="file" size={28} />
          <div>
            <strong>{files[0].name}</strong>
            <span>
              {job.layout.pages.length} {job.layout.pages.length === 1 ? 'page' : 'pages'} · {formatFileSize(totalSize)}
            </span>
          </div>
        </div>
      ) : (
        <>
          <div className="sheet-images">
            {urls.map((url, i) => (
              <img key={url} src={url} alt={`Page ${i + 1}`} />
            ))}
          </div>
          <p className="sheet-tip">Tip: press and hold an image to save it to Photos.</p>
        </>
      )}

      <div className="sheet-actions">
        {shareable ? (
          <button type="button" className="btn btn-primary btn-block btn-lg" onClick={share}>
            <Icon name="share" /> Share or Save
          </button>
        ) : (
          <button type="button" className="btn btn-primary btn-block btn-lg" onClick={() => downloadFiles(files)}>
            <Icon name="download" /> Download
          </button>
        )}
        {shareable && <p className="sheet-hint">Send on WhatsApp, save to Files, email or print.</p>}
        {isPdf && (
          <a className="btn btn-secondary btn-block" href={urls[0]} target="_blank" rel="noopener">
            Open PDF
          </a>
        )}
        <button type="button" className="btn btn-ghost btn-block" onClick={onClose}>
          Close
        </button>
      </div>
    </Sheet>
  );
}
