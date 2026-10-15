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

/* Vercel env vars flatten newlines, so a pasted PEM arrives with literal \n. */
const normalisePrivateKey = (key) => String(key || '').replace(/\\n/g, '\n').trim();

function configured() {
  return Boolean(process.env.GOOGLE_SA_EMAIL && process.env.GOOGLE_SA_PRIVATE_KEY && process.env.FAN_FOLDER_ID);
}

async function getAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.expiresAt > now + 60) return cachedToken.token;
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = b64url(JSON.stringify({ iss: process.env.GOOGLE_SA_EMAIL, scope: SCOPE, aud: TOKEN_URL, exp: now + 3600, iat: now }));
  const signature = crypto.createSign('RSA-SHA256').update(header + '.' + claims)
    .sign(normalisePrivateKey(process.env.GOOGLE_SA_PRIVATE_KEY), 'base64')
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

module.exports = { configured, listFans, fetchFile, normalisePrivateKey };
