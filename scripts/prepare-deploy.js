#!/usr/bin/env node
/**
 * Copies deployable files to dist/ for Cloudflare Workers.
 * Excludes node_modules, scripts, .git, etc.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

const EXCLUDE = new Set([
  'node_modules', '.git', 'scripts', 'templates', 'dist',
  '.assetsignore', '.gitignore', 'package.json', 'package-lock.json',
  'DEPLOY-VERIFY.md', 'PRODUCTION-CLEANUP-REPORT.md', 'SEO-CRAWLABILITY-REPORT.md',
  'CRAWLABILITY-VERIFICATION.md', 'CANNIBALIZATION-AUDIT.md', 'DEPLOYMENT.md',
]);

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const name of fs.readdirSync(src)) {
    if (EXCLUDE.has(name)) continue;
    const srcPath = path.join(src, name);
    const destPath = path.join(dest, name);
    const stat = fs.statSync(srcPath);
    if (stat.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

if (fs.existsSync(DIST)) fs.rmSync(DIST, { recursive: true });
copyDir(ROOT, DIST);
console.log('Prepared dist/ for deployment');
