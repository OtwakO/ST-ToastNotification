// Verifies the package entry point remains DOM-free until the lazy singleton is used.
import { afterEach, describe, expect, it } from 'vitest';

afterEach(() => {
  document.body.replaceChildren();
});

describe('public entry point', () => {
  it('exports a lazy singleton and an isolated notifier factory', async () => {
    const library = await import('./index');

    expect(document.body.children).toHaveLength(0);
    expect(typeof library.createNotifier).toBe('function');
    const handle = library.toast.show({ message: 'Ready' });
    expect(handle.id).toBe('st-toast-1');
    expect(document.querySelectorAll('[data-st-toast-host]')).toHaveLength(1);
  });
});
