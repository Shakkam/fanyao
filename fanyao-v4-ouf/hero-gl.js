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
  var MASK = 'data:image/png;base64,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';

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
