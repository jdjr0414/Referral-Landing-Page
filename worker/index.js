// Canonicalization + redirect Worker for commercialfinancereferrals.com
//
// Why this exists: the site deploys as Cloudflare Workers Static Assets, where a
// `_redirects` file's custom rules do NOT fire when a matching .html asset exists.
// That silently broke every consolidation 301 and left http/www variants live.
// This Worker runs BEFORE asset serving (assets.run_worker_first = true) and:
//   1. forces the canonical host (https + non-www)
//   2. strips the leaked /dist/ build-folder prefix
//   3. applies exact-path 301 consolidation redirects (REDIRECTS map)
//   4. otherwise serves the static asset unchanged (env.ASSETS handles html_handling)

import { CANONICAL_HOST, REDIRECTS } from "./redirects.js";

function redirect(location, status = 301) {
  return new Response(null, { status, headers: { Location: location, "Cache-Control": "no-cache" } });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let changed = false;

    // 1. Canonical host: force https + non-www (preserves path + query).
    if (url.protocol !== "https:") { url.protocol = "https:"; changed = true; }
    if (url.hostname !== CANONICAL_HOST) { url.hostname = CANONICAL_HOST; changed = true; }

    // Lookup key: drop a single trailing slash, lower-case. Used ONLY for matching so we
    // never rewrite the case of asset paths that aren't redirected (e.g. the .pdf).
    const raw = url.pathname;
    const key = (raw.length > 1 && raw.endsWith("/") ? raw.slice(0, -1) : raw).toLowerCase();

    let target = null;
    if (key === "/dist" || key.startsWith("/dist/")) {
      // 2. Leaked build folder: /dist/foo -> /foo, then fold through the map if needed.
      target = key.slice("/dist".length) || "/";
      if (REDIRECTS[target]) target = REDIRECTS[target];
    } else if (REDIRECTS[key]) {
      // 3. Exact-path consolidation 301.
      target = REDIRECTS[key];
    }

    if (target && target !== raw) {
      url.pathname = target;
      url.search = ""; // consolidation/dist targets are canonical pages; drop stale params
      changed = true;
    }

    if (changed) return redirect(url.toString());

    // 4. Fall through to the static asset (html_handling does .html -> clean URL).
    return env.ASSETS.fetch(request);
  },
};
