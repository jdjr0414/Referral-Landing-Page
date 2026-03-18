const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const port = Number(process.argv[2]) || 3000;

const mimeByExt = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

function safeJoin(baseDir, requestPath) {
  // Prevent path traversal by resolving to a normalized path inside root.
  const decoded = decodeURIComponent(requestPath.split('?')[0]).replace(/\0/g, '');
  const trimmed = decoded.startsWith('/') ? decoded.slice(1) : decoded;
  const abs = path.resolve(baseDir, trimmed);
  const baseNorm = baseDir.toLowerCase();
  const absNorm = abs.toLowerCase();
  if (!absNorm.startsWith(baseNorm)) return null;
  return abs;
}

function resolveFile(absPath) {
  if (fs.existsSync(absPath) && fs.statSync(absPath).isFile()) return absPath;

  // Clean URLs like "/referral-agreement" should map to "/referral-agreement.html"
  if (!path.extname(absPath)) {
    const withHtml = `${absPath}.html`;
    if (fs.existsSync(withHtml) && fs.statSync(withHtml).isFile()) return withHtml;
  }

  // Directory index fallback
  if (fs.existsSync(absPath) && fs.statSync(absPath).isDirectory()) {
    const indexHtml = path.join(absPath, 'index.html');
    if (fs.existsSync(indexHtml) && fs.statSync(indexHtml).isFile()) return indexHtml;
  }

  return null;
}

const server = http.createServer((req, res) => {
  try {
    const urlPath = req.url || '/';
    const requestPath = urlPath === '/' ? '/index.html' : urlPath;
    const abs = safeJoin(root, requestPath);
    if (!abs) {
      res.statusCode = 403;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('Forbidden');
      return;
    }

    const file = resolveFile(abs);
    if (!file) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end(`File not found: ${requestPath}`);
      return;
    }

    const ext = path.extname(file).toLowerCase();
    res.statusCode = 200;
    res.setHeader('Content-Type', mimeByExt[ext] || 'application/octet-stream');
    fs.createReadStream(file).pipe(res);
  } catch (e) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end(`Server error: ${e.message}`);
  }
});

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Local preview server running at http://localhost:${port}/`);
  console.log('Clean URLs (e.g. /referral-agreement) map to .html automatically.');
});

