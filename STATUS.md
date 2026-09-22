# Status – Golfapp

Denne filen er overleveringen mellom arbeidsøkter. Les den først i en ny økt,
før du leser kode.

**Sist oppdatert:** 22. september 2026
**Nå:** fase 2 og PWA-skallet fra fase 7 er levert. Kim publiserer på GitHub Pages. Neste er fase 3, registrering i Match.

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
| Redigere og slette runder | Tillatt. Slår umiddelbart gjennom i tabell, seierspall og historikk |
| Banebibliotek | Baner lagres med navn, antall hull og par, og gjenbrukes |
| Sikkerhetskopi | Påminnelse etter hver femte fullførte runde. Manuell kopi og gjenoppretting i innstillingene |
| Pause og gjenoppta | Lagres etter hvert hull. Kun én pågående runde om gangen |
| Skjermlås | Appen holder ikke skjermen våken. Følger telefonens vanlige regler |
| Lagnavn i Scramble | Foreslås ut fra spillerne, kan overstyres |
| Notat per runde | Valgfritt, vises på rundekort og i eksport |
| Sesongfilter | Øverst i statistikken, gjelder både Match og Scramble. All time er standard |
| Likhet på hull i Match | Alle med lavest antall slag får 0,5. Totalsummen i en runde kan overstige antall hull, og det er greit: bare utfallet av matchen teller inn i all time-tabellen |
| Publisering | GitHub Pages, offentlig kodelager. Ingen golfdata havner i kodelageret |
| Kodemappe | `Golfapp` i Google Drive, koblet til Claude-økten |

---

## Faser

| Fase | Innhold | Status |
| --- | --- | --- |
| 1 | Designsystem og avatarer | Ferdig 22.09.2026. Alle tolv avatarer er med |
| 2 | Appskall, spilleroppsett, banevalg, lagring i IndexedDB, sikkerhetskopi | Ferdig 22.09.2026 |
| 3 | Match play: registrering, poengberegning, scoreboard, avslutt runde | Neste |
| 4 | Scramble: lagoppsett, registrering, utslag, birdie og eagle | Ikke startet |
| 5 | Statistikk: Match-tabell, seierspall, spilleroversikt og rundekort for Scramble | Ikke startet |
| 6 | Eksportrapport som bilde, klar for Discord | Ikke startet |
| 7 | PWA-skall: manifest, service worker, ikoner, offline-test | Ferdig 22.09.2026, framskyndet |
| 8 | Publisering og bruksanvisning til vennene | Oppskrift levert i PUBLISERING.md. Kim gjennomfører |

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

Kildefilene under `app/` er de appen bygges videre av i fase 2.
`Golfapp-designsystem.html` er en sammenslått kopi, og må bygges på nytt hvis
`tokens.css` eller `avatars.js` endres.

---

## Åpne punkter

1. **Kim skal publisere og prøve appen på iPhone.** Oppskriften ligger i
   `PUBLISERING.md`. Appen kan ikke åpnes fra Filer-appen på iPhone: en
   nettapp med flere filer kjører ikke der. Særlig verdt å sjekke etter
   installasjon: at lagringen overlever at appen lukkes, at den starter i
   flymodus, og at delefunksjonen dukker opp ved sikkerhetskopi.
2. **Rundevisningen er tom med vilje.** Registrering hull for hull kommer i
   fase 3 (Match) og fase 4 (Scramble). Runder som opprettes nå lagres
   riktig og kan avbrytes eller slettes.

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
