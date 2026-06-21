#!/usr/bin/env node
// Bulk SEO/schema fixes: remove stuffed keyword metas, add missing og:url,
// make WebPage schema URLs absolute, repoint schema URLs that hit redirects.
const fs = require('fs');
const rm = fs.readFileSync('worker/redirects.js', 'utf8');
const REDIR = JSON.parse(rm.slice(rm.indexOf('{'), rm.lastIndexOf('}') + 1));
const BASE = 'https://commercialfinancereferrals.com';

let pages = fs.readdirSync('.').filter(f => f.endsWith('.html'));
for (const f of fs.readdirSync('blog')) if (f.endsWith('.html')) pages.push('blog/' + f);

let kw = 0, og = 0, abs = 0, redir = 0;
for (const f of pages) {
  let h = fs.readFileSync(f, 'utf8');
  const orig = h;

  // 1. Remove stuffed keywords meta (>=4 single-word comma items that are >half the list).
  h = h.replace(/\s*<meta\s+name="keywords"\s+content="([^"]*)"\s*\/?>\n?/g, (m, c) => {
    const parts = c.split(',').map(s => s.trim()).filter(Boolean);
    const single = parts.filter(p => !p.includes(' ')).length;
    if (single >= 4 && single / parts.length > 0.5) { kw++; return '\n'; }
    return m;
  });

  // 2. Add og:url after canonical if missing.
  const canon = (h.match(/<link\s+rel="canonical"\s+href="([^"]*)"/) || [])[1];
  if (canon && !/property="og:url"/.test(h)) {
    h = h.replace(/(<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>)/,
      `$1\n  <meta property="og:url" content="${canon}" />`);
    og++;
  }

  // 3. Absolute WebPage schema url: "url":"/foo" -> absolute.
  h = h.replace(/("url":\s*")(\/[a-z0-9\-\/]*)(")/g, (m, a, p, b) => { abs++; return a + BASE + p + b; });

  // 4. Repoint schema URLs that are redirect sources to their resolved target.
  h = h.replace(new RegExp(BASE.replace(/[.]/g, '\\.') + '(/[a-z0-9\\-\\/]+)', 'g'), (m, p) => {
    const key = p.replace(/\/$/, '');
    if (REDIR[key]) { redir++; return BASE + REDIR[key]; }
    return m;
  });

  if (h !== orig) fs.writeFileSync(f, h);
}
console.log(`removed ${kw} stuffed keyword metas, added ${og} og:url, made ${abs} schema urls absolute, repointed ${redir} redirected schema urls.`);
