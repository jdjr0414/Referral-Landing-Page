# Deployment: Cloudflare Workers

This site is **static HTML**—no Astro, no `src/pages`, no framework. All pages are `.html` files in the project root and `blog/`.

## Cloudflare Workers Setup

1. **Deploy command** (required): Use the full deploy script so `dist/` is built without `node_modules`:
   ```bash
   npm run deploy
   ```
   **In Cloudflare:** Set the deploy command to `npm run deploy` (not `npx wrangler deploy`).

2. **What the deploy script does**:
   - Runs `generate-sitemap.js` and `generate-redirects.js`
   - Copies deployable files to `dist/` (excludes `node_modules`, `scripts`, `.git`)
   - Runs `wrangler deploy` with `assets.directory: "./dist"`

## URL Routing

- **Clean URLs** (e.g. `/500-credit-score-business-loans`) are served via `_redirects` (200 rewrites to `.html`).
- **Sitemap** uses clean URLs (no `.html`).
- Both `/page` and `/page.html` work; `/page` is canonical.

## Verify After Deploy

- https://commercialfinancereferrals.com/ → 200
- https://commercialfinancereferrals.com/500-credit-score-business-loans → 200
- https://commercialfinancereferrals.com/sitemap.xml → 200
