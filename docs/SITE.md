# donafuego.co.za — plan, page map and what is still needed

Last updated 14 October 2026. This is the working document for the consumer site.
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

- Brand site, no cart. Cans: "Find it at Checkers / Sixty60". Bottles: link out to the
  existing Shopify product pages.
- New domain donafuego.co.za. fuegotequila.co.za keeps running Shopify until redirected;
  plan is to keep the shop on shop.fuegotequila.co.za.
- Stack: static HTML/CSS/JS on Vercel, same conventions as the other two repositories.

## Page map

| URL | File | Status |
|---|---|---|
| `/` | `site/index.html` | drafted |
| `/cans` | `site/cans.html` | drafted |
| `/cans/margarita` `/cans/spicy-margarita` `/cans/paloma` `/cans/non-alc-margarita` | `site/cans/*.html` | drafted; Non-Alc specs TBC |
| `/find-us` | `site/find-us.html` | drafted; price TBC, store list to come |
| `/story` | `site/story.html` | drafted |
| `/serves` | `site/serves.html` | drafted |
| `/tequila` | `site/tequila.html` | drafted; bottle specs and prices TBC |
| `/contact` | `site/contact.html` | drafted; addresses TBC |
| `/legal/terms` `/legal/privacy` | `site/legal/*.html` | drafted for attorney review |
| `/404` | `site/404.html` | done |
| `/shop` | redirect in `vercel.json` to the Shopify collection | done |
| `/api/subscribe` | `api/subscribe.js` | works in stub mode; needs Resend env |

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
2. **Non-Alc Margarita can render.** Never delivered. Shown as a dashed silhouette.
3. **Hero film.** "Opening film v3 (heroes)" is 1080×1350 portrait, no sound. Need a 16:9
   cut for desktop (H.264, under 4MB), or approval to use a still on desktop. Recommend
   no sound; muted autoplay only. Markup is in `index.html`, commented out.
4. **Web selects.** 12 to 15 A-HERO frames and 4 TRADE clean cans, per
   `site/assets/img/README.md`. Compliance check on every one. Claude can pull and convert
   from Drive once told which.
5. **Facts to confirm with Danielle.** Store count for public use; 4-pack and single price;
   can size (Brand Kit 250ml, Shopify listing says 300ml); Sixty60 availability; Non-Alc
   ABV and on-pack class; launch wording. Every one is marked `tbc` in the pages.
6. **Bottle specs.** ABV, size, tasting notes and current prices for Blanco, Jalapeño and
   Reposado. Fix the "reposade" product URL in Shopify and add a redirect.
7. **Contact details.** hello@ and press@ on donafuego.co.za (or whichever addresses are
   real), phone, street address for the footer and the Organization schema.
8. **Social.** Keep @drink_fuego_tequila or move to a Doña Fuego handle. TikTok yes or no.
9. **Company and legal.** Registered entity and number for the footer; attorney review of
   `legal/terms` and `legal/privacy`; information officer's name; confirm the ARA
   responsible-drinking wording.
10. **Domain and hosting.** Register donafuego.co.za, create the Vercel project from this
    repo, set DNS. Plan the fuegotequila.co.za redirect and the shop subdomain.
11. **Email.** Resend API key, an audience ID and a verified sending domain. Then the
    welcome email.
12. **Checkers and Sixty60 marks.** Permission to show their logos (a Checkers logo folder
    exists in Drive) and the correct store-locator and Sixty60 links.
13. **Analytics.** Recommend Vercel Web Analytics or Plausible (no cookies, no banner).
    Name it in the privacy page when added.
14. **Final copy.** Drafts are in brand voice. Clarissa or Danielle sign off before launch.

## Later, once the above is in

- Curated list of top Checkers stores on `/find-us`.
- A "pouring this weekend" slot on the home page for events and tastings.
- Welcome email, then a replenishment nudge, through Resend.
- Giveaway mechanic and its terms page (18+, CPA-compliant), per the Brand Kit.
- Afrikaans copy where it fits better than English.
