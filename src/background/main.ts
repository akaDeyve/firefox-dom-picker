/**
 * Background (MV3 Event-Page): Toolbar-Klick und Shortcut (Alt+Shift+E)
 * schalten den Picker im aktiven Tab an/aus.
 */

import { TOGGLE_PICKER } from '../shared/messages';

async function togglePicker(): Promise<void> {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (tab?.id === undefined) return;
  // Auf about:-Seiten etc. gibt es kein Content-Script – Fehler ignorieren.
  await browser.tabs.sendMessage(tab.id, TOGGLE_PICKER).catch(() => {});
}

browser.action.onClicked.addListener(togglePicker);
browser.commands.onCommand.addListener((command) => {
  if (command === 'pick-element') togglePicker();
});
