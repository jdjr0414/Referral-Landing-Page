#!/usr/bin/env node
/**
 * Generates sitemap.xml from all HTML files in the project.
 * Run: node scripts/generate-sitemap.js
 */
const fs = require('fs');
const path = require('path');

const BASE = 'https://commercialfinancereferrals.com';
const OUTPUT = path.join(__dirname, '..', 'sitemap.xml');

const priorityMap = {
  'index.html': 1.0,
  'declined-business-loans.html': 0.9,
  'equipment-financing.html': 0.9,
  'send-declined-business-loans.html': 0.9,
  'referral-agreement.html': 0.9,
  'construction-business-loans.html': 0.9,
  'commercial-lending-iso-program.html': 0.9,
  'blog/index.html': 0.8,
  'glossary.html': 0.8,
  'referral-form.html': 0.7,
};

const changefreqMap = {
  'index.html': 'weekly',
  'blog/index.html': 'weekly',
};

function walk(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory() && !['node_modules', 'scripts', 'templates', 'assets'].includes(e.name)) {
      walk(full, files);
    } else if (e.isFile() && e.name.endsWith('.html')) {
      const rel = path.relative(path.join(__dirname, '..'), full).replace(/\\/g, '/');
      files.push(rel);
    }
  }
  return files;
}

function getPriority(file) {
  return priorityMap[file] ?? 0.8;
}

function getChangefreq(file) {
  return changefreqMap[file] ?? 'monthly';
}

const files = walk(path.join(__dirname, '..'));
const lastmod = '2026-03-10';

const urls = files
  .sort((a, b) => {
    if (a === 'index.html') return -1;
    if (b === 'index.html') return 1;
    if (a.startsWith('blog/') && !b.startsWith('blog/')) return 1;
    if (!a.startsWith('blog/') && b.startsWith('blog/')) return -1;
    return a.localeCompare(b);
  })
  .map((f) => {
    // Clean URLs (no .html): index.html -> /, blog/index.html -> /blog, page.html -> /page
    const cleanPath = f === 'index.html' ? '' : f.replace(/\.html$/, '').replace(/\/index$/, '');
    const loc = cleanPath ? `${BASE}/${cleanPath}` : BASE + '/';
    const priority = getPriority(f);
    const changefreq = getChangefreq(f);
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  });

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;

fs.writeFileSync(OUTPUT, xml, 'utf8');
console.log(`Generated sitemap.xml with ${files.length} URLs`);
