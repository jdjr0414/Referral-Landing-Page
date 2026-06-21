#!/usr/bin/env node
// Apply the approved prune: merge fold plan + existing rules + overrides into a
// chain-free redirect map, write worker/redirects.js, list files to delete.
// DRY=1 -> validate and report only (no writes, no deletes).
const fs = require('fs');
const DRY = process.env.DRY === '1';
const FOLDPLAN = process.env.FOLDPLAN || 'C:/tmp/foldplan.json';

const foldplan = JSON.parse(fs.readFileSync(FOLDPLAN, 'utf8')); // [{from,to}]
const rm = fs.readFileSync('worker/redirects.js', 'utf8');
const existing = JSON.parse(rm.slice(rm.indexOf('{'), rm.lastIndexOf('}') + 1)); // current REDIRECTS (incl 4 blog + 45 consolidation)

// Pages to NOT fold (force-keep), even if the draft listed them.
const KEEP_FORCE = new Set(['/500-credit-score-business-loans', '/franchise-lending-clients']);

// Better targets for the "Unclustered" bucket + a couple of fixes (topical correctness).
const TARGET_OVERRIDE = {
  '/what-credit-score-is-needed-for-business-loans': '/500-credit-score-business-loans',
  '/lenders-for-low-credit-business-loans': '/500-credit-score-business-loans',
  '/commercial-finance-network-vs-franchise': '/commercial-finance-referral-program',
  '/commercial-finance-network-franchise': '/commercial-finance-referral-program',
  '/commercial-finance-network-franchise-2': '/commercial-finance-referral-program',
  '/commercial-finance-deal-network': '/where-brokers-send-declined-deals',
  '/commercial-lending-process-flow': '/commercial-finance-referral-program',
  '/commercial-finance-broker-program': '/commercial-finance-referral-program',
  '/local-commercial-finance-referral-network': '/commercial-finance-referral-program',
  '/can-vendors-get-paid-for-referring-financing': '/vendor-referral-partner-program',
  '/how-cpas-refer-financing': '/cpa-referral-program-roi',
  '/can-consultants-refer-business-loans': '/consultant-referral-program',
  '/behind-we-cant-do-this-deal': '/where-brokers-send-declined-deals',
  '/signs-client-needs-different-lender': '/where-brokers-send-declined-deals',
  '/questions-brokers-should-ask-before-sending-file': '/where-brokers-send-declined-deals',
  '/why-sales-reps-ignore-financing': '/vendor-referral-partner-program',
  '/in-house-financing-leaves-money-on-table': '/vendor-referral-partner-program',
  '/hidden-cost-buyers-find-own-financing': '/vendor-referral-partner-program',
  '/reasons-financing-side-income-never-adds-up': '/average-business-loan-referral-fee',
  '/why-referral-checks-are-small': '/average-business-loan-referral-fee',
};

// 4 blog orphans must survive untouched (they redirect missing root URLs into /blog/).
const BLOG_ORPHANS = {};
for (const [k, v] of Object.entries(existing)) if (v.startsWith('/blog/')) BLOG_ORPHANS[k] = v;

// Build raw map: existing consolidation + fold plan + overrides. Overrides win.
const raw = {};
for (const [k, v] of Object.entries(existing)) if (!v.startsWith('/blog/')) raw[k] = v;
for (const { from, to } of foldplan) raw[from] = to;
for (const [k, v] of Object.entries(TARGET_OVERRIDE)) raw[k] = v;
for (const k of KEEP_FORCE) delete raw[k];

// Resolve each source to its FINAL target (follow the map until a non-source), detect cycles.
function resolve(start) {
  let cur = raw[start], seen = new Set([start]);
  while (raw[cur] !== undefined) {
    if (seen.has(cur)) throw new Error('CYCLE at ' + start + ' -> ' + cur);
    seen.add(cur);
    cur = raw[cur];
  }
  return cur;
}
const final = {};
for (const k of Object.keys(raw)) {
  if (KEEP_FORCE.has(k)) continue;
  final[k] = resolve(k);
}

// Existing files (root + blog) to validate targets and decide deletions.
const fileSlugs = new Set();
for (const f of fs.readdirSync('.')) if (f.endsWith('.html')) fileSlugs.add('/' + f.replace(/\.html$/, ''));
for (const f of fs.readdirSync('blog')) if (f.endsWith('.html') && f !== 'index.html') fileSlugs.add('/blog/' + f.replace(/\.html$/, ''));

// Validation
const problems = [];
for (const [from, to] of Object.entries(final)) {
  if (final[to] !== undefined) problems.push(`chain: ${from} -> ${to} (target still redirects)`);
  if (to !== '/' && !fileSlugs.has(to)) problems.push(`missing target file: ${from} -> ${to}`);
  if (KEEP_FORCE.has(from)) problems.push(`force-keep still folded: ${from}`);
}
// Files to delete = source slugs that exist as real files (skip blog orphans whose source is not a file).
const toDelete = Object.keys(final).filter(s => fileSlugs.has(s));

console.log(`final redirects: ${Object.keys(final).length} (+${Object.keys(BLOG_ORPHANS).length} blog orphans)`);
console.log(`files to delete: ${toDelete.length}`);
console.log(`validation problems: ${problems.length}`);
problems.slice(0, 40).forEach(p => console.log('  ! ' + p));
// sanity: make sure we never delete a redirect target
const targets = new Set(Object.values(final));
const deletedTargets = toDelete.filter(d => targets.has(d));
console.log(`deleting a live target? ${deletedTargets.length}`, deletedTargets.slice(0, 10));

if (DRY) { console.log('\n[DRY RUN] no writes.'); process.exit(problems.length ? 1 : 0); }
if (problems.length) { console.error('Refusing to apply with validation problems.'); process.exit(1); }

// Write worker/redirects.js (blog orphans + final consolidation, sorted).
const merged = { ...BLOG_ORPHANS, ...final };
const sorted = Object.fromEntries(Object.keys(merged).sort().map(k => [k, merged[k]]));
const header = `// Redirect data for the canonicalization Worker (worker/index.js).
// Source of truth for 301 consolidation. Maintained by scripts/apply-prune.js + by hand.

export const CANONICAL_HOST = "commercialfinancereferrals.com";

// Exact-path 301s: weak/duplicate slug -> canonical page. Keys & values are path-only, no trailing slash.
export const REDIRECTS = `;
fs.writeFileSync('worker/redirects.js', header + JSON.stringify(sorted, null, 2) + ';\n');

// Delete folded HTML files.
let del = 0;
for (const s of toDelete) {
  const f = s.startsWith('/blog/') ? 'blog/' + s.slice(6) + '.html' : s.slice(1) + '.html';
  if (fs.existsSync(f)) { fs.rmSync(f); del++; }
}
console.log(`\nApplied: wrote worker/redirects.js (${Object.keys(sorted).length} rules), deleted ${del} files.`);
