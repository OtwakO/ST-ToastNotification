# Bundled CJK fonts

ST-ToastNotification vendors the variable WOFF2 distributions of Noto Sans SC and Noto Sans TC so Chinese notifications render consistently when users do not have suitable CJK fonts installed.

## Sources

- Noto Sans SC: https://fontsource.org/fonts/noto-sans-sc
- Noto Sans TC: https://fontsource.org/fonts/noto-sans-tc
- Fontsource package repository: https://github.com/fontsource/font-files

The CSS and variable WOFF2 files correspond to Fontsource packages:

- `@fontsource-variable/noto-sans-sc@5.3.0` — upstream font version `v40`
- `@fontsource-variable/noto-sans-tc@5.3.0` — upstream font version `v39`

The user-provided source archives were verified with these SHA-256 hashes before extraction:

```text
noto-sans-sc.zip  549fe98494bfd9dfe12825af43a91db6e9b3fd06ce535f4cddb58f8e4548676d
noto-sans-tc.zip  1ca3aeff9ab0d297e5b6653c65bf3790dd8d01c4bde5bcef1056dabf1679fae8
```

## Packaging

Only `variable/*.woff2`, the matching Fontsource `index.css`, and the license are retained. Static WOFF/WOFF2/TTF builds and the original ZIP archives are intentionally excluded.

Fontsource partitions each family into Unicode-range shards. Browsers request only the shards needed by rendered text rather than downloading the complete family.

## License

Both font families are licensed under the SIL Open Font License 1.1. See the `LICENSE` file in each family directory.
