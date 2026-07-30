# Project Plan

## Objective

Build and maintain ST-ToastNotification as a SillyTavern extension. The functional requirements and implementation architecture will be documented before extension code is added.

## Architecture overview

The repository currently contains agent and project-process documentation only. The extension's directory structure, modules, data flow, and public interfaces remain to be designed once functional requirements are defined.

## Implementation phases

1. **Repository setup** — initialize Git, establish baseline documentation, and connect the GitHub remote.
2. **Requirements and architecture** — define notification behavior, SillyTavern integration points, directory structure, data flow, and interface contracts.
3. **Implementation** — build the smallest functional extension slice using test-driven development where applicable.
4. **Verification and documentation** — run tests and checks, document setup and usage, and verify the extension in SillyTavern.

## Current state

- **Active phase**: Repository setup.
- **In progress**: Initializing the local Git repository and connecting it to GitHub.
- **Next**: Define requirements and architecture before implementation.
- **Environment**: GitHub repository `OtwakO/ST-ToastNotification` exists and is initially empty.

## Open questions

- What events should produce toast notifications?
- What settings and customization should the extension expose?
- Which SillyTavern APIs and minimum version should be supported?

## Out of scope

- Extension implementation before requirements and architecture are agreed.
- Publishing to SillyTavern extension registries during repository setup.

## Issues & Fixes

No issues recorded.
