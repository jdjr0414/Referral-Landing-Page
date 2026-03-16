const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

const slugs = [
  'reasons-declined-deals-never-pay-you',
  'broker-referral-income-mistakes',
  'how-brokers-lose-clients-after-decline',
  'why-second-look-lenders-dont-close',
  'deal-types-your-lender-panel-hates',
  'questions-brokers-should-ask-before-sending-file',
  'financing-gaps-killing-equipment-sales',
  'in-house-financing-leaves-money-on-table',
  'reasons-declined-buyers-never-call-back',
  'hidden-cost-buyers-find-own-financing',
  'why-sales-reps-ignore-financing',
  'financing-questions-clients-afraid-to-ask-cpas',
  'why-clients-keep-getting-bank-declines',
  'cpa-financing-referral-mistakes',
  'signs-client-needs-different-lender',
  'reasons-business-loan-offers-feel-off',
  'behind-we-cant-do-this-deal',
  'ways-banks-say-no-without-saying-declined',
  'why-referral-checks-are-small',
  'reasons-financing-side-income-never-adds-up',
];

const EXTRA_SECTION = `    <section class="section">
      <div class="container">
        <div class="section-heading">
          <h2>Practical example: turning one lost deal into a process</h2>
        </div>
        <div class="info-content">
          <p>Think about a single deal you lost in the last twelve months because of the pain described on this page. Maybe a bank declined a long-time client, an equipment buyer disappeared after in-house financing said no, or a borrower accepted a structure you knew was not ideal. Instead of treating that file as an isolated disappointment, treat it as a template. Ask what would have been different if a referral agreement, a second look path, and a short checklist had been in place.</p>
          <p>For many professionals across the United States, the answer is simple: the deal would at least have had a second chance. Some would still have fallen outside every lender's credit box, but others would have found a home with different structure, collateral, or pricing. When you multiply this by five or ten files per year, it becomes clear that the real cost of inaction is not one lost commission&mdash;it is a pattern of silent attrition that a simple process could address.</p>
        </div>
      </div>
    </section>

    <section class="section alt">
      <div class="container">
        <div class="section-heading">
          <h2>Action steps you can take this week</h2>
        </div>
        <ul class="check-list">
          <li><strong>Identify three past deals</strong>&mdash;Pick files that match the pain described on this page and imagine how a second look would have changed the outcome.</li>
          <li><strong>Decide your referral triggers</strong>&mdash;Write down the specific situations where you will automatically consider routing a deal for another opinion.</li>
          <li><strong>Review the referral agreement</strong>&mdash;Make sure you understand compensation, prospect protection, and payment timing before you send anything.</li>
          <li><strong>Tell clients what you are doing</strong>&mdash;Explain that you are exploring additional options, not promising approval, and that you will report back either way.</li>
          <li><strong>Measure over the next quarter</strong>&mdash;Track how many referred deals fund and what you earn; then decide whether to expand the process.</li>
        </ul>
      </div>
    </section>

`;

let updated = 0;

for (const slug of slugs) {
  const file = path.join(root, `${slug}.html`);
  if (!fs.existsSync(file)) continue;

  let html = fs.readFileSync(file, 'utf8');

  // Only inject once
  if (html.includes('Practical example: turning one lost deal into a process')) continue;

  const marker = '    <section class="section alt faq">';
  const idx = html.indexOf(marker);
  if (idx === -1) continue;

  const before = html.slice(0, idx);
  const after = html.slice(idx);
  const next = before + EXTRA_SECTION + after;
  fs.writeFileSync(file, next, 'utf8');
  updated++;
}

  console.log('Expanded ' + updated + ' pain-point pages with additional content.');

