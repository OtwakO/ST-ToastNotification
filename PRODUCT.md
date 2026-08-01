# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The primary users are SillyTavern extension authors who need lightweight, polished, non-obtrusive notifications without depending on SillyTavern's built-in toast system. SillyTavern end users are the secondary audience through extensions that embed the module and expose theme preferences.

## Product Purpose

ST-ToastNotification provides a portable browser notification module for brief contextual feedback such as memory recall, retention, and background extension activity. Success means an extension author can import it, show a polished notification through a small interface, customize its visual system extensively, and reuse it outside this repository without SillyTavern-specific dependencies.

## Positioning

The module combines a framework-free notification renderer, strongly isolated styling, and an extensible theme contract with a thin optional SillyTavern adapter. Memory-oriented copy and SillyTavern integration remain outside the portable renderer.

## Operating Context

Notifications appear over SillyTavern's chat interface while users read or generate roleplay conversations. They must remain visible without obstructing chat content or controls. Other extensions may consume the module through an ESM import, a namespaced global bridge, or a DOM custom event.

## Capabilities and Constraints

- TypeScript source with built JavaScript artifacts for browser consumption.
- Framework-free and runtime-dependency-free portable renderer.
- Shadow DOM style isolation with a generated catalog of declarative theme packs and notifier-level token configuration.
- Preferred CDN consumption uses version-pinned ESM artifacts; the installed extension uses a local bundled artifact and does not require network access.
- Initial project scope includes the reusable library, a thin SillyTavern adapter with settings and previews, and a standalone visual demo.
- Default notification position is top-center.
- The renderer accepts arbitrary caller-provided text and does not infer memory events.
- The first release exposes ESM, namespaced global, and custom-event invocation when these remain simple adapters over one interface.
- Notifications must minimize layout work; each theme declares its own constrained motion, and the selected first pack uses opacity-only animation to preserve text clarity.
- V1 persists only selected theme, behavior values, and per-theme token overrides.
- V1 uses native browser settings controls generated from theme manifests and excludes user-created themes, remote packs, and per-notification visual overrides.

## Brand Commitments

The product name is ST-ToastNotification. Notifications should feel non-obtrusive, polished, compact, and suitable for visual-novel-like feedback such as “Memory recalled” or “This moment will be remembered.” Whisper is the first bundled pack and default catalog selection; it is not a privileged runtime theme.

## Evidence on Hand

No production visual assets, user research, benchmarks, testimonials, or existing interface are available. Future work must not fabricate performance claims or compatibility guarantees.

## Product Principles

1. Keep the portable module independent of SillyTavern and consuming-extension logic.
2. Hide queueing, lifecycle, accessibility, rendering, and theme resolution behind a small interface.
3. Make customization broad through stable tokens before exposing markup replacement.
4. Prefer reliable local bundles while supporting pinned CDN imports for reuse.
5. Treat quiet feedback as ambient context, not an interruption demanding action.

## Accessibility & Inclusion

Target WCAG 2.2 AA. Respect reduced-motion preferences, maintain readable contrast, provide assistive announcements with configurable semantics, and never communicate meaning through color alone.
