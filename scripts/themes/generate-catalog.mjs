// Discovers, validates, and embeds declarative theme packs for every build.
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';


const root = resolve(process.env.THEME_ROOT ?? 'themes');
const output = resolve(process.env.CATALOG_OUTPUT ?? 'src/generated/theme-catalog.json');
const catalogPath = process.env.CATALOG_FILE
  ? resolve(process.env.CATALOG_FILE)
  : join(root, 'catalog.json');

function fail(id, message) {
  throw new Error(`Theme "${id}": ${message}`);
}

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function tokenVariableName(id) {
  return `--st-token-${id.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`;
}

function validateToken(id, tokenId, token) {
  if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/i.test(tokenId)) {
    fail(id, `token ${tokenId} has an invalid ID`);
  }
  if (!isRecord(token)) fail(id, `token ${tokenId} must be an object`);
  if (!['color', 'range', 'number', 'select', 'boolean'].includes(token.type)) {
    fail(id, `token ${tokenId} has an unsupported type`);
  }
  if (typeof token.label !== 'string' || token.label.trim() === '') {
    fail(id, `token ${tokenId} needs a label`);
  }
  if (typeof token.unit !== 'undefined' && !['px', 'rem', 'em'].includes(token.unit)) {
    fail(id, `token ${tokenId}.unit is unsupported`);
  }
  if (typeof token.legacyKeys !== 'undefined' && (!Array.isArray(token.legacyKeys) || token.legacyKeys.some((key) => typeof key !== 'string'))) {
    fail(id, `token ${tokenId}.legacyKeys must be an array of strings`);
  }
  if (!Object.hasOwn(token, 'default')) fail(id, `token ${tokenId} needs a default`);
  if (token.type === 'color' && !/^#[0-9a-f]{6}$/i.test(token.default)) {
    fail(id, `token ${tokenId} default must be a six-digit hex color`);
  }
  if (['range', 'number'].includes(token.type)) {
    for (const key of ['min', 'max', 'step']) {
      if (!Number.isFinite(token[key])) fail(id, `token ${tokenId}.${key} must be numeric`);
    }
    if (token.min >= token.max || token.step <= 0) fail(id, `token ${tokenId} has invalid bounds`);
    if (typeof token.default !== 'number' || token.default < token.min || token.default > token.max) {
      fail(id, `token ${tokenId} default is outside its bounds`);
    }
  }
  if (token.type === 'select') {
    if (!Array.isArray(token.options) || token.options.length === 0) fail(id, `token ${tokenId} needs select options`);
    if (token.options.some((option) => !isRecord(option) || typeof option.value !== 'string' || option.value === '' || typeof option.label !== 'string' || option.label.trim() === '')) {
      fail(id, `token ${tokenId} options must have string values and labels`);
    }
    if (new Set(token.options.map((option) => option.value)).size !== token.options.length) {
      fail(id, `token ${tokenId} options must have unique values`);
    }
    if (typeof token.default !== 'string' || !token.options.some((option) => option.value === token.default)) {
      fail(id, `token ${tokenId} default must match an option`);
    }
  }
  if (token.type === 'boolean' && typeof token.default !== 'boolean') {
    fail(id, `token ${tokenId} default must be boolean`);
  }
}

function validatePack(id, pack) {
  if (pack.schemaVersion !== 1 || pack.id !== id) fail(id, 'theme.json id and schemaVersion must match the folder');
  if (typeof pack.name !== 'string' || !isRecord(pack.tokens)) fail(id, 'theme.json needs name and tokens');
  for (const [tokenId, token] of Object.entries(pack.tokens)) validateToken(id, tokenId, token);
  if (typeof pack.template !== 'string') fail(id, 'template must be text');
  validateTemplate(id, pack.template);
  if (typeof pack.css !== 'string') fail(id, 'stylesheet must be text');
  validateCss(id, pack.css, pack.tokens);
}

function validateTemplate(id, template) {
  if (/<!--[\s\S]*?-->|<\/?(?:script|style|svg|math|form|audio|video|iframe|object|embed|template|slot)(?:\s|>)/i.test(template)) {
    fail(id, 'template contains a forbidden element or comment');
  }
  const tags = [...template.matchAll(/<\/?([a-z][a-z0-9-]*)(?:\s[^>]*)?>/gi)];
  const allowedTags = new Set(['div', 'span', 'p', 'strong', 'small', 'em', 'b', 'i']);
  for (const [, tag] of tags) {
    if (!allowedTags.has(tag.toLowerCase())) fail(id, `template contains unsupported element <${tag}>`);
  }
  if ((template.match(/data-toast-root/gi) ?? []).length !== 1) fail(id, 'template must contain exactly one data-toast-root');
  const trimmed = template.trim();
  const root = trimmed.match(/^<([a-z][a-z0-9-]*)\b([^>]*)>[\s\S]*<\/\1>$/i);
  if (!root || !/\bdata-toast-root(?:\s*=\s*(?:"[^"]*"|'[^']*'))?(?:\s|$)/i.test(root[2])) {
    fail(id, 'template must contain one top-level data-toast-root');
  }
  const attributes = [...template.matchAll(/\s([a-zA-Z_:][\w:.-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)];
  const allowedAttributes = new Set(['class', 'data-toast-root', 'data-toast-slot', 'aria-hidden']);
  for (const [, name, doubleValue, singleValue, bareValue] of attributes) {
    if (!allowedAttributes.has(name)) fail(id, `template contains a forbidden attribute ${name}`);
    if (name === 'aria-hidden' && (doubleValue ?? singleValue ?? bareValue) !== 'true') fail(id, 'template may only use aria-hidden="true"');
  }
  if (/data-toast-root[^>]*data-toast-slot\s*=/i.test(trimmed)) fail(id, 'root cannot also be a slot');
  const slots = [...template.matchAll(/data-toast-slot\s*=\s*["']([^"']+)["']/gi)].map((match) => match[1]);
  if (slots.filter((slot) => slot === 'message').length !== 1) fail(id, 'template needs exactly one message slot');
  for (const slot of slots) {
    if (!['message', 'detail', 'tone-label'].includes(slot)) fail(id, `template has unknown slot ${slot}`);
  }
  if (slots.filter((slot) => slot === 'detail').length > 1) fail(id, 'template may have at most one detail slot');
  if (slots.filter((slot) => slot === 'tone-label').length > 1) fail(id, 'template may have at most one tone-label slot');
}

function validateCss(id, css, tokens) {
  if (/<\/style|url\s*\(|:host\b|!important/i.test(css)) {
    fail(id, 'theme.css contains a forbidden style terminator, URL, host selector, or important rule');
  }
  const selectors = [...css.matchAll(/(^|})\s*([^@{}]+)\s*\{/g)].map((match) => match[2].trim());
  if (!selectors.length || selectors.some((selector) => selector.split(',').some((part) => !/^\[data-toast-root\](?:[\s:#.\[]|$)/.test(part.trim())))) {
    fail(id, 'theme.css selectors must be scoped beneath [data-toast-root]');
  }
  const declared = new Set(Object.keys(tokens).map(tokenVariableName));
  for (const [, variable] of css.matchAll(/var\((--st-token-[a-z0-9-]+)/gi)) {
    if (!declared.has(variable)) fail(id, `theme.css references undeclared token ${variable}`);
  }
}

function mergeEntry(base, override, id, path = '') {
  if (!isRecord(override)) fail(id, 'catalog entry override must be an object');
  const result = { ...base };
  const editable = path === ''
    ? new Set(['name', 'description', 'tokens', 'template', 'css'])
    : path === 'tokens'
      ? new Set(Object.keys(base))
      : new Set(['type', 'label', 'default', 'legacyKeys', 'min', 'max', 'step', 'unit', 'options']);
  for (const [key, value] of Object.entries(override)) {
    if (!editable.has(key)) fail(id, `catalog override contains unsupported field ${path ? `${path}.` : ''}${key}`);
    if (isRecord(value) && isRecord(base[key])) result[key] = mergeEntry(base[key], value, id, path === '' ? key : `${path}.${key}`);
    else result[key] = value;
  }
  return result;
}

const sourceCatalog = JSON.parse(await readFile(catalogPath, 'utf8'));
if (sourceCatalog.schemaVersion !== 1 || !isRecord(sourceCatalog.entries)) {
  throw new Error('themes/catalog.json must use schemaVersion 1 and an entries object');
}
const entries = {};
const folders = (await readdir(root, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();
for (const id of folders) {
  const folder = join(root, id);
  const manifest = JSON.parse(await readFile(join(folder, 'theme.json'), 'utf8'));
  const template = await readFile(join(folder, 'template.html'), 'utf8');
  const css = await readFile(join(folder, 'theme.css'), 'utf8');
  const pack = { ...manifest, template, css };
  validatePack(id, pack);
  entries[id] = pack;
}
for (const [id, override] of Object.entries(sourceCatalog.entries)) {
  if (!entries[id]) fail(id, 'catalog override references an undiscovered theme');
  entries[id] = mergeEntry(entries[id], override, id);
  validatePack(id, entries[id]);
}
if (!entries[sourceCatalog.defaultThemeId]) fail(sourceCatalog.defaultThemeId, 'defaultThemeId is not a discovered theme');
await mkdir(resolve(output, '..'), { recursive: true });
await writeFile(output, `${JSON.stringify({ schemaVersion: 1, defaultThemeId: sourceCatalog.defaultThemeId, themes: entries }, null, 2)}\n`);
console.log(`Generated ${Object.keys(entries).length} theme pack(s) at ${output}`);
