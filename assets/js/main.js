/* Tahsin Farjana Elahi — Portfolio 2026
   Motion engine: Lenis buttery scroll · pinned horizontal chapters ·
   velocity-reactive infinite loops · scrubbed side-drift entrances ·
   chapter HUD · hero camera scrub · preloader · cursor · magnetic.
   Everything degrades gracefully: no-JS / mobile / reduced-motion
   fall back to the clean vertical editorial layout. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var desktopPin = window.matchMedia('(min-width: 900px) and (hover: hover) and (pointer: fine)').matches;

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  /* ---------- Preloader ---------- */
  var preloader = document.getElementById('preloader');
  var countEl = document.getElementById('preloaderCount');
  var fillEl = document.getElementById('preloaderFill');

  function finishLoad() {
    if (!preloader || preloader.classList.contains('done')) return;
    preloader.classList.add('done');
    document.body.classList.add('loaded');
    setTimeout(function () { preloader.style.display = 'none'; }, 1000);
  }

  if (reduceMotion) {
    finishLoad();
  } else {
    var progress = 0;
    var tick = setInterval(function () {
      progress += Math.random() * 14 + 4;
      if (progress >= 100) {
        progress = 100;
        clearInterval(tick);
        setTimeout(finishLoad, 350);
      }
      if (countEl) countEl.textContent = String(Math.floor(progress)).padStart(2, '0');
      if (fillEl) fillEl.style.width = progress + '%';
    }, 110);
    setTimeout(finishLoad, 5000); // safety: never trap the visitor
  }

  /* ---------- Binary reveals (chapter intro panels) ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  var statement = document.querySelector('.statement');

  function revealAll() {
    revealEls.forEach(function (el) { el.classList.add('in'); });
    if (statement) statement.classList.add('in');
  }

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealAll();
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
    if (statement) io.observe(statement);
  }

  if (reduceMotion) return; // the motion engine below is skipped entirely

  document.body.classList.add('js');

  /* Images fade in over a paper placeholder instead of flashing white */
  (function armImages(){
    var imgs = document.querySelectorAll('.sheet-frame img, .loop-track img, .hero-img');
    Array.prototype.forEach.call(imgs, function (im){
      var on = function(){ im.classList.add('ok'); };
      if (im.complete && im.naturalWidth > 0) { on(); }
      else {
        im.addEventListener('load', on, { once:true });
        im.addEventListener('error', on, { once:true });
      }
    });
  })();

  /* ---------- Lenis buttery smooth scroll ---------- */
  var lenis = null;
  if (typeof Lenis !== 'undefined') {
    try {
      lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
      document.documentElement.classList.add('lenis-on');
      var lenisRaf = function (t) { lenis.raf(t); requestAnimationFrame(lenisRaf); };
      requestAnimationFrame(lenisRaf);
    } catch (e) { lenis = null; }
  }

  /* Anchor links glide through Lenis */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id && id.length > 1) {
        var t = document.querySelector(id);
        if (t) {
          e.preventDefault();
          if (lenis) lenis.scrollTo(t, { duration: 1.8 });
          else t.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  /* ---------- Pinned horizontal chapters ---------- */
  var hOn = desktopPin && !reduceMotion;
  if (hOn) document.documentElement.classList.add('h-on');

  // Document-relative top: immune to scroll, so the frame loop never
  // forces a layout read (the old getBoundingClientRect-per-frame calls
  // starved the animation loop and made wheel scrolling stall-and-jump).
  function docTop(el){ var t = 0; while (el){ t += el.offsetTop; el = el.offsetParent; } return t; }

  var chapters = [];
  document.querySelectorAll('.chapter').forEach(function (sec) {
    var wrap = sec.querySelector('.hwrap');
    var track = sec.querySelector('.htrack');
    if (!wrap || !track) return;
    chapters.push({
      sec: sec,
      wrap: wrap,
      track: track,
      panels: Array.prototype.slice.call(track.querySelectorAll('.hpanel')),
      cur: sec.querySelector('.hmeta-cur'),
      bar: sec.querySelector('.hmeta-bar i'),
      dist: 0, wrapTop: 0, wrapH: 0
    });
  });

  var driftEls = Array.prototype.slice.call(document.querySelectorAll('[data-drift]'));

  var hudChapter = document.getElementById('hudChapter');
  var hudFill = document.getElementById('hudFill');
  var hudZones = [];
  document.querySelectorAll('[data-hud], [data-chapter]').forEach(function (el) {
    hudZones.push({ el: el, label: el.getAttribute('data-chapter') || el.getAttribute('data-hud'), top: 0, bot: 0 });
  });
  var docH = 1, marqueeHalf = 0;

  // Single measurement pass: heights first (they shift later sections),
  // then every document-relative position. Called on init, font load,
  // window load and resize — never per frame.
  function measure() {
    var vw = window.innerWidth, vh = window.innerHeight;
    var i, j, c;
    if (hOn) {
      for (i = 0; i < chapters.length; i++) {
        c = chapters[i];
        c.dist = Math.max(0, c.track.scrollWidth - vw);
        c.wrap.style.height = (vh + c.dist) + 'px';
      }
      for (i = 0; i < chapters.length; i++) {
        c = chapters[i];
        c.wrapTop = docTop(c.wrap);
        c.wrapH = c.wrap.offsetHeight;
        for (j = 0; j < c.panels.length; j++) {
          var p = c.panels[j];
          p._ox = p.offsetLeft;
          p._ow = p.offsetWidth;
          if (!p._img) p._img = p.querySelector('.sheet-frame img');
        }
      }
    }
    for (i = 0; i < driftEls.length; i++) {
      driftEls[i]._top = docTop(driftEls[i]);
      driftEls[i]._h = driftEls[i].offsetHeight;
    }
    for (i = 0; i < hudZones.length; i++) {
      hudZones[i].top = docTop(hudZones[i].el);
      hudZones[i].bot = hudZones[i].top + hudZones[i].el.offsetHeight;
    }
    docH = Math.max(1, document.documentElement.scrollHeight - vh);
    for (i = 0; i < ribbons.length; i++) ribbons[i].half = ribbons[i].track.scrollWidth / 2;
    if (marqueeTrack) marqueeHalf = marqueeTrack.scrollWidth / 2;
  }

  /* ---------- Infinite loops: marquee + image ribbons (JS-driven, velocity-reactive) ---------- */
  var marquee = document.getElementById('marquee');
  var marqueeTrack = document.getElementById('marqueeTrack');
  if (marquee && marqueeTrack) marquee.classList.add('js-marquee');

  var ribbons = [];
  document.querySelectorAll('.loop-ribbon').forEach(function (r) {
    var track = r.querySelector('.loop-track');
    if (!track) return;
    r.classList.add('js-loop');
    ribbons.push({
      track: track,
      dir: parseInt(r.getAttribute('data-dir') || '1', 10),
      x: 0,
      base: 0.55,
      half: 0
    });
  });

  function driveLoop(track, state, base, dir, vel, skewAmt, half) {
    if (!(half > 0)) return;
    state.x -= dir * (base + Math.min(Math.abs(vel) * 0.35, 7));
    state.x = -((((-state.x) % half) + half) % half); // wrap into [-half, 0)
    var skew = clamp(-vel * skewAmt, -10, 10);
    track.style.transform =
      'translate3d(' + state.x.toFixed(1) + 'px,0,0) skewX(' + skew.toFixed(2) + 'deg)';
  }
  var marqueeState = { x: 0 };

  /* ---------- Scrubbed side-drift entrances (rect-free: positions cached in measure()) ---------- */
  function updateDrift(y, vh) {
    for (var i = 0; i < driftEls.length; i++) {
      var el = driftEls[i];
      var top = el._top - y;
      if (top + el._h < -80 || top > vh + 80) continue;
      var dir = el.getAttribute('data-drift') === 'left' ? -1 : 1;
      var centerVh = (top + el._h / 2) / vh;
      // t: 0 as the element approaches the viewport, 1 once it settles near the upper half
      var t = clamp((1.08 - centerVh) / (1.08 - 0.38), 0, 1);
      var e = 1 - Math.pow(1 - t, 3);
      el.style.transform = 'translate3d(' + (dir * (1 - e) * 13).toFixed(2) + 'vw,0,0)';
      el.style.opacity = clamp(t * 2.4, 0, 1).toFixed(3);
    }
  }

  /* ---------- Hero camera scrub ---------- */
  var heroFrame = document.getElementById('heroFrame');
  var heroImg = document.getElementById('heroImg');
  var heroFoot = document.getElementById('heroFoot');
  var heroGhost = document.getElementById('heroGhost');

  function updateHero(y, vh) {
    if (y > vh * 1.4) return;
    if (heroFrame) {
      var s = 1 - Math.min(y / vh, 1) * 0.07;
      heroFrame.style.transform =
        'translate3d(0,' + (y * 0.22).toFixed(1) + 'px,0) scale(' + s.toFixed(4) + ')';
    }
    if (heroGhost) {
      heroGhost.style.transform = 'translate3d(0,' + (y * 0.16).toFixed(1) + 'px,0)';
    }
    if (heroFoot) {
      heroFoot.style.opacity = clamp(1 - y / (vh * 0.55), 0, 1).toFixed(3);
      heroFoot.style.transform = 'translate3d(0,' + (y * 0.12).toFixed(1) + 'px,0)';
    }
  }

  /* ---------- Chapter HUD (rect-free) ---------- */

  function updateHud(y, vh) {
    var mid = vh / 2;
    for (var i = 0; i < hudZones.length; i++) {
      var top = hudZones[i].top - y, bot = hudZones[i].bot - y;
      if (top <= mid && bot >= mid) {
        if (hudChapter && hudChapter.textContent !== hudZones[i].label) {
          hudChapter.textContent = hudZones[i].label;
        }
        break;
      }
    }
    if (hudFill) {
      hudFill.style.transform = 'scaleX(' + clamp(y / docH, 0, 1).toFixed(4) + ')';
    }
  }

  /* ---------- Master scroll loop: zero layout reads per frame ---------- */
  var lastY = window.scrollY;
  var vel = 0;

  function frame() {
    var y = window.scrollY;
    var vh = window.innerHeight;
    var vw = window.innerWidth;
    var inst = y - lastY;
    lastY = y;
    vel += (inst - vel) * 0.12;
    if (Math.abs(vel) < 0.02) vel = 0;

    // Pinned horizontal chapters
    if (hOn) {
      for (var i = 0; i < chapters.length; i++) {
        var c = chapters[i];
        var top = c.wrapTop - y;
        if (top + c.wrapH < 0 || top > vh) continue;
        var total = c.wrapH - vh;
        var p = total > 0 ? clamp(-top / total, 0, 1) : 0;
        var tx = -p * c.dist;
        c.track.style.transform = 'translate3d(' + tx.toFixed(1) + 'px,0,0)';
        if (c.bar) c.bar.style.transform = 'scaleX(' + p.toFixed(3) + ')';
        if (c.cur) {
          var idx = Math.min(c.panels.length, Math.floor(p * c.panels.length) + 1);
          var label = String(idx).padStart(2, '0');
          if (c.cur.textContent !== label) c.cur.textContent = label;
        }
        // Inner parallax: sheet images drift against the track for layered depth
        if (p > 0 && p < 1) {
          for (var j = 0; j < c.panels.length; j++) {
            var pj = c.panels[j];
            if (!pj._img) continue;
            var off = (pj._ox + pj._ow / 2 + tx) - vw / 2;
            pj._img.style.transform =
              'translate3d(' + (-off * 0.055).toFixed(1) + 'px,0,0) scale(1.06)';
          }
        }
      }
    }

    // Infinite loops react to scroll velocity
    if (marqueeTrack) driveLoop(marqueeTrack, marqueeState, 0.9, 1, vel, 0.5, marqueeHalf);
    for (var k = 0; k < ribbons.length; k++) {
      driveLoop(ribbons[k].track, ribbons[k], ribbons[k].base, ribbons[k].dir, vel, 0.35, ribbons[k].half);
    }

    updateDrift(y, vh);
    updateHero(y, vh);
    updateHud(y, vh);

    requestAnimationFrame(frame);
  }

  measure();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  window.addEventListener('load', measure);
  var rzT = null;
  window.addEventListener('resize', function () {
    clearTimeout(rzT);
    rzT = setTimeout(measure, 150);
  });
  requestAnimationFrame(frame);

  if (!finePointer) return; // pointer-only features below are desktop-only

  /* ---------- Hero pointer drift (subtle camera feel) ---------- */
  var hero = document.querySelector('.hero');
  if (hero && heroImg) {
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var yy = (e.clientY - r.top) / r.height - 0.5;
      heroImg.style.transform =
        'translate(' + (x * 26).toFixed(1) + 'px,' + (yy * 18).toFixed(1) + 'px) scale(1.02)';
    });
    hero.addEventListener('mouseleave', function () {
      heroImg.style.transform = '';
    });
  }

  /* ---------- Magnetic buttons ---------- */
  document.querySelectorAll('.btn-magnetic').forEach(function (btn) {
    var strength = 0.35;
    btn.addEventListener('mousemove', function (e) {
      var r = btn.getBoundingClientRect();
      var x = e.clientX - r.left - r.width / 2;
      var y = e.clientY - r.top - r.height / 2;
      btn.style.transform = 'translate(' + (x * strength).toFixed(1) + 'px,' + (y * strength).toFixed(1) + 'px)';
    });
    btn.addEventListener('mouseleave', function () {
      btn.style.transform = '';
    });
  });

  /* ---------- Custom cursor ---------- */
  var dot = document.getElementById('cursorDot');
  var ring = document.getElementById('cursorRing');
  if (dot && ring) {
    document.body.classList.add('cursor-on');
    var mx = -100, my = -100, rx = -100, ry = -100;
    document.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + 'px';
      dot.style.top = my + 'px';
    });
    (function loop() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.left = rx + 'px';
      ring.style.top = ry + 'px';
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll('a, button, [data-hover]').forEach(function (el) {
      el.addEventListener('mouseenter', function () { ring.classList.add('grow'); });
      el.addEventListener('mouseleave', function () { ring.classList.remove('grow'); });
    });
  }
})();
