/* ==========================================================================
   Golfapp - Scramble: registrering hull for hull, scoreboard og resultat
   ========================================================================== */

(function (global) {
  'use strict';

  var el = UI.el;
  var Screens = global.Screens;
  var S = null;   // settes ved bruk, så filen kan lastes i hvilken som helst rekkefølge

  function sc() { return S || (S = global.GolfScramble); }

  /* ======================================================================
     Registrering
     ====================================================================== */

  Screens['scramble-runde'] = function (nav, params, runde) {
    var wrap = el('div', { class: 'stack' });
    var lag = runde.teams && runde.teams.length
      ? runde.teams
      : [{ name: 'Laget', playerIds: runde.playerIds.slice() }];
    var bane = runde.courseId ? GolfStore.course(runde.courseId) : null;

    var hullRader = [];
    var hullNr = 1;
    var laster = el('p', { class: 'muted', text: 'Henter runden …' });
    wrap.appendChild(laster);

    GolfStore.holes(runde.id).then(function (rader) {
      hullRader = rader;
      hullNr = forsteUferdigeHull();
      laster.remove();
      bygg();
    });

    function rad(hull) {
      for (var i = 0; i < hullRader.length; i++) {
        if (hullRader[i].hole === hull) return hullRader[i];
      }
      return null;
    }

    function lagVerdi(hull, lagIndex) {
      var d = sc().lagData(rad(hull), lagIndex);
      return d || { strokes: null, driveBy: null, mark: null, solo: null };
    }

    function forsteUferdigeHull() {
      for (var h = 1; h <= runde.holes; h++) {
        if (!sc().hullFerdig(rad(h), lag.length)) return h;
      }
      return runde.holes;
    }

    function par(hull) {
      return bane && bane.pars && bane.pars[hull - 1] ? bane.pars[hull - 1] : null;
    }

    function navnFor(id) {
      var p = GolfStore.player(id);
      return p ? p.name : 'Ukjent';
    }

    function lagre(hull, lagIndex, endring) {
      var r = rad(hull);
      var teams = r && r.teams
        ? r.teams.map(function (t) { return Object.assign({}, t); })
        : [];
      while (teams.length < lag.length) {
        teams.push({ strokes: null, driveBy: null, mark: null, solo: null });
      }
      Object.keys(endring).forEach(function (k) { teams[lagIndex][k] = endring[k]; });

      return GolfStore.saveHole(runde.id, hull, {}, { teams: teams }).then(function (ny) {
        var fantes = false;
        for (var i = 0; i < hullRader.length; i++) {
          if (hullRader[i].hole === hull) { hullRader[i] = ny; fantes = true; break; }
        }
        if (!fantes) hullRader.push(ny);
        hullRader.sort(function (a, b) { return a.hole - b.hole; });
        runde.holesPlayed = sc().ferdigeHull(hullRader, lag.length);
        return GolfStore.saveRound(runde);
      });
    }

    /* ---- skjermen ---------------------------------------------------- */

    var stillingStripe, hullBoks, navKnapper, avsluttBoks, scoreboardBoks;

    function bygg() {
      stillingStripe = el('div', { class: 'standing' });
      hullBoks = el('div', { class: 'stack' });
      navKnapper = el('div', { class: 'hole-nav' });
      avsluttBoks = el('div', { class: 'stack' });
      scoreboardBoks = el('section', { class: 'stack' });

      wrap.appendChild(stillingStripe);
      wrap.appendChild(hullBoks);
      wrap.appendChild(navKnapper);
      wrap.appendChild(avsluttBoks);
      wrap.appendChild(scoreboardBoks);
      tegnAlt();
    }

    function tegnAlt() {
      tegnStilling();
      tegnHull();
      tegnNav();
      tegnAvslutt();
      tegnScoreboard();
    }

    function tegnStilling() {
      UI.clear(stillingStripe);
      var st = sc().stilling(hullRader, lag.length);
      lag.forEach(function (l, i) {
        var sum = sc().total(hullRader, i);
        var diff = sc().motPar(hullRader, i, bane && bane.pars);
        var leder = lag.length > 1 &&
          st.filter(function (r) { return r.place === 1; })
            .some(function (r) { return r.teamIndex === i; }) && sum > 0;
        stillingStripe.appendChild(el('div', {
          class: 'standing-item' + (leder ? ' is-leader' : '')
        }, [
          el('span', { class: 'standing-name', text: l.name }),
          el('span', { class: 'standing-points num', text: String(sum) }),
          diff !== null ? el('span', { class: 'standing-par muted num',
            text: sc().motParTekst(diff) }) : null
        ]));
      });
    }

    function tegnHull() {
      UI.clear(hullBoks);
      var p = par(hullNr);

      hullBoks.appendChild(el('div', { class: 'hole-head' }, [
        el('span', { class: 'hole-title', text: 'Hull ' + hullNr }),
        el('span', { class: 'hole-of muted', text: 'av ' + runde.holes }),
        p ? el('span', { class: 'badge badge-solo', text: 'Par ' + p }) : null
      ]));

      lag.forEach(function (l, i) { hullBoks.appendChild(lagKort(l, i)); });
    }

    function lagKort(l, lagIndex) {
      var kort = el('section', { class: 'card stack' });
      var d = lagVerdi(hullNr, lagIndex);
      var parVerdi = par(hullNr);

      if (lag.length > 1) {
        kort.appendChild(el('div', { class: 'team-head' }, [
          el('span', { class: 'badge badge-solo', text: 'Lag ' + (lagIndex + 1) }),
          el('span', { class: 'team-name', text: l.name })
        ]));
      }

      /* --- slag --- */
      var felt = el('input', {
        type: 'number', class: 'stroke-input num', min: '1', max: '20',
        inputmode: 'numeric', 'aria-label': 'Slag for ' + l.name,
        value: d.strokes === null || d.strokes === undefined ? '' : String(d.strokes),
        onfocus: function () { felt.select(); },
        onchange: function () {
          var n = parseInt(felt.value, 10);
          skrivSlag(isNaN(n) || n < 1 ? null : Math.min(n, 20));
        }
      });

      function skrivSlag(n) {
        felt.value = n === null ? '' : String(n);
        var endring = { strokes: n };
        // Med par registrert foreslår appen birdie, eagle eller hole in one.
        // Forslaget kan alltid overstyres eller fjernes.
        if (n !== null && !d.mark) {
          var forslag = sc().foreslaaMerke(n, par(hullNr));
          if (forslag) endring.mark = forslag;
          // Hole in one er per definisjon én spillers slag, så spilleren
          // fylles inn fra utslaget når vi vet hvem det var.
          if (forslag === 'hio' && !d.solo && d.driveBy) endring.solo = d.driveBy;
        }
        if (n === null) { endring.mark = null; endring.solo = null; }
        lagre(hullNr, lagIndex, endring).then(function () {
          tegnStilling(); tegnHull(); tegnAvslutt(); tegnScoreboard();
        });
      }

      function juster(retning) {
        if (d.strokes === null || d.strokes === undefined) {
          skrivSlag(par(hullNr) || 4);
          return;
        }
        skrivSlag(Math.max(1, Math.min(20, d.strokes + retning)));
      }

      kort.appendChild(el('div', { class: 'stroke-row' }, [
        el('span', { class: 'stroke-name', text: 'Slag på hullet' }),
        el('div', { class: 'stepper' }, [
          el('button', { type: 'button', text: '−',
            'aria-label': 'Ett slag mindre', onclick: function () { juster(-1); } }),
          felt,
          el('button', { type: 'button', text: '+',
            'aria-label': 'Ett slag mer', onclick: function () { juster(1); } })
        ])
      ]));

      /* --- hvem sitt utslag --- */
      var utslagRad = el('div', { class: 'chip-row' });
      l.playerIds.forEach(function (pid) {
        var p = GolfStore.player(pid);
        utslagRad.appendChild(el('button', {
          type: 'button', class: 'chip chip-avatar',
          'aria-pressed': String(d.driveBy === pid),
          onclick: function () {
            lagre(hullNr, lagIndex, { driveBy: d.driveBy === pid ? null : pid })
              .then(function () { tegnHull(); tegnScoreboard(); });
          }
        }, [
          UI.avatar(p ? p.avatarId : 'rev', 28),
          el('span', { text: p ? p.name : 'Ukjent' })
        ]));
      });
      kort.appendChild(el('div', { class: 'stack-tight' }, [
        el('p', { class: 'label', text: 'Hvem sitt utslag brukte dere?' }),
        utslagRad
      ]));

      /* --- birdie, eagle, hole in one --- */
      var merkeRad = el('div', { class: 'chip-row' });
      sc().MERKER.forEach(function (m) {
        merkeRad.appendChild(el('button', {
          type: 'button', class: 'chip',
          'aria-pressed': String(d.mark === m.id),
          text: m.navn,
          onclick: function () {
            var ny = d.mark === m.id ? null : m.id;
            var solo = ny ? d.solo : null;
            // Hole in one må ha en spiller. Vi foreslår den hvis utslaget
            // allerede er registrert.
            if (ny === 'hio' && !solo && d.driveBy) solo = d.driveBy;
            lagre(hullNr, lagIndex, { mark: ny, solo: solo })
              .then(function () { tegnHull(); tegnScoreboard(); });
          }
        }));
      });
      kort.appendChild(el('div', { class: 'stack-tight' }, [
        el('p', { class: 'label', text: 'Birdie, eagle eller hole in one?' }),
        el('p', { class: 'muted small', text:
          parVerdi ? 'Foreslås ut fra par, og kan endres eller fjernes.'
                   : 'Registreres manuelt. Legg inn par på banen for at appen skal foreslå det selv.' }),
        merkeRad
      ]));

      /* --- solo --- */
      if (d.mark) {
        var erHio = d.mark === 'hio';
        var soloRad = el('div', { class: 'chip-row' });
        l.playerIds.forEach(function (pid) {
          var p2 = GolfStore.player(pid);
          soloRad.appendChild(el('button', {
            type: 'button', class: 'chip chip-avatar',
            'aria-pressed': String(d.solo === pid),
            onclick: function () {
              // Ved hole in one kan man bytte spiller, men ikke fjerne den.
              var ny = d.solo === pid ? (erHio ? pid : null) : pid;
              lagre(hullNr, lagIndex, { solo: ny })
                .then(function () { tegnHull(); tegnScoreboard(); });
            }
          }, [
            UI.avatar(p2 ? p2.avatarId : 'rev', 28),
            el('span', { text: p2 ? p2.name : 'Ukjent' })
          ]));
        });

        if (!erHio) {
          soloRad.appendChild(el('button', {
            type: 'button', class: 'chip',
            'aria-pressed': String(!d.solo),
            text: 'Ingen solo',
            onclick: function () {
              lagre(hullNr, lagIndex, { solo: null })
                .then(function () { tegnHull(); tegnScoreboard(); });
            }
          }));
        }

        kort.appendChild(el('div', { class: 'stack-tight' }, [
          el('p', { class: 'label', text: erHio
            ? 'Hvem slo hole in one?'
            : 'Solo ' + sc().merkeNavn(d.mark).toLowerCase() + '?' }),
          el('p', { class: erHio && !d.solo ? 'warn-text small' : 'muted small', text: erHio
            ? (d.solo ? 'En hole in one er alltid én spillers slag.'
                      : 'Må fylles ut. En hole in one er alltid én spillers slag.')
            : 'Var det én spiller som sto for det alene? Hopp over hvis ikke.' }),
          soloRad
        ]));
      }

      return kort;
    }

    function tegnNav() {
      UI.clear(navKnapper);
      navKnapper.appendChild(el('button', {
        class: 'btn btn-secondary', text: '‹ Forrige', disabled: hullNr <= 1,
        onclick: function () { hullNr--; tegnHull(); tegnNav(); window.scrollTo(0, 0); }
      }));
      navKnapper.appendChild(el('button', {
        class: 'btn btn-primary', text: 'Neste ›', disabled: hullNr >= runde.holes,
        onclick: function () { hullNr++; tegnHull(); tegnNav(); window.scrollTo(0, 0); }
      }));
    }

    function tegnAvslutt() {
      UI.clear(avsluttBoks);
      var ferdige = sc().ferdigeHull(hullRader, lag.length);
      avsluttBoks.appendChild(el('p', { class: 'muted center', text:
        ferdige + ' av ' + runde.holes + ' hull er ferdig registrert.' }));
      avsluttBoks.appendChild(el('button', {
        class: 'btn btn-primary btn-lg btn-block', text: 'Avslutt runden',
        onclick: avsluttRunden
      }));
      avsluttBoks.appendChild(el('button', {
        class: 'btn btn-ghost btn-block',
        text: runde.holes === 18 ? 'Endre til 9 hull' : 'Utvid til 18 hull',
        onclick: endreAntallHull
      }));
    }

    // Hole in one uten spiller ville forsvunnet ut av spillerstatistikken,
    // så vi sier fra før runden lukkes.
    function hioUtenSpiller() {
      var hull = [];
      hullRader.forEach(function (r) {
        (r.teams || []).forEach(function (t) {
          if (t && t.mark === 'hio' && !t.solo) hull.push(r.hole);
        });
      });
      return hull;
    }

    function avsluttRunden() {
      var ferdige = sc().ferdigeHull(hullRader, lag.length);
      var mangler = hioUtenSpiller();

      if (mangler.length) {
        UI.confirm({
          title: 'Hole in one mangler spiller',
          body: 'På hull ' + mangler.join(', ') + ' er det registrert hole in one ' +
                'uten at spilleren er pekt ut. Uten spiller havner den ikke i ' +
                'spillerstatistikken.',
          confirmText: 'Gå til hullet',
          cancelText: 'Avslutt likevel'
        }).then(function (gaaTil) {
          if (gaaTil) {
            hullNr = mangler[0];
            tegnHull(); tegnNav(); tegnScoreboard();
            window.scrollTo(0, 0);
            return;
          }
          lukkRunden(ferdige);
        });
        return;
      }

      UI.confirm({
        title: 'Avslutte runden?',
        body: ferdige === runde.holes
          ? 'Resultatet lagres og legger seg i historikken.'
          : 'Bare ' + ferdige + ' av ' + runde.holes + ' hull er ferdig registrert. ' +
            'Hull uten slag på alle lag teller ikke.',
        confirmText: 'Avslutt og lagre'
      }).then(function (ok) {
        if (!ok) return;
        lukkRunden(ferdige);
      });
    }

    function lukkRunden(ferdige) {
      runde.holesPlayed = ferdige;
      return GolfStore.saveRound(runde)
        .then(function () { return GolfStore.setRoundStatus(runde.id, 'fullfort'); })
        .then(function () { nav.erstatt('resultat', { id: runde.id }); });
    }

    function endreAntallHull() {
      if (runde.holes === 9) {
        runde.holes = 18;
        GolfStore.saveRound(runde).then(function () {
          UI.toast('Scorekortet er utvidet til 18 hull');
          tegnAlt();
        });
        return;
      }
      var ferdige = sc().ferdigeHull(hullRader, lag.length);
      UI.confirm({
        title: 'Gå fra 18 til 9 hull?',
        body: 'Runden avsluttes på de ' + ferdige + ' hullene som er ferdigspilt, ' +
              'og merkes med faktisk antall hull. Dette kan ikke angres.',
        confirmText: 'Avslutt på ' + ferdige + ' hull', danger: true
      }).then(function (ok) {
        if (!ok) return;
        runde.holes = Math.max(1, ferdige);
        runde.holesPlayed = ferdige;
        return GolfStore.removeHolesAbove(runde.id, runde.holes)
          .then(function () { return GolfStore.saveRound(runde); })
          .then(function () { return GolfStore.setRoundStatus(runde.id, 'fullfort'); })
          .then(function () { nav.erstatt('resultat', { id: runde.id }); });
      });
    }

    function tegnScoreboard() {
      UI.clear(scoreboardBoks);
      scoreboardBoks.appendChild(el('h2', { text: 'Scoreboard' }));
      scoreboardBoks.appendChild(el('p', { class: 'muted', text:
        'Slag per hull og totalt. Trykk på et hull for å gå dit.' }));
      scoreboardBoks.appendChild(
        el('div', { class: 'card card-tight scroll' }, byggTabell()));
    }

    function byggTabell() {
      var tabell = el('table', { class: 'scoreboard' });
      var hode = el('tr', null, [el('th', { text: lag.length > 1 ? 'Lag' : 'Hull' })]);
      for (var h = 1; h <= runde.holes; h++) {
        (function (hull) {
          hode.appendChild(el('th', null, el('button', {
            class: 'hole-link' + (hull === hullNr ? ' is-now' : ''),
            text: String(hull),
            onclick: function () {
              hullNr = hull; tegnHull(); tegnNav(); tegnScoreboard(); window.scrollTo(0, 0);
            }
          })));
        })(h);
      }
      hode.appendChild(el('th', { text: 'Sum' }));
      tabell.appendChild(el('thead', null, hode));

      var st = sc().stilling(hullRader, lag.length);
      var kropp = el('tbody');
      lag.forEach(function (l, i) {
        var leder = lag.length > 1 && sc().total(hullRader, i) > 0 &&
          st.filter(function (r) { return r.place === 1; })
            .some(function (r) { return r.teamIndex === i; });
        var tr = el('tr', { dataset: { leader: String(leder) } }, [
          el('td', { text: lag.length > 1 ? l.name : 'Slag' })
        ]);
        for (var h = 1; h <= runde.holes; h++) {
          var d = lagVerdi(h, i);
          tr.appendChild(el('td', { class: 'num' }, [
            el('span', { class: 'sb-strokes', text: d.strokes ? String(d.strokes) : '–' }),
            el('span', { class: 'sb-points' + (d.mark ? ' is-win' : ''),
              text: d.mark ? merkeKort(d.mark) : '' })
          ]));
        }
        tr.appendChild(el('td', { class: 'total num', text: String(sc().total(hullRader, i)) }));
        kropp.appendChild(tr);
      });
      tabell.appendChild(kropp);
      return tabell;
    }

    return wrap;
  };

  function merkeKort(mark) {
    return mark === 'birdie' ? 'B' : mark === 'eagle' ? 'E' : 'HIO';
  }

  /* ======================================================================
     Resultat
     ====================================================================== */

  Screens['scramble-resultat'] = function (nav, params, runde) {
    var wrap = el('div', { class: 'stack' });
    wrap.appendChild(el('p', { class: 'muted', text: 'Henter resultatet …' }));

    var lag = runde.teams && runde.teams.length
      ? runde.teams
      : [{ name: 'Laget', playerIds: runde.playerIds.slice() }];
    var bane = runde.courseId ? GolfStore.course(runde.courseId) : null;

    GolfStore.holes(runde.id).then(function (hullRader) {
      UI.clear(wrap);
      var st = sc().stilling(hullRader, lag.length);
      var utslag = sc().utslagTelling(hullRader, lag.length);
      var merker = sc().merkeTelling(hullRader, lag.length);

      wrap.appendChild(el('section', { class: 'card stack center' }, [
        el('p', { class: 'label', text: statusTekst(runde.status) }),
        el('h2', { text: runde.courseName }),
        el('p', { class: 'muted', text:
          'Scramble · ' + runde.holes + ' hull · ' + UI.formatDate(runde.startedAt) })
      ]));

      var liste = el('div', { class: 'list' });
      st.forEach(function (r) {
        var l = lag[r.teamIndex];
        var diff = sc().motPar(hullRader, r.teamIndex, bane && bane.pars);
        liste.appendChild(el('div', {
          class: 'result-row' + (r.place === 1 && lag.length > 1 ? ' is-winner' : '')
        }, [
          lag.length > 1 ? el('span', { class: 'result-place num', text: r.place + '.' }) : null,
          el('span', { class: 'result-name' }, [
            el('span', { text: l.name }),
            el('span', { class: 'result-shared muted', text:
              l.playerIds.map(function (id) {
                var p = GolfStore.player(id);
                return p ? p.name : 'Ukjent';
              }).join(', ') })
          ]),
          el('span', { class: 'result-points num', text:
            r.strokes + (diff !== null ? ' (' + sc().motParTekst(diff) + ')' : '') })
        ]));
      });
      wrap.appendChild(el('section', { class: 'stack' }, [
        el('h2', { text: 'Resultat' }),
        el('p', { class: 'muted', text: bane && bane.pars
          ? 'Totalt antall slag, og mot par i parentes.'
          : 'Totalt antall slag. Legg inn par på banen for å se mot par.' }),
        liste
      ]));

      var hoydepunkt = el('div', { class: 'list' });
      [['birdie', 'Birdie'], ['eagle', 'Eagle'], ['hio', 'Hole in one']].forEach(function (par2) {
        if (!merker[par2[0]]) return;
        hoydepunkt.appendChild(el('div', { class: 'list-row' }, [
          el('span', { class: 'list-row-main', text: par2[1] }),
          el('span', { class: 'num', text: String(merker[par2[0]]) })
        ]));
      });
      Object.keys(merker.solo).forEach(function (pid) {
        var p = GolfStore.player(pid);
        var s = merker.solo[pid];
        var deler = [];
        if (s.birdie) deler.push(UI.plural(s.birdie, 'solo birdie', 'solo birdier'));
        if (s.eagle) deler.push(UI.plural(s.eagle, 'solo eagle', 'solo eagles'));
        if (s.hio) deler.push(UI.plural(s.hio, 'hole in one', 'hole in one'));
        if (!deler.length) return;
        hoydepunkt.appendChild(el('div', { class: 'list-row' }, [
          UI.avatar(p ? p.avatarId : 'rev', 32),
          el('span', { class: 'list-row-main', text: (p ? p.name : 'Ukjent') + ': ' + deler.join(', ') })
        ]));
      });
      if (hoydepunkt.children.length) {
        wrap.appendChild(el('section', { class: 'stack' }, [
          el('h2', { text: 'Høydepunkter' }), hoydepunkt
        ]));
      }

      var utslagListe = el('div', { class: 'list' });
      runde.playerIds.forEach(function (pid) {
        var p = GolfStore.player(pid);
        utslagListe.appendChild(el('div', { class: 'list-row' }, [
          UI.avatar(p ? p.avatarId : 'rev', 32),
          el('span', { class: 'list-row-main', text: p ? p.name : 'Ukjent' }),
          el('span', { class: 'num', text: String(utslag[pid] || 0) })
        ]));
      });
      wrap.appendChild(el('section', { class: 'stack' }, [
        el('h2', { text: 'Utslag brukt' }),
        el('p', { class: 'muted', text: 'Hvor mange hull laget brukte hver spillers utslag på.' }),
        utslagListe
      ]));

      wrap.appendChild(Screens.scorekort(runde, hullRader, bane));

      wrap.appendChild(Screens.delRapportKnapp(runde, hullRader, bane));

      wrap.appendChild(el('button', {
        class: 'btn btn-secondary btn-block', text: 'Ferdig',
        onclick: function () { nav.rot('hjem'); }
      }));

      wrap.appendChild(Screens.slettRundeKnapp(runde, nav));
    });

    return wrap;
  };

  function statusTekst(s) {
    return s === 'fullfort' ? 'Fullført runde'
         : s === 'avbrutt' ? 'Avbrutt runde' : 'Pågående runde';
  }
})(window);
