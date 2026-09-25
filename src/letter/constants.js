// Geometry of the letter, in "page pixels". The letterhead image (1024x1536)
// is drawn at 680x1020, and everything is positioned on top of it exactly as
// in the original index.html.
export const PAGE_WIDTH = 680;
export const PAGE_HEIGHT = 1020;

export const TEXT_TOP = 200;
export const TEXT_MAX_HEIGHT = 620;

// Body text starts at 16px and shrinks (down to 12px) until it fits.
export const BASE_FONT_SIZE = 16;
export const MIN_FONT_SIZE = 12;

export const SIGNATURE_WIDTH = 280;
export const SIGNATURE_WIDTH_SMALL = 224; // used once the text has shrunk to the minimum size
export const SIGNATURE_GAP = 10; // space between the body text and the signature
export const SIGNATURE_BOTTOM_LIMIT = 70; // signature never goes closer than this to the page bottom

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
