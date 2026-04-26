/* 3D Logo — vanilla port of "Logo 3D.html" from the design bundle.
   Stacks N alpha-tested copies of the logo PNG along Z to extrude
   the EXACT artwork into a real 3D shape. Drag to rotate, scroll to
   zoom (within container), double-click to toggle auto-spin.
   Lazy-mounted via IntersectionObserver, paused when off-screen. */
(() => {
  const init = (mount) => {
    if (!window.THREE || mount.__logo3d) return;
    mount.__logo3d = true;
    const THREE = window.THREE;

    const SRC      = mount.dataset.src || 'assets/logo-source.png';
    const SLICES   = parseInt(mount.dataset.slices, 10) || 64;
    const DEPTH    = parseFloat(mount.dataset.depth) || 0.55;
    const SIZE_Y   = 4.2;
    const INIT_ZOOM = parseFloat(mount.dataset.zoom) || 9;

    const canvas = document.createElement('canvas');
    canvas.className = 'logo-3d-canvas';
    mount.appendChild(canvas);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch (e) { return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    if ('outputColorSpace' in renderer) renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0, INIT_ZOOM);

    const group = new THREE.Group();
    scene.add(group);

    const tex = new THREE.TextureLoader().load(SRC, () => {
      const aspect = (tex.image.naturalWidth || tex.image.width) /
                     (tex.image.naturalHeight || tex.image.height);
      const w = SIZE_Y * aspect;
      const h = SIZE_Y;
      const planeGeo = new THREE.PlaneGeometry(w, h);
      for (let i = 0; i < SLICES; i++) {
        const t = i / (SLICES - 1);
        const z = THREE.MathUtils.lerp(-DEPTH/2, DEPTH/2, t);
        const isEdge = (i === 0 || i === SLICES - 1);
        const mat = new THREE.MeshBasicMaterial({
          map: tex,
          transparent: false,
          alphaTest: 0.35,
          side: THREE.DoubleSide,
          color: isEdge ? new THREE.Color(1,1,1) : new THREE.Color().setScalar(0.78),
          toneMapped: false,
        });
        const m = new THREE.Mesh(planeGeo, mat);
        m.position.z = z;
        group.add(m);
      }
      resize();
    });
    if ('colorSpace' in tex) tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;

    /* interaction state */
    const state = {
      spin: true,
      targetRotX: -0.05, targetRotY: -0.30,
      rotX: -0.05, rotY: -0.30,
      zoom: INIT_ZOOM, targetZoom: INIT_ZOOM,
      dragging: false, lastX: 0, lastY: 0,
    };

    canvas.addEventListener('pointerdown', (e) => {
      state.dragging = true;
      state.lastX = e.clientX;
      state.lastY = e.clientY;
      try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!state.dragging) return;
      state.targetRotY += (e.clientX - state.lastX) / 220;
      state.targetRotX += (e.clientY - state.lastY) / 220;
      state.targetRotX = THREE.MathUtils.clamp(state.targetRotX, -0.9, 0.9);
      state.lastX = e.clientX;
      state.lastY = e.clientY;
    });
    canvas.addEventListener('pointerup',     () => { state.dragging = false; });
    canvas.addEventListener('pointercancel', () => { state.dragging = false; });
    canvas.addEventListener('dblclick',      () => { state.spin = !state.spin; });

    /* sizing — fills the mount element, not the viewport */
    const resize = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      if (w === 0 || h === 0) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    if ('ResizeObserver' in window) {
      new ResizeObserver(resize).observe(mount);
    }
    window.addEventListener('resize', resize);
    resize();

    /* pause render when off-screen for perf */
    let visible = true;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        entries.forEach(e => { visible = e.isIntersecting; });
      }, { threshold: 0 }).observe(mount);
    }

    const clock = new THREE.Clock();
    const tick = () => {
      requestAnimationFrame(tick);
      const dt = clock.getDelta();
      if (!visible || document.hidden) return;
      if (state.spin && !state.dragging) state.targetRotY += dt * 0.35;
      state.rotX += (state.targetRotX - state.rotX) * 0.08;
      state.rotY += (state.targetRotY - state.rotY) * 0.08;
      state.zoom += (state.targetZoom - state.zoom) * 0.08;
      group.rotation.x = state.rotX;
      group.rotation.y = state.rotY;
      group.position.y = Math.sin(clock.elapsedTime * 0.7) * 0.05;
      camera.position.z = state.zoom;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };
    requestAnimationFrame(tick);
  };

  const tryAll = () => {
    if (!window.THREE) return;
    document.querySelectorAll('[data-logo3d]').forEach((el) => {
      if (el.__logo3d) return;
      // Lazy-init when scrolled near
      if (!('IntersectionObserver' in window)) { init(el); return; }
      const io = new IntersectionObserver((entries) => {
        if (entries.some(e => e.isIntersecting)) {
          io.disconnect();
          init(el);
        }
      }, { rootMargin: '300px' });
      io.observe(el);
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryAll);
  } else {
    tryAll();
  }
})();
