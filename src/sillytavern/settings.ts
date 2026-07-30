// Owns the minimal JSON-serializable settings persisted by SillyTavern.
import {
  resolveWhisperOptions,
  whisperDefaults,
  type NotifierOptions,
  type ToastPosition,
} from '../themes/whisper';

export const SETTINGS_KEY = 'st_toast_notification';

export type ExtensionSettings = Required<Omit<NotifierOptions, 'zIndex'>>;

export const defaultSettings: Readonly<ExtensionSettings> = {
  preset: 'whisper',
  primary: whisperDefaults.primary,
  accent1: whisperDefaults.accent1,
  accent2: whisperDefaults.accent2,
  accent3: whisperDefaults.accent3,
  foreground: whisperDefaults.foreground,
  mutedForeground: whisperDefaults.mutedForeground,
  titleFontSizePx: whisperDefaults.titleFontSizePx,
  detailFontSizePx: whisperDefaults.detailFontSizePx,
  durationMs: whisperDefaults.durationMs,
  position: whisperDefaults.position,
  maxVisible: whisperDefaults.maxVisible,
};

const positions: readonly ToastPosition[] = [
  'top-left',
  'top-center',
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
];

export function loadSettings(
  extensionSettings: Record<string, unknown>,
): ExtensionSettings {
  const stored = isRecord(extensionSettings[SETTINGS_KEY])
    ? extensionSettings[SETTINGS_KEY]
    : {};
  const candidate: ExtensionSettings = {
    preset: stored.preset === 'whisper' ? 'whisper' : defaultSettings.preset,
    primary: readString(stored.primary, defaultSettings.primary),
    accent1: readString(stored.accent1, defaultSettings.accent1),
    accent2: readString(stored.accent2, defaultSettings.accent2),
    accent3: readString(stored.accent3, defaultSettings.accent3),
    foreground: readString(stored.foreground, defaultSettings.foreground),
    mutedForeground: readString(
      stored.mutedForeground,
      defaultSettings.mutedForeground,
    ),
    titleFontSizePx: readNumber(
      stored.titleFontSizePx,
      defaultSettings.titleFontSizePx,
    ),
    detailFontSizePx: readNumber(
      stored.detailFontSizePx,
      defaultSettings.detailFontSizePx,
    ),
    durationMs: readNumber(stored.durationMs, defaultSettings.durationMs),
    position: positions.includes(stored.position as ToastPosition)
      ? (stored.position as ToastPosition)
      : defaultSettings.position,
    maxVisible: readNumber(stored.maxVisible, defaultSettings.maxVisible),
  };

  let settings = candidate;
  try {
    resolveWhisperOptions(candidate);
  } catch {
    settings = { ...defaultSettings };
  }
  extensionSettings[SETTINGS_KEY] = settings;
  return settings;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readString(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback;
}

function readNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' ? value : fallback;
}
