#!/usr/bin/env node
/**
 * Verifies production deployment: clean URLs, redirects, sitemap, robots.
 * Run: node scripts/verify-production.js
 */
const https = require('https');

const BASE = 'https://commercialfinancereferrals.com';

function fetch(url, followRedirects = true) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, { method: 'GET' }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (followRedirects && [301, 302, 307, 308].includes(res.statusCode)) {
          const loc = res.headers.location;
          if (loc) return fetch(loc.startsWith('http') ? loc : new URL(loc, url).href).then(resolve).catch(reject);
        }
        resolve({ status: res.statusCode, data, headers: res.headers });
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  console.log('Production verification for', BASE);
  console.log('');

  const issues = [];

  // 1. Check clean URL pages for .html in internal links
  const pages = ['/', '/declined-business-loans', '/equipment-financing', '/referral-agreement'];
  for (const path of pages) {
    const url = BASE + path;
    const { status, data } = await fetch(url);
    if (status !== 200) issues.push(`${path}: HTTP ${status}`);
    else if (data.includes('.html"') || data.includes('.html#')) {
      issues.push(`${path}: Still contains .html in links (stale cache)`);
    } else {
      console.log(`✓ ${path}: 200, clean URLs`);
    }
  }

  // 2. Check .html redirects
  const redirects = [
    ['/declined-business-loans.html', '/declined-business-loans'],
    ['/equipment-financing.html', '/equipment-financing'],
    ['/referral-agreement.html', '/referral-agreement'],
  ];
  for (const [from, to] of redirects) {
    const url = BASE + from;
    const req = await new Promise((resolve) => {
      https.request(url, { method: 'GET' }, (res) => {
        res.resume();
        resolve({ status: res.statusCode, location: res.headers.location });
      }).on('error', () => resolve({ status: 0, location: null })).end();
    });
    const target = BASE + to;
    if ([301, 302, 307, 308].includes(req.status) && req.location === target) {
      console.log(`✓ ${from} → ${req.status} ${to}`);
    } else {
      issues.push(`${from}: expected 301/307 to ${to}, got ${req.status} ${req.location || ''}`);
    }
  }

  // 3. robots.txt
  const robots = await fetch(BASE + '/robots.txt');
  if (robots.status !== 200) issues.push(`robots.txt: HTTP ${robots.status}`);
  else console.log('✓ robots.txt: 200');

  // 4. sitemap
  const sitemap = await fetch(BASE + '/sitemap.xml');
  if (sitemap.status !== 200) issues.push(`sitemap.xml: HTTP ${sitemap.status} (deploy or cache issue)`);
  else if (sitemap.data.includes('.html</loc>') || /<loc>[^<]*\.html<\/loc>/.test(sitemap.data)) {
    issues.push('sitemap.xml: contains .html URLs (stale)');
  } else console.log('✓ sitemap.xml: 200, clean URLs');

  // 5. Canonical check on homepage
  const home = await fetch(BASE + '/');
  if (home.data.includes('canonical" href="https://commercialfinancereferrals.com/index.html"')) {
    issues.push('Homepage canonical: still points to index.html');
  } else if (home.data.includes('canonical" href="https://commercialfinancereferrals.com/"')) {
    console.log('✓ Homepage canonical: clean URL');
  }

  console.log('');
  if (issues.length) {
    console.log('Issues found:');
    issues.forEach((i) => console.log('  -', i));
    console.log('');
    console.log('→ Trigger redeploy and purge cache, then run again.');
    process.exit(1);
  } else {
    console.log('All checks passed. Production matches repo.');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
