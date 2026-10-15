'use strict';
/* GET /api/fan-image?id=...: streams one approved fan photo.
   Only ids that are in the Fan Wall folder are served, so this can't be used
   to read anything else the service account can see. Cached for a day; when a
   photo is removed from the folder it drops off the wall within ten minutes
   and out of the cache within a day. */
const google = require('./_lib/google.js');

module.exports = async (req, res) => {
  const id = String((req.query && req.query.id) || '');
  if (!/^[A-Za-z0-9_-]{10,100}$/.test(id) || !google.configured()) return res.status(404).send('not found');
  try {
    const files = await google.listFans();
    if (!files.some((f) => f.id === id)) return res.status(404).send('not found');
    const file = await google.fetchFile(id);
    if (!/^image\//.test(file.type)) return res.status(404).send('not found');
    res.setHeader('Content-Type', file.type);
    res.setHeader('Cache-Control', 'public, s-maxage=86400, max-age=3600');
    return res.status(200).send(file.body);
  } catch (e) {
    console.error('fan-image', e.message);
    return res.status(502).send('unavailable');
  }
};
