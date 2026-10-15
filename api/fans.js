'use strict';
/* GET /api/fans: the approved fan photos, newest first.
   Danielle drops a photo into the Fan Wall folder on Drive once the fan has
   said yes and is clearly an adult. The credit is the file's Drive
   description, or the filename when it starts with "@". Without the env vars
   this returns an empty list and the page shows its "this could be you" card. */
const google = require('./_lib/google.js');

function credit(file) {
  const d = String(file.description || '').trim();
  if (d) return d.split('\n')[0].slice(0, 60);
  const n = String(file.name || '').replace(/\.[a-z0-9]+$/i, '');
  return n.startsWith('@') ? n.split(/[\s_]/)[0].slice(0, 40) : 'A Doña Fuego fan';
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=3600');
  if (!google.configured()) return res.status(200).json({ fans: [], configured: false });
  try {
    const files = await google.listFans();
    const fans = files.map((f) => {
      const m = f.imageMediaMetadata || {};
      const turned = m.rotation === 1 || m.rotation === 3;
      return { id: f.id, credit: credit(f), src: '/api/fan-image?id=' + encodeURIComponent(f.id),
        w: turned ? m.height : m.width, h: turned ? m.width : m.height };
    });
    return res.status(200).json({ fans });
  } catch (e) {
    console.error('fans', e.message);
    return res.status(200).json({ fans: [], error: true });
  }
};
