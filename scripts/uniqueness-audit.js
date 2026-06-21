#!/usr/bin/env node
// Cannibalization + content-uniqueness audit across the surviving pages.
const fs = require('fs');
let pages = fs.readdirSync('.').filter(f => f.endsWith('.html'));
for (const f of fs.readdirSync('blog')) if (f.endsWith('.html') && f !== 'index.html') pages.push('blog/' + f);

function mainText(h) {
  const s = h.indexOf('<main'), e = h.indexOf('</main>');
  let m = (s >= 0 ? h.slice(s, e) : h);
  // drop the shared related-guides + nav/footer-ish blocks for fair comparison
  m = m.replace(/<section class="section"[^>]*id="related-guides"[\s\S]*?<\/section>/g, '');
  return m.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<[^>]+>/g, ' ')
          .replace(/&[a-z]+;/g, ' ').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean);
}
function shingles(words, n = 6) {
  const set = new Set();
  for (let i = 0; i + n <= words.length; i++) set.add(words.slice(i, i + n).join(' '));
  return set;
}
function jaccard(a, b) { let inter = 0; for (const x of a) if (b.has(x)) inter++; return inter / (a.size + b.size - inter); }

const data = pages.map(f => {
  const h = fs.readFileSync(f, 'utf8');
  const title = (h.match(/<title>([^<]*)<\/title>/) || ['', ''])[1];
  const h1 = (h.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || ['', ''])[1].replace(/<[^>]+>/g, '').trim();
  const words = mainText(h);
  return { f, title, h1, words, sh: shingles(words) };
});

// --- Content uniqueness: pairwise shingle Jaccard ---
const pairs = [];
for (let i = 0; i < data.length; i++) for (let j = i + 1; j < data.length; j++) {
  if (data[i].sh.size < 20 || data[j].sh.size < 20) continue;
  const s = jaccard(data[i].sh, data[j].sh);
  if (s >= 0.18) pairs.push([s, data[i].f, data[j].f]);
}
pairs.sort((a, b) => b[0] - a[0]);
console.log(`=== CONTENT UNIQUENESS (6-gram Jaccard, body text) ===`);
console.log(`pairs >=0.18 similarity: ${pairs.length}`);
for (const [s, a, b] of pairs.slice(0, 20)) console.log(`   ${(s * 100).toFixed(0)}%  ${a}  <->  ${b}`);

// --- Identical intro/hero paragraphs (verbatim duplication) ---
const lead = {};
for (const d of data) {
  const h = fs.readFileSync(d.f, 'utf8');
  const m = h.match(/<p class="lead">([\s\S]*?)<\/p>/);
  if (m) { const key = m[1].replace(/<[^>]+>/g, '').trim().slice(0, 120); (lead[key] ||= []).push(d.f); }
}
const dupLead = Object.entries(lead).filter(([k, v]) => v.length > 1 && k.length > 40);
console.log(`\n=== DUPLICATE HERO/LEAD PARAGRAPHS: ${dupLead.length} ===`);
for (const [k, v] of dupLead.slice(0, 10)) console.log(`   x${v.length}: ${v.join(', ')}`);

// --- Cannibalization: pages whose H1 head-term overlaps strongly ---
function headTerms(s) { return new Set(s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(w => w.length > 3 && !['with','your','that','from','what','how','the','for','and','are'].includes(w))); }
const ht = data.map(d => ({ f: d.f, h1: d.h1, t: headTerms(d.h1 || d.title) }));
const cann = [];
for (let i = 0; i < ht.length; i++) for (let j = i + 1; j < ht.length; j++) {
  const a = ht[i].t, b = ht[j].t; if (a.size < 2 || b.size < 2) continue;
  let inter = 0; for (const x of a) if (b.has(x)) inter++;
  const sim = inter / Math.min(a.size, b.size);
  if (sim >= 0.7) cann.push([sim, ht[i].f, ht[i].h1, ht[j].f, ht[j].h1]);
}
cann.sort((a, b) => b[0] - a[0]);
console.log(`\n=== KEYWORD CANNIBALIZATION (H1 head-term overlap >=70%): ${cann.length} ===`);
for (const [s, a, h1a, b, h1b] of cann.slice(0, 20)) console.log(`   ${(s * 100).toFixed(0)}%  [${a}] "${h1a}"  ~  [${b}] "${h1b}"`);
