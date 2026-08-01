// Verifies generic theme settings migration and per-theme override persistence.
import { describe, expect, it } from 'vitest';

import { defaultSettings, loadSettings } from './settings';

describe('loadSettings', () => {
  it('migrates legacy flat values into generic behavior and per-theme overrides', () => {
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
      behavior: { ...defaultSettings.behavior, durationMs: 2200 },
      themeOverrides: { whisper: { accent1: '#abcdef' } },
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
