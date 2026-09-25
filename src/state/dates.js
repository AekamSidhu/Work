const pad = (n) => String(n).padStart(2, '0');

// Today's date as yyyy-mm-dd (the format <input type="date"> uses).
export function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// yyyy-mm-dd -> dd/mm/yyyy, the format printed on the letter.
export function formatDate(iso) {
  const [y, m, d] = String(iso).split('-');
  return y && m && d ? `${d}/${m}/${y}` : '';
}

// A page's date: null means "always today".
export function pageDate(page) {
  return page.date || todayISO();
}
