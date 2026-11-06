# Changelog

All notable changes to DOM Picker für LLM are documented in this file.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) ·
Versioning: [Semantic Versioning](https://semver.org/).

## [0.2.0-beta] – 2026-11-06

Rewrite in TypeScript with a simpler code base and the project layout of Lightfox.
The generated Markdown context is unchanged, except where noted under *Changed*.

### Added

- TypeScript sources (`src/background/`, `src/content/`, `src/shared/`), bundled by esbuild
  (`scripts/build.mjs`) into `dist/background.js` and `dist/content.js`.
- `npm` scripts: `build`, `dev`, `typecheck`, `test`, `lint`, `check`, `start`, `sign`, `icons`
  (`web-ext` for lint/run/sign).
- Smoke test of the context pipeline in jsdom (`tests/content-smoke.mjs`).
- English UI (default) next to German via `public/_locales/` (`browser.i18n`); typed keys in
  `src/shared/i18n.ts`.
- Icon generation script (`npm run icons`, sharp); icons now 16/32/48/64/128/512 px.
- `README.md` (English) and `README.de.md` (German), `CHANGELOG.md`, `LICENSE` (MIT).

### Changed

- Version set to `0.2.0` (beta); the manifest only allows numbers, so “beta” appears only in
  the README and this changelog.
- Generated HTML truncation comments are English (`svg (truncated)`, `HTML truncated`), like the
  rest of the Markdown context.
- Layout: `manifest.json` and `icons/` moved to `public/`; load `dist/manifest.json` in Firefox.
- The 10 classic scripts sharing `window.__domPickerLLM` are now ES modules bundled into one
  content script; `markdown.js` merged into `context.ts`, `dom.js` into `extract.ts`,
  `clipboard.js` into `picker.ts`.
- CSS rules are collected from every nested grouping rule (also `@layer`, `@container`), not
  only `@media`/`@supports`.
- The content script stores `lastCapture` in `browser.storage.local` itself (no message to the
  background any more).
- Toasts are translated (English or German, following the browser language).

### Removed

- Messages `start-picker`, `stop-picker`, `ping` and the double-load guard; only
  `toggle-picker` remains.
- Clipboard fallback via `document.execCommand('copy')`.
- Duplicate-rule detection, per-rule `try/catch` and the "(leer / nur Browser-Präfix)"
  placeholder for empty rules.
- Defensive checks that could not trigger (`instanceof Element`, `document.body` null checks,
  `isActive` checks inside listeners, storage error fallback).

## [0.1.0]

First version (shipped with manifest version `2.0.0`).

### Added

- Firefox MV3 extension: element picker (toolbar button, Alt+Shift+E), Markdown context with
  HTML, matching CSS rules, computed styles and visible text, copied to the clipboard.
