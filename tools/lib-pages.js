'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..', 'site');
const PARTIALS = path.join(ROOT, '_partials');

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) { if (p !== PARTIALS) walk(p, out); }
    else if (entry.name.endsWith('.html')) out.push(p);
  }
  return out.sort();
}
function pages() { return walk(ROOT); }
function partials() {
  const out = {};
  for (const f of fs.readdirSync(PARTIALS)) if (f.endsWith('.html')) out[f.replace(/\.html$/, '')] = fs.readFileSync(path.join(PARTIALS, f), 'utf8');
  return out;
}
module.exports = { ROOT, PARTIALS, pages, partials, walk };
