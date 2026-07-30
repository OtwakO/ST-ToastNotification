// Builds the portable browser library without bundling runtime dependencies.
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'STToastNotification',
      formats: ['es', 'umd'],
      fileName: (format) =>
        format === 'es'
          ? 'st-toast-notification.js'
          : 'st-toast-notification.umd.cjs',
    },
  },
});
