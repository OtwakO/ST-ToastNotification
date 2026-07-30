# ST-ToastNotification

A lightweight, configurable toast module and SillyTavern extension.

## Status

The portable TypeScript core and the first built-in preset, **Whisper**, are implemented. Thin invocation bridges and the SillyTavern settings adapter are the next phase.

## Local setup

Requires Node.js 22 or newer.

```bash
git clone https://github.com/OtwakO/ST-ToastNotification.git
cd ST-ToastNotification
npm ci
```

## Usage

Use the lazy singleton for the common case:

```ts
import { toast } from 'st-toast-notification';

toast.show({
  message: 'Memory recalled',
  detail: 'A distant moment returns.',
  tone: 'success',
});
```

Create an isolated notifier when an extension needs its own persistent settings:

```ts
import { createNotifier } from 'st-toast-notification';

const notifier = createNotifier({
  accent1: '#e0ccaa',
  foreground: '#f5f0e8',
  titleFontSizePx: 14,
  detailFontSizePx: 10,
  durationMs: 3600,
  position: 'top-center',
  maxVisible: 3,
});

notifier.show({ message: '4 memories retained', lang: 'en' });
```

Appearance is configured per notifier. V1 deliberately does not support per-toast styling or user-created presets.

## Verify and build

```bash
npm run typecheck
npm test
npm run build
```

Generated ESM, UMD, and TypeScript declaration files are written to `dist/`. The installable SillyTavern adapter is not implemented yet.
