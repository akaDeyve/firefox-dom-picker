/**
 * Anzeige auf der Seite: Hover-Rahmen mit Namensschild und Toasts.
 * pointer-events:none – Klicks gehen durch unsere Elemente hindurch.
 */

import { describeElement } from './extract';

const TOP = 'position:fixed;pointer-events:none;z-index:2147483647;';

function createDiv(css: string): HTMLDivElement {
  const div = document.createElement('div');
  div.style.cssText = TOP + css;
  return div;
}

const box = createDiv('border:2px solid #2563eb;background:rgba(37,99,235,.12);box-sizing:border-box;');
const label = createDiv(
  'background:#2563eb;color:#fff;font:600 11px/1.4 ui-monospace,Menlo,Consolas,monospace;' +
    'padding:3px 6px;border-radius:4px;max-width:60vw;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;',
);

export function highlightElement(el: Element): void {
  const r = el.getBoundingClientRect();
  Object.assign(box.style, { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` });
  label.textContent = describeElement(el);
  Object.assign(label.style, { left: `${Math.max(0, r.left)}px`, top: `${Math.max(0, r.top - 22)}px` });
  document.documentElement.append(box, label);
}

export function removeHighlight(): void {
  box.remove();
  label.remove();
}

export function showToast(message: string): void {
  const toast = createDiv(
    'bottom:24px;left:50%;transform:translateX(-50%);background:#111827;color:#fff;' +
      'font:600 13px/1.4 system-ui,sans-serif;padding:10px 16px;border-radius:8px;' +
      'box-shadow:0 4px 16px rgba(0,0,0,.35);max-width:80vw;text-align:center;',
  );
  toast.textContent = message;
  document.documentElement.append(toast);
  setTimeout(() => toast.remove(), 2600);
}
