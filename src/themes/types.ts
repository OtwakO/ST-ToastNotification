// Defines the generic declarative theme-pack contract shared by all themes.
export type ThemeTokenValue = string | number | boolean;

export interface ThemeTokenBase {
  label: string;
  default: ThemeTokenValue;
  legacyKeys?: readonly string[];
}

export interface ColorToken extends ThemeTokenBase {
  type: 'color';
  default: string;
  /** Generated from theme.css; false means the shared slot is available but unused. */
  used?: boolean;
}

export interface NumericToken extends ThemeTokenBase {
  type: 'range' | 'number';
  default: number;
  min: number;
  max: number;
  step: number;
  unit?: 'px' | 'rem' | 'em';
}

export interface SelectToken extends ThemeTokenBase {
  type: 'select';
  default: string;
  options: readonly { value: string; label: string }[];
}

export interface BooleanToken extends ThemeTokenBase {
  type: 'boolean';
  default: boolean;
}

export type ThemeTokenDefinition =
  | ColorToken
  | NumericToken
  | SelectToken
  | BooleanToken;

export interface ThemeManifest {
  schemaVersion: 1;
  id: string;
  name: string;
  description?: string;
  tokens: Readonly<Record<string, ThemeTokenDefinition>>;
}

export interface ThemePack extends ThemeManifest {
  template: string;
  css: string;
}

export interface ThemeCatalog {
  schemaVersion: 1;
  defaultThemeId: string;
  themes: Readonly<Record<string, ThemePack>>;
}
