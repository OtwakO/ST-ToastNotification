// Connects the portable notifier to SillyTavern settings and native form controls.
import { installBridges } from '../bridges';
import { createNotifier, type Notifier } from '../toast/notifier';
import {
  defaultSettings,
  loadSettings,
  type ExtensionSettings,
} from './settings';

export interface SillyTavernContext {
  extensionSettings: Record<string, unknown>;
  saveSettingsDebounced(): void;
}

export function startSillyTavernAdapter(
  context: SillyTavernContext,
  mount: HTMLElement | null = document.querySelector('#extensions_settings2'),
): () => void {
  if (!mount) throw new Error('SillyTavern extension settings panel was not found');

  const settings = loadSettings(context.extensionSettings);
  const panel = buildSettingsPanel(settings);
  mount.append(panel);
  let notifier: Notifier;
  let cleanupBridges: () => void;

  const startNotifier = (): void => {
    notifier?.destroy();
    cleanupBridges?.();
    notifier = createNotifier(settings);
    cleanupBridges = installBridges(notifier);
  };
  startNotifier();

  const handleInput = (event: Event): void => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement || input instanceof HTMLSelectElement)) {
      return;
    }
    const key = input.name as keyof ExtensionSettings;
    if (!Object.hasOwn(settings, key)) return;
    const value = input.type === 'range' ? Number(input.value) : input.value;
    Object.assign(settings, { [key]: value });
    const output = panel.querySelector<HTMLOutputElement>(
      `[data-output="${input.name}"]`,
    );
    if (output) output.value = input.value;
    context.saveSettingsDebounced();
    startNotifier();
  };

  panel.addEventListener('input', handleInput);
  panel.querySelector('[data-action="preview"]')?.addEventListener('click', () => {
    notifier.show({
      message: 'Memory recalled',
      detail: 'This moment will be remembered.',
      tone: 'info',
    });
  });
  panel.querySelector('[data-action="reset"]')?.addEventListener('click', () => {
    Object.assign(settings, defaultSettings);
    syncPanel(panel, settings);
    context.saveSettingsDebounced();
    startNotifier();
  });

  return () => {
    panel.removeEventListener('input', handleInput);
    cleanupBridges();
    notifier.destroy();
    panel.remove();
  };
}

function buildSettingsPanel(settings: ExtensionSettings): HTMLElement {
  const panel = document.createElement('section');
  panel.dataset.stToastSettings = '';
  panel.className = 'st-toast-settings';
  panel.innerHTML = `<div class="inline-drawer"><div class="inline-drawer-toggle inline-drawer-header"><b>Toast Notifications</b><div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div></div><div class="inline-drawer-content"><label>Preset<select name="preset"><option value="whisper">Whisper</option></select></label><div class="st-toast-color-grid">${colorInput('Primary', 'primary')}${colorInput('Accent 1', 'accent1')}${colorInput('Accent 2', 'accent2')}${colorInput('Accent 3', 'accent3')}${colorInput('Text', 'foreground')}${colorInput('Muted text', 'mutedForeground')}</div>${rangeInput('Title size', 'titleFontSizePx', 10, 24)}${rangeInput('Detail size', 'detailFontSizePx', 8, 18)}${rangeInput('Duration', 'durationMs', 1000, 10000, 100)}${rangeInput('Maximum visible', 'maxVisible', 1, 6)}<label>Position<select name="position"><option value="top-left">Top left</option><option value="top-center">Top center</option><option value="top-right">Top right</option><option value="bottom-left">Bottom left</option><option value="bottom-center">Bottom center</option><option value="bottom-right">Bottom right</option></select></label><div class="st-toast-actions"><button type="button" class="menu_button" data-action="preview">Preview</button><button type="button" class="menu_button" data-action="reset">Reset</button></div></div></div>`;
  syncPanel(panel, settings);
  return panel;
}

function colorInput(label: string, name: keyof ExtensionSettings): string {
  return `<label>${label}<input type="color" name="${name}"></label>`;
}

function rangeInput(
  label: string,
  name: keyof ExtensionSettings,
  min: number,
  max: number,
  step = 1,
): string {
  return `<label>${label}<input type="range" name="${name}" min="${min}" max="${max}" step="${step}"><output data-output="${name}"></output></label>`;
}

function syncPanel(panel: HTMLElement, settings: ExtensionSettings): void {
  for (const [key, value] of Object.entries(settings)) {
    const input = panel.querySelector<HTMLInputElement | HTMLSelectElement>(
      `[name="${key}"]`,
    );
    if (input) input.value = String(value);
    const output = panel.querySelector<HTMLOutputElement>(`[data-output="${key}"]`);
    if (output) output.value = String(value);
  }
}
