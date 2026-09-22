# Status – Golfapp

Denne filen er overleveringen mellom arbeidsøkter. Les den først i en ny økt,
før du leser kode.

**Sist oppdatert:** 22. september 2026
**Nå:** appen er publisert på GitHub Pages og virker i flymodus. Andre økt
22.09 rettet skalering på mobil, innførte automatiske merker i scramble og
rettet feil funnet i en gjennomgang av hele koden. Versjon `golfapp-v7-1`.
Kim må laste opp de endrede filene på nytt (se «Levert i økt 2» nederst).

---

## Hva appen er

En scoreapp for Kim og vennene hans, for match play og scramble. Bygges som en
installerbar nettapp (PWA) som fungerer 100 % offline, uten server og uten
brukerkontoer. Full spesifikasjon ligger i plandokumentet
«Golfapp – plan og spesifikasjon» i Claude-prosjektet «Match».

---

## Beslutninger som er tatt

Disse er avklart med Kim og skal ikke tas opp igjen uten at han ber om det.

| Beslutning | Valg |
| --- | --- |
| Plattform | Installerbar nettapp (PWA), ikke native app |
| Slag i Match | Brutto. Spillerne taster antall slag de faktisk slo. Ingen handicap-håndtering |
| Par per hull | Valgfritt per bane. Med par foreslår appen birdie og eagle automatisk |
| Poengmodell, all time | Appen regner begge modellene, bruker bytter visning i innstillingene |
| Telefoner | Én telefon fører scoren for hele gruppen. Ingen synkronisering |
| Avbrutt runde | Lagres og merkes tydelig i historikken, men teller ikke i statistikken |
| 18 → 9 hull underveis | Runden avsluttes på ferdigspilte hull, merkes med faktisk antall. Bekreftelse først |
| 9 → 18 hull underveis | Scorekortet utvides til 18 hull, runden fortsetter |
| Slette runder | Tillatt fra alle runder, fullførte som avbrutte. Bekreftelse først, med bane, dato og spillere i teksten. Tabell, seierspall og banestatistikk regnes om uten runden, og hullradene slettes med |
| Banebibliotek | Baner lagres med navn, antall hull og par, og gjenbrukes |
| Sikkerhetskopi | Påminnelse etter hver femte fullførte runde. Manuell kopi og gjenoppretting i innstillingene |
| Pause og gjenoppta | Lagres etter hvert hull. Kun én pågående runde om gangen |
| Skjermlås | Appen holder ikke skjermen våken. Følger telefonens vanlige regler |
| Lagnavn i Scramble | Foreslås ut fra spillerne, kan overstyres |
| Notat per runde | Valgfritt, vises på rundekort og i eksport |
| Sesongfilter | Øverst i statistikken, gjelder både Match og Scramble. All time er standard |
| Banestatistikk | Både banefilter øverst i Match og Scramble, og en egen Baner-fane med snitt per hull, beste runde og matchvinnere per bane |
| Oppsett i Match | Statistikken kan snevres inn til det eksakte settet spillere som var med. Kim + Ola er et annet oppsett enn Kim + Ola + Per. All time på tvers av alle oppsett er standardvalget |
| Lag i Scramble | Statistikken kan snevres inn til en bestemt lagsammensetning, uavhengig av hvem andre som var med i runden. Lagtabellen sammenligner sammensetningene på beste, snitt og mot par |
| Hole in one i Scramble | Spilleren må pekes ut. Fylles inn fra utslaget når det er registrert, og appen sier fra før runden lukkes hvis den mangler |
| Likhet på hull i Match | Alle med lavest antall slag får 0,5. Totalsummen i en runde kan overstige antall hull, og det er greit: bare utfallet av matchen teller inn i all time-tabellen |
| Publisering | GitHub Pages, offentlig kodelager. Ingen golfdata havner i kodelageret |
| Merker i Scramble | Med par på hullet setter appen merket selv: par minus 1 er birdie, par minus 2 eller bedre er eagle, par eller mer gir ingen merke og ingen valg. Da vises bare valget av utslag. Rettes slagene, følger merket med |
| Valget av hole in one | Kommer bare opp ved 1 slag. Settes som standard og kan tas bort. Tas det bort, gjelder merket par gir (eagle på par 3). Spilleren fylles inn fra utslaget |
| Scramble uten par | Birdie og eagle velges manuelt. Hole in one bare ved 1 slag |
| Scorekort i appen | Hullene står nedover og spillerne eller lagene bortover. Da får kortet plass i bredden på alle telefoner, også med 18 hull. Rapportbildet beholder papirkortformen med UT og INN |
| Totaler i Scramble | Teller bare hull der alle lag har levert slag. Mot par regnes bare på hull med par |
| 9-hullsbane spilt to ganger | Hull 10 til 18 bruker par fra hull 1 til 9, i mot par, scorekort, rapport og banestatistikk |
| Match med én spiller | Ikke lov. Match krever minst to spillere |
| Avslutte uten ferdige hull | Ikke lov. Appen tilbyr å avbryte runden i stedet. Slike runder, og match med færre enn to spillere, holdes også utenfor statistikken |
| Beste og snitt | Sammenligner bare runder med like mange ferdige hull: 18 hvis det finnes, ellers 9 |
| Kodemappe | `Golfapp` i Google Drive, koblet til Claude-økten |

---

## Faser

| Fase | Innhold | Status |
| --- | --- | --- |
| 1 | Designsystem og avatarer | Ferdig 22.09.2026. Alle tolv avatarer er med |
| 2 | Appskall, spilleroppsett, banevalg, lagring i IndexedDB, sikkerhetskopi | Ferdig 22.09.2026 |
| 3 | Match play: registrering, poengberegning, scoreboard, avslutt runde | Ferdig 22.09.2026 |
| 4 | Scramble: lagoppsett, registrering, utslag, birdie og eagle | Ferdig 22.09.2026 |
| 5 | Statistikk: Match-tabell, seierspall, spilleroversikt, rundekort og banestatistikk | Ferdig 22.09.2026 |
| 6 | Eksportrapport som bilde, klar for Discord | Ferdig 22.09.2026 |
| 7 | PWA-skall: manifest, service worker, ikoner, offline-test | Ferdig 22.09.2026, framskyndet |
| 8 | Publisering og bruksanvisning til vennene | Publisert på GitHub Pages 22.09.2026. Flymodus bekreftet på iPhone |

---

## Levert i fase 1

| Fil | Innhold |
| --- | --- |
| `index.html` | **Selve appen.** Åpnes ved å dobbeltklikke. Laster de andre filene under `app/` |
| `Golfapp-designsystem.html` | Designsystemet og alle avatarene på én side. Alt ligger inni den ene filen |
| `app/styles/tokens.css` | Hele designsystemet: farger, typografi, avstand, knapper, segmentkontroll, slagteller, avatarer, scoreboard, merker |
| `app/assets/avatars.js` | Tolv dyreavatarer som SVG, med `GolfAvatars.list`, `.get(id)` og `.render(id, px)` |
| `design/fase1-designsystem.html` | Samme visningsside, men bygget av de to filene over. Brukes til utvikling |

## Levert i fase 2

| Fil | Innhold |
| --- | --- |
| `app/styles/app.css` | Layout: topplinje, bunnmeny, lister, kort, dialog, meldinger |
| `app/js/db.js` | Lagring. IndexedDB, med automatisk fallback til localStorage og til slutt minne |
| `app/js/store.js` | Datamodellen: spillere, baner, runder, innstillinger |
| `app/js/ui.js` | Byggeklosser for grensesnittet, bekreftelsesdialog og meldinger |
| `app/js/backup.js` | Eksport og import av hele historikken som fil |
| `app/js/screens.js` | Hjem, spillere og baner |
| `app/js/screens-round.js` | Rundeoppsett, rundevisning, statistikk-plassholder og innstillinger |
| `app/js/app.js` | Ruter, oppstart og registrering av service worker |

## Levert fra fase 7, framskyndet

| Fil | Innhold |
| --- | --- |
| `manifest.webmanifest` | Navn, farger, visningsmodus og ikoner for installasjon |
| `sw.js` | Service worker som cacher appen, slik at den starter uten nett |
| `icons/` | Appikoner: 192, 512, maskable og apple-touch-icon |
| `PUBLISERING.md` | Stegvis oppskrift for GitHub Pages og installasjon på iPhone |

## Levert i fase 3

| Fil | Innhold |
| --- | --- |
| `app/js/match.js` | Poengreglene i Match som rene funksjoner: hullpoeng, totaler, sluttstilling med delte plasseringer, og poeng til all time-tabellen i begge modeller |
| `app/js/screens-match.js` | Registrering hull for hull, stilling klistret øverst, scoreboard og resultatskjerm |

Rettelser samtidig: bunnmenyen ligger nå fast nederst på skjermen, tomtilstanden
i rundeoppsettet får hele bredden, og tilbakeknappen går ett hakk bakover i en
navigasjonsstabel i stedet for til en fast skjerm.

## Levert i fase 4

| Fil | Innhold |
| --- | --- |
| `app/js/scramble.js` | Beregningene i Scramble som rene funksjoner: lagtotaler, mot par, stilling, telling av utslag og av birdie, eagle og hole in one inkludert solo |
| `app/js/screens-scramble.js` | Registrering per lag hull for hull med slag, utslag, merker og solo, scoreboard og resultatskjerm |

Rettelse samtidig: segmentbryterne strakk seg over hele bredden fordi de lå i et
rutenett. De er nå låst til bredden av knappene i dem.

Datamodell for scramble: hver hullrad har `teams`, en liste med ett objekt per
lag: `{ strokes, driveBy, mark, solo }`. `mark` er `birdie`, `eagle`, `hio`
eller `null`. Match bruker `strokes` som et kart fra spiller-id til slag i
samme tabell.

## Levert i fase 5

| Fil | Innhold |
| --- | --- |
| `app/js/stats.js` | All aggregering som rene funksjoner: Match-tabell med plasseringer og poeng, spilleroversikt for Scramble, rundekort, baneoversikt og banedetalj med snitt per hull |
| `app/js/screens-stats.js` | Fanene Match, Scramble og Baner, sesong- og banefilter, seierspall, tabeller, rundekort og banesiden |

`store.js` fikk `allHoles()`, som gir alle hullrader gruppert på runde. Den
brukes av statistikken, som trenger alle rundene samtidig.

Snitt per hull tegnes som stolper ut fra null i midten, ikke fra venstre kant,
slik at et hull under par og et over par er direkte sammenlignbare. Tallet står
alltid ved siden av, så fargen er aldri det eneste som skiller dem.

## Statistikk etter oppsett og lag

Gjengen varierer fra gang til gang, og statistikken speiler det.

Et **oppsett** i Match er det eksakte settet spillere som var med i en runde,
uavhengig av rekkefølge. Nøkkelen er spiller-id-ene sortert og slått sammen med
`|`, laget av `GolfStats.nokkel`. Match-fanen har en velger med ett valg per
oppsett som faktisk har spilt, pluss «Alle» som er all time på tvers.

Et **lag** i Scramble er på samme måte settet spillere som sto på lag sammen.
Det er uavhengig av hvem andre som var med i runden: laget Kim + Ola teller likt
enten de spilte alene eller mot Per + Nils. `GolfStats.scrambleLag` gir alle
sammensetningene med runder, beste, snitt og mot par, og `GolfStats.lagDetalj`
gir ett lags runder og hva hver spiller bidro med i nettopp det laget.

Begge velgerne ligger over de andre filtrene og virker sammen med sesong og
bane. Velger man et oppsett som ikke finnes i det gjeldende utvalget, faller
valget tilbake til «Alle» i stedet for å vise en tom tabell.

## Sletting av runder

`Screens.slettRundeKnapp(runde, nav)` i `screens-round.js` er den ene
sletteknappen, brukt fra begge resultatskjermene og fra detaljvisningen av
avbrutte runder. Bekreftelsen navngir runden, slik at man ikke sletter feil.

`GolfStore.removeRound` fjerner både runden og alle hullradene den eide.
Statistikken leser rundene på nytt hver gang en skjerm bygges, så tabeller,
seierspall og banestatistikk stemmer uten noe ekstra opprydding.

`Screens.historikk` viser alle runder med filtrene Alle, Match, Scramble og
Avbrutte. Hjemskjermen lenker dit når det er mer enn fem runder.

## Levert i fase 6

| Fil | Innhold |
| --- | --- |
| `app/js/rapport.js` | Rapporten tegnes som et bilde på et canvas i appen. `GolfRapport.bygg` gir canvaset, `GolfRapport.del` deler det |

Resultatskjermene i både Match og Scramble slutter nå med scorekortet hull for
hull, en knapp som lager og deler rapporten, og en «Ferdig»-knapp.
`Screens.scorekort` og `Screens.delRapportKnapp` i `screens-round.js` er felles
for begge modusene.

Rapporten er 1080 piksler bred og så høy som innholdet krever. Den har tittel
med bane, modus, antall hull og dato, resultatlisten med avatarer og vinneren
løftet fram, scorekortet, og for Scramble en høydepunktliste med solo-birdier,
eagles, hole in one og hvem sine utslag som ble brukt mest.

Scorekortet deles i blokker på ni hull, slik et papirkort gjør, i stedet for å
presse atten kolonner inn på bredden. Hver blokk summerer sine egne hull, merket
UT og INN. Totalen for runden står i resultatlisten øverst. I Match viser
sumfeltet slag øverst og poeng under, i samme form som cellene.

Delingen går gjennom `navigator.share` med filen som vedlegg når telefonen
støtter det, slik at bildet kan sendes rett til Discord. Gjør den ikke det, og
på maskin, lastes bildet ned i stedet. Avbryter man delingen, skjer ingenting.

Avatarene tegnes ved å gjøre SVG-en om til en data-URL. Safari nekter å
rastrere en SVG uten `width` og `height`, så `lastAvatar` setter dem før
bildet lastes.

Kildefilene under `app/` er de appen bygges videre av i fase 2.
`Golfapp-designsystem.html` er en sammenslått kopi, og må bygges på nytt hvis
`tokens.css` eller `avatars.js` endres.

---

## Åpne punkter

1. **Sikkerhetskopi på iPhone er ikke prøvd.** Kim sjekker at delefunksjonen
   dukker opp, og at lagringen overlever at appen lukkes.
2. **Rapporten er ikke prøvd på iPhone.** Den er testet i Chromium, der bildet
   blir riktig og nedlastingen virker. På iPhone går delingen gjennom
   `navigator.share`, som krever at trykket kommer fra brukeren. Knappen kaller
   `GolfRapport.del` rett fra klikket, så det skal være i orden, men det bør
   sjekkes sammen med resten av punkt 1.
3. **Skriften i rapporten er telefonens egen.** Appen laster ingen skrifter
   utenfra, så bildet ser litt ulikt ut på iPhone og på maskin. Det er et
   bevisst valg, ikke en feil.

---

## Tekniske rammer som gjelder videre

- Ingen eksterne ressurser. Ingen Google Fonts, ingen CDN, ingen sporing.
  Alt må kunne kjøre uten nett.
- Ingen `type="module"` på skript som skal kunne åpnes rett fra disk med
  `file://`. Bruk vanlige skript som setter et globalt objekt.
- All lagring i IndexedDB, med versjonsnummer på hver rad.
- Spillere arkiveres, slettes aldri, slik at historiske runder fortsatt vises riktig.
- Statistikk regnes ut fra rundene ved visning, ikke lagret som egne totaler.
- Alle trykkflater minst 48 px.
- Fargen er aldri eneste kjennetegn. Avatar og navn står alltid ved siden av.
- `index.html` har en streng Content Security Policy som stenger alt utenfra.
  Den blokkerer også `style`-attributter, så stil settes gjennom CSSOM
  (`node.style.setProperty`) og aldri som attributt. `UI.el` gjør dette selv.
- All tekst fra brukeren settes med `textContent`, aldri som HTML.
- Skjulte elementer styres med `hidden` pluss regelen `[hidden] { display: none !important; }`
  i app.css, fordi `display: grid` ellers overstyrer `hidden`.
- **Øk `VERSJON` øverst i `sw.js` hver gang en fil endres.** Ellers fortsetter
  telefonen å bruke den gamle kopien. Legg nye filer inn i `FILER`-listen.
- Service workeren registreres bare på https og localhost. Åpnes appen fra
  disk, hoppes den over, og appen virker som en vanlig side.

---

## Levert i økt 2 (22.09.2026)

Endrede filer, som må lastes opp til GitHub på nytt: `sw.js`, `PUBLISERING.md`,
`STATUS.md`, `app/styles/app.css` og disse under `app/js/`: `app.js`,
`backup.js`, `db.js`, `rapport.js`, `scramble.js`, `screens.js`,
`screens-match.js`, `screens-round.js`, `screens-scramble.js`,
`screens-stats.js`, `stats.js`, `store.js`.

**Skalering.** Årsaken var at klassen `.scroll` bare fantes i designsystemsiden,
ikke i `app.css`. Scorekortet på 18 hull gjorde derfor hele siden 1144 px bred,
og telefonen zoomet ut. Rettet med `.scroll`, `minmax(0, 1fr)` i stablene,
`overflow-x: clip` på siden, fast høyde på topplinjen, mindre luft på smale
telefoner og navn som brekker i stedet for å dytte slagtelleren ut. Testet på
320, 360, 375, 390 og 430 px bredde: ingen skjerm er bredere enn telefonen, og
ingen tabell må rulles sidelengs.

**Felles scorekort.** `Screens.scorekortTabell` i `screens-round.js` brukes av
registreringen i begge moduser, resultatskjermene og avbrutte runder.

**Rettet etter gjennomgang:**

- Slag kunne gå tapt når man tastet et tall og trykket en annen knapp med én
  gang. Raden i minnet oppdateres nå før den skrives (`GolfStore.holeRow` og
  `putHole`).
- Scramble-totalen talte hull der det andre laget ikke hadde levert.
- Mot par ble feil etter 9 → 18 hull på en 9-hullsbane (72 slag viste +36).
- En 9-hullsrunde kunne bli «beste runde» foran en 18-hullsrunde.
- 18 → 9 hull kunne slette ferdige hull når et hull var hoppet over. Runden
  kuttes nå etter siste ferdige hull.
- Runder uten ferdige hull, og match med én spiller, ga seire i all time-tabellen.
- Sesong- og banefilteret kunne bli stående på et valg som ikke fantes lenger.
- Dobbelttrykk på «Start runde» laget to pågående runder.
- Avbrutte runder viste en gammel tekst om fase 3 og 4. De viser nå scorekortet.
- «Hent tilbake» på arkiverte spillere oppdaterte ikke listen.
- Rapporten skrev «Par mot par».
- `PUBLISERING.md` rådet til å fjerne appen fra Hjem-skjermen uten å nevne at
  det sletter alle data på iPhone.

**Forbedret:**

- Service workeren henter filer forbi nettleserens mellomlager ved
  installasjon, venter maks 2 sekunder på nett før appen startes fra lageret,
  og lagrer bare gyldige svar. Appen ser etter ny versjon når den kommer fram
  på skjermen, og sier fra når en ny versjon er lastet ned.
- Appen ber om varig lagring (`navigator.storage.persist`), og Innstillinger
  viser svaret. Åpnes appen i Safari i stedet for fra Hjem-skjermen, står det
  en advarsel om at dataene er adskilt.
- Gjenoppretting skjer i én transaksjon, så en avbrutt gjenoppretting ikke
  lar appen stå tom. Kopien sjekkes grundigere før noe slettes.
- Feil som ellers ville forsvunnet i stillhet, gir nå en melding.
- Tilbakeknappen er 48 px.

**Forslag som ikke er gjort:**

- Deling av rapport og sikkerhetskopi på iPhone: bildet og filen lages etter
  trykket. Safari kan avvise delingen hvis det tar for lang tid. Hvis det skjer,
  bør de lages på forhånd når skjermen åpnes.
- Hvis IndexedDB ikke åpner innen 4 sekunder, går appen stille over til
  localStorage og ser tom ut. Bør heller prøve igjen og si fra.
- Små trykkflater under 48 px: `.btn-sm`, `.chip-sm` og hullnumrene i scorekortet.
- Albatross (par minus 3) registreres som eagle. Appen har ikke eget merke for det.

