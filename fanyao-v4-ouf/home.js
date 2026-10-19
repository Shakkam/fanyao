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

  /* moteur repris de taolu-ombre : poses clés, interpolation monotone, cinématique inverse */
  var DEG = Math.PI / 180;
  function dir(a) { return { x: Math.sin(a * DEG), y: Math.cos(a * DEG) }; }
  function add(p, d, l) { return { x: p.x + d.x * l, y: p.y + d.y * l }; }

  /* ── Proportions du personnage (unités figure, ~190 de haut) ── */
  var L = { torso: 50, neck: 7, headR: 11, ua: 29, fa: 27, th: 44, sh: 42, foot: 15 };
  var ANK = 4; /* hauteur de la cheville quand le pied est à plat */

  /* ── Poses clés.
        Coordonnées « monde » : x vers l'avant, h = hauteur au-dessus du sol.
        hx/hh hanche · lx/lh, rx/rh chevilles (gauche = jambe arrière au départ) · lk/rk sens du genou (+1 avant, -1 arrière)
        T tronc · UA bras · FA avant-bras · F pied, en degrés : 0 = vers le bas, 90 = vers l'avant, 180 = vers le haut.
        Les jambes sont calculées par cinématique inverse : un pied qui ne change pas de position entre deux poses reste planté.
        d = durée pour atteindre la pose, h = temps de maintien. ── */
  var SRC = [
    { d: 0, h: 0.4, cap: ["并步", "Bing bu", "Pieds joints, prêt à commencer"],
      p: { hx: -70, hh: 88, lx: -73, lh: ANK, rx: -67, rh: ANK, lk: 1, rk: 1, lF: 90, rF: 90, T: 180, rUA: 8, rFA: 4, lUA: -8, lFA: -4 } },
    { d: 0.45, h: 0.5, cap: ["抱拳礼", "Bao quan li", "Le salut : poing contre paume"],
      p: { rUA: 55, rFA: 150, lUA: 48, lFA: 140 } },
    { d: 0.35, h: 0.05, p: { rUA: -25, rFA: 95, lUA: -30, lFA: 90 } },
    { d: 0.4, h: 0, cap: ["马步冲拳", "Ma bu chong quan", "Coup de poing en position du cavalier"],
      p: { hh: 60, lx: -122, rx: -18, lk: -1 } },
    { d: 0.14, h: 0.25, p: { rUA: 90, rFA: 90 } },
    { d: 0.3, h: 0.2, cap: ["弓步冲拳", "Gong bu chong quan", "Coup de poing en fente avant"],
      p: { hx: -62, hh: 65, T: 175, lUA: 90, lFA: 90, rUA: -25, rFA: 95 } },
    { d: 0.22, h: 0.06, cap: ["弹腿", "Tan tui", "Coup de pied fouetté"],
      p: { hx: -22, hh: 86, lx: 52, lh: 52, lk: 1, lF: 100, T: 186, rUA: 90, rFA: 90, lUA: -25, lFA: 95 } },
    { d: 0.25, h: 0.12, p: { hx: 42, hh: 65, lx: 86, lh: ANK, lF: 90, T: 175, rUA: 90, rFA: 90, lUA: -25, lFA: 95 } },
    { d: 0.22, h: 0.04, cap: ["正踢腿", "Zheng ti tui", "Coup de pied montant, jambe tendue"],
      p: { hx: 82, hh: 86, rx: 122, rh: 156, rF: 160, T: 180, rUA: 100, rFA: 92, lUA: -100, lFA: -92 } },
    { d: 0.35, h: 0.3, cap: ["仆步穿掌", "Pu bu chuan zhang", "Fente basse, la main file le long de la jambe"],
      p: { hx: 94, hh: 30, rx: 172, rh: ANK, rF: 90, T: 158, rUA: 80, rFA: 85, lUA: -160, lFA: -175 } },
    { d: 0.3, h: 0.02, p: { hx: 136, hh: 70, T: 175, rUA: 100, rFA: 120, lUA: -60, lFA: -40 } },
    { d: 0.3, h: 0.35, cap: ["独立步", "Du li bu", "Posture de la grue, sur une jambe"],
      p: { hx: 168, hh: 88, lx: 212, lh: 46, lF: 40, T: 180, rUA: 172, rFA: 175, lUA: 92, lFA: 95 } },
    { d: 0.25, h: 0, p: { hx: 185, hh: 58, lx: 205, lh: ANK, lF: 90, T: 165, rUA: -60, rFA: -50, lUA: -70, lFA: -60 } },
    { d: 0.26, h: 0.04, cap: ["腾空飞脚", "Teng kong fei jiao", "Coup de pied sauté, la main frappe le pied"],
      p: { hx: 225, hh: 168, rx: 280, rh: 218, rF: 150, lx: 255, lh: 118, lF: 60, T: 188, rUA: 118, rFA: 128, lUA: -130, lFA: -115 } },
    { d: 0.25, h: 0.03, p: { hx: 275, hh: 60, lx: 258, lh: ANK, rx: 300, rh: ANK, rF: 90, lF: 90, T: 165, rUA: 100, rFA: 95, lUA: -100, lFA: -95 } },
    { d: 0.3, h: 0.35, cap: ["虚步亮掌", "Xu bu liang zhang", "Position vide, la paume s'ouvre au-dessus de la tête"],
      p: { hx: 262, hh: 66, rx: 314, rh: 12, rF: 55, T: 179, rUA: 70, rFA: 110, lUA: 165, lFA: 95 } },
    { d: 0.35, h: 0.05, cap: ["收势", "Shou shi", "Fermeture"],
      p: { hx: 261, hh: 88, rx: 264, rh: ANK, rF: 90, T: 180, rUA: -25, rFA: 95, lUA: -30, lFA: 90 } },
    { d: 0.35, h: 0.7, cap: ["抱拳礼", "Bao quan li", "Le salut final"],
      p: { rUA: 55, rFA: 150, lUA: 48, lFA: 140 } }
  ];

  /* Naturel : canaux qui dépassent un peu la pose avant de s'y poser, et retard des segments distaux (s) */
  var OVS = ["T", "rUA", "rFA", "lUA", "lFA"];
  var LAG = { rUA: 0.03, lUA: 0.03, rFA: 0.07, lFA: 0.07, rF: 0.04, lF: 0.04 };

  /* Clés complètes (héritage + maintien = clé dupliquée) */
  var KT = [], KV = [], CAPS = [], prevP = null, time = 0;
  SRC.forEach(function (k) {
    var full = {}, key;
    if (prevP) for (key in prevP) full[key] = prevP[key];
    for (key in k.p) full[key] = k.p[key];
    var startT = time;
    time += k.d; KT.push(time); KV.push(full);
    if (k.cap) CAPS.push({ han: k.cap[0], py: k.cap[1], fr: k.cap[2], start: startT });
    if (k.h > 0) {
      if (prevP) {
        /* la pose est d'abord légèrement dépassée, les hanches s'enfoncent, puis tout se pose pendant le maintien */
        var arr = {};
        for (key in full) arr[key] = full[key];
        OVS.forEach(function (c) { arr[c] += Math.max(-7, Math.min(7, (full[c] - prevP[c]) * 0.08)); });
        arr.hh -= 1.5;
        KV[KV.length - 1] = arr;
      }
      time += k.h; KT.push(time); KV.push(full);
    }
    prevP = full;
  });
  var total = time, CURTAIN = 1.2, LOOP = total + CURTAIN;
  var CH = Object.keys(KV[0]);

  /* Interpolation cubique monotone (Fritsch–Carlson) : fluide, sans dépassement,
     donc une valeur constante entre deux clés reste strictement constante (pied planté). */
  var SLOPES = {};
  CH.forEach(function (c) {
    var n = KT.length, d = [], m = [], k;
    for (k = 0; k < n; k++) m.push(0);
    for (k = 0; k < n - 1; k++) d.push((KV[k + 1][c] - KV[k][c]) / (KT[k + 1] - KT[k] || 1));
    for (k = 1; k < n - 1; k++) {
      if (d[k - 1] * d[k] <= 0) continue;
      var h0 = KT[k] - KT[k - 1], h1 = KT[k + 1] - KT[k], w1 = 2 * h1 + h0, w2 = h1 + 2 * h0;
      m[k] = (w1 + w2) / (w1 / d[k - 1] + w2 / d[k]);
    }
    SLOPES[c] = m;
  });
  function segAt(t) {
    for (var i = 0; i < KT.length - 1; i++) if (t < KT[i + 1]) return i;
    return KT.length - 2;
  }
  function rawPose(t) {
    if (t >= total) return t < total + CURTAIN / 2 ? KV[KV.length - 1] : KV[0];
    var i = segAt(t), h = KT[i + 1] - KT[i], u = h > 0 ? Math.max(0, Math.min(1, (t - KT[i]) / h)) : 1;
    var u2 = u * u, u3 = u2 * u;
    var h00 = 2 * u3 - 3 * u2 + 1, h10 = u3 - 2 * u2 + u, h01 = -2 * u3 + 3 * u2, h11 = u3 - u2;
    var o = {};
    CH.forEach(function (c) {
      var m = SLOPES[c];
      o[c] = h00 * KV[i][c] + h10 * h * m[i] + h01 * KV[i + 1][c] + h11 * h * m[i + 1];
    });
    /* pas : un pied qui se déplace au sol décolle en arc */
    ["l", "r"].forEach(function (s) {
      var a = KV[i], b = KV[i + 1], dx = b[s + "x"] - a[s + "x"];
      if (a[s + "h"] <= ANK + 0.5 && b[s + "h"] <= ANK + 0.5 && Math.abs(dx) > 3)
        o[s + "h"] += Math.min(0.3 * Math.abs(dx), 18) * Math.sin(Math.PI * u);
    });
    return o;
  }

  /* Pose finale : retard des segments distaux, réaction du tronc aux accélérations, respiration */
  function poseAt(t) {
    var base = rawPose(t), o = {}, c;
    for (c in base) o[c] = base[c];
    if (t < total) {
      var cache = {};
      for (c in LAG) {
        var tl = Math.max(0, t - LAG[c]);
        if (!cache[tl]) cache[tl] = rawPose(tl);
        o[c] = cache[tl][c];
      }
      /* le buste se penche contre l'accélération des hanches */
      var e = 0.03, ax = (rawPose(Math.min(total - 0.001, t + e)).hx - 2 * base.hx + rawPose(Math.max(0, t - e)).hx) / (e * e);
      o.T -= Math.max(-6, Math.min(6, ax * 0.0035));
    }
    /* respiration : rien n'est jamais tout à fait figé */
    o.hh += 0.9 * Math.sin(t * 2.4); o.T += 0.7 * Math.sin(t * 1.9 + 1);
    o.rUA += 1.6 * Math.sin(t * 2.1); o.lUA += 1.6 * Math.sin(t * 2.1 + 2); o.rFA += 2 * Math.sin(t * 2.6 + 1); o.lFA += 2 * Math.sin(t * 2.6 + 3);
    return o;
  }

  /* Cinématique inverse à deux segments : genou placé du côté demandé */
  function solveLeg(hip, target, kd) {
    var a = L.th, b = L.sh, dx = target.x - hip.x, dy = target.y - hip.y, d = Math.hypot(dx, dy) || 0.001;
    var dd = Math.max(Math.abs(a - b) + 0.01, Math.min(a + b - 0.01, d));
    var ux = dx / d, uy = dy / d, ca = (a * a + dd * dd - b * b) / (2 * a * dd);
    ca = Math.max(-1, Math.min(1, ca));
    var sa = Math.sqrt(1 - ca * ca), side = kd >= 0 ? 1 : -1, nx = -uy, ny = ux;
    var knee = { x: hip.x + a * (ux * ca - nx * sa * side), y: hip.y + a * (uy * ca - ny * sa * side) };
    var kx = target.x - knee.x, ky = target.y - knee.y, kl = Math.hypot(kx, ky) || 1;
    return { knee: knee, ankle: { x: knee.x + kx / kl * b, y: knee.y + ky / kl * b } };
  }

  /* ── Squelette en coordonnées monde (y vers le bas, sol en y = 0) ── */
  function skeleton(p) {
    var hip = { x: p.hx, y: -p.hh }, dT = dir(p.T);
    var sk = { hip: hip, dT: dT };
    sk.shoulder = add(hip, dT, L.torso - 4);
    sk.neck = add(hip, dT, L.torso);
    sk.head = add(sk.neck, dir(180 + (p.T - 180) * 0.5), L.neck + L.headR - 2); /* la tête reste plus droite que le buste */
    ["r", "l"].forEach(function (s) {
      var e = add(sk.shoulder, dir(p[s + "UA"]), L.ua);
      var h = add(e, dir(p[s + "FA"]), L.fa);
      var leg = solveLeg(hip, { x: p[s + "x"], y: -p[s + "h"] }, p[s + "k"]);
      var a = leg.ankle;
      sk[s] = { elbow: e, hand: h, knee: leg.knee, ankle: a,
        toe: add(a, dir(p[s + "F"]), L.foot), heel: add(a, dir(p[s + "F"] + 180), 4) };
    });
    return sk;
  }



    function line(a, b, w) { ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
  function dot(p, r) { ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill(); }

  /* segment effilé : largeur wa au départ, wb à l'arrivée, bouts arrondis */
  function limb(a, b, wa, wb) {
    var dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
    ctx.beginPath();
    ctx.moveTo(a.x + nx * wa / 2, a.y + ny * wa / 2);
    ctx.lineTo(b.x + nx * wb / 2, b.y + ny * wb / 2);
    ctx.lineTo(b.x - nx * wb / 2, b.y - ny * wb / 2);
    ctx.lineTo(a.x - nx * wa / 2, a.y - ny * wa / 2);
    ctx.closePath(); ctx.fill();
    dot(a, wa / 2); dot(b, wb / 2);
  }

  function drawFigure(sk) {
    var dT = sk.dT, n = { x: -dT.y, y: dT.x };
    function at(d, w) { var c = add(sk.hip, dT, d); return [add(c, n, w), add(c, n, -w)]; }
    /* tronc : hanches, taille, poitrine, épaules arrondies */
    var hp = at(0, 11), wa = at(17, 9.5), ch = at(34, 12.5), sh = at(L.torso - 4, 11.5), nk = at(L.torso + 1, 4);
    ctx.beginPath();
    ctx.moveTo(hp[0].x, hp[0].y);
    ctx.quadraticCurveTo(wa[0].x, wa[0].y, ch[0].x, ch[0].y);
    ctx.quadraticCurveTo(sh[0].x, sh[0].y, nk[0].x, nk[0].y);
    ctx.lineTo(nk[1].x, nk[1].y);
    ctx.quadraticCurveTo(sh[1].x, sh[1].y, ch[1].x, ch[1].y);
    ctx.quadraticCurveTo(wa[1].x, wa[1].y, hp[1].x, hp[1].y);
    ctx.closePath(); ctx.fill(); ctx.lineWidth = 3; ctx.stroke();
    /* bande de ceinture à la taille */
    limb(at(15, 10.5)[0], at(15, 10.5)[1], 5, 5);
    limb(sk.neck, sk.head, 7, 9);
    dot(sk.head, L.headR + 0.5);
    /* chignon, côté arrière */
    var bun = add(sk.head, dir(Math.atan2(dT.x, dT.y) / DEG + 38), L.headR + 2);
    dot(bun, 5.2);
    ["l", "r"].forEach(function (s) {
      var q = sk[s];
      limb(sk.hip, q.knee, 19, 14);   /* pantalon ample */
      limb(q.knee, q.ankle, 14, 10);
      dot(q.ankle, 7);                /* revers resserré à la cheville */
      limb(q.heel, q.toe, 7.5, 5);
      limb(sk.shoulder, q.elbow, 10.5, 8);
      limb(q.elbow, q.hand, 8, 6);
      dot(q.hand, 5.6);
    });
  }



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
