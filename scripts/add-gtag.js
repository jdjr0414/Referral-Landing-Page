const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

const GA_SNIPPET = `  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-H53CPWQ9TC"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'G-H53CPWQ9TC');
  </script>
`;

function shouldProcess(filePath) {
  return filePath.endsWith('.html');
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, files);
    } else if (shouldProcess(fullPath)) {
      files.push(fullPath);
    }
  }
  return files;
}

const files = walk(rootDir);

let updated = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Skip if tag already present
  if (content.includes('G-H53CPWQ9TC') || content.includes('gtag(')) {
    continue;
  }

  const headIndex = content.indexOf('<head>');
  if (headIndex === -1) continue;

  const insertPos = headIndex + '<head>'.length;
  const before = content.slice(0, insertPos);
  const after = content.slice(insertPos);
  const newContent = before + '\n' + GA_SNIPPET + after;

  fs.writeFileSync(file, newContent, 'utf8');
  updated++;
}

console.log(`Google tag injected into ${updated} HTML files.`);

