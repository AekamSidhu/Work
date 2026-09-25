import {
  BASE_FONT_SIZE,
  MIN_FONT_SIZE,
  PAGE_BOTTOM,
  SIGNATURE_GAP,
  TEXT_TOP,
  signatureImageHeight,
} from './constants.js';

// Splits the letter into pages.
//
// 1. Try to fit everything on one page, shrinking the text from 16px to 12px.
// 2. If it doesn't fit even at 12px, it flows onto more pages: long paragraphs
//    are split between lines, and the text size is the largest that still
//    needs no extra pages.
// 3. The signature goes only on the last page, in space reserved for it, so
//    text never runs underneath it.
//
// Pages are measured in a hidden copy of the letter that uses the same CSS as
// the real pages, so what is measured is exactly what is drawn.

const FULL_HEIGHT = PAGE_BOTTOM - TEXT_TOP;
const EPSILON = 0.5;

export function createMeasurer() {
  const page = document.createElement('div');
  page.className = 'letter-page letter-measure';
  page.setAttribute('aria-hidden', 'true');
  const text = document.createElement('div');
  text.className = 'lp-text';
  const signText = document.createElement('div');
  signText.className = 'lp-sign-text';
  page.append(text, signText);
  document.body.appendChild(page);
  return { text, signText, destroy: () => page.remove() };
}

const isPageBreak = (node) => node.nodeType === 1 && node.hasAttribute('data-page-break');
const isBlank = (el) => !el.textContent.trim() && !el.querySelector('img');
const height = (el) => el.getBoundingClientRect().height;

// The letter HTML, cut into runs of blocks at manual page breaks.
function parseSections(html) {
  const template = document.createElement('template');
  template.innerHTML = html || '';
  const sections = [[]];
  for (const node of template.content.childNodes) {
    if (isPageBreak(node)) sections.push([]);
    else if (node.nodeType === 1) sections[sections.length - 1].push(node);
  }
  // Empty lines at the very end never push text onto an extra page.
  for (const section of sections) {
    while (section.length && isBlank(section[section.length - 1])) section.pop();
  }
  return sections;
}

// The text carried over to the next page shouldn't start with the space the line wrapped at.
function trimLeadingSpace(el) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    node.data = node.data.replace(/^\s+/, '');
    if (node.data) return;
  }
}

// Index of every character inside `el`, so we can binary-search positions.
function indexText(el) {
  const nodes = [];
  let total = 0;
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (!node.data.length) continue;
    nodes.push({ node, start: total });
    total += node.data.length;
  }
  // Position just after the first `count` characters.
  const after = (count) => {
    for (let i = nodes.length - 1; i >= 0; i--) {
      if (nodes[i].start < count) return { node: nodes[i].node, offset: count - nodes[i].start };
    }
    return { node: nodes[0].node, offset: 0 };
  };
  // Position just before character `index`.
  const before = (index) => {
    for (let i = nodes.length - 1; i >= 0; i--) {
      if (nodes[i].start <= index) return { node: nodes[i].node, offset: index - nodes[i].start };
    }
    return { node: nodes[0].node, offset: 0 };
  };
  return { nodes, total, after, before };
}

// Cuts `el` just before its first line that ends below `limit` (a screen y).
// Returns [part that fits, rest], or null if not even the first line fits.
function splitToFit(el, limit) {
  const index = indexText(el);
  if (!index.total) return null;
  const range = document.createRange();
  const start = index.nodes[0];

  // Bottom of everything from the start of `el` up to `count` characters.
  // It only grows as `count` grows, so it can be binary-searched.
  const bottomAfter = (count) => {
    const end = index.after(count);
    range.setStart(start.node, 0);
    range.setEnd(end.node, end.offset);
    return range.getBoundingClientRect().bottom;
  };
  const charRect = (i) => {
    const a = index.before(i);
    const b = index.after(i + 1);
    range.setStart(a.node, a.offset);
    range.setEnd(b.node, b.offset);
    return range.getBoundingClientRect();
  };

  if (bottomAfter(index.total) <= limit + EPSILON) return null;

  // First character that sticks out below the limit.
  let lo = 1;
  let hi = index.total;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (bottomAfter(mid) > limit + EPSILON) hi = mid;
    else lo = mid + 1;
  }
  let first = lo - 1;

  // Walk back to the start of that character's line.
  let current = charRect(first);
  while (first > 0) {
    const prev = charRect(first - 1);
    const sameLine = prev.left <= current.left + EPSILON && prev.bottom > current.top + 1 && prev.top < current.bottom - 1;
    const empty = !prev.width && !prev.height;
    if (!sameLine && !empty) break;
    first -= 1;
    if (!empty) current = prev;
  }
  if (first <= 0) return null;

  const cut = index.before(first);
  const head = document.createRange();
  head.setStart(el, 0);
  head.setEnd(cut.node, cut.offset);
  const tail = document.createRange();
  tail.setStart(cut.node, cut.offset);
  tail.setEnd(el, el.childNodes.length);

  const fit = el.cloneNode(false);
  fit.appendChild(head.cloneContents());
  const rest = el.cloneNode(false);
  rest.appendChild(tail.cloneContents());
  trimLeadingSpace(rest);
  fixListSplit(fit, rest);
  return [fit, rest];
}

// When a list is split, drop the empty item left behind and keep the numbering going.
function fixListSplit(fit, rest) {
  if (fit.tagName !== 'OL' && fit.tagName !== 'UL') return;
  let continued = true;
  while (fit.lastElementChild && isBlank(fit.lastElementChild)) {
    fit.lastElementChild.remove();
    continued = false;
  }
  const firstRest = rest.firstElementChild;
  if (continued && firstRest) firstRest.setAttribute('data-continued', 'true');
  if (fit.tagName === 'OL') {
    const start = Number(fit.getAttribute('start') || 1);
    const used = fit.children.length - (continued ? 1 : 0);
    rest.setAttribute('start', String(start + used));
  }
}

// Takes blocks from the front of `queue` until the page is full.
function fillPage(measurer, queue, capacity, continuation) {
  const { text } = measurer;
  text.replaceChildren();
  if (continuation) while (queue.length > 1 && isBlank(queue[0])) queue.shift();

  const blocks = [];
  while (queue.length) {
    const el = queue.shift();
    text.appendChild(el);
    if (height(text) <= capacity + EPSILON) {
      blocks.push(el);
      continue;
    }
    const split = splitToFit(el, text.getBoundingClientRect().top + capacity);
    text.removeChild(el);
    if (split) {
      const [fit, rest] = split;
      text.appendChild(fit);
      blocks.push(fit);
      queue.unshift(rest);
    } else if (blocks.length) {
      queue.unshift(el);
    } else {
      // A single line taller than the whole page - place it anyway.
      text.appendChild(el);
      blocks.push(el);
    }
    break;
  }
  return { blocks, height: height(text) };
}

function signatureSpace(measurer, role, fontSize) {
  let space = SIGNATURE_GAP + signatureImageHeight(role, fontSize);
  if (role.lines) {
    const { signText } = measurer;
    signText.style.fontSize = `${fontSize}px`;
    signText.replaceChildren(
      ...role.lines.map((line) => {
        const div = document.createElement('div');
        div.textContent = line;
        return div;
      }),
    );
    space += height(signText);
  }
  return space;
}

function paginate(measurer, sections, fontSize, role, withSignature) {
  measurer.text.style.fontSize = `${fontSize}px`;
  const lastCapacity = withSignature ? FULL_HEIGHT - signatureSpace(measurer, role, fontSize) : FULL_HEIGHT;

  const pages = [];
  for (const section of sections) {
    const queue = section.map((node) => node.cloneNode(true));
    let continuation = false;
    do {
      pages.push(fillPage(measurer, queue, FULL_HEIGHT, continuation));
      continuation = true;
    } while (queue.length);
  }

  // Make room for the signature on the last page. If it doesn't fit, the last
  // lines move to a new page together with the signature.
  const last = pages[pages.length - 1];
  if (last.height > lastCapacity + EPSILON) {
    pages.pop();
    const queue = last.blocks;
    pages.push(fillPage(measurer, queue, lastCapacity, false));
    while (queue.length) pages.push(fillPage(measurer, queue, lastCapacity, true));
  }

  measurer.text.replaceChildren();
  return pages.map((page, i) => ({
    html: page.blocks.map((b) => b.outerHTML).join(''),
    signature: withSignature && i === pages.length - 1,
  }));
}

export function layoutLetter(measurer, html, role, withSignature) {
  const sections = parseSections(html);
  const run = (size) => paginate(measurer, sections, size, role, withSignature);

  const smallest = run(MIN_FONT_SIZE);
  for (let size = BASE_FONT_SIZE; size > MIN_FONT_SIZE; size--) {
    const pages = run(size);
    if (pages.length <= smallest.length) return { fontSize: size, pages };
  }
  return { fontSize: MIN_FONT_SIZE, pages: smallest };
}
