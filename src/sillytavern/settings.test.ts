// Verifies the small persisted SillyTavern settings shape and migration behavior.
import { describe, expect, it } from 'vitest';

import { defaultSettings, loadSettings } from './settings';

describe('loadSettings', () => {
  it('stores only the approved v1 values and fills missing defaults', () => {
    const extensionSettings: Record<string, unknown> = {
      st_toast_notification: {
        accent1: '#abcdef',
        durationMs: 2200,
        ignoredLegacyValue: true,
      },
    };

    const settings = loadSettings(extensionSettings);

    expect(settings).toEqual({
      ...defaultSettings,
      accent1: '#abcdef',
      durationMs: 2200,
    });
    expect(extensionSettings.st_toast_notification).toBe(settings);
    expect(settings).not.toHaveProperty('ignoredLegacyValue');
  });

  it('falls back to defaults when persisted values are invalid', () => {
    const extensionSettings: Record<string, unknown> = {
      st_toast_notification: {
        primary: 'red',
        titleFontSizePx: -1,
        position: 'middle',
        maxVisible: 0,
      },
    };

    expect(loadSettings(extensionSettings)).toEqual(defaultSettings);
  });
});
