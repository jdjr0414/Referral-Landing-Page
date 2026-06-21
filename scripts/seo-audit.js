#!/usr/bin/env node
// Comprehensive SEO / GEO / AEO / linking / UI audit across all pages.
const fs = require('fs');
const rm = fs.readFileSync('worker/redirects.js', 'utf8');
const REDIR = JSON.parse(rm.slice(rm.indexOf('{'), rm.lastIndexOf('}') + 1));
const redirSrc = new Set(Object.keys(REDIR));

const files = new Set(['/', '/blog']);
for (const f of fs.readdirSync('.')) if (f.endsWith('.html')) files.add('/' + f.replace(/\.html$/, ''));
for (const f of fs.readdirSync('blog')) if (f.endsWith('.html')) files.add('/blog/' + (f === 'index.html' ? '' : f.replace(/\.html$/, '')));

let pages = fs.readdirSync('.').filter(f => f.endsWith('.html'));
for (const f of fs.readdirSync('blog')) if (f.endsWith('.html')) pages.push('blog/' + f);

const issues = {};
const add = (cat, msg) => { (issues[cat] ||= []).push(msg); };
const titles = {}, descs = {};

for (const f of pages) {
  let slug = '/' + f.replace(/\.html$/, '');
  if (slug === '/index') slug = '/'; else slug = slug.replace(/\/index$/, '');
  const h = fs.readFileSync(f, 'utf8');

  // --- SEO: title ---
  const tt = h.match(/<title>([^<]*)<\/title>/g) || [];
  if (tt.length !== 1) add('title-count', `${f}: ${tt.length} <title> tags`);
  const title = tt[0] ? tt[0].replace(/<\/?title>/g, '') : '';
  if (!title) add('title-empty', f);
  else { (titles[title] ||= []).push(f); if (title.length > 65) add('title-long', `${f}: ${title.length} chars`); }

  // --- SEO: meta description ---
  const dm = [...h.matchAll(/<meta\s+name="description"\s+content="([^"]*)"/g)];
  if (dm.length !== 1) add('desc-count', `${f}: ${dm.length} descriptions`);
  const desc = dm[0] ? dm[0][1] : '';
  if (!desc) add('desc-empty', f);
  else { (descs[desc] ||= []).push(f); if (desc.length > 165) add('desc-long', `${f}: ${desc.length}`); if (desc.length < 70) add('desc-short', `${f}: ${desc.length}`); }

  // --- SEO: canonical self-reference ---
  const cm = h.match(/<link\s+rel="canonical"\s+href="([^"]*)"/);
  const canon = cm ? cm[1].replace('https://commercialfinancereferrals.com', '').replace(/\/$/, '') || '/' : null;
  if (!canon) add('canonical-missing', f);
  else if (canon !== slug) add('canonical-mismatch', `${f}: canonical=${canon} slug=${slug}`);

  // --- SEO: robots ---
  if (/name="robots"[^>]*noindex/i.test(h)) add('noindex', f);
  const robots = h.match(/<meta\s+name="robots"\s+content="([^"]*)"/);
  if (!robots) add('robots-missing', f);

  // --- SEO: H1 ---
  const h1 = h.match(/<h1[\s>]/g) || [];
  if (h1.length !== 1) add('h1-count', `${f}: ${h1.length} <h1>`);

  // --- SEO: og:url ---
  const og = h.match(/<meta\s+property="og:url"\s+content="([^"]*)"/);
  if (og) { const ogp = og[1].replace('https://commercialfinancereferrals.com', '').replace(/\/$/, '') || '/'; if (ogp !== slug) add('ogurl-mismatch', `${f}: ${ogp}`); }
  else add('ogurl-missing', f);

  // --- SEO: keywords meta quality (flag obviously stuffed/broken) ---
  const kw = h.match(/<meta\s+name="keywords"\s+content="([^"]*)"/);
  if (kw) { const parts = kw[1].split(',').map(s => s.trim()); const single = parts.filter(p => p && !p.includes(' ')).length; if (single >= 4 && single / parts.length > 0.5) add('keywords-stuffed', `${f}: "${kw[1].slice(0, 50)}..."`); }

  // --- GEO/AEO: JSON-LD validity ---
  const ld = [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  let hasFAQ = false, hasCrumb = false;
  for (const m of ld) {
    let obj;
    try { obj = JSON.parse(m[1].trim()); } catch (e) { add('jsonld-invalid', `${f}: ${e.message.slice(0, 40)}`); continue; }
    const types = JSON.stringify(obj['@type'] || '');
    if (types.includes('FAQPage')) hasFAQ = true;
    if (types.includes('BreadcrumbList')) hasCrumb = true;
    // schema URLs pointing to redirected/missing pages
    for (const u of (m[1].match(/https:\/\/commercialfinancereferrals\.com(\/[a-z0-9\-\/]*)/g) || [])) {
      const p = u.replace('https://commercialfinancereferrals.com', '').replace(/\/$/, '') || '/';
      if (p.startsWith('/assets/')) continue; // image/logo paths, not pages
      if (redirSrc.has(p)) add('schema-url-redirected', `${f}: ${p}`);
      else if (!files.has(p)) add('schema-url-404', `${f}: ${p}`);
    }
    // WebPage url should be absolute
    if (obj['@type'] === 'WebPage' && obj.url && !/^https:\/\//.test(obj.url)) add('schema-url-relative', `${f}: ${obj.url}`);
  }
  if (!hasFAQ) add('no-faq-schema', f);
  if (!hasCrumb) add('no-breadcrumb-schema', f);

  // --- AEO: quick-answer block for snippet/voice ---
  if (!/class="quick-answer"/.test(h)) add('no-quick-answer', f);

  // --- UI: images without alt ---
  for (const img of h.match(/<img\b[^>]*>/g) || []) if (!/\balt=/.test(img)) add('img-no-alt', `${f}: ${img.slice(0, 40)}`);

  // --- UI: leftover broken artifacts ---
  if (/href="#"/.test(h)) add('empty-anchor', f);
  if (/<a\b[^>]*>\s*<\/a>/.test(h)) add('empty-link-text', f);
  if (/  +(See|Learn more|Read more)\.?\s*<\/p>/.test(h)) add('dangling-cta', f);
  // breadcrumb middle item that is plain text (lost its link)
  const bc = h.match(/<nav class="breadcrumb"[\s\S]*?<\/nav>/);
  if (bc && /<span class="sep">›<\/span>\s*[A-Z][^<]+<span class="sep">/.test(bc[0])) add('breadcrumb-unlinked', f);

  // --- linking: internal links to redirected/missing (content area) ---
  const s = h.indexOf('<main'), e = h.indexOf('</main>');
  const main = s >= 0 ? h.slice(s, e) : h;
  for (const lm of main.matchAll(/href="(\/[^"#?]*)(?:[#?][^"]*)?"/g)) {
    let p = lm[1]; if (/\.(pdf|xml|png|css|js|ico|jpg|svg)$/.test(p)) continue;
    if (p.endsWith('.html')) { add('link-html-ext', `${f}: ${p}`); continue; }
    const pp = p.replace(/\/$/, '') || '/';
    if (redirSrc.has(pp)) add('link-redirected', `${f}: ${pp}`);
    else if (!files.has(pp)) add('link-404', `${f}: ${pp}`);
  }
}

// duplicate titles / descriptions
for (const [t, fs_] of Object.entries(titles)) if (fs_.length > 1) add('dup-title', `"${t.slice(0, 50)}" x${fs_.length}: ${fs_.join(', ')}`);
for (const [d, fs_] of Object.entries(descs)) if (fs_.length > 1) add('dup-desc', `x${fs_.length}: ${fs_.slice(0, 3).join(', ')}`);

console.log(`Audited ${pages.length} pages.\n`);
const order = Object.keys(issues).sort((a, b) => issues[b].length - issues[a].length);
if (!order.length) { console.log('No issues found.'); process.exit(0); }
for (const cat of order) {
  console.log(`### ${cat}: ${issues[cat].length}`);
  for (const m of issues[cat].slice(0, 6)) console.log('   - ' + m);
  if (issues[cat].length > 6) console.log(`   ... +${issues[cat].length - 6} more`);
}
