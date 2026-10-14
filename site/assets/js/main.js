/* Doña Fuego — site JS. No dependencies. */
(function () {
  'use strict';
  var html = document.documentElement;
  html.classList.remove('no-js');

  /* ---- Age gate ---- */
  var KEY = 'df_age_ok';
  var gate = document.querySelector('.age-gate');
  function remembered() { try { return localStorage.getItem(KEY) === '1'; } catch (e) { return false; } }
  function remember() { try { localStorage.setItem(KEY, '1'); } catch (e) {} }
  if (remembered()) html.classList.add('age-ok');
  if (gate) {
    var yes = gate.querySelector('[data-age="yes"]');
    var no = gate.querySelector('[data-age="no"]');
    if (yes) yes.addEventListener('click', function () { remember(); html.classList.add('age-ok'); });
    if (no) no.addEventListener('click', function () { window.location.href = 'https://aware.org.za/'; });
    if (!html.classList.contains('age-ok') && yes) yes.focus();
  }

  /* ---- Mobile nav ---- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.textContent = open ? 'Close' : 'Menu';
    });
  }

  /* ---- Current page in the nav ---- */
  var here = location.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';
  document.querySelectorAll('.site-nav a:not(.btn)').forEach(function (a) {
    var to = a.getAttribute('href').replace(/\/$/, '') || '/';
    if (to === here || (to !== '/' && here.indexOf(to + '/') === 0)) a.setAttribute('aria-current', 'page');
  });

  /* ---- Scroll reveal ---- */
  var els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    els.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting || e.boundingClientRect.top < 0) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px 60px 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---- Hero film: desktop only, muted, only once it can play ---- */
  var video = document.querySelector('.hero-media video[data-src]');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (video && !reduce && window.innerWidth > 760) {
    video.src = video.getAttribute('data-src');
    video.muted = true;
    video.addEventListener('canplay', function () {
      video.setAttribute('data-ready', '');
      var p = video.play();
      if (p && p.catch) p.catch(function () { video.removeAttribute('data-ready'); });
    }, { once: true });
    video.load();
  }

  /* ---- Forms that post JSON to /api/subscribe ---- */
  document.querySelectorAll('form[data-api]').forEach(function (form) {
    var msg = form.querySelector('.form-msg');
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = v; });
      data.kind = form.getAttribute('data-kind') || 'subscribe';
      data.page = location.pathname;
      var btn = form.querySelector('button[type=submit]');
      if (btn) btn.disabled = true;
      if (msg) { msg.textContent = 'One sec.'; msg.classList.remove('err'); }
      fetch(form.getAttribute('data-api'), {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
      }).then(function (r) { return r.json().then(function (j) { return { ok: r.ok, body: j }; }); })
        .then(function (res) {
          if (msg) { msg.textContent = res.body.message || (res.ok ? 'Done.' : 'That did not go through.'); msg.classList.toggle('err', !res.ok); }
          if (res.ok) form.reset();
        })
        .catch(function () { if (msg) { msg.textContent = 'That did not go through. Try again in a minute.'; msg.classList.add('err'); } })
        .then(function () { if (btn) btn.disabled = false; });
    });
  });
})();
