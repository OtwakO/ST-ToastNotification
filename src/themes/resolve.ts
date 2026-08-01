// Resolves and validates generic theme tokens before they reach CSS variables.
import type {
  ThemePack,
  ThemeTokenDefinition,
  ThemeTokenValue,
} from './types';

export function resolveThemeTokens(
  theme: ThemePack,
  overrides: Record<string, ThemeTokenValue> = {},
): Record<string, ThemeTokenValue> {
  for (const id of Object.keys(overrides)) {
    if (!theme.tokens[id]) throw new TypeError(`Unknown theme token: ${id}`);
  }
  return Object.fromEntries(
    Object.entries(theme.tokens).map(([id, definition]) => [
      id,
      validateValue(id, definition, overrides[id] ?? definition.default),
    ]),
  );
}

function validateValue(
  id: string,
  definition: ThemeTokenDefinition,
  value: ThemeTokenValue,
): ThemeTokenValue {
  if (definition.type === 'color') {
    if (typeof value !== 'string' || !/^#[0-9a-f]{6}$/i.test(value)) {
      throw new TypeError(`${id} must be a six-digit hex color`);
    }
    return value;
  }
  if (definition.type === 'boolean') {
    if (typeof value !== 'boolean') throw new TypeError(`${id} must be boolean`);
    return value;
  }
  if (definition.type === 'select') {
    if (typeof value !== 'string' || !definition.options.some((option) => option.value === value)) {
      throw new TypeError(`${id} must be one of the declared options`);
    }
    return value;
  }
  if (typeof value !== 'number' || !Number.isFinite(value) || value < definition.min || value > definition.max) {
    throw new RangeError(`${id} must be within its declared bounds`);
  }
  return value;
}

export function tokenVariableName(id: string): string {
  return `--st-token-${id.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`;
}

export function tokenCssValue(
  theme: ThemePack,
  id: string,
  value: ThemeTokenValue,
): string {
  const definition = theme.tokens[id];
  if (!definition) throw new TypeError(`Unknown theme token: ${id}`);
  if ((definition.type === 'range' || definition.type === 'number') && definition.unit) {
    return `${value}${definition.unit}`;
  }
  return String(value);
}
