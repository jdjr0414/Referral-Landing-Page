/**
 * Add prominent referral CTA to all pages:
 * 1. Change nav "Send a Deal" from btn-sm to btn-cta-nav
 * 2. Add footer-cta band before footer-row
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const footerCtaRoot = `    <div class="footer-cta">
      <div class="container">
        <a href="referral-agreement.html#review" class="btn btn-primary">Send a Deal</a>
        <p>Ready to submit? Review the agreement and email us.</p>
      </div>
    </div>
`;
const footerCtaBlog = `    <div class="footer-cta">
      <div class="container">
        <a href="../referral-agreement.html#review" class="btn btn-primary">Send a Deal</a>
        <p>Ready to submit? Review the agreement and email us.</p>
      </div>
    </div>
`;

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // 1. Nav button: btn-sm -> btn-cta-nav for Send a Deal
  if (content.includes('class="btn btn-sm">Send a Deal</a>')) {
    content = content.replace(/class="btn btn-sm">Send a Deal<\/a>/g, 'class="btn btn-cta-nav">Send a Deal</a>');
    changed = true;
  }

  // 2. Add footer-cta if not present
  const isBlog = filePath.includes(path.sep + 'blog' + path.sep);
  const footerCta = isBlog ? footerCtaBlog : footerCtaRoot;

  if (!content.includes('class="footer-cta"')) {
    // Match: <footer class="site-footer">\n    <div class="container footer-row">
    const footerPattern = /(<footer class="site-footer">)\s*\n(\s*)(<div class="container footer-row">)/;
    if (footerPattern.test(content)) {
      content = content.replace(footerPattern, `$1\n$2${footerCta}$2$3`);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log('Updated:', path.relative(rootDir, filePath));
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules' && file !== 'assets') {
      walkDir(fullPath);
    } else if (file.endsWith('.html')) {
      processFile(fullPath);
    }
  }
}

walkDir(rootDir);
console.log('Done.');
