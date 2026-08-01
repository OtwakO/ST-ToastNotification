// Owns the small versioned settings record persisted by SillyTavern.
import { getTheme, themeCatalog } from '../themes/catalog';
import { resolveThemeTokens } from '../themes/resolve';
import type { ThemeTokenValue } from '../themes/types';
import type { ToastPosition } from '../toast/notifier';

export const SETTINGS_KEY = 'st_toast_notification';
export const SETTINGS_VERSION = 2;

export interface ExtensionSettings {
  version: 2;
  themeId: string;
  behavior: {
    durationMs: number;
    position: ToastPosition;
    maxVisible: number;
  };
  themeOverrides: Record<string, Record<string, ThemeTokenValue>>;
}

const positions: readonly ToastPosition[] = [
  'top-left',
  'top-center',
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
];

export const defaultSettings: Readonly<ExtensionSettings> = {
  version: SETTINGS_VERSION,
  themeId: themeCatalog.defaultThemeId,
  behavior: {
    durationMs: 3600,
    position: 'top-center',
    maxVisible: 3,
  },
  themeOverrides: {},
};

export function loadSettings(
  extensionSettings: Record<string, unknown>,
): ExtensionSettings {
  const stored = asRecord(extensionSettings[SETTINGS_KEY]);
  const settings = stored?.version === SETTINGS_VERSION
    ? readVersionTwo(stored)
    : migrateLegacy(stored);
  extensionSettings[SETTINGS_KEY] = settings;
  return settings;
}

export function activeThemeTokens(
  settings: ExtensionSettings,
): Record<string, ThemeTokenValue> {
  const theme = getTheme(settings.themeId) ?? getTheme();
  if (!theme) return {};
  return resolveThemeTokens(theme, settings.themeOverrides[theme.id] ?? {});
}

function readVersionTwo(stored: Record<string, unknown>): ExtensionSettings {
  const themeId = validThemeId(stored.themeId) ?? defaultSettings.themeId;
  const behavior = readBehavior(asRecord(stored.behavior));
  return {
    version: SETTINGS_VERSION,
    themeId,
    behavior,
    themeOverrides: readThemeOverrides(stored.themeOverrides),
  };
}

function migrateLegacy(stored: Record<string, unknown> | undefined): ExtensionSettings {
  const themeId = validThemeId(stored?.themeId ?? stored?.preset) ?? defaultSettings.themeId;
  const theme = getTheme(themeId) ?? getTheme();
  const overrides: Record<string, Record<string, ThemeTokenValue>> = {};
  if (theme) {
    const migrated: Record<string, ThemeTokenValue> = {};
    for (const [tokenId, definition] of Object.entries(theme.tokens)) {
      const keys = [tokenId, ...(definition.legacyKeys ?? [])];
      const legacyKey = keys.find((key) => Object.hasOwn(stored ?? {}, key));
      if (legacyKey && stored) migrated[tokenId] = stored[legacyKey] as ThemeTokenValue;
    }
    const valid = validOverrides(theme.id, migrated);
    if (Object.keys(valid).length > 0) overrides[theme.id] = valid;
  }
  return {
    version: SETTINGS_VERSION,
    themeId: theme?.id ?? defaultSettings.themeId,
    behavior: readBehavior(stored),
    themeOverrides: overrides,
  };
}

function readBehavior(stored: Record<string, unknown> | undefined) {
  const durationMs = readNumber(stored?.durationMs, defaultSettings.behavior.durationMs);
  const maxVisible = readNumber(stored?.maxVisible, defaultSettings.behavior.maxVisible);
  return {
    durationMs: Number.isFinite(durationMs) && durationMs > 0
      ? durationMs
      : defaultSettings.behavior.durationMs,
    position: positions.includes(stored?.position as ToastPosition)
      ? (stored?.position as ToastPosition)
      : defaultSettings.behavior.position,
    maxVisible: Number.isInteger(maxVisible) && maxVisible > 0
      ? maxVisible
      : defaultSettings.behavior.maxVisible,
  };
}

function readThemeOverrides(value: unknown): Record<string, Record<string, ThemeTokenValue>> {
  const result: Record<string, Record<string, ThemeTokenValue>> = {};
  const stored = asRecord(value);
  if (!stored) return result;
  for (const [themeId, overrides] of Object.entries(stored)) {
    const record = asRecord(overrides);
    if (validThemeId(themeId) && record) {
      result[themeId] = validOverrides(themeId, record);
    }
  }
  return result;
}

function validOverrides(
  themeId: string,
  candidate: Record<string, unknown>,
): Record<string, ThemeTokenValue> {
  const theme = getTheme(themeId);
  if (!theme) return {};
  const result: Record<string, ThemeTokenValue> = {};
  for (const [tokenId, value] of Object.entries(candidate)) {
    if (!theme.tokens[tokenId]) continue;
    try {
      resolveThemeTokens(theme, { [tokenId]: value as ThemeTokenValue });
      result[tokenId] = value as ThemeTokenValue;
    } catch {
      // Discard one invalid value without losing other valid settings.
    }
  }
  return result;
}

function validThemeId(value: unknown): string | undefined {
  return typeof value === 'string' && Boolean(getTheme(value)) ? getTheme(value)?.id : undefined;
}

function readNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' ? value : fallback;
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined;
}
