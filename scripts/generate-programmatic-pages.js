#!/usr/bin/env node
/**
 * Programmatic SEO Page Generator
 * 
 * Generates HTML pages from templates using the config in templates/programmatic-seo-config.json
 * 
 * Usage:
 *   node scripts/generate-programmatic-pages.js                    # Generate all
 *   node scripts/generate-programmatic-pages.js --type industry    # Industry × financing only
 *   node scripts/generate-programmatic-pages.js --type credit       # Credit scenarios only
 *   node scripts/generate-programmatic-pages.js --type decline      # Loan decline only
 *   node scripts/generate-programmatic-pages.js --slug equipment-financing-for-trucking-companies  # Single page
 */

const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '..', 'templates', 'programmatic-seo-config.json');
const OUTPUT_DIR = path.join(__dirname, '..');
const TEMPLATE_PATH = path.join(__dirname, '..', 'templates', 'page-template.html');

// Load config
const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

// Shared HTML shell (header, nav, footer)
const getHtmlShell = () => `
  <header class="site-header">
    <div class="container nav">
      <a href="index.html" class="brand">
        <img src="assets/axiant-logo.png" alt="Axiant" />
        <span class="brand-text">
          <span class="brand-name">Commercial Finance Referrals</span>
          <span class="brand-tagline">powered by axiant</span>
        </span>
      </a>
      <nav>
        <a href="index.html">Referral Partners</a>
        <a href="send-declined-business-loans.html">Send Declined Deals</a>
        <a href="where-brokers-send-declined-deals.html">Where Brokers Send</a>
        <a href="declined-deals.html">Declined Deals</a>
        <a href="commercial-lending-iso-program.html">ISO Program</a>
        <a href="referral-agreement.html">Referral Agreement</a>
        <a href="commercial-lending-referral-fees.html">Referral Fees</a>
        <a href="can-vendors-get-paid-for-referring-financing.html">Vendor Referrals</a>
        <a href="blog/index.html">Articles</a>
        <a href="https://axiantpartners.com/contact">Contact</a>
        <a href="referral-agreement.html#review" class="btn btn-sm">Send a Deal</a>
      </nav>
    </div>
  </header>
`;

const getFooter = () => `
  <footer class="site-footer">
    <div class="container footer-row">
      <div>
        <p>© 2026 Axiant Partners.</p>
        <p class="footer-contact">Call <a href="tel:+19199072611">(919) 907-2611</a> or <a href="https://axiantpartners.com/contact">email us</a></p>
      </div>
      <div class="footer-links">
        <a href="index.html">Referral Partners</a>
        <a href="send-declined-business-loans.html">Send Declined Deals</a>
        <a href="declined-deals.html">Declined Deals</a>
        <a href="referral-agreement.html">Referral Agreement</a>
        <a href="blog/index.html">Articles</a>
        <a href="https://axiantpartners.com/contact">Contact</a>
      </div>
    </div>
  </footer>
`;

function generateIndustryFinancingPage(industry, financingType) {
  const slug = `${financingType.slug}-for-${industry.slug}-companies`;
  const title = `${financingType.name} for ${industry.name} Companies | Axiant Partners`;
  const h1 = `${financingType.name} for ${industry.name} Companies`;
  
  // Build FAQ from template + industry-specific
  const faqs = [
    { q: `What ${financingType.name.toLowerCase()} do ${industry.name.toLowerCase()} companies need?`, a: `${industry.name} companies may need ${financingType.description.toLowerCase()}. Approval depends on deal structure, revenue, and lender guidelines.` },
    { q: `Why do banks decline ${industry.name.toLowerCase()} ${financingType.name.toLowerCase()}?`, a: `Banks may decline due to ${industry.challenges.slice(0, 2).join(', ')}, or credit. Alternative lenders may evaluate differently.` },
    { q: `How do brokers refer ${industry.name.toLowerCase()} ${financingType.name.toLowerCase()}?`, a: `Brokers with a signed referral agreement can submit deals for evaluation. Compensation is typically revenue share when a deal closes.` },
    { q: `Can ${industry.name.toLowerCase()} vendors get paid for referring?`, a: `Yes. Vendors who refer buyers may receive revenue share when deals close. See can vendors get paid for referring financing.` },
    { q: `Where do I send declined ${industry.name.toLowerCase()} ${financingType.name.toLowerCase()}?`, a: `Referral partners can send declined business loans for evaluation. Review the referral agreement before submitting.` },
    { q: `What credit do ${industry.name.toLowerCase()} lenders consider?`, a: `Credit requirements vary by lender. Equipment-backed or revenue-based structures may consider lower credit when other factors are strong.` }
  ];

  return { slug, title, h1, industry, financingType, faqs };
}

function buildFullPage(data) {
  const faqSchema = data.faqs.map(f => 
    `    {"@type":"Question","name":"${f.q.replace(/"/g, '\\"')}","acceptedAnswer":{"@type":"Answer","text":"${f.a.replace(/"/g, '\\"')}"}}`
  ).join(',\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="icon" type="image/png" href="assets/axiant-logo.png" />
  <link rel="canonical" href="${config.baseUrl}/${data.slug}.html" />
  <title>${data.title}</title>
  <meta name="description" content="${data.metaDescription || ''}" />
  <meta name="keywords" content="${data.keywords || ''}" />
  <meta property="og:title" content="${data.title}" />
  <meta property="og:description" content="${data.metaDescription || ''}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${config.baseUrl}/${data.slug}.html" />
  <script type="application/ld+json">
  {"@context":"https://schema.org","@type":"WebPage","name":"${data.title}","description":"${data.metaDescription || ''}","url":"${config.baseUrl}/${data.slug}.html"}
  </script>
  <script type="application/ld+json">
  {"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"${config.baseUrl}/"},{"@type":"ListItem","position":2,"name":"${data.h1}"}]}
  </script>
  <script type="application/ld+json">
  {"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
${faqSchema}
  ]}
  </script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
${getHtmlShell()}
  <main>
    ${data.content}
  </main>
${getFooter()}
  <script src="script.js"></script>
</body>
</html>`;
}

// Parse CLI args
const args = process.argv.slice(2);
const typeArg = args.find(a => a.startsWith('--type='))?.split('=')[1] || args[args.indexOf('--type') + 1];
const slugArg = args.find(a => a.startsWith('--slug='))?.split('=')[1] || args[args.indexOf('--slug') + 1];

if (slugArg) {
  console.log(`Generating single page: ${slugArg}`);
  // Single page generation would need page-specific content - for now, log
  console.log('Single-page generation requires pre-built content. Use the example pages as reference.');
} else if (typeArg) {
  console.log(`Generating pages for type: ${typeArg}`);
  if (typeArg === 'industry') {
    const matrix = config.matrix1_industryFinancing;
    matrix.industries.forEach(ind => {
      matrix.financingTypes.forEach(ft => {
        const data = generateIndustryFinancingPage(ind, ft);
        console.log(`  Would generate: ${data.slug}.html`);
      });
    });
  }
} else {
  console.log('Programmatic SEO Generator');
  console.log('Config loaded from:', CONFIG_PATH);
  console.log('');
  console.log('Matrix 1 - Industry × Financing:', 
    config.matrix1_industryFinancing.industries.length * config.matrix1_industryFinancing.financingTypes.length, 'potential pages');
  console.log('Matrix 2 - Credit scenarios:', config.matrix2_creditScenarios.scenarios.length, 'potential pages');
  console.log('Matrix 3 - Loan decline:', config.matrix3_loanDecline.scenarios.length, 'potential pages');
  console.log('');
  console.log('Usage: node scripts/generate-programmatic-pages.js --type industry|credit|decline');
  console.log('       node scripts/generate-programmatic-pages.js --slug <page-slug>');
}
