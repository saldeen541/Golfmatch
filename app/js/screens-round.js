/* ==========================================================================
   Golfapp - oppsett av runde, rundevisning og innstillinger
   ========================================================================== */

(function (global) {
  'use strict';

  var el = UI.el;
  var Screens = global.Screens;

  /* ======================================================================
     Ny runde
     ====================================================================== */

  Screens['ny-runde'] = function (nav) {
    var valgteSpillere = [];
    var valgtBaneId = null;
    var nyttBanenavn = '';
    var antallHull = 18;
    var modus = 'match';
    var lagoppsett = 'tilfeldig';   // brukes ved fire spillere i scramble
    var manuelleLag = null;

    var spillere = GolfStore.players();
    var baner = GolfStore.courses();

    var wrap = el('div', { class: 'stack' });

    /* ---- 1. spillere -------------------------------------------------- */

    var spillerBoks = el('div', { class: 'pick-grid' });
    var spillerTeller = el('p', { class: 'muted', text: 'Ingen valgt. Maks fire.' });

    // Tomtilstanden får hele bredden, ikke én rute i rutenettet.
    var ingenSpillere = !spillere.length ? UI.emptyState(
      'Ingen spillere ennå',
      'Legg til spillerne først, så kan du starte runden.',
      el('button', {
        class: 'btn btn-secondary', text: 'Gå til spillere',
        onclick: function () { nav('spillere'); }
      })) : null;

    if (spillere.length) {
      spillere.forEach(function (p) {
        var knapp = el('button', {
          type: 'button', class: 'pick-card', 'aria-pressed': 'false',
          dataset: { id: p.id },
          onclick: function () { velgSpiller(p, knapp); }
        }, [
          el('span', { class: 'pick-avatar' }, UI.avatar(p.avatarId, 56)),
          el('span', { class: 'pick-name', text: p.name })
        ]);
        spillerBoks.appendChild(knapp);
      });
    }

    function velgSpiller(p, knapp) {
      var i = valgteSpillere.indexOf(p.id);
      if (i >= 0) {
        valgteSpillere.splice(i, 1);
      } else {
        if (valgteSpillere.length >= 4) { UI.toast('Maks fire spillere i en runde'); return; }
        valgteSpillere.push(p.id);
      }
      knapp.setAttribute('aria-pressed', String(valgteSpillere.indexOf(p.id) >= 0));
      oppdaterSpillerFarger();
      oppdaterTeller();
      oppdaterLagValg();
      oppdaterStartKnapp();
    }

    function oppdaterSpillerFarger() {
      Array.prototype.forEach.call(spillerBoks.children, function (knapp) {
        if (!knapp.dataset || !knapp.dataset.id) return;
        var pos = valgteSpillere.indexOf(knapp.dataset.id);
        knapp.style.setProperty('--player-color',
          pos >= 0 ? 'var(' + UI.playerColorVar(pos) + ')' : 'transparent');
      });
    }

    function oppdaterTeller() {
      spillerTeller.textContent = valgteSpillere.length === 0
        ? 'Ingen valgt. Maks fire.'
        : UI.plural(valgteSpillere.length, 'spiller valgt', 'spillere valgt') + '. Maks fire.';
    }

    /* ---- 2. bane ------------------------------------------------------ */

    var nyBaneFelt = el('input', {
      type: 'text', class: 'field', maxlength: '40', autocomplete: 'off',
      placeholder: 'Skriv banenavn',
      oninput: function () {
        nyttBanenavn = nyBaneFelt.value.trim();
        if (nyttBanenavn) { valgtBaneId = null; merkBane(); }
        oppdaterStartKnapp();
      }
    });

    var baneListe = el('div', { class: 'chip-row' });
    baner.forEach(function (c) {
      baneListe.appendChild(el('button', {
        type: 'button', class: 'chip', 'aria-pressed': 'false',
        dataset: { id: c.id },
        text: c.name + ' (' + c.holes + ')',
        onclick: function () {
          valgtBaneId = valgtBaneId === c.id ? null : c.id;
          if (valgtBaneId) {
            nyBaneFelt.value = '';
            nyttBanenavn = '';
            antallHull = c.holes;
            merkHull();
          }
          merkBane();
          oppdaterStartKnapp();
        }
      }));
    });

    function merkBane() {
      Array.prototype.forEach.call(baneListe.children, function (b) {
        b.setAttribute('aria-pressed', String(b.dataset.id === valgtBaneId));
      });
    }

    /* ---- 3. hull ------------------------------------------------------ */

    var hullValg = el('div', { class: 'segmented', role: 'group', 'aria-label': 'Antall hull' }, [
      hullKnapp(9), hullKnapp(18)
    ]);

    function hullKnapp(n) {
      return el('button', {
        type: 'button', 'aria-pressed': String(antallHull === n), text: n + ' hull',
        dataset: { n: String(n) },
        onclick: function () { antallHull = n; merkHull(); }
      });
    }

    function merkHull() {
      Array.prototype.forEach.call(hullValg.children, function (b) {
        b.setAttribute('aria-pressed', String(Number(b.dataset.n) === antallHull));
      });
    }

    /* ---- 4. modus ----------------------------------------------------- */

    var modusValg = el('div', { class: 'segmented', role: 'group', 'aria-label': 'Spillmodus' }, [
      modusKnapp('match', 'Match'), modusKnapp('scramble', 'Scramble')
    ]);

    function modusKnapp(verdi, tekst) {
      return el('button', {
        type: 'button', 'aria-pressed': String(modus === verdi), text: tekst,
        dataset: { modus: verdi },
        onclick: function () {
          modus = verdi;
          Array.prototype.forEach.call(modusValg.children, function (b) {
            b.setAttribute('aria-pressed', String(b.dataset.modus === modus));
          });
          oppdaterLagValg();
          oppdaterStartKnapp();
        }
      });
    }

    /* ---- 5. lag i scramble -------------------------------------------- */

    var lagBoks = el('section', { class: 'card stack', hidden: true });

    function oppdaterLagValg() {
      UI.clear(lagBoks);
      var n = valgteSpillere.length;
      if (modus !== 'scramble' || n < 2) { lagBoks.hidden = true; return; }
      lagBoks.hidden = false;

      lagBoks.appendChild(el('p', { class: 'label', text: 'Lag' }));

      if (n === 2 || n === 3) {
        manuelleLag = null;
        lagBoks.appendChild(el('p', { class: 'muted', text:
          'Med ' + n + ' spillere spiller dere på ett lag sammen.' }));
        return;
      }

      // Fire spillere: to lag på to.
      lagBoks.appendChild(el('p', { class: 'muted', text:
        'Med fire spillere blir det to lag på to. Velg hvordan lagene settes.' }));

      var valg = el('div', { class: 'segmented', role: 'group', 'aria-label': 'Lagoppsett' }, [
        lagKnapp('tilfeldig', 'Tilfeldig'), lagKnapp('manuelt', 'Jeg velger')
      ]);
      lagBoks.appendChild(valg);

      var manuellBoks = el('div', { class: 'stack', hidden: lagoppsett !== 'manuelt' });
      lagBoks.appendChild(manuellBoks);

      function lagKnapp(verdi, tekst) {
        return el('button', {
          type: 'button', 'aria-pressed': String(lagoppsett === verdi), text: tekst,
          dataset: { v: verdi },
          onclick: function () {
            lagoppsett = verdi;
            Array.prototype.forEach.call(valg.children, function (b) {
              b.setAttribute('aria-pressed', String(b.dataset.v === lagoppsett));
            });
            manuellBoks.hidden = lagoppsett !== 'manuelt';
            if (lagoppsett === 'manuelt') byggManuell(manuellBoks);
            else manuelleLag = null;
            oppdaterStartKnapp();
          }
        });
      }

      if (lagoppsett === 'manuelt') byggManuell(manuellBoks);
    }

    function byggManuell(boks) {
      UI.clear(boks);
      if (!manuelleLag) manuelleLag = [[], []];
      // Rydd bort spillere som er tatt ut av runden igjen.
      manuelleLag = manuelleLag.map(function (lag) {
        return lag.filter(function (id) { return valgteSpillere.indexOf(id) >= 0; });
      });

      boks.appendChild(el('p', { class: 'muted', text: 'Trykk på en spiller for å flytte mellom lagene.' }));

      valgteSpillere.forEach(function (id) {
        var p = GolfStore.player(id);
        if (!p) return;
        var lagNr = manuelleLag[0].indexOf(id) >= 0 ? 0
                  : manuelleLag[1].indexOf(id) >= 0 ? 1 : null;
        if (lagNr === null) {
          lagNr = manuelleLag[0].length <= manuelleLag[1].length ? 0 : 1;
          manuelleLag[lagNr].push(id);
        }
        var rad = el('button', { class: 'list-row', onclick: function () {
          var fra = manuelleLag[0].indexOf(id) >= 0 ? 0 : 1;
          var til = fra === 0 ? 1 : 0;
          if (manuelleLag[til].length >= 2) { UI.toast('Laget er fullt'); return; }
          manuelleLag[fra].splice(manuelleLag[fra].indexOf(id), 1);
          manuelleLag[til].push(id);
          byggManuell(boks);
          oppdaterStartKnapp();
        } }, [
          UI.avatar(p.avatarId, 40),
          el('span', { class: 'list-row-main', text: p.name }),
          el('span', { class: 'badge badge-solo', text: 'Lag ' + (lagNr + 1) })
        ]);
        boks.appendChild(rad);
      });
    }

    /* ---- start -------------------------------------------------------- */

    var startKnapp = el('button', {
      class: 'btn btn-primary btn-lg btn-block',
      text: 'Start runde',
      disabled: true,
      onclick: start
    });

    var startHjelp = el('p', { class: 'muted center' });

    function mangler() {
      if (valgteSpillere.length < 1) return 'Velg minst én spiller.';
      if (modus === 'scramble' && valgteSpillere.length < 2) return 'Scramble krever minst to spillere.';
      if (!valgtBaneId && !nyttBanenavn) return 'Velg eller skriv inn en bane.';
      if (modus === 'scramble' && valgteSpillere.length === 4 && lagoppsett === 'manuelt') {
        if (!manuelleLag || manuelleLag[0].length !== 2 || manuelleLag[1].length !== 2) {
          return 'Fordel spillerne to og to.';
        }
      }
      return null;
    }

    function oppdaterStartKnapp() {
      var problem = mangler();
      startKnapp.disabled = !!problem;
      startHjelp.textContent = problem || '';
    }

    function lagLag() {
      if (modus !== 'scramble') return null;
      var n = valgteSpillere.length;
      if (n === 2 || n === 3) return [{ name: 'Laget', playerIds: valgteSpillere.slice() }];
      var par;
      if (lagoppsett === 'manuelt') {
        par = [manuelleLag[0].slice(), manuelleLag[1].slice()];
      } else {
        var stokket = valgteSpillere.slice();
        for (var i = stokket.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var t = stokket[i]; stokket[i] = stokket[j]; stokket[j] = t;
        }
        par = [stokket.slice(0, 2), stokket.slice(2, 4)];
      }
      return par.map(function (ids) {
        return {
          name: ids.map(function (id) {
            var p = GolfStore.player(id);
            return p ? p.name.split(' ')[0] : '?';
          }).join(' og '),
          playerIds: ids
        };
      });
    }

    function start() {
      var problem = mangler();
      if (problem) { UI.toast(problem); return; }

      var forberedelse;
      if (valgtBaneId) {
        forberedelse = Promise.resolve(GolfStore.course(valgtBaneId));
      } else {
        // Ny bane skrevet inn her lagres i biblioteket med én gang.
        forberedelse = GolfStore.saveCourse({ name: nyttBanenavn, holes: antallHull, pars: null });
      }

      forberedelse.then(function (bane) {
        return GolfStore.createRound({
          mode: modus,
          holes: antallHull,
          courseId: bane ? bane.id : null,
          courseName: bane ? bane.name : nyttBanenavn,
          playerIds: valgteSpillere,
          teams: lagLag()
        });
      }).then(function (runde) {
        UI.toast('Runden er startet');
        nav.erstatt('runde', { id: runde.id });
      });
    }

    /* ---- sett sammen skjermen ------------------------------------------ */

    wrap.appendChild(el('section', { class: 'card stack' }, [
      el('p', { class: 'label', text: 'Hvem spiller?' }),
      ingenSpillere ? null : spillerTeller,
      ingenSpillere || spillerBoks
    ]));

    wrap.appendChild(el('section', { class: 'card stack' }, [
      el('p', { class: 'label', text: 'Bane' }),
      baner.length ? el('p', { class: 'muted', text: 'Velg en lagret bane, eller skriv inn en ny.' })
                   : el('p', { class: 'muted', text: 'Skriv inn banenavnet. Den lagres til neste gang.' }),
      baner.length ? baneListe : null,
      nyBaneFelt,
      el('p', { class: 'label', style: 'margin-top:12px', text: 'Antall hull' }),
      hullValg,
      el('p', { class: 'muted', text: 'Du kan endre antall hull underveis i runden.' })
    ]));

    wrap.appendChild(el('section', { class: 'card stack' }, [
      el('p', { class: 'label', text: 'Spillmodus' }),
      modusValg
    ]));

    wrap.appendChild(lagBoks);
    wrap.appendChild(startKnapp);
    wrap.appendChild(startHjelp);

    oppdaterLagValg();
    oppdaterStartKnapp();
    return wrap;
  };

  /* ======================================================================
     Rundevisning - registreringen kommer i fase 3 og 4
     ====================================================================== */

  Screens.runde = function (nav, params) {
    var r = GolfStore.round(params.id);
    if (!r) return UI.emptyState('Fant ikke runden', 'Den kan ha blitt slettet.');

    // Ferdige runder vises som resultat, ikke som registrering.
    if (r.status === 'avbrutt') return Screens['runde-detaljer'](nav, params);
    if (r.status !== 'pagar') return Screens.resultat(nav, params);

    return r.mode === 'match'
      ? Screens['match-runde'](nav, params, r)
      : Screens['scramble-runde'](nav, params, r);
  };

  /* Sletteknappen er den samme overalt: bekreftelse først, og teksten sier
     hva som faktisk skjer. Statistikken regnes ut fra rundene ved visning,
     så tabeller, seierspall og banestatistikk oppdaterer seg av seg selv
     når runden er borte. */
  Screens.slettRundeKnapp = function (runde, nav) {
    return el('button', {
      class: 'btn btn-danger btn-block',
      text: 'Slett runden',
      onclick: function () {
        var navn = runde.playerIds.map(function (id) {
          var p = GolfStore.player(id);
          return p ? p.name : 'Ukjent';
        }).join(', ');
        UI.confirm({
          title: 'Slette runden?',
          body: (runde.mode === 'match' ? 'Match' : 'Scramble') + ' på ' +
                runde.courseName + ' ' + UI.formatDate(runde.startedAt) +
                ', med ' + navn + '. Runden fjernes fra historikken, og ' +
                'poeng og statistikk regnes om uten den. Dette kan ikke angres.',
          confirmText: 'Slett runden',
          cancelText: 'Behold',
          danger: true
        }).then(function (ok) {
          if (!ok) return;
          GolfStore.removeRound(runde.id).then(function () {
            UI.toast('Runden er slettet');
            nav.rot('hjem');
          });
        });
      }
    });
  };

  /* Del rapporten som bilde. Samme knapp i begge resultatskjermene. */
  Screens.delRapportKnapp = function (runde, hullRader, bane) {
    var knapp = el('button', {
      class: 'btn btn-primary btn-block',
      text: 'Del rapport som bilde',
      onclick: function () {
        knapp.disabled = true;
        var opprinnelig = knapp.textContent;
        knapp.textContent = 'Lager bildet …';
        GolfRapport.del(runde, hullRader, bane).then(function (hvordan) {
          if (hvordan !== 'avbrutt') UI.toast('Rapporten er ' + hvordan);
        }).catch(function (e) {
          console.error(e);
          UI.toast('Klarte ikke å lage bildet');
        }).then(function () {
          knapp.disabled = false;
          knapp.textContent = opprinnelig;
        });
      }
    });
    return knapp;
  };

  /* Scorekortet hull for hull, slik det vises i appen. */
  Screens.scorekort = function (runde, hullRader, bane) {
    var tabell = el('table', { class: 'scoreboard' });
    var erMatch = runde.mode === 'match';
    var lag = erMatch ? null : (runde.teams && runde.teams.length
      ? runde.teams : [{ name: 'Laget', playerIds: runde.playerIds.slice() }]);
    var pars = bane && bane.pars;

    function rad(hull) {
      for (var i = 0; i < hullRader.length; i++) {
        if (hullRader[i].hole === hull) return hullRader[i];
      }
      return null;
    }

    var hode = el('tr', null, [el('th', { text: erMatch ? 'Spiller' : 'Lag' })]);
    for (var h = 1; h <= runde.holes; h++) hode.appendChild(el('th', { text: String(h) }));
    hode.appendChild(el('th', { text: 'Sum' }));
    tabell.appendChild(el('thead', null, hode));

    if (pars) {
      var parRad = el('tr', { class: 'par-rad' }, [el('td', { text: 'Par' })]);
      for (var h2 = 1; h2 <= runde.holes; h2++) {
        parRad.appendChild(el('td', { class: 'num', text: pars[h2 - 1] ? String(pars[h2 - 1]) : '–' }));
      }
      parRad.appendChild(el('td', { class: 'num', text:
        String(pars.slice(0, runde.holes).reduce(function (a, b) { return a + b; }, 0)) }));
      tabell.appendChild(el('tbody', null, parRad));
    }

    var kropp = el('tbody');
    if (erMatch) {
      var perHull = GolfMatch.poengPerHull(hullRader, runde.playerIds);
      var sum = GolfMatch.totaler(hullRader, runde.playerIds);
      var best = Math.max.apply(null, runde.playerIds.map(function (id) { return sum[id]; }));
      runde.playerIds.forEach(function (id, i) {
        var p = GolfStore.player(id);
        var tr = el('tr', { dataset: { leader: String(sum[id] === best && best > 0) } }, [
          el('td', null, el('span', { class: 'sb-player' }, [
            UI.avatar(p ? p.avatarId : 'rev', 32, UI.playerColorVar(i)),
            el('span', { text: p ? p.name : 'Ukjent' })
          ]))
        ]);
        for (var h3 = 1; h3 <= runde.holes; h3++) {
          var r3 = rad(h3);
          var slag = r3 && r3.strokes ? r3.strokes[id] : undefined;
          var poeng = perHull[h3] ? perHull[h3][id] : 0;
          tr.appendChild(el('td', { class: 'num' }, [
            el('span', { class: 'sb-strokes', text: slag === undefined ? '–' : String(slag) }),
            el('span', { class: 'sb-points' + (poeng === 1 ? ' is-win' : ''),
              text: perHull[h3] ? halv(poeng) : '' })
          ]));
        }
        tr.appendChild(el('td', { class: 'total num', text: halv(sum[id]) }));
        kropp.appendChild(tr);
      });
    } else {
      var st = GolfScramble.stilling(hullRader, lag.length);
      lag.forEach(function (l, i) {
        var leder = lag.length > 1 && GolfScramble.total(hullRader, i) > 0 &&
          st.filter(function (x) { return x.place === 1; })
            .some(function (x) { return x.teamIndex === i; });
        var tr = el('tr', { dataset: { leader: String(leder) } },
          [el('td', { text: lag.length > 1 ? l.name : 'Slag' })]);
        for (var h4 = 1; h4 <= runde.holes; h4++) {
          var d = GolfScramble.lagData(rad(h4), i);
          tr.appendChild(el('td', { class: 'num' }, [
            el('span', { class: 'sb-strokes', text: d && d.strokes ? String(d.strokes) : '–' }),
            el('span', { class: 'sb-points' + (d && d.mark ? ' is-win' : ''),
              text: d && d.mark ? (d.mark === 'birdie' ? 'B' : d.mark === 'eagle' ? 'E' : 'HIO') : '' })
          ]));
        }
        tr.appendChild(el('td', { class: 'total num', text: String(GolfScramble.total(hullRader, i)) }));
        kropp.appendChild(tr);
      });
    }
    tabell.appendChild(kropp);

    return el('section', { class: 'stack-tight' }, [
      el('h2', { text: 'Scorekort' }),
      el('p', { class: 'muted small', text: erMatch
        ? 'Øverste tall er slag, nederste er poeng på hullet.'
        : 'Slag per hull. B, E og HIO er birdie, eagle og hole in one.' }),
      el('div', { class: 'card card-tight scroll' }, tabell)
    ]);
  };

  function halv(n) {
    if (n === 0) return '0';
    var hel = Math.floor(n);
    if (hel === 0) return '½';
    return hel + (n % 1 !== 0 ? '½' : '');
  }

  /* ======================================================================
     Historikk: alle runder
     ====================================================================== */

  Screens.historikk = function (nav) {
    var wrap = el('div', { class: 'stack' });
    var alle = GolfStore.rounds().filter(function (r) { return r.status !== 'pagar'; });

    if (!alle.length) {
      wrap.appendChild(UI.emptyState('Ingen runder ennå',
        'Når dere har spilt ferdig en runde, dukker den opp her.'));
      return wrap;
    }

    var filter = 'alle';
    var listeBoks = el('div', { class: 'stack' });

    var filterRad = el('div', { class: 'chip-row' }, [
      filterKnapp('alle', 'Alle'),
      filterKnapp('match', 'Match'),
      filterKnapp('scramble', 'Scramble'),
      filterKnapp('avbrutt', 'Avbrutte')
    ]);

    function filterKnapp(id, tekst) {
      return el('button', {
        type: 'button', class: 'chip chip-sm', text: tekst,
        dataset: { f: id }, 'aria-pressed': String(filter === id),
        onclick: function () {
          filter = id;
          Array.prototype.forEach.call(filterRad.children, function (b) {
            b.setAttribute('aria-pressed', String(b.dataset.f === filter));
          });
          tegnListe();
        }
      });
    }

    function tegnListe() {
      UI.clear(listeBoks);
      var vist = alle.filter(function (r) {
        if (filter === 'alle') return true;
        if (filter === 'avbrutt') return r.status === 'avbrutt';
        return r.mode === filter && r.status === 'fullfort';
      });
      if (!vist.length) {
        listeBoks.appendChild(UI.emptyState('Ingen runder i utvalget', ''));
        return;
      }
      listeBoks.appendChild(el('p', { class: 'muted small', text:
        UI.plural(vist.length, 'runde', 'runder') + '. Åpne en runde for å se den eller slette den.' }));
      vist.forEach(function (r) { listeBoks.appendChild(rundeKort(r, nav)); });
    }

    wrap.appendChild(filterRad);
    wrap.appendChild(listeBoks);
    tegnListe();
    return wrap;
  };

  function rundeKort(r, nav) {
    var navn = r.playerIds.map(function (id) {
      var p = GolfStore.player(id);
      return p ? p.name : 'Ukjent';
    }).join(', ');
    return el('button', {
      class: 'round-card', onclick: function () { nav('runde', { id: r.id }); }
    }, [
      el('div', { class: 'round-card-top' }, [
        el('span', { class: 'round-card-date', text: UI.formatDate(r.startedAt) }),
        r.status === 'avbrutt'
          ? el('span', { class: 'badge badge-avbrutt', text: 'Avbrutt' })
          : el('span', { class: 'badge badge-solo', text: r.mode === 'match' ? 'Match' : 'Scramble' }),
        el('span', { class: 'badge badge-solo', text: r.holes + ' hull' })
      ]),
      el('span', { class: 'round-card-course', text: r.courseName }),
      el('span', { class: 'round-card-players muted', text: navn })
    ]);
  }

  // Resultatskjermen velger visning ut fra spillmodus.
  Screens.resultat = function (nav, params) {
    var r = GolfStore.round(params.id);
    if (!r) return UI.emptyState('Fant ikke runden', 'Den kan ha blitt slettet.');
    return r.mode === 'match'
      ? Screens['match-resultat'](nav, params, r)
      : Screens['scramble-resultat'](nav, params, r);
  };

  // Behold den gamle detaljvisningen tilgjengelig for avbrutte runder.
  Screens['runde-detaljer'] = function (nav, params) {
    var r = GolfStore.round(params.id);
    if (!r) return UI.emptyState('Fant ikke runden', 'Den kan ha blitt slettet.');

    var wrap = el('div', { class: 'stack' });

    var deltakere = el('div', { class: 'list' });
    r.playerIds.forEach(function (id, i) {
      var p = GolfStore.player(id);
      deltakere.appendChild(el('div', { class: 'list-row' }, [
        UI.avatar(p ? p.avatarId : 'rev', 40, UI.playerColorVar(i)),
        el('span', { class: 'list-row-main', text: p ? p.name : 'Ukjent spiller' })
      ]));
    });

    wrap.appendChild(el('section', { class: 'card stack' }, [
      el('h2', { text: r.courseName }),
      el('p', { class: 'muted', text:
        (r.mode === 'match' ? 'Match' : 'Scramble') + ' · ' + r.holes + ' hull · ' +
        UI.formatDate(r.startedAt) + ' · ' + statusTekst(r.status) }),
      deltakere
    ]));

    if (r.teams && r.teams.length > 1) {
      var lagBoks = el('section', { class: 'card stack' }, [ el('p', { class: 'label', text: 'Lag' }) ]);
      r.teams.forEach(function (lag, n) {
        lagBoks.appendChild(el('div', { class: 'list-row' }, [
          el('span', { class: 'badge badge-solo', text: 'Lag ' + (n + 1) }),
          el('span', { class: 'list-row-main', text: lag.name })
        ]));
      });
      wrap.appendChild(lagBoks);
    }

    wrap.appendChild(el('section', { class: 'notice' }, [
      el('p', { text: 'Selve registreringen hull for hull kommer i neste steg: Match i fase 3 og Scramble i fase 4. Runden er lagret, så den ligger her når registreringen er på plass.' })
    ]));

    if (r.status === 'pagar') {
      wrap.appendChild(el('button', {
        class: 'btn btn-danger btn-block', text: 'Avbryt runden',
        onclick: function () {
          UI.confirm({
            title: 'Avbryte runden?',
            body: 'Runden blir liggende merket som avbrutt, men teller ikke i statistikken.',
            confirmText: 'Avbryt runden', cancelText: 'Behold', danger: true
          }).then(function (ok) {
            if (!ok) return;
            GolfStore.setRoundStatus(r.id, 'avbrutt').then(function () {
              UI.toast('Runden er avbrutt');
              nav.rot('hjem');
            });
          });
        }
      }));
    } else {
      wrap.appendChild(Screens.slettRundeKnapp(r, nav));
    }

    return wrap;
  };

  function statusTekst(s) {
    return s === 'pagar' ? 'pågår' : s === 'fullfort' ? 'fullført' : 'avbrutt';
  }

  /* ======================================================================
     Innstillinger
     ====================================================================== */

  Screens.innstillinger = function (nav) {
    var s = GolfStore.settings();
    var wrap = el('div', { class: 'stack' });

    /* ---- sikkerhetskopi ---------------------------------------------- */

    var filFelt = el('input', {
      type: 'file', accept: 'application/json,.json', class: 'visually-hidden',
      onchange: function () {
        var fil = filFelt.files && filFelt.files[0];
        if (!fil) return;
        GolfBackup.readFile(fil).then(function (payload) {
          var sum = GolfBackup.summarize(payload);
          return UI.confirm({
            title: 'Gjenopprette fra kopien?',
            body: 'Kopien inneholder ' + sum.players + ' spillere, ' + sum.courses +
                  ' baner og ' + sum.rounds + ' runder. Alt som ligger i appen nå blir erstattet.',
            confirmText: 'Gjenopprett', danger: true
          }).then(function (ok) {
            if (!ok) return null;
            return GolfBackup.restore(payload);
          });
        }).then(function (gjort) {
          if (gjort === null) return;
          UI.toast('Dataene er gjenopprettet');
          nav.rot('innstillinger');
        }).catch(function (err) {
          UI.toast(err.message || 'Klarte ikke å lese filen');
        }).then(function () { filFelt.value = ''; });
      }
    });

    var sisteKopi = s.lastBackupAt
      ? 'Sist tatt ' + UI.formatDate(s.lastBackupAt) + '.'
      : 'Du har ikke tatt kopi ennå.';

    wrap.appendChild(el('section', { class: 'card stack' }, [
      el('h2', { text: 'Sikkerhetskopi' }),
      el('p', { class: 'muted', text:
        'Kopien er en fil med all data i. Den lages på telefonen og deles gjennom telefonens egen delefunksjon. Ingenting sendes til noen server.' }),
      el('p', { class: 'muted', text: sisteKopi + ' ' +
        UI.plural(s.roundsSinceBackup || 0, 'fullført runde', 'fullførte runder') +
        ' siden sist.' }),
      el('button', {
        class: 'btn btn-primary btn-block', text: 'Ta sikkerhetskopi',
        onclick: function () {
          GolfBackup.exportBackup().then(function (hvordan) {
            if (hvordan === 'avbrutt') return;
            UI.toast('Sikkerhetskopi ' + hvordan);
            nav.rot('innstillinger');
          }).catch(function () { UI.toast('Klarte ikke å lage kopi'); });
        }
      }),
      el('button', {
        class: 'btn btn-secondary btn-block', text: 'Gjenopprett fra fil',
        onclick: function () { filFelt.click(); }
      }),
      filFelt
    ]));

    /* ---- poengmodell -------------------------------------------------- */

    var modellValg = el('div', { class: 'segmented', role: 'group', 'aria-label': 'Poengmodell' }, [
      modellKnapp('skalerende', 'Skalerende'),
      modellKnapp('fast', 'Fast 3 poeng')
    ]);

    function modellKnapp(verdi, tekst) {
      return el('button', {
        type: 'button', 'aria-pressed': String(s.poengmodell === verdi), text: tekst,
        dataset: { v: verdi },
        onclick: function () {
          GolfStore.saveSettings({ poengmodell: verdi }).then(function () {
            Array.prototype.forEach.call(modellValg.children, function (b) {
              b.setAttribute('aria-pressed', String(b.dataset.v === verdi));
            });
            UI.toast('Poengmodellen er endret');
          });
        }
      });
    }

    wrap.appendChild(el('section', { class: 'card stack' }, [
      el('h2', { text: 'Poeng i all time-tabellen' }),
      modellValg,
      el('p', { class: 'muted', text:
        'Skalerende: poeng er antall spillere du slår. Fire spillere gir 3, 2, 1, 0. Tre spillere gir 2, 1, 0. To spillere gir 1, 0.' }),
      el('p', { class: 'muted', text:
        'Fast: seier gir alltid 3 poeng. Tabellen viser da også poeng per runde, slik at den som spiller sjeldnere ikke forsvinner.' }),
      el('p', { class: 'muted', text:
        'Valget endrer bare visningen. Alle runder ligger lagret som de er, så du kan bytte fram og tilbake.' })
    ]));

    /* ---- lagring ------------------------------------------------------ */

    var lagringTekst =
      GolfDB.backend === 'indexeddb'
        ? 'Data lagres i nettleserens database på denne enheten.'
      : GolfDB.backend === 'localstorage'
        ? 'Data lagres i nettleserens enkle lager. Det skjer blant annet når filen åpnes rett fra disk i stedet for fra en nettadresse.'
        : 'Advarsel: nettleseren tillater ingen lagring her, så dataene forsvinner når du lukker fanen. Ta sikkerhetskopi før du lukker.';

    wrap.appendChild(el('section', { class: 'card stack' }, [
      el('h2', { text: 'Lagring' }),
      el('p', { class: GolfDB.backend === 'minne' ? 'warn-text' : 'muted', text: lagringTekst }),
      el('p', { class: 'muted', text:
        'All data ligger på denne enheten. Appen laster ingenting utenfra og sender ingenting videre.' })
    ]));

    /* ---- nullstilling -------------------------------------------------- */

    wrap.appendChild(el('button', {
      class: 'btn btn-danger btn-block', text: 'Slett all data',
      onclick: function () {
        UI.confirm({
          title: 'Slette all data?',
          body: 'Alle spillere, baner og runder forsvinner. Ta sikkerhetskopi først hvis du vil kunne hente dem tilbake.',
          confirmText: 'Slett alt', danger: true
        }).then(function (ok) {
          if (!ok) return;
          return GolfDB.replaceAll({}).then(function () { return GolfStore.reload(); })
            .then(function () { UI.toast('All data er slettet'); nav.rot('hjem'); });
        });
      }
    }));

    return wrap;
  };
})(window);
