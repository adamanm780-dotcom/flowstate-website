/* Flow State · Booking / Anfrage endpoint
   Vercel serverless function — receives the booking-modal form
   and sends a notification mail to flow-state@gmx.de.

   Mail provider: Resend (https://resend.com — free tier: 3.000 mails/Monat)
   Setup im Vercel-Dashboard:
     - RESEND_API_KEY        →  API-Key aus dem Resend-Dashboard
     - BOOKING_TO            →  optional, Empfänger (Default: flow-state@gmx.de)
     - BOOKING_FROM          →  optional, Absender. Default: "Flow State <onboarding@resend.dev>"
                                  (eigene Domain bei Resend verifizieren um Spam-Score zu senken)
*/

const ALLOWED_ORIGINS = new Set([
  'https://adamanm780-dotcom.github.io',
  'https://flowstate-website-zeta.vercel.app'
]);

function setCors(req, res) {
  const origin = req.headers.origin || '';
  if (ALLOWED_ORIGINS.has(origin) || /^https:\/\/[\w-]+\.vercel\.app$/.test(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');
}

function escapeHtml(s = '') {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || '').trim());
}

function clamp(s, n) {
  return String(s == null ? '' : s).slice(0, n);
}

export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = null; }
  }
  if (!body || typeof body !== 'object') {
    return res.status(400).json({ error: 'Ungültige Anfrage.' });
  }

  const data = {
    topic:   clamp(body.topic, 120) || 'Anfrage',
    name:    clamp(body.name, 120).trim(),
    email:   clamp(body.email, 160).trim(),
    company: clamp(body.company, 120).trim(),
    phone:   clamp(body.phone, 40).trim(),
    message: clamp(body.message, 2000).trim()
  };

  if (!data.name)            return res.status(400).json({ error: 'Bitte geben Sie Ihren Namen an.' });
  if (!isValidEmail(data.email)) return res.status(400).json({ error: 'Bitte geben Sie eine gültige E-Mail-Adresse an.' });

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const TO   = process.env.BOOKING_TO   || 'flow-state@gmx.de';
  const FROM = process.env.BOOKING_FROM || 'Flow State <onboarding@resend.dev>';

  if (!RESEND_API_KEY) {
    // Configuration is missing on the server — log so it's visible in Vercel logs.
    console.error('[book] RESEND_API_KEY is not configured.');
    return res.status(500).json({ error: 'Mail-Versand ist auf dem Server nicht konfiguriert.' });
  }

  const subject = `Neue Anfrage: ${data.topic} — ${data.name}`;

  const textBody =
`Neue Anfrage über die Flow-State-Website

Anliegen:   ${data.topic}
Name:       ${data.name}
E-Mail:     ${data.email}
Firma:      ${data.company || '—'}
Telefon:    ${data.phone || '—'}

Nachricht:
${data.message || '—'}

—
Eingegangen: ${new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' })}
`;

  const htmlBody = `
<!doctype html>
<html><body style="font-family:-apple-system,Segoe UI,Inter,sans-serif;background:#f4f6fb;padding:24px;color:#0a0f1c">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;padding:28px;box-shadow:0 4px 24px rgba(0,0,0,.06)">
    <div style="font-size:.75rem;letter-spacing:.18em;text-transform:uppercase;color:#22a3c8;font-weight:600;margin-bottom:6px">Neue Anfrage</div>
    <h1 style="margin:0 0 20px;font-size:1.4rem;color:#0a0f1c">${escapeHtml(data.topic)}</h1>
    <table style="width:100%;border-collapse:collapse;font-size:.95rem">
      <tr><td style="padding:8px 0;color:#6b7280;width:120px">Name</td><td style="padding:8px 0;font-weight:600">${escapeHtml(data.name)}</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280">E-Mail</td><td style="padding:8px 0"><a href="mailto:${escapeHtml(data.email)}" style="color:#0a64f0">${escapeHtml(data.email)}</a></td></tr>
      <tr><td style="padding:8px 0;color:#6b7280">Firma</td><td style="padding:8px 0">${escapeHtml(data.company) || '—'}</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280">Telefon</td><td style="padding:8px 0">${data.phone ? `<a href="tel:${escapeHtml(data.phone)}" style="color:#0a64f0">${escapeHtml(data.phone)}</a>` : '—'}</td></tr>
    </table>
    ${data.message ? `<div style="margin-top:20px;padding:16px;background:#f4f6fb;border-radius:10px;white-space:pre-wrap;font-size:.95rem;line-height:1.55">${escapeHtml(data.message)}</div>` : ''}
    <div style="margin-top:24px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:.8rem;color:#6b7280">
      Eingegangen am ${new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' })} via flowstate-website-zeta.vercel.app
    </div>
  </div>
</body></html>`;

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'authorization': `Bearer ${RESEND_API_KEY}`,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        reply_to: data.email,
        subject,
        text: textBody,
        html: htmlBody
      })
    });

    if (!r.ok) {
      const detail = await r.text().catch(() => '');
      console.error('[book] Resend error', r.status, detail.slice(0, 500));
      return res.status(502).json({ error: 'Mail-Provider hat den Versand abgelehnt.' });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('[book] fetch failed', e);
    return res.status(502).json({ error: 'Verbindung zum Mail-Provider fehlgeschlagen.' });
  }
}
