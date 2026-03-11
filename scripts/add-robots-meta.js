#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
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

const meta = '<meta name="robots" content="index, follow" />';
let added = 0;
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('name="robots"')) continue;
  content = content.replace(
    /(<meta name="viewport"[^>]*\/?>)/i,
    `$1\n  ${meta}`
  );
  fs.writeFileSync(file, content, 'utf8');
  added++;
}
console.log(`Added meta robots to ${added} files.`);
