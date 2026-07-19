/* endorfine.music — interactions */
(function () {
  'use strict';

  var doc = document.documentElement;
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Reload landet immer auf der Landingpage ----------
     Browser stellen die Scroll-Position teils erst nach dem Laden
     wieder her — daher zusätzlich bei load/pageshow erzwingen und
     das Smooth-Scrolling währenddessen kurz abschalten. */
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  var forceTop = function () {
    doc.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
    requestAnimationFrame(function () {
      window.scrollTo(0, 0);
      doc.style.scrollBehavior = '';
    });
  };
  forceTop();
  window.addEventListener('load', forceTop);
  window.addEventListener('pageshow', forceTop);

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

  /* ---------- Parallax + Sektions-Progressbars ---------- */
  var layers = [].slice.call(document.querySelectorAll('.parallax'));
  var progressTitles = [].slice.call(document.querySelectorAll('.section .sec-title')).map(function (t) {
    return { title: t, section: t.closest('.section') };
  });
  if (!reducedMotion && (layers.length || progressTitles.length)) {
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
      progressTitles.forEach(function (pt) {
        var rect = pt.section.getBoundingClientRect();
        var p = (vh - rect.top) / rect.height;
        p = Math.max(0, Math.min(1, p));
        pt.title.style.setProperty('--p', (p * 100).toFixed(1));
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

  /* ---------- Streaming platform selector ---------- */
  var PLATFORMS = {
    amazon: {
      name: 'Amazon Music',
      album: 'https://music.amazon.com/albums/B0DBR2V2N7',
      tracks: null
    },
    apple: {
      name: 'Apple Music',
      album: 'https://music.apple.com/de/album/1760308488',
      tracks: [
        'https://music.apple.com/de/album/when-sense-meets-sensibility-radio-edit/1760308488?i=1760308827',
        'https://music.apple.com/de/album/thank-you/1760308488?i=1760308834',
        'https://music.apple.com/de/album/mosaic-of-songs/1760308488?i=1760308842',
        'https://music.apple.com/de/album/twinkle-of-an-eye/1760308488?i=1760308847'
      ]
    },
    deezer: {
      name: 'Deezer',
      album: 'https://www.deezer.com/album/622931781',
      tracks: [
        'https://www.deezer.com/track/2926925941',
        'https://www.deezer.com/track/2926925951',
        'https://www.deezer.com/track/2926925961',
        'https://www.deezer.com/track/2926925971'
      ]
    },
    soundcloud: {
      name: 'SoundCloud',
      album: 'https://soundcloud.com/endorfine-music/sets/mosaic-of-songs',
      tracks: [
        'https://soundcloud.com/endorfine-music/when-sense-meets-sensibility',
        'https://soundcloud.com/endorfine-music/thank-you',
        'https://soundcloud.com/endorfine-music/mosaic-of-songs',
        'https://soundcloud.com/endorfine-music/twinkle-of-an-eye'
      ]
    },
    spotify: {
      name: 'Spotify',
      album: 'https://open.spotify.com/album/18BYh9EEyXQy0uVqQ6r5eS',
      tracks: [
        'https://open.spotify.com/track/2Z9n53jFDSq2627arKrwHy',
        'https://open.spotify.com/track/5G7O2NOnVTclz5SG3cpUo0',
        'https://open.spotify.com/track/0th0FC1iHzNWWJNDiJMd1z',
        'https://open.spotify.com/track/6a0ztBpLjJupsxyH3Ss63O'
      ]
    },
    tidal: {
      name: 'Tidal',
      album: 'https://tidal.com/album/378540836',
      tracks: null
    },
    youtube: {
      name: 'YouTube Music',
      album: 'https://music.youtube.com/playlist?list=OLAK5uy_nRvWJy2cDA9tz8B856mHMKkKHnALqNb88',
      tracks: null
    }
  };

  var platformGrid = document.getElementById('platformGrid');
  if (platformGrid) {
    var chips = [].slice.call(platformGrid.querySelectorAll('button.platform'));
    var trackLinks = [].slice.call(document.querySelectorAll('#albumTracks .track-link'));
    var albumOpen = document.getElementById('albumOpen');
    var albumOpenName = document.getElementById('albumOpenName');

    var heroPlatform = document.getElementById('heroPlatform');
    var heroNames = heroPlatform ? [].slice.call(heroPlatform.querySelectorAll('.hp-name')) : [];

    var selectPlatform = function (key) {
      var p = PLATFORMS[key];
      if (!p) return;
      chips.forEach(function (c) {
        var on = c.getAttribute('data-p') === key;
        c.classList.toggle('selected', on);
        c.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      trackLinks.forEach(function (a, i) {
        a.href = (p.tracks && p.tracks[i]) || p.album;
      });
      albumOpen.href = p.album;
      albumOpenName.textContent = p.name;
      if (heroPlatform) {
        heroPlatform.href = p.album;
        heroNames.forEach(function (n) { n.textContent = p.name; });
      }
    };

    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        var key = c.getAttribute('data-p');
        selectPlatform(key);
        /* Nur die bewusste Wahl wird gemerkt — die Auto-Vorauswahl nicht. */
        try { localStorage.setItem('endorfine-platform', key); } catch (e) {}
      });
    });

    var storedP = null;
    try { storedP = localStorage.getItem('endorfine-platform'); } catch (e) {}
    var ua = navigator.userAgent || '';
    /* Gespeicherte Wahl gewinnt; sonst fix: Apple-Geräte -> Apple Music,
       alle anderen -> Spotify. */
    var initialP = (storedP && PLATFORMS[storedP]) ? storedP
      : (/iPhone|iPad|iPod|Macintosh/.test(ua) ? 'apple' : 'spotify');
    selectPlatform(initialP);
  }

  /* ---------- Zitat-Banner: sanfte Rotation ---------- */
  var dividerQuote = document.querySelector('.divider-quote');
  if (dividerQuote && !reducedMotion) {
    var dqs = [].slice.call(dividerQuote.querySelectorAll('.dq'));
    if (dqs.length > 1) {
      dividerQuote.classList.add('rotating');
      var dqi = 0;
      dqs[dqi].classList.add('active');
      setInterval(function () {
        dqs[dqi].classList.remove('active');
        dqi = (dqi + 1) % dqs.length;
        dqs[dqi].classList.add('active');
      }, 14000);
    }
  }

  /* ---------- Footer year ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();
})();
