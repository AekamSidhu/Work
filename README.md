# CRSA Letter Generator (React)

Writes Chandigarh Roller Skating Association letters on the official letterhead
and saves them as a PDF or image. A React rebuild of the original single-file
`index.html` from https://github.com/AekamSidhu/Work.

## What's new compared with the old version

- **Style any words**: select text, then tap **B** (bold), *I* (italic),
  U (underline), **size** (Small → Huge) or **color** (8 preset colors; any color on PC).
- **Two layouts, picked automatically**
  - **Phone**: Write / Preview tabs, big buttons, and a formatting bar that sits
    just above the keyboard (like the Notes app). PDF and Image buttons are always
    at the bottom. After making a file, **Share or Save** opens the iPhone share
    menu (WhatsApp, Save to Files, Mail, Print…).
  - **PC**: editor on the left, live preview of every page on the right,
    one-click downloads and keyboard shortcuts (Ctrl/⌘ + B, I, U, Z).
  - A "Switch to PC view / phone view" link at the bottom overrides the automatic choice.
- **Auto-save**: the letter is kept on the device, so closing Safari or
  reloading doesn't lose it. **New** starts a fresh letter.
- Pages can be **deleted** as well as added; a new page copies the CRSA No., date
  and signature of the page before it.
- The **date** can be changed (it defaults to today, like before).
- A warning appears if a page has more text than fits.
- Can be **added to the iPhone home screen** (Safari → Share → Add to Home Screen)
  and then opens full-screen with the CRSA logo as its icon.

Letter layout (positions, the 16px → 12px shrink-to-fit, signatures) is the same as the original.

## Deploying (Netlify, free plan)

The live site is https://calm-toffee-f4da9b.netlify.app, built from the `main`
branch of https://github.com/AekamSidhu/Work.

Build settings are in `netlify.toml` (`npm run build`, publish folder `dist`).
They override whatever is set in the Netlify dashboard, so nothing needs
changing there. Every commit to `main` rebuilds the site in about a minute.

When uploading changes by hand, never upload `node_modules` or `dist`.

## Running it on a computer (optional)

Needs Node.js 20.19+ (or 22.12+).

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build into dist/
```

## Changing things

| What | Where |
| --- | --- |
| Letterhead image | `public/letterhead.png` (keep the 2:3 shape) |
| Signature images | `public/sign-president.png`, `public/sign-general-secretary.png` |
| Names under the signature, signers | `src/letter/constants.js` → `ROLES` |
| Text positions on the letterhead | `src/letter/constants.js` and `src/styles/letter.css` |
| Colors and sizes offered | `src/editor/formatting.js` |
| When the phone layout is used | `PHONE_QUERY` in `src/App.jsx` |

## Project layout

```
src/
  App.jsx               picks the phone or PC layout
  layouts/              MobileApp.jsx, DesktopApp.jsx
  editor/               rich-text editor (TipTap) and its toolbar
  letter/               the letter page, scaling, PDF/image creation
  export/               "making your PDF" overlay and the share sheet
  components/           page tabs, details form, keyboard bar, icons
  state/                letter data + auto-save
  styles/               CSS
public/                 letterhead, signatures, app icons
```
