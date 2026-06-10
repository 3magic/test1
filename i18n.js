/**
 * i18n.js — language switching for momentofzen.art
 *
 * Locale files (locales/*.js) are loaded on first selection and cached in
 * window.LOCALES. English is pre-loaded synchronously in <head>.
 * The selected language is persisted in localStorage under 'moz-lang'.
 */

(function () {
  'use strict';

  var SUPPORTED = {
    'en':      'English',
    'zh-hans': '简体中文',
    'zh-hant': '繁體中文',
    'ja':      '日本語',
    'th':      'ภาษาไทย',
    'vi':      'Tiếng Việt'
  };

  var activeLang = localStorage.getItem('moz-lang') || 'en';

  /* ── Public API ─────────────────────────────────────────────────── */

  window.I18N = {
    getLang: function () { return activeLang; },

    /** Return translated pool entry for a given pool index */
    getPool: function (idx) {
      var loc = window.LOCALES && window.LOCALES[activeLang];
      return (loc && loc.pool && loc.pool[idx]) || null;
    },

    /** Switch language, lazy-load locale file if needed, then apply */
    switch: function (lang) {
      if (!SUPPORTED[lang]) return;
      loadLocale(lang, function () {
        activeLang = lang;
        localStorage.setItem('moz-lang', lang);
        closeLangMenu();
        var dateStr = (typeof activeDates !== 'undefined' && typeof activeIdx !== 'undefined')
          ? activeDates[activeIdx] : null;
        if (dateStr && lang !== 'en' && typeof loadDayLocale === 'function') {
          loadDayLocale(dateStr, lang).then(applyLocale);
        } else {
          applyLocale();
        }
      });
    },

    /** Called by the main script after DOM + content are ready */
    init: function () {
      buildLangMenu();
      loadLocale(activeLang, function () {
        var dateStr = (typeof activeDates !== 'undefined' && typeof activeIdx !== 'undefined')
          ? activeDates[activeIdx] : null;
        if (dateStr && activeLang !== 'en' && typeof loadDayLocale === 'function') {
          loadDayLocale(dateStr, activeLang).then(applyLocale);
        } else {
          applyLocale();
        }
      });
    }
  };

  /* ── Locale loader ──────────────────────────────────────────────── */

  function loadLocale(lang, cb) {
    if (window.LOCALES && window.LOCALES[lang]) { cb(); return; }
    var s = document.createElement('script');
    s.src = 'locales/' + lang + '.js';
    s.onload = cb;
    s.onerror = function () { console.warn('Could not load locale: ' + lang); };
    document.head.appendChild(s);
  }

  /* ── DOM updater ────────────────────────────────────────────────── */

  function applyLocale() {
    var loc = window.LOCALES && window.LOCALES[activeLang];
    if (!loc) return;
    var u = loc.ui;

    /* document language */
    document.documentElement.lang = loc.dir === 'rtl' ? activeLang : activeLang;
    document.documentElement.dir  = loc.dir || 'ltr';

    /* nav links */
    setText('[data-i18n="nav.gallery"]',  u.nav.gallery);
    setText('[data-i18n="nav.poems"]',    u.nav.poems);
    setText('[data-i18n="nav.about"]',    u.nav.about);

    /* hero */
    setText('[data-i18n="hero.cta"]',     u.hero.cta);

    /* gallery section */
    setText('[data-i18n="gallery.label"]',    u.gallery.label);
    setHTML('[data-i18n="gallery.heading"]',  u.gallery.heading);

    /* poems section */
    setText('[data-i18n="poems.label"]',    u.poems.label);
    setHTML('[data-i18n="poems.heading"]',  u.poems.heading);

    /* about section */
    setText('[data-i18n="about.label"]',    u.about.label);
    setHTML('[data-i18n="about.heading"]',  u.about.heading);
    var ps = document.querySelectorAll('#about .about-text p');
    if (ps[0]) ps[0].textContent = u.about.p1;
    if (ps[1]) ps[1].textContent = u.about.p2;
    if (ps[2]) ps[2].textContent = u.about.p3;

    /* footer */
    var ftEl = document.querySelector('[data-i18n="footer.tagline"]');
    if (ftEl) ftEl.innerHTML = u.footer.tagline + ' &nbsp;&middot;&nbsp; <a href="https://momentofzen.art">momentofzen.art</a>';

    /* music button */
    var mBtn = document.getElementById('music-toggle');
    if (mBtn) {
      var paused = document.getElementById('bg-audio') ? document.getElementById('bg-audio').paused : true;
      mBtn.title = paused ? u.music.play : u.music.pause;
      mBtn.setAttribute('aria-label', mBtn.title);
    }

    /* day arrows */
    var pBtn = document.getElementById('dayPrev');
    var nBtn = document.getElementById('dayNext');
    if (pBtn) pBtn.setAttribute('aria-label', u.arrows.prev);
    if (nBtn) nBtn.setAttribute('aria-label', u.arrows.next);

    /* lang button label */
    var lb = document.getElementById('langBtn');
    if (lb) lb.innerHTML = loc.langLabel + ' <span class="lang-caret">&#9662;</span>';

    /* active mark in menu */
    document.querySelectorAll('.lang-menu li').forEach(function (li) {
      li.classList.toggle('active', li.dataset.lang === activeLang);
    });

    /* re-render daily content with new locale strings */
    if (typeof renderContent === 'function' && typeof activeIdx !== 'undefined') {
      renderContent(activeIdx);
    }
  }

  /* ── Language menu builder ──────────────────────────────────────── */

  function buildLangMenu() {
    var menu = document.getElementById('langMenu');
    if (!menu) return;
    menu.innerHTML = Object.keys(SUPPORTED).map(function (code) {
      return '<li data-lang="' + code + '"' +
             (code === activeLang ? ' class="active"' : '') + '>' +
             SUPPORTED[code] + '</li>';
    }).join('');

    menu.addEventListener('click', function (e) {
      var li = e.target.closest('li[data-lang]');
      if (li) window.I18N.switch(li.dataset.lang);
    });

    var btn = document.getElementById('langBtn');
    if (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        menu.classList.toggle('open');
      });
    }

    document.addEventListener('click', closeLangMenu);
  }

  function closeLangMenu() {
    var menu = document.getElementById('langMenu');
    if (menu) menu.classList.remove('open');
  }

  /* ── Helpers ────────────────────────────────────────────────────── */

  function setText(sel, val) {
    var el = document.querySelector(sel);
    if (el && val != null) el.textContent = val;
  }

  function setHTML(sel, val) {
    var el = document.querySelector(sel);
    if (el && val != null) el.innerHTML = val;
  }

}());
