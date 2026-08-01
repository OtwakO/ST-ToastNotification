# Architecture

## Project shape

ST-ToastNotification is a library-first repository with a thin SillyTavern adapter. The portable notification module is the product core; SillyTavern installation and settings are consumers of that module rather than dependencies of it.

```text
themes/              Declarative theme packs and editable catalog data
src/
├── generated/       Build-generated embedded theme catalog
├── toast/           Portable renderer and its public interface
├── themes/          Generic catalog, template, and token modules
└── sillytavern/     SillyTavern settings, lifecycle, and invocation adapters
scripts/themes/      Theme discovery, validation, and catalog generation
demo/                Standalone visual and integration showcase
dist/                Generated browser artifacts
index.js             Generated SillyTavern manifest entry
manifest.json        SillyTavern extension metadata
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

The notifier owns DOM creation, queueing, timing, accessibility announcements, generic theme-pack resolution, and cleanup. Callers provide content and intent, not DOM markup, animation steps, or per-notification visual overrides. The returned handle supports dismissal without exposing renderer internals.

## Adapters

- **ESM adapter**: direct imports from a local package or pinned CDN artifact.
- **Global adapter**: a namespaced `globalThis.STToastNotification` bridge over the same module.
- **Custom-event adapter**: a documented DOM event translated into `show()` calls.
- **SillyTavern adapter**: initializes persistent settings, preview controls, and adapter lifecycle through `SillyTavern.getContext()`.

No adapter implements its own renderer or theme behavior.

## Theme-pack contract

Every bundled theme is an ordinary file-based pack containing `theme.json`, `template.html`, and `theme.css`. A build step discovers pack folders, validates them, merges editable catalog entries, and embeds the resulting catalog into every runtime build. Whisper is only the initial default catalog entry and has no privileged TypeScript path.

Templates use validated named data slots. The renderer clones the selected template, inserts caller text with `textContent`, and retains ownership of accessibility, lifecycle, queueing, viewport placement, and live regions. Theme JavaScript, scripts, inline handlers, arbitrary roles, and executable behavior are forbidden.

Theme manifests declare configurable tokens. The SillyTavern adapter generates native controls from those declarations and persists behavior plus per-theme overrides. V1 supports bundled packs only; remote loading, user-authored themes through the settings UI, and per-notification visual overrides remain out of scope.

The ordinary-theme invariant is: deleting `themes/whisper/` and changing only the catalog default to another valid pack must leave generation, rendering, settings, tests, and builds functional without TypeScript edits.

## Rendering and performance

- Create one fixed host and Shadow DOM root lazily.
- Keep the host outside SillyTavern layout flow.
- Theme packs define constrained motion. The selected first pack uses opacity-only animation and never transforms its glyph-bearing subtree; avoid animation-time layout measurements.
- Cap simultaneously visible notifications and queue or coalesce overflow.
- Remove completed nodes and listeners.
- Use pointer pass-through unless an explicit interactive notification is introduced later.
- Respect `prefers-reduced-motion`.

## Distribution

The build produces browser ESM and UMD artifacts plus TypeScript declarations. Git tags provide immutable version targets for CDN consumers. The installable SillyTavern extension commits or packages local generated artifacts so normal operation has no CDN dependency.

## Security and compatibility

Notification text is rendered as text by default, not injected HTML. The portable module does not access SillyTavern globals. The SillyTavern adapter prefers `SillyTavern.getContext()` over imports from internal source paths.
