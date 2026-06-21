#!/usr/bin/env node
// Two cleanups across all pages:
//  1. Rewrite internal href="/foo.html" -> href="/foo" (clean URL; avoids the
//     html_handling 301 hop). Special-cases index pages.
//  2. Fix /understanding-clawbacks-referral-agreements -> /blog/... (blog post
//     linked without its /blog/ prefix; the others were already handled).
const fs = require('fs');
let files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
for (const f of fs.readdirSync('blog')) if (f.endsWith('.html')) files.push('blog/' + f);

let htmlFixed = 0, blogFixed = 0, touched = 0;
for (const f of files) {
  let html = fs.readFileSync(f, 'utf8');
  const orig = html;
  // 1. strip .html on internal links
  html = html.replace(/href="(\/[^"]+?)\.html"/g, (m, p) => {
    htmlFixed++;
    if (p === '/index') return 'href="/"';
    if (p === '/blog/index') return 'href="/blog"';
    return `href="${p}"`;
  });
  // 2. blog-prefix fix
  html = html.replace(/href="\/understanding-clawbacks-referral-agreements"/g, () => {
    blogFixed++;
    return 'href="/blog/understanding-clawbacks-referral-agreements"';
  });
  if (html !== orig) { fs.writeFileSync(f, html); touched++; }
}
console.log(`Cleaned ${htmlFixed} .html links + ${blogFixed} blog-prefix links across ${touched} files.`);
