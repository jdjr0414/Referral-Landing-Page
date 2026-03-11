#!/usr/bin/env node
/**
 * SEO cleanup: canonical, og:url, schema, internal links to clean URLs.
 * Run: node scripts/seo-cleanup.js
 */
const fs = require('fs');
const path = require('path');

const BASE = 'https://commercialfinancereferrals.com';
const ROOT = path.join(__dirname, '..');

function walk(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory() && !['node_modules', 'scripts', 'templates', 'assets', '.git'].includes(e.name)) {
      walk(full, files);
    } else if (e.isFile() && e.name.endsWith('.html')) {
      const rel = path.relative(ROOT, full).replace(/\\/g, '/');
      files.push(rel);
    }
  }
  return files;
}

function fileToCleanUrl(file) {
  if (file === 'index.html') return BASE + '/';
  const clean = file.replace(/\.html$/, '').replace(/\/index$/, '');
  return clean ? `${BASE}/${clean}` : BASE + '/';
}

const files = walk(ROOT);
const cleanUrls = new Set(files.map(f => fileToCleanUrl(f)));

// Map .html URLs to clean URLs for link replacement
const htmlToClean = {};
files.forEach(f => {
  const clean = fileToCleanUrl(f);
  const htmlUrl = f === 'index.html' ? `${BASE}/index.html` : `${BASE}/${f}`;
  htmlToClean[htmlUrl] = clean;
});

// Relative href patterns: "page.html", "blog/index.html", "../page.html"
function replaceInternalLinks(content, fileDir) {
  return content.replace(
    /href="([^"#]+)(#[^"]*)?"/g,
    (match, pathPart, hash = '') => {
      const href = pathPart + hash;
      // Skip external, mailto, tel, data
      if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) {
        return match;
      }
      // Resolve relative path to root-relative
      let resolved = pathPart;
      if (fileDir) {
        resolved = path.join(fileDir, pathPart).replace(/\\/g, '/');
        if (resolved.startsWith('/')) resolved = resolved.slice(1);
      }
      // Normalize: remove ./ and ../
      resolved = resolved.replace(/^\.\//, '').replace(/\/+/g, '/');
      while (resolved.includes('../')) {
        resolved = resolved.replace(/[^/]+\/\.\.\//, '');
      }
      if (resolved === 'index.html' || resolved === '') return `href="/${hash ? '#' + hash.slice(1) : ''}"`;
      if (resolved === 'blog/index.html') return `href="/blog${hash}"`;
      if (resolved.endsWith('.html')) {
        const clean = resolved.replace(/\.html$/, '').replace(/\/index$/, '');
        return `href="/${clean}${hash}"`;
      }
      return match;
    }
  );
}

let changed = 0;
files.forEach(file => {
  const fullPath = path.join(ROOT, file);
  const original = fs.readFileSync(fullPath, 'utf8');
  let content = original;
  const cleanUrl = fileToCleanUrl(file);

  // 1. Canonical: commercialfinancereferrals.com/page.html -> clean
  content = content.replace(
    /<link rel="canonical" href="https:\/\/commercialfinancereferrals\.com\/([^"]+)" \/>/g,
    (m, p) => `<link rel="canonical" href="${cleanUrl}" />`
  );

  // 2. og:url
  content = content.replace(
    /<meta property="og:url" content="https:\/\/commercialfinancereferrals\.com\/([^"]+)" \/>/g,
    (m, p) => `<meta property="og:url" content="${cleanUrl}" />`
  );

  // 3. Schema "url" in JSON-LD (various formats)
  content = content.replace(
    /"url"\s*:\s*"https:\/\/commercialfinancereferrals\.com\/[^"]+\.html"/g,
    () => `"url":"${cleanUrl}"`
  );
  content = content.replace(
    /"url"\s*:\s*"https:\/\/commercialfinancereferrals\.com\/"/g,
    () => `"url":"${BASE}/"`
  );

  // 4. BreadcrumbList "item" URLs
  content = content.replace(
    /"item"\s*:\s*"https:\/\/commercialfinancereferrals\.com\/([^"]+\.html)"/g,
    (m, p) => {
      const clean = p.replace(/\.html$/, '').replace(/\/index$/, '');
      const url = clean ? `${BASE}/${clean}` : BASE + '/';
      return `"item":"${url}"`;
    }
  );

  // 4b. Article mainEntityOfPage @id
  content = content.replace(
    /"@id"\s*:\s*"https:\/\/commercialfinancereferrals\.com\/([^"]+\.html)"/g,
    (m, p) => {
      const clean = p.replace(/\.html$/, '').replace(/\/index$/, '');
      const url = clean ? `${BASE}/${clean}` : BASE + '/';
      return `"@id":"${url}"`;
    }
  );

  // 5. Internal links: href="page.html" -> href="/page" (hash versions first)
  content = content.replace(/href="index\.html#([^"]+)"/g, 'href="/#$1"');
  content = content.replace(/href="([a-zA-Z0-9-]+)\.html#([^"]+)"/g, (m, p, h) => `href="/${p}#${h}"`);
  content = content.replace(/href="blog\/index\.html#([^"]+)"/g, 'href="/blog#$1"');
  content = content.replace(/href="blog\/([a-zA-Z0-9-]+)\.html#([^"]+)"/g, (m, p, h) => `href="/blog/${p}#${h}"`);
  content = content.replace(/href="\.\.\/([a-zA-Z0-9-]+)\.html#([^"]+)"/g, (m, p, h) => `href="/${p}#${h}"`);
  content = content.replace(/href="index\.html"/g, 'href="/"');
  content = content.replace(/href="blog\/index\.html"/g, 'href="/blog"');
  content = content.replace(/href="\.\.\/index\.html"/g, 'href="/"');
  content = content.replace(/href="([a-zA-Z0-9-]+)\.html"/g, (m, p) => `href="/${p}"`);
  content = content.replace(/href="blog\/([a-zA-Z0-9-]+)\.html"/g, (m, p) => `href="/blog/${p}"`);
  content = content.replace(/href="\.\.\/([a-zA-Z0-9-]+)\.html"/g, (m, p) => `href="/${p}"`);

  if (content !== original) {
    fs.writeFileSync(fullPath, content, 'utf8');
    changed++;
  }
});

console.log(`SEO cleanup: updated ${changed} files`);
