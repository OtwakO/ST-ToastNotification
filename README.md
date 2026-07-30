# ST-ToastNotification

A lightweight, configurable toast module and SillyTavern extension.

## Status

The portable TypeScript core, **Whisper** preset, invocation bridges, and installable SillyTavern adapter are implemented. Real-client compatibility verification remains before the first release.

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

Browser extensions that cannot import the module directly can install the optional bridges:

```ts
import { installBridges, toast } from 'st-toast-notification';

const cleanup = installBridges(toast);
```

This exposes `globalThis.STToastNotification.show(input)` and listens for:

```js
document.dispatchEvent(new CustomEvent('st-toast:show', {
  detail: { message: 'Memory recalled', tone: 'info' },
}));
```

Call `cleanup()` when the consuming extension unloads.

## SillyTavern installation

Install the repository URL through SillyTavern's extension manager:

```text
https://github.com/OtwakO/ST-ToastNotification
```

The extension adds a **Toast Notifications** drawer to extension settings. It persists only the selected built-in preset, six colors, title/detail sizes, duration, position, and maximum visible count. Controls use native color pickers, ranges, and selects, with Preview and Reset actions.

Other SillyTavern extensions can invoke it without importing internal files:

```js
globalThis.STToastNotification.show({
  message: 'Memory recalled',
  tone: 'success',
});
```

Or dispatch the documented `st-toast:show` event shown above. The adapter never infers another extension's activity automatically.

## Verify and build

```bash
npm run typecheck
npm test
npm run build
```

Generated portable ESM, UMD, and TypeScript declaration files are written to `dist/`. A self-contained extension package is generated under `dist/extension/`, while root `manifest.json`, `index.js`, `style.css`, and `assets/fonts/` support direct installation from GitHub.
