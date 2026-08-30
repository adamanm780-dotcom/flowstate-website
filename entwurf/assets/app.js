/* FlowState — Entwurf v3
   Progressive Enhancement: ohne JS bleibt alles sichtbar und bedienbar. */
document.documentElement.classList.add('js');

var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------------------------------------------------------
   1. Icons vorbereiten: Strichlaenge direkt als Inline-Style.
   (Der Umweg ueber eine CSS-Variable war unzuverlaessig.)
   --------------------------------------------------------------- */
function prepIcons(){
  if(reduced) return;
  document.querySelectorAll('.ico').forEach(function(svg){
    svg.querySelectorAll('path,circle,rect,line,polyline,polygon,ellipse').forEach(function(el){
      var len = 0;
      try { len = el.getTotalLength(); } catch(e){ len = 0; }
      if(!len || !isFinite(len) || len < 1) len = 160;
      len = Math.ceil(len) + 2;
      el.style.strokeDasharray  = len + '';
      el.style.strokeDashoffset = len + '';
    });
  });
}
prepIcons();

/* ---------------------------------------------------------------
   2. Reveals + Icon-Zeichnen ausloesen
   --------------------------------------------------------------- */
(function(){
  var els = document.querySelectorAll('.rv, .divider');

  function activate(el){
    el.classList.add('in');
    el.querySelectorAll('.ico').forEach(function(i){ i.classList.add('drawn'); });
    if(el.classList && el.classList.contains('ico')) el.classList.add('drawn');
  }

  if(!('IntersectionObserver' in window)){
    els.forEach(activate);
    document.querySelectorAll('.ico').forEach(function(i){ i.classList.add('drawn'); });
    return;
  }
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){ activate(e.target); io.unobserve(e.target); }
    });
  }, { rootMargin:'0px 0px -8% 0px', threshold:0.12 });
  els.forEach(function(el){ io.observe(el); });

  /* Icons, die in keinem .rv stecken, separat beobachten */
  var io2 = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){ e.target.classList.add('drawn'); io2.unobserve(e.target); }
    });
  }, { threshold:0.3 });
  document.querySelectorAll('.ico').forEach(function(i){
    if(!i.closest('.rv')) io2.observe(i);
  });
})();

/* ---------------------------------------------------------------
   3. Scroll-Engine: Fortschrittsbalken + Parallax, ein rAF-Loop
   --------------------------------------------------------------- */
(function(){
  if(reduced) return;

  var bar   = document.querySelector('.progress');
  var items = [];
  document.querySelectorAll('[data-parallax]').forEach(function(el){
    items.push({
      el: el,
      amount: parseFloat(el.getAttribute('data-parallax')) || 0,
      zoom:   parseFloat(el.getAttribute('data-zoom')) || 0,
      rect: null
    });
  });

  var ticking = false, vh = window.innerHeight;

  function measure(){
    vh = window.innerHeight;
    items.forEach(function(it){
      var r = it.el.getBoundingClientRect();
      it.rect = { top: r.top + window.scrollY, height: r.height };
    });
  }

  function frame(){
    ticking = false;
    var y = window.scrollY;

    if(bar){
      var max = document.documentElement.scrollHeight - vh;
      bar.style.setProperty('--p', max > 0 ? Math.min(1, y / max) : 0);
    }

    for(var i = 0; i < items.length; i++){
      var it = items[i];
      if(!it.rect) continue;
      var center = it.rect.top + it.rect.height / 2 - y;
      if(center < -it.rect.height || center > vh + it.rect.height) continue;  /* Culling */
      var prog = (center - vh / 2) / (vh / 2 + it.rect.height / 2);           /* -1 .. 1 */
      prog = Math.max(-1, Math.min(1, prog));
      it.el.style.setProperty('--py', (-prog * it.amount).toFixed(1) + 'px');
      if(it.zoom){
        it.el.style.setProperty('--ps', (1 + it.zoom * (1 - Math.abs(prog))).toFixed(4));
      }
    }
  }

  function onScroll(){
    if(!ticking){ ticking = true; requestAnimationFrame(frame); }
  }

  measure(); frame();
  window.addEventListener('scroll', onScroll, { passive:true });
  window.addEventListener('resize', function(){ measure(); onScroll(); }, { passive:true });
  window.addEventListener('load', function(){ measure(); onScroll(); });
})();

/* ---------------------------------------------------------------
   4. Typewriter im Hero
   --------------------------------------------------------------- */
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

/* ---------------------------------------------------------------
   5. Angebot-Popup
   --------------------------------------------------------------- */
(function(){
  var dlg = document.getElementById('angebot');
  if(!dlg) return;
  var last = null;

  function open(e){
    if(e) e.preventDefault();
    last = document.activeElement;
    if(typeof dlg.showModal === 'function') dlg.showModal();
    else dlg.setAttribute('open','');
    var f = dlg.querySelector('.modal-x');
    if(f) f.focus();
  }
  function close(){
    if(typeof dlg.close === 'function') dlg.close();
    else dlg.removeAttribute('open');
    if(last && last.focus) last.focus();
  }

  document.querySelectorAll('[data-open-angebot]').forEach(function(b){
    b.addEventListener('click', open);
  });
  dlg.querySelectorAll('[data-close-angebot]').forEach(function(b){
    b.addEventListener('click', close);
  });
  dlg.addEventListener('click', function(e){ if(e.target === dlg) close(); });
})();

/* ---------------------------------------------------------------
   6. Karte erst nach Einwilligung laden (DSGVO)
   --------------------------------------------------------------- */
(function(){
  var box = document.querySelector('.mapbox');
  if(!box) return;
  var btn = box.querySelector('[data-load-map]');
  if(!btn) return;

  btn.addEventListener('click', function(){
    var src = box.getAttribute('data-map-src');
    if(!src) return;
    var f = document.createElement('iframe');
    f.src = src;
    f.loading = 'lazy';
    f.title = 'Karte mit unserem Standort';
    f.referrerPolicy = 'no-referrer-when-downgrade';
    f.setAttribute('allowfullscreen','');
    box.innerHTML = '';
    box.appendChild(f);
  });
})();

/* ---------------------------------------------------------------
   7. Formular: Spamschutz ohne Captcha
   --------------------------------------------------------------- */
(function(){
  var form = document.getElementById('kontaktformular');
  if(!form) return;
  var start = form.querySelector('[name="formStart"]');
  if(start) start.value = String(Date.now());

  form.addEventListener('submit', function(e){
    var hp = form.querySelector('[name="company"]');
    if(hp && hp.value){ e.preventDefault(); return; }
    if(start){
      var elapsed = Date.now() - parseInt(start.value || '0', 10);
      if(elapsed < 2500){ e.preventDefault(); }
    }
  });
})();
