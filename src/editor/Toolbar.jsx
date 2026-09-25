import { useEffect, useRef, useState } from 'react';
import { useEditorState } from '@tiptap/react';
import { COLORS, FONT_SIZES, toHexColor } from './formatting.js';
import Icon from '../components/Icon.jsx';

// Stops toolbar taps from taking focus away from the text, so the selection
// (and the phone keyboard) stay put.
const keepFocus = (e) => e.preventDefault();

function ToolButton({ label, pressed, expanded, disabled, onClick, className = '', children }) {
  return (
    <button
      type="button"
      className={`tb-btn ${className}`}
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      aria-expanded={expanded}
      disabled={disabled}
      onMouseDown={keepFocus}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

// variant "mobile": compact, big tap targets, a "more" menu, optional Done button.
// variant "desktop": every action visible, a size label and a custom color picker.
// popoverSide: where the panels open ("below" or "above" the bar).
export default function Toolbar({ editor, variant = 'mobile', popoverSide = 'below', onDone }) {
  const [open, setOpen] = useState(null); // 'size' | 'color' | 'more' | null
  const rootRef = useRef(null);
  const customColorRef = useRef(null);
  const desktop = variant === 'desktop';

  const state = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e
        ? {
            bold: e.isActive('bold'),
            italic: e.isActive('italic'),
            underline: e.isActive('underline'),
            color: toHexColor(e.getAttributes('textStyle').color),
            fontSize: e.getAttributes('textStyle').fontSize ?? null,
            empty: e.state.selection.empty,
            canUndo: e.can().undo(),
            canRedo: e.can().redo(),
          }
        : null,
  });

  // Close an open panel when tapping anywhere else.
  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(null);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  // Custom color (PC only): apply once the color picker closes.
  useEffect(() => {
    const input = customColorRef.current;
    if (!input || !editor) return undefined;
    const onChange = () => {
      editor.chain().focus().setColor(input.value).run();
      setOpen(null);
    };
    input.addEventListener('change', onChange);
    return () => input.removeEventListener('change', onChange);
  }, [open, editor]);

  if (!editor || !state) return null;

  const apply = (command) => {
    command(editor.chain().focus()).run();
    setOpen(null);
  };
  const toggle = (panel) => setOpen((current) => (current === panel ? null : panel));
  const currentSize = FONT_SIZES.find((s) => s.value === state.fontSize) ?? FONT_SIZES[1];
  const hint = state.empty && (
    <p className="tb-pop-hint">Select some text first — or pick now and keep typing.</p>
  );
  const clearFormatting = () => apply((c) => c.unsetAllMarks());
  const newPage = () => apply((c) => c.setPageBreak());

  return (
    <div className={`toolbar toolbar-${variant}`} ref={rootRef}>
      <div className="tb-row" role="toolbar" aria-label="Text formatting">
        <ToolButton label="Bold" pressed={state.bold} onClick={() => apply((c) => c.toggleBold())}>
          <span className="tb-glyph tb-bold">B</span>
        </ToolButton>
        <ToolButton label="Italic" pressed={state.italic} onClick={() => apply((c) => c.toggleItalic())}>
          <span className="tb-glyph tb-italic">I</span>
        </ToolButton>
        <ToolButton label="Underline" pressed={state.underline} onClick={() => apply((c) => c.toggleUnderline())}>
          <span className="tb-glyph tb-underline">U</span>
        </ToolButton>

        <span className="tb-sep" aria-hidden="true" />

        <ToolButton
          label="Text size"
          expanded={open === 'size'}
          className={`tb-menu ${open === 'size' ? 'is-open' : ''}`}
          onClick={() => toggle('size')}
        >
          <span className="tb-size-glyph" aria-hidden="true">
            <small>A</small>A
          </span>
          {desktop && <span className="tb-caption">{currentSize.label}</span>}
        </ToolButton>
        <ToolButton
          label="Text color"
          expanded={open === 'color'}
          className={`tb-menu ${open === 'color' ? 'is-open' : ''}`}
          onClick={() => toggle('color')}
        >
          <span className="tb-color-glyph" aria-hidden="true">
            A<span style={{ background: state.color || '#111' }} />
          </span>
        </ToolButton>

        <span className="tb-sep" aria-hidden="true" />

        {desktop && (
          <>
            <ToolButton label="Remove styling" onClick={clearFormatting}>
              <Icon name="eraser" />
            </ToolButton>
            <ToolButton label="Start a new page here" onClick={newPage} className="tb-wide">
              <Icon name="newPage" />
              <span className="tb-caption">New page</span>
            </ToolButton>
            <span className="tb-sep" aria-hidden="true" />
          </>
        )}

        <ToolButton label="Undo" disabled={!state.canUndo} onClick={() => apply((c) => c.undo())}>
          <Icon name="undo" />
        </ToolButton>
        {desktop ? (
          <ToolButton label="Redo" disabled={!state.canRedo} onClick={() => apply((c) => c.redo())}>
            <Icon name="redo" />
          </ToolButton>
        ) : (
          <ToolButton
            label="More"
            expanded={open === 'more'}
            className={`tb-menu ${open === 'more' ? 'is-open' : ''}`}
            onClick={() => toggle('more')}
          >
            <Icon name="more" />
          </ToolButton>
        )}

        {onDone && (
          <button type="button" className="tb-done" onMouseDown={keepFocus} onClick={onDone}>
            Done
          </button>
        )}
      </div>

      {open === 'size' && (
        <div className={`tb-pop tb-pop-${popoverSide}`}>
          <p className="tb-pop-title">Text size</p>
          {hint}
          <div className="tb-sizes">
            {FONT_SIZES.map((size) => (
              <button
                key={size.label}
                type="button"
                className="tb-size-opt"
                aria-pressed={size === currentSize}
                onMouseDown={keepFocus}
                onClick={() => apply((c) => (size.value ? c.setFontSize(size.value) : c.unsetFontSize()))}
              >
                <span style={{ fontSize: `${Math.round(17 * size.scale)}px` }}>Aa</span>
                <small>{size.label}</small>
              </button>
            ))}
          </div>
        </div>
      )}

      {open === 'color' && (
        <div className={`tb-pop tb-pop-${popoverSide}`}>
          <p className="tb-pop-title">Text color</p>
          {hint}
          <div className="tb-swatches">
            {COLORS.map((color) => (
              <button
                key={color.name}
                type="button"
                className="tb-swatch"
                style={{ '--swatch': color.value ?? '#111111' }}
                aria-label={color.name}
                title={color.name}
                aria-pressed={state.color === color.value}
                onMouseDown={keepFocus}
                onClick={() => apply((c) => (color.value ? c.setColor(color.value) : c.unsetColor()))}
              />
            ))}
            {desktop && (
              <label className="tb-swatch tb-swatch-custom" title="Choose any color">
                <input ref={customColorRef} type="color" defaultValue={state.color || '#1b2a9c'} aria-label="Choose any color" />
              </label>
            )}
          </div>
        </div>
      )}

      {open === 'more' && (
        <div className={`tb-pop tb-pop-${popoverSide}`}>
          <div className="tb-list">
            <button type="button" onMouseDown={keepFocus} onClick={newPage}>
              <Icon name="newPage" />
              <span>
                Start a new page here
                <small>Text after the cursor moves to the next page</small>
              </span>
            </button>
            <button type="button" onMouseDown={keepFocus} onClick={clearFormatting}>
              <Icon name="eraser" />
              <span>
                Remove styling
                <small>Makes the selected text plain again</small>
              </span>
            </button>
            <button type="button" onMouseDown={keepFocus} disabled={!state.canRedo} onClick={() => apply((c) => c.redo())}>
              <Icon name="redo" />
              <span>Redo</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
