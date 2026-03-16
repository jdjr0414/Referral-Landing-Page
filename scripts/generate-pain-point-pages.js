const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

const pages = [
  {
    slug: 'reasons-declined-deals-never-pay-you',
    title: '7 Reasons Your Declined Deals Never Pay You',
    eyebrow: 'For Brokers and ISOs',
    h1: '7 Reasons Your Declined Deals Never Pay You',
    desc: 'Why brokers and ISOs fail to monetize declined deals and what to change so declined business loans finally start paying you.',
    primaryTopic: 'declined deals never paying you',
  },
  {
    slug: 'broker-referral-income-mistakes',
    title: '9 Mistakes Costing Brokers Referral Income',
    eyebrow: 'Referral Income',
    h1: '9 Mistakes Costing Brokers Referral Income',
    desc: 'The operational and strategy mistakes that quietly cost brokers referral income on commercial finance deals.',
    primaryTopic: 'broker referral income mistakes',
  },
  {
    slug: 'how-brokers-lose-clients-after-decline',
    title: '5 Ways Brokers Lose Clients After a Decline',
    eyebrow: 'Protecting Client Relationships',
    h1: '5 Ways Brokers Lose Clients After a Decline',
    desc: 'How brokers unintentionally lose clients after a loan decline and how to keep relationships (and revenue) instead.',
    primaryTopic: 'losing clients after a decline',
  },
  {
    slug: 'why-second-look-lenders-dont-close',
    title: 'Why Your Second Look Lenders Don’t Close',
    eyebrow: 'Second Look Lenders',
    h1: 'Why Your Second Look Lenders Don’t Close',
    desc: 'Reasons second look lenders fail to close your files and how to improve close rates on declined business loans.',
    primaryTopic: 'second look lenders not closing',
  },
  {
    slug: 'deal-types-your-lender-panel-hates',
    title: '7 Deal Types Your Lender Panel Quietly Hates',
    eyebrow: 'Lender Panel Fit',
    h1: '7 Deal Types Your Lender Panel Quietly Hates',
    desc: 'Specific deal types that rarely fit your core lender panel and should be routed to a referral partner instead.',
    primaryTopic: 'deal types lender panel hates',
  },
  {
    slug: 'questions-brokers-should-ask-before-sending-file',
    title: '10 Questions Brokers Never Ask Before Sending a File',
    eyebrow: 'Deal Screening',
    h1: '10 Questions Brokers Never Ask Before Sending a File',
    desc: 'Screening questions that reduce declines and make second look referrals more successful.',
    primaryTopic: 'questions before sending a file',
  },
  {
    slug: 'financing-gaps-killing-equipment-sales',
    title: '5 Financing Gaps Killing Your Equipment Sales',
    eyebrow: 'For Equipment Vendors',
    h1: '5 Financing Gaps Killing Your Equipment Sales',
    desc: 'The recurring financing gaps that quietly kill equipment deals and how vendors can plug them with referral partners.',
    primaryTopic: 'financing gaps killing equipment sales',
  },
  {
    slug: 'in-house-financing-leaves-money-on-table',
    title: 'Why Your In‑House Financing Leaves Money on the Table',
    eyebrow: 'Vendor Financing',
    h1: 'Why Your In‑House Financing Leaves Money on the Table',
    desc: 'Limitations of captive and preferred programs and how referral partnerships capture more revenue.',
    primaryTopic: 'in house financing leaving money on the table',
  },
  {
    slug: 'reasons-declined-buyers-never-call-back',
    title: '7 Reasons Declined Buyers Never Call You Back',
    eyebrow: 'Buyer Experience',
    h1: '7 Reasons Declined Buyers Never Call You Back',
    desc: 'What happens to buyers after a financing decline and how vendors can keep the conversation going.',
    primaryTopic: 'declined buyers not calling back',
  },
  {
    slug: 'hidden-cost-buyers-find-own-financing',
    title: 'The Hidden Cost of Letting Buyers “Find Their Own Financing”',
    eyebrow: 'Control of the Deal',
    h1: 'The Hidden Cost of Letting Buyers “Find Their Own Financing”',
    desc: 'Why sending buyers away to find their own financing kills close rates and margins.',
    primaryTopic: 'buyers find their own financing',
  },
  {
    slug: 'why-sales-reps-ignore-financing',
    title: 'Why Your Sales Reps Ignore the Financing Program',
    eyebrow: 'Sales Teams',
    h1: 'Why Your Sales Reps Ignore the Financing Program',
    desc: 'Misaligned incentives and processes that cause reps to skip your financing options entirely.',
    primaryTopic: 'sales reps ignoring financing',
  },
  {
    slug: 'financing-questions-clients-afraid-to-ask-cpas',
    title: '5 Financing Questions Your Clients Are Afraid to Ask You',
    eyebrow: 'For CPAs and Advisors',
    h1: '5 Financing Questions Your Clients Are Afraid to Ask You',
    desc: 'Client financing questions that never make it to the agenda and how CPAs can respond.',
    primaryTopic: 'client financing questions for cpas',
  },
  {
    slug: 'why-clients-keep-getting-bank-declines',
    title: 'Why Your Clients Keep Getting Bank Declines',
    eyebrow: 'Bank Declines',
    h1: 'Why Your Clients Keep Getting Bank Declines',
    desc: 'Root causes behind repeated bank declines and what advisors can do differently.',
    primaryTopic: 'clients getting bank declines',
  },
  {
    slug: 'cpa-financing-referral-mistakes',
    title: 'The Biggest Mistake CPAs Make with Financing Referrals',
    eyebrow: 'CPA Referral Programs',
    h1: 'The Biggest Mistake CPAs Make with Financing Referrals',
    desc: 'How CPAs accidentally leave referral income and client value on the table.',
    primaryTopic: 'cpa financing referral mistakes',
  },
  {
    slug: 'signs-client-needs-different-lender',
    title: '7 Red Flags Your Client Needs a Different Lender',
    eyebrow: 'Advisor Red Flags',
    h1: '7 Red Flags Your Client Needs a Different Lender',
    desc: 'Signals that current lenders are a bad fit and it is time for a referral.',
    primaryTopic: 'red flags need different lender',
  },
  {
    slug: 'reasons-business-loan-offers-feel-off',
    title: '9 Reasons Business Loan Offers Feel “Off”',
    eyebrow: 'For Business Owners',
    h1: '9 Reasons Business Loan Offers Feel “Off”',
    desc: 'Why pricing, structure, or terms feel wrong and when to ask for a second opinion.',
    primaryTopic: 'business loan offers feel off',
  },
  {
    slug: 'behind-we-cant-do-this-deal',
    title: 'What’s Really Behind “We Can’t Do This Deal Right Now”',
    eyebrow: 'Reading Lender Signals',
    h1: 'What’s Really Behind “We Can’t Do This Deal Right Now”',
    desc: 'Decode lender language and understand what to do after a soft decline.',
    primaryTopic: 'we cant do this deal right now',
  },
  {
    slug: 'ways-banks-say-no-without-saying-declined',
    title: '7 Ways Banks Say No Without Saying “Declined”',
    eyebrow: 'Banking Language',
    h1: '7 Ways Banks Say No Without Saying “Declined”',
    desc: 'How banks communicate no without using the word and how borrowers and brokers should respond.',
    primaryTopic: 'ways banks say no',
  },
  {
    slug: 'why-referral-checks-are-small',
    title: 'Why Your Referral Checks Are Smaller Than They Should Be',
    eyebrow: 'Referral Earnings',
    h1: 'Why Your Referral Checks Are Smaller Than They Should Be',
    desc: 'Structural reasons referral checks disappoint and how to adjust agreements and deal mix.',
    primaryTopic: 'small referral checks',
  },
  {
    slug: 'reasons-financing-side-income-never-adds-up',
    title: '5 Reasons Your Financing Side Income Never Adds Up',
    eyebrow: 'Side Income from Financing',
    h1: '5 Reasons Your Financing Side Income Never Adds Up',
    desc: 'Why casual referrals rarely turn into meaningful income and how to build a real pipeline.',
    primaryTopic: 'financing side income never adds up',
  },
];

function buildPage(p) {
  const canonical = `https://commercialfinancereferrals.com/${p.slug}`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-H53CPWQ9TC"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'G-H53CPWQ9TC');
  </script>

  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="robots" content="index, follow" />
  <link rel="icon" type="image/png" href="assets/favicon.png" />
  <link rel="canonical" href="${canonical}" />
  <title>${p.title} | Axiant Partners</title>
  <meta name="description" content="${p.desc}" />
  <meta name="keywords" content="${p.primaryTopic}, commercial finance pain points, declined business loans, referral partners" />
  <meta property="og:title" content="${p.title} | Axiant Partners" />
  <meta property="og:description" content="${p.desc}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:image" content="https://commercialfinancereferrals.com/assets/axiant-logo.png" />
  <meta name="twitter:card" content="summary" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css" />
  <script type="application/ld+json">
  {"@context":"https://schema.org","@type":"WebPage","name":"${p.title}","description":"${p.desc}","url":"${canonical}","speakable":{"@type":"SpeakableSpecification","cssSelector":[".quick-answer",".key-takeaways"]}}
  </script>
  <script type="application/ld+json">
  {"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://commercialfinancereferrals.com/"},{"@type":"ListItem","position":2,"name":"${p.title}"}]}
  </script>
  <script type="application/ld+json">
  {"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
    {"@type":"Question","name":"What is this page about?","acceptedAnswer":{"@type":"Answer","text":"This page explains ${p.primaryTopic} and how commercial finance referral partners, brokers, vendors, and advisors can address it using structured referral relationships."}},
    {"@type":"Question","name":"Who is this for?","acceptedAnswer":{"@type":"Answer","text":"The content is written for US-based brokers, ISOs, equipment vendors, CPAs, and advisors who encounter business owners that need financing but fall outside narrow lender credit boxes."}},
    {"@type":"Question","name":"How do I act on this information?","acceptedAnswer":{"@type":"Answer","text":"Review the referral agreement, decide which deals or client situations fit the pain point described, and build a consistent habit of submitting those opportunities for second look review rather than letting them die after a decline."}}
  ]}
  </script>
</head>
<body>
  <header class="site-header">
    <div class="container nav">
      <a href="/" class="brand">
        <img src="assets/axiant-logo.png" alt="Axiant Partners logo" />
        <span class="brand-text">
          <span class="brand-name">Commercial Finance Referrals</span>
          <span class="brand-tagline">powered by axiant</span>
        </span>
      </a>
      <nav>
        <a href="/">Home</a>
        <a href="/declined-business-loans">Declined</a>
        <a href="/equipment-financing">Equipment</a>
        <a href="/referral-agreement">Referral</a>
        <a href="/blog">Articles</a>
        <a href="https://axiantpartners.com/contact" rel="noopener noreferrer">Contact</a>
        <a href="/referral-agreement#review" class="btn btn-cta-nav">Send a Deal</a>
      </nav>
    </div>
  </header>

  <main>
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <div class="container">
        <a href="/">Home</a>
        <span class="sep">›</span>
        <span aria-current="page">${p.title}</span>
      </div>
    </nav>

    <section class="hero">
      <div class="container hero-grid">
        <div class="hero-main">
          <div class="quick-answer" role="complementary" aria-label="Quick answer">
            <p><strong>Quick answer:</strong> ${p.title} is about identifying the specific pain points that keep commercial finance opportunities from turning into funded deals and referral income. Once you can name what is blocking you&mdash;panel fit, missing agreements, lack of process, or communication gaps&mdash;you can route the right files to a broader lender network and build a repeatable second look path instead of letting deals die after the first decline.</p>
          </div>
          <p class="last-updated">Last updated: March 2026</p>
          <p class="eyebrow">${p.eyebrow}</p>
          <h1>${p.h1}</h1>
          <p class="lead">
            ${p.desc} This page frames the issue from the perspective of real-world pain: missed commissions, lost clients, stalled equipment sales, or frustrated business owners. It then shows how a structured commercial finance referral path changes the outcome without forcing you to become a full-time lender.
          </p>
          <div class="hero-actions">
            <a href="/referral-agreement#review" class="btn btn-primary">Review the Referral Agreement</a>
            <a href="/declined-business-loans" class="btn btn-secondary">Declined Business Loans Hub</a>
            <a href="/referral-partner-earnings" class="btn btn-secondary">See Referral Partner Earnings</a>
          </div>
          <ul class="hero-points">
            <li>Names the pain behind ${p.primaryTopic}</li>
            <li>Shows how declined deals become revenue</li>
            <li>Clarifies when to keep vs refer a deal</li>
          </ul>
        </div>
        <aside class="hero-card">
          <h2>Key takeaways</h2>
          <p class="hero-card-intro">Practical points from this guide:</p>
          <ul class="hero-card-list key-takeaways">
            <li>You are not stuck with a single lender or program.</li>
            <li>A signed referral agreement lets you monetize overflow and declines.</li>
            <li>Simple checklists and questions prevent avoidable dead ends.</li>
          </ul>
        </aside>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-heading">
          <h2>Understanding the pain behind ${p.primaryTopic}</h2>
        </div>
        <div class="info-content">
          <p>Most commercial finance professionals feel the pain of lost opportunities long before they can describe the underlying pattern. A deal gets declined, the borrower disappears, the vendor loses the sale, or the broker never hears back. Over time, these moments blur together into a vague sense that financing is harder than it should be. By naming the specific pattern&mdash;${p.primaryTopic}&mdash;you gain leverage over it.</p>
          <p>Across the United States, brokers, ISOs, equipment vendors, CPAs, and advisors repeat the same story: strong relationships, interesting clients, but an extremely narrow lender credit box. The result is predictable. Deals that fit the box close; deals that do not fit stall or die. This page exists to show that you are not limited to a single box. With a second look path and a referral agreement in place, you can give declined or hard-to-place deals a different route without putting your reputation at risk.</p>
        </div>
      </div>
    </section>

    <section class="section alt">
      <div class="container">
        <div class="section-heading">
          <h2>How this pain shows up in day-to-day work</h2>
        </div>
        <div class="info-content">
          <p>The pain behind ${p.primaryTopic} rarely announces itself as a single dramatic event. Instead, it appears as patterns in your calendar and inbox. A broker spends hours structuring a file only to receive a terse decline. An equipment vendor hears that a \"pre-approved\" buyer was turned down by in-house financing and never hears from them again. A CPA learns months later that a great client quietly took a high-cost product because their bank said no.</p>
          <p>In each of these cases, there was a moment when a different path was possible. If a referral agreement had been in place, and if you had a simple habit of submitting certain types of deals for a second look, the story could have ended differently. The goal is not to force marginal transactions through; it is to give qualified but non-standard deals a wider lane while signaling to clients that you are looking out for them.</p>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-heading">
          <h2>Deals and situations that belong in a second look pipeline</h2>
        </div>
        <div class="info-content">
          <p>Certain patterns almost always belong in a second look pipeline instead of a hard stop. Examples include bank declines driven by policy rather than fundamentals, exposure limits at an otherwise supportive lender, strong collateral with credit that is a little outside the box, or industry types that your core programs do not prefer. When you see these, it is a signal to route the opportunity instead of closing the file.</p>
          <p>The same principle applies to vendor and advisor relationships. If a buyer or client fits your product or service but not your internal financing, the loss is unnecessary. A referral partner that works with a broader lending network can evaluate the opportunity. If the deal closes, you keep the equipment sale or client relationship and earn referral income on top. See <a href="/send-declined-business-loans">send declined business loans</a> for how to submit files and <a href="/average-business-loan-referral-fee">average business loan referral fee</a> for typical compensation ranges.</p>
        </div>
      </div>
    </section>

    <section class="section alt">
      <div class="container">
        <div class="section-heading">
          <h2>Simple checklists that reduce friction</h2>
        </div>
        <ul class="check-list">
          <li><strong>Clarify the decline reason</strong>&mdash;Ask whether the decision was driven by credit, policy, exposure, industry, or structure.</li>
          <li><strong>Sort deals into \"core\" vs \"referral\" buckets</strong>&mdash;Keep the ones that truly fit your lenders; route the rest.</li>
          <li><strong>Confirm your referral agreement</strong>&mdash;Make sure a signed agreement is in place <em>before</em> you send any information.</li>
          <li><strong>Set client expectations</strong>&mdash;Explain that you are getting a second opinion from a broader network, not promising approval.</li>
          <li><strong>Track outcomes</strong>&mdash;Over a year, measure how many referred deals fund and what you earn.</li>
        </ul>
      </div>
    </section>

    <section class="section alt faq">
      <div class="container">
        <div class="section-heading">
          <p class="eyebrow">FAQ</p>
          <h2>Questions about handling ${p.primaryTopic}</h2>
        </div>
        <div class="faq-grid faq-grid-eight">
          <article class="card"><h3>Does referring deals mean I give up my client?</h3><p>No. With a structured referral agreement and clear communication, you remain the client\'s primary relationship. The financing partner focuses on placement; you focus on strategy, equipment, or advisory work. See <a href="/referral-agreement">referral agreement</a> for how prospect protection works.</p></article>
          <article class="card"><h3>Will referral income really move the needle?</h3><p>It depends on volume and deal size. A handful of well-chosen referrals can add meaningful side income; a steady pipeline can become a real revenue stream. See <a href="/referral-partner-earnings">referral partner earnings</a> and <a href="/making-money-financing-referral-partner">making money as a financing referral partner</a> for examples.</p></article>
          <article class="card"><h3>How does this help my GEO and AEO presence?</h3><p>Pages like this one answer specific pain-point questions directly in natural language, which helps answer engine optimization, while still signaling that you work with US-based businesses across many regions. Structured FAQ and WebPage schema help search and voice surfaces understand the topic.</p></article>
        </div>
      </div>
    </section>

    <section class="section cta-band">
      <div class="container cta-band-inner">
        <div>
          <p class="eyebrow">Ready to route the right deals?</p>
          <h2>Review and send a deal</h2>
          <p>Review the referral agreement, decide which of your declined or hard-to-place deals fit this pattern, and submit them for a second look. 35% revenue share when deals close.</p>
        </div>
        <div class="cta-stack">
          <a href="/referral-agreement#review" class="btn btn-primary">Send a Deal</a>
          <a href="/referral-agreement" class="btn btn-secondary">Review the Referral Agreement</a>
        </div>
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <div class="footer-cta">
      <div class="container">
        <a href="/referral-agreement#review" class="btn btn-primary">Send a Deal</a>
        <p>Ready to submit? Review the agreement and email us.</p>
      </div>
    </div>
    <div class="container footer-row">
      <div>
        <p>© 2026 Axiant Partners.</p>
        <p class="footer-contact">Call <a href="tel:+19199072611">(919) 907-2611</a> or <a href="https://axiantpartners.com/contact" rel="noopener noreferrer">email us / have us reach out</a></p>
      </div>
      <div class="footer-links">
        <a href="/">Referral Partners</a>
        <a href="/send-declined-business-loans">Send Declined Deals</a>
        <a href="/where-brokers-send-declined-deals">Where Brokers Send</a>
        <a href="/declined-deals">Declined Deals</a>
        <a href="/commercial-lending-iso-program">ISO Program</a>
        <a href="/referral-agreement">Referral Agreement</a>
        <a href="/commercial-lending-referral-fees">Referral Fees</a>
        <a href="/blog">Articles</a>
        <a href="/can-vendors-get-paid-for-referring-financing">Vendor Referrals</a>
        <a href="https://axiantpartners.com/contact" rel="noopener noreferrer">Contact</a>
      </div>
    </div>
  </footer>

  <script src="script.js"></script>
</body>
</html>
`;
}

let created = 0;
for (const page of pages) {
  const target = path.join(root, `${page.slug}.html`);
  if (!fs.existsSync(target)) {
    fs.writeFileSync(target, buildPage(page), 'utf8');
    created++;
  }
}

console.log(`Generated ${created} pain-point pages.`);

