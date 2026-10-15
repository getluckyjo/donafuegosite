#!/usr/bin/env python3
"""Cut the can label renders out of their white ground for the product slots.

    python3 tools/build-products.py "<folder with the renders>"

Reads the label designer's packshots (Labels/Renders in the shared Drive folder,
"Dona Margarita.png" and so on), finds the can on its white background row by row,
trims it, and writes transparent WebPs to site/assets/products/<slug>-{640,1280}.webp
plus products.json with their sizes. Only label renders of the real cans belong here.
Everything else on the site is a shoot frame.
"""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "site" / "assets" / "products"
SOURCES = {
    "margarita": "Dona Margarita.png",
    "spicy-margarita": "Dona Spicy Margarita.png",
    "paloma": "Dona Paloma.png",
}
WIDTHS = (640, 1280)  # names follow the shoot set; the number is the long edge
EDGE = 248            # darker than this in any channel is can (the lid is nearly white)
RIM = 236             # stricter near the base, where the floor shadow starts
BASE = 170            # the dark line along the bottom of the can


def span(row, limit):
    xs = np.where(row < limit)[0]
    return (xs.min(), xs.max()) if len(xs) else None


def cut(path):
    im = Image.open(path).convert("RGB")
    mn = np.asarray(im).min(axis=2)
    h, w = mn.shape
    # Can body: the label rows, where the edge is unambiguous.
    mid = [span(mn[y], RIM) for y in range(int(h * 0.3), int(h * 0.7), 50)]
    left = int(np.median([s[0] for s in mid if s]))
    right = int(np.median([s[1] for s in mid if s]))
    # Base: per column, the last dark pixel of the bottom rim. Below it is shadow.
    floor = np.full(w, -1)
    low = int(h * 0.8)
    for x in range(left, right + 1):
        ys = np.where(mn[low:, x] < BASE)[0]
        if len(ys):
            floor[x] = low + ys.max()
    hit = np.where(floor >= 0)[0]
    gaps = np.where(floor < 0)[0]
    inside = gaps[(gaps > hit.min()) & (gaps < hit.max())]
    floor[inside] = np.interp(inside, hit, floor[hit]).astype(int)  # a highlight, not an edge
    bottom = floor.max()
    floor[floor < 0] = h  # outside the rim the row spans do the trimming
    mask = np.zeros((h, w), dtype=np.uint8)
    for y in range(h):
        s = span(mn[y], RIM if y > bottom - h * 0.03 else EDGE)
        if not s or s[1] - s[0] < (right - left) * 0.3:
            continue
        x0, x1 = max(s[0], left), min(s[1], right)
        cols = np.arange(x0, x1 + 1)
        mask[y, cols[floor[cols] >= y]] = 255
    m = Image.fromarray(mask).filter(ImageFilter.MinFilter(5)).filter(ImageFilter.GaussianBlur(1.2))
    rgba = im.copy()
    rgba.putalpha(m)
    return rgba.crop(m.getbbox())


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    src = Path(sys.argv[1])
    OUT.mkdir(parents=True, exist_ok=True)
    meta = {}
    for slug, name in SOURCES.items():
        can = cut(src / name)
        for long_edge in WIDTHS:
            scale = long_edge / max(can.size)
            im = can.resize((round(can.width * scale), round(can.height * scale)), Image.LANCZOS)
            im.save(OUT / f"{slug}-{long_edge}.webp", "WEBP", quality=86, method=6)
        meta[slug] = {"width": im.width, "height": im.height}
        print(f"{slug}: {im.width}x{im.height}")
    (OUT / "products.json").write_text(json.dumps(meta, indent=1) + "\n")


if __name__ == "__main__":
    main()
