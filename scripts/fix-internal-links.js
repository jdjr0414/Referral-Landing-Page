#!/usr/bin/env node
// Rewrite internal href links that point to redirected (folded) URLs so they point
// directly at the final canonical page. Destination is identical (the Worker 301s
// them anyway) — this just removes the redirect hop and gives Google direct links.
const fs = require('fs');
const rm = fs.readFileSync('worker/redirects.js', 'utf8');
const R = JSON.parse(rm.slice(rm.indexOf('{'), rm.lastIndexOf('}') + 1));

let files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
for (const f of fs.readdirSync('blog')) if (f.endsWith('.html')) files.push('blog/' + f);

let totalFiles = 0, totalLinks = 0;
for (const f of files) {
  let html = fs.readFileSync(f, 'utf8');
  let n = 0;
  html = html.replace(/href="(\/[^"#?]*)([#?][^"]*)?"/g, (m, pathRaw, tail) => {
    const key = pathRaw.length > 1 && pathRaw.endsWith('/') ? pathRaw.slice(0, -1) : pathRaw;
    const target = R[key];
    if (!target) return m;
    n++;
    return `href="${target}${tail || ''}"`;
  });
  if (n) { fs.writeFileSync(f, html); totalFiles++; totalLinks += n; }
}
console.log(`Rewrote ${totalLinks} internal links across ${totalFiles} files.`);
