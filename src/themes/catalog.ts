// Exposes the build-generated catalog without coupling runtime code to a theme identity.
import generated from '../generated/theme-catalog.json';
import type { ThemeCatalog } from './types';

export const themeCatalog = generated as ThemeCatalog;

export function getTheme(themeId?: string): ThemeCatalog['themes'][string] | undefined {
  const id = themeId ?? themeCatalog.defaultThemeId;
  return themeCatalog.themes[id];
}

export function listThemes(): readonly { id: string; name: string; description?: string }[] {
  return Object.values(themeCatalog.themes).map(({ id, name, description }) => ({
    id,
    name,
    description,
  }));
}
