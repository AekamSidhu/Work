import { LETTERHEAD_URL, PAGE_HEIGHT, PAGE_WIDTH } from './constants.js';
import { formatDate, pageDate } from '../state/dates.js';

const PDF_SCALE = 2;
const IMAGE_SCALE = 3;
// PDF page keeps the letterhead's 2:3 shape, 210mm wide (A4 width).
const PDF_WIDTH_MM = 210;
const PDF_HEIGHT_MM = (PDF_WIDTH_MM * PAGE_HEIGHT) / PAGE_WIDTH;

export function fileBaseName(page) {
  const number = (page.number || '').trim().replace(/[^\w-]+/g, '-').replace(/^-+|-+$/g, '');
  if (number) return `CRSA-Letter-${number}`;
  return `CRSA-Letter-${formatDate(pageDate(page)).replace(/\//g, '-')}`;
}

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = img.onerror = () => resolve();
    img.src = src;
  });
}

async function waitForAssets(root) {
  if (document.fonts?.ready) await document.fonts.ready;
  await loadImage(LETTERHEAD_URL);
  await Promise.all(
    [...root.querySelectorAll('img')].map((img) => (img.decode ? img.decode().catch(() => {}) : null)),
  );
  // Two frames so layout is settled before capturing.
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
}

function capture(html2canvas, el, scale) {
  return html2canvas(el, {
    scale,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    scrollX: 0,
    scrollY: 0,
    windowWidth: PAGE_WIDTH,
    windowHeight: PAGE_HEIGHT,
  });
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not create image'))), type, quality);
  });
}

// Frees the canvas memory straight away - iPhones have a tight canvas budget.
function release(canvas) {
  canvas.width = 0;
  canvas.height = 0;
}

// Turns the rendered pages inside `stage` into files: one PDF, or one JPEG per page.
export async function createLetterFiles(stage, kind, pages) {
  const { default: html2canvas } = await import('html2canvas');
  await waitForAssets(stage);
  const pageEls = [...stage.querySelectorAll('.letter-page')];
  const base = fileBaseName(pages[0]);

  if (kind === 'pdf') {
    const { jsPDF } = await import('jspdf');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [PDF_WIDTH_MM, PDF_HEIGHT_MM], compress: true });
    for (let i = 0; i < pageEls.length; i++) {
      const canvas = await capture(html2canvas, pageEls[i], PDF_SCALE);
      if (i > 0) pdf.addPage([PDF_WIDTH_MM, PDF_HEIGHT_MM], 'portrait');
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, PDF_WIDTH_MM, PDF_HEIGHT_MM, undefined, 'FAST');
      release(canvas);
    }
    const blob = pdf.output('blob');
    return [new File([blob], `${base}.pdf`, { type: 'application/pdf' })];
  }

  const files = [];
  for (let i = 0; i < pageEls.length; i++) {
    const canvas = await capture(html2canvas, pageEls[i], IMAGE_SCALE);
    const blob = await canvasToBlob(canvas, 'image/jpeg', 0.95);
    release(canvas);
    const name = pageEls.length > 1 ? `${base}-page-${i + 1}.jpg` : `${base}.jpg`;
    files.push(new File([blob], name, { type: 'image/jpeg' }));
  }
  return files;
}

export function downloadFile(file) {
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export async function downloadFiles(files) {
  for (let i = 0; i < files.length; i++) {
    if (i > 0) await new Promise((resolve) => setTimeout(resolve, 400));
    downloadFile(files[i]);
  }
}

export function formatFileSize(bytes) {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
