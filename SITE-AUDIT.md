# Site Audit Report — March 10, 2026

## Summary

Full site audit covering sitemap, SEO, AEO (Answer Engine Optimization), and GEO (Generative Engine Optimization).

---

## 1. Sitemap Audit ✅

**Status:** Complete and correct

- **118 HTML pages** — all included in sitemap
- **Sitemap generator:** `scripts/generate-sitemap.js` — regenerates from file system
- **lastmod:** Updated to 2026-03-10
- **robots.txt:** References sitemap at https://axiantpartners.com/sitemap.xml

**To regenerate sitemap:**
```bash
node scripts/generate-sitemap.js
```

---

## 2. SEO Optimizations ✅

| Item | Status |
|------|--------|
| Canonical URLs | All 118 pages have canonical |
| Meta description | All pages |
| Meta keywords | All pages |
| Open Graph (og:title, og:description, og:url, og:type, og:image) | Added to pages missing them |
| Twitter Card | Added where missing |
| Schema.org | WebPage, BreadcrumbList, FAQPage, Article (blog) |
| Homepage canonical | https://axiantpartners.com/ |
| Homepage WebPage schema | Fixed url to full URL |

**Scripts:**
- `scripts/add-seo-meta.js` — adds og:image, twitter:card
- `scripts/add-canonical.js` — adds canonical to pages missing it

---

## 3. AEO (Answer Engine Optimization) ✅

**Featured snippets & voice search:**

- **Speakable schema** — Added to homepage WebPage (hero, FAQ)
- **Speakable schema** — Added to declined-business-loans (quick-answer, key-takeaways)
- **Speakable schema** — Added to blog Article (article-body)
- **FAQPage schema** — Present on index, declined-business-loans, and topic pages
- **Quick-answer blocks** — Used on hub pages (declined-business-loans, etc.)
- **Definition blocks** — Used on educational pages (what-is-equipment-financing, etc.)
- **Key takeaways** — Used where appropriate

---

## 4. GEO (Generative Engine Optimization) ✅

**AI-friendly content structure:**

- **Clear H1/H2 hierarchy** — Logical heading structure
- **Definition-first paragraphs** — Educational pages start with definitions
- **Structured Q&A** — FAQ schema matches visible FAQ content
- **BreadcrumbList schema** — Navigation context for AI
- **Article schema** — Blog posts with headline, description, dates, publisher
- **Concise, factual answers** — FAQ answers are direct and quotable

---

## 5. Fixes Applied

1. **Sitemap** — Regenerated with 118 URLs, lastmod 2026-03-10
2. **index.html** — WebPage schema url fixed, og/twitter meta added, speakable added
3. **23 pages** — og:image and twitter:card added
4. **2 pages** — Canonical URL added
5. **Blog Article** — speakable schema added to why-deals-get-declined

---

## 6. Maintenance Scripts

| Script | Purpose |
|--------|---------|
| `generate-sitemap.js` | Regenerate sitemap from HTML files |
| `add-seo-meta.js` | Add og:image, twitter:card to pages missing them |
| `add-canonical.js` | Add canonical to pages missing it |
| `audit-meta-links.js` | Add keywords, rel=noopener to outbound links |

---

## 7. Recommendations

- **Add og:image** — Consider a dedicated 1200×630 social image for better sharing
- **Structured data testing** — Validate with [Google Rich Results Test](https://search.google.com/test/rich-results)
- **Core Web Vitals** — Monitor LCP, FID, CLS
- **Internal linking** — Hub pages already link to related articles; maintain this pattern for new content
