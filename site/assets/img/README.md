# Images

Every file here except `favicon.svg` and `og.jpg` is a **placeholder** copied from
the investor site (`getluckyjo/donafuego`). The cooler renders are 3D/AI product
shots, which is the opposite of the brand's photography rule (guest-camera,
imperfect, real). They hold the layout until the shoot selects replace them.

Selects live in Drive: **Doña Fuego Shoot Selects / A - HERO** (72 frames) and
**TRADE - CLEAN CAN** (8). Every frame used on the site must pass the Brand Kit
`07-compliance.md` checklist. Export JPEG, sRGB, quality 85, long edge 2400px,
then convert to WebP for the site (`cwebp -q 82`).

| Slot | File now | Replace with |
|---|---|---|
| Home hero (still) | `hero-cooler.webp` | `BERN_138` sunset toast, or `344294_000012` can against the Atlantic |
| Home hero (film, desktop) | none (markup commented out in `index.html`) | 16:9 cut of "opening film v3 (heroes)", H.264, under 4MB, poster = hero still |
| Home gallery (6) | `cooler-trio`, `hero-cooler`, `taqueria`, `mas-tequila`, `agave-field` | `334293_000021` cooler from above (wide), `314291_000037` POV hand, `CHAR_222` corn, `BERN_070` pour, `344294_000030` floating can, `314291_000017` group under the papel picado |
| Can pages (product shot) | `can-margarita`, `can-paloma`, `can-spicy` label renders | `BERN_009` style clean can per SKU from TRADE - CLEAN CAN; Non-Alc render still to come |
| Can pages (occasion, 2 each) | `cooler-trio`, `hero-cooler` | two A-HERO frames per can, chosen for that can's colour in frame |
| Story | `danielle.webp`, `barrels.webp`, `agave-field.webp` | keep `danielle.webp`; distillery frames from Liezl's X100VI set once graded |
| Serves (4) | `cooler-trio`, `hero-cooler`, `mas-tequila`, `taqueria` | `334293_000039` cracking a can, `BERN_070` pour with salt rim, a Paloma with grapefruit (not yet shot), `CHAR_159` meat on the grid |
| Find us | `checkers-store.webp` (mock-up), `cooler-trio` | a real Checkers LiquorShop fridge shot with the cans on shelf |
| Share image | `og.jpg` (1200×630 crop of `cooler-trio`) | crop of the final hero still |
| Logo | typed wordmark in CSS | vector wordmark SVG from Danielle; drop in `assets/img/wordmark.svg` and swap the `.wordmark` markup in `_partials/header.html` and `footer.html` |

Keep `width` and `height` attributes on every `<img>` so the page does not jump.
