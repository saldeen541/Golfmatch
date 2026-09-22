/* ==========================================================================
   Golfapp - ruter og oppstart
   ========================================================================== */

(function (global) {
  'use strict';

  var el = UI.el;

  var RUTER = {
    'hjem':          { title: 'Golfapp',        tab: 'hjem' },
    'ny-runde':      { title: 'Ny runde',       tab: 'hjem',          back: 'hjem' },
    'runde':         { title: 'Runde',          tab: 'hjem',          back: 'hjem' },
    'spillere':      { title: 'Spillere',       tab: 'hjem',          back: 'hjem' },
    'spiller':       { title: 'Spiller',        tab: 'hjem',          back: 'spillere' },
    'baner':         { title: 'Baner',          tab: 'hjem',          back: 'hjem' },
    'bane':          { title: 'Bane',           tab: 'hjem',          back: 'baner' },
    'statistikk':    { title: 'Statistikk',     tab: 'statistikk' },
    'innstillinger': { title: 'Innstillinger',  tab: 'innstillinger' }
  };

  var naa = { rute: 'hjem', params: {} };

  function nav(rute, params) {
    if (!RUTER[rute]) rute = 'hjem';
    naa = { rute: rute, params: params || {} };
    tegn();
    window.scrollTo(0, 0);
  }

  function tegn() {
    var def = RUTER[naa.rute];
    var innhold = document.getElementById('innhold');
    var tittel = document.getElementById('sidetittel');
    var tilbake = document.getElementById('tilbake');

    tittel.textContent = def.title;
    tilbake.hidden = !def.back;
    tilbake.onclick = function () { nav(def.back); };

    UI.clear(innhold);
    var bygger = Screens[naa.rute];
    innhold.appendChild(bygger ? bygger(nav, naa.params) : el('p', { text: 'Ukjent skjerm' }));

    Array.prototype.forEach.call(document.querySelectorAll('.tabbar button'), function (b) {
      b.setAttribute('aria-current', String(b.dataset.tab === def.tab));
    });
  }

  /* ---- tema ----------------------------------------------------------- */

  function settTema() {
    // Appen følger telefonens innstilling for lys og mørk modus.
    document.documentElement.removeAttribute('data-theme');
  }

  /* ---- oppstart ------------------------------------------------------- */

  // Hvis appen åpnes et sted som ikke får lastet hjelpefilene, for eksempel
  // i forhåndsvisningen i Filer-appen på iPhone, skal brukeren få vite hvorfor
  // i stedet for å bli stående på «Starter appen …».
  function manglendeFiler() {
    var kreves = [
      ['GolfAvatars', 'app/assets/avatars.js'],
      ['GolfDB', 'app/js/db.js'],
      ['GolfStore', 'app/js/store.js'],
      ['UI', 'app/js/ui.js'],
      ['GolfBackup', 'app/js/backup.js'],
      ['Screens', 'app/js/screens.js']
    ];
    return kreves.filter(function (par) { return !global[par[0]]; })
                 .map(function (par) { return par[1]; });
  }

  function visOppstartsfeil(tekst) {
    var boks = document.getElementById('laster');
    boks.textContent = '';
    var p1 = document.createElement('p');
    p1.textContent = tekst;
    var p2 = document.createElement('p');
    p2.textContent = 'Appen må åpnes fra en nettadresse, ikke fra Filer-appen. ' +
                     'Se README i mappen for hvordan den legges ut.';
    boks.appendChild(p1);
    boks.appendChild(p2);
  }

  // Service workeren er det som gjør at appen fungerer uten nett. Den krever
  // https eller localhost, så åpnes appen fra disk hopper vi over den.
  function registrerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    var ok = location.protocol === 'https:' ||
             location.hostname === 'localhost' ||
             location.hostname === '127.0.0.1';
    if (!ok) return;
    navigator.serviceWorker.register('./sw.js').catch(function (e) {
      console.warn('Offline-støtte ble ikke slått på:', e);
    });
  }

  function start() {
    settTema();
    registrerServiceWorker();

    var mangler = manglendeFiler();
    if (mangler.length) {
      visOppstartsfeil('Klarte ikke å laste ' + mangler.length +
        ' av appens filer, blant annet ' + mangler[0] + '.');
      return;
    }

    Array.prototype.forEach.call(document.querySelectorAll('.tabbar button'), function (b) {
      b.addEventListener('click', function () { nav(b.dataset.route); });
    });

    GolfStore.load().then(function () {
      document.getElementById('laster').hidden = true;
      document.getElementById('app').hidden = false;
      nav('hjem');
    }).catch(function (err) {
      console.error(err);
      document.getElementById('laster').textContent =
        'Klarte ikke å starte appen. Prøv å laste siden på nytt.';
    });

    // Tegn på nytt når data endres et annet sted i appen.
    GolfStore.onChange(function () { /* skjermene tegner seg selv ved navigasjon */ });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  global.GolfApp = { nav: nav };
})(window);
