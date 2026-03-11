# SEO, AEO & GEO Audit Report
**Date:** March 10, 2025  
**Site:** Axiant Partners Referral Landing

---

## 1. Sitemap & robots.txt

### Implemented
- **sitemap.xml** – Created with all 15 indexable pages
  - Homepage: priority 1.0, changefreq weekly
  - Primary CTA pages (send-declined, referral-agreement, ISO program): priority 0.9
  - Supporting pages: priority 0.8
  - Blog index: priority 0.8
  - Blog articles: priority 0.7
  - Redirect page (commercial-lending-iso-agreement) excluded from sitemap
- **robots.txt** – Created with `Allow: /` and Sitemap directive
- **Sitemap link** – Added to homepage `<head>` for discoverability

### Domain
- Base URL: `https://axiantpartners.com`
- Update `robots.txt` and `sitemap.xml` if the site is deployed to a different domain or subpath.

---

## 2. Cannibalization Fixes

### Issue
Several pages competed for the same terms: "Send Declined Business Loan Deals", "Second Look Lenders", "Have Deals You Can't Place?".

### Changes
| Page | Old Title | New Title |
|------|-----------|-----------|
| index.html | Send Declined Business Loan Deals \| Referral Partners \| Broader Credit Standards | **Commercial Finance Referral Partners \| Brokers, Vendors, Advisors \| Axiant Partners** |
| send-declined-business-loans.html | Send Declined Business Loans \| Second Look Lenders \| Hard-to-Place Deals | **Submit Declined Business Loans \| Deal Submission \| Axiant Partners** |
| where-brokers-send-declined-deals.html | Where Brokers Send Declined Deals \| Second Look Lenders \| Hard-to-Place Business Loans | **Where Do Brokers Send Declined Deals? \| Industry Guide \| Axiant Partners** |
| declined-deals.html | Send Declined Business Loan Deals \| Brokers, Lenders, MCA Shops | **Declined Deals for Brokers & MCA Shops \| Second Look Financing \| Axiant Partners** |

### Result
- **index.html** – Broad hub for referral partners
- **send-declined-business-loans.html** – Action-focused submission page
- **where-brokers-send-declined-deals.html** – Educational/informational
- **declined-deals.html** – Audience-specific (brokers, MCA shops)

---

## 3. Canonical Tags

- Canonical URLs added to all indexable pages
- Redirect page `commercial-lending-iso-agreement.html` uses canonical to `commercial-lending-iso-program.html#agreement` and `noindex, follow`

---

## 4. AEO & GEO Optimizations

### Structured Data
- **Organization** – Added to homepage for brand context
- **Article** – Added to all 5 blog posts (headline, author, publisher, dates)
- **BreadcrumbList** – Added to all blog articles (Home > Articles > [Article])
- **WebPage** – Already present on main pages
- **FAQPage** – Already present on index, send-declined, where-brokers, declined-deals, can-vendors

### Benefits for AI/Answer Engines
- Clear entity and hierarchy
- Article schema supports rich results and AI citations
- Breadcrumbs clarify site structure
- FAQ schema supports direct answers

---

## 5. Redirect Page

- `commercial-lending-iso-agreement.html` – `noindex, follow` so it is not indexed but link equity passes to the canonical target.

---

## 6. Checklist Summary

| Item | Status |
|------|--------|
| sitemap.xml created | Done |
| robots.txt with Sitemap directive | Done |
| Canonicals on all pages | Done |
| Cannibalization addressed | Done |
| Organization schema | Done |
| Article schema (blog) | Done |
| BreadcrumbList (blog) | Done |
| Redirect page noindex | Done |
| No duplicate titles | Done |

---

## 7. Recommendations

1. **Deployment** – Ensure `sitemap.xml` and `robots.txt` are served at the root (e.g. `https://axiantpartners.com/sitemap.xml`).
2. **lastmod** – Update `lastmod` in `sitemap.xml` when content changes.
3. **Google Search Console** – Submit sitemap after deployment.
4. **Bing Webmaster Tools** – Submit sitemap there as well.
