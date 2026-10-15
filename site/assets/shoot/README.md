# Shoot frames

Every photo on the site comes from the Fresnaye braai shoot (12 September 2026)
or from an approved fan. No renders, no stock, no AI. `node tools/check-pages.js`
fails if a page uses any other image.

Source: Drive, **Doña Fuego Shoot Selects**, folders **A - HERO** and
**TRADE - CLEAN CAN**. The originals stay there; only web copies live here.

## Add or swap a frame

1. Download the original from Drive into a folder outside the repo (the Drive
   filename, unchanged).
2. Add or edit its entry in `tools/shoot-manifest.json`: a short `id`, the Drive
   `src`, the camera, a `caption`, an `alt`, and the `scene` it belongs to. The
   caption is what is written on the print: short, specific, what happened in that frame,
   the way someone writes on the back of a photo. No names until that guest has said yes.
   The `alt` says plainly what is in the picture, for screen readers. `crop` takes
   fractions of the frame (left, top, right, bottom) when only part is wanted.
3. `python3 tools/build-images.py /path/to/originals` writes `<id>-1280.webp`,
   `<id>-640.webp` and `frames.json`, with EXIF stripped.
4. Put the frame in the page. Prints use the `.print` figure markup already on
   the home page; copy one.

Before any frame goes in, check it against the Brand Kit `07-compliance.md`.
`tools/shoot-manifest.json` lists the frames held back and why.
