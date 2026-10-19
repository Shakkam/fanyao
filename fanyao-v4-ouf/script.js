/* ═══════════════════════════════════════════════════
   FAN YAO — Kung-fu Wushu Bordeaux · v2 multi-pages
   Shared JavaScript
   ═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Reduced-motion preference ────────────────────── */
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ═══════════════════════════════════════════════════
     SITE SELECTOR — Bordeaux (blue) / Talence (red)
     ═══════════════════════════════════════════════════ */

  /* Accent colours for the sweep overlay (JS-side, no CSS var needed here) */
  var SITE_ACCENT = {
    bordeaux: '#1e90ff',
    talence:  '#e63946'
  };

  /* Ember particle hue ranges per site */
  var EMBER_HUES = {
    bordeaux: { base: 200, range: 25 }, /* electric blue — 200-225° */
    talence:  { base: 0,   range: 32 }  /* red-amber     —   0-32° */
  };

  /* Track current site so ember can read it */
  var currentSite = document.documentElement.getAttribute('data-site') || 'bordeaux';

  /* Create the sweep overlay once */
  var sweepEl = document.createElement('div');
  sweepEl.id = 'theme-sweep';
  sweepEl.setAttribute('aria-hidden', 'true');
  document.body.appendChild(sweepEl);

  /* Update all [data-site-pick] button aria-pressed states */
  function syncSiteButtons(site) {
    document.querySelectorAll('[data-site-pick]').forEach(function (btn) {
      var matches = btn.getAttribute('data-site-pick') === site;
      btn.setAttribute('aria-pressed', matches ? 'true' : 'false');
    });
  }

  /* Apply theme without animation (used for initial load) */
  function applyTheme(site) {
    currentSite = site;
    document.documentElement.setAttribute('data-site', site);
    try { localStorage.setItem('fy-site', site); } catch (e) {}
    syncSiteButtons(site);
  }

  /* Switch site with optional sweep animation */
  function setSite(site) {
    if (site === currentSite) return;

    if (!reducedMotion) {
      /* Colour the sweep to the incoming theme */
      sweepEl.style.background = SITE_ACCENT[site] || SITE_ACCENT.talence;
      sweepEl.classList.remove('sweeping');
      /* Force reflow so animation restarts cleanly */
      void sweepEl.offsetWidth;
      sweepEl.classList.add('sweeping');

      /* Apply theme at animation midpoint so the reveal feels instantaneous */
      var mid = 220; /* ms — matches 40% of 550ms sweep */
      setTimeout(function () { applyTheme(site); }, mid);

      sweepEl.addEventListener('animationend', function () {
        sweepEl.classList.remove('sweeping');
      }, { once: true });
    } else {
      applyTheme(site);
    }
  }

  /* Initialise buttons on page load */
  syncSiteButtons(currentSite);

  /* Wire up all selector buttons (nav desktop + mobile) */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-site-pick]');
    if (!btn) return;
    setSite(btn.getAttribute('data-site-pick'));
  });

  /* Keyboard: left/right arrow to switch within the group */
  document.addEventListener('keydown', function (e) {
    var btn = e.target.closest('[data-site-pick]');
    if (!btn) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      var all = Array.from(document.querySelectorAll('[data-site-pick]'));
      var idx = all.indexOf(btn);
      var next = all[(idx + (e.key === 'ArrowRight' ? 1 : -1) + all.length) % all.length];
      if (next) { next.focus(); setSite(next.getAttribute('data-site-pick')); }
    }
  });

  /* ── Active nav link (based on current page URL) ───── */
  function setActiveNavLink() {
    const path = window.location.pathname;
    let page = path.split('/').pop().replace('.html', '') || 'index';
    if (page === '' || page === '/') page = 'index';

    document.querySelectorAll('.nav-links a, .nav-mobile a').forEach(function (link) {
      const href = link.getAttribute('href') || '';
      const linkPage = href.replace('.html', '').replace('./', '').replace('/', '') || 'index';
      const isActive = linkPage === page;
      link.classList.toggle('active', isActive);
    });
  }
  setActiveNavLink();

  /* ── Nav scroll behavior ───────────────────────────── */
  var nav = document.getElementById('main-nav');
  if (nav) {
    window.addEventListener('scroll', function () {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
    // Set initial state
    if (window.scrollY > 40) nav.classList.add('scrolled');
  }

  /* ── Burger / mobile menu ──────────────────────────── */
  var burger = document.getElementById('burger-btn');
  var mobileNav = document.getElementById('mobile-nav');

  if (burger && mobileNav) {
    burger.addEventListener('click', function () {
      var isOpen = burger.classList.toggle('open');
      burger.setAttribute('aria-expanded', isOpen);
      mobileNav.hidden = !isOpen;
      mobileNav.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        burger.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        mobileNav.hidden = true;
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && burger.classList.contains('open')) {
        burger.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        mobileNav.hidden = true;
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
        burger.focus();
      }
    });
  }

  /* ── Scroll reveal (Intersection Observer) ─────────── */
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    if (reducedMotion) {
      // Make all visible immediately
      revealEls.forEach(function (el) { el.classList.add('visible'); });
    } else {
      var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

      revealEls.forEach(function (el) { revealObserver.observe(el); });
    }
  }

  /* ── Back to top ────────────────────────────────────── */
  var backTop = document.getElementById('back-top');
  if (backTop) {
    window.addEventListener('scroll', function () {
      backTop.classList.toggle('visible', window.scrollY > 600);
    }, { passive: true });
    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ── Ember / spark particle effect (hero only) ──────── */
  /*
   * Lightweight canvas particle system evoking wushu training sparks.
   * Disabled when: prefers-reduced-motion OR canvas not supported.
   * Paused automatically when hero leaves viewport.
   */
  if (!reducedMotion) {
    var canvas = document.getElementById('ember-canvas');
    if (canvas && canvas.getContext) {
      var ctx = canvas.getContext('2d');
      var isMobile = window.innerWidth < 768;
      var MAX_PARTICLES = isMobile ? 35 : 75;
      var particles = [];
      var emberRaf = null;
      var emberRunning = false;

      function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
      }
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas, { passive: true });

      function spawnParticle() {
        /* Spawn from a few horizontal positions for a natural feel */
        var spawnX = canvas.width * (0.1 + Math.random() * 0.8);
        var spawnY = canvas.height * (0.35 + Math.random() * 0.65);
        /* Use current-site hue — hot embers (talence) or cold sparks (bordeaux) */
        var hueConf = EMBER_HUES[currentSite] || EMBER_HUES.talence;
        particles.push({
          x: spawnX,
          y: spawnY,
          vx: (Math.random() - 0.5) * 0.7,
          vy: -(0.6 + Math.random() * 1.8),
          radius: 0.9 + Math.random() * 2.2,
          life: 1.0,
          /* vary decay so particles have different lifespans */
          decay: 0.0035 + Math.random() * 0.005,
          /* hue derived from current site */
          hue: hueConf.base + Math.floor(Math.random() * hueConf.range),
          /* slight turbulence seed */
          turb: (Math.random() - 0.5) * 0.03,
        });
      }

      function drawEmbers() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        /* Possibly spawn a new particle this frame */
        if (particles.length < MAX_PARTICLES && Math.random() < 0.6) {
          spawnParticle();
        }

        for (var i = particles.length - 1; i >= 0; i--) {
          var p = particles[i];

          /* Update */
          p.vx += p.turb;
          p.x += p.vx;
          p.y += p.vy;
          p.life -= p.decay;

          /* Remove dead particles */
          if (p.life <= 0 || p.y < -10) {
            particles.splice(i, 1);
            continue;
          }

          /* Draw glowing ember */
          var alpha = Math.min(1, p.life * 1.1);
          var r = p.radius * (1 + (1 - p.life) * 0.5); /* grows slightly as it rises */
          var grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 4);
          grd.addColorStop(0,   'hsla(' + p.hue + ', 95%, 72%, ' + alpha + ')');
          grd.addColorStop(0.4, 'hsla(' + p.hue + ', 88%, 55%, ' + (alpha * 0.6) + ')');
          grd.addColorStop(1,   'hsla(' + p.hue + ', 80%, 40%, 0)');

          ctx.save();
          ctx.globalCompositeOperation = 'lighter'; /* additive blend = natural glow */
          ctx.beginPath();
          ctx.arc(p.x, p.y, r * 4, 0, Math.PI * 2);
          ctx.fillStyle = grd;
          ctx.fill();
          ctx.restore();
        }

        if (emberRunning) {
          emberRaf = requestAnimationFrame(drawEmbers);
        }
      }

      function startEmbers() {
        if (!emberRunning) {
          emberRunning = true;
          emberRaf = requestAnimationFrame(drawEmbers);
        }
      }

      function stopEmbers() {
        emberRunning = false;
        if (emberRaf) {
          cancelAnimationFrame(emberRaf);
          emberRaf = null;
        }
        /* Clear canvas when paused */
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles = [];
      }

      /* Only run when hero is in viewport */
      var heroSection = document.getElementById('hero-index');
      if (heroSection) {
        var visibilityObserver = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              startEmbers();
            } else {
              stopEmbers();
            }
          });
        }, { threshold: 0.1 });
        visibilityObserver.observe(heroSection);
      } else {
        startEmbers();
      }
    }
  }

  /* ── Brush stroke ink dividers (CSS-only, loaded via class) ── */
  /* Nothing additional needed; CSS handles the SVG brushstroke dividers */

})();
