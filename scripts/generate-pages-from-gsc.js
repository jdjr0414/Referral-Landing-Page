const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const gscDir = path.join(root, 'gsc');

function loadSiteConfig() {
  // Optional per-site configuration so the same generator works across multiple repos.
  // Put this file at: <repo>/gsc/site-config.json
  const defaultConfig = {
    baseUrl: 'https://commercialfinancereferrals.com',
    siteHeaderBrandName: 'Commercial Finance Referrals',
    siteHeaderBrandTagline: 'powered by axiant',
    titleSuffix: 'Axiant Partners',
    footerBrand: 'Axiant Partners',
    contactUrl: 'https://axiantpartners.com/contact',
  };

  const configPath = path.join(gscDir, 'site-config.json');
  if (!fs.existsSync(configPath)) return defaultConfig;

  try {
    const raw = fs.readFileSync(configPath, 'utf8');
    const cfg = JSON.parse(raw);
    return { ...defaultConfig, ...cfg };
  } catch (e) {
    console.warn(`Could not parse ${path.relative(root, configPath)}; using defaults.`);
    return defaultConfig;
  }
}

const siteCfg = loadSiteConfig();

function ensureGscDir() {
  if (!fs.existsSync(gscDir)) {
    fs.mkdirSync(gscDir);
  }
}

function unzipIfNeeded(zipPath) {
  const extractDir = path.join(gscDir, 'latest');
  if (!fs.existsSync(zipPath)) {
    console.error(`GSC zip not found at: ${zipPath}`);
    process.exit(1);
  }
  if (!fs.existsSync(extractDir)) {
    fs.mkdirSync(extractDir);
  }

  // Clean existing extracted files
  for (const file of fs.readdirSync(extractDir)) {
    fs.unlinkSync(path.join(extractDir, file));
  }

  // Use tar (available on your system) to extract the zip
  const relZip = path.relative(extractDir, zipPath);
  execSync(`tar -xf "${zipPath}" -C "${extractDir}"`);
  return extractDir;
}

function parseCsv(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const lines = raw.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',');
  const qIndex = headers.findIndex(h => /quer/i.test(h));
  const impIndex = headers.findIndex(h => /impressions/i.test(h));
  const posIndex = headers.findIndex(h => /position/i.test(h));

  if (qIndex === -1 || impIndex === -1 || posIndex === -1) {
    console.error('Could not find Query, Impressions, or Position columns in Queries.csv');
    process.exit(1);
  }

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    if (cols.length <= Math.max(qIndex, impIndex, posIndex)) continue;
    const query = cols[qIndex].replace(/^"|"$/g, '');
    const impressions = Number(cols[impIndex]) || 0;
    const position = Number(cols[posIndex]) || 0;
    if (!query) continue;
    rows.push({ query, impressions, position });
  }
  return rows;
}

function isBrandQuery(query) {
  const q = query.toLowerCase();
  const brandTerms = [
    'axiant',
    'commercial finance referrals',
    'commercialfinancereferrals.com'
  ];
  return brandTerms.some(term => q.includes(term));
}

function slugify(query) {
  return query
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'topic';
}

function pickTopics(rows, limit = 15) {
  const stopWords = new Set([
    'the',
    'and',
    'for',
    'to',
    'with',
    'of',
    'in',
    'on',
    'at',
    'a',
    'an',
    'this',
    'that',
    'what',
    'how',
    'when',
    'where',
    'is',
    'are',
    'be',
    'it',
  ]);

  function stemToken(t) {
    // Lightweight plural normalization to reduce near-duplicate overlap:
    // accounts -> account, receivables -> receivable, brokers -> broker, etc.
    if (t.length > 3 && t.endsWith('s')) return t.slice(0, -1);
    return t;
  }

  function tokenize(query) {
    const cleaned = query.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    const parts = cleaned.split(/\s+/).filter(Boolean);
    const tokens = parts
      .map(stemToken)
      .filter((tok) => tok.length > 2 && !stopWords.has(tok));
    return new Set(tokens);
  }

  function jaccard(a, b) {
    const union = new Set([...a, ...b]);
    if (!union.size) return 0;
    let interCount = 0;
    for (const x of a) if (b.has(x)) interCount++;
    return interCount / union.size;
  }

  function isNearDuplicate(candidateQuery, chosenQueries) {
    const candTokens = tokenize(candidateQuery);

    // Also prevent picking a topic that is too close to something that already exists in the repo.
    // This avoids overlap with pages created by earlier runs.
    const existingHtmlSlugs = fs
      .readdirSync(root)
      .filter((f) => f.toLowerCase().endsWith('.html'))
      .map((f) => f.slice(0, -5));
    const existingTokenSets = existingHtmlSlugs.map((slug) => tokenize(slug.replace(/-/g, ' ')));

    for (const chosenQuery of chosenQueries) {
      const chosenTokens = tokenize(chosenQuery);
      const j = jaccard(candTokens, chosenTokens);

      // Consider it a near-duplicate if:
      // - token similarity is high, OR
      // - one query is basically the other plus a very small qualifier
      //   (e.g. "revenue based financing" vs "revenue based financing market").
      const smaller = candTokens.size < chosenTokens.size ? candTokens : chosenTokens;
      const larger = candTokens.size < chosenTokens.size ? chosenTokens : candTokens;
      const smallerIsSubset = smaller.size > 0 && [...smaller].every((t) => larger.has(t));
      const sizeDiff = Math.abs(candTokens.size - chosenTokens.size);

      if (j >= 0.65) return true;
      if (smallerIsSubset && sizeDiff <= 2) return true;
    }

    for (const existingTokens of existingTokenSets) {
      const j = jaccard(candTokens, existingTokens);
      const smaller = candTokens.size < existingTokens.size ? candTokens : existingTokens;
      const larger = candTokens.size < existingTokens.size ? existingTokens : candTokens;
      const smallerIsSubset = smaller.size > 0 && [...smaller].every((t) => larger.has(t));
      const sizeDiff = Math.abs(candTokens.size - existingTokens.size);

      if (j >= 0.65) return true;
      if (smallerIsSubset && sizeDiff <= 2) return true;
    }
    return false;
  }

  const candidates = rows
    // Generate enough candidates; later we skip anything that already has a matching HTML file.
    .filter(r => r.impressions >= 3 && r.position >= 1 && r.position <= 100 && !isBrandQuery(r.query))
    .sort((a, b) => {
      const impDiff = b.impressions - a.impressions;
      if (impDiff !== 0) return impDiff;
      return Math.abs(a.position - 20) - Math.abs(b.position - 20); // prefer mid-range positions
    });

  const usedSlugs = new Set();
  const topics = [];
  const chosenQueries = [];

  for (const row of candidates) {
    let baseSlug = slugify(row.query);
    if (fs.existsSync(path.join(root, `${baseSlug}.html`))) continue; // avoid near-duplicate cannibalization
    if (usedSlugs.has(baseSlug)) continue;

    if (isNearDuplicate(row.query, chosenQueries)) continue;
    chosenQueries.push(row.query);
    usedSlugs.add(baseSlug);

    const title = row.query[0].toUpperCase() + row.query.slice(1);
    topics.push({
      slug: baseSlug,
      title,
      query: row.query,
      impressions: row.impressions,
      position: row.position
    });
    if (topics.length >= limit) break;
  }

  return topics;
}

function buildPage(topic) {
  const canonical = `${siteCfg.baseUrl}/${topic.slug}`;
  const safeQuery = topic.query.replace(/"/g, '\"');
  const title = `${topic.title} | ${siteCfg.titleSuffix}`;
  const desc = `Practical guide for “${safeQuery}” in commercial finance: what it usually means, how it works, pros and cons, cost factors to compare, and next steps (including when to route through referral partners for hard-to-place deals).`;
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
  <title>${title}</title>
  <meta name="description" content="${desc}" />
  <meta name="keywords" content="${safeQuery}, commercial finance, working capital, declined business loans, referral partners" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${desc}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:image" content="${siteCfg.baseUrl}/assets/axiant-logo.png" />
  <meta name="twitter:card" content="summary" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css" />
  <script type="application/ld+json">
  {"@context":"https://schema.org","@type":"WebPage","name":"${topic.title}","description":"${desc}","url":"${canonical}","speakable":{"@type":"SpeakableSpecification","cssSelector":[".quick-answer",".key-takeaways"]}}
  </script>
  <script type="application/ld+json">
  {"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://commercialfinancereferrals.com/"},{"@type":"ListItem","position":2,"name":"${topic.title}"}]}
  </script>
  <script type="application/ld+json">
  {"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
    {"@type":"Question","name":"What is this page about?","acceptedAnswer":{"@type":"Answer","text":"This page explains topics related to the search query \\"${safeQuery}\\" in plain English and shows how business owners, brokers, vendors, CPAs, and advisors can act on it using commercial finance referral relationships."}},
    {"@type":"Question","name":"Who is this for?","acceptedAnswer":{"@type":"Answer","text":"The content is written for US-based small business owners and the professionals who advise them, including brokers, ISOs, equipment vendors, accountants, and consultants."}},
    {"@type":"Question","name":"How do I act on this information?","acceptedAnswer":{"@type":"Answer","text":"Use the checklists on this page to decide when to keep a deal with your core lenders, when to pursue a specific financing product, and when to route an opportunity through a referral partner for a second look."}}
  ]}
  </script>
</head>
<body>
  <header class="site-header">
    <div class="container nav">
      <a href="/" class="brand">
        <img src="assets/axiant-logo.png" alt="Axiant Partners logo" />
        <span class="brand-text">
          <span class="brand-name">${siteCfg.siteHeaderBrandName}</span>
          <span class="brand-tagline">${siteCfg.siteHeaderBrandTagline}</span>
        </span>
      </a>
      <nav>
        <a href="/">Home</a>
        <a href="/declined-business-loans">Declined</a>
        <a href="/equipment-financing">Equipment</a>
        <a href="/referral-agreement">Referral</a>
        <a href="/blog">Articles</a>
        <a href="${siteCfg.contactUrl}" rel="noopener noreferrer">Contact</a>
        <a href="/referral-agreement#review" class="btn btn-cta-nav">Send a Deal</a>
      </nav>
    </div>
  </header>

  <main>
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <div class="container">
        <a href="/">Home</a>
        <span class="sep">›</span>
        <span aria-current="page">${topic.title}</span>
      </div>
    </nav>

    <section class="hero">
      <div class="container hero-grid">
        <div class="hero-main">
          <div class="quick-answer" role="complementary" aria-label="Quick answer">
            <p><strong>Quick answer:</strong> This page takes the real-world search query “${safeQuery}” and turns it into a structured guide. It explains what the term usually means in commercial finance conversations, where it fits among working capital and referral options, and how to decide on clear next steps instead of guessing.</p>
          </div>
          <p class="last-updated">Last updated: March 2026</p>
          <p class="eyebrow">Based on Search Console data</p>
          <h1>${topic.title}</h1>
          <p class="lead">
            This page exists because people already search for “${safeQuery}”. It is written for US-based business owners and the brokers, ISOs, vendors, and advisors who help them navigate working capital and commercial finance questions. The goal is to answer the query directly, then show practical options and when to bring in a referral partner.
          </p>
          <div class="hero-actions">
            <a href="/referral-agreement#review" class="btn btn-primary">Review the Referral Agreement</a>
            <a href="#toc" class="btn btn-secondary">Table of Contents</a>
          </div>
          <ul class="hero-points">
            <li>Explains what “${safeQuery}” usually refers to</li>
            <li>Shows when to keep a deal vs refer it</li>
            <li>Supports SEO, AEO, and GEO with structured content</li>
          </ul>
        </div>
        <aside class="hero-card">
          <h2>Key takeaways</h2>
          <p class="hero-card-intro">Use this page when:</p>
          <ul class="hero-card-list key-takeaways">
            <li>You see “${safeQuery}” in client conversations or search data</li>
            <li>A deal does not quite fit your core lender panel</li>
            <li>You want a second look option without becoming a full-time lender</li>
          </ul>
        </aside>
      </div>
    </section>

    <section id="toc" class="section alt">
      <div class="container">
        <div class="section-heading">
          <h2>Table of Contents</h2>
        </div>
        <nav class="list-card">
          <ul class="check-list">
            <li><a href="#overview">What people mean by “${safeQuery}”</a></li>
            <li><a href="#when-it-fits">When this topic matters most</a></li>
            <li><a href="#compare">How it compares with other options</a></li>
            <li><a href="#example">Practical example from the field</a></li>
            <li><a href="#actions">Action steps you can take this week</a></li>
            <li><a href="#geo">How this plays out in different markets</a></li>
            <li><a href="#faq">FAQ</a></li>
          </ul>
        </nav>
      </div>
    </section>

    <section id="overview" class="section">
      <div class="container">
        <div class="section-heading">
          <h2>What people mean by “${safeQuery}”</h2>
        </div>
        <div class="info-content">
          <p>Searches for “${safeQuery}” usually come from one of two places. Either a business owner is trying to understand a financing concept in plain English, or a broker, vendor, or advisor wants language they can use with clients. In both cases, the core need is clarity: what does this idea really mean, how does it work, and what are the trade-offs compared with more familiar products like bank loans and lines of credit.</p>
          <p>On this site, we treat search terms as signals. When a query shows up repeatedly in Google Search Console, it tells us that owners and advisors are already using that language. Instead of forcing them into jargon, we meet them where they are and connect the term to specific options in commercial finance, second look lenders, and referral relationships.</p>
        </div>
      </div>
    </section>

    <section id="when-it-fits" class="section alt">
      <div class="container">
        <div class="section-heading">
          <h2>When this topic matters most</h2>
        </div>
        <div class="info-content">
          <p>Topics like “${safeQuery}” surface most often when a straightforward path has already failed or feels unclear. A bank has declined, an in-house program cannot approve a buyer, or an advisor sees that a client&apos;s current lender is a poor fit. At that point, the question is not purely academic—it is connected to payroll, equipment purchases, or a time-sensitive opportunity.</p>
        </div>
        <ul class="check-list">
          <li><strong>After a bank or program decline.</strong> The client still needs a solution, but the first-look lender said no or set terms that do not work.</li>
          <li><strong>When deals fall between boxes.</strong> Credit, collateral, or industry is slightly outside standard guidelines, even though the business itself is viable.</li>
          <li><strong>When you lack time to build a full lender panel.</strong> Advisors and vendors want options for their clients without managing dozens of direct lender relationships.</li>
        </ul>
      </div>
    </section>

    <section id="compare" class="section">
      <div class="container">
        <div class="section-heading">
          <h2>How this compares with other options</h2>
        </div>
        <p class="section-desc">Most owners are not choosing between “${safeQuery}” and nothing. They are weighing several paths at once.</p>
        <table class="opt-table" aria-label="Comparison of financing paths">
          <thead>
            <tr>
              <th>Path</th>
              <th>Best for</th>
              <th>Key considerations</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Staying with current bank</td>
              <td>When pricing and structure already work</td>
              <td>Least friction, but limited if exposure caps or policy block the deal.</td>
            </tr>
            <tr>
              <td>Alternative or specialty lenders</td>
              <td>When a deal is strong but non-standard</td>
              <td>Broader credit boxes; structure and total cost vary by lender.</td>
            </tr>
            <tr>
              <td>Referral / second look networks</td>
              <td>Brokers, ISOs, vendors, and advisors with declined or overflow files</td>
              <td>Provide organized access to multiple lenders under one referral agreement.</td>
            </tr>
          </tbody>
        </table>
        <div class="info-content">
          <p>For deeper context, see our hub on <a href="/declined-business-loans">declined business loans</a> and working capital guides like <a href="/what-is-working-capital-financing">what is working capital financing</a> and <a href="/how-accounts-receivable-financing-works">how accounts receivable financing works</a>.</p>
        </div>
      </div>
    </section>

    <section id="example" class="section alt">
      <div class="container">
        <div class="section-heading">
          <h2>Practical example</h2>
        </div>
        <div class="info-content">
          <p>Imagine a regional business owner who types “${safeQuery}” into a search bar after hearing the term from their banker or accountant. They know something needs to change—cash is tight or a growth opportunity is at risk—but they are not sure which questions to ask. A broker or advisor who understands this topic can translate the jargon, outline two or three realistic options, and, when appropriate, route the file through a referral network that fits the client&apos;s industry and geography.</p>
          <p>The goal is not to promise approvals. It is to replace guesswork with a structured path: clarify the situation, choose the right type of financing conversation, and bring in a broader lender panel when the core relationship is not enough.</p>
        </div>
      </div>
    </section>

    <section id="actions" class="section">
      <div class="container">
        <div class="section-heading">
          <h2>Action steps you can take this week</h2>
        </div>
        <ul class="check-list">
          <li><strong>List recent deals connected to this topic.</strong> Note any files where “${safeQuery}” or similar language appeared.</li>
          <li><strong>Sort them into keep vs refer.</strong> Decide which should stay with your core lenders and which deserve a second look.</li>
          <li><strong>Review the referral agreement.</strong> Make sure protections, economics, and communication expectations are clear.</li>
          <li><strong>Create a simple internal rule.</strong> For example: “If we hear this term and a deal is declined, we always get a second opinion.”</li>
        </ul>
      </div>
    </section>

    <section id="geo" class="section alt">
      <div class="container">
        <div class="section-heading">
          <h2>How this plays out in different markets</h2>
        </div>
        <div class="info-content">
          <p>The query “${safeQuery}” may come from owners in large metros, regional hubs, or smaller cities. The fundamentals are the same: lenders segment by risk, ticket size, and industry, and each geography has its own mix of banks and specialty programs. What changes is which lenders are most active in your area and how they prefer to structure deals.</p>
          <p>Referral-based networks help smooth those differences. They work nationally while paying attention to where businesses operate, so an equipment deal in one state and a working capital facility in another can both find an appropriate home without you rebuilding a lender panel from scratch in each region.</p>
        </div>
      </div>
    </section>

    <section id="faq" class="section faq alt">
      <div class="container">
        <div class="section-heading">
          <p class="eyebrow">FAQ</p>
          <h2>Questions about searches like “${safeQuery}”</h2>
        </div>
        <div class="faq-grid faq-grid-eight">
          <article class="card"><h3>Is this topic only relevant for large companies?</h3><p>No. Many of the search terms we see in Google Search Console come from small and mid-sized businesses. The structures described on this site are used every day by owners who simply need a clear path through lender options.</p></article>
          <article class="card"><h3>Can I just apply to more lenders on my own?</h3><p>You can, but multiple blind applications can create noise without improving outcomes. Working with a broker, ISO, or advisor who understands how your file fits different programs is usually more effective than sending the same package everywhere.</p></article>
          <article class="card"><h3>How does this content help SEO, AEO, and GEO?</h3><p>We write pages like this directly from live search queries, use structured data for WebPage, Breadcrumb, and FAQ, and include examples that apply across US regions. That combination helps both traditional search results and answer-focused surfaces understand when this page should appear.</p></article>
          <article class="card"><h3>Where do I start if this sounds like my situation?</h3><p>Gather your recent financials and a brief summary of the opportunity, then talk with a financing advisor or broker who can review the file and, if appropriate, submit it through a referral network under a signed referral agreement.</p></article>
        </div>
      </div>
    </section>

    <section class="section cta-band">
      <div class="container cta-band-inner">
        <div>
          <p class="eyebrow">Declined or hard-to-place deals</p>
          <h2>Explore your options</h2>
          <p>Brokers, ISOs, vendors, and advisors can use this page alongside <a href="/declined-business-loans">declined business loans</a>, <a href="/send-declined-business-loans">send declined business loans</a>, and <a href="/referral-partner-earnings">referral partner earnings</a>. Review the <a href="/referral-agreement">referral agreement</a> before submitting files.</p>
        </div>
        <div class="cta-stack">
          <a href="/referral-agreement#review" class="btn btn-primary">Send a Deal</a>
          <a href="${siteCfg.contactUrl}" rel="noopener noreferrer" class="btn btn-secondary">Contact Us</a>
          <a href="/" class="btn btn-secondary">Referral Partners</a>
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
          <p>© 2026 ${siteCfg.footerBrand}.</p>
          <p class="footer-contact">Call <a href="tel:+19199072611">(919) 907-2611</a> or <a href="${siteCfg.contactUrl}" rel="noopener noreferrer">email us</a></p>
      </div>
      <div class="footer-links">
        <a href="/">Referral Partners</a>
        <a href="/declined-business-loans">Declined Loans Hub</a>
        <a href="/send-declined-business-loans">Send Declined Deals</a>
        <a href="/declined-deals">Declined Deals</a>
        <a href="/referral-agreement">Referral Agreement</a>
        <a href="/blog">Articles</a>
          <a href="${siteCfg.contactUrl}" rel="noopener noreferrer">Contact</a>
      </div>
    </div>
  </footer>

  <script src="script.js"></script>
</body>
</html>
`;
}

function createPagesFromTopics(topics) {
  let created = 0;
  for (const t of topics) {
    const target = path.join(root, `${t.slug}.html`);
    if (fs.existsSync(target)) continue;
    fs.writeFileSync(target, buildPage(t), 'utf8');
    created++;
  }
  if (created > 0) {
    console.log(`Created ${created} new HTML pages from GSC topics.`);
  } else {
    console.log('No new HTML pages created (all slugs already existed).');
  }
}

function main() {
  ensureGscDir();
  const zipArg = process.argv[2];

  // Workflow:
  // - If you pass a zip path as argv[2], use it.
  // - Otherwise pick the newest `gsc/*.zip` (no renaming required).
  let zipPath;
  if (zipArg) {
    zipPath = path.resolve(root, zipArg);
  } else {
    const zips = fs
      .readdirSync(gscDir)
      .filter((f) => f.toLowerCase().endsWith('.zip'))
      .map((f) => path.join(gscDir, f));

    if (!zips.length) {
      console.error(`No GSC zip found. Put a Queries.zip export into: ${gscDir}`);
      process.exit(1);
    }

    zips.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
    zipPath = zips[0];
    console.log(`Using newest GSC zip: ${path.basename(zipPath)}`);
  }

  const extractDir = unzipIfNeeded(zipPath);
  const queriesCsv = path.join(extractDir, 'Queries.csv');
  if (!fs.existsSync(queriesCsv)) {
    console.error(`Queries.csv not found in extracted GSC export at: ${queriesCsv}`);
    process.exit(1);
  }

  const rows = parseCsv(queriesCsv);
  if (!rows.length) {
    console.error('No rows found in Queries.csv');
    process.exit(1);
  }

  const topics = pickTopics(rows, 15);
  const outPath = path.join(gscDir, 'generated-topics.json');
  fs.writeFileSync(outPath, JSON.stringify({ generatedAt: new Date().toISOString(), topics }, null, 2), 'utf8');

  console.log(`Analyzed ${rows.length} queries from Queries.csv`);
  console.log(`Wrote ${topics.length} suggested topics to ${path.relative(root, outPath)}`);
  console.log('Each topic includes slug, title, query, impressions, and position.');
  if (topics.length) {
    createPagesFromTopics(topics);
    try {
      execSync('node scripts/generate-sitemap.js', { stdio: 'inherit', cwd: root });
    } catch (e) {
      console.error('Failed to regenerate sitemap.xml:', e.message);
    }
  }
}

main();

