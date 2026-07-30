# Design System

## Status

The default visual preset is intentionally undecided. A throwaway prototype will compare several notification systems in a simulated SillyTavern chat before production tokens are committed.

## Durable rules

- Notifications occupy the top-center region by default and must not block primary chat controls.
- The visual footprint stays compact and content-driven rather than resembling a full-width system banner.
- Entry and exit motion is quiet and purposeful, with a reduced-motion equivalent.
- Meaning is legible without relying on color alone.
- The renderer owns stable structure; themes customize documented tokens rather than arbitrary internal markup.
- Host-page styles must not leak into notifications, and notification styles must not leak into SillyTavern.

## Pending decision

The initial preset, palette, typography, surface treatment, icon language, and exact motion curve will be recorded after prototype selection.
