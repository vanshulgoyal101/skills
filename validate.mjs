#!/usr/bin/env node
// Validate the skills catalog, local Markdown links, and accidental secret-shaped text.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname);
const IGNORE = new Set(['.git', 'node_modules', '.github']);
const SECRET_PATTERNS = [
  /\bAIza[0-9A-Za-z_-]{20,}\b/,
  /\bsk-[A-Za-z0-9]{20,}\b/,
  /\bgh[pousr]_[A-Za-z0-9]{20,}\b/,
  /\bsbp_[A-Za-z0-9]{20,}\b/,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
];

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (IGNORE.has(name)) continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, out);
    else out.push(path);
  }
  return out;
}

const files = walk(ROOT);
const markdown = files.filter((path) => path.endsWith('.md'));
const errors = [];

for (const path of markdown) {
  const rel = relative(ROOT, path);
  const text = readFileSync(path, 'utf8');
  if (!text.startsWith('# ')) errors.push(`${rel}: missing top-level heading`);
  for (const pattern of SECRET_PATTERNS) {
    if (pattern.test(text)) errors.push(`${rel}: secret-shaped value matches ${pattern}`);
  }
  for (const match of text.matchAll(/\]\(([^)#]+)(?:#[^)]*)?\)/g)) {
    const target = match[1];
    if (/^(https?:|mailto:|#)/i.test(target)) continue;
    const candidate = resolve(ROOT, relative(ROOT, path), '..', target);
    if (!existsSync(candidate)) errors.push(`${rel}: broken link -> ${target}`);
  }
}

const catalog = readFileSync(join(ROOT, 'CATALOG.md'), 'utf8');
const catalogSkills = [...catalog.matchAll(/\]\(skills\/([^)]*)\)/g)].map((m) => m[1]);
const catalogIncidents = [...catalog.matchAll(/\]\(incidents\/([^)]*)\)/g)].map((m) => m[1]);
for (const path of catalogSkills) if (!existsSync(join(ROOT, 'skills', path))) errors.push(`CATALOG.md: missing skill ${path}`);
for (const path of catalogIncidents) if (!existsSync(join(ROOT, 'incidents', path))) errors.push(`CATALOG.md: missing incident ${path}`);

console.log(`Files: ${files.length}`);
console.log(`Markdown: ${markdown.length}`);
console.log(`Catalog: ${catalogSkills.length} skills, ${catalogIncidents.length} incidents`);
if (errors.length) {
  console.error(`Errors: ${errors.length}`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log('Result: PASS');
