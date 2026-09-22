/* ==========================================================================
   Golfapp - avatarer (fase 1)

   Tolv originale dyreavatarer tegnet som SVG. Ingen bildefiler og ingen
   nedlasting, slik at de fungerer uten nett og kan farges av CSS.

   Tre av dyrene er hentet fra golfens eget språk: ørn (eagle), albatross
   og kondor. De ni andre er dyr man faktisk møter på eller ved banen.
   Utvalget er bevisst større enn det som trengs, slik at Kim kan plukke
   ut favorittene i fase 1 og la resten ligge.

   Brukes slik:
     GolfAvatars.list                 -> [{ id, name, article, svg }, ...]
     GolfAvatars.get('rev')           -> ett objekt
     GolfAvatars.render('rev', 56)    -> HTML-streng med riktig størrelse

   Hver avatar er tegnet i et 96x96-rutenett og skalerer fritt. Motivene er
   laget så silhuettene skiller seg fra hverandre også på 32 px, slik at
   fargen aldri er eneste kjennetegn.
   ========================================================================== */

(function (global) {
  'use strict';

  function svg(label, body) {
    return (
      '<svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" ' +
      'role="img" aria-label="' + label + '" focusable="false">' + body + '</svg>'
    );
  }

  var AVATARS = [
    {
      id: 'orn',
      name: 'Ørna',
      article: 'Ørn',
      note: 'To under par',
      svg: svg('Ørn',
        '<rect width="96" height="96" fill="#e7eef6"/>' +
        '<path d="M22 96 C22 76 33 66 48 66 C63 66 74 76 74 96 Z" fill="#5f4531"/>' +
        '<path d="M48 9 C68 9 82 27 82 47 C82 64 71 77 55 81 L41 81 C25 77 14 64 14 47 C14 27 28 9 48 9 Z" fill="#fbfcfd"/>' +
        '<path d="M14 45 C17 29 30 20 48 20 C66 20 79 29 82 45 C75 33 63 27 48 27 C33 27 21 33 14 45 Z" fill="#cbd6e1"/>' +
        '<circle cx="33" cy="50" r="7.4" fill="#f2b32a"/>' +
        '<circle cx="63" cy="50" r="7.4" fill="#f2b32a"/>' +
        '<circle cx="33" cy="52" r="3.3" fill="#17120a"/>' +
        '<circle cx="63" cy="52" r="3.3" fill="#17120a"/>' +
        '<path d="M23 40 L42 39 L42 48 L24 46 Z" fill="#453c33"/>' +
        '<path d="M73 40 L54 39 L54 48 L72 46 Z" fill="#453c33"/>' +
        '<path d="M40 57 h16 l-1.7 13 c-0.9 7 -3 11 -6.3 11 c-3.3 0 -5.4 -4 -6.3 -11 Z" fill="#f2b32a"/>' +
        '<path d="M42.6 72 c0.6 6 2.2 9 5.4 9 c3.2 0 4.8 -3 5.4 -9 c-3.4 1.8 -7.4 1.8 -10.8 0 Z" fill="#cf9312"/>'
      )
    },
    {
      id: 'albatross',
      name: 'Albatrossen',
      article: 'Albatross',
      note: 'Tre under par',
      svg: svg('Albatross',
        '<rect width="96" height="96" fill="#e4eff2"/>' +
        '<path d="M48 44 C74 44 92 62 92 96 L4 96 C4 62 22 44 48 44 Z" fill="#b9cad2"/>' +
        '<ellipse cx="48" cy="41" rx="36" ry="31" fill="#fdfdfd"/>' +
        '<path d="M12 39 C15 21 29 11 48 11 C67 11 81 21 84 39 C77 26 64 20 48 20 C32 20 19 26 12 39 Z" fill="#a7bcc5"/>' +
        '<ellipse cx="28" cy="40" rx="8.5" ry="6.5" fill="#cfdde2"/>' +
        '<ellipse cx="68" cy="40" rx="8.5" ry="6.5" fill="#cfdde2"/>' +
        '<circle cx="28" cy="40" r="4.2" fill="#22313a"/>' +
        '<circle cx="68" cy="40" r="4.2" fill="#22313a"/>' +
        '<circle cx="29.4" cy="38.5" r="1.4" fill="#ffffff"/>' +
        '<circle cx="69.4" cy="38.5" r="1.4" fill="#ffffff"/>' +
        '<path d="M37 48 h22 l-3 19 c-0.8 6 -4 10 -8 10 c-4 0 -7.2 -4 -8 -10 Z" fill="#e0c68c"/>' +
        '<path d="M40.4 68 c0.8 6 3.8 9.4 7.6 9.4 c3.8 0 6.8 -3.4 7.6 -9.4 c-4.8 2.1 -10.4 2.1 -15.2 0 Z" fill="#a8873f"/>' +
        '<path d="M48 49 v25" stroke="#c0a057" stroke-width="2"/>' +
        '<rect x="38.6" y="51" width="4.4" height="9" rx="2.2" fill="#c0a057"/>' +
        '<rect x="53" y="51" width="4.4" height="9" rx="2.2" fill="#c0a057"/>' +
        '<path d="M37 48 h22" stroke="#9aa8ad" stroke-width="2"/>'
      )
    },
    {
      id: 'ugle',
      name: 'Ugla',
      article: 'Ugle',
      note: 'Ser linjen alle andre bommer på',
      svg: svg('Ugle',
        '<rect width="96" height="96" fill="#f0e8dc"/>' +
        '<path d="M19 33 L26 5 L43 25 Z" fill="#7d5f42"/>' +
        '<path d="M77 33 L70 5 L53 25 Z" fill="#7d5f42"/>' +
        '<ellipse cx="48" cy="56" rx="35" ry="36" fill="#8d6a4a"/>' +
        '<path d="M48 26 C61 26 71 36 71 50 C71 66 61 79 48 84 C35 79 25 66 25 50 C25 36 35 26 48 26 Z" fill="#e3d2b8"/>' +
        '<circle cx="36" cy="49" r="11" fill="#f8f4ec"/>' +
        '<circle cx="60" cy="49" r="11" fill="#f8f4ec"/>' +
        '<circle cx="36" cy="49" r="7.4" fill="#e8a020"/>' +
        '<circle cx="60" cy="49" r="7.4" fill="#e8a020"/>' +
        '<circle cx="36" cy="49" r="4" fill="#1a1207"/>' +
        '<circle cx="60" cy="49" r="4" fill="#1a1207"/>' +
        '<circle cx="37.6" cy="47.2" r="1.5" fill="#ffffff"/>' +
        '<circle cx="61.6" cy="47.2" r="1.5" fill="#ffffff"/>' +
        '<path d="M48 55 l5.4 7 -5.4 8 -5.4 -8 Z" fill="#d38b1e"/>' +
        '<path d="M31 72 c5 5 11 7 17 7 c6 0 12 -2 17 -7" stroke="#c4ab86" stroke-width="2.4" fill="none" stroke-linecap="round"/>'
      )
    },
    {
      id: 'kondor',
      name: 'Kondoren',
      article: 'Kondor',
      note: 'Fire under par',
      svg: svg('Kondor',
        '<rect width="96" height="96" fill="#eceae5"/>' +
        '<path d="M48 50 C76 50 94 68 94 96 L2 96 C2 68 20 50 48 50 Z" fill="#2c2b29"/>' +
        '<ellipse cx="48" cy="58" rx="31" ry="12" fill="#f6f4ef"/>' +
        '<circle cx="20" cy="60" r="7.5" fill="#f6f4ef"/>' +
        '<circle cx="31" cy="63" r="7.5" fill="#f6f4ef"/>' +
        '<circle cx="42" cy="65" r="7.5" fill="#f6f4ef"/>' +
        '<circle cx="54" cy="65" r="7.5" fill="#f6f4ef"/>' +
        '<circle cx="65" cy="63" r="7.5" fill="#f6f4ef"/>' +
        '<circle cx="76" cy="60" r="7.5" fill="#f6f4ef"/>' +
        '<path d="M32 18 C34 8 42 5 48 5 C54 5 62 8 64 18 Z" fill="#bf6a34"/>' +
        '<path d="M48 12 C60 12 69 22 69 35 C69 49 60 58 48 58 C36 58 27 49 27 35 C27 22 36 12 48 12 Z" fill="#dda06a"/>' +
        '<path d="M30 27 C36 22 42 21 48 21 C54 21 60 22 66 27" stroke="#c0803f" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
        '<ellipse cx="39" cy="33" rx="5.4" ry="4.8" fill="#b06b39"/>' +
        '<ellipse cx="57" cy="33" rx="5.4" ry="4.8" fill="#b06b39"/>' +
        '<circle cx="39" cy="33" r="3.4" fill="#fbf8f2"/>' +
        '<circle cx="57" cy="33" r="3.4" fill="#fbf8f2"/>' +
        '<circle cx="39" cy="33" r="2" fill="#17130e"/>' +
        '<circle cx="57" cy="33" r="2" fill="#17130e"/>' +
        '<path d="M41.5 40 h13 l-1.8 14 c-0.8 8 -3.2 12 -4.7 12 c-1.5 0 -3.9 -4 -4.7 -12 Z" fill="#b5a994"/>' +
        '<path d="M41.5 40 h13 l-0.7 5 h-11.6 Z" fill="#5d5346"/>' +
        '<circle cx="44.6" cy="47" r="1.1" fill="#5d5346"/>' +
        '<circle cx="51.4" cy="47" r="1.1" fill="#5d5346"/>' +
        '<path d="M43.2 56 c-0.3 6.5 2 10 4.8 10 c2.8 0 5.1 -3.5 4.8 -10 c-3 1.8 -6.6 1.8 -9.6 0 Z" fill="#e8e2d5"/>'
      )
    },
    {
      id: 'rev',
      name: 'Reven',
      article: 'Rev',
      note: 'Lur i ruffen',
      svg: svg('Rev',
        '<circle cx="48" cy="48" r="48" fill="#fbeada"/>' +
        '<path d="M20 47 L24 13 L47 32 Z" fill="#d2622a"/>' +
        '<path d="M76 47 L72 13 L49 32 Z" fill="#d2622a"/>' +
        '<path d="M26 41 L28.5 22 L41 34 Z" fill="#8e3b2a"/>' +
        '<path d="M70 41 L67.5 22 L55 34 Z" fill="#8e3b2a"/>' +
        '<ellipse cx="48" cy="52" rx="29" ry="26" fill="#e8792f"/>' +
        '<path d="M48 43 C37 52 32 63 35.5 71 C39 79 57 79 60.5 71 C64 63 59 52 48 43 Z" fill="#fdf4ea"/>' +
        '<circle cx="36" cy="50" r="4.6" fill="#2a1a12"/>' +
        '<circle cx="60" cy="50" r="4.6" fill="#2a1a12"/>' +
        '<circle cx="37.5" cy="48.5" r="1.5" fill="#ffffff"/>' +
        '<circle cx="61.5" cy="48.5" r="1.5" fill="#ffffff"/>' +
        '<ellipse cx="48" cy="66" rx="6" ry="4.6" fill="#2a1a12"/>' +
        '<path d="M48 70 v4" stroke="#2a1a12" stroke-width="2.2" stroke-linecap="round"/>'
      )
    },
    {
      id: 'grevling',
      name: 'Grevlingen',
      article: 'Grevling',
      note: 'Graver seg ut av bunkeren',
      svg: svg('Grevling',
        '<circle cx="48" cy="48" r="48" fill="#eceef0"/>' +
        '<circle cx="24" cy="29" r="9" fill="#5b6067"/>' +
        '<circle cx="72" cy="29" r="9" fill="#5b6067"/>' +
        '<circle cx="24" cy="29" r="4.4" fill="#b9bec4"/>' +
        '<circle cx="72" cy="29" r="4.4" fill="#b9bec4"/>' +
        '<path d="M48 23 C66 23 78 38 78 55 C78 73 64 85 48 85 C32 85 18 73 18 55 C18 38 30 23 48 23 Z" fill="#f7f7f4"/>' +
        '<path d="M34 25 C28 39 27 57 32 72 L42 68 C38 55 39 38 43.5 24 Z" fill="#2e3238"/>' +
        '<path d="M62 25 C68 39 69 57 64 72 L54 68 C58 55 57 38 52.5 24 Z" fill="#2e3238"/>' +
        '<circle cx="37" cy="50" r="5" fill="#f7f7f4"/>' +
        '<circle cx="59" cy="50" r="5" fill="#f7f7f4"/>' +
        '<circle cx="37" cy="50" r="2.7" fill="#12151a"/>' +
        '<circle cx="59" cy="50" r="2.7" fill="#12151a"/>' +
        '<ellipse cx="48" cy="70" rx="6.4" ry="4.8" fill="#2e3238"/>' +
        '<path d="M48 75 v4" stroke="#2e3238" stroke-width="2.2" stroke-linecap="round"/>'
      )
    },
    {
      id: 'elg',
      name: 'Elgen',
      article: 'Elg',
      note: 'Eier fairwayen',
      svg: svg('Elg',
        '<circle cx="48" cy="48" r="48" fill="#efe6dc"/>' +
        '<path d="M34 30 C22 28 12 21 10 11 C18 9 24 13 29 13 C26 6 31 2 38 5 C36 12 40 17 42 26 Z" fill="#ad8556"/>' +
        '<path d="M62 30 C74 28 84 21 86 11 C78 9 72 13 67 13 C70 6 65 2 58 5 C60 12 56 17 54 26 Z" fill="#ad8556"/>' +
        '<ellipse cx="23" cy="43" rx="9.5" ry="6" transform="rotate(-20 23 43)" fill="#5a4130"/>' +
        '<ellipse cx="73" cy="43" rx="9.5" ry="6" transform="rotate(20 73 43)" fill="#5a4130"/>' +
        '<path d="M48 24 C60 24 67 33 67 45 L65 60 C63 76 57 85 48 85 C39 85 33 76 31 60 L29 45 C29 33 36 24 48 24 Z" fill="#6e5038"/>' +
        '<ellipse cx="48" cy="70" rx="13" ry="11.5" fill="#8e6b4a"/>' +
        '<ellipse cx="43" cy="68" rx="2.5" ry="3.4" fill="#33231a"/>' +
        '<ellipse cx="53" cy="68" rx="2.5" ry="3.4" fill="#33231a"/>' +
        '<circle cx="39" cy="46" r="4.2" fill="#241811"/>' +
        '<circle cx="57" cy="46" r="4.2" fill="#241811"/>' +
        '<circle cx="40.3" cy="44.7" r="1.4" fill="#ffffff"/>' +
        '<circle cx="58.3" cy="44.7" r="1.4" fill="#ffffff"/>'
      )
    },
    {
      id: 'hare',
      name: 'Haren',
      article: 'Hare',
      note: 'Raskest rundt',
      svg: svg('Hare',
        '<circle cx="48" cy="48" r="48" fill="#f6efe2"/>' +
        '<ellipse cx="34" cy="27" rx="8" ry="22" transform="rotate(-10 34 27)" fill="#c6a67c"/>' +
        '<ellipse cx="62" cy="27" rx="8" ry="22" transform="rotate(10 62 27)" fill="#c6a67c"/>' +
        '<ellipse cx="34" cy="28" rx="3.8" ry="15" transform="rotate(-10 34 28)" fill="#e9c9ae"/>' +
        '<ellipse cx="62" cy="28" rx="3.8" ry="15" transform="rotate(10 62 28)" fill="#e9c9ae"/>' +
        '<ellipse cx="48" cy="60" rx="25.5" ry="23.5" fill="#c6a67c"/>' +
        '<ellipse cx="48" cy="68" rx="13.5" ry="12" fill="#f3e4d2"/>' +
        '<circle cx="37" cy="56" r="4.4" fill="#2e2318"/>' +
        '<circle cx="59" cy="56" r="4.4" fill="#2e2318"/>' +
        '<circle cx="38.4" cy="54.6" r="1.5" fill="#ffffff"/>' +
        '<circle cx="60.4" cy="54.6" r="1.5" fill="#ffffff"/>' +
        '<path d="M48 62.5 l4.6 3.6 -4.6 3.6 -4.6 -3.6 Z" fill="#8a5f52"/>' +
        '<rect x="44.4" y="72" width="3.2" height="8" rx="1.3" fill="#ffffff"/>' +
        '<rect x="48.4" y="72" width="3.2" height="8" rx="1.3" fill="#ffffff"/>' +
        '<path d="M48 69.7 v2.6" stroke="#8a5f52" stroke-width="2" stroke-linecap="round"/>'
      )
    },
    {
      id: 'pinnsvin',
      name: 'Pinnsvinet',
      article: 'Pinnsvin',
      note: 'Trives i ruffen',
      svg: svg('Pinnsvin',
        '<circle cx="48" cy="48" r="48" fill="#f0e9e1"/>' +
        '<path d="M11 64 L16 37 L23 52 L29 27 L36 46 L42 23 L48 42 L54 23 L60 46 L67 27 L73 52 L80 37 L85 64 Z" fill="#5f4b3c"/>' +
        '<path d="M11 64 C11 78 27 88 48 88 C69 88 85 78 85 64 Z" fill="#7c6350"/>' +
        '<ellipse cx="48" cy="66" rx="19" ry="17" fill="#dcc6ac"/>' +
        '<path d="M48 63 C42.5 70 40.5 78 44 83 C46 86 50 86 52 83 C55.5 78 53.5 70 48 63 Z" fill="#ebdac4"/>' +
        '<ellipse cx="48" cy="81" rx="3.9" ry="3" fill="#33251b"/>' +
        '<circle cx="36" cy="62" r="4" fill="#33251b"/>' +
        '<circle cx="60" cy="62" r="4" fill="#33251b"/>' +
        '<circle cx="37.2" cy="60.8" r="1.3" fill="#ffffff"/>' +
        '<circle cx="61.2" cy="60.8" r="1.3" fill="#ffffff"/>'
      )
    },
    {
      id: 'slange',
      name: 'Slangen',
      article: 'Slange',
      note: 'Den lange putten som går inn',
      svg: svg('Slange',
        '<rect width="96" height="96" fill="#e6f0e4"/>' +
        '<circle cx="48" cy="66" r="36" fill="#3f7a39"/>' +
        '<path d="M14 70 C24 60 36 55 48 55 C60 55 72 60 82 70" stroke="#6ba861" stroke-width="8" fill="none" stroke-linecap="round"/>' +
        '<path d="M22 32 C22 20 33 12 48 12 C63 12 74 20 74 32 C74 48 60 72 48 72 C36 72 22 48 22 32 Z" fill="#5c9c50"/>' +
        '<path d="M29 28 C35 23 41 22 48 22 C55 22 61 23 67 28" stroke="#7cbd6e" stroke-width="3.2" fill="none" stroke-linecap="round"/>' +
        '<path d="M33 40 C38 36 43 35 48 35 C53 35 58 36 63 40" stroke="#7cbd6e" stroke-width="2.6" fill="none" stroke-linecap="round" opacity="0.75"/>' +
        '<ellipse cx="34" cy="34" rx="7.4" ry="6.4" fill="#f2d24a"/>' +
        '<ellipse cx="62" cy="34" rx="7.4" ry="6.4" fill="#f2d24a"/>' +
        '<ellipse cx="34" cy="34" rx="2" ry="5.4" fill="#17200f"/>' +
        '<ellipse cx="62" cy="34" rx="2" ry="5.4" fill="#17200f"/>' +
        '<circle cx="31.6" cy="31.4" r="1.3" fill="#ffffff"/>' +
        '<circle cx="59.6" cy="31.4" r="1.3" fill="#ffffff"/>' +
        '<circle cx="43.5" cy="54" r="1.8" fill="#2d4a25"/>' +
        '<circle cx="52.5" cy="54" r="1.8" fill="#2d4a25"/>' +
        '<path d="M37 61 C41 65 55 65 59 61" stroke="#2d4a25" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
        '<path d="M48 65 v11" stroke="#d8443f" stroke-width="3.2" stroke-linecap="round"/>' +
        '<path d="M48 76 l-6 7" stroke="#d8443f" stroke-width="3.2" stroke-linecap="round"/>' +
        '<path d="M48 76 l6 7" stroke="#d8443f" stroke-width="3.2" stroke-linecap="round"/>'
      )
    },
    {
      id: 'rotte',
      name: 'Rotta',
      article: 'Rotte',
      note: 'Finner ballen din i krattet',
      svg: svg('Rotte',
        '<rect width="96" height="96" fill="#eeedeb"/>' +
        '<circle cx="21" cy="30" r="14" fill="#8e8b88"/>' +
        '<circle cx="75" cy="30" r="14" fill="#8e8b88"/>' +
        '<circle cx="21" cy="30" r="8" fill="#d7a8a8"/>' +
        '<circle cx="75" cy="30" r="8" fill="#d7a8a8"/>' +
        '<path d="M48 20 C63 20 74 31 74 46 C74 63 62 82 48 82 C34 82 22 63 22 46 C22 31 33 20 48 20 Z" fill="#9a9794"/>' +
        '<path d="M48 47 C40 54 35 65 39.5 73 C43 79 53 79 56.5 73 C61 65 56 54 48 47 Z" fill="#c9c6c2"/>' +
        '<circle cx="35" cy="43" r="4.8" fill="#1c1a19"/>' +
        '<circle cx="61" cy="43" r="4.8" fill="#1c1a19"/>' +
        '<circle cx="36.5" cy="41.5" r="1.6" fill="#ffffff"/>' +
        '<circle cx="62.5" cy="41.5" r="1.6" fill="#ffffff"/>' +
        '<path d="M34 64 L16 59 M34 69 L16 71" stroke="#7d7a77" stroke-width="1.8" stroke-linecap="round"/>' +
        '<path d="M62 64 L80 59 M62 69 L80 71" stroke="#7d7a77" stroke-width="1.8" stroke-linecap="round"/>' +
        '<ellipse cx="48" cy="70" rx="4.4" ry="3.4" fill="#d98e93"/>' +
        '<rect x="44.4" y="73.5" width="3.3" height="8" rx="1.3" fill="#ffffff"/>' +
        '<rect x="48.3" y="73.5" width="3.3" height="8" rx="1.3" fill="#ffffff"/>'
      )
    },
    {
      id: 'bever',
      name: 'Beveren',
      article: 'Bever',
      note: 'Bygger demning i vannhinderet',
      svg: svg('Bever',
        '<circle cx="48" cy="48" r="48" fill="#efe4d8"/>' +
        '<circle cx="23" cy="33" r="8.5" fill="#5e432e"/>' +
        '<circle cx="73" cy="33" r="8.5" fill="#5e432e"/>' +
        '<circle cx="23" cy="33" r="4" fill="#9a7455"/>' +
        '<circle cx="73" cy="33" r="4" fill="#9a7455"/>' +
        '<ellipse cx="48" cy="52" rx="29" ry="27" fill="#7a5638"/>' +
        '<ellipse cx="48" cy="64" rx="17.5" ry="13.5" fill="#a5825f"/>' +
        '<ellipse cx="48" cy="57" rx="5.2" ry="3.9" fill="#2e1f14"/>' +
        '<rect x="43.4" y="65" width="4.4" height="12" rx="1.5" fill="#f0c64b"/>' +
        '<rect x="48.2" y="65" width="4.4" height="12" rx="1.5" fill="#f0c64b"/>' +
        '<circle cx="36" cy="45" r="4.3" fill="#241710"/>' +
        '<circle cx="60" cy="45" r="4.3" fill="#241710"/>' +
        '<circle cx="37.4" cy="43.6" r="1.4" fill="#ffffff"/>' +
        '<circle cx="61.4" cy="43.6" r="1.4" fill="#ffffff"/>'
      )
    }
  ];

  var SIZES = { xs: 32, sm: 40, md: 56, lg: 88, xl: 112 };

  var byId = {};
  for (var i = 0; i < AVATARS.length; i++) byId[AVATARS[i].id] = AVATARS[i];

  function get(id) { return byId[id] || null; }

  function render(id, size) {
    var a = get(id);
    if (!a) return '';
    var px = typeof size === 'number' ? size : (SIZES[size] || SIZES.md);
    return '<span class="avatar" style="width:' + px + 'px;height:' + px + 'px">' +
           a.svg + '</span>';
  }

  global.GolfAvatars = {
    list: AVATARS,
    sizes: SIZES,
    get: get,
    render: render
  };
})(typeof window !== 'undefined' ? window : this);
