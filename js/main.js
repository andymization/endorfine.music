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

  /* ---------- Audio player ---------- */
  var audio = document.getElementById('audio');
  var btnPlay = document.getElementById('btnPlay');
  var btnPrev = document.getElementById('btnPrev');
  var btnNext = document.getElementById('btnNext');
  var icPlay = btnPlay.querySelector('.ic-play');
  var icPause = btnPlay.querySelector('.ic-pause');
  var seek = document.getElementById('seek');
  var seekFill = document.getElementById('seekFill');
  var tCur = document.getElementById('tCur');
  var tDur = document.getElementById('tDur');
  var playerTrack = document.getElementById('playerTrack');
  var trackEls = [].slice.call(document.querySelectorAll('#tracklist li'));
  var current = 0;
  var loaded = false;

  function fmt(s) {
    if (!isFinite(s)) return '0:00';
    var m = Math.floor(s / 60);
    var sec = Math.floor(s % 60);
    return m + ':' + (sec < 10 ? '0' : '') + sec;
  }

  function load(i) {
    current = (i + trackEls.length) % trackEls.length;
    var el = trackEls[current];
    audio.src = el.getAttribute('data-src');
    playerTrack.textContent = el.getAttribute('data-title');
    trackEls.forEach(function (t, n) { t.classList.toggle('active', n === current); });
    loaded = true;
  }

  function play() {
    if (!loaded) load(0);
    audio.play();
  }

  function updatePlayIcon() {
    var playing = !audio.paused;
    icPlay.hidden = playing;
    icPause.hidden = !playing;
  }

  btnPlay.addEventListener('click', function () {
    if (!loaded) { play(); return; }
    if (audio.paused) audio.play(); else audio.pause();
  });
  btnPrev.addEventListener('click', function () { load(current - 1); audio.play(); });
  btnNext.addEventListener('click', function () { load(current + 1); audio.play(); });

  trackEls.forEach(function (el, i) {
    el.addEventListener('click', function () {
      if (i === current && loaded) {
        if (audio.paused) audio.play(); else audio.pause();
      } else {
        load(i);
        audio.play();
      }
    });
  });

  audio.addEventListener('play', updatePlayIcon);
  audio.addEventListener('pause', updatePlayIcon);
  audio.addEventListener('ended', function () { load(current + 1); audio.play(); });
  audio.addEventListener('loadedmetadata', function () { tDur.textContent = fmt(audio.duration); });
  audio.addEventListener('timeupdate', function () {
    tCur.textContent = fmt(audio.currentTime);
    if (audio.duration) {
      seekFill.style.width = (audio.currentTime / audio.duration * 100) + '%';
    }
  });

  function seekTo(e) {
    if (!audio.duration) return;
    var rect = seek.getBoundingClientRect();
    var x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    audio.currentTime = Math.max(0, Math.min(1, x / rect.width)) * audio.duration;
  }
  seek.addEventListener('click', seekTo);

  /* ---------- Lightbox ---------- */
  var lightbox = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  var galleryLinks = [].slice.call(document.querySelectorAll('.gal-item'));
  var lbIndex = 0;

  function openLb(i) {
    lbIndex = (i + galleryLinks.length) % galleryLinks.length;
    lbImg.src = galleryLinks[lbIndex].getAttribute('href');
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function closeLb() {
    lightbox.hidden = true;
    lbImg.src = '';
    document.body.style.overflow = '';
  }

  galleryLinks.forEach(function (a, i) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      openLb(i);
    });
  });
  document.getElementById('lbClose').addEventListener('click', closeLb);
  document.getElementById('lbPrev').addEventListener('click', function () { openLb(lbIndex - 1); });
  document.getElementById('lbNext').addEventListener('click', function () { openLb(lbIndex + 1); });
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLb();
  });
  document.addEventListener('keydown', function (e) {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') openLb(lbIndex - 1);
    if (e.key === 'ArrowRight') openLb(lbIndex + 1);
  });

  /* ---------- Footer year ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();
})();
