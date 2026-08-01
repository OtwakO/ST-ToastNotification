// Verifies the runtime catalog is selected by data and exposes no theme-specific API.
import { describe, expect, it } from 'vitest';

import { getTheme, listThemes, themeCatalog } from './catalog';

describe('theme catalog', () => {
  it('loads the default pack through the generic catalog interface', () => {
    const theme = getTheme();
    expect(theme?.id).toBe(themeCatalog.defaultThemeId);
    expect(listThemes().map(({ id }) => id)).toContain(themeCatalog.defaultThemeId);
    expect(theme?.template).toContain('data-toast-slot="message"');
  });
});
