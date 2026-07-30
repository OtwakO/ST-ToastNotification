# Toast Style Prototype

> **Throwaway prototype:** this code compares visual directions and must not be promoted directly into the production notification module.

## Question

Which visual system should become ST-ToastNotification's first default preset?

## Run

From the repository root:

```bash
python3 -m http.server 4173
```

Open:

```text
http://localhost:4173/demo/toast-style-prototype/
```

## Variants

- `?variant=remembered` — cinematic visual-novel memory cue
- `?variant=moonseal` — luminous sigil and suspended caption
- `?variant=ribbon` — narrow chapter-marker strip
- `?variant=echo` — concentric traces around a quiet status
- `?variant=whisper` — near-invisible typographic signal

Use the fixed bottom switcher or the Left and Right arrow keys. The sample controls replay representative English and Simplified Chinese messages.
