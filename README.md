# Blood Tracker (PWA) — GH Pages Patch

- iOS-friendly permission flow: camera list populates **after** you tap Start and grant permission.
- Visible message area shows errors.
- Service worker path fixed for GitHub Pages (`${import.meta.env.BASE_URL}sw.js`).

## Dev
npm install
npm run dev

## Build
npm run build

## Deploy
Push to GitHub and enable Pages via Actions or push `dist/` to `gh-pages`.
