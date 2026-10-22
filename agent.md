# Instructions for AI Agent

## 1. Environment & Architecture
- **Production Target**: Static files hosted on university server at `https://www.andrews.edu/~monroel/`.
- **Root Directory for Web Assets**: Everything served lives in `./www/`.
- **Local Dev Server**: Vite (`npm run dev`) configured with `root: 'www'`. Vite is used strictly for local preview/testing.
- **Production Deployment**: Automated via GitHub Actions workflow (`.github/workflows/blank.yml`) which rsyncs `./www/` directly to the server on pushes to `main`. There is **no build/bundling step** in production.

## 2. Invariant Rules & Constraints
- **Document-Relative Paths (CRITICAL)**:
  - Because this site is served under a user subdirectory (`/~monroel/`), **never** use root-relative paths (e.g. `/styles/...`, `/assets/...`, `/links`).
  - Always use document-relative paths (e.g. `./styles/guide.css`, `./assets/...`, `../styles/...`, `./links`).
- **Zero Build-Step in Production**:
  - All client files under `www/` must run directly in standard browsers out of the box (vanilla HTML/CSS/JS, CDN links, or standard ES modules).
  - Do not introduce npm packages or bundler-specific syntax into `www/`.
- **Always Verify Active Files**:
  - Do not rely on hardcoded assumptions about specific animation timings, DOM element IDs, or sub-page lists. Always inspect the active files in `www/` when implementing changes.

## 3. Key Patterns & Conventions
- **Asset Locations**:
  - Pages: HTML files in `www/*.html`.
  - Styles: Stylesheets in `www/styles/` (main shared stylesheet is `guide.css`).
  - Client Scripts: JS files in `www/scripts/`.
  - Media & Images: Static files in `www/assets/`.
- **Theming**:
  - System dark mode handled via `@media (prefers-color-scheme: dark)`.
  - Hacker terminal mode toggled via `data-theme="hacker"` on `<body>`.
- **Dual-State Views (Cutscene vs Direct)**:
  - `www/index.html` supports bypass via `?no-cutscene=true` (also used inside the preview iframe). Keep this in mind when styling or updating shared elements.

## 4. Local Testing
- `npm run dev` to start Vite local dev server.
