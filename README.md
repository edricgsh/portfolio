# edricgan.dev

A zero-dependency static site for Edric Gan. It includes the home page, detailed work and project pages, coaching, and eight self-hosted articles.

## Build

```bash
npm run build
npm run serve
```

The build writes production files to `dist/`. Every route is a real HTML file, so direct links and refreshes work on static hosting.

## Project structure

- `scripts/build.js` creates every public page.
- `scripts/check.js` validates headings, metadata, assets, links, and public copy.
- `src/` contains the design system, JavaScript, article content, and local media.
- `dist/` is the generated production site.

## Deployment

GitHub Pages serves the generated site from the `gh-pages` branch with the custom domain `edricgan.dev`.
