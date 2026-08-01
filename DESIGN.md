# Design System

## Status

The first production theme pack is selected through the generated catalog. **Whisper** is the default bundled pack; it is not special-cased and all future packs use the same contract.

## Durable rules

- Notifications occupy the top-center region by default and must not block primary chat controls.
- The visual footprint stays compact and content-driven rather than resembling a full-width system banner.
- Entry and exit motion is quiet and purposeful, with a reduced-motion equivalent.
- Meaning is legible without relying on color alone.
- The renderer owns lifecycle and accessibility structure; each validated theme pack supplies declarative named-slot markup, scoped CSS, and documented tokens through the same generic contract.
- Host-page styles must not leak into notifications, and notification styles must not leak into SillyTavern.

## Initial bundled pack: Whisper

The accepted Whisper visual language is implemented as a normal file-based pack under `themes/whisper/`. Its durable visual rules are:

- Independently centered typography between decorative hairlines over a shallow borderless warm-beige “ink veil,” with transparent side fades and fully opaque content.
- Elegant serif Latin text and bundled regional Noto Sans SC/TC fonts for Chinese.
- Upright semibold CJK text with shared SC/TC size, weight, and tracking settings.
- No blur, filters, text shadows, scale, or transforms on the glyph-bearing subtree; entry and exit use opacity only.
- High isolated stacking above ordinary host chrome.
- Semantic meaning remains available through wording and assistive semantics, not color alone.

These are pack-owned rules, not renderer assumptions. Additional packs may choose different visual treatment while preserving the generic slot, token, accessibility, and safety contracts.

## V1 customization contract

Each bundled theme receives the shared ten-color palette declared by `themes/catalog.json`: primary, secondary, six accents, foreground, and muted foreground. A theme uses only the slots referenced by its stylesheet; the SillyTavern settings surface disables and labels unreferenced slots as unused. Theme manifests may additionally declare range/number, select, checkbox, or other theme-specific controls. Overrides are stored independently per theme and apply to the active notifier rather than individual notifications.

Whisper uses six of the shared colors plus its title/detail size controls. It is the default selected theme, not a special renderer implementation.

V1 does not include runtime theme downloading, theme creation through settings, remote packs, theme JavaScript, or arbitrary per-notification styling.
