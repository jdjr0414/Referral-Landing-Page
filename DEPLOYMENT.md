# Deployment: Cloudflare Pages

This site is **static HTML**—no Astro, no `src/pages`, no framework. All pages are `.html` files in the project root and `blog/`.

## Cloudflare Pages Setup

1. **Build command** (optional): Run generators before deploy
   ```bash
   node scripts/generate-sitemap.js && node scripts/generate-redirects.js
   ```

2. **Build output directory**: `.` (project root)
   - Do **not** use `dist`—there is no build step.
   - All HTML files, `_redirects`, `sitemap.xml`, and `robots.txt` live in the root.

3. **Root directory**: `/` (project root)

## URL Routing

- **Clean URLs** (e.g. `/500-credit-score-business-loans`) are served via `_redirects` (200 rewrites to `.html`).
- **Sitemap** uses clean URLs (no `.html`).
- Both `/page` and `/page.html` work; `/page` is canonical.

## Verify After Deploy

- https://commercialfinancereferrals.com/ → 200
- https://commercialfinancereferrals.com/500-credit-score-business-loans → 200
- https://commercialfinancereferrals.com/sitemap.xml → 200
