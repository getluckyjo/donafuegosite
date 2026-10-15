'use strict';
/* Lint for the static site. Fails (exit 1) when a page drifts from the partials,
   misses its metadata, breaks an internal link, or uses a word the brand doesn't.
   Run: node tools/check-pages.js */
const fs = require('fs');
const path = require('path');
const { pages, partials, ROOT } = require('./lib-pages.js');

// From the Brand Kit, 02-voice.md. Whole words, case-insensitive.
const BANNED = ['premium', 'crafted', 'elevated', 'indulge', 'unleash', 'journey', 'curated', 'refreshingly', 'sip', 'tantalising', 'tantalizing', 'perfect for any occasion'];
const REQUIRED_PARTIALS = ['head', 'age-gate', 'header', 'footer'];

let errors = 0, warnings = 0;
const err = (f, m) => { errors++; console.log(`ERROR  ${f}: ${m}`); };
const warn = (f, m) => { warnings++; console.log(`warn   ${f}: ${m}`); };

const parts = partials();
const all = pages();
const rel = (f) => path.relative(ROOT, f);

function resolves(href) {
  const clean = href.split('#')[0].split('?')[0];
  if (!clean || clean === '/') return true;
  if (clean.startsWith('/api/')) return true;
  const p = path.join(ROOT, clean);
  return fs.existsSync(p) || fs.existsSync(p + '.html') || fs.existsSync(path.join(p, 'index.html'));
}

for (const file of all) {
  const f = rel(file);
  const html = fs.readFileSync(file, 'utf8');

  // Partials present and identical to the source of truth
  for (const name of REQUIRED_PARTIALS) {
    const re = new RegExp(`<!-- partial:${name} -->([\\s\\S]*?)<!-- /partial:${name} -->`);
    const m = html.match(re);
    if (!m) { err(f, `missing partial block "${name}"`); continue; }
    if (m[1].trim() !== (parts[name] || '').trim()) err(f, `partial "${name}" differs from _partials/${name}.html (run node tools/sync-partials.js)`);
  }

  // Metadata
  if (!/<html[^>]*lang="en-ZA"/.test(html)) err(f, 'html lang should be en-ZA');
  if (!/<title>[^<]{10,70}<\/title>/.test(html)) err(f, 'title missing or outside 10-70 characters');
  if (!/<meta name="description" content="[^"]{40,170}"/.test(html)) err(f, 'meta description missing or outside 40-170 characters');
  if (!/<link rel="canonical" href="https:\/\/donafuego\.co\.za\//.test(html)) err(f, 'canonical missing');
  for (const og of ['og:title', 'og:description', 'og:image', 'og:url']) if (!html.includes(`property="${og}"`)) err(f, `missing ${og}`);
  if (!/<main[\s>]/.test(html)) err(f, 'no <main>');
  if ((html.match(/<h1[\s>]/g) || []).length !== 1) err(f, 'exactly one <h1> expected');

  // Internal links and assets
  const live = html.replace(/<!--[\s\S]*?-->/g, ' ');   // commented-out markup is not a link
  const hrefs = [...live.matchAll(/(?:href|src|poster|data-src)="(\/[^"]*)"/g)].map((m) => m[1]);
  for (const h of new Set(hrefs)) if (!resolves(h)) err(f, `broken internal link ${h}`);
  for (const m of live.matchAll(/<a [^>]*href="https?:\/\/[^"]*"[^>]*>/g)) {
    if (!/rel="[^"]*noopener/.test(m[0])) warn(f, `external link without rel="noopener": ${m[0].slice(0, 80)}`);
  }
  for (const m of live.matchAll(/<img [^>]*>/g)) {
    if (!/alt="/.test(m[0])) err(f, `img without alt: ${m[0].slice(0, 80)}`);
    // Shoot frames and approved fan photos only: no renders, no stock, no AI.
    const src = (m[0].match(/\ssrc="([^"]*)"/) || [])[1] || '';
    if (!src.startsWith('/assets/shoot/') && !src.startsWith('/api/fan-image')) err(f, `image outside the shoot set: ${src}`);
  }
  for (const m of live.matchAll(/\/assets\/img\/([\w.-]+)/g)) {
    if (!['favicon.svg', 'og.jpg'].includes(m[1])) err(f, `reference to a removed image: /assets/img/${m[1]}`);
  }
  for (const m of live.matchAll(/\/assets\/shoot\/([\w-]+)-(640|1280)\.webp/g)) {
    if (!fs.existsSync(path.join(ROOT, 'assets', 'shoot', `${m[1]}-${m[2]}.webp`))) err(f, `missing shoot frame ${m[1]}-${m[2]}`);
  }

  // Voice
  const text = html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<!--[\s\S]*?-->/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ');
  for (const w of BANNED) {
    const re = new RegExp(`\\b${w.replace(/ /g, '\\s+')}\\b`, 'i');
    if (re.test(text)) err(f, `banned word "${w}"`);
  }
  const nobs = (text.match(/no bs/gi) || []).length;
  if (nobs > 1) err(f, `"No BS" appears ${nobs} times; once per page at most`);
  const bangs = (text.match(/!/g) || []).length;
  if (bangs) warn(f, `${bangs} exclamation mark(s) in copy; brand voice uses none`);
}

console.log(`\n${all.length} pages checked, ${errors} error(s), ${warnings} warning(s)`);
process.exit(errors ? 1 : 0);
