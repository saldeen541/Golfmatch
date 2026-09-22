/* ==========================================================================
   Golfapp - ruter og oppstart
   ========================================================================== */

(function (global) {
  'use strict';

  var el = UI.el;

  var RUTER = {
    'hjem':          { title: 'Golfapp',        tab: 'hjem' },
    'ny-runde':      { title: 'Ny runde',       tab: 'hjem' },
    'runde':         { title: 'Runde',          tab: 'hjem' },
    'resultat':      { title: 'Resultat',       tab: 'hjem' },
    'spillere':      { title: 'Spillere',       tab: 'hjem' },
    'spiller':       { title: 'Spiller',        tab: 'hjem' },
    'baner':         { title: 'Baner',          tab: 'hjem' },
    'bane':          { title: 'Bane',           tab: 'hjem' },
    'statistikk':    { title: 'Statistikk',     tab: 'statistikk' },
    'innstillinger': { title: 'Innstillinger',  tab: 'innstillinger' }
  };

  /* Navigasjonen er en stabel. Tilbakeknappen tar deg alltid nøyaktig ett
     hakk bakover, dit du faktisk kom fra, og ikke til en fast skjerm.
     Stabelen speiles i nettleserens historikk, slik at tilbakeknappen på
     Android og sveip tilbake virker på samme måte. */

  var stabel = [{ rute: 'hjem', params: {} }];

  function naa() { return stabel[stabel.length - 1]; }

  function settStabel(ny, erstatt) {
    stabel = ny;
    var tilstand = { d: stabel.length - 1 };
    try {
      if (erstatt) history.replaceState(tilstand, '');
      else history.pushState(tilstand, '');
    } catch (e) { /* historikk-API kan være stengt, appen virker likevel */ }
    tegn();
    window.scrollTo(0, 0);
  }

  function nav(rute, params) {
    if (!RUTER[rute]) rute = 'hjem';
    settStabel(stabel.concat([{ rute: rute, params: params || {} }]), false);
  }

  // Erstatter toppen av stabelen. Brukes når man har lagret noe og ikke
  // skal kunne gå «tilbake» til skjemaet man nettopp fullførte.
  nav.erstatt = function (rute, params) {
    if (!RUTER[rute]) rute = 'hjem';
    settStabel(stabel.slice(0, -1).concat([{ rute: rute, params: params || {} }]), true);
  };

  // Nullstiller stabelen. Brukes av bunnmenyen.
  nav.rot = function (rute, params) {
    if (!RUTER[rute]) rute = 'hjem';
    settStabel([{ rute: rute, params: params || {} }], true);
  };

  nav.tilbake = function () {
    if (stabel.length <= 1) return;
    try { history.back(); }
    catch (e) { settStabel(stabel.slice(0, -1), true); }
  };

  window.addEventListener('popstate', function (e) {
    var d = e.state && typeof e.state.d === 'number' ? e.state.d : 0;
    var ny = stabel.slice(0, d + 1);
    if (!ny.length) ny = [{ rute: 'hjem', params: {} }];
    stabel = ny;
    tegn();
    window.scrollTo(0, 0);
  });

  function tegn() {
    var her = naa();
    var def = RUTER[her.rute];
    var innhold = document.getElementById('innhold');
    var tittel = document.getElementById('sidetittel');
    var tilbake = document.getElementById('tilbake');

    tittel.textContent = def.title;
    tilbake.hidden = stabel.length <= 1;
    tilbake.onclick = nav.tilbake;

    UI.clear(innhold);
    var bygger = Screens[her.rute];
    innhold.appendChild(bygger ? bygger(nav, her.params) : el('p', { text: 'Ukjent skjerm' }));

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
      ['GolfMatch', 'app/js/match.js'],
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
      b.addEventListener('click', function () { nav.rot(b.dataset.route); });
    });

    GolfStore.load().then(function () {
      document.getElementById('laster').hidden = true;
      document.getElementById('app').hidden = false;
      nav.rot('hjem');
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
