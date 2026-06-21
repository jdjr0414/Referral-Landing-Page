#!/usr/bin/env node
// De-orphan the substantial pillars by adding a curated "Related guides" section
// to each content page. Pages are grouped into topic clusters; within a cluster,
// each page links to the next N siblings (round-robin) so inbound links distribute
// evenly and no pillar is left orphaned. Idempotent (skips if section already present).
const fs = require('fs');

const CLUSTERS = [
  ['ar', /(accounts?-receivable|receivables?-financ|invoice-factoring|financing-accounts-receivable|factoring|how-accounts-receivable)/],
  ['revenue', /revenue-based/],
  ['wc', /working-capital/],
  ['mca', /(merchant-cash-advance|mca-)/],
  ['sba', /sba-loan/],
  ['equipment', /(equipment-financ|equipment-lease|equipment-vendor|equipment-sales|heavy-equipment|machinery|fleet-financ|truck-financ|construction-equipment|agricultural-equipment|manufacturing-equipment|medical-equipment|restaurant-equipment|technology-equipment|warehouse-equipment|alternative-equipment)/],
  ['iso', /(^\/iso-|commercial-lending-iso|iso-broker|iso-lending|iso-agreement|iso-commission|iso-prospecting|how-iso-agreements|non-circumvention)/],
  ['placement', /(deal-placement|placement-network|lender-panel|lender-network|lender-partner|building-lender-panel|second-look|where-brokers|where-to-place|declined-deals|send-declined|hard-to-place|deal-types)/],
  ['declined', /(declined|bank-decline|loan-declined|after-bank|options-after|why-business-loans-get-declined|why-clients-keep|ways-banks-say|reasons-business|alternative-lenders)/],
  ['cpa', /(cpa-|certified-public-accountant|accountant-referral|fractional-cfo|financing-questions-clients)/],
  ['partners', /(consultant-referral|attorney-referral|business-attorney|real-estate-agent-referral|insurance-agent-referral|payroll-company-referral|bookkeeper-referral|wealth-advisor-referral|hr-consultant|it-consultant|financial-consultant|business-broker-referral|business-consultant|commercial-real-estate-broker-referral|vendor-referral|vendor-financing|financing-for-equipment-vendors|how-vendors|equipment-dealer|dealer-equipment|independent-equipment|consultant-referral-program)/],
  ['economics', /(referral-fee|referral-commission|referral-income|referral-program|referral-partner|referral-agreement|broker-split|broker-earnings|broker-partnership|broker-network|broker-recruit|commission|residual-income|passive-income|recurring-revenue|making-money|average-business-loan-referral|partnership-opportunities|partnership-program|advisor-partners|how-advisors|how-consultants|how-to-become-commercial-finance|how-commercial-lending)/],
  ['industry', /(dental|veterinary|optometry|legal-practice|healthcare-practice|practice-acquisition|restaurant|staffing|landscaping|cleaning-business|solar-business|e-commerce|distribution-company|emergency-business|same-day|seasonal|construction-business|business-loans-for-|financing-for-|business-cash-flow|business-debt|business-owner-exit|partnership-buyout|financing-new-business|franchise-lending)/],
  ['education', /(what-is-|how-.*-works|how-factor-rates|how-lenders-evaluate|how-asset-based|purchase-order|inventory-financ|unsecured-business|personal-guarantee|blanket-lien|bridge-financing|line-of-credit|business-credit-score|business-loan-terms|loan-applications|commercial-mortgage|commercial-real-estate-financing|ucc-filings|clawback|compliance)/],
  ['state', /commercial-finance-referrals-/],
];

// Pages that should NOT get a related section (structural / utility).
const SKIP = new Set(['/index', '/referral-form', '/glossary', '/commercial-finance-glossary']);

let pages = fs.readdirSync('.').filter(f => f.endsWith('.html'));
for (const f of fs.readdirSync('blog')) if (f.endsWith('.html') && f !== 'index.html') pages.push('blog/' + f);

const meta = {};
for (const f of pages) {
  const slug = '/' + f.replace(/\.html$/, '');
  const html = fs.readFileSync(f, 'utf8');
  let title = (html.match(/<title>([^<]*)<\/title>/) || ['', slug])[1];
  title = title.split('|')[0].split(' - ')[0].split(/:\s/)[0].trim(); // concise anchor
  let cluster = 'general';
  for (const [name, re] of CLUSTERS) if (re.test(slug)) { cluster = name; break; }
  meta[slug] = { f, title, cluster };
}

// Group slugs by cluster, deterministic order.
const byCluster = {};
for (const slug of Object.keys(meta)) (byCluster[meta[slug].cluster] ||= []).push(slug);
for (const c in byCluster) byCluster[c].sort();

const N = 6, MIN = 4;
// High-value hubs to pad small clusters so every page gets a useful related set.
const FALLBACK = ['/average-business-loan-referral-fee', '/where-brokers-send-declined-deals',
  '/alternative-equipment-financing', '/how-accounts-receivable-financing-works',
  '/what-is-working-capital-financing', '/sba-loan-referral-fees', '/commercial-lending-iso-program',
  '/cpa-referral-program-roi', '/referral-agreement'].filter(s => meta[s]);
function relatedFor(slug) {
  const c = meta[slug].cluster;
  const list = byCluster[c];
  const i = list.indexOf(slug);
  const out = [];
  for (let k = 1; k <= N && out.length < N; k++) {
    const s = list[(i + k) % list.length];
    if (s !== slug && !out.includes(s)) out.push(s);
  }
  // Pad small clusters from the fallback hubs.
  for (const s of FALLBACK) {
    if (out.length >= MIN) break;
    if (s !== slug && !out.includes(s)) out.push(s);
  }
  return out;
}

let inserted = 0;
for (const slug of Object.keys(meta)) {
  if (SKIP.has(slug)) continue;
  const rel = relatedFor(slug);
  if (rel.length < 2) continue;
  const { f } = meta[slug];
  let html = fs.readFileSync(f, 'utf8');
  if (html.includes('id="related-guides"')) continue; // idempotent
  const items = rel.map(s => `            <li><a href="${s}">${meta[s].title}</a></li>`).join('\n');
  const section = `    <section class="section" id="related-guides">
      <div class="container">
        <div class="section-heading">
          <h2>Related guides</h2>
        </div>
        <div class="list-card">
          <ul class="check-list">
${items}
          </ul>
        </div>
      </div>
    </section>

`;
  const ctaIdx = html.indexOf('<section class="section cta-band">');
  const anchor = ctaIdx !== -1 ? html.slice(ctaIdx) : '</main>';
  const insertAt = ctaIdx !== -1 ? ctaIdx : html.indexOf('</main>');
  html = html.slice(0, insertAt) + section + html.slice(insertAt);
  fs.writeFileSync(f, html);
  inserted++;
}
console.log(`Inserted "Related guides" into ${inserted} pages.`);
