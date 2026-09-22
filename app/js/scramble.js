/* ==========================================================================
   Golfapp - beregninger i Scramble

   I scramble spiller laget én ball. Vi registrerer derfor per lag:
     - antall slag på hullet
     - hvem sitt utslag laget brukte
     - om hullet ga birdie, eagle eller hole in one
     - om det var en solo, altså at én spiller sto for det alene

   Funksjonene her er rene: tall inn, tall ut. Fase 5 bruker de samme.
   ========================================================================== */

(function (global) {
  'use strict';

  var MERKER = [
    { id: 'birdie', navn: 'Birdie', underPar: 1 },
    { id: 'eagle',  navn: 'Eagle',  underPar: 2 },
    { id: 'hio',    navn: 'Hole in one', underPar: null }
  ];

  function lagData(rad, lagIndex) {
    if (!rad || !rad.teams) return null;
    return rad.teams[lagIndex] || null;
  }

  function slagPaaHull(rad, lagIndex) {
    var d = lagData(rad, lagIndex);
    return d && typeof d.strokes === 'number' && d.strokes > 0 ? d.strokes : null;
  }

  // Et hull teller først når alle lagene har registrert slag.
  function hullFerdig(rad, antallLag) {
    for (var i = 0; i < antallLag; i++) {
      if (slagPaaHull(rad, i) === null) return false;
    }
    return true;
  }

  function ferdigeHull(hullRader, antallLag) {
    return hullRader.filter(function (rad) { return hullFerdig(rad, antallLag); }).length;
  }

  function total(hullRader, lagIndex) {
    return hullRader.reduce(function (sum, rad) {
      var s = slagPaaHull(rad, lagIndex);
      return sum + (s || 0);
    }, 0);
  }

  // Sum par for de hullene som faktisk er registrert, slik at «mot par»
  // stemmer også midt i runden.
  function parForSpilteHull(hullRader, lagIndex, pars) {
    if (!pars) return null;
    var sum = 0;
    var noen = false;
    hullRader.forEach(function (rad) {
      if (slagPaaHull(rad, lagIndex) === null) return;
      var p = pars[rad.hole - 1];
      if (typeof p === 'number') { sum += p; noen = true; }
    });
    return noen ? sum : null;
  }

  function motPar(hullRader, lagIndex, pars) {
    var p = parForSpilteHull(hullRader, lagIndex, pars);
    if (p === null) return null;
    return total(hullRader, lagIndex) - p;
  }

  // Laveste totalscore vinner. Lag som står likt deler plassering.
  function stilling(hullRader, antallLag) {
    var rader = [];
    for (var i = 0; i < antallLag; i++) {
      rader.push({ teamIndex: i, strokes: total(hullRader, i) });
    }
    rader.sort(function (a, b) { return a.strokes - b.strokes; });

    var plass = 0;
    var forrige = null;
    rader.forEach(function (rad, i) {
      if (forrige === null || rad.strokes !== forrige) plass = i + 1;
      rad.place = plass;
      forrige = rad.strokes;
    });
    rader.forEach(function (rad) {
      rad.shared = rader.filter(function (r) { return r.place === rad.place; }).length > 1;
    });
    return rader;
  }

  /* ---- statistikk som fase 5 henter --------------------------------- */

  // Hvor mange ganger hver spillers utslag ble brukt.
  function utslagTelling(hullRader, antallLag) {
    var ut = {};
    hullRader.forEach(function (rad) {
      for (var i = 0; i < antallLag; i++) {
        var d = lagData(rad, i);
        if (d && d.driveBy) ut[d.driveBy] = (ut[d.driveBy] || 0) + 1;
      }
    });
    return ut;
  }

  // Antall birdie, eagle og hole in one, og hvem som eventuelt tok dem solo.
  function merkeTelling(hullRader, antallLag) {
    var ut = { birdie: 0, eagle: 0, hio: 0, solo: {} };
    hullRader.forEach(function (rad) {
      for (var i = 0; i < antallLag; i++) {
        var d = lagData(rad, i);
        if (!d || !d.mark) continue;
        ut[d.mark] = (ut[d.mark] || 0) + 1;
        if (d.solo) {
          if (!ut.solo[d.solo]) ut.solo[d.solo] = { birdie: 0, eagle: 0, hio: 0 };
          ut.solo[d.solo][d.mark] += 1;
        }
      }
    });
    return ut;
  }

  // Foreslår merke ut fra par. Brukes bare som forslag, aldri som fasit.
  function foreslaaMerke(slag, par) {
    if (slag === 1) return 'hio';
    if (typeof par !== 'number') return null;
    if (slag === par - 1) return 'birdie';
    if (slag <= par - 2) return 'eagle';
    return null;
  }

  function merkeNavn(id) {
    for (var i = 0; i < MERKER.length; i++) {
      if (MERKER[i].id === id) return MERKER[i].navn;
    }
    return null;
  }

  function motParTekst(diff) {
    if (diff === null || diff === undefined) return null;
    if (diff === 0) return 'Par';
    return (diff > 0 ? '+' : '') + diff;
  }

  global.GolfScramble = {
    MERKER: MERKER,
    lagData: lagData,
    slagPaaHull: slagPaaHull,
    hullFerdig: hullFerdig,
    ferdigeHull: ferdigeHull,
    total: total,
    motPar: motPar,
    stilling: stilling,
    utslagTelling: utslagTelling,
    merkeTelling: merkeTelling,
    foreslaaMerke: foreslaaMerke,
    merkeNavn: merkeNavn,
    motParTekst: motParTekst
  };
})(window);
