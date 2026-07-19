/* endorfine.music — interactions */
(function () {
  'use strict';

  var doc = document.documentElement;
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Language toggle ---------- */
  var langToggle = document.getElementById('langToggle');

  function setLang(lang) {
    doc.setAttribute('data-lang', lang);
    doc.setAttribute('lang', lang);
    langToggle.textContent = lang === 'de' ? 'EN' : 'DE';
    try { localStorage.setItem('endorfine-lang', lang); } catch (e) {}
  }

  var stored = null;
  try { stored = localStorage.getItem('endorfine-lang'); } catch (e) {}
  var initial = stored || ((navigator.language || 'de').toLowerCase().indexOf('de') === 0 ? 'de' : 'en');
  setLang(initial);

  langToggle.addEventListener('click', function () {
    setLang(doc.getAttribute('data-lang') === 'de' ? 'en' : 'de');
  });

  /* ---------- Nav ---------- */
  var nav = document.getElementById('nav');
  var burger = document.getElementById('navBurger');
  var navLinks = document.getElementById('navLinks');

  function onScrollNav() {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScrollNav, { passive: true });
  onScrollNav();

  burger.addEventListener('click', function () {
    var open = navLinks.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  navLinks.addEventListener('click', function (e) {
    if (e.target.closest('a')) {
      navLinks.classList.remove('open');
      burger.classList.remove('open');
    }
  });

  /* ---------- Parallax ---------- */
  var layers = [].slice.call(document.querySelectorAll('.parallax'));
  if (!reducedMotion && layers.length) {
    var ticking = false;
    var update = function () {
      ticking = false;
      var vh = window.innerHeight;
      layers.forEach(function (el) {
        var host = el.parentElement;
        var rect = host.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > vh) return;
        var speed = parseFloat(el.getAttribute('data-speed')) || 0.3;
        var progress = (rect.top + rect.height / 2 - vh / 2) * -1;
        el.style.transform = 'translate3d(0,' + (progress * speed).toFixed(1) + 'px,0)';
      });
    };
    var onScroll = function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = [].slice.call(document.querySelectorAll('.reveal'));
  if ('IntersectionObserver' in window && !reducedMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---------- Footer year ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();
})();
