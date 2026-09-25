// Geometry of the letter, in "page pixels". The letterhead image (1024x1536)
// is drawn at 680x1020, and the text sits on top of it as in the original index.html.
export const PAGE_WIDTH = 680;
export const PAGE_HEIGHT = 1020;

export const TEXT_TOP = 200;
// Nothing (text or signature) goes below this line; it keeps a margin above
// the bottom of the letterhead's left-hand column.
export const PAGE_BOTTOM = 975;

// Text starts at 16px and shrinks (down to 12px) to fit. If it still doesn't
// fit, it carries on to a new page.
export const BASE_FONT_SIZE = 16;
export const MIN_FONT_SIZE = 12;

export const SIGNATURE_WIDTH = 280;
export const SIGNATURE_WIDTH_SMALL = 224; // used once the text has shrunk to the minimum size
export const SIGNATURE_GAP = 10; // space between the text and the signature

export const LETTERHEAD_URL = '/letterhead.png';

export const ROLES = {
  president: {
    label: 'President',
    image: '/sign-president.png',
    aspect: 77 / 232, // height / width of sign-president.png
    lines: ['Maninderjit Singh Sidhu', 'President', 'Chandigarh Roller Skating Association'],
  },
  secretary: {
    label: 'General Secretary',
    image: '/sign-general-secretary.png',
    aspect: 407 / 660, // this image already contains the name and title
    lines: null,
  },
};

export function signatureWidth(fontSize) {
  return fontSize <= MIN_FONT_SIZE ? SIGNATURE_WIDTH_SMALL : SIGNATURE_WIDTH;
}

export function signatureImageHeight(role, fontSize) {
  return Math.round(signatureWidth(fontSize) * role.aspect);
}
