# Cloudflare Deploy Command

**Update your Cloudflare Workers build/deploy command to:**

```
npm run deploy
```

**Do not use:** `npx wrangler deploy`

The `npm run deploy` script builds `dist/` (without `node_modules`) before deploying, avoiding the "Asset too large" error from `node_modules/workerd/bin/workerd` (114 MiB > 25 MiB limit).
