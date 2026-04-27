/* Flow State — interactions */

(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ---- 0) PRELOADER → READY transition ----
     Wait for window.load (assets done) AND a min-display time so the
     fill bar has time to actually show.
     Then strip .is-loading and add .ready → CSS cascade animates the hero in. */
  const PRELOADER_MIN = 1700; // matches preloaderFill animation duration + a beat
  const startedAt = performance.now();
  function readyUp(){
    document.documentElement.classList.remove('is-loading');
    document.documentElement.classList.add('ready');
  }
  if (document.readyState === 'complete') {
    setTimeout(readyUp, PRELOADER_MIN);
  } else {
    window.addEventListener('load', () => {
      const elapsed = performance.now() - startedAt;
      const wait = Math.max(0, PRELOADER_MIN - elapsed);
      setTimeout(readyUp, wait);
    });
    // safety net: if load fires too late, still ready up after 4s
    setTimeout(readyUp, 4000);
  }

  /* ---- Apply button background images from data-bg ---- */
  $$('.btn[data-bg]').forEach(b => {
    b.style.setProperty('--btn-img', `url("${b.dataset.bg}")`);
  });

  /* ---- Mobile nav toggle ---- */
  const nav = $('.nav');
  const burger = $('.nav-burger');
  if (burger) {
    burger.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(open));
    });
    $$('.nav-links a').forEach(a => a.addEventListener('click', () => {
      nav.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    }));
  }

  /* ---- Nav scroll state ---- */
  const onScrollNav = () => nav.classList.toggle('scrolled', window.scrollY > 20);
  onScrollNav();
  window.addEventListener('scroll', onScrollNav, { passive: true });

  /* ---- Reveal on scroll ---- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach(el => io.observe(el));

  /* ---- Stats count-up ---- */
  const statIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseInt(el.dataset.count, 10);
      const dur = 1400;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      statIO.unobserve(el);
    });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach(el => statIO.observe(el));

  /* ---- Smooth-scroll offset adjustment for fixed nav ---- */
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* =================================================================
     Scroll-driven canvas frame renderer
     - Frames are decoded once via createImageBitmap (faster repeated blits)
     - A continuous rAF loop lerps the rendered frame index toward the
       scroll-derived target, decoupling render rate from scroll events.
       This is what makes scrubbing feel smooth on mobile, where touch
       scroll runs on the compositor thread and JS scroll handlers lag.
     - DPR is capped harder on coarse pointers (phones) — 2x retina
       rendering of a 1400px frame at 60fps is wasted fillRate.
     - rAF only runs while the host is in the viewport.
     ================================================================= */
  function makeScrollSequence({ host, canvas, framePattern, frameCount, framePad }) {
    if (!host || !canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isCoarse = matchMedia('(pointer: coarse)').matches;
    const dprCap = isCoarse ? 1.5 : 2;
    let dpr = Math.min(window.devicePixelRatio || 1, dprCap);

    const pad = (n) => String(n).padStart(framePad, '0');
    const url = (i) => framePattern.replace('{n}', pad(i));

    const sources = new Array(frameCount); // ImageBitmap or HTMLImageElement
    let lastDrawnIdx = -1;
    let target = 0;   // scroll-derived target frame index (float, 0..frameCount-1)
    let current = 0;  // rendered frame index that eases toward target
    let visible = false;

    const sizeCanvas = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w <= 0 || h <= 0) return false;
      const targetW = Math.round(w * dpr);
      const targetH = Math.round(h * dpr);
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
        lastDrawnIdx = -1; // force redraw after resize
      }
      return true;
    };

    const draw = (idx) => {
      const src = sources[idx];
      if (!src) return false;
      const sw = src.naturalWidth || src.width;
      const sh = src.naturalHeight || src.height;
      if (!sw || !sh) return false;
      if (!sizeCanvas()) return false;
      const cw = canvas.width, ch = canvas.height;
      const scale = Math.min(cw / sw, ch / sh);
      const w = sw * scale;
      const h = sh * scale;
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(src, (cw - w) / 2, (ch - h) / 2, w, h);
      lastDrawnIdx = idx;
      return true;
    };

    const updateTarget = () => {
      const r = host.getBoundingClientRect();
      const total = host.offsetHeight - window.innerHeight;
      if (total <= 0) return;
      const p = Math.max(0, Math.min(1, -r.top / total));
      target = p * (frameCount - 1);
    };

    let rafId = 0;
    const loop = () => {
      rafId = 0;
      if (!visible) return;
      updateTarget();

      if (reducedMotion) {
        current = target;
      } else {
        const d = target - current;
        if (Math.abs(d) < 0.0008) current = target;
        else current += d * 0.22; // critically-damped feel — snappy but smooth
      }

      const idx = Math.max(0, Math.min(frameCount - 1, Math.round(current)));
      if (idx !== lastDrawnIdx) draw(idx);

      // Keep ticking while still easing toward target. Once caught up, sleep
      // until the next scroll/resize wakes us — no idle 60fps repaint.
      if (current !== target) rafId = requestAnimationFrame(loop);
    };
    const wake = () => {
      if (!rafId) rafId = requestAnimationFrame(loop);
    };

    // Preload frames. Prefer createImageBitmap — premultiplied, GPU-friendly,
    // no decode-on-draw cost. Fall back to <img> on older browsers / failures.
    const supportsBitmap = typeof createImageBitmap === 'function';
    const loadFrame = (i) => {
      const u = url(i + 1);
      if (supportsBitmap) {
        fetch(u)
          .then(r => r.ok ? r.blob() : Promise.reject(new Error('fetch ' + r.status)))
          .then(b => createImageBitmap(b))
          .then(bm => {
            sources[i] = bm;
            if (i === Math.round(current)) draw(i);
            else if (lastDrawnIdx === -1) wake();
          })
          .catch(() => loadFrameImg(i));
      } else {
        loadFrameImg(i);
      }
    };
    const loadFrameImg = (i) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        sources[i] = img;
        if (i === Math.round(current)) draw(i);
        else if (lastDrawnIdx === -1) wake();
      };
      img.src = url(i + 1);
    };
    for (let i = 0; i < frameCount; i++) loadFrame(i);

    // Visibility-gate the render loop. Off-screen scrolls don't cost anything.
    if ('IntersectionObserver' in window) {
      const vio = new IntersectionObserver((entries) => {
        const wasVisible = visible;
        visible = entries.some(e => e.isIntersecting);
        if (visible && !wasVisible) wake();
      }, { rootMargin: '120px 0px' });
      vio.observe(host);
    } else {
      visible = true;
    }

    if ('ResizeObserver' in window) {
      new ResizeObserver(() => {
        // Re-evaluate dpr in case device-pixel-ratio changed (zoom, screen change)
        dpr = Math.min(window.devicePixelRatio || 1, dprCap);
        lastDrawnIdx = -1;
        wake();
      }).observe(canvas);
    }
    window.addEventListener('scroll', wake, { passive: true });
    window.addEventListener('resize', wake);
    window.addEventListener('load', wake);

    wake();
  }

  // Hero
  const heroSection = document.querySelector('.hero[data-frames]');
  if (heroSection) {
    makeScrollSequence({
      host: heroSection,
      canvas: heroSection.querySelector('.hero-canvas'),
      framePattern: heroSection.dataset.frames,
      frameCount: parseInt(heroSection.dataset.frameCount, 10),
      framePad: parseInt(heroSection.dataset.framePad, 10) || 3,
    });
  }

  // Services — lazy-init when stage approaches viewport so the 43 frame
  // WebPs don't fight with the hero paint on initial load.
  const servicesStage = document.querySelector('.services-stage[data-frames]');
  if (servicesStage) {
    const startServices = () => makeScrollSequence({
      host: servicesStage,
      canvas: servicesStage.querySelector('.services-canvas'),
      framePattern: servicesStage.dataset.frames,
      frameCount: parseInt(servicesStage.dataset.frameCount, 10),
      framePad: parseInt(servicesStage.dataset.framePad, 10) || 3,
    });
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        if (entries.some(e => e.isIntersecting)) { io.disconnect(); startServices(); }
      }, { rootMargin: '600px 0px' });
      io.observe(servicesStage);
    } else {
      startServices();
    }
  }

  /* =================================================================
     HERO ANIMATION LAYER · v2 · $1M ARR Treatment
     1) Multi-layer mouse + scroll parallax
     2) Scroll-tied 3D title depth
     3) Word-by-word blur reveal
     4) Magnetic CTAs
     5) Cursor glow follower
     ================================================================= */
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- 1) HERO V3 · cursor-reactive light streak + ambient parallax ---- */
  if (!reduced) {
    const heroEl = $('.hero--v3');
    const cursorLight = $('.hero-cursor-light');
    const auroraBlobs = $$('.aurora-blob');
    if (heroEl && cursorLight) {
      let rafM = 0;
      let mx = 0, my = 0, tx = 0, ty = 0;
      heroEl.addEventListener('mousemove', (e) => {
        const r = heroEl.getBoundingClientRect();
        mx = (e.clientX - r.left);
        my = (e.clientY - r.top);
        // also normalised for parallax on aurora
        if (!rafM) rafM = requestAnimationFrame(loopL);
      }, { passive: true });
      function loopL() {
        tx += (mx - tx) * 0.12;
        ty += (my - ty) * 0.12;
        cursorLight.style.setProperty('--cx', tx + 'px');
        cursorLight.style.setProperty('--cy', ty + 'px');
        // gentle parallax on aurora blobs
        if (auroraBlobs.length) {
          const px = (tx / heroEl.offsetWidth)  - 0.5;
          const py = (ty / heroEl.offsetHeight) - 0.5;
          auroraBlobs.forEach((b, i) => {
            const factor = (i + 1) * 12;
            b.style.translate = `${(px * factor).toFixed(1)}px ${(py * factor).toFixed(1)}px`;
          });
        }
        if (Math.abs(mx - tx) > 0.5 || Math.abs(my - ty) > 0.5) rafM = requestAnimationFrame(loopL);
        else rafM = 0;
      }
    }
  }

  /* ---- 2) SCROLL-TIED 3D TITLE DEPTH ---- */
  /* Lines shift along Z-axis as user scrolls through the hero pin.
     Line 1 → comes forward, Line 2 → stays neutral, Line 3 → recedes.
     The whole title softens (blur + opacity) as scroll exits hero. */
  if (!reduced && heroSection) {
    const titleLines = $$('.hero-title .line');
    const titleEl = $('.hero-title');
    let rafT = 0;
    const updateScrollDepth = () => {
      rafT = 0;
      const r = heroSection.getBoundingClientRect();
      const total = heroSection.offsetHeight - window.innerHeight;
      if (total <= 0) return;
      const p = Math.max(0, Math.min(1, -r.top / total)); // 0..1 as user scrolls through hero
      // depth shift — each line drifts at its own rate
      if (titleLines[0]) titleLines[0].style.transform = `translate3d(0, ${-p * 30}px, ${p * 80}px) scale(${1 + p * 0.04})`;
      if (titleLines[1]) titleLines[1].style.transform = `translate3d(0, ${-p * 10}px, 0)`;
      if (titleLines[2]) titleLines[2].style.transform = `translate3d(0, ${p * 24}px, ${-p * 100}px) scale(${1 - p * 0.06})`;
      // overall fade as we scroll past hero
      const fade = 1 - Math.max(0, (p - 0.55)) / 0.45;
      if (titleEl) {
        titleEl.style.opacity = fade.toFixed(3);
        titleEl.style.filter = `blur(${(1 - fade) * 6}px)`;
      }
    };
    const tickT = () => { if (!rafT) rafT = requestAnimationFrame(updateScrollDepth); };
    window.addEventListener('scroll', tickT, { passive: true });
    window.addEventListener('resize', tickT);
    updateScrollDepth();
  }

  /* ---- 3) WORD-BY-WORD BLUR REVEAL ---- */
  /* Split each title line's inner text into words, animate them in with stagger. */
  (function wordReveal() {
    const titleEl = $('.hero-title');
    if (!titleEl) return;
    const lineSpans = $$('.hero-title .line>span');
    if (!lineSpans.length) return;
    titleEl.classList.add('is-split');
    const allWords = [];
    lineSpans.forEach(span => {
      const text = span.textContent;
      const parts = text.split(/(\s+| +)/); // split on whitespace incl. nbsp, keep separators
      span.textContent = '';
      parts.forEach(part => {
        if (!part) return;
        if (/^[\s ]+$/.test(part)) {
          span.appendChild(document.createTextNode(part));
        } else {
          const w = document.createElement('span');
          w.className = 'reveal-word';
          w.textContent = part;
          span.appendChild(w);
          allWords.push(w);
        }
      });
    });
    // stagger reveal
    const baseDelay = 80;
    const step = 70;
    requestAnimationFrame(() => {
      titleEl.classList.add('is-revealed');
      allWords.forEach((w, i) => {
        w.style.transitionDelay = `${baseDelay + i * step}ms`;
      });
    });
  })();

  /* ---- 4) MAGNETIC CTAs ---- */
  if (!reduced) {
    const btns = $$('.btn');
    btns.forEach(btn => {
      let baseTransform = '';
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width  / 2);
        const dy = e.clientY - (r.top  + r.height / 2);
        const px = dx * 0.15;
        const py = dy * 0.22;
        btn.style.transform = `translate3d(${px}px, ${py - 2}px, 0)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transition = 'transform .55s cubic-bezier(.34,1.56,.64,1)';
        btn.style.transform = '';
        setTimeout(() => { btn.style.transition = ''; }, 600);
      });
    });
  }

  /* ---- 5) CURSOR GLOW · disabled for perf ---- */
  /* The cursor-follow glow caused perceptible lag on scroll-heavy sections.
     Kept the element in DOM but no JS handler attached. */
  const _cursorGlow = $('.cursor-glow');
  if (_cursorGlow) _cursorGlow.style.display = 'none';

  /* =================================================================
     SITE-WIDE ANIMATION LAYER · v3 · "krasses Startup" pass
     6) 3D mouse tilt + cursor spotlight on every card
     7) Stagger reveal — children of .reveal-stagger get sequential delays
     8) Scroll-tied scale on section headlines
     9) About-frame mouse tilt
     ================================================================= */

  /* ---- 6) 3D mouse tilt + cursor spotlight ---- */
  if (!reduced) {
    const tiltSelectors = [
      '.card', '.member', '.stat', '.contact-item', '.about-points>div'
    ];
    const tiltEls = document.querySelectorAll(tiltSelectors.join(','));
    tiltEls.forEach(el => {
      // ensure spot child exists
      if (!el.querySelector(':scope>.spot')) {
        const sp = document.createElement('div');
        sp.className = 'spot';
        sp.setAttribute('aria-hidden', 'true');
        el.insertBefore(sp, el.firstChild);
      }
      let raf = 0;
      let tx = 0, ty = 0; // current
      let dtx = 0, dty = 0; // target
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top)  / r.height;
        // tilt up to 8 deg Y, 6 deg X
        dtx = (py - 0.5) * -10;
        dty = (px - 0.5) *  10;
        el.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
        el.style.setProperty('--my', (py * 100).toFixed(1) + '%');
        if (!raf) raf = requestAnimationFrame(loop);
      });
      const loop = () => {
        tx += (dtx - tx) * 0.18;
        ty += (dty - ty) * 0.18;
        el.style.setProperty('--tilt-x', tx.toFixed(2) + 'deg');
        el.style.setProperty('--tilt-y', ty.toFixed(2) + 'deg');
        if (Math.abs(dtx - tx) > 0.05 || Math.abs(dty - ty) > 0.05) {
          raf = requestAnimationFrame(loop);
        } else { raf = 0; }
      };
      el.addEventListener('mouseleave', () => {
        dtx = 0; dty = 0;
        if (!raf) raf = requestAnimationFrame(loop);
      });
    });
  }

  /* ---- 7) STAGGER REVEAL · group children of same reveal-stagger parent ---- */
  /* For every section, find the .reveal elements that are direct/nested
     siblings within the same parent grid and assign --reveal-i index. */
  const staggerGroups = [
    '.services-grid',
    '.team-grid',
    '.about-points',
    '.about-grid',
    '.contact-info',
    '.stats'
  ];
  staggerGroups.forEach(sel => {
    const parent = document.querySelector(sel);
    if (!parent) return;
    // Find direct children that are .reveal OR add reveal class to them
    const items = Array.from(parent.children);
    items.forEach((el, i) => {
      el.classList.add('reveal');
      el.style.setProperty('--reveal-i', i);
    });
  });
  // Re-observe newly added reveal elements
  $$('.reveal:not(.in)').forEach(el => {
    if (!el.dataset.observed) {
      io.observe(el);
      el.dataset.observed = '1';
    }
  });

  /* ---- 8) SCROLL-TIED HEADLINE SCALE on section headers ---- */
  if (!reduced) {
    const headlines = $$('.services-head h2, .about-text h2, .contact-card h2');
    let rafH = 0;
    const updateH = () => {
      rafH = 0;
      headlines.forEach(h => {
        const r = h.getBoundingClientRect();
        const vh = window.innerHeight;
        // 1 when headline is centered in viewport, lower at edges
        const center = r.top + r.height / 2;
        const dist = Math.abs(center - vh / 2);
        const t = Math.max(0, 1 - dist / vh); // 0..1
        const scale = 0.96 + t * 0.04;
        h.style.transform = `scale(${scale.toFixed(3)})`;
      });
    };
    const tickH = () => { if (!rafH) rafH = requestAnimationFrame(updateH); };
    window.addEventListener('scroll', tickH, { passive: true });
    window.addEventListener('resize', tickH);
    updateH();
  }

  /* ---- MINI CHART · climbing line in metrics-bento triggers on first visibility ---- */
  (function miniChartClimb() {
    const card = $('.metric-card--chart');
    if (!card) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        // small delay so the line visibly "starts climbing" rather than instantly
        setTimeout(() => card.classList.add('is-climbed'), 200);
        obs.unobserve(card);
      });
    }, { threshold: 0.4 });
    obs.observe(card);
  })();

  /* ============================================================
     SCROLL-3D ENGINE · all scroll-driven 3D effects in one rAF loop
     ============================================================ */
  if (!reduced) {
    const scroll3DTargets = [];

    /* 1) Showcase-Laptop unfold — heavy tilt → near-flat as user scrolls past */
    const laptop = $('.showcase-laptop');
    if (laptop) {
      scroll3DTargets.push({
        el: laptop,
        anchor: $('.showcase'),
        apply(p){
          // p: 0 (section bottom at viewport bottom) .. 1 (section top above viewport top)
          // unfold from heavy → flat between p 0.1 and 0.7
          const t = clamp((p - 0.1) / 0.6, 0, 1);
          const rx =  20 + (4 - 20) * t;          // 20deg → 4deg
          const ry = -28 + (-6 - (-28)) * t;       // -28deg → -6deg
          const rz =  -3 + (-1 - (-3)) * t;
          const sc = 0.96 + 0.06 * t;              // .96 → 1.02
          this.el.style.setProperty('--rx', rx.toFixed(2) + 'deg');
          this.el.style.setProperty('--ry', ry.toFixed(2) + 'deg');
          this.el.style.setProperty('--rz', rz.toFixed(2) + 'deg');
          this.el.style.setProperty('--sc', sc.toFixed(3));
        }
      });
    }

    /* 2) Phone-Frame straighten — heavy tilt → near-flat */
    const phone = $('.phone-frame');
    if (phone) {
      scroll3DTargets.push({
        el: phone,
        anchor: $('.phone-showcase'),
        apply(p){
          const t = clamp((p - 0.1) / 0.6, 0, 1);
          const rx =  12 + (3 - 12) * t;           // 12deg → 3deg
          const ry = -22 + (-6 - (-22)) * t;       // -22deg → -6deg
          this.el.style.setProperty('--rx', rx.toFixed(2) + 'deg');
          this.el.style.setProperty('--ry', ry.toFixed(2) + 'deg');
        }
      });
    }

    /* 3) Metric-Cards 3D entrance — staggered rotateX from depth */
    const metricCards = $$('.metric-card');
    if (metricCards.length) {
      const metricsAnchor = $('.metrics');
      metricCards.forEach((c, i) => {
        scroll3DTargets.push({
          el: c,
          anchor: metricsAnchor,
          apply(p){
            // stagger: each card has its own start offset
            const stagger = i * 0.06;
            const t = clamp((p - 0.05 - stagger) / 0.4, 0, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            const rx =  14 - 14 * eased;
            const z  = -80 +  80 * eased;
            const op = eased;
            this.el.style.setProperty('--m-rx', rx.toFixed(2) + 'deg');
            this.el.style.setProperty('--m-z', z.toFixed(0) + 'px');
            this.el.style.setProperty('--m-op', op.toFixed(2));
          }
        });
      });
    }

    /* 4) Hero F-logo subtle Y-rotation as user scrolls page */
    const heroFigure = $('.hero-figure');
    if (heroFigure) {
      scroll3DTargets.push({
        el: heroFigure,
        anchor: $('.hero'),
        apply(p){
          // rotate slightly with scroll progress through hero (0..1)
          const ry = clamp(p, 0, 1) * 14; // up to 14deg
          // append to the existing figureFloat keyframe via a wrapping CSS var
          this.el.style.setProperty('--scroll-ry', ry.toFixed(2) + 'deg');
        }
      });
    }

    /* 5) Section background parallax — orbs and dividers move slower than content */
    const orbCyan = $('.orb-cyan');
    const orbViolet = $('.orb-violet');
    if (orbCyan || orbViolet) {
      scroll3DTargets.push({
        el: document.body,
        anchor: document.body,
        apply(p){
          const y = window.scrollY;
          if (orbCyan)   orbCyan.style.transform   = `translate3d(0, ${(y * -0.08).toFixed(1)}px, 0)`;
          if (orbViolet) orbViolet.style.transform = `translate3d(0, ${(y *  0.12).toFixed(1)}px, 0)`;
        }
      });
    }

    function clamp(v, lo, hi){ return Math.max(lo, Math.min(hi, v)); }

    /* Single rAF loop drives everything — only updates visible targets */
    let raf3D = 0;
    const update3D = () => {
      raf3D = 0;
      const vh = window.innerHeight;
      scroll3DTargets.forEach(t => {
        if (!t.anchor) return;
        const r = t.anchor.getBoundingClientRect();
        // only run when anchor is reasonably close to viewport
        if (r.bottom < -200 || r.top > vh + 200) return;
        const total = (r.height + vh);
        const passed = vh - r.top;
        const p = clamp(passed / total, 0, 1);
        t.apply(p);
      });
    };
    const tick3D = () => { if (!raf3D) raf3D = requestAnimationFrame(update3D); };
    window.addEventListener('scroll', tick3D, { passive: true });
    window.addEventListener('resize', tick3D);
    update3D();
  }

  /* ---- 9a) MORPH · sticky-pinned word-swap on scroll ---- */
  (function morphWords() {
    const stage = $('#morph');
    if (!stage) return;
    const words = $$('.morph-word', stage);
    if (!words.length) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = stage.getBoundingClientRect();
      const total = stage.offsetHeight - window.innerHeight;
      if (total <= 0) return;
      const p = Math.max(0, Math.min(1, -r.top / total));
      const idx = Math.min(words.length - 1, Math.floor(p * words.length));
      words.forEach((w, i) => w.classList.toggle('is-active', i === idx));
      stage.style.setProperty('--morph-progress', p.toFixed(3));
    };
    const tick = () => { if (!raf) raf = requestAnimationFrame(update); };
    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick);
    update();
  })();

  /* ---- 9b) PROCESS · sticky-pinned 3D phase walk ---- */
  (function processWalk() {
    const stage = $('#prozess .process-stage');
    if (!stage) return;
    const phases = $$('.phase', stage);
    const dots = $$('.process-rail-dots>span', stage);
    const fill = $('.process-rail-fill', stage);
    if (!phases.length) return;
    const total = phases.length;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = stage.getBoundingClientRect();
      const scrollable = stage.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const p = Math.max(0, Math.min(1, -r.top / scrollable));
      // active phase index (0..total-1) — distribute progress across phases with slight ease
      const idxFloat = p * total;
      const idx = Math.max(0, Math.min(total - 1, Math.floor(idxFloat)));
      phases.forEach((ph, i) => {
        ph.classList.remove('is-active', 'is-past');
        if (i < idx)       ph.classList.add('is-past');
        else if (i === idx) ph.classList.add('is-active');
      });
      dots.forEach((d, i) => {
        d.classList.remove('active', 'past');
        if (i < idx)       d.classList.add('past');
        else if (i === idx) d.classList.add('active');
      });
      // rail fill grows with overall progress
      if (fill) fill.style.height = (p * 100).toFixed(2) + '%';
    };
    const tick = () => { if (!raf) raf = requestAnimationFrame(update); };
    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick);
    update();
  })();

  /* ---- 9d) HERO WORD DISPERSION on scroll ---- */
  /* Each word of the hero title gets a unique scroll-tied translateZ + Y + rotation
     so the headline drifts apart in 3D as user scrolls.
     We animate at WORD level (not letter) to preserve the gradient-text background-clip,
     which only renders correctly when the gradient parent owns the visible letters. */
  if (!reduced && heroSection) {
    requestAnimationFrame(() => {
      const words = $$('.hero-title .reveal-word');
      if (!words.length) return;
      // assign per-word seeds (deterministic-ish so layout is stable on reload)
      words.forEach((w, i) => {
        const seedZ = ((i * 37) % 100) / 50 - 1;       // -1..1
        const seedY = ((i * 53 + 11) % 100) / 50 - 1;
        const seedR = ((i * 71 + 23) % 100) / 50 - 1;
        w.dataset.zSeed = seedZ.toFixed(3);
        w.dataset.ySeed = seedY.toFixed(3);
        w.dataset.rSeed = seedR.toFixed(3);
        w.style.willChange = 'transform, opacity';
      });
      let rafL = 0;
      const updateWords = () => {
        rafL = 0;
        const r = heroSection.getBoundingClientRect();
        const total = heroSection.offsetHeight - window.innerHeight;
        if (total <= 0) return;
        const p = Math.max(0, Math.min(1, -r.top / total));
        // engage dispersion only after first 25% of hero scroll
        const t = Math.max(0, (p - 0.25)) / 0.5; // 0..1 across 25-75% of hero scroll
        const tt = Math.min(1, t);
        words.forEach(w => {
          // skip if no seed (defensive)
          if (!w.dataset.zSeed) return;
          const z = parseFloat(w.dataset.zSeed) * 320 * tt;
          const y = parseFloat(w.dataset.ySeed) * 80  * tt;
          const r = parseFloat(w.dataset.rSeed) * 14  * tt;
          // multiplied with the stagger reveal already done — preserve transition state via direct transform
          w.style.transform = `translate3d(0, ${y.toFixed(1)}px, ${z.toFixed(1)}px) rotateZ(${r.toFixed(2)}deg)`;
        });
      };
      const tickL = () => { if (!rafL) rafL = requestAnimationFrame(updateWords); };
      window.addEventListener('scroll', tickL, { passive: true });
      window.addEventListener('resize', tickL);
      // wait for word-reveal to finish, then remove transition so scroll-tied transform is instant
      setTimeout(() => {
        words.forEach(w => { w.style.transition = 'none'; });
        updateWords();
      }, 1700);
    });
  }

  /* ---- 9e) RISK-FREE Section · scroll-tied step emphasis ---- */
  /* As user scrolls through the risk-free pin, each step gets emphasized in turn */
  (function rfStepEmphasis() {
    const stage = $('.risk-free-stage');
    if (!stage) return;
    const steps = $$('.rf-step', stage);
    if (!steps.length) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = stage.getBoundingClientRect();
      const total = stage.offsetHeight - window.innerHeight;
      if (total <= 0) return;
      const p = Math.max(0, Math.min(1, -r.top / total));
      const t = p * steps.length;
      const idx = Math.max(0, Math.min(steps.length - 1, Math.floor(t)));
      steps.forEach((s, i) => {
        s.classList.remove('is-active');
        if (i === idx) s.classList.add('is-active');
      });
    };
    const tick = () => { if (!raf) raf = requestAnimationFrame(update); };
    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick);
    update();
  })();

  /* ---- 9f) SECTION-LEVEL 3D · disabled for perf ---- */
  /* The continuous scroll-tied transform caused jank. Sections still have
     the .reveal stagger + per-card tilt, which is enough motion. */

  /* ---- 9c) 3D card entrance · cards rotateX from depth into place ---- */
  /* Replaces simple translateY reveal for service cards, member cards, contact items */
  (function cardEntrance3D() {
    if (reduced) return;
    const groups = [
      { container: '.services-grid', items: '.card' },
      { container: '.team-grid', items: '.member' },
      { container: '.stats', items: '.stat' },
      { container: '.contact-info', items: '.contact-item' },
      { container: '.about-points', items: '>div' }
    ];
    groups.forEach(({ container, items }) => {
      const c = document.querySelector(container);
      if (!c) return;
      // children selector handling
      let nodes;
      if (items.startsWith('>')) {
        nodes = Array.from(c.children);
      } else {
        nodes = Array.from(c.querySelectorAll(items));
      }
      nodes.forEach((el, i) => {
        // hide initially, set perspective on container
        el.style.opacity = '0';
        el.style.transform = 'translateY(60px) rotateX(-12deg) scale(.94)';
        el.style.transition = `opacity .9s cubic-bezier(.22,1,.36,1) ${i * 90}ms, transform 1.1s cubic-bezier(.22,1,.36,1) ${i * 90}ms`;
      });
      c.style.perspective = '1600px';
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (!e.isIntersecting) return;
          nodes.forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0) rotateX(0) scale(1)';
          });
          obs.unobserve(c);
        });
      }, { threshold: 0.18 });
      obs.observe(c);
    });
  })();

  /* ---- 9) ABOUT-FRAME mouse tilt (3D rotate based on cursor inside section) ---- */
  if (!reduced) {
    const aboutFrame = $('.about-frame');
    const aboutSection = $('.about');
    if (aboutFrame && aboutSection) {
      let raf = 0;
      let cx = 0, cy = 0, tx = 0, ty = 0;
      aboutSection.addEventListener('mousemove', (e) => {
        const r = aboutSection.getBoundingClientRect();
        cx = (e.clientX - (r.left + r.width / 2)) / r.width;  // -.5 .. .5
        cy = (e.clientY - (r.top + r.height / 2)) / r.height;
        if (!raf) raf = requestAnimationFrame(loop);
      });
      aboutSection.addEventListener('mouseleave', () => {
        cx = 0; cy = 0;
        if (!raf) raf = requestAnimationFrame(loop);
      });
      const loop = () => {
        tx += (cx - tx) * 0.1;
        ty += (cy - ty) * 0.1;
        aboutFrame.style.transform = `perspective(1200px) rotateY(${(tx * 14).toFixed(2)}deg) rotateX(${(ty * -10).toFixed(2)}deg) translateZ(0)`;
        if (Math.abs(cx - tx) > 0.001 || Math.abs(cy - ty) > 0.001) {
          raf = requestAnimationFrame(loop);
        } else { raf = 0; }
      };
    }
  }
})();
