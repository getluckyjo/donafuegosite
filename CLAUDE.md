# Doña Fuego consumer site

Public brand site for the cans, donafuego.co.za. Static HTML, CSS and vanilla JS on
Vercel, no build step. Replaces fuegotequila.co.za (Shopify), which stays up for the
bottle shop and is linked to, not rebuilt.

Three repositories share the brand: this one, the investor site
(`getluckyjo/donafuego`) and the private dashboard (`getluckyjo/donafuego-dashboard`).
Nothing from those two belongs here: no investor numbers, no margins, no store counts
beyond what Danielle has confirmed for the public.

## Rules
- **Voice** follows the Brand Kit (`docs/SITE.md` summarises it). Short sentences, South
  African English, specific facts over adjectives. Never: premium, crafted, elevated,
  indulge, unleash, journey, curated, refreshingly, sip, tantalising, "perfect for any
  occasion". No exclamation marks. "No BS" at most once per page, where it lands hardest.
  `node tools/check-pages.js` enforces the banned list and the "No BS" count.
- **Compliance** is not optional. Nobody under 18 or reading under 25 in frame with a can,
  nobody drunk, no vehicles or driving, no other alcohol brands, no health, strength,
  sexual or success claims. Age gate and the responsible-drinking footer line stay on
  every page. Flag a breach loudly rather than working around it.
- **Copy reads as the definitive version.** No "now", "updated", "previously", "no longer".
- **Facts marked `<span class="tbc">`** are unconfirmed. Clear them with Danielle before
  launch; `docs/SITE.md` lists them.
- **Shared blocks** live in `site/_partials/`. Edit there, then `node tools/sync-partials.js`.
  The check script fails if a page drifts.
- **Tokens** in `site/assets/css/tokens.css` are the Brand Kit's `design-tokens.css` and
  match the other two repositories. Change the palette in all three.
- **Bump `?v=`** in `site/_partials/head.html` (CSS) and `footer.html` (JS) on any CSS/JS
  change, then sync. Assets are cached for a year.
- **Images**: shoot frames and approved fan photos, plus the label designer's can renders
  for product shots only (the cooler box, the range, the can pages). No stock, no AI, no
  rendered scenes. Frames live in `site/assets/shoot/`, built from
  `tools/shoot-manifest.json` by `tools/build-images.py`; `site/assets/shoot/README.md`
  says how. Packshots live in `site/assets/products/`, cut from Labels/Renders by
  `tools/build-products.py`. Retailer logos (Checkers LiquorShop, Checkers Sixty60) live in
  `site/assets/logos/`, used as supplied, on white, only in the `retail` partial. The
  checker fails on anything else.
- **The idea**: the home page is a sitcom about one Saturday. Cold open (prints dropping on a
  pile), the cast, five scenes, the cooler box, then the fan wall as Episode 2. Keep new
  content inside that frame rather than adding brand-site sections.
- **Cast names** stay `[First name TBC]` until that guest has said yes. Never guess a name.
- **Fan wall** shows only what Danielle has put in the Drive Fan Wall folder. Nothing is
  pulled from Instagram automatically, and nothing goes up without the fan's permission.

## Run and check
    node tools/dev-server.js        # http://localhost:4321
    node tools/check-pages.js       # must pass before pushing

## Deploy
Fast-forward `main`. Vercel project to be created from this repo; domain donafuego.co.za.
Env for the forms: `RESEND_API_KEY`, `RESEND_AUDIENCE_ID`, `CONTACT_TO`, `CONTACT_FROM`.
Without them the forms answer politely and log to the function output.
Env for the fan wall: `GOOGLE_SA_EMAIL`, `GOOGLE_SA_PRIVATE_KEY`, `FAN_FOLDER_ID`. Without
them the wall shows its "this could be you" card. `FANS=demo node tools/dev-server.js`
fills it with stand-in frames locally.
