# donafuego.co.za — plan, page map and what is still needed

Last updated 15 October 2026. This is the working document for the consumer site.
`CLAUDE.md` has the rules; this file has the state.

## Why

fuegotequila.co.za is a Shopify Dawn store built for the bottles. The June 2026 UX audit
found no age gate, no policy pages, thin product pages, no hero CTA and a "Reposade"
typo. The cans launched nationally in Checkers in August 2026 and are Checkers-exclusive,
so the job of the site is not to sell cans. It is to make someone want to be at that
braai with that can in their hand, and tell them where to get it.

Reference for structure and pacing: drink818.com (full-bleed hero with one action, product
row, story band, serves, Instagram, footer with the legal). We take the structure, not the
look. Theirs is a celebrity-polish site. Ours has to pass the brand's three tests: could
this be any other drink, would Sunny screenshot it, does it look like a friend made it.

## Decisions (Johannes, 14 Oct 2026)

- Brand site, no cart. Cans: every can page, the range, the cooler box and `/find-us`
  link straight to that can's Checkers Sixty60 product page (4-pack, single, 24-pack).
  Bottles: link out to the existing Shopify product pages.
- New domain donafuego.co.za. fuegotequila.co.za keeps running Shopify until redirected;
  plan is to keep the shop on shop.fuegotequila.co.za.
- Stack: static HTML/CSS/JS on Vercel, same conventions as the other two repositories.

## The idea: a sitcom about one Saturday

Johannes asked for a friends page, not a brand page: the How I Met Your Mother intro,
less brand, more real, a bit retro, built only from the shoot. So the home page is
Season 1, Episode 1, "The Braai":

1. **Cold open.** Disposable prints drop onto a pile, fast, then the title card slams on.
   Silent. Plays once per browser session; Skip and "watch the intro again" are there.
2. **Starring.** Nine cast cards, one per person, each a print, a first name and one line. Then
   "Created by" Danielle, which replaces the old story page.
3. **Five scenes.** Arrivals, The fire, The pool, Sunset, After dark. Prints scattered
   like they came back from the chemist, each with its camera credit.
4. **What was in the cooler box.** The only product moment: the three cans, cropped
   from Bernard's clean-can lineup, and the Non-Alc, cropped from Liezl's last-light lineup.
5. **Episode 2 stars you.** The fan wall.
6. **End credits.** The footer rolls like credits.

Retro comes from treatment, not new colours: white-bordered prints, orange film date
stamps, film grain, Bevan title cards with a chilli offset shadow.

## The fan wall: how Danielle runs it

1. Someone tags @drink_fuego_tequila or uses #DonaFuego.
2. If it's a good one, DM them: ask if Doña Fuego can put it on the website, credited.
3. Before saving, check it against `07-compliance.md`: everyone clearly over 18 and
   reading 25+ if there's a can, nobody looks drunk, no cars or driving, no other alcohol
   brands, no phone in their hand if it can be avoided.
4. Save the photo into the **Fan Wall** folder on Drive. Put their @handle in the file's
   description (right-click, File information, Description), or name the file
   `@handle.jpg`.
5. It shows on the site within ten minutes, newest first. To take one down, delete it from
   the folder. It drops off the wall within ten minutes.

Setup, once: create a Google Cloud service account with no roles, make a key, share the
Fan Wall folder with its email as Viewer, and set `GOOGLE_SA_EMAIL`, `GOOGLE_SA_PRIVATE_KEY`
and `FAN_FOLDER_ID` on Vercel. The dashboard's `docs/DASHBOARD.md` has the same
walkthrough for its own service account.

## Cast consent

Each cast card says `[First name TBC]`. For each one, find out who it is, ask them, and
put the first name in `site/index.html` (search for `data-cast="<id>"`).

| Card | Frame | Name | Said yes |
|---|---|---|---|
| flag-face | 39_334293_000031 | | |
| beaming-flag | 17_334293_000042 | | |
| kodak-cheers | 57_314295_000038 | | |
| bunting-laugh | 13_CHAR_028 | | |
| mustard-polo | 53_334292_000040 | | |
| face-can | 22_CHAR_056 | | |
| couple-cheers (two people) | 30_CHAR_109 | | |
| fan-eyes | 19_314295_000027 | | |
| laugh-glass | 44_CHAR_042 | | |

Camera credits name Bernard, Anda, Shaun and Liezl as photographers, as the Brand Kit asks.
Confirm they're happy with that too.

## Liezl's set

Liezl shot the afternoon on a Fuji X100VI: 172 frames in the Google Photos album
"Dona Fuego - Liezl X100VI" (89 of them are also in Drive). Twenty are on the site, graded
toward the film rolls by `tools/build-images.py` so the scenes read as one afternoon.
Her set has hard compliance breaches that must never be used: a red car with its number
plate and a guest in the driver's seat (L068 to L074, L171, L172), a motorbike delivery and
cars (L089 to L091, L141), and a round that reads as shots (L063 to L066). The full list
is in `tools/shoot-manifest.json`.

## Page map

| URL | File | Status |
|---|---|---|
| `/` | `site/index.html` | the episode: cold open, cast, scenes, cooler box, fan wall |
| `/cans` | `site/cans.html` | drafted |
| `/cans/margarita` `/cans/spicy-margarita` `/cans/paloma` `/cans/non-alc-margarita` | `site/cans/*.html` | drafted; Non-Alc specs TBC |
| `/find-us` | `site/find-us.html` | drafted; Sixty60 buy blocks live, store list to come |
| `/story` | redirect to `/#created-by` | done |
| `/serves` | `site/serves.html` | drafted |
| `/tequila` | `site/tequila.html` | drafted; bottle specs and prices TBC |
| `/contact` | `site/contact.html` | drafted; addresses TBC |
| `/legal/terms` `/legal/privacy` | `site/legal/*.html` | drafted for attorney review |
| `/404` | `site/404.html` | done |
| `/shop` | redirect in `vercel.json` to the Shopify collection | done |
| `/api/subscribe` | `api/subscribe.js` | works in stub mode; needs Resend env |
| `/api/fans`, `/api/fan-image` | `api/fans.js`, `api/fan-image.js` | empty until the fan-wall env is set |

## Sixty60 links

`tools/shop.json` holds every Checkers link and price: the brand search, and one product
URL per pack per can, all tagged `utm_source=donafuego&utm_medium=referral&utm_campaign=brand-site`.
Pages carry `<!-- shop:full:SLUG -->` and `<!-- shop:mini:SLUG -->` markers and any
`<a data-shop="search">`. To change a link or a price, edit the JSON, then:

    python3 tools/apply-shop.py && node tools/sync-partials.js

It also writes the `offers` into each can page's Product schema. A can with no packs
(the Non-Alc) shows "Not on Sixty60 yet". The Margarita listing on Checkers showed out of
stock when the links went in (15 Oct 2026).

## Packshots

The three can renders from Labels/Renders (shared Drive folder, also in
`getluckyjo/donafuego` under `Dona Distillery /09 Fuego X Johannes/Labels/Renders`) are
cut out of their white ground by `tools/build-products.py` into
`site/assets/products/`. They are the product shots on the cooler box, the range and the
can pages. Everything else is the shoot. The Non-Alc has no render yet, so it uses
Liezl's photo of the can in a print frame until one arrives.

## Brand, in one paragraph

Real tequila and real juice in a can, built for the cooler box. Four cans, 250ml, 7%:
Margarita (forest), Spicy Margarita (chilli), Paloma (coral), Non-Alc Margarita (leaf).
The occasion is share of cooler box: the braai, the beach, Saturday afternoon. Not the
nightclub. The drinker already drinks tequila and is suspicious of anything that looks
like an advert. Look: vintage cantina, cream, forest, coral, chilli, sun-bleached, hand
drawn. Photography: disposable and point-and-shoot, shot by the guests. Voice: confident,
warm, direct, South African English, facts over adjectives, no exclamation marks.

## Needed to finish, in priority order

Each has a placeholder in the build, so nothing blocks review of the draft.

1. **Logo.** Only a red PNG exists (Shopify). Need the vector wordmark or the can-label
   lettering as SVG. The site uses a typed Bevan wordmark until then.
2. **Non-Alc render and size.** Ask the label designer for the Non-Alc packshot to match
   the other three, then add it to `SOURCES` in `tools/build-products.py`. The can in
   Liezl's L150 reads 300ml, 0%, "fruit juice cocktail". 0% and the class are on the site;
   the size is marked to confirm.
3. **Cast names and consent.** See the table above.
4. **Fan wall setup.** Service account, Fan Wall folder, three env vars. See above.
5. **Held-back frames.** Eight frames are out pending an age or background check; the list
   is in `tools/shoot-manifest.json`. Clear them with Danielle to use them.
6. **Facts to confirm with Danielle.** Store count for public use; Sixty60 prices in `tools/shop.json`;
   can size (Brand Kit 250ml, Shopify listing says 300ml); Non-Alc
   ABV and on-pack class; launch wording. Every one is marked `tbc` in the pages.
7. **Bottle specs.** ABV, size, tasting notes and current prices for Blanco, Jalapeño and
   Reposado. Fix the "reposade" product URL in Shopify and add a redirect.
8. **Contact details.** hello@ and press@ on donafuego.co.za (or whichever addresses are
   real), phone, street address for the footer and the Organization schema.
9. **Social.** Keep @drink_fuego_tequila or move to a Doña Fuego handle. TikTok yes or no.
10. **Company and legal.** Registered entity and number for the footer; attorney review of
   `legal/terms` and `legal/privacy`; information officer's name; confirm the ARA
   responsible-drinking wording.
11. **Domain and hosting.** Register donafuego.co.za, create the Vercel project from this
    repo, set DNS. Plan the fuegotequila.co.za redirect and the shop subdomain.
12. **Email.** Resend API key, an audience ID and a verified sending domain. Then the
    welcome email.
13. **Checkers and Sixty60 marks.** The LiquorShop and Sixty60 logos are on the
    "Available nationwide" band (`site/_partials/retail.html`: home and `/cans`). Confirm
    with the Checkers buyer that brand use is fine under the trading terms. Check the links
    in `tools/shop.json` against the ones Danielle emailed, and add the Non-Alc once
    Checkers lists it.
14. **Analytics.** Recommend Vercel Web Analytics or Plausible (no cookies, no banner).
    Name it in the privacy page when added.
15. **Final copy.** Drafts are in brand voice. Clarissa or Danielle sign off before launch.

## Later, once the above is in

- Curated list of top Checkers stores on `/find-us`.
- A "pouring this weekend" slot on the home page for events and tastings.
- Welcome email, then a replenishment nudge, through Resend.
- Giveaway mechanic and its terms page (18+, CPA-compliant), per the Brand Kit.
- Afrikaans copy where it fits better than English.
