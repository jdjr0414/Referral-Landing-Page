/**
 * Unify navigation across all pages:
 * - Same nav items on every page (fixes tabs changing when clicking)
 * - Fewer, shorter labels
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

const navRoot = `      <nav>
        <a href="index.html">Home</a>
        <a href="declined-business-loans.html">Declined</a>
        <a href="equipment-financing.html">Equipment</a>
        <a href="referral-agreement.html">Referral</a>
        <a href="blog/index.html">Articles</a>
        <a href="https://axiantpartners.com/contact" rel="noopener noreferrer">Contact</a>
        <a href="referral-agreement.html#review" class="btn btn-cta-nav">Send a Deal</a>
      </nav>`;

const navBlog = `      <nav>
        <a href="../index.html">Home</a>
        <a href="../declined-business-loans.html">Declined</a>
        <a href="../equipment-financing.html">Equipment</a>
        <a href="../referral-agreement.html">Referral</a>
        <a href="index.html">Articles</a>
        <a href="https://axiantpartners.com/contact" rel="noopener noreferrer">Contact</a>
        <a href="../referral-agreement.html#review" class="btn btn-cta-nav">Send a Deal</a>
      </nav>`;

function replaceNav(content, isBlog) {
  const nav = isBlog ? navBlog : navRoot;
  // Match <nav> ... </nav> (flexible whitespace)
  const navRegex = /<nav>[\s\S]*?<\/nav>/;
  return content.replace(navRegex, nav.trim());
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const isBlog = filePath.includes(path.sep + 'blog' + path.sep);
  const newContent = replaceNav(content, isBlog);
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent);
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
