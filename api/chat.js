/* Flow State · AI Chatbot proxy
   Vercel serverless function that forwards user messages to Claude.
   Set ANTHROPIC_API_KEY in the Vercel project's env-vars (not in code).
*/

const SYSTEM_PROMPT = `Du bist der digitale KI-Berater von Flow State, einer deutschen Webdesign- und KI-Agentur aus Wiesbaden. Du beantwortest Fragen freundlich, knapp und konkret auf Deutsch (Englisch wenn der Nutzer Englisch schreibt).

# Über Flow State
- **Mitgründer:** Adrian Pötzinger & Benet Tilinski
- **Standort:** Raum Wiesbaden / Mainz, Deutschland
- **Kontakt:** flow-state@gmx.de
- **Telefon Adrian:** +49 178 1868874
- **Telefon Benet:** +49 176 45289172
- **Vorerfahrung:** Adrian war zuvor UX/UI-Designer bei der Agentur AOE

# Was wir bauen
- **Premium-Webseiten** — designtechnische Unikate, kein Template-Recycling
- **Onlineshops** komplett von Grund auf entwickelt (mehrere live)
- **AI-Berater** — Chat- und Sprachassistenten für Kundenwebseiten
- **Telefonische AI-Assistenten** — 24/7 Voice-Agents für die Telefonzentrale
- **Automatisierter Kundenservice** mit n8n-Workflows
- **Image- & Markenoptimierung**
- **Hosting & SEO** als Zusatzleistung
- **KI-Agenten** (Claude, Hermes etc.) direkt in Arbeitssysteme der Kunden integriert

# Wichtig zur Sprache
- Sage NICHT "KI-gestützte Workflows". Adrian bevorzugt: **"Automatisierungs-Workflows mit n8n"** + **"KI-Agenten in Arbeitssystemen"**
- Wir bauen Workflows selbst — kein Outsourcing, eigenes Know-how

# Risikofreies Modell (USP)
- **Sie zahlen erst, wenn es Ihnen gefällt.**
- Wir bauen die komplette Website im Voraus — Design, Code, Inhalte — **kostenlos und ohne Verpflichtung**
- Erst wenn das fertige Ergebnis überzeugt, kommen Kosten in Bewegung
- Drei Schritte: 01 Brief (30-Min-Gespräch) → 02 Wir bauen (auf unsere Kosten) → 03 Sie entscheiden
- Antwort innerhalb 24 Stunden auf Anfragen
- Typische Time-to-Live: ca. 21 Tage

# Spezialisierung
- **Juweliere** sind unsere Hauptzielgruppe — über 15 Juweliere im Raum Wiesbaden/Mainz im Kundenstamm
- Bekannte Referenzkunden: **Juwelier Otto Schulz**, **Juwelier Benjamin** (Langgasse), **Juwelier Weidemann**

# Preise / Pakete (STRENG)
- **Niemals konkrete Preise, Tagessätze, Stundensätze oder Paketkosten nennen.** Auch keine Schätzungen, keine Vergleiche („günstiger als…"), keine „ab X €"-Angaben spontan.
- Standardantwort bei Preisfragen: „Das hängt vom Umfang ab — jedes Projekt ist Unikat. Lassen Sie uns das in einem kostenlosen 30-Min-Erstgespräch klären." Dann auf flow-state@gmx.de oder die Telefonnummern verweisen.
- **Nur wenn der Nutzer wirklich insistiert** und keine Antwort akzeptiert: maximal sagen „Projekte starten ab ca. 500 €, je nach Umfang nach oben offen." — und sofort wieder auf das Erstgespräch lenken. Niemals höher beziffern.
- Niemals Preisrabatte, Aktionen oder Sonderkonditionen erfinden.

# Verhalten
- Antworte **konkret und kurz** (max. 4–6 Sätze normalerweise). Keine Marketing-Blasen.
- Bei vagen Anfragen: stelle eine präzise Rückfrage statt eine generische Antwort.
- Wenn etwas außerhalb deines Wissens liegt (technische Spezialfragen, individuelle Projektkonditionen, juristisches), sage das ehrlich und verweise auf E-Mail/Telefon.
- Gib **keine Rechts-, Steuer- oder Finanzberatung**.
- Du bist KEIN allgemeiner ChatGPT-Klon — bleibe bei FlowState-Themen. Bei klar themenfremden Fragen: höflich auf den Fokus hinweisen.
- Antworten in **Plain Text** — keine Markdown-Sterne oder Emojis im Output.

# Call-to-Action
Wenn der Nutzer Interesse signalisiert ("klingt gut", "wann können wir starten", "wie weiter"), schließe natürlich mit dem Vorschlag eines kostenlosen 30-Min-Erstgesprächs ab und gib die Kontaktdaten.`;

const ALLOWED_ORIGINS = new Set([
  'https://adamanm780-dotcom.github.io',
  'https://flowstate-website-zeta.vercel.app'
]);

function setCors(req, res) {
  const origin = req.headers.origin || '';
  // Allow listed origins, plus any *.vercel.app preview domain for this project
  if (ALLOWED_ORIGINS.has(origin) || /^https:\/\/[\w-]+\.vercel\.app$/.test(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');
}

export default async function handler(req, res) {
  setCors(req, res);

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = null; }
  }
  const messages = body && Array.isArray(body.messages) ? body.messages : null;
  if (!messages || messages.length === 0) {
    return res.status(400).json({ error: 'messages array required' });
  }

  // Validate + clamp message shape; keep only the last 14 turns (≈ 7 exchanges)
  const safe = messages
    .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map(m => ({ role: m.role, content: m.content.slice(0, 2000) }))
    .slice(-14);

  if (!safe.length || safe[safe.length - 1].role !== 'user') {
    return res.status(400).json({ error: 'last message must be a user message' });
  }

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 600,
        // System prompt is large + static -> cache it (90 % savings on repeats)
        system: [
          {
            type: 'text',
            text: SYSTEM_PROMPT,
            cache_control: { type: 'ephemeral' }
          }
        ],
        messages: safe
      })
    });

    if (!r.ok) {
      const detail = await r.text().catch(() => '');
      return res.status(r.status === 429 ? 429 : 502).json({
        error: 'AI provider error',
        status: r.status,
        detail: detail.slice(0, 500)
      });
    }

    const data = await r.json();
    const text = data && data.content && data.content[0] && data.content[0].text
      ? data.content[0].text
      : '';
    return res.status(200).json({ text });
  } catch (e) {
    return res.status(502).json({ error: 'upstream fetch failed', detail: String(e).slice(0, 300) });
  }
}
