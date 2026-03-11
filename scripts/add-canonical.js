#!/usr/bin/env node
/**
 * Adds canonical URL to pages missing it.
 * Run: node scripts/add-canonical.js
 */
const fs = require('fs');
const path = require('path');

const BASE = 'https://axiantpartners.com';
const root = path.join(__dirname, '..');
const files = [];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory() && !['node_modules', 'scripts', 'templates', 'assets'].includes(e.name)) {
      walk(full);
    } else if (e.isFile() && e.name.endsWith('.html')) {
      files.push(full);
    }
  }
}
walk(root);

let added = 0;
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('rel="canonical"')) continue;

  const rel = path.relative(root, file).replace(/\\/g, '/');
  const url = rel === 'index.html' ? `${BASE}/` : `${BASE}/${rel}`;
  const canonical = `<link rel="canonical" href="${url}" />`;

  content = content.replace(
    /(<link rel="icon"[^>]*\/?>)/i,
    `$1\n  ${canonical}`
  );
  fs.writeFileSync(file, content, 'utf8');
  added++;
}
console.log(`Added canonical to ${added} files.`);
