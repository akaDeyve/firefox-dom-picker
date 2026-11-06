/**
 * Einstellungen: Defaults, überschreibbar über browser.storage.local "settings"
 * (siehe README, „Options“).
 */

export interface Settings {
  includeCssRules: boolean;
  includeComputed: boolean;
  includeAncestors: boolean;
  maxHtmlChars: number;
  maxTextChars: number;
}

const DEFAULT_SETTINGS: Settings = {
  includeCssRules: true,
  includeComputed: true,
  includeAncestors: true,
  maxHtmlChars: 6000,
  maxTextChars: 800,
};

export async function getSettings(): Promise<Settings> {
  const { settings } = await browser.storage.local.get('settings');
  return { ...DEFAULT_SETTINGS, ...settings };
}
