/* FlowState — v4. Progressive Enhancement: ohne JS bleibt alles lesbar. */
document.documentElement.classList.add('js');

var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var finePointer = window.matchMedia('(pointer: fine)').matches;

/* ---------------------------------------------------------------
   1. Headlines in Woerter zerlegen (data-split)
   --------------------------------------------------------------- */
(function(){
  var els = Array.prototype.slice.call(document.querySelectorAll('[data-split]'));
  var idle = window.requestIdleCallback || function(f){ setTimeout(f, 1); };
  function splitOne(el){
    if(el.querySelector('.w')) return;
    var parts = [];
    el.childNodes.forEach(function(node){
      if(node.nodeType === 3){
        node.textContent.split(/(\s+)/).forEach(function(t){
          if(!t) return;
          if(/^\s+$/.test(t)){ parts.push(document.createTextNode(' ')); return; }
          var w = document.createElement('span'); w.className = 'w';
          var wi = document.createElement('span'); wi.className = 'wi'; wi.textContent = t;
          w.appendChild(wi); parts.push(w);
        });
      } else { parts.push(node.cloneNode(true)); }
    });
    el.innerHTML = '';
    var d = 0;
    parts.forEach(function(p){
      if(p.classList && p.classList.contains('w')){
        p.querySelector('.wi').style.setProperty('--wd', d++);
      }
      el.appendChild(p);
    });
  }
  (function chunk(){
    var t0 = performance.now();
    while(els.length && performance.now() - t0 < 8){ splitOne(els.shift()); }
    if(els.length) idle(chunk);
  })();
})();

/* ---------------------------------------------------------------
   2. Icons: Strichlaengen setzen (fuer Draw-Animation)
   --------------------------------------------------------------- */
(function(){
  if(reduced) return;
  var parts = [];
  document.querySelectorAll('.ico').forEach(function(svg){
    svg.querySelectorAll('path,circle,rect,line,polyline,polygon,ellipse').forEach(function(el){
      parts.push(el);
    });
  });
  /* Phase 1: nur LESEN (ein Layout fuer alle) */
  var lens = parts.map(function(el){
    var len = 0;
    try { len = el.getTotalLength(); } catch(e){}
    if(!len || !isFinite(len) || len < 1) len = 160;
    return Math.ceil(len) + 2;
  });
  /* Phase 2: nur SCHREIBEN */
  parts.forEach(function(el, i){
    el.style.strokeDasharray = String(lens[i]);
    el.style.strokeDashoffset = String(lens[i]);
  });
})();

/* ---------------------------------------------------------------
   3. Reveals: .rv, data-split, .flowline, Icons
   --------------------------------------------------------------- */
(function(){
  var els = document.querySelectorAll('.rv, [data-split], .flowline');
  function activate(el){
    el.classList.add('in');
    el.querySelectorAll('.ico').forEach(function(i){ i.classList.add('drawn'); });
    if(el.classList.contains('ico')) el.classList.add('drawn');
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
  }, { rootMargin:'0px 0px -8% 0px', threshold:0.1 });
  els.forEach(function(el){ io.observe(el); });

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
   7. 3D-Tilt (Kurhaus, Projekt-Karten)
   --------------------------------------------------------------- */
(function(){
  if(!finePointer || reduced) return;
  document.querySelectorAll('[data-tilt]').forEach(function(host){
    var card = host.querySelector('.tilt-target, .kurhaus-frame, .pj-shotcard') || host;
    host.addEventListener('pointermove', function(e){
      var r = host.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      card.style.setProperty('--ry', (px * 7).toFixed(2) + 'deg');
      card.style.setProperty('--rx', (-py * 7).toFixed(2) + 'deg');
    });
    host.addEventListener('pointerleave', function(){
      card.style.setProperty('--ry', '0deg');
      card.style.setProperty('--rx', '0deg');
    });
  });
})();

/* ---------------------------------------------------------------
   8. Scroll-Engine: Fortschritt, Parallax, Score-Counter
   --------------------------------------------------------------- */
(function(){
  var items = [];
  if(!reduced){
    document.querySelectorAll('[data-parallax]').forEach(function(el){
      items.push({ el:el, amount:parseFloat(el.getAttribute('data-parallax')) || 0, rect:null });
    });
  }
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
    for(var i = 0; i < items.length; i++){
      var it = items[i];
      if(!it.rect) continue;
      var center = it.rect.top + it.rect.height / 2 - y;
      if(center < -it.rect.height || center > vh + it.rect.height) continue;
      var prog = (center - vh / 2) / (vh / 2 + it.rect.height / 2);
      prog = Math.max(-1, Math.min(1, prog));
      it.el.style.setProperty('--py', (-prog * it.amount).toFixed(1) + 'px');
    }
  }
  function onScroll(){ if(!ticking){ ticking = true; requestAnimationFrame(frame); } }
  var idleInit = window.requestIdleCallback || function(f){ setTimeout(f, 300); };
  idleInit(function(){ measure(); frame(); });
  window.addEventListener('scroll', onScroll, { passive:true });
  window.addEventListener('resize', function(){ measure(); onScroll(); }, { passive:true });
  window.addEventListener('load', function(){ measure(); onScroll(); });

  /* 5,0-Counter + Sternfuellung */
  var score = document.querySelector('.score');
  if(score && 'IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(!e.isIntersecting) return;
        io.unobserve(score);
        var numEl = score.querySelector('.score-num');
        var starsEl = score.querySelector('.score-stars');
        if(reduced){ if(starsEl) starsEl.style.setProperty('--fill', 100); return; }
        if(starsEl){
          var fillEl = starsEl.querySelector('.fill');
          if(fillEl){ fillEl.style.transition = 'none'; }
          starsEl.style.setProperty('--fill', 0);
          if(fillEl){ void fillEl.offsetWidth; fillEl.style.transition = ''; }
          starsEl.style.setProperty('--fill', 100);
        }
        if(!numEl) return;
        numEl.textContent = '0,0';
        var start = null;
        function step(ts){
          if(!start) start = ts;
          var p = Math.min(1, (ts - start) / 1300);
          p = 1 - Math.pow(1 - p, 3);
          numEl.textContent = (p * 5).toFixed(1).replace('.', ',');
          if(p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold:0.4 });
    io.observe(score);
  }
})();

/* ---------------------------------------------------------------
   9. Bewertungs-Slider: Snap + Drag + Pfeile
   --------------------------------------------------------------- */
(function(){
  var track = document.querySelector('.qtrack');
  if(!track) return;
  var prev = document.querySelector('[data-q-prev]');
  var next = document.querySelector('[data-q-next]');
  /* Schrittweite aus den echten Kartenabstaenden — der Gap ist je
     Breakpoint anders, ein fester Wert schiebt sonst daneben. */
  function stepWidth(){
    var qs = track.querySelectorAll('.quote');
    if(qs.length > 1) return qs[1].offsetLeft - qs[0].offsetLeft;
    return qs.length ? qs[0].getBoundingClientRect().width : 340;
  }
  /* Pfeile an den Enden sperren: sonst klickt man ins Leere.
     Gemessen wird an den echten Kartenkanten — scrollLeft startet je
     nach Layout nicht bei 0. */
  function syncArrows(){
    var qs = track.querySelectorAll('.quote');
    if(!qs.length) return;
    var t = track.getBoundingClientRect();
    var first = qs[0].getBoundingClientRect();
    var last = qs[qs.length - 1].getBoundingClientRect();
    if(prev) prev.disabled = first.left >= t.left - 4;
    if(next) next.disabled = last.right <= t.right + 4;
  }
  if(prev) prev.addEventListener('click', function(){ track.scrollBy({ left:-stepWidth(), behavior:'smooth' }); });
  if(next) next.addEventListener('click', function(){ track.scrollBy({ left: stepWidth(), behavior:'smooth' }); });
  /* Mobil ist nur EINE Karte sichtbar: dann traegt die Spur genau die
     Hoehe der aktiven Karte — sonst steht unter kurzen Bewertungen die
     Leerflaeche der laengsten. */
  var oneUp = window.matchMedia('(max-width:699px)');
  function sizeTrack(){
    if(!oneUp.matches){ track.style.height = ''; return; }
    var qs = track.querySelectorAll('.quote');
    if(!qs.length) return;
    var t = track.getBoundingClientRect(), best = null, bd = Infinity;
    for(var i = 0; i < qs.length; i++){
      var d = Math.abs(qs[i].getBoundingClientRect().left - t.left);
      if(d < bd){ bd = d; best = qs[i]; }
    }
    var pad = parseFloat(getComputedStyle(track).paddingBottom) || 0;
    track.style.height = Math.round(best.getBoundingClientRect().height + pad) + 'px';
  }
  function refresh(){ syncArrows(); sizeTrack(); }
  track.addEventListener('scroll', function(){
    if(refresh._r) return;
    refresh._r = requestAnimationFrame(function(){ refresh._r = 0; refresh(); });
  }, { passive:true });
  if(oneUp.addEventListener) oneUp.addEventListener('change', refresh);
  addEventListener('resize', refresh, { passive:true });
  addEventListener('load', refresh);
  refresh();

  if(finePointer){
    var down = false, sx = 0, sl = 0, moved = false;
    track.addEventListener('pointerdown', function(e){
      down = true; moved = false; sx = e.clientX; sl = track.scrollLeft;
      track.classList.add('drag');
    });
    window.addEventListener('pointermove', function(e){
      if(!down) return;
      var dx = e.clientX - sx;
      if(Math.abs(dx) > 4) moved = true;
      track.scrollLeft = sl - dx;
    }, { passive:true });
    window.addEventListener('pointerup', function(){
      down = false; track.classList.remove('drag');
    }, { passive:true });
    track.addEventListener('click', function(e){ if(moved) e.preventDefault(); }, true);
  }
})();

/* ---------------------------------------------------------------
   10. Typewriter
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
    setTimeout(tick, deleting ? 40 : 80);
  }
  setTimeout(tick, 2100);
})();

/* ---------------------------------------------------------------
   11. Videos: abspielen, wenn sichtbar — mit Fallback fuer iOS
   Wichtig: Im iOS-Stromsparmodus verweigert Safari JEDES Autoplay,
   auch stumm und playsinline; erlaubt ist es dort nur in einer echten
   Tap-Geste (Scrollen zaehlt nicht). Deshalb wird geprueft, ob das
   Video wirklich laeuft — wenn nicht, tritt ein animiertes WebP an
   seine Stelle. Bilder unterliegen keiner Autoplay-Sperre.
   --------------------------------------------------------------- */
(function(){
  var vids = [].slice.call(document.querySelectorAll('video[data-auto]'));
  if(!vids.length) return;
  if(reduced){ vids.forEach(function(v){ v.removeAttribute('autoplay'); v.pause(); }); return; }

  /* Handy-Haertung: Eigenschaften explizit setzen (Attribute reichen
     manchen Mobil-Browsern nicht) */
  vids.forEach(function(v){
    v.muted = true; v.playsInline = true; v.defaultMuted = true;
    v.setAttribute('muted', ''); v.setAttribute('webkit-playsinline', '');
  });

  var visible = new Set(), played = new Set(), swapped = new Set();

  /* Video gegen das animierte WebP tauschen (einmal pro Video). */
  function swap(v){
    var src = v.getAttribute('data-anim');
    if(!src || swapped.has(v)) return;
    swapped.add(v);
    var img = new Image();
    img.src = src;
    img.alt = '';
    img.setAttribute('aria-hidden', 'true');
    img.width = v.width || 1116; img.height = v.height || 824;
    img.className = v.className;
    img.decoding = 'async';
    var px = v.getAttribute('data-parallax');
    if(px) img.setAttribute('data-parallax', px);
    img.addEventListener('load', function(){
      if(v.parentNode){ v.parentNode.insertBefore(img, v); v.remove(); }
    });
    img.addEventListener('error', function(){ swapped.delete(v); });
  }

  function tryPlay(v){
    v.muted = true;
    if(v.readyState === 0){ try{ v.load(); }catch(e){} }
    var pr = v.play();
    if(pr && pr.catch) pr.catch(function(){ if(visible.has(v)) swap(v); });
    /* Auch ohne Rejection kann iOS stillstehen: nachmessen. */
    setTimeout(function(){
      if(visible.has(v) && !played.has(v) && v.paused) swap(v);
    }, 900);
  }

  vids.forEach(function(v){ v.addEventListener('playing', function(){ played.add(v); }); });

  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        var v = e.target;
        if(e.isIntersecting){ visible.add(v); tryPlay(v); }
        else { visible.delete(v); if(!v.paused) v.pause(); }
      });
    }, { threshold:0.2 });
    vids.forEach(function(v){ io.observe(v); });
  } else {
    vids.forEach(function(v){ visible.add(v); tryPlay(v); });
  }

  /* Tap gibt die Wiedergabe frei, solange noch ein Video uebrig ist. */
  function unlock(){
    var open = false;
    visible.forEach(function(v){ if(v.isConnected && v.paused){ open = true; tryPlay(v); } });
    if(!open && played.size + swapped.size >= vids.length){
      document.removeEventListener('touchend', unlock);
      document.removeEventListener('pointerdown', unlock);
    }
  }
  document.addEventListener('touchend', unlock, { passive:true });
  document.addEventListener('pointerdown', unlock, { passive:true });
})();

/* ---------------------------------------------------------------
   12. Angebot-Popup
   --------------------------------------------------------------- */
(function(){
  var dlg = document.getElementById('angebot');
  if(!dlg) return;
  var last = null;
  function open(e){
    if(e) e.preventDefault();
    last = document.activeElement;
    if(typeof dlg.showModal === 'function') dlg.showModal();
    else dlg.setAttribute('open', '');
    var f = dlg.querySelector('.modal-x');
    if(f) f.focus();
  }
  function close(){
    if(typeof dlg.close === 'function') dlg.close();
    else dlg.removeAttribute('open');
    if(last && last.focus) last.focus();
  }
  document.querySelectorAll('[data-open-angebot]').forEach(function(b){ b.addEventListener('click', open); });
  dlg.querySelectorAll('[data-close-angebot]').forEach(function(b){ b.addEventListener('click', close); });
  dlg.addEventListener('click', function(e){ if(e.target === dlg) close(); });
})();

/* ---------------------------------------------------------------
   13. Karte nach Einwilligung
   --------------------------------------------------------------- */
(function(){
  document.querySelectorAll('.mapbox').forEach(function(box){
    var btn = box.querySelector('[data-load-map]');
    if(!btn) return;
    btn.addEventListener('click', function(){
      var src = box.getAttribute('data-map-src');
      if(!src) return;
      var f = document.createElement('iframe');
      f.src = src; f.loading = 'lazy';
      f.title = 'Karte mit unserem Standort';
      f.referrerPolicy = 'no-referrer-when-downgrade';
      f.setAttribute('allowfullscreen', '');
      box.innerHTML = ''; box.appendChild(f);
    });
  });
})();

/* ---------------------------------------------------------------
   14. Formular-Spamschutz
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
      if(elapsed < 2500) e.preventDefault();
    }
  });
})();

/* ---------------------------------------------------------------
   15. Referenz-Showcase: Tabs
   --------------------------------------------------------------- */
(function(){
  var tabs = document.querySelectorAll('.tab[role="tab"]');
  if(!tabs.length) return;
  /* Init: inaktive Panels fuer Screenreader verstecken (nur mit JS) */
  tabs.forEach(function(t){
    var p = document.getElementById(t.getAttribute('aria-controls'));
    if(p && !p.classList.contains('is-on')) p.hidden = true;
  });
  tabs.forEach(function(tab){
    tab.addEventListener('click', function(){
      var target = document.getElementById(tab.getAttribute('aria-controls'));
      if(!target) return;
      tabs.forEach(function(t){
        t.classList.remove('is-on'); t.setAttribute('aria-selected','false');
        var p = document.getElementById(t.getAttribute('aria-controls'));
        if(p){ p.classList.remove('is-on'); p.hidden = true; }
      });
      tab.classList.add('is-on'); tab.setAttribute('aria-selected','true');
      target.hidden = false;
      /* Reflow, damit die Einflug-Animation neu startet */
      void target.offsetWidth;
      target.classList.add('is-on');
      /* Panels waren versteckt: Parallax-Positionen neu vermessen */
      window.dispatchEvent(new Event('resize'));
    });
  });
})();

/* ---------------------------------------------------------------
   16. Hero-Ebenen: Maus-Parallax (direkt, kraeftig, ohne Umwege)
   --------------------------------------------------------------- */
(function(){
  var stack = document.getElementById('heroStack');
  if(!stack || reduced || !finePointer) return;
  var hero = stack.closest('.hero') || document.body;
  var DEPTH = { l1:12, l2:20, l3:30, l4:42, l5:54, l6:70 };
  var layers = [];
  stack.querySelectorAll('.layer').forEach(function(el){
    var d = 16;
    el.classList.forEach(function(c){ if(DEPTH[c]) d = DEPTH[c]; });
    layers.push({ el:el, d:d });
  });
  if(!layers.length) return;

  var tx = 0, ty = 0, cx = 0, cy = 0, running = false;

  function frame(){
    cx += (tx - cx) * 0.10;
    cy += (ty - cy) * 0.10;
    for(var i = 0; i < layers.length; i++){
      var L = layers[i];
      L.el.style.transform = 'translate3d(' + (cx * L.d).toFixed(1) + 'px,' + (cy * L.d * 0.75).toFixed(1) + 'px,0)';
    }
    if(Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001){
      requestAnimationFrame(frame);
    } else { running = false; }
  }
  function kick(){ if(!running){ running = true; requestAnimationFrame(frame); } }

  hero.addEventListener('pointermove', function(e){
    var r = hero.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    kick();
  }, { passive:true });
  hero.addEventListener('pointerleave', function(){ tx = 0; ty = 0; kick(); }, { passive:true });
})();

/* ---------------------------------------------------------------
   15. Cursor-Spotlight auf Karten ([data-spot])
   --------------------------------------------------------------- */
(function(){
  if(!finePointer || reduced) return;
  document.querySelectorAll('[data-spot]').forEach(function(el){
    var raf = 0, mx = 50, my = 50;
    function apply(){
      raf = 0;
      el.style.setProperty('--mx', mx.toFixed(1) + '%');
      el.style.setProperty('--my', my.toFixed(1) + '%');
    }
    el.addEventListener('pointermove', function(e){
      var r = el.getBoundingClientRect();
      mx = ((e.clientX - r.left) / r.width) * 100;
      my = ((e.clientY - r.top) / r.height) * 100;
      if(!raf) raf = requestAnimationFrame(apply);
    }, { passive:true });
    el.addEventListener('pointerenter', function(){ el.classList.add('lit'); });
    el.addEventListener('pointerleave', function(){
      el.classList.remove('lit');
      mx = 50; my = 50;
      if(!raf) raf = requestAnimationFrame(apply);
    });
  });
})();

/* ---------------------------------------------------------------
   16. Zeilenweises Reveal ([data-seq]) — Kinder nacheinander
   --------------------------------------------------------------- */
(function(){
  var hosts = document.querySelectorAll('[data-seq]');
  if(!hosts.length) return;
  function run(host){
    var step = parseInt(host.getAttribute('data-seq'), 10) || 90;
    var rows = host.querySelectorAll('[data-row]');
    rows.forEach(function(row, i){
      if(reduced){ row.classList.add('in'); return; }
      setTimeout(function(){ row.classList.add('in'); }, i * step);
    });
  }
  if(!('IntersectionObserver' in window)){ hosts.forEach(run); return; }
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(!e.isIntersecting) return;
      io.unobserve(e.target);
      run(e.target);
    });
  }, { rootMargin:'0px 0px -12% 0px', threshold:0.15 });
  hosts.forEach(function(h){ io.observe(h); });
})();

/* ---------------------------------------------------------------
   17. Karte im Standort-Band (Einwilligung + sanftes Einblenden)
   --------------------------------------------------------------- */
(function(){
  var band = document.querySelector('[data-mapband]');
  if(!band) return;
  var btn = band.querySelector('[data-load-band]');
  if(!btn) return;
  btn.addEventListener('click', function(){
    var src = band.getAttribute('data-map-src');
    if(!src) return;
    var f = document.createElement('iframe');
    f.src = src; f.loading = 'lazy';
    f.title = 'Karte mit unserem Einzugsgebiet';
    f.referrerPolicy = 'no-referrer-when-downgrade';
    f.setAttribute('allowfullscreen', '');
    band.appendChild(f);
    band.classList.add('is-live');
    requestAnimationFrame(function(){ band.classList.add('is-shown'); });
  });
})();


/* ---------------------------------------------------------------
   18. Geraete-Buehne: Maus-Parallax ueber die Ebenen
   --------------------------------------------------------------- */
(function(){
  if(!finePointer || reduced) return;
  document.querySelectorAll('[data-devstage]').forEach(function(stage){
    var tx = 0, ty = 0, cx = 0, cy = 0, running = false;
    function frame(){
      running = false;
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      stage.style.setProperty('--mxp', cx.toFixed(2) + 'px');
      stage.style.setProperty('--myp', cy.toFixed(2) + 'px');
      if(Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) kick();
    }
    function kick(){ if(!running){ running = true; requestAnimationFrame(frame); } }
    stage.addEventListener('pointermove', function(e){
      var r = stage.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 34;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 22;
      kick();
    }, { passive:true });
    stage.addEventListener('pointerleave', function(){ tx = 0; ty = 0; kick(); }, { passive:true });
  });
})();

/* ---------------------------------------------------------------
   17. FAQ: Papke-Akkordeon — eins offen, weiche Hoehe
   --------------------------------------------------------------- */
(function(){
  var items = document.querySelectorAll('.faq details');
  if(!items.length) return;

  items.forEach(function(d){
    /* Inhalt bleibt im DOM gerendert; Sichtbarkeit steuert die Klasse */
    d.setAttribute('open', '');
    d.querySelector('summary').addEventListener('click', function(e){
      e.preventDefault();
      var willOpen = !d.classList.contains('is-open');
      items.forEach(function(other){ other.classList.remove('is-open'); });
      if(willOpen) d.classList.add('is-open');
    });
  });
})();

/* ---------------------------------------------------------------
   18. FAQ: Papke-3D-Scroll-Engine (Original-Mathematik der
   zahnarzt-papke.vercel.app — rotateX d*24, translateZ -|d|*165,
   translateY d*26, perspective 1150, flach in Viewport-Mitte)
   --------------------------------------------------------------- */
(function(){
  if(reduced) return;
  var items = Array.prototype.slice.call(document.querySelectorAll('.faq details'));
  if(!items.length) return;

  function clamp(v, a, b){ return v < a ? a : (v > b ? b : v); }

  var vh = window.innerHeight, ticking = false;
  var tops = [], heights = [];

  function absTop(el){ var y = 0; while(el){ y += el.offsetTop; el = el.offsetParent; } return y; }
  function measure(){
    vh = window.innerHeight;
    for(var i = 0; i < items.length; i++){
      tops[i] = absTop(items[i]); heights[i] = items[i].offsetHeight;
    }
  }

  function update(){
    ticking = false;
    var sy = window.pageYOffset;
    for(var k = 0; k < items.length; k++){
      var top = tops[k] - sy;
      var h = heights[k];
      if(top + h < -260 || top > vh + 260) continue;
      var el = items[k];
      var d = clamp((top + h / 2 - vh / 2) / (vh * 0.62), -1, 1);
      var ad = Math.abs(d);
      if(ad < 0.035){
        if(el.style.transform){ el.style.transform = ''; }
        continue;
      }
      var rotX = d * 24;
      var tz = -ad * 165;
      var ty = d * 26;
      el.style.transform =
        'perspective(1150px) translateY(' + ty.toFixed(1) +
        'px) translateZ(' + tz.toFixed(1) + 'px) rotateX(' + rotX.toFixed(2) + 'deg)';
    }
  }

  function onScroll(){ if(!ticking){ ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', onScroll, { passive:true });
  window.addEventListener('resize', function(){ measure(); onScroll(); }, { passive:true });
  window.addEventListener('load', function(){ measure(); onScroll(); });

  /* Akkordeon aendert Hoehen -> nach jedem Toggle neu vermessen */
  items.forEach(function(d){
    d.querySelector('summary').addEventListener('click', function(){
      setTimeout(function(){ measure(); onScroll(); }, 60);
      setTimeout(function(){ measure(); onScroll(); }, 520);
    });
  });

  (window.requestIdleCallback || function(f){ setTimeout(f, 350); })(function(){
    measure(); update();
    setTimeout(function(){ measure(); update(); }, 400);
  });
})();

/* ---------------------------------------------------------------
   19. Angebots-Popup nach etwas Scrollen (1x je 3 Tage)
   --------------------------------------------------------------- */
(function(){
  var dlg = document.getElementById('angebot');
  if(!dlg || !dlg.showModal) return;
  var KEY = 'fs-offer-seen';
  function seen(){
    try {
      var t = parseInt(localStorage.getItem(KEY) || '0', 10);
      return t && (Date.now() - t) < 3 * 24 * 3600 * 1000;
    } catch(e){ return true; }
  }
  function markSeen(){ try { localStorage.setItem(KEY, String(Date.now())); } catch(e){} }
  if(seen()) return;

  /* Manuelles oeffnen zaehlt ebenfalls */
  document.querySelectorAll('[data-open-angebot]').forEach(function(b){
    b.addEventListener('click', markSeen);
  });
  dlg.addEventListener('close', markSeen);

  var fired = false;
  function onScroll(){
    if(fired || dlg.open) return;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if(max < 400) return;
    var p = window.scrollY / max;
    if(window.scrollY > 1200 || p > 0.35){
      fired = true;
      window.removeEventListener('scroll', onScroll);
      setTimeout(function(){
        if(!dlg.open && !seen()){ markSeen(); dlg.showModal(); }
      }, 700);
    }
  }
  window.addEventListener('scroll', onScroll, { passive:true });
})();

/* ---------------------------------------------------------------
   20. Logo-Reveal Phase 2: Lockup fliegt in die Navigation
   --------------------------------------------------------------- */
(function(){
  var ov = document.getElementById('logoreveal');
  if(!ov || window.__lrT0 === undefined) return;
  var mark = ov.querySelector('.lr-mark');
  var word = ov.querySelector('.lr-word');
  var done = false;

  function finish(){
    if(done) return; done = true;
    ov.classList.add('lr-out');
    document.documentElement.classList.remove('lr-lock');
    setTimeout(function(){ if(ov.parentNode) ov.parentNode.removeChild(ov); }, 340);
  }

  function fly(){
    if(done) return;
    var tm = document.querySelector('.nav .logomark');
    var tw = document.querySelector('.nav .logotype');
    if(!tm || !tw || !mark.animate){ finish(); return; }
    var d = 640, ease = 'cubic-bezier(0.16,1,0.3,1)';
    [[mark, tm], [word, tw]].forEach(function(pair){
      var from = pair[0].getBoundingClientRect();
      var to = pair[1].getBoundingClientRect();
      var s = to.width / from.width;
      var dx = (to.left + to.width/2) - (from.left + from.width/2);
      var dy = (to.top + to.height/2) - (from.top + from.height/2);
      pair[0].animate(
        [{ transform:'translate(0,0) scale(1)' },
         { transform:'translate(' + dx + 'px,' + dy + 'px) scale(' + s + ')' }],
        { duration:d, easing:ease, fill:'forwards' });
    });
    setTimeout(finish, d - 180);
  }

  var wait = Math.max(0, 2650 - (performance.now() - window.__lrT0));
  var timer = setTimeout(function(){
    ov.classList.add('lr-flip');
    timer = setTimeout(fly, 330);
  }, wait);
  /* Klick oder Taste ueberspringt */
  function skip(){ clearTimeout(timer); finish(); }
  ov.addEventListener('click', skip);
  document.addEventListener('keydown', skip, { once:true });
})();

/* ---------------------------------------------------------------
   22. Wallet-Sektion: die Karte stempelt sich in Dauerschleife voll,
       beim letzten Stempel knallt kurz Konfetti. Laeuft nur, solange
       die Karte im Bild ist (Akku/Jank), und pausiert bei reduced-motion.
   --------------------------------------------------------------- */
(function(){
  var pass = document.getElementById('wlPass');
  if(!pass) return;
  var chks  = [].slice.call(pass.querySelectorAll('.wl-chk'));
  var count = document.getElementById('wlCount');
  var toast = document.getElementById('wlToast');
  var msg   = document.getElementById('wlToastMsg');
  var cvs   = document.getElementById('wlConfetti');
  if(!chks.length) return;

  var GOAL = chks.length, STEP = 620, HOLD = 2600, GAP = 900;

  function setCount(n){ if(count) count.textContent = String(n); }
  function fill(n){ chks.forEach(function(g,i){ g.classList.toggle('on', i < n); }); setCount(n); }

  /* --- Konfetti: kleines Canvas, keine Library ------------------ */
  var COLS = ['#7E1233','#C2295A','#F2871C','#3AA84A','#FCF4DF','#0B7C74'];
  function confetti(){
    if(!cvs || !cvs.getContext) return;
    var stage = cvs.parentNode;
    var w = cvs.width  = stage.clientWidth;
    var h = cvs.height = stage.clientHeight;
    var ctx = cvs.getContext('2d');
    /* Ursprung: Mitte der Karte */
    var pr = pass.getBoundingClientRect(), sr = stage.getBoundingClientRect();
    var ox = pr.left - sr.left + pr.width / 2, oy = pr.top - sr.top + pr.height * 0.52;
    var bits = [];
    for(var i = 0; i < 90; i++){
      bits.push({
        x: ox + (Math.random() - 0.5) * pr.width * 0.7, y: oy + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 9.2, vy: -4.4 - Math.random() * 6.6,
        s: 4 + Math.random() * 5.4, rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.34, c: COLS[(Math.random() * COLS.length) | 0]
      });
    }
    cvs.classList.add('on');
    var t0 = 0;
    function frame(ts){
      if(!t0) t0 = ts;
      var life = ts - t0;
      ctx.clearRect(0, 0, w, h);
      bits.forEach(function(b){
        b.vy += 0.17; b.x += b.vx; b.y += b.vy; b.rot += b.vr;
        ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.rot);
        ctx.globalAlpha = Math.max(0, 1 - life / 1800);
        ctx.fillStyle = b.c; ctx.fillRect(-b.s / 2, -b.s / 2, b.s, b.s * 0.62);
        ctx.restore();
      });
      if(life < 1800) requestAnimationFrame(frame);
      else { ctx.clearRect(0, 0, w, h); cvs.classList.remove('on'); }
    }
    requestAnimationFrame(frame);
  }

  /* --- reduced motion: volle Karte, keine Schleife -------------- */
  if(reduced){ fill(GOAL); pass.classList.add('ready'); return; }

  var n = 0, timer = null, running = false;

  function pop(){
    pass.classList.remove('stamped'); void pass.offsetWidth; pass.classList.add('stamped');
  }
  function say(text){
    if(!toast || !msg) return;
    msg.textContent = text;
    toast.classList.add('show');
    clearTimeout(say._t);
    say._t = setTimeout(function(){ toast.classList.remove('show'); }, 1400);
  }
  function tick(){
    if(!running) return;
    if(n < GOAL){
      n++; fill(n); pop();
      if(n === GOAL){
        pass.classList.add('ready');
        confetti();
        say('Prämie freigeschaltet');
        timer = setTimeout(function(){ n = 0; fill(0); pass.classList.remove('ready'); timer = setTimeout(tick, GAP); }, HOLD);
        return;
      }
      say('+1 Stempel');
    }
    timer = setTimeout(tick, STEP);
  }
  function start(){ if(running) return; running = true; timer = setTimeout(tick, 500); }
  function stop(){ running = false; clearTimeout(timer); if(toast) toast.classList.remove('show'); }

  if(!('IntersectionObserver' in window)){ start(); }
  else {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ e.isIntersecting ? start() : stop(); });
    }, { threshold:0.15 });
    io.observe(pass);
  }
  document.addEventListener('visibilitychange', function(){
    if(document.hidden) stop();
    else if(pass.getBoundingClientRect().top < innerHeight && pass.getBoundingClientRect().bottom > 0) start();
  });
})();

/* ---------------------------------------------------------------
   23. Mobil-Navigation: Burger oeffnet die Schublade
   --------------------------------------------------------------- */
(function(){
  var btn = document.getElementById('navburger');
  var drawer = document.getElementById('navdrawer');
  if(!btn || !drawer) return;
  var offen = false, vorher = null;

  function fokusZiele(){
    return drawer.querySelectorAll('a[href], button:not([disabled])');
  }
  function auf(){
    if(offen) return;
    offen = true; vorher = document.activeElement;
    drawer.hidden = false;
    void drawer.offsetWidth;                    /* Reflow, damit die Transition laeuft */
    drawer.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-label', 'Menü schließen');
    document.body.classList.add('nav-open');
  }
  function zu(fokusZurueck){
    if(!offen) return;
    offen = false;
    drawer.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Menü öffnen');
    document.body.classList.remove('nav-open');
    var fertig = function(){ if(!offen) drawer.hidden = true; };
    if(reduced) fertig(); else setTimeout(fertig, 320);
    if(fokusZurueck && vorher && vorher.focus) vorher.focus();
  }

  btn.addEventListener('click', function(){ offen ? zu(false) : auf(); });

  /* Ziel gewaehlt: Schublade schliessen. Bei Ankern auf derselben
     Seite muss sie weg sein, bevor gescrollt wird. */
  drawer.addEventListener('click', function(e){
    var a = e.target.closest('a');
    if(a) zu(false);
  });

  document.addEventListener('keydown', function(e){
    if(!offen) return;
    if(e.key === 'Escape'){ zu(true); return; }
    if(e.key !== 'Tab') return;
    var ziele = fokusZiele();
    if(!ziele.length) return;
    var erste = ziele[0], letzte = ziele[ziele.length - 1];
    if(e.shiftKey && document.activeElement === erste){ e.preventDefault(); letzte.focus(); }
    else if(!e.shiftKey && document.activeElement === letzte){ e.preventDefault(); erste.focus(); }
  });

  /* Am Desktop hat die Schublade nichts zu suchen */
  var breit = window.matchMedia('(min-width:920px)');
  function pruefe(){ if(breit.matches) zu(false); }
  if(breit.addEventListener) breit.addEventListener('change', pruefe);
  addEventListener('resize', pruefe, { passive:true });
})();
