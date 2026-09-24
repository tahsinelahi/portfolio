/* Tahsin Farjana Elahi — Portfolio 2026
   Cinematic preloader · scroll reveals · marker draw · parallax ·
   magnetic buttons · custom cursor (desktop only) · reduced-motion safe */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

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
    // Safety: never trap the visitor
    setTimeout(finishLoad, 5000);
  }

  /* ---------- Scroll reveals (+ statement lines, + marker scribbles) ---------- */
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

  if (reduceMotion || !finePointer) return; // motion features below are desktop-only

  /* ---------- Subtle parallax ---------- */
  var heroFrame = document.getElementById('heroFrame');
  var heroImg = document.getElementById('heroImg');
  var parallaxEls = document.querySelectorAll('.chapter-head');
  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY;
      if (heroFrame && y < window.innerHeight * 1.2) {
        heroFrame.style.transform = 'translateY(' + y * 0.12 + 'px)';
      }
      parallaxEls.forEach(function (el) {
        var r = el.getBoundingClientRect();
        var center = r.top + r.height / 2 - window.innerHeight / 2;
        el.style.transform = 'translateY(' + (center * -0.05).toFixed(1) + 'px)';
      });
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Hero pointer drift (igloo-style camera feel, subtle) ---------- */
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
