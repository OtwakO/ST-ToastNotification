// Verifies the SillyTavern adapter through its stable context and rendered controls.
import { afterEach, describe, expect, it, vi } from 'vitest';

import { startSillyTavernAdapter, type SillyTavernContext } from './adapter';
import { SETTINGS_KEY } from './settings';

afterEach(() => {
  document.body.replaceChildren();
});

describe('startSillyTavernAdapter', () => {
  it('renders native controls, persists changes, previews, and cleans up', () => {
    document.body.innerHTML = '<div id="extensions_settings2"></div>';
    const saveSettingsDebounced = vi.fn();
    const extensionSettings: Record<string, unknown> = {};
    const context: SillyTavernContext = {
      extensionSettings,
      saveSettingsDebounced,
    };

    const cleanup = startSillyTavernAdapter(context);
    const panel = document.querySelector('[data-st-toast-settings]');
    expect(panel).not.toBeNull();
    expect(
      panel?.querySelector<HTMLInputElement>('input[name="accent1"]')?.type,
    ).toBe('color');
    expect(
      panel?.querySelector<HTMLInputElement>('input[name="titleFontSizePx"]')
        ?.type,
    ).toBe('range');
    expect(panel?.querySelector('select[name="position"]')).not.toBeNull();

    const titleSize = panel?.querySelector<HTMLInputElement>(
      'input[name="titleFontSizePx"]',
    );
    const titleOutput = panel?.querySelector<HTMLOutputElement>(
      '[data-output="titleFontSizePx"]',
    );
    if (!titleSize || !titleOutput) throw new Error('title size control missing');
    titleSize.value = '16';
    titleSize.dispatchEvent(new Event('input', { bubbles: true }));
    expect(titleOutput.value).toBe('16');

    const color = panel?.querySelector<HTMLInputElement>('input[name="accent1"]');
    if (!color) throw new Error('accent color input missing');
    color.value = '#abcdef';
    color.dispatchEvent(new Event('input', { bubbles: true }));

    expect(
      (extensionSettings[SETTINGS_KEY] as Record<string, unknown>).accent1,
    ).toBe('#abcdef');
    expect(saveSettingsDebounced).toHaveBeenCalledTimes(2);

    panel
      ?.querySelector<HTMLButtonElement>('[data-action="preview"]')
      ?.click();
    expect(document.querySelector('[data-st-toast-host]')?.shadowRoot).not.toBeNull();

    cleanup();
    expect(document.querySelector('[data-st-toast-settings]')).toBeNull();
    expect(document.querySelector('[data-st-toast-host]')).toBeNull();
  });
});
