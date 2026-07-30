// Defines and resolves the built-in Whisper notifier-level token contract.
export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export interface NotifierOptions {
  preset?: 'whisper';
  primary?: string;
  accent1?: string;
  accent2?: string;
  accent3?: string;
  foreground?: string;
  mutedForeground?: string;
  titleFontSizePx?: number;
  detailFontSizePx?: number;
  durationMs?: number;
  position?: ToastPosition;
  maxVisible?: number;
  zIndex?: number;
}

export interface ResolvedNotifierOptions {
  preset: 'whisper';
  primary: string;
  accent1: string;
  accent2: string;
  accent3: string;
  foreground: string;
  mutedForeground: string;
  titleFontSizePx: number;
  detailFontSizePx: number;
  durationMs: number;
  position: ToastPosition;
  maxVisible: number;
  zIndex: number;
}

export const whisperDefaults: Readonly<ResolvedNotifierOptions> = {
  preset: 'whisper',
  primary: '#141214',
  accent1: '#e0ccaa',
  accent2: '#f3e6cf',
  accent3: '#eedcbe',
  foreground: '#f5f0e8',
  mutedForeground: '#d8cec0',
  titleFontSizePx: 14,
  detailFontSizePx: 10,
  durationMs: 3600,
  position: 'top-center',
  maxVisible: 3,
  zIndex: 2147483646,
};

export function resolveWhisperOptions(
  options: NotifierOptions = {},
): ResolvedNotifierOptions {
  const resolved: ResolvedNotifierOptions = {
    ...whisperDefaults,
    ...options,
    preset: 'whisper',
  };

  validateHexColor('primary', resolved.primary);
  validateHexColor('accent1', resolved.accent1);
  validateHexColor('accent2', resolved.accent2);
  validateHexColor('accent3', resolved.accent3);
  validateHexColor('foreground', resolved.foreground);
  validateHexColor('mutedForeground', resolved.mutedForeground);
  validatePositiveNumber('titleFontSizePx', resolved.titleFontSizePx);
  validatePositiveNumber('detailFontSizePx', resolved.detailFontSizePx);
  if (!Number.isFinite(resolved.durationMs) || resolved.durationMs <= 0) {
    throw new RangeError('durationMs must be greater than 0');
  }
  if (!Number.isInteger(resolved.maxVisible) || resolved.maxVisible <= 0) {
    throw new RangeError('maxVisible must be a positive integer');
  }
  if (!Number.isInteger(resolved.zIndex) || resolved.zIndex < 0) {
    throw new RangeError('zIndex must be a non-negative integer');
  }

  return resolved;
}

function validateHexColor(name: string, value: string): void {
  if (!/^#[0-9a-f]{6}$/i.test(value)) {
    throw new TypeError(`${name} must be a six-digit hex color`);
  }
}

function validatePositiveNumber(name: string, value: number): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} must be a finite number greater than 0`);
  }
}
