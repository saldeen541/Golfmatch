# Slik legger du Golfapp ut på nett

Appen må ligge på en nettadresse med https før den kan installeres på telefonen.
Det er ikke en begrensning i appen: iPhone kjører rett og slett ikke nettapper
som åpnes fra Filer-appen, og nettlesere krever https for at offline-motoren
skal virke i det hele tatt.

Denne oppskriften bruker GitHub Pages. Den er gratis, varig, og krever ingen
kommandolinje. Regn med et kvarter første gang.

---

## Det du trenger å vite først

Et gratis GitHub Pages-nettsted må ligge i et **offentlig** kodelager. Det
betyr at koden er synlig for andre. Det er greit her: appen inneholder ingen
passord eller nøkler, og **ingen av golfdataene deres havner i kodelageret**.
Score og spillere ligger bare på telefonen som fører runden.

Vil du ikke ha koden offentlig, si fra, så finner vi en annen løsning.

---

## Steg 1: Lag en GitHub-konto

Har du allerede en, hopp til steg 2.

1. Gå til `github.com` og velg **Sign up**.
2. Registrer deg med e-post, brukernavn og passord.
3. Bekreft e-postadressen. Kontoen må være bekreftet før Pages virker.

Brukernavnet blir en del av adressen til appen, så velg noe du vil se igjen.

---

## Steg 2: Opprett kodelageret

1. Trykk **+** øverst til høyre på github.com og velg **New repository**.
2. **Repository name:** `golfapp`
3. La beskrivelsen stå tom, eller skriv «Scoreapp for match play og scramble».
4. Velg **Public**.
5. Ikke huk av for «Add a README file». Vi laster opp vår egen.
6. Trykk **Create repository**.

---

## Steg 3: Last opp filene

1. På siden som kommer opp, trykk lenken **uploading an existing file**.
   Finner du den ikke, gå til **Add file** og velg **Upload files**.
2. Åpne Golfapp-mappen i Finder.
3. Merk **innholdet** i mappen, ikke selve mappen: `index.html`, `sw.js`,
   `manifest.webmanifest`, `README.md`, `STATUS.md`, `PUBLISERING.md`,
   `Golfapp-designsystem.html`, og mappene `app`, `icons` og `design`.
4. Dra alt sammen inn i feltet i nettleseren. Undermappene blir med.
5. Vent til alle filene står i listen, og trykk **Commit changes** nederst.

Laster du opp selve `Golfapp`-mappen i stedet for innholdet, havner alt ett nivå
for dypt og adressen blir feil. Da er det bare å slette filene og prøve igjen.

---

## Steg 4: Slå på Pages

1. Gå til **Settings** øverst i kodelageret.
2. Velg **Pages** i menyen til venstre.
3. Under **Build and deployment → Source**, velg **Deploy from a branch**.
4. Under **Branch**, velg `main` og mappen `/ (root)`. Trykk **Save**.
5. Vent ett til to minutter. Last siden på nytt, så står adressen øverst.

Adressen blir:

```
https://DITT-BRUKERNAVN.github.io/golfapp/
```

Åpne den i nettleseren på Mac-en først, for å se at appen starter.

---

## Steg 5: Installer på iPhone

1. Åpne adressen i **Safari** på iPhone. Det må være Safari, ikke Chrome.
2. Trykk Del-knappen nederst, den med pilen ut av firkanten.
3. Bla ned og velg **Legg til på Hjem-skjerm**.
4. Trykk **Legg til**.

Appen ligger nå som et ikon på hjemskjermen, åpner uten nettleserlinje, og
fungerer i flymodus. Første åpning må skje med nett, slik at appen rekker å
laste seg selv ned.

På Android er det samme framgangsmåte i Chrome: meny med tre prikker og
**Installer app**.

---

## Steg 6: De andre i gjengen

Send dem adressen. De kan installere appen på samme måte, men husk at
**scoren føres på én telefon**. De andre får rapporten etterpå. Dataene
synkroniseres ikke mellom telefoner.

---

## Når appen oppdateres

Når jeg leverer endringer, laster du opp de endrede filene på nytt:
**Add file → Upload files**, dra inn filene, **Commit changes**. GitHub
overskriver de gamle.

Appen henter den nye versjonen neste gang du åpner den med nett på. Ser du
likevel den gamle, lukk appen helt og åpne den igjen.

---

## Hvis noe ikke virker

**Siden er hvit eller viser en 404.** Vent to minutter til og last på nytt.
Pages bruker litt tid første gang. Sjekk så at `index.html` ligger øverst i
kodelageret og ikke inne i en undermappe.

**Appen står på «Starter appen …».** Da har ikke filene under `app/` blitt med
opp. Sjekk at mappene `app` og `icons` finnes i kodelageret.

**Ikonet på hjemskjermen er feil eller mangler.** Fjern appen fra
hjemskjermen, åpne adressen i Safari på nytt, og legg den til igjen.

**Ingenting lagres.** Åpne appen, gå til Innstillinger og les linjen under
«Lagring». Den sier hvilken lagring nettleseren tillater.
