/* FlowState Consent (yourflowstate.de)
   Eigene Loesung, kein Drittanbieter-CMP. Vor der Einwilligung geht kein
   einziger Request an Google raus und es wird nichts fuer Tracking gespeichert.
   Der Consent-Mode-v2-Default (alles denied + wait_for_update) steht als
   Inline-Snippet ganz oben im <head> jeder Seite, also vor dieser Datei.
   Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO, Paragraf 25 Abs. 1 TDDDG. */
(function () {
  'use strict';

  var KEY     = 'fs_consent_v1';
  var GA_ID   = 'G-2WN885GWKQ';
  var PRIVACY = 'datenschutz.html';

  /* ---------- Speicher ---------- */
  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      var v = JSON.parse(raw);
      return (v && typeof v.analytics === 'boolean') ? v : null;
    } catch (e) { return null; }
  }
  function write(ok) {
    try {
      localStorage.setItem(KEY, JSON.stringify({ analytics: ok, ts: new Date().toISOString() }));
    } catch (e) {}
  }
  function clear() { try { localStorage.removeItem(KEY); } catch (e) {} }

  function gtag() { window.dataLayer = window.dataLayer || []; window.dataLayer.push(arguments); }

  /* ---------- GA4 erst nach Zustimmung ---------- */
  var loaded = false;
  function loadAnalytics() {
    gtag('consent', 'update', {
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    if (loaded) return;
    loaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', GA_ID);
  }

  function revokeAnalytics() {
    gtag('consent', 'update', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    /* Bereits gesetzte GA-Cookies dieser Domain wieder entfernen. */
    try {
      var host = location.hostname.replace(/^www\./, '');
      document.cookie.split(';').forEach(function (c) {
        var name = c.split('=')[0].trim();
        if (name.indexOf('_ga') !== 0 && name.indexOf('_gid') !== 0) return;
        document.cookie = name + '=; Max-Age=0; path=/';
        document.cookie = name + '=; Max-Age=0; path=/; domain=' + host;
        document.cookie = name + '=; Max-Age=0; path=/; domain=.' + host;
      });
    } catch (e) {}
  }

  /* ---------- Styles ---------- */
  var CSS = [
    '.fsc{position:fixed;left:0;right:0;bottom:0;z-index:9999;display:flex;justify-content:center;',
    'padding:clamp(.7rem,2vw,1.35rem);pointer-events:none;font-family:var(--f-body,system-ui,sans-serif)}',
    '.fsc-box{pointer-events:auto;width:min(720px,100%);background:var(--white,#fff);color:var(--ink,#1B2733);',
    'border:1px solid var(--line,#E2EAEA);border-radius:16px;padding:clamp(1.05rem,2.4vw,1.5rem);',
    'box-shadow:0 24px 60px -22px rgba(11,124,116,.42),0 2px 10px rgba(27,39,51,.08);',
    'animation:fsc-in .42s cubic-bezier(.16,1,.3,1) both}',
    '@keyframes fsc-in{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}',
    '@media (prefers-reduced-motion:reduce){.fsc-box{animation:none}}',
    '.fsc-box:focus{outline:none}',
    '.fsc-h{margin:0 0 .35rem;font-family:var(--f-display,inherit);font-size:1.06rem;font-weight:700;letter-spacing:-.01em}',
    '.fsc-p{margin:0 0 .95rem;font-size:.9rem;line-height:1.5;color:var(--ink-soft,#46566A)}',
    '.fsc-btns{display:flex;flex-wrap:wrap;gap:.6rem}',
    '.fsc-btn{flex:1 1 140px;min-height:48px;padding:.78rem .9rem;border:0;border-radius:11px;cursor:pointer;',
    'font-family:var(--f-ui,inherit);font-size:.955rem;font-weight:700;letter-spacing:.01em;color:#fff;',
    'transition:transform .18s ease,filter .18s ease}',
    '.fsc-btn:hover{transform:translateY(-1px);filter:brightness(1.08)}',
    '.fsc-btn:active{transform:none}',
    '.fsc-btn:focus-visible{outline:3px solid var(--accent,#F2871C);outline-offset:2px}',
    '.fsc-deny{background:var(--ink,#1B2733)}',
    '.fsc-ok{background:var(--blue-deep,#075E58)}',
    '.fsc-legal{display:inline-block;margin-top:.8rem;font-size:.83rem;color:var(--ink-mute,#5D6E82);',
    'text-decoration:underline;text-underline-offset:2px}',
    '.fsc-legal:focus-visible{outline:3px solid var(--accent,#F2871C);outline-offset:2px}',
    '@media (max-width:359px){.fsc-btn{flex:1 1 100%}}'
  ].join('');

  function injectCSS() {
    if (document.getElementById('fsc-css')) return;
    var st = document.createElement('style');
    st.id = 'fsc-css';
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  /* ---------- Banner ---------- */
  var banner = null, lastFocus = null, trapHandler = null, guardHandler = null;

  function focusables() {
    if (!banner) return [];
    return Array.prototype.slice.call(banner.querySelectorAll('button, [href]'));
  }

  function open() {
    if (banner) return;
    injectCSS();
    lastFocus = document.activeElement;

    banner = document.createElement('div');
    banner.className = 'fsc';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-modal', 'true');
    banner.setAttribute('aria-labelledby', 'fsc-h');
    banner.setAttribute('aria-describedby', 'fsc-p');
    banner.innerHTML =
      '<div class="fsc-box" tabindex="-1">' +
        '<h2 class="fsc-h" id="fsc-h">Dürfen wir mitzählen?</h2>' +
        '<p class="fsc-p" id="fsc-p">Mit Google Analytics würden wir gern messen, welche Seiten gelesen werden, ' +
          'um sie besser zu machen. Dafür wird ein Cookie gesetzt und eine gekürzte IP-Adresse an Google ' +
          'übertragen. Nur mit Ihrer Zustimmung, jederzeit widerrufbar über „Cookie-Einstellungen“ im Fußbereich.</p>' +
        '<div class="fsc-btns">' +
          '<button type="button" class="fsc-btn fsc-deny" data-fsc="deny">Nur notwendige</button>' +
          '<button type="button" class="fsc-btn fsc-ok" data-fsc="accept">Alle akzeptieren</button>' +
        '</div>' +
        '<a class="fsc-legal" href="' + PRIVACY + '">Mehr dazu in der Datenschutzerklärung</a>' +
      '</div>';

    document.body.appendChild(banner);

    banner.addEventListener('click', function (ev) {
      var el = ev.target;
      while (el && el !== banner && !el.getAttribute('data-fsc')) el = el.parentNode;
      if (!el || el === banner) return;
      decide(el.getAttribute('data-fsc') === 'accept');
    });

    /* Fokus-Falle: solange keine Entscheidung vorliegt, bleibt der Fokus im Dialog.
       Escape schliesst bewusst NICHT, sonst gaebe es keine Entscheidung. */
    trapHandler = function (ev) {
      if (ev.key === 'Escape' || ev.key === 'Esc') { ev.preventDefault(); ev.stopPropagation(); return; }
      if (ev.key !== 'Tab') return;
      var f = focusables();
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (!banner.contains(document.activeElement)) {
        ev.preventDefault(); first.focus({ preventScroll: true }); return;
      }
      if (ev.shiftKey && document.activeElement === first) {
        ev.preventDefault(); last.focus({ preventScroll: true });
      } else if (!ev.shiftKey && document.activeElement === last) {
        ev.preventDefault(); first.focus({ preventScroll: true });
      }
    };
    document.addEventListener('keydown', trapHandler, true);

    guardHandler = function (ev) {
      if (!banner) return;
      if (banner.contains(ev.target)) return;
      var f = focusables();
      if (f.length) f[0].focus({ preventScroll: true });
    };
    document.addEventListener('focusin', guardHandler, true);

    /* Fokus auf den Dialog selbst, nicht auf einen der beiden Buttons: sonst
       bekaeme "Nur notwendige" beim Oeffnen einen Fokusring und waere optisch
       hervorgehoben. Die Reihenfolge im Tab bleibt deny, dann accept. */
    var box = banner.firstChild;
    if (box && box.focus) box.focus({ preventScroll: true });
  }

  function close() {
    if (!banner) return;
    if (trapHandler) document.removeEventListener('keydown', trapHandler, true);
    if (guardHandler) document.removeEventListener('focusin', guardHandler, true);
    trapHandler = null;
    guardHandler = null;
    banner.parentNode.removeChild(banner);
    banner = null;
    if (lastFocus && typeof lastFocus.focus === 'function') {
      try { lastFocus.focus({ preventScroll: true }); } catch (e) {}
    }
    lastFocus = null;
  }

  function decide(ok) {
    write(ok);
    if (ok) loadAnalytics(); else revokeAnalytics();
    close();
  }

  /* ---------- Widerruf: genauso einfach wie die Erteilung ---------- */
  function reopen(ev) {
    if (ev) ev.preventDefault();
    clear();
    revokeAnalytics();
    open();
  }
  window.fsConsent = { open: reopen, reset: reopen };

  function wire() {
    var links = document.querySelectorAll('[data-cookie-settings]');
    for (var i = 0; i < links.length; i++) links[i].addEventListener('click', reopen);
    var saved = read();
    if (!saved) { open(); return; }
    if (saved.analytics) loadAnalytics();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wire);
  } else {
    wire();
  }
})();
