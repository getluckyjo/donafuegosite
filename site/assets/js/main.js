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
    if (yes) yes.addEventListener('click', function () { remember(); html.classList.add('age-ok'); document.dispatchEvent(new Event('df:age-ok')); });
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
    if (to.indexOf('#') !== -1) return;
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
  /* ---- Cold open: prints drop onto a pile, then the title card ----
     Plays once per browser session. Reduced motion, a repeat visit or Skip
     go straight to the finished pile and the title. */
  var open = document.querySelector('.cold-open');
  if (open) {
    var prints = Array.prototype.slice.call(open.querySelectorAll('.pile .print'));
    var timers = [];
    var SEEN = 'df_intro_seen';
    var finish = function () {
      timers.forEach(clearTimeout); timers = [];
      prints.forEach(function (p) { p.classList.add('down'); });
      open.classList.add('titled');
      try { sessionStorage.setItem(SEEN, '1'); } catch (e) {}
    };
    var ready = function (p) {
      var img = p.querySelector('img');
      if (!img || img.complete) return Promise.resolve();
      return (img.decode ? img.decode() : Promise.resolve()).catch(function () {});
    };
    var play = function () {
      timers.forEach(clearTimeout); timers = [];
      open.classList.remove('titled');
      prints.forEach(function (p) { p.classList.remove('down'); });
      var i = 0, last = prints.length;
      var step = function () {
        if (i >= last) { timers.push(setTimeout(finish, 450)); return; }
        var p = prints[i++];
        // the last three slow down, like the end of a title sequence
        var wait = i > last - 3 ? 380 + (i - (last - 3)) * 140 : 210;
        ready(p).then(function () { p.classList.add('down'); timers.push(setTimeout(step, wait)); });
      };
      step();
    };
    var skip = open.querySelector('.skip-intro');
    if (skip) skip.addEventListener('click', finish);
    document.querySelectorAll('[data-replay]').forEach(function (b) {
      b.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); play(); });
    });
    var seen = false;
    try { seen = sessionStorage.getItem(SEEN) === '1'; } catch (e) {}
    if (reduce || seen) finish();
    else if (html.classList.contains('age-ok')) play();
    else document.addEventListener('df:age-ok', play, { once: true });
  }

  /* ---- Fan wall: approved photos from the Drive folder ---- */
  var wall = document.querySelector('[data-fans]');
  if (wall && window.fetch) {
    fetch('/api/fans').then(function (r) { return r.ok ? r.json() : { fans: [] }; }).then(function (d) {
      var invite = wall.querySelector('.print.empty');
      (d.fans || []).forEach(function (f, n) {
        var fig = document.createElement('figure');
        fig.className = 'print small';
        fig.style.setProperty('--r', ((n * 37) % 7 - 3) + 'deg');
        var img = document.createElement('img');
        img.src = f.src; img.alt = 'Photo by ' + f.credit; img.loading = 'lazy'; img.decoding = 'async';
        if (f.w && f.h) { img.width = f.w; img.height = f.h; }
        var cap = document.createElement('figcaption');
        var c = document.createElement('span'); c.className = 'cap'; c.textContent = f.credit;
        cap.appendChild(c); fig.appendChild(img); fig.appendChild(cap);
        wall.insertBefore(fig, invite);
      });
      // One joke card makes way for each real fan; "This could be you" always stays
      var jokes = wall.querySelectorAll('.print.empty');
      for (var i = jokes.length - 1; i > 0 && i > jokes.length - 1 - (d.fans || []).length; i--) jokes[i].remove();
    }).catch(function () {});
  }
})();
