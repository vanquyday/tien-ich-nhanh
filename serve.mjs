// Máy chủ thử nghiệm trên máy bạn: node serve.mjs  →  mở http://localhost:8080
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const DIST = path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), 'dist');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.json': 'application/json' };
const PORT = process.env.PORT || 8080;
http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let f = path.join(DIST, p);
  if (!f.startsWith(DIST)) { res.writeHead(403).end(); return; }
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  let code = 200;
  if (!fs.existsSync(f)) { f = path.join(DIST, '404.html'); code = 404; }
  res.writeHead(code, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
}).listen(PORT, () => console.log(`Đang chạy: http://localhost:${PORT}  (Ctrl + C để dừng)`));
