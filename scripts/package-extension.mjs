// Copies static extension assets into the generated installable folder.
import { cp, copyFile, mkdir } from 'node:fs/promises';

const output = 'dist/extension';

await mkdir(output, { recursive: true });
await Promise.all([
  copyFile(`${output}/index.js`, 'index.js'),
  copyFile('manifest.json', `${output}/manifest.json`),
  copyFile('style.css', `${output}/style.css`),
  cp('assets/fonts', `${output}/assets/fonts`, { recursive: true }),
]);
