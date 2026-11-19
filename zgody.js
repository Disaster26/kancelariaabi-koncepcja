/* Zgody na pliki cookies (niezbędne zawsze, pozostałe tylko po zgodzie).
   Wybór: localStorage 'abi-zgody' = {v, a (analityczne), m (marketingowe), z (treści zewnętrzne: mapa), t (data)}.
   Google Consent Mode v2: domyślnie wszystko 'denied' (ustawiane w <head>), tu aktualizacja po wyborze.
   Skrypty analityczne/marketingowe po wdrożeniu podpinamy pod zdarzenie 'abi:zgody'. */
(function () {
  'use strict';
  var d = document, KEY = 'abi-zgody', V = 1;
  var box = d.getElementById('ck'); if (!box) return;
  var opts = d.getElementById('ck-opts');
  var bMore = box.querySelector('[data-ck="more"]'), bSave = box.querySelector('[data-ck="save"]');
  var last = null;

  function read() { try { var z = JSON.parse(localStorage.getItem(KEY)); return z && z.v === V ? z : null; } catch (e) { return null; } }
  function apply(z) {
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        analytics_storage: z.a ? 'granted' : 'denied',
        ad_storage: z.m ? 'granted' : 'denied', ad_user_data: z.m ? 'granted' : 'denied', ad_personalization: z.m ? 'granted' : 'denied'
      });
    }
    d.dispatchEvent(new CustomEvent('abi:zgody', { detail: z }));
  }
  function save(z) {
    z.v = V; z.t = new Date().toISOString();
    try { localStorage.setItem(KEY, JSON.stringify(z)); } catch (e) {}
    window.abiZgody.stan = z;
    apply(z); close();
  }
  function fill(z) {
    z = z || { a: false, m: false, z: false };
    ['a', 'm', 'z'].forEach(function (k) { opts.querySelector('[name="' + k + '"]').checked = !!z[k]; });
  }
  function more(on) { opts.hidden = !on; bMore.hidden = on; bSave.hidden = !on; }
  function open(details) {
    last = d.activeElement;
    fill(read()); more(!!details);
    box.hidden = false;
    box.querySelector('.ck-btn').focus({ preventScroll: true });
  }
  function close() { box.hidden = true; if (last && last.focus && last !== d.body) last.focus({ preventScroll: true }); last = null; }

  box.addEventListener('click', function (e) {
    var b = e.target.closest('[data-ck]'); if (!b) return;
    var c = b.getAttribute('data-ck');
    if (c === 'all') save({ a: true, m: true, z: true });
    else if (c === 'none') save({ a: false, m: false, z: false });
    else if (c === 'more') { more(true); opts.querySelector('[name="a"]').focus(); }
    else if (c === 'save') save({ a: opts.querySelector('[name="a"]').checked, m: opts.querySelector('[name="m"]').checked, z: opts.querySelector('[name="z"]').checked });
  });
  d.addEventListener('click', function (e) { if (e.target.closest('[data-zgody]')) { e.preventDefault(); open(true); } });

  window.abiZgody = {
    stan: read(),
    zgoda: function (k) { var z = read(); return !!(z && z[k]); },
    dodaj: function (k) { var z = read() || { a: false, m: false, z: false }; z[k] = true; save(z); },
    otworz: open
  };
  var z = read();
  if (z) apply(z); else open(false);
})();
