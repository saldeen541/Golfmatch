/* ==========================================================================
   Golfapp - service worker

   Laster ned hele appen ved første besøk og serverer den fra telefonens eget
   lager etterpå. Det er dette som gjør at appen fungerer i flymodus og uten
   dekning.

   VIKTIG VED ENDRINGER: øk versjonsnummeret under når en fil endres. Ellers
   fortsetter telefonen å bruke den gamle kopien.
   ========================================================================== */

var VERSJON = 'golfapp-v2-0';

var FILER = [
  './',
  './index.html',
  './manifest.webmanifest',
  './app/styles/tokens.css',
  './app/styles/app.css',
  './app/assets/avatars.js',
  './app/js/db.js',
  './app/js/store.js',
  './app/js/ui.js',
  './app/js/backup.js',
  './app/js/screens.js',
  './app/js/screens-round.js',
  './app/js/app.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(VERSJON)
      .then(function (cache) { return cache.addAll(FILER); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (navn) {
        return Promise.all(navn.map(function (n) {
          return n === VERSJON ? null : caches['delete'](n);
        }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;

  // Sidevisninger: prøv nett først, slik at en ny versjon fanges opp, men
  // fall tilbake på lageret med én gang nettet mangler.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then(function (svar) {
          var kopi = svar.clone();
          caches.open(VERSJON).then(function (c) { c.put('./index.html', kopi); });
          return svar;
        })
        .catch(function () {
          return caches.match('./index.html').then(function (treff) {
            return treff || caches.match('./');
          });
        })
    );
    return;
  }

  // Alt annet: lageret først. Appen laster ingenting utenfra, så dette er
  // bare appens egne filer.
  e.respondWith(
    caches.match(req).then(function (treff) {
      if (treff) return treff;
      return fetch(req).then(function (svar) {
        if (svar && svar.status === 200 && svar.type === 'basic') {
          var kopi = svar.clone();
          caches.open(VERSJON).then(function (c) { c.put(req, kopi); });
        }
        return svar;
      });
    })
  );
});
