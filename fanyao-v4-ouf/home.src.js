/* ═══════════════════════════════════════════════════
   FAN YAO — v4 · accueil
   Entrée du hero · galerie en colonnes · taolu piloté par le défilement
   ═══════════════════════════════════════════════════ */
(function () {
  'use strict';
  var gsap = window.gsap, ST = window.ScrollTrigger;
  var FX = window.FX || { RM: true, color: '#1e90ff', onSite: [], onReady: function (f) { f(); } };
  var ANIM = !!(gsap && ST && !FX.RM);

  /* ── Entrée du hero ── */
  var intro = document.querySelectorAll('.hero-index .fx-intro');
  if (ANIM) gsap.set(intro, { y: 30 });
  FX.onReady(function () {
    if (!ANIM) { Array.prototype.forEach.call(intro, function (e) { e.style.opacity = 1; }); return; }
    var title = document.querySelector('.hero-index .hero-title');
    if (title && FX.splitChars) {
      gsap.fromTo(FX.splitChars(title), { yPercent: 135, rotate: 14, opacity: 0 },
        { yPercent: 0, rotate: 0, opacity: 1, duration: 1.5, ease: 'expo.out', stagger: 0.07, delay: 0.25 });
    }
    gsap.to(intro, { opacity: 1, y: 0, duration: 1.3, ease: 'expo.out', stagger: 0.12, delay: 0.7 });
  });

  /* ── Galerie : colonnes qui défilent à des vitesses différentes ── */
  if (ANIM) {
    document.querySelectorAll('.fx-col').forEach(function (col) {
      /* les colonnes, bien plus hautes que le cadre, ne font que monter (à des vitesses différentes) : jamais de vide */
      var sp = parseFloat(col.getAttribute('data-speed')) || 10, a = Math.abs(sp);
      gsap.fromTo(col, { yPercent: sp > 0 ? -a : 0 }, { yPercent: sp > 0 ? 0 : -a, ease: 'none',
        scrollTrigger: { trigger: col.parentNode, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  }

  /* ═══ Taolu piloté par le défilement ═══ */
  var sec = document.querySelector('.fx-taolu');
  if (!sec) return;
  var pin = sec.querySelector('.fx-taolu-pin'), cv = sec.querySelector('canvas.fx-taolu-cv'), ctx = cv.getContext('2d');

  /*__ENGINE__*/

  /*__DRAW__*/

  var W = 0, H = 0, dpr = 1;
  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = pin.clientWidth; H = pin.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    dirty = true;
  }

  var tNow = 0, tTarget = 0, dirty = true, visible = false, hist = [], lastIdx = -1;
  var elHan = document.getElementById('tl-han'), elPy = document.getElementById('tl-py'), elFr = document.getElementById('tl-fr');
  var elI = document.getElementById('tl-i'), elN = document.getElementById('tl-n'), elBar = document.getElementById('tl-bar');
  if (elN) elN.textContent = String(CAPS.length).padStart(2, '0');

  function rgba(hex, a) {
    var m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex) || [0, '1e', '90', 'ff'];
    return 'rgba(' + parseInt(m[1], 16) + ',' + parseInt(m[2], 16) + ',' + parseInt(m[3], 16) + ',' + a + ')';
  }

  function caption(i) {
    var k = CAPS[i];
    elI.textContent = String(i + 1).padStart(2, '0');
    function apply() { elHan.textContent = k.han; elPy.textContent = k.py; elFr.textContent = k.fr; }
    if (!ANIM) { apply(); return; }
    gsap.killTweensOf([elHan, elPy, elFr]);
    gsap.to([elHan, elPy, elFr], { opacity: 0, y: -14, duration: 0.18, ease: 'power2.in', onComplete: function () {
      apply();
      gsap.fromTo([elHan, elPy, elFr], { opacity: 0, y: 18, filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.5, ease: 'expo.out', stagger: 0.05 });
    } });
  }

  function draw() {
    var col = FX.color || '#1e90ff';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    var mobile = W < 860;
    var s = mobile ? Math.min(H / 560, W * 0.95 / 470) : Math.min(H / 380, W * 0.6 / 470);
    var groundY = mobile ? H * 0.6 : H * 0.8;
    var cx = (mobile ? W * 0.5 : W * 0.33) - 96 * s;
    var p = poseAt(tNow), sk = skeleton(p);
    var hx = cx + p.hx * s, hy = groundY - p.hh * s;

    /* halo derrière le pratiquant */
    var gr = ctx.createRadialGradient(hx, hy, 0, hx, hy, H * 0.75);
    gr.addColorStop(0, rgba(col, 0.24)); gr.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);

    /* caractère du mouvement en filigrane */
    var idx = 0; for (var ci = 0; ci < CAPS.length; ci++) if (tNow >= CAPS[ci].start) idx = ci;
    ctx.save();
    ctx.font = Math.round(H * 0.8) + 'px "Ma Shan Zheng", KaiTi, serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.strokeStyle = rgba(col, 0.16); ctx.lineWidth = 1.5;
    ctx.strokeText(CAPS[idx].han.charAt(0), mobile ? W * 0.5 : W * 0.33, H * 0.45);
    ctx.restore();

    /* sol */
    var fl = ctx.createLinearGradient(0, 0, W, 0);
    fl.addColorStop(0, 'rgba(0,0,0,0)'); fl.addColorStop(0.5, rgba(col, 0.7)); fl.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = fl; ctx.fillRect(0, groundY, W, 1.5);

    ctx.lineCap = 'round'; ctx.lineJoin = 'round';

    /* reflet au sol */
    ctx.save();
    ctx.translate(cx, groundY); ctx.scale(s, -s * 0.55);
    ctx.globalAlpha = 0.18; ctx.fillStyle = col; ctx.strokeStyle = col;
    drawFigure(sk);
    ctx.restore();
    var fade = ctx.createLinearGradient(0, groundY, 0, Math.min(H, groundY + H * 0.3));
    fade.addColorStop(0, 'rgba(0,0,0,0)'); fade.addColorStop(1, '#000');
    ctx.fillStyle = fade; ctx.fillRect(0, groundY + 1.5, W, H - groundY);

    /* traînées : les poses récentes s'effacent derrière le geste */
    for (var g = 0; g < hist.length; g++) {
      ctx.save();
      ctx.translate(cx, groundY); ctx.scale(s, s);
      ctx.globalAlpha = 0.05 + 0.2 * (g / hist.length);
      ctx.fillStyle = col; ctx.strokeStyle = col;
      drawFigure(hist[g]);
      ctx.restore();
    }

    /* le pratiquant : néon de la couleur du lieu, cœur blanc */
    ctx.save();
    ctx.translate(cx, groundY); ctx.scale(s, s);
    ctx.shadowColor = col; ctx.shadowBlur = 28;
    ctx.fillStyle = col; ctx.strokeStyle = col;
    drawFigure(sk);
    ctx.shadowBlur = 0; ctx.globalAlpha = 0.55; ctx.fillStyle = '#fff'; ctx.strokeStyle = '#fff';
    ctx.globalCompositeOperation = 'lighter';
    drawFigure(sk);
    ctx.restore();

    hist.push(sk); if (hist.length > 9) hist.shift();
    if (idx !== lastIdx) { lastIdx = idx; caption(idx); }
    if (elBar) elBar.style.transform = 'scaleX(' + (tNow / total).toFixed(4) + ')';
  }

  function loop() {
    requestAnimationFrame(loop);
    var moving = Math.abs(tTarget - tNow) > 0.0005;
    tNow += (tTarget - tNow) * 0.14;
    if (!moving && hist.length) hist.shift();     /* les traînées se résorbent à l'arrêt */
    if (visible && (moving || dirty || hist.length)) { draw(); dirty = false; }
  }

  size();
  window.addEventListener('resize', size);
  new IntersectionObserver(function (en) { visible = en[0].isIntersecting; dirty = true; }).observe(sec);
  FX.onSite.push(function () { dirty = true; });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { dirty = true; });
  if (FX.embers) { var em = document.createElement('canvas'); em.className = 'fx-hero-embers'; em.setAttribute('aria-hidden', 'true'); pin.insertBefore(em, cv.nextSibling); FX.embers(em, sec, 45); }

  if (gsap && ST) {
    ST.create({
      trigger: pin, pin: pin, start: 'top top',
      end: function () { return '+=' + Math.round(window.innerHeight * 3.4); },
      invalidateOnRefresh: true, anticipatePin: 1,
      onUpdate: function (st) { tTarget = st.progress * (total - 0.001); }
    });
  } else {
    window.addEventListener('scroll', function () {
      var r = sec.getBoundingClientRect(), span = Math.max(1, sec.offsetHeight - window.innerHeight);
      tTarget = Math.max(0, Math.min(1, -r.top / span)) * (total - 0.001);
    }, { passive: true });
  }
  loop();
})();
