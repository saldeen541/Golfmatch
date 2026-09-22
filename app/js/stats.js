/* ==========================================================================
   Golfapp - statistikk

   Alt regnes ut fra rundene ved visning. Ingen totaler lagres, så en rettet
   eller slettet runde slår rett gjennom overalt.

   Bare fullførte runder teller. Avbrutte runder blir liggende i historikken,
   men holdes utenfor alle tall her.

   hullKart er et oppslag fra runde-id til listen med hullrader for runden.
   ========================================================================== */

(function (global) {
  'use strict';

  function fullforte(runder) {
    return runder.filter(function (r) { return r.status === 'fullfort'; });
  }

  function aarFor(runde) {
    return new Date(runde.startedAt).getFullYear();
  }

  function aarene(runder) {
    var sett = {};
    fullforte(runder).forEach(function (r) { sett[aarFor(r)] = true; });
    return Object.keys(sett).map(Number).sort(function (a, b) { return b - a; });
  }

  function filtrer(runder, filter) {
    filter = filter || {};
    return fullforte(runder).filter(function (r) {
      if (filter.modus && r.mode !== filter.modus) return false;
      if (filter.aar && aarFor(r) !== filter.aar) return false;
      if (filter.baneId && r.courseId !== filter.baneId) return false;
      // Oppsett: bare runder der akkurat disse spillerne var med.
      if (filter.oppsett && nokkel(r.playerIds) !== filter.oppsett) return false;
      return true;
    });
  }

  function lagFor(runde) {
    return runde.teams && runde.teams.length
      ? runde.teams
      : [{ name: 'Laget', playerIds: runde.playerIds.slice() }];
  }

  /* ---- Oppsett: hvem som faktisk spilte sammen ------------------------
     Gjengen er ikke den samme hver gang. Et «oppsett» er det eksakte settet
     spillere som var med, uavhengig av rekkefølge. Kim og Ola er samme
     oppsett som Ola og Kim, men et annet oppsett enn Kim, Ola og Per.
     -------------------------------------------------------------------- */

  function nokkel(ids) {
    return ids.slice().sort().join('|');
  }

  function navnListe(ids, navnFor) {
    return ids.map(navnFor).sort(function (a, b) {
      return a.localeCompare(b, 'nb');
    }).join(' + ');
  }

  // Alle oppsett som har spilt match, med antall runder og hvem som leder.
  function matchOppsett(runder, hullKart, modell) {
    var acc = {};
    runder.forEach(function (r) {
      if (r.mode !== 'match') return;
      var k = nokkel(r.playerIds);
      if (!acc[k]) {
        acc[k] = { key: k, playerIds: r.playerIds.slice().sort(), runder: 0, poeng: {} };
      }
      acc[k].runder += 1;
      var stilling = GolfMatch.stilling(hullKart[r.id] || [], r.playerIds);
      var poeng = GolfMatch.allTimePoeng(stilling, modell);
      Object.keys(poeng).forEach(function (id) {
        acc[k].poeng[id] = (acc[k].poeng[id] || 0) + poeng[id];
      });
    });

    return Object.keys(acc).map(function (k) {
      var o = acc[k];
      var leder = null;
      Object.keys(o.poeng).forEach(function (id) {
        if (!leder || o.poeng[id] > leder.poeng) leder = { playerId: id, poeng: o.poeng[id] };
      });
      // Deler flere førsteplassen, er det ingen entydig leder.
      if (leder) {
        var delt = Object.keys(o.poeng).filter(function (id) {
          return o.poeng[id] === leder.poeng;
        });
        leder.delt = delt.length > 1;
        leder.delteMed = delt;
      }
      o.leder = leder;
      return o;
    }).sort(function (a, b) {
      if (b.runder !== a.runder) return b.runder - a.runder;
      return a.playerIds.length - b.playerIds.length;
    });
  }

  /* ---- Scramble: hvem som var på lag sammen ---------------------------- */

  function lagIRunde(runde, hullKart, baneKart) {
    var hull = hullKart[runde.id] || [];
    var lag = lagFor(runde);
    var bane = baneKart && runde.courseId ? baneKart[runde.courseId] : null;
    var ferdige = GolfScramble.ferdigeHull(hull, lag.length);
    return lag.map(function (l, i) {
      return {
        runde: runde, lagIndex: i, navn: l.name,
        playerIds: l.playerIds.slice(),
        key: nokkel(l.playerIds),
        hull: ferdige,
        total: GolfScramble.total(hull, i),
        motPar: GolfScramble.motPar(hull, i, bane && bane.pars)
      };
    }).filter(function (x) { return x.hull > 0; });
  }

  // Alle lagsammensetninger som har spilt scramble.
  function scrambleLag(runder, hullKart, baneKart) {
    var acc = {};
    runder.forEach(function (r) {
      if (r.mode !== 'scramble') return;
      lagIRunde(r, hullKart, baneKart).forEach(function (x) {
        if (!acc[x.key]) {
          acc[x.key] = {
            key: x.key, playerIds: x.playerIds.slice().sort(),
            runder: 0, totaler: [], motPar: []
          };
        }
        acc[x.key].runder += 1;
        acc[x.key].totaler.push(x.total);
        if (x.motPar !== null) acc[x.key].motPar.push(x.motPar);
      });
    });

    return Object.keys(acc).map(function (k) {
      var o = acc[k];
      o.beste = Math.min.apply(null, o.totaler);
      o.snitt = o.totaler.reduce(function (a, b) { return a + b; }, 0) / o.totaler.length;
      o.motParSnitt = o.motPar.length
        ? o.motPar.reduce(function (a, b) { return a + b; }, 0) / o.motPar.length
        : null;
      return o;
    }).sort(function (a, b) {
      if (b.runder !== a.runder) return b.runder - a.runder;
      return a.snitt - b.snitt;
    });
  }

  // Alt om ett bestemt lag: rundene deres, og hva hver spiller bidro med
  // i nettopp dette laget.
  function lagDetalj(key, runder, hullKart, baneKart) {
    var rader = [];
    var perSpiller = {};

    function spiller(id) {
      if (!perSpiller[id]) {
        perSpiller[id] = { playerId: id, hull: 0, utslag: 0, soloBirdie: 0, soloEagle: 0, hio: 0 };
      }
      return perSpiller[id];
    }

    runder.forEach(function (r) {
      if (r.mode !== 'scramble') return;
      lagIRunde(r, hullKart, baneKart).forEach(function (x) {
        if (x.key !== key) return;
        rader.push(x);

        var hull = hullKart[r.id] || [];
        hull.forEach(function (h) {
          var d = GolfScramble.lagData(h, x.lagIndex);
          if (!d) return;
          if (d.driveBy) spiller(d.driveBy).utslag += 1;
          if (d.mark && d.solo) {
            var s = spiller(d.solo);
            if (d.mark === 'birdie') s.soloBirdie += 1;
            else if (d.mark === 'eagle') s.soloEagle += 1;
            else if (d.mark === 'hio') s.hio += 1;
          }
        });
        x.playerIds.forEach(function (id) { spiller(id).hull += x.hull; });
      });
    });

    var totaler = rader.map(function (x) { return x.total; });
    var motPar = rader.map(function (x) { return x.motPar; })
      .filter(function (v) { return v !== null; });

    return {
      key: key,
      playerIds: rader.length ? rader[0].playerIds.slice().sort() : [],
      rader: rader.sort(function (a, b) { return b.runde.startedAt - a.runde.startedAt; }),
      runder: rader.length,
      beste: totaler.length ? Math.min.apply(null, totaler) : null,
      snitt: totaler.length ? totaler.reduce(function (a, b) { return a + b; }, 0) / totaler.length : null,
      motParSnitt: motPar.length ? motPar.reduce(function (a, b) { return a + b; }, 0) / motPar.length : null,
      spillere: Object.keys(perSpiller).map(function (id) {
        var s = perSpiller[id];
        s.utslagAndel = s.hull ? s.utslag / s.hull : 0;
        return s;
      }).sort(function (a, b) { return b.utslag - a.utslag; })
    };
  }

  /* ---- Match: all time-tabellen -------------------------------------- */

  function matchTabell(runder, hullKart, modell) {
    var acc = {};

    function rad(id) {
      if (!acc[id]) {
        acc[id] = { playerId: id, runder: 0, plasseringer: [0, 0, 0, 0], poeng: 0 };
      }
      return acc[id];
    }

    runder.forEach(function (r) {
      if (r.mode !== 'match') return;
      var hull = hullKart[r.id] || [];
      var stilling = GolfMatch.stilling(hull, r.playerIds);
      var poeng = GolfMatch.allTimePoeng(stilling, modell);
      stilling.forEach(function (s) {
        var rd = rad(s.playerId);
        rd.runder += 1;
        if (s.place >= 1 && s.place <= 4) rd.plasseringer[s.place - 1] += 1;
        rd.poeng += poeng[s.playerId] || 0;
      });
    });

    return Object.keys(acc).map(function (id) {
      var rd = acc[id];
      rd.poengPerRunde = rd.runder ? rd.poeng / rd.runder : 0;
      return rd;
    }).sort(function (a, b) {
      if (b.poeng !== a.poeng) return b.poeng - a.poeng;
      if (b.plasseringer[0] !== a.plasseringer[0]) return b.plasseringer[0] - a.plasseringer[0];
      return b.runder - a.runder;
    });
  }

  /* ---- Scramble: per spiller ----------------------------------------- */

  function scrambleSpillere(runder, hullKart) {
    var acc = {};

    function rad(id) {
      if (!acc[id]) {
        acc[id] = {
          playerId: id, runder: 0, hull: 0, utslag: 0,
          soloBirdie: 0, soloEagle: 0, hio: 0
        };
      }
      return acc[id];
    }

    runder.forEach(function (r) {
      if (r.mode !== 'scramble') return;
      var hull = hullKart[r.id] || [];
      var lag = lagFor(r);
      var utslag = GolfScramble.utslagTelling(hull, lag.length);
      var merker = GolfScramble.merkeTelling(hull, lag.length);
      var ferdige = GolfScramble.ferdigeHull(hull, lag.length);

      r.playerIds.forEach(function (pid) {
        var rd = rad(pid);
        rd.runder += 1;
        rd.hull += ferdige;
        rd.utslag += utslag[pid] || 0;
        var s = merker.solo[pid];
        if (s) {
          rd.soloBirdie += s.birdie || 0;
          rd.soloEagle += s.eagle || 0;
          rd.hio += s.hio || 0;
        }
      });
    });

    return Object.keys(acc).map(function (id) {
      var rd = acc[id];
      rd.utslagAndel = rd.hull ? rd.utslag / rd.hull : 0;
      return rd;
    }).sort(function (a, b) {
      if (b.utslag !== a.utslag) return b.utslag - a.utslag;
      return b.runder - a.runder;
    });
  }

  /* ---- Scramble: rundekort ------------------------------------------- */

  function scrambleRunder(runder, hullKart, sortering) {
    var kort = runder.filter(function (r) { return r.mode === 'scramble'; })
      .map(function (r) {
        var hull = hullKart[r.id] || [];
        var lag = lagFor(r);
        var totaler = lag.map(function (l, i) {
          return { navn: l.name, total: GolfScramble.total(hull, i) };
        });
        var beste = totaler.reduce(function (m, t) {
          return m === null || t.total < m ? t.total : m;
        }, null);
        return { runde: r, lag: lag, totaler: totaler, beste: beste || 0 };
      });

    if (sortering === 'score') {
      kort.sort(function (a, b) {
        if (a.beste !== b.beste) return a.beste - b.beste;
        return b.runde.startedAt - a.runde.startedAt;
      });
    } else {
      kort.sort(function (a, b) { return b.runde.startedAt - a.runde.startedAt; });
    }
    return kort;
  }

  /* ---- Baner ---------------------------------------------------------- */

  function baneOversikt(runder, baner) {
    var acc = {};
    runder.forEach(function (r) {
      if (!r.courseId) return;
      if (!acc[r.courseId]) {
        acc[r.courseId] = { courseId: r.courseId, navn: r.courseName, match: 0, scramble: 0 };
      }
      acc[r.courseId][r.mode] += 1;
    });
    // Ta med navnet fra banebiblioteket hvis banen er gitt nytt navn senere.
    (baner || []).forEach(function (b) {
      if (acc[b.id]) acc[b.id].navn = b.name;
    });
    return Object.keys(acc).map(function (id) { return acc[id]; })
      .sort(function (a, b) {
        return (b.match + b.scramble) - (a.match + a.scramble);
      });
  }

  // Alt om én bane. Snitt per hull er det mest interessante i scramble:
  // det viser hvilke hull som faktisk koster dere slag.
  function baneDetalj(bane, runder, hullKart) {
    var scramble = runder.filter(function (r) {
      return r.mode === 'scramble' && r.courseId === bane.id;
    });
    var match = runder.filter(function (r) {
      return r.mode === 'match' && r.courseId === bane.id;
    });

    /* --- scramble --- */
    var lagRunder = [];      // én rad per lag per runde
    scramble.forEach(function (r) {
      var hull = hullKart[r.id] || [];
      var lag = lagFor(r);
      lag.forEach(function (l, i) {
        var ferdige = GolfScramble.ferdigeHull(hull, lag.length);
        if (!ferdige) return;
        lagRunder.push({
          runde: r, lagNavn: l.name, hull: ferdige,
          total: GolfScramble.total(hull, i),
          motPar: GolfScramble.motPar(hull, i, bane.pars)
        });
      });
    });

    var beste = null;
    lagRunder.forEach(function (lr) {
      if (beste === null || lr.total < beste.total) beste = lr;
    });
    var snitt = lagRunder.length
      ? lagRunder.reduce(function (s, lr) { return s + lr.total; }, 0) / lagRunder.length
      : null;

    // Snitt per hull, over alle lag i alle scramble-runder på banen.
    var perHull = [];
    var antallHull = bane.holes || 18;
    for (var h = 1; h <= antallHull; h++) {
      var verdier = [];
      scramble.forEach(function (r) {
        var hull = hullKart[r.id] || [];
        var lag = lagFor(r);
        var rad = null;
        for (var i = 0; i < hull.length; i++) if (hull[i].hole === h) rad = hull[i];
        if (!rad) return;
        for (var t = 0; t < lag.length; t++) {
          var s = GolfScramble.slagPaaHull(rad, t);
          if (s !== null) verdier.push(s);
        }
      });
      var par = bane.pars && bane.pars[h - 1] ? bane.pars[h - 1] : null;
      var sn = verdier.length
        ? verdier.reduce(function (a, b) { return a + b; }, 0) / verdier.length
        : null;
      perHull.push({
        hole: h, par: par, snitt: sn, antall: verdier.length,
        motPar: sn !== null && par !== null ? sn - par : null
      });
    }

    /* --- match --- */
    var vinnere = {};
    match.forEach(function (r) {
      var hull = hullKart[r.id] || [];
      var stilling = GolfMatch.stilling(hull, r.playerIds);
      stilling.filter(function (s) { return s.place === 1; }).forEach(function (s) {
        vinnere[s.playerId] = (vinnere[s.playerId] || 0) + 1;
      });
    });
    var vinnerliste = Object.keys(vinnere).map(function (id) {
      return { playerId: id, seire: vinnere[id] };
    }).sort(function (a, b) { return b.seire - a.seire; });

    return {
      bane: bane,
      scrambleRunder: scramble.length,
      lagRunder: lagRunder.length,
      beste: beste,
      snitt: snitt,
      perHull: perHull,
      matchRunder: match.length,
      matchVinnere: vinnerliste
    };
  }

  global.GolfStats = {
    fullforte: fullforte,
    aarFor: aarFor,
    aarene: aarene,
    filtrer: filtrer,
    lagFor: lagFor,
    nokkel: nokkel,
    navnListe: navnListe,
    matchOppsett: matchOppsett,
    scrambleLag: scrambleLag,
    lagIRunde: lagIRunde,
    lagDetalj: lagDetalj,
    matchTabell: matchTabell,
    scrambleSpillere: scrambleSpillere,
    scrambleRunder: scrambleRunder,
    baneOversikt: baneOversikt,
    baneDetalj: baneDetalj
  };
})(window);
