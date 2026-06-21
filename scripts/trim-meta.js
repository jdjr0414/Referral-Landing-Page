#!/usr/bin/env node
// Trim over-length <title> (>60) and meta description (>160) to display limits,
// keeping titles/descriptions in sync across <title>/og:title/schema name and
// description/og:description/schema description. PREVIEW=1 prints proposals only.
const fs = require('fs');
const PREVIEW = process.env.PREVIEW === '1';
const BRAND = ' | Axiant Partners';

let pages = fs.readdirSync('.').filter(f => f.endsWith('.html'));
for (const f of fs.readdirSync('blog')) if (f.endsWith('.html')) pages.push('blog/' + f);

const dlen = s => s.replace(/&[a-z]+;/g, 'x').length; // display length (entities = 1 char)
function trimTitle(t) {
  let s = t.trim();
  if (dlen(s) <= 60) return s;
  s = s.replace(/\s*\|\s*Axiant Partners\s*$/, '').trim();      // drop brand suffix
  if (dlen(s) > 60 && s.includes(': ')) s = s.split(': ')[0].trim(); // core phrase before colon
  while (dlen(s) > 60 && s.includes(' | ')) s = s.slice(0, s.lastIndexOf(' | ')).trim(); // drop trailing segments
  if (dlen(s) > 60) {                                            // hard cut at word boundary
    const words = s.split(' '); let out = '';
    for (const w of words) { if (dlen((out + ' ' + w).trim()) > 60) break; out = (out + ' ' + w).trim(); }
    s = out;
  }
  s = s.replace(/[\s\-:|,&]+$/, '').trim();
  if (dlen(s + BRAND) <= 60) s += BRAND;                         // re-append brand if it fits
  return s;
}
function trimDesc(d) {
  let s = d.trim();
  if (s.length <= 160) return s;
  // Prefer cutting at a sentence end before 158.
  const slice = s.slice(0, 158);
  const lastDot = Math.max(slice.lastIndexOf('. '), slice.lastIndexOf('? '), slice.lastIndexOf('! '));
  if (lastDot > 90) return s.slice(0, lastDot + 1).trim();
  const cut = slice.lastIndexOf(' ');
  return (cut > 90 ? s.slice(0, cut) : slice).replace(/[\s,;:\-]+$/, '') + '…';
}
function esc(x) { return x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

let tCount = 0, dCount = 0; const samples = [];
for (const f of pages) {
  let h = fs.readFileSync(f, 'utf8');
  const orig = h;
  const title = (h.match(/<title>([^<]*)<\/title>/) || [])[1];
  const desc = (h.match(/<meta\s+name="description"\s+content="([^"]*)"/) || [])[1];

  if (title) {
    const nt = trimTitle(title);
    if (nt !== title && nt.length >= 15) {
      if (samples.length < 14) samples.push(`T ${title.length}->${nt.length}  ${f}\n     OLD: ${title}\n     NEW: ${nt}`);
      h = h.split(title).join(nt); // syncs <title>, og:title, schema name
      tCount++;
    }
  }
  if (desc) {
    const nd = trimDesc(desc);
    if (nd !== desc && nd.length >= 60) {
      if (dCount < 6) samples.push(`D ${desc.length}->${nd.length}  ${f}\n     NEW: ${nd}`);
      h = h.split(desc).join(nd);
      dCount++;
    }
  }
  if (!PREVIEW && h !== orig) fs.writeFileSync(f, h);
}
console.log((PREVIEW ? '[PREVIEW] ' : '') + `titles trimmed: ${tCount}, descriptions trimmed: ${dCount}\n`);
samples.forEach(s => console.log(s + '\n'));
