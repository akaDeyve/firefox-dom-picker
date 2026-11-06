/**
 * Mehrsprachigkeit über browser.i18n: Englisch (Standard) und Deutsch, je nach Browsersprache.
 * Texte in public/_locales/{en,de}/messages.json; unbekannte Schlüssel meldet der Typecheck.
 */

import type en from '../../public/_locales/en/messages.json';

export type MessageKey = keyof typeof en;

export const t = (key: MessageKey, ...substitutions: string[]): string =>
  browser.i18n.getMessage(key, substitutions);
