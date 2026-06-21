#!/usr/bin/env node
// Temp analysis: join content depth + GSC 3mo perf + index status per page.
const fs = require('fs'), path = require('path');
const GSC = process.env.GSC || '/tmp/gsc';

const rm = fs.readFileSync('worker/redirects.js', 'utf8');
const REDIR = JSON.parse(rm.slice(rm.indexOf('{'), rm.lastIndexOf('}') + 1));
const redirSrc = new Set(Object.keys(REDIR).map(k => k.slice(1)));

const perf = {};
for (const line of fs.readFileSync(GSC + '/zip_9/Pages.csv', 'utf8').split(/\r?\n/).slice(1)) {
  const c = line.split(',');
  if (c.length < 5) continue;
  const slug = c[0].replace(/^https:\/\/commercialfinancereferrals\.com\//, '').replace(/\/$/, '') || '(home)';
  perf[slug] = { clicks: +c[1] || 0, impr: +c[2] || 0, pos: +c[4] || 0 };
}

const cni = new Set();
for (const line of fs.readFileSync(GSC + '/zip_6/Table.csv', 'utf8').split(/\r?\n/).slice(1)) {
  const u = line.split(',')[0];
  const m = u && u.match(/commercialfinancereferrals\.com\/(.*)$/);
  if (m) cni.add(m[1].replace(/\/$/, ''));
}

const skipDirs = ['node_modules', 'scripts', 'templates', 'dist', 'assets', '.git', 'blog'];
let files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
for (const f of fs.readdirSync('blog')) if (f.endsWith('.html') && f !== 'index.html') files.push('blog/' + f);

const rows = [];
for (const f of files) {
  const html = fs.readFileSync(f, 'utf8');
  const slug = f.replace(/\.html$/, '');
  const title = (html.match(/<title>([^<]*)<\/title>/) || ['', ''])[1].replace(/\s*\|\s*Axiant Partners/, '').trim();
  const text = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ');
  const words = (text.match(/\S+/g) || []).length;
  const noindex = /name=["']robots["'][^>]*noindex/i.test(html) ? 1 : 0;
  const p = perf[slug] || { clicks: 0, impr: 0, pos: 0 };
  rows.push({ slug, title, words, kb: Math.round(fs.statSync(f).size / 1024), noindex, redir: redirSrc.has(slug) ? 1 : 0, cni: cni.has(slug) ? 1 : 0, impr: p.impr, clicks: p.clicks, pos: p.pos });
}
rows.sort((a, b) => b.impr - a.impr || b.words - a.words);
fs.writeFileSync('/tmp/pagedata.tsv',
  'slug\twords\tkb\tnoindex\tredir\tcni\timpr\tclicks\tpos\ttitle\n' +
  rows.map(r => [r.slug, r.words, r.kb, r.noindex, r.redir, r.cni, r.impr, r.clicks, r.pos, r.title].join('\t')).join('\n'));

const tot = rows.length;
console.log('total pages (root+blog):', tot);
console.log('with GSC impressions (3mo):', rows.filter(r => r.impr > 0).length);
console.log('substantial (>=2500 words):', rows.filter(r => r.words >= 2500).length);
console.log('thin (<1500 words) AND 0 impressions:', rows.filter(r => r.impr === 0 && r.words < 1500).length);
console.log('currently noindex:', rows.filter(r => r.noindex).length);
console.log('already redirected (file still present):', rows.filter(r => r.redir).length);
const b = { '<1000': 0, '1000-1799': 0, '1800-2499': 0, '2500-3999': 0, '4000+': 0 };
for (const r of rows) { const w = r.words; if (w < 1000) b['<1000']++; else if (w < 1800) b['1000-1799']++; else if (w < 2500) b['1800-2499']++; else if (w < 4000) b['2500-3999']++; else b['4000+']++; }
console.log('word buckets:', JSON.stringify(b));
