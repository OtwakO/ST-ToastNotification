// Verifies generic theme token resolution independently of any theme identity.
import { describe, expect, it } from 'vitest';

import { resolveThemeTokens, tokenVariableName } from './resolve';
import type { ThemePack } from './types';

const theme: ThemePack = {
  schemaVersion: 1,
  id: 'fixture',
  name: 'Fixture',
  tokens: {
    ink: { type: 'color', label: 'Ink', default: '#112233' },
    size: { type: 'range', label: 'Size', default: 12, min: 8, max: 20, step: 1 },
    mode: {
      type: 'select',
      label: 'Mode',
      default: 'quiet',
      options: [{ value: 'quiet', label: 'Quiet' }, { value: 'loud', label: 'Loud' }],
    },
    enabled: { type: 'boolean', label: 'Enabled', default: true },
  },
  template: '<div data-toast-root><span data-toast-slot="message"></span></div>',
  css: '[data-toast-root] { color: var(--st-token-ink); }',
};

describe('resolveThemeTokens', () => {
  it('returns defaults and validated notifier-level overrides', () => {
    expect(resolveThemeTokens(theme, { ink: '#abcdef', size: 16 })).toEqual({
      ink: '#abcdef',
      size: 16,
      mode: 'quiet',
      enabled: true,
    });
  });

  it('rejects unknown and invalid token values', () => {
    expect(() => resolveThemeTokens(theme, { missing: 'x' })).toThrow(
      'Unknown theme token: missing',
    );
    expect(() => resolveThemeTokens(theme, { ink: 'red' })).toThrow(
      'ink must be a six-digit hex color',
    );
    expect(() => resolveThemeTokens(theme, { size: 30 })).toThrow(
      'size must be within its declared bounds',
    );
    expect(() => resolveThemeTokens(theme, { mode: 'unknown' })).toThrow(
      'mode must be one of the declared options',
    );
  });
});

describe('tokenVariableName', () => {
  it('converts token IDs to stable CSS custom-property names', () => {
    expect(tokenVariableName('titleFontSizePx')).toBe(
      '--st-token-title-font-size-px',
    );
  });
});
