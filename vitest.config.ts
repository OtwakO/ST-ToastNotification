// Runs portable public-behavior tests in a browser-like DOM.
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    restoreMocks: true,
  },
});
