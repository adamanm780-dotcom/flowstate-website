/* FlowState — v4. Progressive Enhancement: ohne JS bleibt alles lesbar. */
document.documentElement.classList.add('js');

var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var finePointer = window.matchMedia('(pointer: fine)').matches;

/* ---------------------------------------------------------------
   1. Headlines in Woerter zerlegen (data-split)
   --------------------------------------------------------------- */
(function(){
  document.querySelectorAll('[data-split]').forEach(function(el){
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
  });
})();

/* ---------------------------------------------------------------
   2. Icons: Strichlaengen setzen (fuer Draw-Animation)
   --------------------------------------------------------------- */
(function(){
  if(reduced) return;
  document.querySelectorAll('.ico').forEach(function(svg){
    svg.querySelectorAll('path,circle,rect,line,polyline,polygon,ellipse').forEach(function(el){
      var len = 0;
      try { len = el.getTotalLength(); } catch(e){}
      if(!len || !isFinite(len) || len < 1) len = 160;
      len = Math.ceil(len) + 2;
      el.style.strokeDasharray = String(len);
      el.style.strokeDashoffset = String(len);
    });
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
  measure(); frame();
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
  function stepWidth(){
    var q = track.querySelector('.quote');
    return q ? q.getBoundingClientRect().width + 19 : 340;
  }
  if(prev) prev.addEventListener('click', function(){ track.scrollBy({ left:-stepWidth(), behavior:'smooth' }); });
  if(next) next.addEventListener('click', function(){ track.scrollBy({ left: stepWidth(), behavior:'smooth' }); });

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
   11. Videos: abspielen, wenn sichtbar
   --------------------------------------------------------------- */
(function(){
  var vids = document.querySelectorAll('video[data-auto]');
  if(!vids.length) return;
  if(reduced){ vids.forEach(function(v){ v.removeAttribute('autoplay'); v.pause(); }); return; }
  if(!('IntersectionObserver' in window)) return;
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      var v = e.target;
      if(e.isIntersecting){ v.play().catch(function(){}); }
      else { v.pause(); }
    });
  }, { threshold:0.25 });
  vids.forEach(function(v){ io.observe(v); });
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
