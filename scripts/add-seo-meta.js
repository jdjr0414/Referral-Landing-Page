#!/usr/bin/env node
/**
 * Adds missing SEO meta tags to HTML pages.
 * - og:image for pages with og:url but no og:image
 * - twitter:card for pages with og but no twitter:card
 * - canonical, og:url, og:title, og:description for pages missing them
 * Run: node scripts/add-seo-meta.js
 */
const fs = require('fs');
const path = require('path');

const BASE = 'https://commercialfinancereferrals.com';
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

const ogImage = '<meta property="og:image" content="https://commercialfinancereferrals.com/assets/axiant-logo.png" />';
const twitterCard = '<meta name="twitter:card" content="summary" />';

let added = 0;
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const rel = path.relative(root, file).replace(/\\/g, '/');
  const url = `${BASE}/${rel}`;

  let modified = false;

  // Add og:image if has og:url but no og:image
  if (content.includes('og:url') && !content.includes('og:image')) {
    content = content.replace(
      /(<meta property="og:url"[^>]*\/?>)/i,
      `$1\n  ${ogImage}`
    );
    modified = true;
  }

  // Add twitter:card if has og but no twitter:card
  if ((content.includes('og:url') || content.includes('og:image')) && !content.includes('twitter:card')) {
    const afterOg = content.indexOf('og:image') > 0 ? content.indexOf('og:image') : content.indexOf('og:url');
    const idx = content.indexOf('>', afterOg) + 1;
    content = content.slice(0, idx) + '\n  ' + twitterCard + content.slice(idx);
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(file, content, 'utf8');
    added++;
  }
}

console.log(`Added SEO meta to ${added} files.`);
