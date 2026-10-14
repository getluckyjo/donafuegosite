'use strict';
/* Writes the shared blocks from site/_partials/ into every page.
   Pages mark each block with <!-- partial:NAME --> ... <!-- /partial:NAME -->.
   Run after editing a partial: node tools/sync-partials.js */
const fs = require('fs');
const path = require('path');
const { pages, partials, ROOT } = require('./lib-pages.js');

let changed = 0;
for (const file of pages()) {
  let html = fs.readFileSync(file, 'utf8');
  const before = html;
  for (const [name, body] of Object.entries(partials())) {
    const re = new RegExp(`(<!-- partial:${name} -->)[\\s\\S]*?(<!-- /partial:${name} -->)`, 'g');
    html = html.replace(re, (m, open, close) => `${open}\n${body.trim()}\n${close}`);
  }
  if (html !== before) { fs.writeFileSync(file, html); changed++; console.log('updated', path.relative(ROOT, file)); }
}
console.log(changed ? `${changed} page(s) updated` : 'all pages already in sync');
