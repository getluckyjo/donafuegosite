'use strict';
/* Writes site/sitemap.xml from the pages on disk. Every page is listed except the
   ones marked <meta name="robots" content="noindex"> (the 404). lastmod is the date
   of the page's last commit, or today if it has uncommitted changes.
   Run after adding or removing a page: node tools/build-sitemap.js */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { pages, ROOT } = require('./lib-pages.js');

const SITE = 'https://donafuego.co.za';

function urlFor(file) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/').replace(/\.html$/, '');
  return rel === 'index' ? `${SITE}/` : `${SITE}/${rel}`;
}
function indexable(file) {
  return !/<meta name="robots" content="[^"]*noindex/.test(fs.readFileSync(file, 'utf8'));
}
function lastmod(file) {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const dirty = execSync(`git status --porcelain -- "${file}"`, { cwd: ROOT, encoding: 'utf8' }).trim();
    if (dirty) return today;
    return execSync(`git log -1 --format=%cs -- "${file}"`, { cwd: ROOT, encoding: 'utf8' }).trim() || today;
  } catch (e) { return today; }
}
function entries() {
  return pages().filter(indexable).map((f) => ({ loc: urlFor(f), lastmod: lastmod(f) }))
    .sort((a, b) => (a.loc === `${SITE}/` ? -1 : b.loc === `${SITE}/` ? 1 : a.loc.localeCompare(b.loc)));
}
function render(list) {
  return ['<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...list.map((e) => `  <url><loc>${e.loc}</loc><lastmod>${e.lastmod}</lastmod></url>`),
    '</urlset>', ''].join('\n');
}

if (require.main === module) {
  const out = path.join(ROOT, 'sitemap.xml');
  const xml = render(entries());
  const before = fs.existsSync(out) ? fs.readFileSync(out, 'utf8') : '';
  fs.writeFileSync(out, xml);
  console.log(xml === before ? 'sitemap.xml unchanged' : `sitemap.xml written, ${entries().length} URLs`);
}
module.exports = { entries, urlFor, SITE };
