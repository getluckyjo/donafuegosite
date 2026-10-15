'use strict';
/* Local harness: serves site/ with Vercel's cleanUrls behaviour and runs the
   api/ handlers. Without env vars the forms answer in stub mode and the fan
   wall is empty. FANS=demo fills the wall with a few shoot frames standing in
   for fans, so the layout can be seen. Run: node tools/dev-server.js */
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'site');
const PORT = process.env.PORT || 4321;
const subscribe = require('../api/subscribe.js');
const fans = require('../api/fans.js');
const fanImage = require('../api/fan-image.js');
const DEMO_FANS = ['sideways-two', 'upside-grin', 'knee-leak', 'under-trees', 'sea-pink-leak'].map((id, i) => ({
  id, credit: ['@sunny.seapoint', '@braai.boss', '@capetownkat', '@stoep.life', '@atlantic.side'][i],
  src: '/assets/shoot/' + id + '-640.webp',
}));

// The slice of Vercel's req/res that the handlers use.
function adapt(req, res, body, query) {
  return [{ method: req.method, body, query, headers: req.headers }, {
    setHeader: (k, v) => res.setHeader(k, v),
    status(c) { res.statusCode = c; return this; },
    json(o) { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(o)); return this; },
    send(s) { res.end(s); return this; },
  }];
}

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.woff2': 'font/woff2',
  '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml',
  '.webmanifest': 'application/manifest+json', '.ico': 'image/x-icon',
};

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  let pathname = decodeURIComponent(url.pathname);

  const query = {}; url.searchParams.forEach((v, k) => { query[k] = v; });
  if (pathname === '/api/fans') {
    if (process.env.FANS === 'demo') { res.setHeader('Content-Type', 'application/json'); return res.end(JSON.stringify({ fans: DEMO_FANS })); }
    return fans(...adapt(req, res, null, query));
  }
  if (pathname === '/api/fan-image') return fanImage(...adapt(req, res, null, query));
  if (pathname === '/api/subscribe') {
    let body = '';
    req.on('data', (c) => { body += c; });
    req.on('end', () => {
      let parsed = {};
      try { parsed = JSON.parse(body || '{}'); } catch (e) { parsed = {}; }
      subscribe(...adapt(req, res, parsed, query));
    });
    return;
  }

  if (pathname === '/') pathname = '/index.html';
  let file = path.join(ROOT, pathname);
  // cleanUrls: /cans serves cans.html even though a cans/ folder exists beside it
  if ((!fs.existsSync(file) || fs.statSync(file).isDirectory()) && fs.existsSync(file + '.html')) file += '.html';
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.statusCode = 404;
    res.setHeader('Content-Type', TYPES['.html']);
    res.end(fs.readFileSync(path.join(ROOT, '404.html')));
    return;
  }
  res.setHeader('Content-Type', TYPES[path.extname(file)] || 'application/octet-stream');
  res.end(fs.readFileSync(file));
}).listen(PORT, () => console.log('dev server on http://localhost:' + PORT));
