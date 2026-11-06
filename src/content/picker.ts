/**
 * Picker: Hover hebt das Element hervor, Klick kopiert den Kontext, Esc bricht ab.
 * Listener laufen in der Capture-Phase, damit die Seite die Events nicht vorher bekommt.
 */

import { t } from '../shared/i18n';
import { buildContext } from './context';
import { highlightElement, removeHighlight, showToast } from './ui';

let active = false;
let originalCursor = '';
let originalUserSelect = '';

const onMouseMove = (e: MouseEvent) => highlightElement(e.target as Element);

async function onClick(e: MouseEvent): Promise<void> {
  e.preventDefault();
  e.stopPropagation();
  stopPicker();
  try {
    const ctx = await buildContext(e.target as HTMLElement);
    await navigator.clipboard.writeText(ctx.markdown);
    await browser.storage.local.set({ lastCapture: ctx });
    showToast(t('toastCopied'));
  } catch (err) {
    showToast(t('toastError', (err as Error).message));
  }
}

function onKeyDown(e: KeyboardEvent): void {
  if (e.key !== 'Escape') return;
  e.preventDefault();
  e.stopPropagation();
  stopPicker();
  showToast(t('toastCancelled'));
}

function startPicker(): void {
  active = true;
  originalCursor = document.documentElement.style.cursor;
  originalUserSelect = document.body.style.userSelect;
  document.documentElement.style.cursor = 'crosshair';
  document.body.style.userSelect = 'none';
  document.addEventListener('mousemove', onMouseMove, true);
  document.addEventListener('click', onClick, true);
  document.addEventListener('keydown', onKeyDown, true);
  showToast(t('toastStart'));
}

function stopPicker(): void {
  active = false;
  document.removeEventListener('mousemove', onMouseMove, true);
  document.removeEventListener('click', onClick, true);
  document.removeEventListener('keydown', onKeyDown, true);
  removeHighlight();
  document.documentElement.style.cursor = originalCursor;
  document.body.style.userSelect = originalUserSelect;
}

export function togglePicker(): void {
  if (active) {
    stopPicker();
    showToast(t('toastStopped'));
  } else {
    startPicker();
  }
}
