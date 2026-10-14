# donafuego.co.za

The Doña Fuego consumer site. Static, no build.

    node tools/dev-server.js        # serves site/ on http://localhost:4321 with cleanUrls
    node tools/check-pages.js       # lint: partials in sync, metadata, links, voice
    node tools/sync-partials.js     # push edits in site/_partials/ into every page

- `site/` is what Vercel serves. `site/_partials/` holds the shared head, header, footer
  and age gate; every page carries a copy between `<!-- partial:x -->` markers.
- `api/subscribe.js` handles the sign-up and contact forms through Resend.
- `docs/SITE.md` is the plan, the page map and the list of what is still needed.
- `site/assets/img/README.md` maps each placeholder image to the shoot frame that replaces it.

Read `CLAUDE.md` before changing copy or images.
