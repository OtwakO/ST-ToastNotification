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

The portable module exposes one primary constructor and one primary action:

```ts
const notifier = createNotifier(options);
const handle = notifier.show(notification);
```

The notifier owns DOM creation, queueing, timing, accessibility announcements, theme resolution, and cleanup. Callers provide content and intent, not DOM markup or animation steps. The returned handle may support dismissal and lifecycle observation without exposing renderer internals.

## Adapters

- **ESM adapter**: direct imports from a local package or pinned CDN artifact.
- **Global adapter**: a namespaced `globalThis.STToastNotification` bridge over the same module.
- **Custom-event adapter**: a documented DOM event translated into `show()` calls.
- **SillyTavern adapter**: initializes persistent settings, preview controls, and adapter lifecycle through `SillyTavern.getContext()`.

No adapter implements its own renderer or theme behavior.

## Theme contract

Structural CSS remains owned by the renderer inside a Shadow DOM root. Themes supply validated design tokens such as surface, foreground, accent, radius, spacing, typography, shadow, and motion values. Themes do not replace renderer markup in the first release.

Built-in and third-party themes use the same registration path. Per-instance or per-notification token overrides may be supported where they do not weaken validation or accessibility.

## Rendering and performance

- Create one fixed host and Shadow DOM root lazily.
- Keep the host outside SillyTavern layout flow.
- Animate `opacity` and `transform`; avoid animation-time layout measurements.
- Cap simultaneously visible notifications and queue or coalesce overflow.
- Remove completed nodes and listeners.
- Use pointer pass-through unless an explicit interactive notification is introduced later.
- Respect `prefers-reduced-motion`.

## Distribution

The build produces a browser ESM artifact and an optional IIFE/global artifact. Git tags provide immutable version targets for CDN consumers. The installable SillyTavern extension commits or packages local generated artifacts so normal operation has no CDN dependency.

## Security and compatibility

Notification text is rendered as text by default, not injected HTML. The portable module does not access SillyTavern globals. The SillyTavern adapter prefers `SillyTavern.getContext()` over imports from internal source paths.
