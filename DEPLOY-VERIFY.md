# Deployment Verification & Cache Cleanup

Production is still serving cached HTML with old `.html` links. Follow these steps to force a fresh deployment and clear the cache.

---

## 1. Force a Fresh Cloudflare Pages Deployment

### Option A: Cloudflare Dashboard (recommended)

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Go to **Workers & Pages** → select **commercialfinancereferrals.com** (or your Pages project)
3. Open the **Deployments** tab
4. Find the latest deployment and confirm it shows commit **6a2e59f** or newer
5. If the latest deployment is older:
   - Go to **Settings** → **Builds** → **Build configurations**
   - Click **Retry deployment** on the most recent build, OR
   - Push an empty commit to trigger a new build:
     ```bash
     git commit --allow-empty -m "Trigger redeploy"
     git push
     ```

### Option B: Deploy Hook (if configured)

If you have a Deploy Hook URL (Settings → Builds → Deploy hooks):

```bash
curl -X POST "YOUR_DEPLOY_HOOK_URL"
```

### Option C: Wrangler CLI (direct upload)

If using direct upload instead of Git:

```bash
npm run build
npx wrangler pages deploy . --project-name=YOUR_PROJECT_NAME
```

---

## 2. Clear Cloudflare Cache

### Option A: Dashboard

1. Go to **Caching** → **Configuration**
2. Click **Purge Everything**
3. Confirm

### Option B: API (requires Zone ID and API Token)

```bash
# Set these first:
# CLOUDFLARE_ZONE_ID - from domain Overview page
# CLOUDFLARE_API_TOKEN - with Zone.Cache Purge permission

curl -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/purge_cache" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
```

### Option C: Purge specific URLs only

```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/purge_cache" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{
    "files": [
      "https://commercialfinancereferrals.com/",
      "https://commercialfinancereferrals.com/declined-business-loans",
      "https://commercialfinancereferrals.com/equipment-financing",
      "https://commercialfinancereferrals.com/referral-agreement",
      "https://commercialfinancereferrals.com/index.html",
      "https://commercialfinancereferrals.com/sitemap.xml"
    ]
  }'
```

---

## 3. Verify Production After Deploy + Purge

Run the verification script:

```bash
node scripts/verify-production.js
```

Or manually check:

| Check | URL | Expected |
|-------|-----|----------|
| Homepage | https://commercialfinancereferrals.com/ | Internal links use `/referral-agreement` not `.html` |
| Declined | https://commercialfinancereferrals.com/declined-business-loans | Clean URLs in links |
| Equipment | https://commercialfinancereferrals.com/equipment-financing | Clean URLs |
| Referral | https://commercialfinancereferrals.com/referral-agreement | Clean URLs |
| 301 redirect | https://commercialfinancereferrals.com/declined-business-loans.html | 301 → /declined-business-loans |
| robots.txt | https://commercialfinancereferrals.com/robots.txt | 200 |
| sitemap | https://commercialfinancereferrals.com/sitemap.xml | 200, clean URLs only |

---

## 4. Current Status (last verification)

| Item | Status |
|------|--------|
| Production HTML | Still has `.html` links (stale cache) |
| .html redirects | 307 to clean URLs (working; 301 preferred) |
| sitemap.xml | 500 or cached with .html (deploy issue) |
| robots.txt | 200 ✓ |
| Homepage canonical | Clean URL ✓ |
| Repo | Correct – all clean URLs in commit 6a2e59f |

**Next step:** Trigger redeploy + purge cache, then run `node scripts/verify-production.js`.
