#!/usr/bin/env python3
"""Turn raw shoot frames into web images.

    python3 tools/build-images.py /path/to/raw

raw holds the Drive originals, named as Drive names them, optionally prefixed
"A__" or "T__" (how the Composio download saves them). Reads
tools/shoot-manifest.json, writes site/assets/shoot/<id>-1280.webp and
<id>-640.webp, and site/assets/shoot/frames.json with sizes and credits.
EXIF is dropped: no GPS or camera data goes public. Needs Pillow.
"""
import json, os, sys
from PIL import Image, ImageOps

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
OUT = os.path.join(ROOT, 'site', 'assets', 'shoot')
SIZES = {1280: 74, 640: 70}          # long edge -> WebP quality

def find(raw, name):
    for cand in (name, 'A__' + name, 'T__' + name):
        p = os.path.join(raw, cand)
        if os.path.exists(p):
            return p
    raise SystemExit('missing raw frame: ' + name)

def main(raw):
    man = json.load(open(os.path.join(ROOT, 'tools', 'shoot-manifest.json')))
    os.makedirs(OUT, exist_ok=True)
    frames = []
    for f in man['frames']:
        im = ImageOps.exif_transpose(Image.open(find(raw, f['src']))).convert('RGB')
        if f.get('crop'):
            l, t, r, b = f['crop']
            im = im.crop((round(l * im.width), round(t * im.height), round(r * im.width), round(b * im.height)))
        for edge, q in SIZES.items():
            c = im.copy()
            c.thumbnail((edge, edge), Image.LANCZOS)
            c.save(os.path.join(OUT, f"{f['id']}-{edge}.webp"), 'WEBP', quality=q, method=6)
        w, h = im.size
        scale = 1280 / max(w, h)
        frames.append({
            'id': f['id'], 'src': f['src'], 'caption': f['caption'],
            'scene': f.get('scene'), 'cast': bool(f.get('cast')),
            'shotOn': man['cameras'][f['cam']],
            'w': round(w * min(scale, 1)), 'h': round(h * min(scale, 1)),
        })
        print('ok', f['id'])
    json.dump({'frames': frames}, open(os.path.join(OUT, 'frames.json'), 'w'), indent=1, ensure_ascii=False)
    total = sum(os.path.getsize(os.path.join(OUT, x)) for x in os.listdir(OUT))
    print(f"{len(frames)} frames, {total / 1e6:.1f} MB in site/assets/shoot")

if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'raw'))
