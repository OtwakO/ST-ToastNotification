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
    const hostStyle = document.createElement('style');
    hostStyle.textContent = '.inline-drawer-content { display: none; }';
    document.head.append(hostStyle);
    const drawerContent = panel?.querySelector<HTMLElement>('.inline-drawer-content');
    const settingsContent = panel?.querySelector<HTMLElement>('[data-settings-content]');
    expect(settingsContent?.parentElement).toBe(drawerContent);
    expect(getComputedStyle(drawerContent!).display).toBe('none');
    expect(settingsContent).not.toBe(drawerContent);
    expect(
      panel?.querySelector<HTMLInputElement>('input[name="accent1"]')?.type,
    ).toBe('color');
    const unusedSecondary = panel?.querySelector<HTMLInputElement>(
      'input[name="secondary"]',
    );
    expect(unusedSecondary?.disabled).toBe(true);
    expect(unusedSecondary?.closest('label')?.textContent).toContain(
      'Unused by this theme',
    );
    expect(panel?.querySelector<HTMLInputElement>('input[name="accent4"]')?.disabled).toBe(true);
    expect(panel?.querySelectorAll('input[type="color"]')).toHaveLength(10);
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
      (
        extensionSettings[SETTINGS_KEY] as {
          themeOverrides: Record<string, Record<string, unknown>>;
        }
      ).themeOverrides.whisper.accent1,
    ).toBe('#abcdef');
    expect(saveSettingsDebounced).toHaveBeenCalledTimes(2);

    panel
      ?.querySelector<HTMLButtonElement>('[data-action="preview"]')
      ?.click();
    expect(document.querySelector('[data-st-toast-host]')?.shadowRoot).not.toBeNull();

    cleanup();
    hostStyle.remove();
    expect(document.querySelector('[data-st-toast-settings]')).toBeNull();
    expect(document.querySelector('[data-st-toast-host]')).toBeNull();
  });
});
