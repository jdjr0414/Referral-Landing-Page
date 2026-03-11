#!/usr/bin/env node
/**
 * Audit script: Add meta keywords to pages missing them, add rel="noopener noreferrer" to outbound links.
 * Run: node scripts/audit-meta-links.js
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

const hasKeywords = /<meta\s+name="keywords"\s+content=/i;
const hasDescription = /<meta\s+name="description"\s+content=/i;

// Pages that already have keywords (skip)
const alreadyHasKeywords = new Set();

// Outbound link patterns - add rel="noopener noreferrer"
const contactLink = /<a\s+href="(https:\/\/axiantpartners\.com\/contact)"(\s|>)/g;
const mailtoBecome = /<a\s+href="(mailto:jerry@axiantpartners\.com\?subject=Become%20a%20Referral%20Partner)"(\s|>)/g;
const mailtoDeal = /<a\s+href="(mailto:jerry@axiantpartners\.com\?subject=Referral%20Deal%20Submission)"(\s|>)/g;

// Derive keywords from title - clean extraction
function deriveKeywords(title, description) {
  if (!title) return 'commercial finance, referral partners, Axiant Partners';
  const t = title.replace(/\s*\|\s*Axiant Partners\s*$/i, '').trim();
  const words = t.split(/[\s|,–—-]+/)
    .map(w => w.replace(/[?!.]/g, '').trim())
    .filter(w => w.length > 2 && !/^(the|and|for|with|how|what|when|where|why|can|are|is)$/i.test(w));
  const base = [...new Set(words)].slice(0, 6).join(', ');
  return (base ? base + ', ' : '') + 'Axiant Partners';
}

let metaAdded = 0;
let relAdded = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;

  // 1. Add rel="noopener noreferrer" to outbound links (only if not already present)
  const beforeContact = content;
  content = content.replace(contactLink, '<a href="$1" rel="noopener noreferrer"$2');
  if (content !== beforeContact) { modified = true; relAdded++; }

  const beforeMailto = content;
  content = content.replace(mailtoBecome, '<a href="$1" rel="noopener noreferrer"$2');
  content = content.replace(mailtoDeal, '<a href="$1" rel="noopener noreferrer"$2');
  if (content !== beforeMailto) { modified = true; relAdded++; }

  // 2. Add meta keywords if missing (after meta description)
  if (!hasKeywords.test(content) && hasDescription.test(content)) {
    const descMatch = content.match(/<meta\s+name="description"\s+content="([^"]*)"\s*\/?>/i);
    const titleMatch = content.match(/<title>([^<]+)<\/title>/i);
    const desc = descMatch ? descMatch[1] : '';
    const title = titleMatch ? titleMatch[1] : '';
    const keywords = deriveKeywords(title, desc);
    content = content.replace(
      /(<meta\s+name="description"\s+content="[^"]*"\s*\/?>)/i,
      `$1\n  <meta name="keywords" content="${keywords}" />`
    );
    modified = true;
    metaAdded++;
  }

  if (modified) {
    fs.writeFileSync(file, content, 'utf8');
  }
}

console.log(`Done. Meta keywords added to ${metaAdded} files. rel="noopener noreferrer" added to outbound links in ${relAdded} files.`);
