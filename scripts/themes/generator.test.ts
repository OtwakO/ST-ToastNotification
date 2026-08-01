// Exercises theme-pack discovery, validation, editable overrides, and ordinary-pack swapping.
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { describe, expect, it } from 'vitest';

const exec = promisify(execFile);
const generator = resolve('scripts/themes/generate-catalog.mjs');

async function fixtureRoot() {
  const root = await mkdtemp(join(tmpdir(), 'st-toast-themes-'));
  const pack = join(root, 'fixture');
  await exec('mkdir', ['-p', pack]);
  await writeFile(join(root, 'catalog.json'), JSON.stringify({ schemaVersion: 1, defaultThemeId: 'fixture', entries: {} }));
  await writeFile(join(pack, 'theme.json'), JSON.stringify({
    schemaVersion: 1,
    id: 'fixture',
    name: 'Fixture',
    tokens: { ink: { type: 'color', label: 'Ink', default: '#112233' } },
  }));
  await writeFile(join(pack, 'template.html'), '<div data-toast-root><span data-toast-slot="message"></span></div>');
  await writeFile(join(pack, 'theme.css'), '[data-toast-root]{color:var(--st-token-ink)}');
  return root;
}

async function runGenerator(root, catalogFile = join(root, 'catalog.json')) {
  const output = join(root, 'generated.json');
  await exec(process.execPath, [generator], {
    env: { ...process.env, THEME_ROOT: root, CATALOG_FILE: catalogFile, CATALOG_OUTPUT: output },
  });
  return JSON.parse(await readFile(output, 'utf8'));
}

describe('theme catalog generator', () => {
  it('discovers packs deterministically and applies editable full entry overrides', async () => {
    const root = await fixtureRoot();
    try {
      await writeFile(join(root, 'catalog.json'), JSON.stringify({
        schemaVersion: 1,
        defaultThemeId: 'fixture',
        entries: { fixture: { name: 'Renamed fixture', tokens: { ink: { label: 'Ink override', default: '#445566', type: 'color' } } } },
      }));
      const first = await runGenerator(root);
      const second = await runGenerator(root);
      expect(first).toEqual(second);
      expect(first.themes.fixture.name).toBe('Renamed fixture');
      expect(first.themes.fixture.tokens.ink.label).toBe('Ink override');
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('supports replacing the default with another ordinary pack', async () => {
    const root = await fixtureRoot();
    try {
      const second = join(root, 'second');
      await exec('mkdir', ['-p', second]);
      await writeFile(join(second, 'theme.json'), JSON.stringify({
        schemaVersion: 1,
        id: 'second',
        name: 'Second',
        tokens: { ink: { type: 'color', label: 'Ink', default: '#334455' } },
      }));
      await writeFile(join(second, 'template.html'), '<p data-toast-root><strong data-toast-slot="message"></strong></p>');
      await writeFile(join(second, 'theme.css'), '[data-toast-root]{color:var(--st-token-ink)}');
      await writeFile(join(root, 'catalog.json'), JSON.stringify({ schemaVersion: 1, defaultThemeId: 'second', entries: {} }));
      const catalog = await runGenerator(root);
      expect(catalog.defaultThemeId).toBe('second');
      expect(Object.keys(catalog.themes)).toEqual(['fixture', 'second']);
      expect(catalog.themes.second.template).toContain('strong');
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('fails loudly for unsafe templates, CSS, and token schemas', async () => {
    const root = await fixtureRoot();
    try {
      await writeFile(join(root, 'fixture', 'template.html'), '<div data-toast-root><script data-toast-slot="message"></script></div>');
      await expect(runGenerator(root)).rejects.toThrow('forbidden element');
      await writeFile(join(root, 'fixture', 'template.html'), '<div data-toast-root><span data-toast-slot="message"></span></div>');
      await writeFile(join(root, 'fixture', 'theme.css'), '[data-toast-root]{color:var(--st-token-missing)}');
      await expect(runGenerator(root)).rejects.toThrow('undeclared token');
      await writeFile(join(root, 'fixture', 'theme.css'), '</style><img src="x">');
      await expect(runGenerator(root)).rejects.toThrow('style terminator');
      await writeFile(join(root, 'fixture', 'theme.css'), '.unscoped{color:red}');
      await expect(runGenerator(root)).rejects.toThrow('scoped');
      await writeFile(join(root, 'fixture', 'theme.css'), '[data-toast-root]{color:red}');
      await writeFile(join(root, 'fixture', 'theme.json'), JSON.stringify({
        schemaVersion: 1,
        id: 'fixture',
        name: 'Fixture',
        tokens: { 'bad[id]': { type: 'color', label: 'Bad', default: '#112233' } },
      }));
      await expect(runGenerator(root)).rejects.toThrow('invalid ID');
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
