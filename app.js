(function () {
  'use strict';
  var d = document;

  // menu mobilne
  var burger = d.querySelector('.burger'), nav = d.getElementById('nav');
  function closeNav() { nav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Otwórz menu'); d.body.style.overflow = ''; }
  burger.addEventListener('click', function () {
    var open = !nav.classList.contains('open');
    nav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Zamknij menu' : 'Otwórz menu');
    d.body.style.overflow = open ? 'hidden' : '';
  });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) closeNav(); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('open')) closeNav(); });

  // aktywna pozycja menu = sekcja na ekranie
  var links = [].slice.call(nav.querySelectorAll('ul a[href^="#"]'));
  var hero = d.querySelector('.hero');
  if ('IntersectionObserver' in window && hero) {
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) {
          if (a.getAttribute('href') === '#' + en.target.id) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(function (a) { var s = d.querySelector(a.getAttribute('href')); if (s) spy.observe(s); });
    new IntersectionObserver(function (es) { if (es[0].isIntersecting) links.forEach(function (a) { a.removeAttribute('aria-current'); }); }, { threshold: .6 }).observe(hero);

    // pasek akcji na telefonie po przewinięciu za przycisk w pierwszym ekranie
    var mob = d.getElementById('mob'), cta = d.getElementById('heroCta');
    new IntersectionObserver(function (es) {
      var past = !es[0].isIntersecting && es[0].boundingClientRect.top < 0;
      mob.classList.toggle('widac', past);
    }).observe(cta);

  }

  // mapa Google: tylko po zgodzie na treści zewnętrzne, ładowana przy przewinięciu
  var map = d.getElementById('map');
  if (map) {
    var mapaJest = false, widac = false;
    function wstawMape() {
      if (mapaJest || !widac || !(window.abiZgody && window.abiZgody.zgoda('z'))) return;
      mapaJest = true;
      var f = d.createElement('iframe');
      f.title = 'Mapa: Kancelaria Bezpieczeństwo Informacji, Opole, ul. Światowida 2';
      f.loading = 'lazy';
      f.referrerPolicy = 'no-referrer-when-downgrade';
      f.src = 'https://www.google.com/maps?q=%C5%9Awiatowida+2%2C+45-325+Opole&z=15&output=embed';
      map.innerHTML = ''; map.appendChild(f);
    }
    if ('IntersectionObserver' in window) {
      var mo = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { widac = true; mo.disconnect(); wstawMape(); } }, { rootMargin: '300px' });
      mo.observe(map);
    } else widac = true;
    d.addEventListener('abi:zgody', wstawMape);
    map.addEventListener('click', function (e) { if (e.target.closest('[data-mapa]')) { widac = true; window.abiZgody.dodaj('z'); } });
  }

  // przyciski z gotowym tematem zapytania (np. "Zapytaj o NIS 2")
  d.addEventListener('click', function (e) {
    var a = e.target.closest('[data-u]'), sel = d.querySelector('#form select[name="u"]');
    if (a && sel) sel.value = a.getAttribute('data-u');
  });

  // przewijane pasy: strzałki + przeciąganie myszą
  [].forEach.call(d.querySelectorAll('.arrows'), function (box) {
    var rail = d.getElementById(box.getAttribute('data-for'));
    var pv = box.querySelector('.pv'), nx = box.querySelector('.nx');
    function step() { var c = rail.firstElementChild; return c ? c.getBoundingClientRect().width + parseFloat(getComputedStyle(rail).columnGap || 0) : 300; }
    function upd() { pv.disabled = rail.scrollLeft < 4; nx.disabled = rail.scrollLeft + rail.clientWidth > rail.scrollWidth - 4; }
    pv.addEventListener('click', function () { rail.scrollBy({ left: -step(), behavior: 'smooth' }); });
    nx.addEventListener('click', function () { rail.scrollBy({ left: step(), behavior: 'smooth' }); });
    rail.addEventListener('scroll', upd, { passive: true });
    window.addEventListener('resize', upd);
    upd();
  });
  var moved = false;
  [].forEach.call(d.querySelectorAll('.rail,.gal'), function (rail) {
    var down = false, x0 = 0, s0 = 0;
    rail.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; x0 = e.clientX; s0 = rail.scrollLeft; });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - x0;
      if (Math.abs(dx) > 5) { moved = true; rail.classList.add('drag'); }
      if (moved) rail.scrollLeft = s0 - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!down) return; down = false;
      if (rail.classList.contains('drag')) {
        rail.classList.remove('drag');
        var c = rail.firstElementChild, w = c.getBoundingClientRect().width + parseFloat(getComputedStyle(rail).columnGap || 0);
        rail.scrollTo({ left: Math.round(rail.scrollLeft / w) * w, behavior: 'smooth' });
      }
    });
    rail.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
  });

  // lightbox
  var lb = d.getElementById('lb'), lbImg = lb.querySelector('img'), lbCap = lb.querySelector('.cap');
  var items = [], idx = 0, last = null;
  [].forEach.call(d.querySelectorAll('[data-lb]'), function (el) {
    var i = items.length;
    items.push({ src: el.getAttribute('data-lb'), cap: el.getAttribute('data-cap') || '', alt: el.getAttribute('aria-label') || el.getAttribute('alt') || '' });
    el.addEventListener('click', function () { last = el; show(i); });
  });
  function show(i) {
    idx = (i + items.length) % items.length;
    var it = items[idx];
    lbImg.src = it.src; lbImg.alt = it.alt;
    lbCap.textContent = it.cap + '  ' + (idx + 1) + ' / ' + items.length;
    lb.classList.add('open'); d.body.style.overflow = 'hidden';
    lb.querySelector('.x').focus();
  }
  function hide() { lb.classList.remove('open'); d.body.style.overflow = ''; if (last) last.focus(); }
  lb.querySelector('.x').addEventListener('click', hide);
  lb.querySelector('.pv').addEventListener('click', function () { show(idx - 1); });
  lb.querySelector('.nx').addEventListener('click', function () { show(idx + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) hide(); });
  d.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') hide();
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });
  var tx = null;
  lb.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (tx === null) return;
    var dx = e.changedTouches[0].clientX - tx; tx = null;
    if (Math.abs(dx) > 40) show(idx + (dx < 0 ? 1 : -1));
  });

  // formularz pokazowy
  var form = d.getElementById('form');
  if (form) form.addEventListener('submit', function (e) { e.preventDefault(); d.getElementById('ok').classList.add('show'); });

})();
