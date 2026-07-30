// Verifies the public Whisper configuration contract independently of the DOM renderer.
import { describe, expect, it } from 'vitest';

import { resolveWhisperOptions } from './whisper';

describe('resolveWhisperOptions', () => {
  it('returns approved defaults while preserving notifier-level overrides', () => {
    expect(resolveWhisperOptions()).toEqual({
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
    });

    expect(
      resolveWhisperOptions({
        accent1: '#abcdef',
        durationMs: 1200,
        position: 'bottom-right',
        maxVisible: 1,
      }),
    ).toMatchObject({
      preset: 'whisper',
      accent1: '#abcdef',
      durationMs: 1200,
      position: 'bottom-right',
      maxVisible: 1,
    });
  });

  it('rejects invalid settings at the public resolver boundary', () => {
    expect(() => resolveWhisperOptions({ durationMs: 0 })).toThrow(
      'durationMs must be greater than 0',
    );
    expect(() => resolveWhisperOptions({ titleFontSizePx: Number.NaN })).toThrow(
      'titleFontSizePx must be a finite number greater than 0',
    );
    expect(() => resolveWhisperOptions({ maxVisible: 1.5 })).toThrow(
      'maxVisible must be a positive integer',
    );
    expect(() => resolveWhisperOptions({ zIndex: -1 })).toThrow(
      'zIndex must be a non-negative integer',
    );
    expect(() => resolveWhisperOptions({ primary: 'red' })).toThrow(
      'primary must be a six-digit hex color',
    );
    expect(() =>
      resolveWhisperOptions({ accent1: '#fff;}.toast{display:none' }),
    ).toThrow('accent1 must be a six-digit hex color');
  });
});
