# Design System

## Status

**Whisper** is the selected first visual preset. The remaining prototype directions are exploration material, not committed production styles.

## Durable rules

- Notifications occupy the top-center region by default and must not block primary chat controls.
- The visual footprint stays compact and content-driven rather than resembling a full-width system banner.
- Entry and exit motion is quiet and purposeful, with a reduced-motion equivalent.
- Meaning is legible without relying on color alone.
- The renderer owns stable structure; themes customize documented tokens rather than arbitrary internal markup.
- Host-page styles must not leak into notifications, and notification styles must not leak into SillyTavern.

## Whisper preset

- Present the notification as centered typography between two fine semantic-accent rules, without a conventional container surface.
- Use an elegant serif voice for Latin text and bundled Noto Sans regional fonts for Chinese: `Noto Sans SC Variable` for `zh-CN`/`zh-SG`, and `Noto Sans TC Variable` for `zh-TW`/`zh-HK`/`zh-Hant`.
- Latin title text may use a restrained italic; CJK text remains upright and semibold to preserve stroke clarity.
- Bundle Fontsource's Unicode-partitioned variable WOFF2 assets locally. Keep them outside the portable core's mandatory payload and load only the regional stylesheet needed by the active language in production.
- Never apply blur, `filter`, or text shadow to the glyph-bearing element. Depth belongs on surrounding decoration, not text rasterization.
- Info, Success, Warning, and Error remain distinguishable through message wording, assistive semantics, and accent rules—not color alone.
- Supporting text must remain at least 10px for CJK in the compact preset; production implementation should use scalable `rem` tokens and verify browser zoom behavior.

## Pending decisions

The exact production palette, spacing tokens, responsive type scale, and motion curve will be settled during implementation and browser verification.
