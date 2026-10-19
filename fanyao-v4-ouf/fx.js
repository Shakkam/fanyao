/* ═══════════════════════════════════════════════════
   FAN YAO — v4 « ouf » · effets communs à toutes les pages
   Ouverture · transitions · défilement fluide · curseur à l'encre
   textes cinétiques · révélations d'images · aimants · bandeaux
   ═══════════════════════════════════════════════════ */
(function () {
  'use strict';

  var root = document.documentElement;
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var gsap = window.gsap, ST = window.ScrollTrigger;
  var HAS_GSAP = !!(gsap && ST);
  if (HAS_GSAP) gsap.registerPlugin(ST);

  function readAccent() {
    return getComputedStyle(root).getPropertyValue('--c-accent').trim() || '#1e90ff';
  }
  var FX = window.FX = {
    RM: RM, FINE: FINE, ready: false, color: readAccent(), velocity: 0, lenis: null,
    onSite: [], onReady: function (fn) { if (FX.ready) fn(); else document.addEventListener('fx:ready', fn, { once: true }); }
  };
  /* le sélecteur Bordeaux / Talence change data-site : on prévient tout le monde */
  new MutationObserver(function () {
    FX.color = readAccent();
    FX.onSite.forEach(function (fn) { fn(FX.color); });
  }).observe(root, { attributes: true, attributeFilter: ['data-site'] });

  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function ssGet(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function ssSet(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }

  var PAGES = {
    'index.html': ['Accueil', '武'], 'a-propos.html': ['L’art du mouvement', '道'], 'professeurs.html': ['Professeurs', '师'],
    'medias.html': ['Médias', '影'], 'horaires-tarifs.html': ['Horaires & tarifs', '时'], 'a-la-carte.html': ['À la carte', '艺'],
    'inscriptions.html': ['Inscriptions', '入'], 'contact.html': ['Contact', '信']
  };
  var page = document.body.getAttribute('data-page') || 'index';
  var pageKey = page + '.html';

  /* ── Défilement fluide ── */
  if (!RM && window.Lenis) {
    var lenis = FX.lenis = new window.Lenis({ lerp: 0.085, wheelMultiplier: 1 });
    var lastScrollT = 0;
    lenis.on('scroll', function (e) { FX.velocity = e.velocity || 0; lastScrollT = performance.now(); if (ST) ST.update(); });
    if (HAS_GSAP) {
      gsap.ticker.add(function (t) {
        lenis.raf(t * 1000);
        /* plus d'évènement de défilement : la vitesse retombe (sinon les grilles restent penchées) */
        if (performance.now() - lastScrollT > 120) FX.velocity *= 0.8;
      });
      gsap.ticker.lagSmoothing(0);
    } else {
      (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(performance.now());
    }
    /* retour en haut et ancres via Lenis */
    window.addEventListener('click', function (e) {
      var bt = e.target.closest('#back-top');
      if (bt) { e.stopPropagation(); lenis.scrollTo(0, { duration: 1.8 }); }
    }, true);
    /* menu mobile ouvert : on fige la page */
    var mob = document.getElementById('mobile-nav');
    if (mob) new MutationObserver(function () { if (mob.hidden) lenis.start(); else lenis.stop(); })
      .observe(mob, { attributes: true, attributeFilter: ['hidden'] });
  }

  /* ── Barre de progression ── */
  var prog = el('div'); prog.id = 'fx-progress'; prog.setAttribute('aria-hidden', 'true'); document.body.appendChild(prog);
  function updateProgress() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    prog.style.transform = 'scaleX(' + (h > 0 ? clamp(window.scrollY / h, 0, 1) : 0) + ')';
  }
  window.addEventListener('scroll', updateProgress, { passive: true }); updateProgress();

  /* ═══ Ouverture / transitions ═══ */
  var trans = el('div', '', '<div class="fx-trans-a"></div><div class="fx-trans-b"><span class="fx-trans-kanji"></span><span class="fx-trans-label"></span></div>');
  trans.id = 'fx-trans'; trans.setAttribute('aria-hidden', 'true');
  document.body.appendChild(trans);
  var tA = trans.querySelector('.fx-trans-a'), tB = trans.querySelector('.fx-trans-b');
  if (gsap) gsap.set([tA, tB], { y: 0, yPercent: 100 });

  function fireReady() {
    if (FX.ready) return;
    FX.ready = true;
    document.dispatchEvent(new CustomEvent('fx:ready'));
  }

  function runLoader() {
    var L = el('div', '',
      '<div class="fx-loader-half top"></div><div class="fx-loader-half bot"></div>' +
      '<div class="fx-loader-center"><svg viewBox="0 0 200 200" aria-hidden="true">' +
      '<path d="M 112 14 C 160 20 190 62 186 108 C 182 156 140 190 96 188 C 50 186 12 150 14 102 C 16 60 46 26 88 16" fill="none" stroke-width="9" stroke-linecap="round"/>' +
      '</svg><span class="fx-loader-han">武</span></div>' +
      '<div class="fx-loader-count">000</div><div class="fx-loader-tag">Fan Yao · Kung-fu Wushu</div>');
    L.id = 'fx-loader'; L.setAttribute('aria-hidden', 'true');
    document.body.appendChild(L);
    root.classList.remove('fx-first');
    var path = L.querySelector('path'), len = path.getTotalLength();
    path.style.strokeDasharray = len; path.style.strokeDashoffset = len;
    var count = L.querySelector('.fx-loader-count'), han = L.querySelector('.fx-loader-han');
    var o = { p: 0 };
    var tl = gsap.timeline({ onComplete: function () { L.remove(); } });
    lockScroll();
    tl.from(han, { scale: 0.6, opacity: 0, filter: 'blur(14px)', duration: 0.7, ease: 'expo.out' }, 0.05)
      .to(o, { p: 1, duration: 0.95, ease: 'power2.inOut', onUpdate: function () {
        count.textContent = String(Math.round(o.p * 100)).padStart(3, '0');
        path.style.strokeDashoffset = len * (1 - o.p);
      } }, 0)
      .to([L.querySelector('.fx-loader-center'), count, L.querySelector('.fx-loader-tag')], { opacity: 0, scale: 1.15, duration: 0.3, ease: 'power2.in' }, 1.0)
      .add(fireReady, 1.15)
      .to(L.querySelector('.top'), { yPercent: -100, duration: 0.85, ease: 'expo.inOut' }, 1.1)
      .to(L.querySelector('.bot'), { yPercent: 100, duration: 0.85, ease: 'expo.inOut' }, 1.1)
      .add(unlockScroll, 1.6);
    ssSet('fy4-seen', '1');
  }

  /* Sous le rideau, la page ne doit pas défiler : sinon un coup de molette (ou l'inertie
     d'un pavé tactile) pendant la transition fait arriver la nouvelle page déjà défilée. */
  var navType = ((performance.getEntriesByType && performance.getEntriesByType('navigation')[0]) || {}).type;
  var freshNav = (navType || 'navigate') === 'navigate' && !location.hash;   /* rechargement et retour arrière gardent leur position */
  function toTop() { if (!freshNav) return; window.scrollTo(0, 0); if (FX.lenis) FX.lenis.scrollTo(0, { immediate: true, force: true }); }
  function blockWheel(e) { e.preventDefault(); }
  function lockScroll() {
    toTop();
    if (FX.lenis) FX.lenis.stop();
    window.addEventListener('wheel', blockWheel, { passive: false });
    window.addEventListener('touchmove', blockWheel, { passive: false });
  }
  function unlockScroll() {
    toTop();
    window.removeEventListener('wheel', blockWheel);
    window.removeEventListener('touchmove', blockWheel);
    if (FX.lenis) FX.lenis.start();
    guardTop(1500);
  }
  /* Garde : pendant un moment après l'arrivée, tout défilement qui ne vient pas de l'utilisateur
     (restauration de position par le navigateur ou par le lecteur qui affiche la page) est annulé. */
  var userMoved = false, guardUntil = 0;
  ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach(function (ev) {
    window.addEventListener(ev, function () { if (!document.getElementById('fx-loader') && !trans.classList.contains('on')) userMoved = true; }, { passive: true, capture: true });
  });
  function guardTop(ms) {
    if (!freshNav) return;
    userMoved = false;
    guardUntil = performance.now() + ms;
  }
  window.addEventListener('scroll', function () {
    if (!userMoved && performance.now() < guardUntil && window.scrollY > 0) toTop();
  }, { passive: true });
  toTop();
  guardTop(2500);

  function runEnter() {
    trans.classList.add('on');
    var info = PAGES[pageKey] || ['', '武'];
    trans.querySelector('.fx-trans-kanji').textContent = info[1];
    trans.querySelector('.fx-trans-label').textContent = info[0];
    gsap.set([tA, tB], { y: 0, yPercent: 0 });
    root.classList.remove('fx-entering');
    ssSet('fy4-trans', '0');
    lockScroll();
    gsap.timeline({ onComplete: function () { trans.classList.remove('on'); unlockScroll(); } })
      .to(trans.querySelector('.fx-trans-label'), { opacity: 0, y: -30, duration: 0.2, ease: 'power2.in' }, 0)
      .add(fireReady, 0.12)
      .to(tB, { yPercent: -100, duration: 0.55, ease: 'expo.inOut' }, 0.06)
      .to(tA, { yPercent: -100, duration: 0.55, ease: 'expo.inOut' }, 0.13);
  }

  function leaveTo(href, label, kanji) {
    trans.classList.add('on');
    trans.querySelector('.fx-trans-kanji').textContent = kanji;
    var lab = trans.querySelector('.fx-trans-label');
    lab.textContent = label;
    gsap.set(lab, { opacity: 0, y: 40 });
    gsap.set([tA, tB], { y: 0, yPercent: 100 });
    ssSet('fy4-trans', '1');
    if (FX.lenis) FX.lenis.stop();
    window.addEventListener('wheel', blockWheel, { passive: false });
    gsap.timeline({ onComplete: function () { window.location.href = href; } })
      .to(tA, { yPercent: 0, duration: 0.38, ease: 'expo.inOut' }, 0)
      .to(tB, { yPercent: 0, duration: 0.38, ease: 'expo.inOut' }, 0.06)
      .fromTo(trans.querySelector('.fx-trans-kanji'), { scale: 1.3, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'expo.out' }, 0.16)
      .to(lab, { opacity: 1, y: 0, duration: 0.3, ease: 'expo.out' }, 0.2);
  }

  if (HAS_GSAP && !RM) {
    if (root.classList.contains('fx-first')) runLoader();
    else if (root.classList.contains('fx-entering')) runEnter();
    else fireReady();

    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (a.target && a.target !== '_self') return;
      var href = a.getAttribute('href');
      if (!href || href.charAt(0) === '#' || /^(mailto|tel|https?):/i.test(href) || /\.pdf($|\?)/i.test(href)) return;
      var key = href.split('#')[0].split('?')[0].split('/').pop();
      if (!PAGES[key]) return;
      e.preventDefault();
      if (key === pageKey) { if (FX.lenis) FX.lenis.scrollTo(0, { duration: 1.4 }); else window.scrollTo(0, 0); return; }
      leaveTo(href, PAGES[key][0], PAGES[key][1]);
    });
    /* retour arrière depuis le cache : on retire le rideau */
    window.addEventListener('pageshow', function (e) {
      if (e.persisted) { trans.classList.remove('on'); gsap.set([tA, tB], { yPercent: 100 }); window.removeEventListener('wheel', blockWheel); if (FX.lenis) FX.lenis.start(); }
    });
  } else {
    root.classList.remove('fx-first', 'fx-entering');
    fireReady();
  }

  /* ═══ Curseur : une arme chinoise qui laisse une traînée d'encre ═══
     Talence : un sabre (刀) avec son pompon, un clic entaille.
     Bordeaux : un bâton (棍), un clic fait un moulinet.
     La pointe est le point actif ; l'arme balance selon le mouvement et se dresse au survol des liens. */
  if (FINE && !RM) {
    root.classList.add('fx-cursor');
    var ink = el('canvas'); ink.id = 'fx-ink';
    var tag = el('div', 'fx-cursor-label', 'Voir');
    [ink, tag].forEach(function (n) { n.setAttribute('aria-hidden', 'true'); document.body.appendChild(n); });
    var ictx = ink.getContext('2d'), iw = 0, ih = 0, idpr = 1;
    function sizeInk() { idpr = Math.min(window.devicePixelRatio || 1, 2); iw = innerWidth; ih = innerHeight; ink.width = iw * idpr; ink.height = ih * idpr; }
    sizeInk(); window.addEventListener('resize', sizeInk);

    var mx = -100, my = -100, pmx = -100, vxs = 0, shown = false, hoverLink = false, hoverView = false;
    var ang = 45, angV = 0, scl = 1.2;                    /* degrés : 45 = poignée vers le bas à droite */
    var trail = [], drops = [], slashes = [];
    var tassel = []; for (var ti = 0; ti < 6; ti++) tassel.push({ x: 0, y: 0, px: 0, py: 0 });
    var tasselInit = false;
    /* l'arme suit le lieu : Talence = sabre (刀), Bordeaux = bâton (棍) */
    function weaponNow() { return root.getAttribute('data-site') === 'talence' ? 'dao' : 'gun'; }
    var weapon = weaponNow(), swapT = -1e9, spinT = -1e9, spinFrom = 0, rings = [];
    var STAFF = 80;

    window.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      if (!shown) pmx = mx;
      shown = true;
      trail.push({ x: mx, y: my, t: performance.now() });
    }, { passive: true });
    window.addEventListener('mousedown', function () {
      if (weapon === 'dao') {
        angV -= 22;                                       /* sabre : coup de taille */
        slashes.push({ x: mx, y: my, t: performance.now(), a: (ang - 150) * Math.PI / 180 });
      } else {
        spinT = performance.now(); spinFrom = ang;        /* bâton : un moulinet complet */
        rings.push({ x: mx, y: my, t: spinT, a: ang * Math.PI / 180, r: STAFF * scl });
      }
      for (var i = 0; i < 18; i++) {
        var a = Math.random() * Math.PI * 2, sp = 2 + Math.random() * 7;
        drops.push({ x: mx, y: my, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 1.5, r: 1.5 + Math.random() * 3.5, life: 1 });
      }
    });
    document.addEventListener('mouseover', function (e) {
      var t = e.target;
      hoverView = !!t.closest('.fx-view, .gallery-item, .gallery-teaser-item, .teacher-teaser, .fx-col figure');
      hoverLink = !hoverView && !!t.closest('a, button, [role="button"], input, textarea, select, label');
      tag.classList.toggle('on', hoverView);
    });
    document.documentElement.addEventListener('mouseleave', function () { shown = false; tag.classList.remove('on'); });

    function sabre(c, col, glow) {
      /* repère local : pointe en (0,0), la lame part vers +x, le tranchant côté +y */
      var g = c.createLinearGradient(0, -3.5, 0, 6.5);
      g.addColorStop(0, '#f7f9fc'); g.addColorStop(0.45, '#b9c3cf'); g.addColorStop(0.8, '#dfe6ee'); g.addColorStop(1, '#ffffff');
      c.beginPath();
      c.moveTo(0, 0);
      c.quadraticCurveTo(2, -3.4, 8, -3.2);
      c.lineTo(44, -2.8);
      c.lineTo(44, 3);
      c.quadraticCurveTo(26, 4, 14, 6.6);
      c.quadraticCurveTo(5, 6.8, 0, 0);
      c.closePath();
      c.fillStyle = g;
      c.shadowColor = glow ? col : 'rgba(0,0,0,0.6)'; c.shadowBlur = glow ? 14 : 4;
      c.fill();
      c.shadowBlur = 0;
      c.lineWidth = 0.8; c.strokeStyle = 'rgba(10,10,14,0.75)'; c.stroke();
      /* gorge le long du dos */
      c.beginPath(); c.moveTo(10, -1.2); c.lineTo(41, -1); c.lineWidth = 0.7; c.strokeStyle = 'rgba(40,48,60,0.45)'; c.stroke();
      /* fil du tranchant, de la couleur du lieu */
      c.beginPath(); c.moveTo(2, 1.4); c.quadraticCurveTo(8, 6, 15, 5.6); c.quadraticCurveTo(28, 3.2, 43, 2.4);
      c.lineWidth = 1; c.strokeStyle = col; c.globalAlpha = glow ? 1 : 0.7; c.stroke(); c.globalAlpha = 1;
      /* garde */
      c.beginPath(); c.moveTo(44, -6.5); c.quadraticCurveTo(48.5, -7, 48, -3); c.lineTo(48, 3); c.quadraticCurveTo(48.5, 7, 44, 6.5); c.closePath();
      c.fillStyle = '#d4a72c'; c.fill(); c.lineWidth = 0.7; c.strokeStyle = '#5c4308'; c.stroke();
      /* poignée tressée */
      c.fillStyle = '#26170c'; c.fillRect(48, -2.5, 15, 5);
      c.strokeStyle = 'rgba(212,167,44,0.8)'; c.lineWidth = 0.6;
      for (var k = 49; k < 63; k += 2.6) { c.beginPath(); c.moveTo(k, -2.5); c.lineTo(k + 2, 2.5); c.stroke(); }
      /* pommeau en anneau */
      c.beginPath(); c.arc(66, 0, 3.1, 0, Math.PI * 2); c.lineWidth = 1.7; c.strokeStyle = '#d4a72c'; c.stroke();
    }

    function baton(c, col, glow) {
      /* repère local : pointe en (0,0), le bâton part vers +x ; bois de cire effilé vers la pointe */
      var L = STAFF;
      var g = c.createLinearGradient(0, -3, 0, 3);
      g.addColorStop(0, '#e9c98f'); g.addColorStop(0.5, '#b8874b'); g.addColorStop(1, '#7a5228');
      c.beginPath();
      c.moveTo(0, -1.5); c.lineTo(L, -2.7); c.quadraticCurveTo(L + 1.6, 0, L, 2.7); c.lineTo(0, 1.5); c.quadraticCurveTo(-1.2, 0, 0, -1.5);
      c.closePath();
      c.fillStyle = g;
      c.shadowColor = glow ? col : 'rgba(0,0,0,0.6)'; c.shadowBlur = glow ? 14 : 4;
      c.fill(); c.shadowBlur = 0;
      c.lineWidth = 0.7; c.strokeStyle = 'rgba(30,16,4,0.8)'; c.stroke();
      /* veinage */
      c.lineWidth = 0.4; c.strokeStyle = 'rgba(70,40,12,0.45)';
      c.beginPath(); c.moveTo(6, -0.6); c.quadraticCurveTo(40, -1.6, L - 4, -1.1); c.stroke();
      c.beginPath(); c.moveTo(10, 0.7); c.quadraticCurveTo(46, 0.2, L - 6, 1.3); c.stroke();
      /* embouts de métal */
      c.fillStyle = '#d9dee5'; c.strokeStyle = 'rgba(20,20,26,0.7)'; c.lineWidth = 0.5;
      c.beginPath(); c.moveTo(0, -1.5); c.lineTo(4, -1.7); c.lineTo(4, 1.7); c.lineTo(0, 1.5); c.quadraticCurveTo(-1.2, 0, 0, -1.5); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(L - 4, -2.6); c.lineTo(L, -2.7); c.quadraticCurveTo(L + 1.6, 0, L, 2.7); c.lineTo(L - 4, 2.6); c.closePath(); c.fill(); c.stroke();
      /* bagues de prise, couleur du lieu */
      c.fillStyle = col; c.globalAlpha = glow ? 1 : 0.85;
      c.fillRect(L * 0.45, -2.3, 3.2, 4.6); c.fillRect(L * 0.68, -2.5, 3.2, 5);
      c.globalAlpha = 1;
    }

    (function loop() {
      requestAnimationFrame(loop);
      var now = performance.now();
      var col = FX.color;
      ictx.setTransform(idpr, 0, 0, idpr, 0, 0);
      ictx.clearRect(0, 0, iw, ih);

      /* traînée d'encre depuis la pointe */
      while (trail.length && now - trail[0].t > 420) trail.shift();
      ictx.globalCompositeOperation = 'lighter';
      ictx.lineCap = 'round';
      for (var i = 1; i < trail.length; i++) {
        var p0 = trail[i - 1], p1 = trail[i], age = (now - p1.t) / 420;
        ictx.strokeStyle = col; ictx.globalAlpha = (1 - age) * 0.85;
        ictx.lineWidth = (1 - age) * clamp(Math.hypot(p1.x - p0.x, p1.y - p0.y) * 0.35, 1.5, 9);
        ictx.beginPath(); ictx.moveTo(p0.x, p0.y); ictx.lineTo(p1.x, p1.y); ictx.stroke();
      }
      /* entailles : un arc de pinceau qui s'ouvre et s'efface */
      for (var sI = slashes.length - 1; sI >= 0; sI--) {
        var S = slashes[sI], u = (now - S.t) / 380;
        if (u >= 1) { slashes.splice(sI, 1); continue; }
        var R = 26 + 34 * u, a0 = S.a, a1 = S.a + 2.3 * Math.min(1, u * 2.2);
        ictx.strokeStyle = col;
        for (var st = 0; st < 14; st++) {
          var q0 = a0 + (a1 - a0) * st / 14, q1 = a0 + (a1 - a0) * (st + 1) / 14;
          ictx.globalAlpha = (1 - u) * 0.9;
          ictx.lineWidth = (1 - u) * 7 * Math.sin(Math.PI * (st + 0.5) / 14);
          ictx.beginPath(); ictx.arc(S.x, S.y, R, q0, q1); ictx.stroke();
        }
      }
      for (var d = drops.length - 1; d >= 0; d--) {
        var q = drops[d];
        q.x += q.vx; q.y += q.vy; q.vy += 0.25; q.vx *= 0.96; q.life -= 0.025;
        if (q.life <= 0) { drops.splice(d, 1); continue; }
        ictx.globalAlpha = q.life; ictx.fillStyle = col;
        ictx.beginPath(); ictx.arc(q.x, q.y, q.r * q.life, 0, Math.PI * 2); ictx.fill();
      }
      ictx.globalAlpha = 1;
      ictx.globalCompositeOperation = 'source-over';
      /* moulinet du bâton : un cercle d'encre suit la pointe opposée */
      for (var rI = rings.length - 1; rI >= 0; rI--) {
        var Rg = rings[rI], ru = (now - Rg.t) / 520;
        if (ru >= 1) { rings.splice(rI, 1); continue; }
        var sweep = Math.PI * 2 * (1 - Math.pow(1 - Math.min(1, ru / 0.85), 3));
        ictx.globalCompositeOperation = 'lighter'; ictx.strokeStyle = col; ictx.lineCap = 'round';
        for (var rs = 0; rs < 24; rs++) {
          var b0 = Rg.a + sweep * rs / 24, b1 = Rg.a + sweep * (rs + 1) / 24;
          ictx.globalAlpha = (1 - ru) * (0.25 + 0.75 * rs / 24);
          ictx.lineWidth = (1 - ru) * (1 + 6 * rs / 24);
          ictx.beginPath(); ictx.arc(Rg.x, Rg.y, Rg.r + 10 * ru, b0, b1); ictx.stroke();
        }
        ictx.globalAlpha = 1; ictx.globalCompositeOperation = 'source-over';
      }
      if (!shown) return;

      var wNow = weaponNow();
      if (wNow !== weapon) { weapon = wNow; swapT = now; tasselInit = false; }
      var su = Math.min(1, (now - swapT) / 420);
      var swapScale = su >= 1 ? 1 : 1 + 2.7 * Math.pow(su - 1, 3) + 1.7 * Math.pow(su - 1, 2);   /* easeOutBack */

      /* balancier : la lame suit la vitesse horizontale, ressort amorti */
      vxs += ((mx - pmx) - vxs) * 0.25; pmx = mx;
      var target = (hoverLink ? 22 : hoverView ? 35 : 45) + clamp(vxs * 1.1, -35, 35);
      angV += (target - ang) * 0.16; angV *= 0.74; ang += angV;
      scl += ((hoverLink ? 1.4 : 1.2) - scl) * 0.2;
      var spu = (now - spinT) / 520, spin = spu < 1 ? 360 * (1 - Math.pow(1 - spu, 3)) : 0;
      var ar = (ang + (weapon === 'gun' ? spin : 0)) * Math.PI / 180, ca = Math.cos(ar), sa = Math.sin(ar);
      var k;
      if (weapon === 'gun') {
        ictx.save();
        ictx.translate(mx, my); ictx.rotate(ar); ictx.scale(scl * swapScale, scl * swapScale);
        baton(ictx, col, hoverLink || hoverView);
        ictx.restore();
        tag.style.transform = 'translate3d(' + (mx + 18) + 'px,' + (my - 34) + 'px,0)';
        return;
      }

      /* pompon : chaîne souple accrochée au pommeau */
      var px = mx + ca * 69 * scl * swapScale, py = my + sa * 69 * scl * swapScale;
      if (!tasselInit) { tassel.forEach(function (t, k) { t.x = t.px = px; t.y = t.py = py + k * 4; }); tasselInit = true; }
      for (k = 1; k < tassel.length; k++) {
        var t = tassel[k], vx = (t.x - t.px) * 0.9, vy = (t.y - t.py) * 0.9;
        t.px = t.x; t.py = t.y; t.x += vx; t.y += vy + 0.6;
      }
      for (var it = 0; it < 3; it++) {
        tassel[0].x = px; tassel[0].y = py;
        for (k = 1; k < tassel.length; k++) {
          var A = tassel[k - 1], B = tassel[k], dx = B.x - A.x, dy = B.y - A.y, dl = Math.hypot(dx, dy) || 1, f = (dl - 4.2) / dl;
          B.x -= dx * f; B.y -= dy * f;
        }
      }
      ictx.lineCap = 'round';
      for (var strand = -1; strand <= 1; strand++) {
        ictx.beginPath(); ictx.moveTo(tassel[0].x, tassel[0].y);
        for (k = 1; k < tassel.length; k++) ictx.lineTo(tassel[k].x + strand * k * 0.55, tassel[k].y);
        ictx.strokeStyle = col; ictx.lineWidth = strand === 0 ? 2.2 : 1.4; ictx.globalAlpha = 0.95; ictx.stroke();
      }
      ictx.globalAlpha = 1;
      ictx.beginPath(); ictx.arc(tassel[1].x, tassel[1].y, 2.2, 0, Math.PI * 2); ictx.fillStyle = col; ictx.fill();

      /* le sabre */
      ictx.save();
      ictx.translate(mx, my); ictx.rotate(ar); ictx.scale(scl * swapScale, scl * swapScale);
      sabre(ictx, col, hoverLink || hoverView);
      ictx.restore();

      tag.style.transform = 'translate3d(' + (mx + 18) + 'px,' + (my - 34) + 'px,0)';
    })();
  }

  if (!HAS_GSAP || RM) return;   /* tout ce qui suit est de l'animation pure */

  /* ═══ Textes découpés en lettres ═══ */
  function splitChars(node) {
    if (node.getAttribute('data-fx-split')) return node._fxChars || [];
    node.setAttribute('data-fx-split', '1');
    node.setAttribute('aria-label', node.textContent.replace(/\s+/g, ' ').trim());
    var chars = [];
    (function walk(n) {
      Array.prototype.slice.call(n.childNodes).forEach(function (ch) {
        if (ch.nodeType === 3) {
          var frag = document.createDocumentFragment();
          ch.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            var w = el('span', 'fx-word'); w.setAttribute('aria-hidden', 'true');
            Array.from(part).forEach(function (c) {
              var o = el('span', 'fx-char-wrap'), i = el('span', 'fx-char'); i.textContent = c;
              o.appendChild(i); w.appendChild(o); chars.push(i);
            });
            frag.appendChild(w);
          });
          n.replaceChild(frag, ch);
        } else if (ch.nodeType === 1 && ch.tagName !== 'BR' && !ch.hasAttribute('data-site-show')) walk(ch);
      });
    })(node);
    node._fxChars = chars;
    return chars;
  }
  function splitWords(node) {
    var words = [];
    (function walk(n) {
      Array.prototype.slice.call(n.childNodes).forEach(function (ch) {
        if (ch.nodeType === 3) {
          var frag = document.createDocumentFragment();
          ch.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            var w = el('span', 'fx-hw'); w.textContent = part; frag.appendChild(w); words.push(w);
          });
          n.replaceChild(frag, ch);
        } else if (ch.nodeType === 1) walk(ch);
      });
    })(node);
    return words;
  }
  FX.splitChars = splitChars;

  FX.onReady(function () {
    /* titres : les lettres jaillissent */
    document.querySelectorAll('.section-title, .page-hero-title, .cta-band-title, .fx-split').forEach(function (h) {
      var chars = splitChars(h);
      var inHero = !!h.closest('.page-hero');
      gsap.fromTo(chars, { yPercent: 120, rotate: 9, opacity: 0 }, {
        yPercent: 0, rotate: 0, opacity: 1, duration: 1.1, ease: 'expo.out', stagger: 0.028,
        delay: inHero ? 0.15 : 0,
        scrollTrigger: inHero ? null : { trigger: h, start: 'top 88%', once: true }
      });
    });
    document.querySelectorAll('.page-hero-eyebrow').forEach(function (e) {
      gsap.fromTo(e, { letterSpacing: '1.4em', opacity: 0 }, { letterSpacing: '0.45em', opacity: 1, duration: 1.4, ease: 'expo.out' });
    });

    /* citations : s'allument mot à mot au défilement */
    document.querySelectorAll('.preview-pull, .about-pull').forEach(function (q) {
      var words = splitWords(q);
      gsap.fromTo(words, { opacity: 0.12 }, { opacity: 1, ease: 'none', stagger: 0.1,
        scrollTrigger: { trigger: q, start: 'top 85%', end: 'bottom 40%', scrub: true } });
    });

    /* chiffres de compétition : défilement aléatoire avant de se figer */
    document.querySelectorAll('.compe-stat-num').forEach(function (n) {
      var nodes = [];
      (function walk(x) { x.childNodes.forEach(function (c) { if (c.nodeType === 3 && /\d/.test(c.textContent)) nodes.push({ n: c, f: c.textContent }); else if (c.nodeType === 1) walk(c); }); })(n);
      ST.create({ trigger: n, start: 'top 90%', once: true, onEnter: function () {
        var o = { p: 0 };
        gsap.to(o, { p: 1, duration: 1.4, ease: 'power3.out', onUpdate: function () {
          nodes.forEach(function (k) {
            k.n.textContent = k.f.replace(/\d/g, function (d) { return o.p > 0.92 ? d : String(Math.floor(Math.random() * 10)); });
          });
        } });
      } });
    });
  });

  /* ═══ Révélation des images + parallaxe ═══ */
  document.querySelectorAll('.preview-image, .teacher-teaser, .gallery-teaser-item, .professor-photo, .gallery-item, .fx-col figure').forEach(function (box) {
    var img = box.querySelector('img');
    if (!img) return;
    gsap.fromTo(box, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut',
      scrollTrigger: { trigger: box, start: 'top 88%', once: true } });
    gsap.fromTo(img, { scale: 1.45 }, { scale: 1.12, duration: 1.8, ease: 'expo.out',
      scrollTrigger: { trigger: box, start: 'top 88%', once: true } });
    if (!box.closest('.fx-col')) {
      gsap.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: 'none',
        scrollTrigger: { trigger: box, start: 'top bottom', end: 'bottom top', scrub: true } });
    }
  });
  document.querySelectorAll('.cta-band-bg').forEach(function (bg) {
    gsap.fromTo(bg, { scale: 1.35, yPercent: -10 }, { scale: 1.05, yPercent: 10, ease: 'none',
      scrollTrigger: { trigger: bg.parentNode, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  /* ═══ Inclinaison selon la vitesse de défilement ═══ */
  var skewEls = document.querySelectorAll('.teachers-teaser, .gallery-teaser, .gallery-grid, .professors-grid, .fx-cols');
  if (skewEls.length) {
    var skewTo = Array.prototype.map.call(skewEls, function (s) { return gsap.quickTo(s, 'skewY', { duration: 0.5, ease: 'power3' }); });
    gsap.ticker.add(function () { var v = clamp(FX.velocity * 0.18, -5, 5); skewTo.forEach(function (f) { f(v); }); });
  }

  /* ═══ Boutons aimantés ═══ */
  if (FINE) {
    document.querySelectorAll('.btn-primary, .btn-outline, .nav-cta, .preview-link, .back-top, .site-selector, .nav-logo').forEach(function (b) {
      var xTo = gsap.quickTo(b, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.35)' });
      var yTo = gsap.quickTo(b, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.35)' });
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.35); yTo((e.clientY - r.top - r.height / 2) * 0.45);
      });
      b.addEventListener('mouseleave', function () { xTo(0); yTo(0); });
    });

    /* cartes éclairées par le curseur */
    document.querySelectorAll('.tarif-card, .tarif-preview-card, .service-card, .planning-card, .contact-location-card, .inscription-card, .doc-card, .contact-info-card').forEach(function (c) {
      c.classList.add('fx-spot');
      c.addEventListener('mousemove', function (e) {
        var r = c.getBoundingClientRect();
        c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });

    /* cartes des profs : inclinaison 3D + reflet */
    document.querySelectorAll('.teacher-teaser, .professor-card').forEach(function (c) {
      c.classList.add('fx-tilt');
      if (getComputedStyle(c).position === 'static') c.style.position = 'relative';
      var g = el('span', 'fx-glare'); g.setAttribute('aria-hidden', 'true'); c.appendChild(g);
      var rX = gsap.quickTo(c, 'rotationX', { duration: 0.6, ease: 'power3' }), rY = gsap.quickTo(c, 'rotationY', { duration: 0.6, ease: 'power3' });
      gsap.set(c, { transformPerspective: 900 });
      c.addEventListener('mousemove', function (e) {
        var r = c.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        rY((px - 0.5) * 10); rX((0.5 - py) * 8);
        c.style.setProperty('--gx', px * 100 + '%'); c.style.setProperty('--gy', py * 100 + '%');
      });
      c.addEventListener('mouseleave', function () { rX(0); rY(0); });
    });
  }

  /* ═══ Bandeau défilant (avant le pied de page) ═══ */
  function marquee() {
    var rows = [
      { cls: '', dir: -1, txt: 'Fan Yao <em>武术</em> Kung-fu <em>功夫</em> Wushu <em>长拳</em> Taolu <em>南拳</em> ' },
      { cls: 'outline', dir: 1, txt: 'Bordeaux <em>剑</em> Talence <em>棍</em> Épée <em>枪</em> Lance <em>刀</em> Sabre <em>太极</em> ' }
    ];
    var box = el('section', 'fx-marquee'); box.setAttribute('aria-hidden', 'true');
    var tracks = rows.map(function (r) {
      var row = el('div', 'fx-marquee-row ' + r.cls);
      var chunk = '<span>' + r.txt + r.txt + '</span>';
      row.innerHTML = chunk + chunk;
      box.appendChild(row);
      return { row: row, dir: r.dir, x: r.dir > 0 ? -50 : 0 };
    });
    var foot = document.querySelector('footer');
    if (foot) foot.parentNode.insertBefore(box, foot);
    var skew = 0;
    gsap.ticker.add(function (time, dt) {
      var v = FX.velocity || 0;
      skew += (clamp(v * 0.3, -12, 12) - skew) * 0.1;
      tracks.forEach(function (t) {
        var dirv = v !== 0 ? (v > 0 ? 1 : -1) * t.dir : t.dir;
        t.x += dirv * (0.0012 + Math.min(Math.abs(v), 60) * 0.00025) * dt;   /* en % de la piste, dt en ms */
        if (t.x <= -50) t.x += 50; if (t.x > 0) t.x -= 50;
        t.row.style.transform = 'translate3d(' + t.x + '%,0,0) skewX(' + (-skew) + 'deg)';
      });
    });
  }
  marquee();

  /* ═══ En-têtes des pages intérieures : caractère géant + braises + parallaxe ═══ */
  document.querySelectorAll('.page-hero').forEach(function (hero) {
    var info = PAGES[pageKey] || ['', '武'];
    var k = el('span', 'fx-kanji'); k.textContent = info[1]; k.setAttribute('aria-hidden', 'true');
    hero.appendChild(k);
    var bg = hero.querySelector('.page-hero-bg');
    FX.onReady(function () {
      gsap.fromTo(k, { opacity: 0, scale: 1.4, rotate: -8 }, { opacity: 1, scale: 1, rotate: 0, duration: 2, ease: 'expo.out' });
      if (bg) gsap.fromTo(bg, { scale: 1.3 }, { scale: 1.05, duration: 2.2, ease: 'expo.out' });
    });
    if (bg) gsap.to(bg, { yPercent: 18, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to(k, { yPercent: -30, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    if (FINE && bg) {
      var bx = gsap.quickTo(bg, 'x', { duration: 1.2, ease: 'power3' }), kx = gsap.quickTo(k, 'x', { duration: 1.5, ease: 'power3' });
      hero.addEventListener('mousemove', function (e) { var p = e.clientX / innerWidth - 0.5; bx(p * -30); kx(p * 50); });
    }
    /* braises */
    var cv = el('canvas', 'fx-hero-embers'); cv.setAttribute('aria-hidden', 'true'); hero.appendChild(cv);
    embers(cv, hero, FINE ? 70 : 30);
  });

  /* braises légères (canvas 2D), réutilisées par les en-têtes */
  function embers(cv, host, max) {
    var c = cv.getContext('2d'), W = 0, H = 0, parts = [], on = false;
    function size() { var d = Math.min(devicePixelRatio || 1, 2); W = cv.offsetWidth; H = cv.offsetHeight; cv.width = W * d; cv.height = H * d; c.setTransform(d, 0, 0, d, 0, 0); }
    size(); window.addEventListener('resize', size);
    new IntersectionObserver(function (en) { on = en[0].isIntersecting; }).observe(host);
    gsap.ticker.add(function () {
      if (!on) return;
      c.clearRect(0, 0, W, H);
      if (parts.length < max && Math.random() < 0.5)
        parts.push({ x: Math.random() * W, y: H * (0.4 + Math.random() * 0.6), vx: (Math.random() - 0.5) * 0.6, vy: -(0.4 + Math.random() * 1.6), r: 0.8 + Math.random() * 2.2, life: 1, d: 0.003 + Math.random() * 0.006 });
      c.globalCompositeOperation = 'lighter';
      for (var i = parts.length - 1; i >= 0; i--) {
        var p = parts[i];
        p.x += p.vx + Math.sin((p.y + p.x) * 0.01) * 0.3; p.y += p.vy; p.life -= p.d;
        if (p.life <= 0) { parts.splice(i, 1); continue; }
        var g = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        g.addColorStop(0, FX.color); g.addColorStop(1, 'rgba(0,0,0,0)');
        c.globalAlpha = Math.min(1, p.life * 1.2);
        c.fillStyle = g; c.beginPath(); c.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2); c.fill();
      }
      c.globalAlpha = 1;
    });
  }
  FX.embers = embers;

  /* les positions changent quand les polices arrivent */
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ST.refresh(); });
  window.addEventListener('load', function () { ST.refresh(); });
})();
