# Architecture

## Project shape

ST-ToastNotification is a library-first repository with a thin SillyTavern adapter. The portable notification module is the product core; SillyTavern installation and settings are consumers of that module rather than dependencies of it.

```text
src/
├── toast/           Portable renderer and its public interface
├── themes/          Built-in theme definitions using the stable theme contract
└── sillytavern/     SillyTavern settings, lifecycle, and invocation adapters
demo/                Standalone visual and integration showcase
dist/                Generated browser artifacts
index.js              Generated SillyTavern manifest entry
manifest.json         SillyTavern extension metadata
```

The exact source files may be refined during implementation, but these three module seams must remain distinct.

## Public interface

The portable module exposes a convenient singleton and an optional constructor for isolated instances:

```ts
import { toast, createNotifier } from "st-toast-notification";

toast.show({ message: "Memory recalled" });

const notifier = createNotifier(options);
const handle = notifier.show(notification);
```

The notifier owns DOM creation, queueing, timing, accessibility announcements, preset resolution, and cleanup. Callers provide content and intent, not DOM markup, animation steps, or per-notification visual overrides. The returned handle supports dismissal without exposing renderer internals.

## Adapters

- **ESM adapter**: direct imports from a local package or pinned CDN artifact.
- **Global adapter**: a namespaced `globalThis.STToastNotification` bridge over the same module.
- **Custom-event adapter**: a documented DOM event translated into `show()` calls.
- **SillyTavern adapter**: initializes persistent settings, preview controls, and adapter lifecycle through `SillyTavern.getContext()`.

No adapter implements its own renderer or theme behavior.

## Theme contract

Structural CSS remains owned by the renderer inside a Shadow DOM root. Built-in presets supply validated tokens. V1 ships Whisper and allows notifier-level customization of six colors plus title and detail font sizes. Presets do not replace renderer markup.

V1 does not support user-created presets, preset import/export, arbitrary third-party registration, or per-notification visual overrides. The SillyTavern adapter persists only the selected built-in preset and current configuration values.

## Rendering and performance

- Create one fixed host and Shadow DOM root lazily.
- Keep the host outside SillyTavern layout flow.
- Presets define constrained motion. Whisper animates opacity only and never transforms its glyph-bearing subtree; avoid animation-time layout measurements.
- Cap simultaneously visible notifications and queue or coalesce overflow.
- Remove completed nodes and listeners.
- Use pointer pass-through unless an explicit interactive notification is introduced later.
- Respect `prefers-reduced-motion`.

## Distribution

The build produces a browser ESM artifact and an optional IIFE/global artifact. Git tags provide immutable version targets for CDN consumers. The installable SillyTavern extension commits or packages local generated artifacts so normal operation has no CDN dependency.

## Security and compatibility

Notification text is rendered as text by default, not injected HTML. The portable module does not access SillyTavern globals. The SillyTavern adapter prefers `SillyTavern.getContext()` over imports from internal source paths.
