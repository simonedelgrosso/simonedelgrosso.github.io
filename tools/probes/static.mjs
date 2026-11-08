// Verification probe (committed suite, excluded from the Jekyll build): a tiny
// static file server, for serving a built _site copy. See AGENTS.md.
// Usage: node static.mjs <rootDir> <port>
import { createServer } from 'node:http';
import { readFile, stat, realpath } from 'node:fs/promises';
import { join, extname, resolve, sep } from 'node:path';

const root = resolve(process.argv[2] || '.');
const port = Number(process.argv[3]) || 4020;
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2', '.xml': 'application/xml', '.ico': 'image/x-icon',
  '.webp': 'image/webp', '.gif': 'image/gif',
};

createServer(async (req, res) => {
  try {
    const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let file = resolve(join(root, p));

    // Containment check: the decoded path can carry backslashes (`%5c`), which
    // `join()` resolves as separators on Windows and would otherwise escape the
    // root. Compare canonical paths so a symlinked root still works.
    const within = (target) => target === root || target.startsWith(root + sep);
    if (!within(file)) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('bad path');
      return;
    }

    let info = await stat(file).catch(() => null);
    if (info && info.isDirectory()) file = join(file, 'index.html');

    const real = await realpath(file).catch(() => null);
    if (!real || !within(real)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('not found');
      return;
    }

    const body = await readFile(real);
    res.writeHead(200, { 'Content-Type': TYPES[extname(real).toLowerCase()] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('not found');
  }
}).listen(port, '127.0.0.1', () => console.log('serving', root, 'on', port));
