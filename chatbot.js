/* Flow State · AI Chatbot widget
   - Sends messages to /api/chat (Vercel serverless function)
   - Maintains in-memory conversation history (not persisted)
   - Shows typing indicator while waiting for the assistant
*/
(() => {
  const root = document.getElementById('chatbot');
  if (!root) return;

  const toggle      = root.querySelector('.chatbot-toggle');
  const closeBtn    = root.querySelector('.chatbot-close');
  const panel       = root.querySelector('.chatbot-panel');
  const log         = root.querySelector('.chatbot-log');
  const form        = root.querySelector('.chatbot-input');
  const textarea    = form.querySelector('textarea');
  const sendBtn     = form.querySelector('button');
  const suggestions = root.querySelector('.chatbot-suggestions');

  // API endpoint — relative to current host. On Vercel this resolves to
  // the serverless function in /api/chat.js. On GitHub Pages it 404s and
  // we surface a friendly error.
  const API_URL = '/api/chat';

  // In-memory conversation history (system prompt is injected server-side)
  const history = [];

  // Welcome message — shown once on first open
  const WELCOME = 'Hi! Ich bin der KI-Berater von Flow State. Frag mich alles zu unseren Webdesign- und KI-Leistungen, Preisen, dem Risikofreien Modell, oder wie wir mit Juwelieren arbeiten.';

  let opened = false;

  /* ---- Mobile: duck the bubble away from primary section CTAs ---- */
  const isMobile = () => matchMedia('(max-width: 880px)').matches;
  const duckTargets = [
    '.rf-foot',
    '.contact-cta-row',
  ];
  const targets = duckTargets
    .flatMap(sel => Array.from(document.querySelectorAll(sel)))
    .filter(Boolean);
  if (targets.length && 'IntersectionObserver' in window) {
    const seen = new Set();
    const updateDuck = () => {
      if (!isMobile()) { root.classList.remove('is-ducked'); return; }
      root.classList.toggle('is-ducked', seen.size > 0);
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { e.isIntersecting ? seen.add(e.target) : seen.delete(e.target); });
      updateDuck();
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.4 });
    targets.forEach(t => io.observe(t));
    window.addEventListener('resize', updateDuck);
  }

  /* ---- Open / close ---- */
  function open() {
    if (opened) return;
    opened = true;
    root.classList.remove('is-closed');
    root.classList.add('is-open');
    root.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    if (!log.children.length) addBotMessage(WELCOME);
    setTimeout(() => textarea.focus(), 250);
  }
  function close() {
    opened = false;
    root.classList.remove('is-open');
    root.classList.add('is-closed');
    root.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
  }
  toggle.addEventListener('click', () => (opened ? close() : open()));
  closeBtn.addEventListener('click', close);

  /* ---- Render messages ---- */
  function addBotMessage(text) {
    const div = document.createElement('div');
    div.className = 'chatbot-msg bot';
    div.textContent = text;
    log.appendChild(div);
    scrollToBottom();
  }
  function addUserMessage(text) {
    const div = document.createElement('div');
    div.className = 'chatbot-msg user';
    div.textContent = text;
    log.appendChild(div);
    scrollToBottom();
  }
  function addErrorMessage(text) {
    const div = document.createElement('div');
    div.className = 'chatbot-msg error';
    div.textContent = text;
    log.appendChild(div);
    scrollToBottom();
  }
  function showTyping() {
    const div = document.createElement('div');
    div.className = 'chatbot-typing';
    div.innerHTML = '<span></span><span></span><span></span>';
    div.dataset.typing = '1';
    log.appendChild(div);
    scrollToBottom();
    return div;
  }
  function scrollToBottom() {
    log.scrollTop = log.scrollHeight;
  }

  /* ---- Send message ---- */
  async function send(message) {
    const trimmed = message.trim();
    if (!trimmed) return;

    // Hide suggestions after first message
    suggestions.style.display = 'none';

    addUserMessage(trimmed);
    history.push({ role: 'user', content: trimmed });

    sendBtn.disabled = true;
    textarea.disabled = true;
    const typingEl = showTyping();

    try {
      const r = await fetch(API_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: history })
      });

      typingEl.remove();

      if (!r.ok) {
        let msg = 'Ich kann Sie gerade nicht erreichen. Schreiben Sie uns: flow-state@gmx.de oder rufen Sie an: +49 178 1868874.';
        if (r.status === 404) {
          msg = 'Der KI-Service ist auf dieser Domain nicht aktiv. Schreiben Sie uns gerne: flow-state@gmx.de · +49 178 1868874.';
        } else if (r.status === 429) {
          msg = 'Gerade viele Anfragen — bitte einen Moment Geduld. Bei dringenden Themen: flow-state@gmx.de · +49 178 1868874.';
        }
        addErrorMessage(msg);
        return;
      }

      const data = await r.json();
      const text = (data && data.text) ? data.text : '';
      if (!text) {
        addErrorMessage('Keine Antwort erhalten. Bitte später nochmal versuchen — oder direkt Kontakt aufnehmen: flow-state@gmx.de');
        return;
      }
      addBotMessage(text);
      history.push({ role: 'assistant', content: text });
    } catch (e) {
      typingEl.remove();
      addErrorMessage('Verbindungsfehler. Bitte später nochmal versuchen — oder direkt: flow-state@gmx.de · +49 178 1868874.');
    } finally {
      sendBtn.disabled = false;
      textarea.disabled = false;
      textarea.value = '';
      textarea.style.height = 'auto';
      textarea.focus();
    }
  }

  /* ---- Form submit ---- */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    send(textarea.value);
  });

  /* ---- Enter to send, Shift+Enter for newline ---- */
  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(textarea.value);
    }
  });

  /* ---- Auto-grow textarea ---- */
  textarea.addEventListener('input', () => {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  });

  /* ---- Suggestion chips ---- */
  suggestions.addEventListener('click', (e) => {
    const btn = e.target.closest('.chatbot-suggestion');
    if (!btn) return;
    send(btn.dataset.q || btn.textContent);
  });
})();
