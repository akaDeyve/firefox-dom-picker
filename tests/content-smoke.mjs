/**
 * Integrationstest der Content-Pipeline (ohne Browser):
 * - context.ts/extract.ts werden in-memory gebündelt und in jsdom ausgeführt
 * - prüft Selector, Ancestors, HTML-Bereinigung, CSS-Regeln (inkl. @media) und Markdown
 *
 * Aufruf: npm test
 */

import { strict as assert } from 'node:assert';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import esbuild from 'esbuild';
import { JSDOM } from 'jsdom';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const page = `<!DOCTYPE html>
<html>
<head>
  <title>Smoke-Test</title>
  <style>
    .card h2 { color: red; }
    @media (max-width: 600px) { .card h2 { font-size: 12px; } }
    .other { color: blue; }
  </style>
</head>
<body>
  <main id="app">
    <div class="card"><h2>Eins</h2></div>
    <div class="card">
      <h2 style="margin: 0">Zwei</h2>
      <script>alert(1)</script>
    </div>
  </main>
</body>
</html>`;

// --- Globals für das Bundle setzen ------------------------------------------
const dom = new JSDOM(page, { url: 'https://example.com/test', pretendToBeVisual: true });
const { window } = dom;
// jsdom kennt weder innerText noch CSS.escape.
Object.defineProperty(window.HTMLElement.prototype, 'innerText', {
  get() {
    return this.textContent;
  },
});
window.CSS = { escape: (s) => s };

for (const key of ['window', 'document', 'location', 'getComputedStyle', 'CSS', 'CSSStyleRule', 'CSSGroupingRule', 'CSSMediaRule']) {
  globalThis[key] = window[key];
}
globalThis.browser = { storage: { local: { get: async () => ({}) } } };

// --- Module in-memory bündeln ------------------------------------------------
const { outputFiles } = await esbuild.build({
  entryPoints: [resolve(root, 'src/content/context.ts')],
  bundle: true,
  format: 'esm',
  write: false,
});
const { buildContext } = await import(
  'data:text/javascript;base64,' + Buffer.from(outputFiles[0].text).toString('base64')
);

// --- Prüfungen ----------------------------------------------------------------
const h2 = window.document.querySelectorAll('h2')[1];
const ctx = await buildContext(h2);

assert.equal(ctx.selector, '#app > div.card:nth-of-type(2) > h2');
assert.deepEqual(ctx.ancestors, ['body', 'main#app', 'div.card']);
assert.equal(ctx.html, '<h2 style="margin: 0">Zwei</h2>');
assert.equal(ctx.inlineStyle, 'margin: 0');
assert.equal(ctx.text, 'Zwei');
assert.equal(ctx.title, 'Smoke-Test');
assert.deepEqual(
  ctx.cssRules.map((r) => [r.selector, r.media]),
  [['.card h2', ''], ['.card h2', '(max-width: 600px)']],
);
assert.match(ctx.markdown, /^# Selected DOM element context/);
assert.match(ctx.markdown, /## Matching CSS rules \(authored\)/);
assert.match(ctx.markdown, /\/\* @media \(max-width: 600px\) \*\//);

// Script-Tags werden aus dem HTML entfernt.
const card = window.document.querySelectorAll('.card')[1];
assert.doesNotMatch((await buildContext(card)).html, /<script/);

console.log('content-smoke: OK');
