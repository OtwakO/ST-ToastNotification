# Project Plan

## Objective

Build and maintain ST-ToastNotification as a SillyTavern extension. The functional requirements and implementation architecture will be documented before extension code is added.

## Architecture overview

The project is library-first: a framework-free portable notification module owns rendering, lifecycle, queueing, accessibility, and theme resolution behind a small interface. Theme definitions are separate adapters over a stable token contract. A thin SillyTavern adapter provides settings, previews, and invocation bridges without coupling the renderer to SillyTavern. See `docs/ARCHITECTURE.md`.

## Implementation phases

1. **Repository setup** — complete; Git, baseline documentation, and GitHub remote are established.
2. **Requirements and architecture** — complete; the generic theme-pack contract, default catalog selection, and minimal v1 settings/public API are fixed.
3. **Portable module** — complete; the renderer, FIFO queue, lifecycle, accessibility behavior, and generic theme-token contract are tested and built.
4. **Distribution adapters** — complete; ESM/UMD builds and global/custom-event bridges use the same notifier interface.
5. **SillyTavern adapter** — implementation complete; manifest entry, minimal persistent settings, native controls, preview/reset actions, bridges, and local bundled fonts are packaged.
6. **Generic theme packs** — complete; Whisper is an ordinary generated pack and another ordinary pack is covered by discovery/build tests.
7. **Verification and documentation** — active; verify browser and SillyTavern behavior, performance constraints, accessibility, theme-pack builds, and usage documentation.

## Current state

- **Active phase**: Verification and documentation.
- **Completed**: Repository setup; product scope; library-first architecture; TypeScript, Shadow DOM, distribution, accessibility, adapter, and default-position decisions.
- **Completed**: User selected Whisper as the first production preset. Its durable typography and clarity rules are recorded in `DESIGN.md`.
- **Completed**: Corrected CJK blur and selected Fontsource Noto Sans SC/TC variable WOFF2 distributions for consistent regional Chinese rendering.
- **Completed**: Verified the selected font strategy and text-sharpness constraints in the Whisper prototype.
- **Completed**: Approved Whisper's borderless warm-beige ink veil with masked transparent side fades and independently opaque centered content as the first preset.
- **Completed**: Added the minimal TypeScript/Vitest/Vite foundation, lazy singleton and factory APIs, Shadow DOM renderer, FIFO queue, lifecycle controls, live announcements, Whisper CSS, notifier-level configuration, ESM/UMD builds, and declarations.
- **Completed**: Added tested namespaced-global and `st-toast:show` DOM custom-event bridges with cleanup and no renderer duplication.
- **Completed**: Added the native-control SillyTavern adapter with minimal validated persistence, Preview and Reset actions, adapter cleanup, root install artifacts, and a self-contained generated extension package with local CJK fonts.
- **Completed**: Migrated Whisper into `themes/whisper/` with generic manifest, template, and CSS; added build discovery, editable catalog overrides, token validation, named-slot rendering, per-theme settings migration, generated native controls, ordinary-pack fixture tests, and invalid-pack tests.
- **Completed**: Removed Whisper-specific production TypeScript modules and verified no production `src/**/*.ts` references the theme identity.
- **Completed**: Hardened theme template/CSS/token validation, restored the Shadow host reset and Whisper hairlines, and verified generated library/extension artifacts after a clean rebuild.
- **Completed**: Expanded the shared theme palette to ten color slots, marked unreferenced slots as disabled/unused in generated settings, and made the SillyTavern drawer collapsed by default.
- **In progress**: Browser and real SillyTavern compatibility verification, including generated extension settings and CJK asset loading.
- **Next**: Verify another physical dropped theme in a local build and complete release documentation.
- **Environment**: GitHub repository `OtwakO/ST-ToastNotification`; default branch `main`.

## Open questions

- Which SillyTavern minimum client version should be declared after integration testing?

## Out of scope

- Automatic inference of another extension's memory operations without an explicit call or documented event.
- Arbitrary caller-supplied renderer markup in the first release.
- A runtime CDN dependency for the installed SillyTavern extension.
- Publishing to SillyTavern extension registries before implementation and verification.
- Theme creation through the settings UI, preset import/export, or a saved user preset library.
- Per-notification visual overrides; appearance is configured at notifier/extension level.
- Queue coalescing and arbitrary notification markup.

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

### [2026-07-31] Simplified Chinese appeared larger and heavier
- **Problem**: Noto Sans SC v40 appeared optically larger and denser than the accepted Noto Sans TC rendering under shared typography.
- **Fix**: A region-specific optical adjustment was tested, then reverted by user preference; SC and TC now share identical size, weight, and tracking settings.
- **Affected**: `demo/toast-style-prototype/index.html`, `DESIGN.md`
- **Watch out**: Preserve shared SC/TC typography settings unless the product direction explicitly changes.

### [2026-07-31] Extension stylesheet was stale after interrupted packaging
- **Problem**: Moving `style.css` out of the TypeScript entry stopped Vite from emitting it, while an older file remained in `dist/` and made the package appear complete.
- **Fix**: Added an explicit packaging script that rebuilds an isolated `dist/extension/`, copies manifest and stylesheet assets, vendors the local CJK font pack, and refreshes root `index.js` for direct installation.
- **Affected**: `vite.config.ts`, `package.json`, `scripts/package-extension.mjs`, `style.css`, `index.js`
- **Watch out**: Always verify extension artifacts from a clean output directory rather than trusting files left by a previous build.

### [2026-07-31] Bottom positions escaped the mobile viewport
- **Problem**: The fixed toast host was appended to `body`; when the mobile host page established a transformed or document-sized body containing block, bottom alignment targeted the body height instead of the visual viewport.
- **Fix**: Mounted the overlay under `document.documentElement` and set explicit `100vw` by `100dvh` viewport dimensions, preserving the high fixed layer outside body transforms.
- **Affected**: `src/toast/notifier.ts`, `src/toast/notifier.test.ts`, `src/index.test.ts`, `index.js`
- **Watch out**: Keep the overlay outside transformed application roots and retain the real-browser transformed-body geometry regression.

### [2026-07-31] Whisper was special-cased in the runtime
- **Problem**: Theme defaults, markup, CSS, settings fields, and migration logic were coupled to one built-in theme, preventing drop-in theme packs.
- **Fix**: Moved the selected visual into a declarative pack, generated a validated catalog, resolved generic tokens, cloned named-slot templates, and generated settings controls from manifest data.
- **Affected**: `themes/`, `scripts/themes/`, `src/themes/`, `src/toast/notifier.ts`, `src/sillytavern/`, `README.md`
- **Watch out**: Keep the ordinary-theme invariant: adding/removing a valid pack must not require production TypeScript edits.

### [2026-07-31] Theme packs accepted unsafe or renderer-breaking assets
- **Problem**: Theme CSS and template validation was permissive enough to admit style terminators, unscoped selectors, malformed token IDs, and templates that could fail at runtime.
- **Fix**: Added strict declarative attribute/slot/root validation, scoped CSS checks, URL/style-terminator rejection, token ID and select-schema validation, safe style-node text insertion, and a host reset; restored the pack-owned Whisper hairlines.
- **Affected**: `scripts/themes/generate-catalog.mjs`, `scripts/themes/generator.test.ts`, `src/toast/notifier.ts`, `src/toast/notifier.test.ts`, `themes/whisper/theme.css`
- **Watch out**: Keep the validator aligned with browser parsing and add adversarial fixtures when the theme contract expands.

### [2026-08-01] Theme colors were too limited and unused controls were ambiguous
- **Problem**: Themes had only their locally declared colors, while future packs needed a broader predictable palette; the settings drawer also opened expanded instead of matching other extensions.
- **Fix**: Added ten catalog-level color slots merged into every pack, generated stylesheet-usage metadata, disabled and labeled unused color controls, and initialized the settings drawer collapsed.
- **Affected**: `themes/catalog.json`, `scripts/themes/generate-catalog.mjs`, `src/themes/types.ts`, `src/sillytavern/adapter.ts`, `style.css`, documentation and tests
- **Watch out**: A shared color is considered used only when its exact generated CSS variable is referenced in the pack stylesheet.
