/* LineWaves — Vanilla ESM port of the React Bits LineWaves component
   Renders an animated WebGL line-wave field into any container.
   Auto-initializes on elements with [data-line-waves] (props via data-*).
*/

import { Renderer, Program, Mesh, Triangle } from 'https://esm.sh/ogl@1.0.11';

function hexToVec3(hex) {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255
  ];
}

const vertexShader = `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

const fragmentShader = `
precision highp float;

uniform float uTime;
uniform vec3 uResolution;
uniform float uSpeed;
uniform float uInnerLines;
uniform float uOuterLines;
uniform float uWarpIntensity;
uniform float uRotation;
uniform float uEdgeFadeWidth;
uniform float uColorCycleSpeed;
uniform float uBrightness;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec2 uMouse;
uniform float uMouseInfluence;
uniform bool uEnableMouse;

#define HALF_PI 1.5707963

float hashF(float n) {
  return fract(sin(n * 127.1) * 43758.5453123);
}

float smoothNoise(float x) {
  float i = floor(x);
  float f = fract(x);
  float u = f * f * (3.0 - 2.0 * f);
  return mix(hashF(i), hashF(i + 1.0), u);
}

float displaceA(float coord, float t) {
  float result = sin(coord * 2.123) * 0.2;
  result += sin(coord * 3.234 + t * 4.345) * 0.1;
  result += sin(coord * 0.589 + t * 0.934) * 0.5;
  return result;
}

float displaceB(float coord, float t) {
  float result = sin(coord * 1.345) * 0.3;
  result += sin(coord * 2.734 + t * 3.345) * 0.2;
  result += sin(coord * 0.189 + t * 0.934) * 0.3;
  return result;
}

vec2 rotate2D(vec2 p, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return vec2(p.x * c - p.y * s, p.x * s + p.y * c);
}

void main() {
  vec2 coords = gl_FragCoord.xy / uResolution.xy;
  coords = coords * 2.0 - 1.0;
  coords = rotate2D(coords, uRotation);

  float halfT = uTime * uSpeed * 0.5;
  float fullT = uTime * uSpeed;

  float mouseWarp = 0.0;
  if (uEnableMouse) {
    vec2 mPos = rotate2D(uMouse * 2.0 - 1.0, uRotation);
    float mDist = length(coords - mPos);
    mouseWarp = uMouseInfluence * exp(-mDist * mDist * 4.0);
  }

  float warpAx = coords.x + displaceA(coords.y, halfT) * uWarpIntensity + mouseWarp;
  float warpAy = coords.y - displaceA(coords.x * cos(fullT) * 1.235, halfT) * uWarpIntensity;
  float warpBx = coords.x + displaceB(coords.y, halfT) * uWarpIntensity + mouseWarp;
  float warpBy = coords.y - displaceB(coords.x * sin(fullT) * 1.235, halfT) * uWarpIntensity;

  vec2 fieldA = vec2(warpAx, warpAy);
  vec2 fieldB = vec2(warpBx, warpBy);
  vec2 blended = mix(fieldA, fieldB, mix(fieldA, fieldB, 0.5));

  float fadeTop = smoothstep(uEdgeFadeWidth, uEdgeFadeWidth + 0.4, blended.y);
  float fadeBottom = smoothstep(-uEdgeFadeWidth, -(uEdgeFadeWidth + 0.4), blended.y);
  float vMask = 1.0 - max(fadeTop, fadeBottom);

  float tileCount = mix(uOuterLines, uInnerLines, vMask);
  float scaledY = blended.y * tileCount;
  float nY = smoothNoise(abs(scaledY));

  float ridge = pow(
    step(abs(nY - blended.x) * 2.0, HALF_PI) * cos(2.0 * (nY - blended.x)),
    5.0
  );

  float lines = 0.0;
  for (float i = 1.0; i < 3.0; i += 1.0) {
    lines += pow(max(fract(scaledY), fract(-scaledY)), i * 2.0);
  }

  float pattern = vMask * lines;

  float cycleT = fullT * uColorCycleSpeed;
  float rChannel = (pattern + lines * ridge) * (cos(blended.y + cycleT * 0.234) * 0.5 + 1.0);
  float gChannel = (pattern + vMask * ridge) * (sin(blended.x + cycleT * 1.745) * 0.5 + 1.0);
  float bChannel = (pattern + lines * ridge) * (cos(blended.x + cycleT * 0.534) * 0.5 + 1.0);

  vec3 col = (rChannel * uColor1 + gChannel * uColor2 + bChannel * uColor3) * uBrightness;
  float alpha = clamp(length(col), 0.0, 1.0);

  gl_FragColor = vec4(col, alpha);
}
`;

const DEFAULTS = {
  speed: 0.3,
  innerLineCount: 32.0,
  outerLineCount: 36.0,
  warpIntensity: 1.0,
  rotation: -45,
  edgeFadeWidth: 0.0,
  colorCycleSpeed: 1.0,
  brightness: 0.2,
  color1: '#ffffff',
  color2: '#ffffff',
  color3: '#ffffff',
  enableMouseInteraction: true,
  mouseInfluence: 2.0
};

export function initLineWaves(container, opts = {}) {
  if (!container) return () => {};
  const o = { ...DEFAULTS, ...opts };

  const renderer = new Renderer({ alpha: true, premultipliedAlpha: false });
  const gl = renderer.gl;
  gl.clearColor(0, 0, 0, 0);

  let currentMouse = [0.5, 0.5];
  let targetMouse = [0.5, 0.5];

  const handleMouseMove = (e) => {
    const rect = gl.canvas.getBoundingClientRect();
    targetMouse = [
      (e.clientX - rect.left) / rect.width,
      1.0 - (e.clientY - rect.top) / rect.height
    ];
  };
  const handleMouseLeave = () => { targetMouse = [0.5, 0.5]; };

  const resize = () => {
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    if (program) {
      program.uniforms.uResolution.value = [
        gl.canvas.width,
        gl.canvas.height,
        gl.canvas.width / gl.canvas.height
      ];
    }
  };

  const geometry = new Triangle(gl);
  const rotationRad = (o.rotation * Math.PI) / 180;
  const program = new Program(gl, {
    vertex: vertexShader,
    fragment: fragmentShader,
    uniforms: {
      uTime:            { value: 0 },
      uResolution:      { value: [gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height] },
      uSpeed:           { value: o.speed },
      uInnerLines:      { value: o.innerLineCount },
      uOuterLines:      { value: o.outerLineCount },
      uWarpIntensity:   { value: o.warpIntensity },
      uRotation:        { value: rotationRad },
      uEdgeFadeWidth:   { value: o.edgeFadeWidth },
      uColorCycleSpeed: { value: o.colorCycleSpeed },
      uBrightness:      { value: o.brightness },
      uColor1:          { value: hexToVec3(o.color1) },
      uColor2:          { value: hexToVec3(o.color2) },
      uColor3:          { value: hexToVec3(o.color3) },
      uMouse:           { value: new Float32Array([0.5, 0.5]) },
      uMouseInfluence:  { value: o.mouseInfluence },
      uEnableMouse:     { value: o.enableMouseInteraction }
    }
  });

  const mesh = new Mesh(gl, { geometry, program });

  window.addEventListener('resize', resize);
  resize();

  container.appendChild(gl.canvas);

  if (o.enableMouseInteraction) {
    gl.canvas.addEventListener('mousemove', handleMouseMove);
    gl.canvas.addEventListener('mouseleave', handleMouseLeave);
  }

  let animationFrameId;
  const update = (time) => {
    animationFrameId = requestAnimationFrame(update);
    program.uniforms.uTime.value = time * 0.001;

    if (o.enableMouseInteraction) {
      currentMouse[0] += 0.05 * (targetMouse[0] - currentMouse[0]);
      currentMouse[1] += 0.05 * (targetMouse[1] - currentMouse[1]);
      program.uniforms.uMouse.value[0] = currentMouse[0];
      program.uniforms.uMouse.value[1] = currentMouse[1];
    } else {
      program.uniforms.uMouse.value[0] = 0.5;
      program.uniforms.uMouse.value[1] = 0.5;
    }
    renderer.render({ scene: mesh });
  };
  animationFrameId = requestAnimationFrame(update);

  return () => {
    cancelAnimationFrame(animationFrameId);
    window.removeEventListener('resize', resize);
    if (o.enableMouseInteraction) {
      gl.canvas.removeEventListener('mousemove', handleMouseMove);
      gl.canvas.removeEventListener('mouseleave', handleMouseLeave);
    }
    if (gl.canvas.parentNode === container) container.removeChild(gl.canvas);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  };
}

const num  = (v, d) => (v !== undefined ? Number(v) : d);
const bool = (v, d) => (v !== undefined ? v !== 'false' : d);
const str  = (v, d) => (v !== undefined ? v : d);

// Defer init until the browser is idle so the hero title + CTAs can paint
// first. Big LCP/TBT win — the WebGL shader compile + first frame is heavy.
const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 200));

idle(() => {
  document.querySelectorAll('[data-line-waves]').forEach((el) => {
    const ds = el.dataset;
    initLineWaves(el, {
      speed:                  num(ds.speed,                  DEFAULTS.speed),
      innerLineCount:         num(ds.innerLineCount,         DEFAULTS.innerLineCount),
      outerLineCount:         num(ds.outerLineCount,         DEFAULTS.outerLineCount),
      warpIntensity:          num(ds.warpIntensity,          DEFAULTS.warpIntensity),
      rotation:               num(ds.rotation,               DEFAULTS.rotation),
      edgeFadeWidth:          num(ds.edgeFadeWidth,          DEFAULTS.edgeFadeWidth),
      colorCycleSpeed:        num(ds.colorCycleSpeed,        DEFAULTS.colorCycleSpeed),
      brightness:             num(ds.brightness,             DEFAULTS.brightness),
      color1:                 str(ds.color1,                 DEFAULTS.color1),
      color2:                 str(ds.color2,                 DEFAULTS.color2),
      color3:                 str(ds.color3,                 DEFAULTS.color3),
      enableMouseInteraction: bool(ds.enableMouseInteraction, DEFAULTS.enableMouseInteraction),
      mouseInfluence:         num(ds.mouseInfluence,         DEFAULTS.mouseInfluence)
    });
  });
});
