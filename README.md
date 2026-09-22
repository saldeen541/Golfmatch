# Golfapp

Scoreapp for match play og scramble, bygget som en installerbar nettapp som
fungerer helt uten nett.

## Kom i gang

**På iPhone og Android:** appen må ligge på en nettadresse. Se
`PUBLISERING.md` for stegvis oppskrift på GitHub Pages. Å kopiere mappen til
iCloud og åpne den fra Filer-appen virker ikke — iPhone kjører ikke nettapper
som består av flere filer derfra.

**På Mac og PC:** dobbeltklikk `index.html`. Da virker alt bortsett fra
offline-motoren, som krever https.

`Golfapp-designsystem.html` viser designsystemet og alle avatarene. Alt ligger
inni den ene filen, så den virker uansett hvor du flytter den.

## Mappestruktur

```
Golfapp/
  index.html                      appen
  manifest.webmanifest            navn, farger og ikoner for installasjon
  sw.js                           offline-motoren
  PUBLISERING.md                  oppskrift for å legge appen ut på nett
  Golfapp-designsystem.html       designsystem og avatarer på én side
  README.md                       denne filen
  STATUS.md                       hva som er gjort, hva som gjenstår, beslutninger
  app/
    styles/tokens.css             farger, typografi, komponenter
    styles/app.css                layout og skjermer
    assets/avatars.js             tolv dyreavatarer som SVG
    js/                           lagring, datamodell, skjermer og ruter
  icons/                          appikoner
  design/
    fase1-designsystem.html       designsystemet, bygget av filene under app/
```

Filene under `app/` er kildekoden appen bygges videre av.
`Golfapp-designsystem.html` er en sammenslått kopi av dem.

## Prinsipper

Appen laster ingenting utenfra. Ingen skrifttyper fra nett, ingen kodebibliotek
fra andre servere, ingen sporing og ingen brukerkontoer. All data ligger på
telefonen til den som fører scoren, og forlater den bare hvis man selv velger å
lagre en sikkerhetskopi eller eksportere en rapport.

Se `STATUS.md` for beslutninger, faseplan og åpne punkter.
