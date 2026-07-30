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

- Present the notification as independently centered typography between two decorative hairlines over a shallow “ink veil,” not a conventional solid alert box. The veil uses a near-black neutral base, warm soft-beige illumination from above and below, no visible border, and soft offset depth. A horizontal mask fades the whole veil toward transparent side edges while leaving content fully opaque. Semantic hue does not tint the surface.
- Use an elegant serif voice for Latin text and bundled Noto Sans regional fonts for Chinese: `Noto Sans SC Variable` for `zh-CN`/`zh-SG`, and `Noto Sans TC Variable` for `zh-TW`/`zh-HK`/`zh-Hant`.
- Latin title text may use a restrained italic; CJK text remains upright. Traditional Chinese uses semibold at the base title size, while Simplified Chinese is optically balanced at one size step smaller and Medium weight because the selected SC build appears denser at identical CSS metrics.
- Bundle Fontsource's Unicode-partitioned variable WOFF2 assets locally. Keep them outside the portable core's mandatory payload and load only the regional stylesheet needed by the active language in production.
- Never apply blur, `filter`, backdrop blur, text shadow, scale, or transform to Whisper's glyph-bearing subtree. Center through container layout and animate Whisper with opacity only; transform animation can force browser compositor rasterization that softens small text.
- Render the notification host above ordinary application chrome with an isolated, configurable high stacking layer. The default adapter value is `2147483646`; consumers can override it for hosts that reserve a higher layer.
- Info, Success, Warning, and Error remain distinguishable through message wording, assistive semantics, and accent rules—not color alone.
- Title, supporting text, surface illumination, and decorative hairlines use state-independent warm-neutral colors. Semantic state remains available through message wording and assistive semantics; future production exploration may add a separate non-text marker if stronger visual differentiation is needed.
- Decorative rules are absolutely positioned and never participate in content layout. The copy occupies a full-width centered grid cell so its alignment is independent of rule length, language, and message width.
- Supporting text must remain at least 10px for CJK in the compact preset; production implementation should use scalable `rem` tokens and verify browser zoom behavior.

## Pending decisions

The exact production palette, spacing tokens, responsive type scale, and motion curve will be settled during implementation and browser verification.
