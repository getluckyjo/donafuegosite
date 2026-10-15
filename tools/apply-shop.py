#!/usr/bin/env python3
"""Write the Sixty60 buy links from tools/shop.json into the pages.

Every buy block sits between <!-- shop:KIND:SLUG --> and <!-- /shop:KIND:SLUG -->
markers, so this can be rerun whenever a link or price changes.
KIND is "full" (can pages: every pack) or "mini" (range cards: the 4-pack).
Links marked data-shop="search" (header, title card, Find Us) get the brand
search URL, partials included. Run: python3 tools/apply-shop.py, then
node tools/sync-partials.js
"""
import html, json, os, re

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SHOP = json.load(open(os.path.join(ROOT, 'tools', 'shop.json')))
NAMES = {'margarita': 'Margarita', 'spicy-margarita': 'Spicy Margarita', 'paloma': 'Paloma', 'non-alc-margarita': 'Non-Alc Margarita'}

def url(u):
    return html.escape(u + ('&' if '?' in u else '?') + SHOP['utm'])

def full(slug):
    packs = SHOP['cans'][slug]
    if not packs:
        return ('<div class="buy"><span class="buy-label">Not on Sixty60 yet</span>'
                '<p class="buy-note">Ask for it at your Checkers LiquorShop, or <a href="/contact">tell us where you want it</a>.</p></div>')
    opts = ''.join(
        f'<a class="buy-opt" href="{url(u)}" target="_blank" rel="noopener" data-buy="{slug}:{p}">'
        f'<strong>{html.escape(p)}</strong><span>{html.escape(r)}</span></a>' for p, r, u in packs)
    return (f'<div class="buy"><span class="buy-label">Order the {NAMES[slug]} on Checkers Sixty60</span>'
            f'<div class="buy-row">{opts}</div>'
            '<p class="buy-note">Opens Checkers Sixty60, on the web or in the app. Delivered to an adult with ID, '
            'during liquor trading hours. If it shows out of stock, your nearest store has sold through.</p></div>')

def mini(slug):
    packs = SHOP['cans'][slug]
    if not packs:
        return '<span class="buy-mini off">Not on Sixty60 yet</span>'
    p, r, u = packs[0]
    return (f'<a class="buy-mini" href="{url(u)}" target="_blank" rel="noopener" data-buy="{slug}:{p}">'
            f'<span class="buy-verb">Order a </span>{p.lower()} · {r}</a>')

def offers(slug):
    return [{'@type': 'Offer', 'name': p, 'price': r.lstrip('R'), 'priceCurrency': 'ZAR', 'url': u,
             'seller': {'@type': 'Organization', 'name': 'Checkers Sixty60'}} for p, r, u in SHOP['cans'][slug]]

changed = 0
SEARCH = url(SHOP['brand_search'])
for dirpath, _, files in os.walk(os.path.join(ROOT, 'site')):
    for name in files:
        if not name.endswith('.html'):
            continue
        p = os.path.join(dirpath, name)
        s = open(p).read()
        before = s
        s = re.sub(r'(<!-- shop:(full|mini):([a-z-]+) -->).*?(<!-- /shop:\2:\3 -->)',
                   lambda m: m.group(1) + (full if m.group(2) == 'full' else mini)(m.group(3)) + m.group(4), s, flags=re.S)
        s = re.sub(r'(<a [^>]*data-shop="search"[^>]*href=")[^"]*(")', lambda m: m.group(1) + SEARCH + m.group(2), s)
        # Product structured data: keep the offers in step with the links
        m = re.search(r'/cans/([a-z-]+)\.html$', p.replace(os.sep, '/'))
        if m and SHOP['cans'].get(m.group(1)):
            def ld(match):
                data = json.loads(match.group(1))
                data['offers'] = offers(m.group(1))
                return '<script type="application/ld+json">\n' + json.dumps(data, indent=2, ensure_ascii=False) + '\n</script>'
            s = re.sub(r'<script type="application/ld\+json">\s*(\{.*?"@type": "Product".*?\})\s*</script>', ld, s, count=1, flags=re.S)
        if s != before:
            open(p, 'w').write(s)
            changed += 1
            print('updated', os.path.relpath(p, ROOT))
print(changed, 'page(s) updated')
