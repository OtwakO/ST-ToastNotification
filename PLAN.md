# Project Plan

## Objective

Build and maintain ST-ToastNotification as a SillyTavern extension. The functional requirements and implementation architecture will be documented before extension code is added.

## Architecture overview

The project is library-first: a framework-free portable notification module owns rendering, lifecycle, queueing, accessibility, and theme resolution behind a small interface. Theme definitions are separate adapters over a stable token contract. A thin SillyTavern adapter provides settings, previews, and invocation bridges without coupling the renderer to SillyTavern. See `docs/ARCHITECTURE.md`.

## Implementation phases

1. **Repository setup** — complete; Git, baseline documentation, and GitHub remote are established.
2. **Requirements and architecture** — in progress; core module and distribution decisions are documented, while the initial visual preset is being selected through a throwaway prototype.
3. **Portable module** — implement the renderer, queue, lifecycle, accessibility behavior, and theme contract test-first.
4. **Distribution adapters** — produce ESM and optional IIFE builds plus global and custom-event bridges over the same interface.
5. **SillyTavern adapter** — add the manifest entry, persistent settings, preview controls, and local bundled integration.
6. **Verification and documentation** — verify browser and SillyTavern behavior, performance constraints, accessibility, builds, and usage documentation.

## Current state

- **Active phase**: Requirements and architecture.
- **Completed**: Repository setup; product scope; library-first architecture; TypeScript, Shadow DOM, distribution, accessibility, adapter, and default-position decisions.
- **Completed**: User selected Whisper as the first production preset. Its durable typography and clarity rules are recorded in `DESIGN.md`.
- **Completed**: Corrected CJK blur and selected Fontsource Noto Sans SC/TC variable WOFF2 distributions for consistent regional Chinese rendering.
- **Completed**: Verified the selected font strategy and text-sharpness constraints in the Whisper prototype.
- **In progress**: User review of Whisper's borderless warm-beige ink veil with masked transparent side fades and independently opaque centered content.
- **Next**: Archive the prototype decision and begin TDD implementation of the portable module and Whisper theme, with regional font stylesheets loaded lazily outside the mandatory core payload.
- **Environment**: GitHub repository `OtwakO/ST-ToastNotification`; default branch `main`.

## Open questions

- Which SillyTavern minimum client version should be declared after integration testing?
- Should overflow queueing coalesce repeated notifications by caller-provided key in the first release?

## Out of scope

- Automatic inference of another extension's memory operations without an explicit call or documented event.
- Arbitrary caller-supplied renderer markup in the first release.
- A runtime CDN dependency for the installed SillyTavern extension.
- Publishing to SillyTavern extension registries before implementation and verification.

## Issues & Fixes

### [2026-07-31] Whisper Chinese text appeared blurry
- **Problem**: The selected Whisper prototype applied `filter: drop-shadow()` and text shadow to the glyph-bearing toast, while italic Georgia forced Chinese through synthesized fallback rendering.
- **Fix**: Removed glyph-layer filtering and text shadow, added upright semibold Chinese styling, increased supporting-text size, and vendored Unicode-partitioned Noto Sans SC/TC variable fonts for consistent availability.
- **Affected**: `demo/toast-style-prototype/index.html`, `DESIGN.md`, `assets/fonts/`
- **Watch out**: Production must load only the required regional stylesheet and verify CJK rendering in SillyTavern across Windows, macOS, Linux, and browser zoom levels.

### [2026-07-31] Warning state appeared sharper than other states
- **Problem**: Whisper used transforms on ancestors of its glyphs, causing message-dependent fractional alignment and then universal compositor softening after horizontal centering was moved to a full-width transformed parent.
- **Fix**: Centered with full-width flex layout and gave Whisper an opacity-only animation with no transforms anywhere in its animated subtree. Other prototype styles retain vertical movement.
- **Affected**: `demo/toast-style-prototype/index.html`, `DESIGN.md`
- **Watch out**: Verify text sharpness at multiple device-pixel ratios, browser zoom levels, and message widths; do not reintroduce transforms to Whisper animation.
