# Analytics, Search Console and tracking

What is in the build, what has to be done in Google's and Vercel's dashboards, and
what each event means. `CLAUDE.md` has the rules; this file has the setup.

## What the site does

- **Google Analytics 4** loads from `site/_partials/head.html` once a Measurement ID is in
  it. It starts under Consent Mode with all storage denied, so it sets no cookies and
  counts page views and events without recognising a returning visitor. Google fills
  in user and session figures by modelling once the property has enough traffic.
  That keeps the privacy page true ("no tracking cookies") and needs no banner.
- **Vercel Web Analytics** loads from the same partial (`/_vercel/insights/script.js`).
  First party, no cookies, exact page views and referrers. It is the honest count;
  Google is where the Search Console link, the Ads link and the long history live.
- **Events** go out through `track()` in `site/assets/js/main.js` to both.
- **Search engines** get `site/sitemap.xml` (built by `node tools/build-sitemap.js`),
  `site/robots.txt`, a canonical on every page, Open Graph tags with the 1200×630
  image, `Organization` and `WebSite` schema on the home page, `Product` schema with
  Sixty60 offers on each can page, and breadcrumbs on the can pages. The age gate is
  an overlay, so crawlers read the full page behind it.

## Setup, once

### 1. Google Analytics

1. analytics.google.com, Admin, Create, Property. Name "Doña Fuego", time zone South
   Africa, currency ZAR. Business size small, objective "generate leads" (closest to
   "send people to Checkers").
2. Add a Web data stream for `https://donafuego.co.za`. Leave enhanced measurement on
   (scrolls, outbound clicks, file downloads come free).
3. Copy the Measurement ID (`G-` and ten characters). In `site/_partials/head.html`,
   paste it into the last line of the analytics script, where it reads `})('',false);`,
   so it reads `})('G-XXXXXXXXXX',false);`. Then:

       node tools/sync-partials.js && node tools/check-pages.js

   and push. The checker warns while the ID is empty and stops warning once it is set.
4. Admin, Data display, Events: mark `sixty60_click` and `form_submit` as key events.
   Those are the two things the site is for.
5. Admin, Data settings, Data retention: 14 months.
6. Admin, Product links, Search Console links: link the property once step 2 below is done.
7. Admin, Property access: add Danielle as Viewer.

The second argument of that script, `false`, is the cookie switch. Leave it. If the
business ever decides Google may set cookies (full user counts, remarketing audiences
for the Meta and Google ad work), change it to `true`, and in the same push rewrite the
"Site usage" and "Cookies" paragraphs on `/legal/privacy`, because they will no longer
be true. POPIA and the attorney's view on consent come first.

### 2. Google Search Console

1. search.google.com/search-console, Add property, **Domain** type, `donafuego.co.za`.
   The domain property covers http, https, www and the apex in one.
2. Google shows a TXT record (`google-site-verification=…`). DNS for the domain is at
   GoDaddy (nameservers ns47 and ns48 domaincontrol.com; Vercel does not run the zone).
   GoDaddy, My Products, DNS for donafuego.co.za, Add record: type TXT, name `@`,
   value as given, TTL default. Wait a few minutes, then Verify.
3. Sitemaps: submit `https://donafuego.co.za/sitemap.xml`.
4. URL inspection: paste the home page and request indexing. Do the same for `/cans`
   and `/find-us`. The rest follows from the sitemap.
5. Settings, Users and permissions: add Danielle. Link the property in Analytics (above).
6. Bing Webmaster Tools (bing.com/webmasters) can import the verified Search Console
   property in one click. Worth the minute: Bing feeds DuckDuckGo and Copilot.

The old Shopify site should keep running until the fuegotequila.co.za redirect is in.
When it is, 301 its pages to the matching pages here (`/collections/all` to `/tequila`,
the can listings to `/cans/<slug>`) and add fuegotequila.co.za as a second Search
Console domain property so the redirects can be watched.

### 3. Vercel Web Analytics

Vercel dashboard, project `donafuegosite`, Analytics tab, Enable. Nothing to deploy:
the script tag is already in every page and answers 404 until the switch is on. Custom
events (the `track()` calls) show there only on the Pro plan; page views and referrers
show on every plan.

Speed Insights (same place, Speed Insights tab) is worth switching on for the first
month to catch anything slow on real phones, then off again.

### 4. Links that point here

Every link to the site from somewhere Doña Fuego controls carries UTM tags, so the
traffic shows up by source instead of as "direct":

| Where | Link |
|---|---|
| Instagram bio | `https://donafuego.co.za/?utm_source=instagram&utm_medium=social&utm_campaign=bio` |
| Instagram stories and posts | `…?utm_source=instagram&utm_medium=social&utm_campaign=<post or event name>` |
| Email footer and the welcome email | `…?utm_source=email&utm_medium=email&utm_campaign=<email name>` |
| Can label QR code, posters, coasters | `https://donafuego.co.za/?utm_source=print&utm_medium=qr&utm_campaign=<where it is printed>` |
| Meta and Google ads | the ads project sets its own, keep `utm_source` as `meta` or `google` |

Links out to Checkers already carry `utm_source=donafuego` (`tools/shop.json`), so if
Checkers ever shares their referral numbers the site's share is visible.

## Events the site sends

Names and parameters, as sent by `track()` in `main.js`. All of them are counts.
Nothing carries a name, an email address or anything typed into a form.

| Event | When | Parameters |
|---|---|---|
| `page_view` | every page (Google's own) | path, title, referrer |
| `sixty60_click` | a link to checkers.co.za | `can` (slug or `search`), `pack` (`4-pack`, `Single`, `24-pack`, `search`), `link_url`, `link_text`, `page` |
| `shop_click` | a link to the Fuego Tequila bottle shop | `link_url`, `link_text`, `page` |
| `instagram_click` | a link to Instagram | `link_url`, `link_text`, `page` |
| `outbound_click` | any other off-site link (aware.org.za, the Information Regulator) | `link_url`, `link_text`, `page` |
| `age_gate` | an answer on the age gate | `answer`: `yes` or `no` |
| `form_submit` | the sign-up or contact form answered by the server | `kind` (`subscribe`, `contact`), `ok` (`yes`, `no`), `page` |
| `intro_skip` | Skip intro on the cold open | |
| `intro_replay` | "watch the intro again" | |
| `fan_wall_view` | the fan wall loaded real photos | `photos` (how many) |

Adding one: call `track('name', { param: value })` in `main.js`, add the row here, and
if it reveals anything new about a visitor, update `/legal/privacy` in the same push.

## What to look at each month

- Search Console, Performance: which queries bring people in. Expect "dona fuego",
  "fuego tequila cans", "tequila in a can south africa", "margarita in a can checkers".
  If a can page ranks for a query its title does not say, say it.
- Search Console, Pages: anything "Crawled, not indexed" or a 404 that is linked from
  somewhere.
- Analytics, Engagement, Events: `sixty60_click` by `can` and `pack` against page views
  of the can pages. That ratio is the site doing its job.
- Analytics, Acquisition: `utm_source` for which post, email or print run moved people.
- Vercel Analytics: the true page-view count, for when Google's modelled figure looks
  odd.
