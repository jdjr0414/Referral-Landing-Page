#!/usr/bin/env node
// Draft prune map: cluster pages by topic, pick a keeper per cluster, list folds.
// Reads /tmp pagedata.tsv (produced by build-prune-data.js). Output: PRUNE-MAP.md
const fs = require('fs');
const TSV = (process.env.GSC || '/tmp') + '/pagedata.tsv';

const rows = fs.readFileSync(TSV, 'utf8').trim().split(/\r?\n/).slice(1).map(l => {
  const [slug, words, kb, noindex, redir, cni, impr, clicks, pos, ...t] = l.split('\t');
  return { slug, words: +words, kb: +kb, noindex: +noindex, redir: +redir, cni: +cni, impr: +impr, clicks: +clicks, pos: +pos, title: t.join('\t') };
});

// Structural pages we always keep (never fold).
const KEEP_ALWAYS = /^(index|referral-form|referral-agreement|glossary|commercial-finance-glossary|sitemap|blog\/|commercial-finance-referrals-(arizona|california|florida|georgia|illinois|michigan|new-york|north-carolina|ohio|texas))/;

// Ordered cluster rules: first match wins. Each cluster gets ONE keeper (max impr, then words).
const CLUSTERS = [
  ['Accounts receivable / factoring', /(accounts?-receivable|receivables?-financ|invoice-factoring|what-is-invoice-factoring|financing-accounts-receivable|factoring)/],
  ['Revenue-based financing', /revenue-based/],
  ['Working capital', /working-capital/],
  ['Merchant cash advance', /(merchant-cash-advance|mca-)/],
  ['SBA loans', /sba-loan/],
  ['Equipment financing (general + by industry)', /(equipment-financ|equipment-lease|equipment-vendor|equipment-sales|heavy-equipment|machinery-financ|fleet-financ|truck-financ|construction-equipment|agricultural-equipment|manufacturing-equipment|medical-equipment|restaurant-equipment|technology-equipment|warehouse-equipment|what-is-equipment-financing|alternative-equipment)/],
  ['ISO / broker program', /(^iso-|commercial-lending-iso|iso-broker|iso-lending|iso-agreement|iso-commission|iso-prospecting|how-iso-agreements|non-circumvention)/],
  ['Deal placement / lender network', /(deal-placement|placement-network|lender-panel|lender-network|lender-partner|building-lender-panel|second-look|where-brokers|where-to-place|declined-deals|send-declined|hard-to-place|deal-types)/],
  ['Declined / bank decline', /(declined|bank-decline|loan-declined|after-bank|options-after|why-business-loans-get-declined|why-clients-keep|ways-banks-say|reasons-business)/],
  ['CPA / accountant referral', /(cpa-|certified-public-accountant|accountant-referral|fractional-cfo|financing-questions-clients)/],
  ['Partner referral programs (other professions)', /(consultant-referral|attorney-referral|business-attorney|real-estate-agent-referral|insurance-agent-referral|payroll-company-referral|bookkeeper-referral|wealth-advisor-referral|hr-consultant|it-consultant|financial-consultant|business-broker-referral|business-consultant|commercial-real-estate-broker-referral|vendor-referral|vendor-financing|financing-for-equipment-vendors|how-vendors|equipment-dealer|dealer-equipment|independent-equipment)/],
  ['Referral economics (fees / commissions / income)', /(referral-fee|referral-commission|referral-income|referral-program|referral-partner|referral-agreement|broker-split|broker-earnings|broker-partnership|broker-network|broker-recruit|commission|residual-income|passive-income|recurring-revenue|making-money|how-brokers-make-money|how-broker|average-business-loan-referral|partnership-opportunities|partnership-program|advisor-partners|how-advisors|how-consultants|how-to-become-commercial-finance|how-commercial-lending|making-money)/],
  ['Industry / practice financing', /(dental|veterinary|optometry|legal-practice|healthcare-practice|medical-practice|practice-acquisition|restaurant|staffing|landscaping|cleaning-business|solar-business|e-commerce|distribution-company|emergency-business|same-day|seasonal|landscaping|construction-business|business-loans-for-|financing-for-|business-cash-flow|business-debt|business-owner-exit|partnership-buyout|financing-new-business)/],
  ['Product / concept education', /(what-is-|how-.*-works|how-factor-rates|how-lenders-evaluate|how-asset-based|purchase-order|inventory-financ|unsecured-business|personal-guarantee|blanket-lien|bridge-financing|line-of-credit|lines-of-credit|business-credit-score|business-loan-terms|loan-applications|commercial-mortgage|commercial-real-estate-financing|ucc-filings|clawback|compliance|second-look-finance|second-look-lending)/],
];

function clusterOf(slug) {
  if (KEEP_ALWAYS.test(slug)) return null; // structural keep
  for (const [name, re] of CLUSTERS) if (re.test(slug)) return name;
  return 'Unclustered (review)';
}

const groups = {};
for (const r of rows) {
  const c = clusterOf(r.slug);
  if (c === null) { (groups['__KEEP_STRUCTURAL__'] ||= []).push(r); continue; }
  (groups[c] ||= []).push(r);
}

const FOLD_IMPR_MAX = 30;
const FOLD_WORDS_MAX = 2500;

let md = '# Prune Map (DRAFT — for review)\n\n';
md += `Generated ${rows.length} pages. Rule: per cluster, **keep** the page with the most impressions (tie: most words); `;
md += `**fold** (301) pages that are thin (<${FOLD_WORDS_MAX} words) **and** under ${FOLD_IMPR_MAX} impressions, or already noindex/redirected. `;
md += `Substantial or traffic-earning non-keepers are marked **KEEP+** (supporting page, not folded).\n\n`;

let keepCount = 0, foldCount = 0;
const foldPlan = [];

const order = ['__KEEP_STRUCTURAL__', ...CLUSTERS.map(c => c[0]), 'Unclustered (review)'];
for (const name of order) {
  const g = groups[name]; if (!g) continue;
  g.sort((a, b) => b.impr - a.impr || b.words - a.words);
  if (name === '__KEEP_STRUCTURAL__') {
    md += `## Structural — always keep (${g.length})\n\n`;
    md += g.map(r => `- \`/${r.slug}\` — ${r.words}w, ${r.impr} impr`).join('\n') + '\n\n';
    keepCount += g.length; continue;
  }
  const keeper = g[0];
  md += `## ${name}\n\n`;
  md += `**KEEP:** \`/${keeper.slug}\` — ${keeper.words}w, **${keeper.impr} impr**, pos ${keeper.pos || '-'}\n\n`;
  keepCount++;
  const folds = [], supporting = [];
  for (const r of g.slice(1)) {
    const foldable = r.impr < FOLD_IMPR_MAX && (r.words < FOLD_WORDS_MAX || r.noindex || r.redir);
    if (foldable) { folds.push(r); } else { supporting.push(r); }
  }
  if (supporting.length) {
    md += `KEEP+ (supporting, not folded): ` + supporting.map(r => `\`/${r.slug}\` (${r.words}w/${r.impr}i)`).join(', ') + '\n\n';
    keepCount += supporting.length;
  }
  if (folds.length) {
    md += `Fold → \`/${keeper.slug}\` (${folds.length}):\n\n`;
    md += '| page | words | impr | flags |\n|---|---|---|---|\n';
    for (const r of folds) {
      const flags = [r.noindex && 'noindex', r.redir && 'has-redir', r.cni && 'crawled-not-idx'].filter(Boolean).join(' ');
      md += `| \`/${r.slug}\` | ${r.words} | ${r.impr} | ${flags} |\n`;
      foldPlan.push({ from: '/' + r.slug, to: '/' + keeper.slug });
      foldCount++;
    }
    md += '\n';
  }
}

md = md.replace('# Prune Map (DRAFT — for review)\n\n',
  `# Prune Map (DRAFT — for review)\n\n**Result: keep ~${keepCount} pages, fold ~${foldCount} into them.**\n\n`);

fs.writeFileSync('PRUNE-MAP.md', md);
fs.writeFileSync((process.env.GSC || '/tmp') + '/foldplan.json', JSON.stringify(foldPlan, null, 2));
console.log(`keep ~${keepCount}, fold ~${foldCount}`);
console.log('wrote PRUNE-MAP.md and foldplan.json');
