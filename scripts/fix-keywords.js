#!/usr/bin/env node
/**
 * Fix malformed meta keywords (double commas, punctuation). Re-derive from title.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const files = [];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory() && e.name !== 'node_modules' && e.name !== '.git') {
      walk(full);
    } else if (e.isFile() && e.name.endsWith('.html')) {
      files.push(full);
    }
  }
}
walk(root);

function deriveKeywords(title) {
  if (!title) return 'commercial finance, referral partners, Axiant Partners';
  const t = title.replace(/\s*\|\s*Axiant Partners\s*$/i, '').trim();
  const words = t.split(/[\s|,–—-]+/)
    .map(w => w.replace(/[?!.]/g, '').trim())
    .filter(w => w.length > 2 && !/^(the|and|for|with|how|what|when|where|why|can|are|is)$/i.test(w));
  const base = [...new Set(words)].slice(0, 6).join(', ');
  return (base ? base + ', ' : '') + 'Axiant Partners';
}

const keywordsRe = /<meta\s+name="keywords"\s+content="([^"]*)"\s*\/?>/i;
const badKeywords = /,,|\?|\.(?!\.)/;

let fixed = 0;
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const match = content.match(keywordsRe);
  if (!match) continue;
  const current = match[1];
  if (!badKeywords.test(current) && !current.includes('  ')) continue; // skip if looks ok
  const titleMatch = content.match(/<title>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1] : '';
  const keywords = deriveKeywords(title);
  content = content.replace(keywordsRe, `<meta name="keywords" content="${keywords}" />`);
  fs.writeFileSync(file, content, 'utf8');
  fixed++;
}
console.log(`Fixed keywords in ${fixed} files.`);
