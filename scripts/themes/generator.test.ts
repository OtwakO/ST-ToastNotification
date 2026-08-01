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
  await writeFile(join(root, 'catalog.json'), JSON.stringify({
    schemaVersion: 1,
    defaultThemeId: 'fixture',
    colorSlots: standardColorSlots(),
    entries: {},
  }));
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

function standardColorSlots() {
  return {
    primary: { type: 'color', label: 'Primary', default: '#111111' },
    secondary: { type: 'color', label: 'Secondary', default: '#222222' },
    accent1: { type: 'color', label: 'Accent 1', default: '#333333' },
    accent2: { type: 'color', label: 'Accent 2', default: '#444444' },
    accent3: { type: 'color', label: 'Accent 3', default: '#555555' },
    accent4: { type: 'color', label: 'Accent 4', default: '#666666' },
    accent5: { type: 'color', label: 'Accent 5', default: '#777777' },
    accent6: { type: 'color', label: 'Accent 6', default: '#888888' },
    foreground: { type: 'color', label: 'Text', default: '#eeeeee' },
    mutedForeground: { type: 'color', label: 'Muted text', default: '#aaaaaa' },
  };
}

describe('theme catalog generator', () => {
  it('discovers packs deterministically and applies editable full entry overrides', async () => {
    const root = await fixtureRoot();
    try {
      await writeFile(join(root, 'catalog.json'), JSON.stringify({
        schemaVersion: 1,
        defaultThemeId: 'fixture',
        colorSlots: standardColorSlots(),
        entries: { fixture: { name: 'Renamed fixture', tokens: { ink: { label: 'Ink override', default: '#445566', type: 'color' } } } },
      }));
      const first = await runGenerator(root);
      const second = await runGenerator(root);
      expect(first).toEqual(second);
      expect(first.themes.fixture.name).toBe('Renamed fixture');
      expect(first.themes.fixture.tokens.ink.label).toBe('Ink override');
      expect(first.themes.fixture.tokens.primary.used).toBe(false);
      expect(Object.keys(first.themes.fixture.tokens)).toEqual([
        'primary',
        'secondary',
        'accent1',
        'accent2',
        'accent3',
        'accent4',
        'accent5',
        'accent6',
        'foreground',
        'mutedForeground',
        'ink',
      ]);
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
      await writeFile(join(root, 'catalog.json'), JSON.stringify({
        schemaVersion: 1,
        defaultThemeId: 'second',
        colorSlots: standardColorSlots(),
        entries: {},
      }));
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
      await writeFile(join(root, 'fixture', 'theme.json'), JSON.stringify({
        schemaVersion: 1,
        id: 'fixture',
        name: 'Fixture',
        tokens: { primary: { type: 'boolean', label: 'Broken primary', default: true } },
      }));
      await expect(runGenerator(root)).rejects.toThrow('shared color slot primary');
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('detects exact CSS variable usage without comments or prefix collisions', async () => {
    const root = await fixtureRoot();
    try {
      await writeFile(join(root, 'fixture', 'theme.json'), JSON.stringify({
        schemaVersion: 1,
        id: 'fixture',
        name: 'Fixture',
        tokens: { accent10: { type: 'color', label: 'Accent 10', default: '#999999' } },
      }));
      await writeFile(join(root, 'fixture', 'theme.css'), [
        '[data-toast-root]{',
        'color:var( --st-token-secondary);',
        'background:var(--st-token-accent10);',
        '/* color:var(--st-token-accent1); */',
        '}',
      ].join(''));
      const catalog = await runGenerator(root);
      expect(catalog.themes.fixture.tokens.secondary.used).toBe(true);
      expect(catalog.themes.fixture.tokens.accent10.used).toBe(true);
      expect(catalog.themes.fixture.tokens.accent1.used).toBe(false);
      await writeFile(join(root, 'fixture', 'theme.css'), '[data-toast-root]{color:var(--ST-TOKEN-PRIMARY)}');
      await expect(runGenerator(root)).rejects.toThrow('undeclared token --ST-TOKEN-PRIMARY');
      await writeFile(join(root, 'fixture', 'theme.css'), '[data-toast-root]{color:var(--st-token-secondary_bad)}');
      await expect(runGenerator(root)).rejects.toThrow('undeclared token --st-token-secondary_bad');
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
