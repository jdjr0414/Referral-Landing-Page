/**
 * Root-level *.html only: href="/referral-agreement#review" -> href="/referral-form"
 * except links with visible text "Review the Referral Agreement" (reverted).
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const files = fs.readdirSync(root).filter((f) => f.endsWith('.html'));

const find = 'href="/referral-agreement#review"';
const replace = 'href="/referral-form"';
const revertPattern = /<a href="\/referral-form"([^>]*)>Review the Referral Agreement<\/a>/g;
const revertTo = '<a href="/referral-agreement#review"$1>Review the Referral Agreement</a>';

let changed = 0;
for (const f of files) {
  const fp = path.join(root, f);
  let s = fs.readFileSync(fp, 'utf8');
  const orig = s;
  s = s.split(find).join(replace);
  s = s.replace(revertPattern, revertTo);
  if (s !== orig) {
    fs.writeFileSync(fp, s);
    changed++;
  }
}

console.log(`Updated ${changed} file(s) in root.`);
