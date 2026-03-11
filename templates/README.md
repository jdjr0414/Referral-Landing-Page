# Programmatic SEO Templates

This folder contains configuration and templates for generating SEO content pages at scale.

## Template Structure (Required Sections)

Every generated page must include:

1. **Introduction** – Unique intro paragraph targeting the specific search intent
2. **Industry-specific financing challenges** – Challenges unique to the industry
3. **Common financing structures** – Bullet list of structures (equipment, working capital, etc.)
4. **Qualification considerations** – Credit, revenue, collateral, time in business
5. **Example financing scenarios** – 3+ practical examples
6. **How Axiant Partners may review opportunities** – 5-step process
7. **FAQ** – 5–7 unique questions with FAQ schema
8. **Call to action** – CTA band with referral agreement links

## Matrix Types

### 1. Industry × Financing Type
- **Slug pattern:** `{financing-type}-for-{industry}-companies`
- **Examples:** equipment-financing-for-trucking-companies, working-capital-for-restaurants
- **Config:** `programmatic-seo-config.json` → `matrix1_industryFinancing`

### 2. Credit Score Scenarios
- **Slug pattern:** `{credit-score}-credit-score-business-loans`
- **Examples:** 500-credit-score-business-loans, 550-credit-score-business-loans
- **Config:** `programmatic-seo-config.json` → `matrix2_creditScenarios`

### 3. Loan Decline Scenarios
- **Slug pattern:** `{industry}-loan-declined-now-what` or `business-loan-declined-now-what`
- **Examples:** restaurant-loan-declined-now-what, trucking-loan-declined-now-what
- **Config:** `programmatic-seo-config.json` → `matrix3_loanDecline`

## Quality Requirements

- **Word count:** Minimum 1,200 words per page
- **Unique content:** No repeated paragraphs across pages
- **Internal links:** To index, referral-agreement, send-declined-business-loans, related pages
- **SEO:** Title, meta description, H1, H2 sections, keywords, Open Graph
- **AEO/GEO:** WebPage schema, FAQPage schema, BreadcrumbList schema
- **No approval promises:** Use "may qualify," "options vary by lender," "evaluated on its merits"

## Generator Script

```bash
node scripts/generate-programmatic-pages.js
```

The generator reads `programmatic-seo-config.json` and can produce page variations. For full content (1200+ words, unique intros, industry-specific sections), use the example pages as the source of truth and extend the generator to pull from content modules.

## Example Pages (Reference)

- `equipment-financing-for-trucking-companies.html` – Industry × financing
- `working-capital-for-trucking-companies.html` – Industry × financing
- `500-credit-score-business-loans.html` – Credit scenario
- `business-loan-declined-now-what.html` – General decline
- `restaurant-loan-declined-now-what.html` – Industry-specific decline
