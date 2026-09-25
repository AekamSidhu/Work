import { ROLES } from '../letter/constants.js';
import { todayISO } from '../state/dates.js';

// CRSA No., date and signature settings for one page.
export default function LetterDetails({ page, onChange }) {
  const date = page.date || todayISO();
  const isCustomDate = Boolean(page.date) && page.date !== todayISO();

  return (
    <div className="details">
      <div className="details-row">
        <label className="field">
          <span className="field-label">CRSA No.</span>
          <input
            type="text"
            value={page.number}
            onChange={(e) => onChange({ number: e.target.value })}
            placeholder="e.g. 245"
            autoComplete="off"
            enterKeyHint="done"
          />
        </label>
        <label className="field">
          <span className="field-label">Date</span>
          <input type="date" value={date} onChange={(e) => onChange({ date: e.target.value || null })} />
        </label>
      </div>
      {isCustomDate && (
        <button type="button" className="link-button" onClick={() => onChange({ date: null })}>
          Use today’s date
        </button>
      )}

      <div className="field">
        <span className="field-label" id={`signed-by-${page.id}`}>
          Signed by
        </span>
        <div className="segmented" role="group" aria-labelledby={`signed-by-${page.id}`}>
          {Object.entries(ROLES).map(([key, role]) => (
            <button
              key={key}
              type="button"
              aria-pressed={page.role === key}
              onClick={() => onChange({ role: key, includeSignature: true })}
            >
              {role.label}
            </button>
          ))}
        </div>
      </div>

      <label className="switch-row">
        <span>
          <strong>Include signature</strong>
          <small>Signature and stamp at the end of the letter</small>
        </span>
        <input
          type="checkbox"
          className="switch"
          checked={page.includeSignature}
          onChange={(e) => onChange({ includeSignature: e.target.checked })}
        />
      </label>
    </div>
  );
}
