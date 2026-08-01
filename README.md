# ST-ToastNotification

A lightweight, configurable toast module and SillyTavern extension.

## Status

The portable TypeScript core, generated bundled theme catalog, invocation bridges, and installable SillyTavern adapter are implemented. Whisper is the default file-based theme pack; real-client compatibility verification remains before the first release.

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
  themeId: 'whisper',
  themeOverrides: {
    accent1: '#e0ccaa',
    foreground: '#f5f0e8',
    titleFontSizePx: 14,
    detailFontSizePx: 10,
  },
  durationMs: 3600,
  position: 'top-center',
  maxVisible: 3,
});

notifier.show({ message: '4 memories retained', lang: 'en' });
```

Appearance is configured per notifier through the selected theme's declared tokens. Add a bundled theme by dropping a valid folder under `themes/` and running the build; no notifier or settings TypeScript changes are required. V1 deliberately does not support remote packs, theme JavaScript, or user-created themes through settings.

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

## Adding a bundled theme

Create a folder with the required pack files:

```text
themes/my-theme/
├── theme.json
├── template.html
└── theme.css
```

`theme.json` declares the theme ID, display name, and any theme-specific editable tokens. Every generated pack also receives the shared ten-color palette from `themes/catalog.json`: `primary`, `secondary`, `accent1`–`accent6`, `foreground`, and `mutedForeground`. A theme opts into a color by referencing its `--st-token-*` variable in `theme.css`; unreferenced color controls are shown disabled as **Unused by this theme** in SillyTavern. `template.html` must contain exactly one `data-toast-root` and one `data-toast-slot="message"`; optional `detail` and `tone-label` slots are supported. `theme.css` must use scoped selectors and declared token variables. Scripts, inline handlers, remote URLs, and executable markup are rejected during generation.

Run:

```bash
npm run themes:generate
npm test
npm run build
```

The generated catalog is embedded in both library and extension builds. `themes/catalog.json` selects the default and can provide full validated entry overrides. Whisper is not special: it is simply the initial `defaultThemeId`.

## SillyTavern installation

Install the repository URL through SillyTavern's extension manager:

```text
https://github.com/OtwakO/ST-ToastNotification
```

The extension adds a collapsed-by-default **Toast Notifications** drawer to extension settings. It persists the selected theme, behavior values, and per-theme token overrides. Controls are generated from each theme manifest using native color pickers, ranges, numbers, selects, and checkboxes, with unused shared colors visibly disabled plus Preview and Reset actions. Whisper is only the initial default selection.

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
