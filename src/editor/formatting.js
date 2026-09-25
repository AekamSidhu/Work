// Sizes are relative ("em") so the letter's automatic shrink-to-fit still
// scales bigger words down with the rest of the text.
export const FONT_SIZES = [
  { label: 'Small', value: '0.85em', scale: 0.85 },
  { label: 'Normal', value: null, scale: 1 },
  { label: 'Large', value: '1.2em', scale: 1.2 },
  { label: 'Larger', value: '1.45em', scale: 1.45 },
  { label: 'Huge', value: '1.8em', scale: 1.8 },
];

// Browsers save colors as "rgb(198, 40, 40)"; turn that back into "#c62828"
// so the current color can be matched against the swatches.
export function toHexColor(color) {
  if (!color) return null;
  const rgb = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgb) return `#${rgb.slice(1, 4).map((n) => Number(n).toString(16).padStart(2, '0')).join('')}`;
  return color.toLowerCase();
}

// `null` means the normal (black) text color.
export const COLORS = [
  { name: 'Black', value: null },
  { name: 'CRSA Blue', value: '#0b1a8c' },
  { name: 'Red', value: '#c62828' },
  { name: 'Green', value: '#2e7d32' },
  { name: 'Orange', value: '#e65100' },
  { name: 'Purple', value: '#6a1b9a' },
  { name: 'Maroon', value: '#7b1f1f' },
  { name: 'Grey', value: '#5f6368' },
];
