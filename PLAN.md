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
- **In progress**: Third user-review round of the throwaway five-variant prototype in `demo/toast-style-prototype/`; Remembered and Whisper remain, Remembered copy is centered, three new middle directions were introduced, and all variants now demonstrate Info, Success, Warning, and Error states in English and Chinese.
- **Next**: User selects or combines a visual direction; record production design tokens, remove or archive the throwaway prototype as appropriate, then begin TDD implementation.
- **Environment**: GitHub repository `OtwakO/ST-ToastNotification`; default branch `main`.

## Open questions

- Which prototype direction becomes the initial default preset?
- Which SillyTavern minimum client version should be declared after integration testing?
- Should overflow queueing coalesce repeated notifications by caller-provided key in the first release?

## Out of scope

- Automatic inference of another extension's memory operations without an explicit call or documented event.
- Arbitrary caller-supplied renderer markup in the first release.
- A runtime CDN dependency for the installed SillyTavern extension.
- Publishing to SillyTavern extension registries before implementation and verification.

## Issues & Fixes

No issues recorded.
