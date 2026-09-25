import StarterKit from '@tiptap/starter-kit';
import { Color, FontSize, TextStyle } from '@tiptap/extension-text-style';
import { Placeholder } from '@tiptap/extensions';
import { Fragment, Slice } from '@tiptap/pm/model';

export const extensions = [
  StarterKit.configure({
    // Only what a letter needs: paragraphs, lists, bold, italic, underline, undo.
    heading: false,
    blockquote: false,
    code: false,
    codeBlock: false,
    horizontalRule: false,
    strike: false,
    link: false,
  }),
  TextStyle,
  Color,
  FontSize,
  Placeholder.configure({ placeholder: 'Type or paste your letter here…' }),
];

// Pasting plain text (e.g. from WhatsApp): keep every line and blank line as-is.
// By default blank lines would be dropped, squashing paragraphs together.
export function clipboardTextParser(text, $context, _plain, view) {
  const { schema } = view.state;
  const marks = $context.marks();
  const lines = text.replace(/\r\n?/g, '\n').split('\n');
  const paragraphs = lines.map((line) => schema.nodes.paragraph.create(null, line ? schema.text(line, marks) : null));
  return new Slice(Fragment.from(paragraphs), 1, 1);
}

const PASTED_STYLES_TO_DROP = ['color', 'font-size', 'font-family', 'background', 'background-color', 'line-height'];

// Pasting from websites, Word or Google Docs: drop their fonts, sizes and colors
// so the letter stays consistent. Copy/paste inside the editor keeps formatting.
export function transformPastedHTML(html) {
  if (html.includes('data-pm-slice')) return html;
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('[style]').forEach((el) => {
    PASTED_STYLES_TO_DROP.forEach((prop) => el.style.removeProperty(prop));
    if (!el.getAttribute('style').trim()) el.removeAttribute('style');
  });
  return doc.body.innerHTML;
}
