#!/usr/bin/env node
// Folding siblings into a hub turned the hub's links to those siblings into self-
// referential links (href = the page's own slug) with descriptive anchor text.
// Strip those <a> wrappers (keep the text) — but ONLY inside <main>, so header/footer
// current-page nav links are left untouched. Anchor links (href="#...") are not affected.
const fs = require('fs');
let files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
for (const f of fs.readdirSync('blog')) if (f.endsWith('.html')) files.push('blog/' + f);

let totalFiles = 0, totalStripped = 0;
for (const f of files) {
  const slug = '/' + f.replace(/\.html$/, '');
  let html = fs.readFileSync(f, 'utf8');
  const mainStart = html.indexOf('<main');
  const mainEnd = html.indexOf('</main>');
  if (mainStart === -1 || mainEnd === -1) continue;
  const before = html.slice(0, mainStart);
  let main = html.slice(mainStart, mainEnd);
  const after = html.slice(mainEnd);
  // Match <a ... href="/slug" or "/slug/" (optionally with #frag) ...>text</a>
  const esc = slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`<a\\b[^>]*href="${esc}/?(?:#[^"]*)?"[^>]*>([\\s\\S]*?)</a>`, 'g');
  let n = 0;
  main = main.replace(re, (m, text) => { n++; return text; });
  if (n) { fs.writeFileSync(f, before + main + after); totalFiles++; totalStripped += n; }
}
console.log(`Stripped ${totalStripped} self-referential content links across ${totalFiles} files.`);
