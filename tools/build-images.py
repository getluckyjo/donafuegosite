#!/usr/bin/env python3
"""Turn raw shoot frames into web images.

    python3 tools/build-images.py /path/to/raw

raw holds the Drive originals, named as Drive names them, optionally prefixed
"A__" or "T__" (how the Composio download saves them). Reads
tools/shoot-manifest.json, writes site/assets/shoot/<id>-1280.webp and
<id>-640.webp, and site/assets/shoot/frames.json with sizes and credits.
EXIF is dropped: no GPS or camera data goes public. Frames marked
"grade": "film" (Liezl's digital set) are graded to sit with the film rolls.
Needs Pillow and numpy.
"""
import hashlib, json, os, sys
import numpy as np
from PIL import Image, ImageOps

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
OUT = os.path.join(ROOT, 'site', 'assets', 'shoot')
SIZES = {1280: 74, 640: 70}          # long edge -> WebP quality

def film(im, seed):
    """Grade a clean digital frame toward the disposable rolls: warm mids,
    a touch less saturation, lifted blacks, a soft highlight knee and fine
    grain. The seed fixes the grain so rebuilds are byte-identical."""
    a = np.asarray(im.convert('RGB')).astype(np.float32) / 255.0
    lum = a @ np.array([0.299, 0.587, 0.114], dtype=np.float32)
    a = a + (4 * lum * (1 - lum))[..., None] * np.array([0.06, 0.02, -0.07], dtype=np.float32)
    g = lum[..., None]
    a = g + (a - g) * 0.96
    a = 0.03 + a * 0.95
    hi = a > 0.8
    a[hi] = 0.8 + (a[hi] - 0.8) * 0.6
    rng = np.random.default_rng(int(hashlib.md5(seed.encode()).hexdigest()[:8], 16))
    a = np.clip(a + rng.normal(0, 0.014, a.shape[:2]).astype(np.float32)[..., None], 0, 1)
    return Image.fromarray((a * 255 + 0.5).astype(np.uint8))

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
            if f.get('grade') == 'film':
                c = film(c, f"{f['id']}-{edge}")
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
