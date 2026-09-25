import { ROLES } from '../letter/constants.js';
import { todayISO } from '../state/dates.js';

// CRSA No., date and signature settings for the letter.
export default function LetterDetails({ letter, onChange }) {
  const date = letter.date || todayISO();
  const isCustomDate = Boolean(letter.date) && letter.date !== todayISO();

  return (
    <div className="details">
      <div className="details-row">
        <label className="field">
          <span className="field-label">CRSA No.</span>
          <input
            type="text"
            value={letter.number}
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
        <span className="field-label" id="signed-by">
          Signed by
        </span>
        <div className="segmented" role="group" aria-labelledby="signed-by">
          {Object.entries(ROLES).map(([key, role]) => (
            <button
              key={key}
              type="button"
              aria-pressed={letter.role === key}
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
          <small>Signature and stamp at the end of the last page</small>
        </span>
        <input
          type="checkbox"
          className="switch"
          checked={letter.includeSignature}
          onChange={(e) => onChange({ includeSignature: e.target.checked })}
        />
      </label>
    </div>
  );
}
