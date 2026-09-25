import HorizontalRule from '@tiptap/extension-horizontal-rule';

export const PAGE_BREAK_HTML = '<div data-page-break="true"></div>';

// "Start a new page here". Behaves like a horizontal rule in the editor (so
// the cursor lands on the line after it) and shows as a labelled divider.
export const PageBreak = HorizontalRule.extend({
  name: 'pageBreak',

  parseHTML() {
    return [{ tag: 'div[data-page-break]' }];
  },

  renderHTML() {
    return ['div', { 'data-page-break': 'true', class: 'page-break', contenteditable: 'false' }];
  },

  addInputRules() {
    return [];
  },

  addCommands() {
    return {
      ...this.parent?.(),
      setPageBreak:
        () =>
        ({ commands }) =>
          commands.setHorizontalRule(),
    };
  },
});
