/* FlowState — Entwurf. Progressive Enhancement:
   Ohne JS bleibt jeder Inhalt sichtbar und bedienbar. */
document.documentElement.classList.add('js');

var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* --- Strichlaengen fuer die Icon-Zeichenanimation ------------ */
(function(){
  document.querySelectorAll('.ico').forEach(function(svg){
    svg.querySelectorAll('path,circle,rect,line,polyline').forEach(function(el){
      var len = 0;
      try { len = el.getTotalLength(); } catch(e){ len = 140; }
      if(!len || !isFinite(len)) len = 140;
      el.style.setProperty('--len', Math.ceil(len));
    });
  });
})();

/* --- Reveals ------------------------------------------------- */
(function(){
  var els = document.querySelectorAll('.rv, .divider');
  if(!('IntersectionObserver' in window)){
    els.forEach(function(el){ el.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { rootMargin:'0px 0px -8% 0px', threshold:0.12 });
  els.forEach(function(el){ io.observe(el); });
})();

/* --- Typewriter im Hero -------------------------------------- */
(function(){
  var el = document.getElementById('tw');
  if(!el) return;
  var words = (el.getAttribute('data-words') || '').split('|').filter(Boolean);
  if(!words.length) return;

  if(reduced){ el.textContent = words[0]; el.classList.add('blink'); return; }

  var wi = 0, ci = words[0].length, deleting = false;
  el.textContent = words[0];

  function tick(){
    var word = words[wi];
    if(!deleting){
      ci++;
      if(ci >= word.length){
        ci = word.length; deleting = true;
        el.textContent = word; el.classList.add('blink');
        setTimeout(tick, 1900); return;
      }
    } else {
      ci--;
      if(ci <= 0){ ci = 0; deleting = false; wi = (wi + 1) % words.length; }
    }
    el.classList.remove('blink');
    el.textContent = word.slice(0, ci);
    setTimeout(tick, deleting ? 42 : 82);
  }
  setTimeout(tick, 2200);
})();

/* --- Angebot-Popup ------------------------------------------- */
(function(){
  var dlg = document.getElementById('angebot');
  if(!dlg) return;
  var openers = document.querySelectorAll('[data-open-angebot]');
  var last = null;

  function open(e){
    if(e) e.preventDefault();
    last = document.activeElement;
    if(typeof dlg.showModal === 'function'){ dlg.showModal(); }
    else { dlg.setAttribute('open',''); }          /* Fallback ohne <dialog> */
    var f = dlg.querySelector('.modal-x');
    if(f) f.focus();
  }
  function close(){
    if(typeof dlg.close === 'function'){ dlg.close(); }
    else { dlg.removeAttribute('open'); }
    if(last && last.focus) last.focus();
  }

  openers.forEach(function(b){ b.addEventListener('click', open); });
  dlg.querySelectorAll('[data-close-angebot]').forEach(function(b){
    b.addEventListener('click', close);
  });
  /* Klick auf den Hintergrund schliesst */
  dlg.addEventListener('click', function(e){ if(e.target === dlg) close(); });
})();

/* --- Formular: einfacher Spamschutz -------------------------- */
(function(){
  var form = document.getElementById('kontaktformular');
  if(!form) return;
  var start = form.querySelector('[name="formStart"]');
  if(start) start.value = String(Date.now());

  form.addEventListener('submit', function(e){
    var hp = form.querySelector('[name="company"]');
    if(hp && hp.value){ e.preventDefault(); return; }        /* Honeypot gefuellt = Bot */
    if(start){
      var elapsed = Date.now() - parseInt(start.value || '0', 10);
      if(elapsed < 2500){ e.preventDefault(); }              /* zu schnell = Bot */
    }
  });
})();
