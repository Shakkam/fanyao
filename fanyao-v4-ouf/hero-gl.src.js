/* ═══════════════════════════════════════════════════
   FAN YAO — v4 · hero en particules (Three.js)
   ~16 000 points qui composent les silhouettes, puis 武, 功夫, l'ensō…
   La souris les écarte, un clic envoie une onde de choc,
   le défilement les disperse, le lieu choisi les colore.
   ═══════════════════════════════════════════════════ */
(function () {
  'use strict';
  var root = document.documentElement;
  var FX = window.FX || { RM: false, FINE: true, color: '#1e90ff', onSite: [], onReady: function (f) { f(); } };
  var host = document.getElementById('hero-gl'), hero = document.getElementById('hero-index');
  var THREE = window.THREE, gsap = window.gsap;
  function fail() { root.classList.add('fx-no-gl'); }
  if (!host || !hero || !THREE) { fail(); return; }

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' });
    if (!renderer.getContext()) throw new Error('no gl');
  } catch (e) { fail(); return; }
  root.classList.add('fx-gl-ok');

  /* silhouettes découpées (PNG en data URI : lisible même en ouvrant le fichier en local) */
  var MASK = '__MASK__';

  var small = window.innerWidth * window.innerHeight < 600000;
  var N = (FX.FINE && !small) ? 20000 : 8000;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(0x000000, 0);
  host.appendChild(renderer.domElement);
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.z = 10;

  /* ── Attributs ── */
  var aA = new Float32Array(N * 3), aB = new Float32Array(N * 3), aS = new Float32Array(N * 3), aR = new Float32Array(N * 4);
  for (var i = 0; i < N; i++) {
    var u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2, r = 9 + Math.random() * 14, s = Math.sqrt(1 - u * u);
    aS[i * 3] = Math.cos(th) * s * r; aS[i * 3 + 1] = Math.sin(th) * s * r; aS[i * 3 + 2] = u * r * 0.6 - 4;
    aR[i * 4] = Math.random(); aR[i * 4 + 1] = Math.random(); aR[i * 4 + 2] = Math.random(); aR[i * 4 + 3] = Math.random();
  }
  var geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(aS, 3));
  var attA = new THREE.BufferAttribute(aA, 3), attB = new THREE.BufferAttribute(aB, 3);
  geo.setAttribute('aA', attA); geo.setAttribute('aB', attB);
  geo.setAttribute('aS', new THREE.BufferAttribute(aS, 3));
  geo.setAttribute('aR', new THREE.BufferAttribute(aR, 4));

  var U = {
    uTime: { value: 0 }, uMix: { value: 1 }, uIntro: { value: FX.RM ? 1 : 0 }, uScatter: { value: 0 },
    uScale: { value: 6 }, uOffset: { value: new THREE.Vector2(2, 0.3) }, uSize: { value: 2.6 }, uPR: { value: dpr },
    uMouse: { value: new THREE.Vector3(99, 99, 0) }, uShockT: { value: -10 }, uShockP: { value: new THREE.Vector3() },
    uColor: { value: new THREE.Color(FX.color) }
  };

  var vert = [
    'attribute vec3 aA; attribute vec3 aB; attribute vec3 aS; attribute vec4 aR;',
    'uniform float uTime, uMix, uIntro, uScatter, uScale, uSize, uPR, uShockT;',
    'uniform vec2 uOffset; uniform vec3 uMouse, uShockP;',
    'varying float vGlow; varying float vAlpha;',
    'void main() {',
    '  float st = aR.w;',
    '  float m = clamp((uMix - st * 0.35) / 0.65, 0.0, 1.0); m = m * m * (3.0 - 2.0 * m);',
    '  vec3 p = mix(aA, aB, m);',
    '  p.xy = p.xy * uScale + uOffset; p.z *= uScale;',
    '  float mid = sin(m * 3.14159);',
    '  p += (aR.xyz - 0.5) * mid * vec3(2.6, 2.6, 4.0);',          /* tourbillon pendant la métamorphose */
    '  float ii = clamp((uIntro - st * 0.45) / 0.55, 0.0, 1.0); ii = 1.0 - pow(1.0 - ii, 3.0);',
    '  p = mix(aS, p, ii);',
    '  float t = uTime;',
    '  p.x += sin(t * 0.8 + aR.x * 20.0) * 0.025; p.y += cos(t * 0.9 + aR.y * 20.0) * 0.025; p.z += sin(t * 0.6 + aR.z * 20.0) * 0.12;',
    '  vec2 d = p.xy - uMouse.xy; float dist = length(d);',
    '  float f = exp(-dist * dist * 1.8) * 1.1;',                   /* la souris écarte les particules */
    '  p.xy += (d / (dist + 0.001)) * f; p.z += f * 2.0;',
    '  float age = t - uShockT, ring = 0.0;',
    '  if (age > 0.0 && age < 3.0) {',                              /* onde de choc */
    '    float ds = length(p.xy - uShockP.xy);',
    '    ring = exp(-pow(ds - age * 6.0, 2.0) * 1.5) * exp(-age * 1.2);',
    '    p.xy += ((p.xy - uShockP.xy) / (ds + 0.001)) * ring * 0.9; p.z += ring * 2.5;',
    '  }',
    '  p += (aR.xyz - 0.5) * uScatter * vec3(16.0, 12.0, 6.0); p.z += uScatter * st * 8.0;',
    '  vec4 mv = modelViewMatrix * vec4(p, 1.0);',
    '  gl_Position = projectionMatrix * mv;',
    '  gl_PointSize = min(48.0, uSize * uPR * (0.55 + st * 0.9) * (10.0 / -mv.z));',
    '  vGlow = clamp(f * 1.2 + ring * 1.5 + mid * 0.7 + (1.0 - ii) * 0.8, 0.0, 1.0);',
    '  vAlpha = (0.6 + 0.6 * aR.y) * (1.0 - uScatter * 0.75);',
    '}'
  ].join('\n');
  var frag = [
    'uniform vec3 uColor; varying float vGlow; varying float vAlpha;',
    'void main() {',
    '  vec2 c = gl_PointCoord - 0.5; float d = length(c);',
    '  if (d > 0.5) discard;',
    '  float a = 1.0 - d * 2.0; a *= a;',
    '  vec3 col = mix(uColor, vec3(1.0), vGlow * 0.75 + 0.08);',
    '  gl_FragColor = vec4(col, a * vAlpha);',
    '}'
  ].join('\n');

  var mat = new THREE.ShaderMaterial({ uniforms: U, vertexShader: vert, fragmentShader: frag,
    transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending });
  var points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  scene.add(points);

  /* ── Formes : on dessine dans un canvas et on tire N points dans les pixels pleins ── */
  function sample(draw) {
    var S = 360, c = document.createElement('canvas'); c.width = c.height = S;
    var g = c.getContext('2d'); g.fillStyle = '#fff'; g.strokeStyle = '#fff';
    draw(g, S);
    var d = g.getImageData(0, 0, S, S).data, pts = [];
    for (var y = 0; y < S; y++) for (var x = 0; x < S; x++) if (d[(y * S + x) * 4 + 3] > 120) pts.push(x, y);
    var out = new Float32Array(N * 3), n = pts.length / 2;
    for (var k = 0; k < N; k++) {
      var j = n ? Math.floor(Math.random() * n) : 0;
      out[k * 3] = n ? (pts[j * 2] + Math.random()) / S - 0.5 : 0;
      out[k * 3 + 1] = n ? -((pts[j * 2 + 1] + Math.random()) / S - 0.5) : 0;
      out[k * 3 + 2] = (Math.random() - 0.5) * 0.06;
    }
    return out;
  }
  function han(txt, size, dy) {
    return function (g, S) {
      g.font = Math.round(S * size) + 'px "Ma Shan Zheng", "STKaiti", "KaiTi", serif';
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(txt, S / 2, S * (0.5 + (dy || 0)));
    };
  }
  function enso(g, S) {
    var cx = S / 2, cy = S / 2, R = S * 0.37, a0 = -Math.PI * 0.42, span = Math.PI * 1.86, steps = 220;
    g.lineCap = 'round';
    for (var k = 0; k < steps; k++) {
      var p = k / steps, a = a0 + span * p, a2 = a0 + span * (k + 1) / steps;
      var rr = R * (1 + 0.025 * Math.sin(a * 5));
      g.lineWidth = S * (0.02 + 0.065 * Math.pow(Math.sin(Math.PI * Math.min(1, p * 1.15)), 0.7) * (1 - p * 0.55));
      g.beginPath(); g.arc(cx, cy, rr, a, a2); g.stroke();
    }
    for (var s = 0; s < 18; s++) {
      var aa = a0 + span + Math.random() * 0.25, rd = R * (1 + (Math.random() - 0.5) * 0.12);
      g.beginPath(); g.arc(cx + Math.cos(aa) * rd, cy + Math.sin(aa) * rd, S * (0.004 + Math.random() * 0.01), 0, Math.PI * 2); g.fill();
    }
  }

  var LABELS = [
    { han: '套路', txt: 'Taolu · l’enchaînement' },
    { han: '武', txt: 'Wu · l’art martial' },
    { han: '功夫', txt: 'Gong fu · l’effort accompli' },
    { han: '圆', txt: 'Yuan · le cercle, l’esprit' }
  ];
  var shapes = [], cur = 0, morphing = false;
  var lblIdx = document.querySelector('.hero-shape-idx'), lblHan = document.querySelector('.hero-shape-han'), lblTxt = document.querySelector('.hero-shape-txt');
  function setLabel(i, animate) {
    if (!lblHan) return;
    var L = LABELS[i];
    function apply() { lblIdx.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(LABELS.length).padStart(2, '0'); lblHan.textContent = L.han; lblTxt.textContent = L.txt; }
    if (!animate || !gsap) { apply(); return; }
    gsap.to([lblHan, lblTxt], { opacity: 0, y: -12, duration: 0.3, ease: 'power2.in', onComplete: function () {
      apply(); gsap.fromTo([lblHan, lblTxt], { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out', stagger: 0.06 });
    } });
  }

  function loadShapes(done) {
    var img = new Image();
    img.onload = function () {
      var silhouettes = sample(function (g, S) {
        var w = S, h = S * img.height / img.width;
        g.drawImage(img, 0, (S - h) / 2, w, h);
      });
      var fontReady = (document.fonts && document.fonts.load) ? document.fonts.load('100px "Ma Shan Zheng"') : Promise.resolve();
      fontReady.catch(function () {}).then(function () {
        shapes = [silhouettes, sample(han('武', 0.86, 0.03)), sample(han('功夫', 0.47, 0.02)), sample(enso)];
        done();
      });
    };
    img.onerror = function () { shapes = [sample(han('武', 0.86, 0.03)), sample(enso)]; LABELS.splice(0, 1); LABELS.splice(1, 1); done(); };
    img.src = MASK;
  }

  function morphTo(next) {
    if (morphing || shapes.length < 2) return;
    morphing = true;
    aA.set(shapes[cur]); aB.set(shapes[next]);
    attA.needsUpdate = attB.needsUpdate = true;
    U.uMix.value = 0;
    cur = next;
    setLabel(cur, true);
    gsap.to(U.uMix, { value: 1, duration: 2.4, ease: 'power2.inOut', onComplete: function () { morphing = false; } });
  }
  var autoCall = null;
  function scheduleAuto() {
    if (FX.RM || !gsap) return;
    if (autoCall) autoCall.kill();
    autoCall = gsap.delayedCall(5.2, function () { if (visible) morphTo((cur + 1) % shapes.length); scheduleAuto(); });
  }

  /* ── Mise en page selon la taille de l'écran ── */
  var VH = 2 * 10 * Math.tan(22.5 * Math.PI / 180), VW = VH;
  function resize() {
    var w = host.clientWidth || window.innerWidth, h = host.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    VW = VH * camera.aspect;
    if (w < 860) {
      U.uScale.value = Math.min(5.2, VW * 0.95);
      U.uOffset.value.set(0, VH * 0.17);
      U.uSize.value = 2.8;
    } else {
      U.uScale.value = Math.min(6.2, VH * 0.72);
      U.uOffset.value.set(VW * 0.2, VH * 0.13);
      U.uSize.value = 3.3;
    }
    if (FX.RM) render();
  }
  window.addEventListener('resize', resize);

  /* ── Souris / doigt ── */
  var target = new THREE.Vector3(99, 99, 0);
  function toWorld(e) {
    var r = host.getBoundingClientRect();
    return new THREE.Vector3(((e.clientX - r.left) / r.width * 2 - 1) * VW / 2, -((e.clientY - r.top) / r.height * 2 - 1) * VH / 2, 0);
  }
  hero.addEventListener('pointermove', function (e) { target.copy(toWorld(e)); });
  hero.addEventListener('pointerleave', function () { target.set(99, 99, 0); });
  hero.addEventListener('click', function (e) {
    if (e.target.closest('a, button')) return;
    U.uShockT.value = U.uTime.value; U.uShockP.value.copy(toWorld(e));
    morphTo((cur + 1) % shapes.length); scheduleAuto();
  });

  /* ── Changement de lieu : nouvelle couleur + onde de choc ── */
  FX.onSite.push(function (col) {
    var c = new THREE.Color(col);
    if (gsap) gsap.to(U.uColor.value, { r: c.r, g: c.g, b: c.b, duration: 0.8, ease: 'power2.out' });
    else U.uColor.value.copy(c);
    U.uShockT.value = U.uTime.value; U.uShockP.value.set(U.uOffset.value.x, U.uOffset.value.y, 0);
    if (FX.RM) render();
  });

  /* ── Défilement : les particules se dispersent, le texte s'envole ── */
  function onScroll() {
    var r = hero.getBoundingClientRect(), p = Math.max(0, Math.min(1, -r.top / Math.max(1, r.height)));
    U.uScatter.value = Math.pow(p, 1.4);
    if (FX.RM) render();
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  if (gsap && window.ScrollTrigger && !FX.RM) {
    gsap.to('.hero-index .hero-content', { yPercent: -35, opacity: 0, ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
  }

  /* ── Boucle ── */
  var visible = true;
  new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(hero);
  var clock = new THREE.Clock();
  function render() { renderer.render(scene, camera); }
  function loop() {
    requestAnimationFrame(loop);
    if (!visible || document.hidden) { clock.getDelta(); return; }
    var dt = Math.min(0.05, clock.getDelta());
    U.uTime.value += dt;
    U.uMouse.value.lerp(target, 0.12);
    render();
  }

  resize(); onScroll();
  loadShapes(function () {
    aA.set(shapes[0]); aB.set(shapes[0]); attA.needsUpdate = attB.needsUpdate = true;
    setLabel(0, false);
    if (FX.RM) { render(); return; }
    loop();
    FX.onReady(function () {
      gsap.to(U.uIntro, { value: 1, duration: 3.2, ease: 'power2.out' });
      scheduleAuto();
    });
  });
})();
