# donafuego.co.za

The Doña Fuego consumer site. Static, no build.

    node tools/dev-server.js        # serves site/ on http://localhost:4321 with cleanUrls
    node tools/check-pages.js       # lint: partials in sync, metadata, links, voice
    node tools/sync-partials.js     # push edits in site/_partials/ into every page
    FANS=demo node tools/dev-server.js   # fan wall filled with stand-in frames
    python3 tools/build-images.py /path/to/originals   # rebuild site/assets/shoot

- `site/` is what Vercel serves. `site/_partials/` holds the shared head, header, footer
  and age gate; every page carries a copy between `<!-- partial:x -->` markers.
- `api/subscribe.js` handles the sign-up and contact forms through Resend.
- `docs/SITE.md` is the plan, the page map and the list of what is still needed.
- `site/assets/shoot/` holds the web copies of the shoot frames; its README says how to add one.
- `api/fans.js` and `api/fan-image.js` run the fan wall from a Drive folder.

Read `CLAUDE.md` before changing copy or images.
