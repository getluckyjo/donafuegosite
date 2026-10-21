'use strict';
/* Minimal read-only Google Drive client for the fan wall.
   Same approach as donafuego-dashboard/api/_lib/sheets.js: a service-account
   JWT signed with node's own crypto, no googleapis dependency. */
const crypto = require('crypto');

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SCOPE = 'https://www.googleapis.com/auth/drive.readonly';
const DRIVE = 'https://www.googleapis.com/drive/v3';
let cachedToken = null;   // survives while a warm lambda is reused

const b64url = (input) => Buffer.from(input).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

/* The key arrives however it was pasted into Vercel: a PEM with real newlines,
   a PEM with literal \n, either of those wrapped in quotes, the bare base64
   body, or the whole JSON key file. All of them become a usable PEM. */
function normalisePrivateKey(raw) {
  let key = String(raw || '').trim();
  if (key.startsWith('{')) {
    try { key = String(JSON.parse(key).private_key || ''); } catch (e) { /* not JSON after all */ }
  }
  key = key.replace(/^["']+|["']+$/g, '').replace(/\\n/g, '\n').trim();
  if (!/-----BEGIN/.test(key)) {
    const body = key.replace(/\s+/g, '');
    key = '-----BEGIN PRIVATE KEY-----\n' + body.replace(/(.{64})/g, '$1\n').trim() + '\n-----END PRIVATE KEY-----';
  }
  return key;
}

/* Service-account email and key. GOOGLE_SA_EMAIL may be left out when
   GOOGLE_SA_PRIVATE_KEY holds the whole JSON key file. */
function credentials() {
  const raw = String(process.env.GOOGLE_SA_PRIVATE_KEY || '').trim();
  let json = null;
  if (raw.startsWith('{')) { try { json = JSON.parse(raw); } catch (e) { json = null; } }
  return {
    email: String(process.env.GOOGLE_SA_EMAIL || (json && json.client_email) || '').trim(),
    key: raw ? normalisePrivateKey(json ? json.private_key : raw) : '',
  };
}

function configured() {
  const c = credentials();
  return Boolean(c.email && c.key && process.env.FAN_FOLDER_ID);
}

async function getAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.expiresAt > now + 60) return cachedToken.token;
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const c = credentials();
  const claims = b64url(JSON.stringify({ iss: c.email, scope: SCOPE, aud: TOKEN_URL, exp: now + 3600, iat: now }));
  const signature = crypto.createSign('RSA-SHA256').update(header + '.' + claims)
    .sign(c.key, 'base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: header + '.' + claims + '.' + signature }),
  });
  if (!res.ok) throw new Error('Google token exchange failed (' + res.status + ')');
  const json = await res.json();
  cachedToken = { token: json.access_token, expiresAt: now + (json.expires_in || 3600) };
  return cachedToken.token;
}

/* Images in the approved folder, newest first. */
async function listFans() {
  const token = await getAccessToken();
  const q = `'${process.env.FAN_FOLDER_ID}' in parents and trashed = false and mimeType contains 'image/'`;
  const url = DRIVE + '/files?' + new URLSearchParams({
    q, orderBy: 'createdTime desc', pageSize: '60', supportsAllDrives: 'true', includeItemsFromAllDrives: 'true',
    fields: 'files(id,name,description,imageMediaMetadata(width,height,rotation))',
  });
  const res = await fetch(url, { headers: { Authorization: 'Bearer ' + token } });
  if (!res.ok) throw new Error('Drive list failed (' + res.status + ')');
  return (await res.json()).files || [];
}

/* The bytes of one file. */
async function fetchFile(id) {
  const token = await getAccessToken();
  const res = await fetch(DRIVE + '/files/' + encodeURIComponent(id) + '?alt=media&supportsAllDrives=true', { headers: { Authorization: 'Bearer ' + token } });
  if (!res.ok) throw new Error('Drive download failed (' + res.status + ')');
  return { type: res.headers.get('content-type') || 'image/jpeg', body: Buffer.from(await res.arrayBuffer()) };
}

module.exports = { configured, credentials, listFans, fetchFile, normalisePrivateKey };
