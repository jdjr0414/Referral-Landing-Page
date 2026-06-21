#!/usr/bin/env node
// E-E-A-T footer: add an "About" link to footer-links and a trust/scope
// disclaimer to the footer on every page. Idempotent.
const fs = require('fs');
let pages = fs.readdirSync('.').filter(f => f.endsWith('.html'));
for (const f of fs.readdirSync('blog')) if (f.endsWith('.html')) pages.push('blog/' + f);

const DISCLAIMER = `    <div class="container footer-disclaimer">
      <p>Axiant Partners facilitates financing introductions and is not a direct lender. No funding outcome, rate, or term is guaranteed; every deal is evaluated on its merits. Content on this site is educational and is not financial, legal, tax, or bankruptcy advice.</p>
    </div>
`;

let aboutAdded = 0, discAdded = 0;
for (const f of pages) {
  let h = fs.readFileSync(f, 'utf8');
  const orig = h;

  // 1. About link as the first footer link (skip if already present in the footer area).
  const fl = h.indexOf('<div class="footer-links">');
  if (fl !== -1) {
    const close = h.indexOf('</div>', fl);
    const block = h.slice(fl, close);
    if (!/href="\/about"/.test(block)) {
      const at = fl + '<div class="footer-links">'.length;
      h = h.slice(0, at) + '\n        <a href="/about">About</a>' + h.slice(at);
      aboutAdded++;
    }
  }

  // 2. Disclaimer before </footer>.
  if (!h.includes('footer-disclaimer')) {
    h = h.replace(/(\n\s*<\/footer>)/, '\n' + DISCLAIMER + '$1');
    discAdded++;
  }

  if (h !== orig) fs.writeFileSync(f, h);
}
console.log(`About link added to ${aboutAdded} footers; disclaimer added to ${discAdded} footers.`);
