/**
 * Content-Script (Einstiegspunkt): reagiert auf TOGGLE_PICKER vom Background.
 */

import { TOGGLE_PICKER } from '../shared/messages';
import { togglePicker } from './picker';

browser.runtime.onMessage.addListener((message: unknown) => {
  if (message === TOGGLE_PICKER) togglePicker();
});
