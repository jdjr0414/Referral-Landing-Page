#!/usr/bin/env node
// GEO/AEO additions: BreadcrumbList JSON-LD where missing, and a "Quick answer"
// block (sourced from the page's first FAQ answer, else its lead paragraph) for
// snippet/voice eligibility. PREVIEW=1 prints proposals only.
const fs = require('fs');
const PREVIEW = process.env.PREVIEW === '1';
const BASE = 'https://commercialfinancereferrals.com';
const SKIP_QA = new Set(['index.html', 'referral-form.html', 'blog/index.html']);

let pages = fs.readdirSync('.').filter(f => f.endsWith('.html'));
for (const f of fs.readdirSync('blog')) if (f.endsWith('.html')) pages.push('blog/' + f);

function shortName(h) {
  let t = (h.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || (h.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
  t = t.replace(/<[^>]+>/g, '').replace(/\s*\|\s*Axiant Partners.*$/, '').split(': ')[0].split(' | ')[0].trim();
  return t.replace(/"/g, '');
}
function firstAnswer(h) {
  const ld = [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  for (const m of ld) { try { const o = JSON.parse(m[1].trim()); const e = (o.mainEntity || [])[0]; if (e && e.acceptedAnswer && e.acceptedAnswer.text) return e.acceptedAnswer.text; } catch {} }
  const lead = (h.match(/<p class="lead">([\s\S]*?)<\/p>/) || [])[1];
  return lead ? lead.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : null;
}
function clip(s, n = 300) {
  if (s.length <= n) return s;
  const cut = s.slice(0, n); const d = cut.lastIndexOf('. ');
  return d > 120 ? s.slice(0, d + 1) : cut.slice(0, cut.lastIndexOf(' ')) + '…';
}

let bc = 0, qa = 0; const samp = [];
for (const f of pages) {
  let h = fs.readFileSync(f, 'utf8');
  const orig = h;

  // BreadcrumbList (skip the homepage).
  if (f !== 'index.html' && !/BreadcrumbList/.test(h)) {
    const name = shortName(h);
    const canon = (h.match(/<link\s+rel="canonical"\s+href="([^"]*)"/) || [])[1] || BASE + '/' + f.replace(/\.html$/, '');
    const crumb = `  <script type="application/ld+json">\n  {"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"${BASE}/"},{"@type":"ListItem","position":2,"name":"${name}","item":"${canon}"}]}\n  </script>\n`;
    h = h.replace('</head>', crumb + '</head>');
    bc++;
  }

  // Quick-answer block.
  if (!SKIP_QA.has(f) && !f.startsWith('blog/') && !/class="quick-answer"/.test(h) && /class="hero-main"/.test(h)) {
    const ans = firstAnswer(h);
    if (ans && ans.length > 60) {
      const text = clip(ans);
      const block = `\n          <div class="quick-answer" role="complementary" aria-label="Quick answer">\n            <p><strong>Quick answer:</strong> ${text}</p>\n          </div>`;
      h = h.replace(/(<div class="hero-main">)/, `$1${block}`);
      qa++;
      if (samp.length < 8) samp.push(`QA ${f}\n     ${text.slice(0, 150)}...`);
    }
  }

  if (!PREVIEW && h !== orig) fs.writeFileSync(f, h);
}
console.log((PREVIEW ? '[PREVIEW] ' : '') + `breadcrumb schema added: ${bc}, quick-answer added: ${qa}\n`);
samp.forEach(s => console.log(s + '\n'));
