'use strict';
/* Email capture and contact form. POST JSON { kind, email, name?, message? }.
   kind "subscribe": adds the address to the Resend audience.
   kind "contact":   emails the message to CONTACT_TO through Resend.
   With no RESEND_API_KEY set it answers politely and logs, so the forms work
   on previews before the account is wired up.
   Env: RESEND_API_KEY, RESEND_AUDIENCE_ID, CONTACT_TO, CONTACT_FROM */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

async function resend(pathname, payload, key) {
  const r = await fetch('https://api.resend.com' + pathname, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(body.message || ('Resend ' + r.status));
  return body;
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ ok: false, message: 'POST only.' });

  const b = typeof req.body === 'object' && req.body ? req.body : {};
  if (b.website) return res.status(200).json({ ok: true, message: 'Thanks.' });   // honeypot
  const email = String(b.email || '').trim().toLowerCase();
  if (!EMAIL.test(email)) return res.status(400).json({ ok: false, message: 'That email address does not look right.' });
  const kind = b.kind === 'contact' ? 'contact' : 'subscribe';
  const name = String(b.name || '').trim().slice(0, 120);
  const message = String(b.message || '').trim().slice(0, 4000);
  if (kind === 'contact' && !message) return res.status(400).json({ ok: false, message: 'Tell us what it is about.' });

  const key = String(process.env.RESEND_API_KEY || '').trim().replace(/^["']+|["']+$/g, '');
  if (!key) {
    console.log('subscribe (stub mode):', JSON.stringify({ kind, email, name, page: b.page }));
    return res.status(200).json({ ok: true, stub: true, message: kind === 'contact' ? 'Got it. We will come back to you.' : 'You are on the list.' });
  }

  try {
    if (kind === 'subscribe') {
      const audience = process.env.RESEND_AUDIENCE_ID;
      if (!audience) throw new Error('RESEND_AUDIENCE_ID not set');
      await resend('/audiences/' + audience + '/contacts', { email, first_name: name || undefined, unsubscribed: false });
      return res.status(200).json({ ok: true, message: 'You are on the list.' });
    }
    await resend('/emails', {
      from: process.env.CONTACT_FROM || 'Doña Fuego site <site@donafuego.co.za>',
      to: [process.env.CONTACT_TO || 'sales@dona.co.za'],
      reply_to: email,
      subject: '[donafuego.co.za] ' + (b.topic || 'Contact') + ' from ' + (name || email),
      text: `From: ${name || '-'} <${email}>\nTopic: ${b.topic || '-'}\nPage: ${b.page || '-'}\n\n${message}`,
    });
    return res.status(200).json({ ok: true, message: 'Got it. We will come back to you.' });
  } catch (e) {
    console.error('subscribe error', e.message);
    return res.status(502).json({ ok: false, message: 'That did not go through. Email us instead.' });
  }
};
