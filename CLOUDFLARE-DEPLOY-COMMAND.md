# Cloudflare Deploy Command

## Required change

The deploy command must be **`npm run deploy`** (not `npx wrangler deploy`).

## How to change it

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages**
2. Select your project (**referral-landing-page**)
3. Go to **Settings** → **Build**
4. Find **Deploy command**
5. Change from `npx wrangler deploy` to:
   ```
   npm run deploy
   ```
6. Save and trigger a new deployment

## Why

`npm run deploy` runs:
1. `generate-sitemap.js` and `generate-redirects.js`
2. `prepare-deploy.js` — copies files to `dist/` (excludes `node_modules`)
3. `wrangler deploy` — uploads only `dist/`, avoiding the 114 MiB `workerd` binary
