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

- `?variant=remembered` — centered cinematic visual-novel memory cue
- `?variant=cameo` — compact framed medallion treatment
- `?variant=signal` — instrument-like semantic readout
- `?variant=petal` — asymmetric folded-note treatment
- `?variant=whisper` — near-invisible typographic signal

Use the fixed bottom switcher or the Left and Right arrow keys. Every variant can be reviewed in Info, Success, Warning, and Error states using representative English and Simplified Chinese messages.
