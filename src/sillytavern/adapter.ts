// Connects the generic theme catalog to SillyTavern settings and native form controls.
import { installBridges } from '../bridges';
import { getTheme, listThemes } from '../themes/catalog';
import type { ThemeTokenDefinition } from '../themes/types';
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
  let notifier: Notifier | undefined;
  let cleanupBridges: (() => void) | undefined;

  const startNotifier = (): void => {
    notifier?.destroy();
    cleanupBridges?.();
    notifier = createNotifier({
      themeId: settings.themeId,
      themeOverrides: settings.themeOverrides[settings.themeId] ?? {},
      ...settings.behavior,
    });
    cleanupBridges = installBridges(notifier);
  };
  startNotifier();

  const handleInput = (event: Event): void => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement || input instanceof HTMLSelectElement)) return;
    const key = input.name;
    if (key === 'themeId') {
      settings.themeId = input.value;
      renderSettingsPanel(panel, settings);
    } else if (isThemeToken(settings.themeId, key)) {
      const value = readControlValue(input);
      settings.themeOverrides[settings.themeId] ??= {};
      settings.themeOverrides[settings.themeId][key] = value;
      updateOutput(panel, key, input.value);
    } else if (key in settings.behavior) {
      const value = input.type === 'range' || input.type === 'number'
        ? Number(input.value)
        : input.value;
      Object.assign(settings.behavior, { [key]: value });
      updateOutput(panel, key, input.value);
    } else {
      return;
    }
    context.saveSettingsDebounced();
    startNotifier();
  };

  const handlePreview = (): void => {
    notifier?.show({
      message: 'Memory recalled',
      detail: 'This moment will be remembered.',
      tone: 'info',
    });
  };
  const handleReset = (): void => {
    delete settings.themeOverrides[settings.themeId];
    renderSettingsPanel(panel, settings);
    context.saveSettingsDebounced();
    startNotifier();
  };
  const handlePanelClick = (event: Event): void => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement)) return;
    if (target.matches('[data-action="preview"]')) handlePreview();
    if (target.matches('[data-action="reset"]')) handleReset();
  };

  panel.addEventListener('input', handleInput);
  panel.addEventListener('change', handleInput);
  panel.addEventListener('click', handlePanelClick);

  return () => {
    panel.removeEventListener('input', handleInput);
    panel.removeEventListener('change', handleInput);
    panel.removeEventListener('click', handlePanelClick);
    cleanupBridges?.();
    notifier?.destroy();
    panel.remove();
  };
}

function buildSettingsPanel(settings: ExtensionSettings): HTMLElement {
  const panel = document.createElement('section');
  panel.dataset.stToastSettings = '';
  panel.className = 'st-toast-settings';
  panel.innerHTML = '<div class="inline-drawer"><div class="inline-drawer-toggle inline-drawer-header"><b>Toast Notifications</b><div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div></div><div class="inline-drawer-content"><div class="st-toast-settings-content" data-settings-content></div></div></div>';
  renderSettingsPanel(panel, settings);
  return panel;
}

function renderSettingsPanel(panel: HTMLElement, settings: ExtensionSettings): void {
  const content = panel.querySelector<HTMLElement>('[data-settings-content]');
  if (!content) return;
  const theme = getTheme(settings.themeId) ?? getTheme();
  const themeOptions = listThemes()
    .map(({ id, name }) => `<option value="${escapeAttribute(id)}">${escapeText(name)}</option>`)
    .join('');
  const tokenControls = theme
    ? Object.entries(theme.tokens).map(([id, definition]) => tokenControl(id, definition, settings)).join('')
    : '';
  content.innerHTML = `<label>Theme<select name="themeId">${themeOptions}</select></label><div class="st-toast-color-grid">${tokenControls}</div>${behaviorControls(settings)}<div class="st-toast-actions"><button type="button" class="menu_button" data-action="preview">Preview</button><button type="button" class="menu_button" data-action="reset">Reset theme</button></div>`;
  const themeSelect = content.querySelector<HTMLSelectElement>('[name="themeId"]');
  if (themeSelect) themeSelect.value = settings.themeId;
  const positionSelect = content.querySelector<HTMLSelectElement>('[name="position"]');
  if (positionSelect) positionSelect.value = settings.behavior.position;
  if (theme) {
    for (const [id, definition] of Object.entries(theme.tokens)) {
      if (definition.type !== 'select') continue;
      const select = content.querySelector<HTMLSelectElement>(`[name="${id}"]`);
      const value = settings.themeOverrides[settings.themeId]?.[id] ?? definition.default;
      if (select) select.value = String(value);
    }
  }
}

function tokenControl(
  id: string,
  definition: ThemeTokenDefinition,
  settings: ExtensionSettings,
): string {
  const value = settings.themeOverrides[settings.themeId]?.[id] ?? definition.default;
  const name = escapeAttribute(id);
  const label = escapeText(definition.label);
  if (definition.type === 'color') {
    const unused = definition.used === false;
    const status = unused ? '<small class="st-toast-token-status">Unused by this theme</small>' : '';
    return `<label class="${unused ? 'st-toast-token-unused' : ''}"><span>${label}${status}</span><input type="color" name="${name}" value="${escapeAttribute(String(value))}" ${unused ? 'disabled aria-disabled="true"' : ''}></label>`;
  }
  if (definition.type === 'boolean') {
    return `<label>${label}<input type="checkbox" name="${name}" ${value ? 'checked' : ''}></label>`;
  }
  if (definition.type === 'select') {
    const options = definition.options
      .map((option) => `<option value="${escapeAttribute(option.value)}">${escapeText(option.label)}</option>`)
      .join('');
    return `<label>${label}<select name="${name}">${options}</select></label>`;
  }
  const type = definition.type === 'range' ? 'range' : 'number';
  const unit = definition.unit ? ` (${escapeText(definition.unit)})` : '';
  return `<label>${label}${unit}<input type="${type}" name="${name}" min="${definition.min}" max="${definition.max}" step="${definition.step}" value="${value}"><output data-output="${name}">${value}</output></label>`;
}

function behaviorControls(settings: ExtensionSettings): string {
  const { durationMs, maxVisible, position } = settings.behavior;
  return `<label>Duration (ms)<input type="range" name="durationMs" min="1000" max="10000" step="100" value="${durationMs}"><output data-output="durationMs">${durationMs}</output></label><label>Maximum visible<input type="range" name="maxVisible" min="1" max="6" step="1" value="${maxVisible}"><output data-output="maxVisible">${maxVisible}</output></label><label>Position<select name="position"><option value="top-left">Top left</option><option value="top-center">Top center</option><option value="top-right">Top right</option><option value="bottom-left">Bottom left</option><option value="bottom-center">Bottom center</option><option value="bottom-right">Bottom right</option></select></label>`;
}

function isThemeToken(themeId: string, key: string): boolean {
  return Boolean(getTheme(themeId)?.tokens[key]);
}

function readControlValue(input: HTMLInputElement | HTMLSelectElement): string | number | boolean {
  if (input instanceof HTMLInputElement && input.type === 'checkbox') return input.checked;
  if (input instanceof HTMLInputElement && (input.type === 'range' || input.type === 'number')) return Number(input.value);
  return input.value;
}

function updateOutput(panel: HTMLElement, key: string, value: string): void {
  const output = panel.querySelector<HTMLOutputElement>(`[data-output="${key}"]`);
  if (output) output.value = value;
}

function escapeText(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character] ?? character);
}

function escapeAttribute(value: string): string {
  return escapeText(value);
}
