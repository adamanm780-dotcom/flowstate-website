# Design-Spec — Redesign yourflowstate.de

**Datum:** 2026-08-29 · **Branch:** `redesign` · **Status:** zur Freigabe
**Vorbild (Bauart + Motion):** space-rocket-berlin.de — direkter Wettbewerber,
Berlin, Websites zum Festpreis. Bauart, Sektionsfolge und Animationsprinzipien
werden übernommen, Inhalte/Farben/Typo sind eigenständig. Kein übernommener
Code, kein übernommenes Bildmaterial, keine übernommenen Texte.

---

## 1. Ausgangslage

Die heutige Seite ist eine Effekt-Show ohne Verkaufslogik: 1,7-Sekunden-
Preloader, Word-Morph über 400vh, 3D-Scroll-Engine, 71+43 WebP-Frames,
Sticky-Pins über 360vh. Sie nennt keinen Preis, kein Risiko-Versprechen,
keinen Vergleich, kein FAQ und zeigt kein echtes Kundenprojekt namentlich.

Vom Betreiber benannte Probleme:
1. konvertiert nicht
2. auf dem Handy zäh
3. sieht nach AI-Slop aus — konkret: generischer Dark-Tech-Look
   (dunkel + Glow + Aurora + Gradient) und Standard-Bausteine
   (Bento-Grid, Metric-Cards, Badges, Marquee, Team-Cards)

## 2. Zielgruppe und Nutzungssituation (bestimmt jede Entscheidung)

Besucher kommen fast ausschließlich über **Cold Call** und **Door-to-Door-
Pitch mit Visitenkarte**. Daraus folgt:

- Der Besucher **tippt die URL vom Kartendeckel ins Handy**. Mobil ist nicht
  eine Ansicht, mobil IST die Seite. Desktop ist die Zweitansicht.
- Er hat euch **gerade gesprochen**. Er braucht keine Einführung, was eine
  Webagentur ist — er prüft: *Sind die echt? Können die das? Was kostet es?*
- Er ist **Betriebsinhaber**, kein Tech-Mensch: Handwerk, Praxis, Juwelier,
  Gastro. Dark-Mode-Tech-Ästhetik spricht ihn nicht an.
- Er steht evtl. **draußen im Mobilfunk**. Jede Sekunde Ladezeit vor dem
  ersten Inhalt kostet den Kontakt.
- Zeitfenster: **etwa 20 Sekunden.**

**Erfolgskriterium der Seite:** Anruf oder Formularabsendung. Nicht Verweildauer,
nicht Scrolltiefe.

## 3. Was das Vorbild richtig macht

Analyse von space-rocket-berlin.de:

- **Hero-Reihenfolge:** Sozialbeweis (`5,0 ★★★★★ +400 Bewertungen`) → klares
  Was („Website erstellen lassen") → Angebot („60 % Rabatt") → Subline →
  **Preisanker** („799 € statt 1.999 €") → CTA + sichtbare Telefonnummer.
  Vertrauen kommt VOR der Behauptung.
- **Vollständige Verkaufsdramaturgie:** Warum wir (4 Gründe) → Ablauf
  (3 Schritte) → Arbeiten → Angebot mit 8 Leistungen → Stimmen →
  **Vergleichstabelle „andere Anbieter vs. wir"** → Über uns → CTA →
  **FAQ mit 7 Einwänden** → Abschluss-CTA.
- **Motion ist leicht:** 70 von 79 Transitions laufen auf 0,3s. Keyframes sind
  Standard (Fade, Slide, Zoom, Marquee, Gradient-Blob, Shape-Divider).
  Kein GSAP, kein Scroll-Scrub, kein 3D, keine Frame-Sequenzen.
  Technisch: IntersectionObserver für Reveals, ein rAF-Loop für Parallax
  (`data-parallax-amount` 7 für Hintergründe, 20–60 für Deko-Elemente).
- **Palette hell und geschäftlich:** Blau #0471ec (Vertrauen) + Orange #f58220
  (CTA-Signal) + Navy #293247 (Text) + Weiß/#f9f9f9 (Flächenwechsel).
- **Signature-Moment:** Typewriter-Effekt im Hero.

Damit ist das Vorbild **leichter und schneller** als die heutige FlowState-Seite
und löst das Handy-Problem als Nebeneffekt.

## 4. Wo das Vorbild nicht übertragbar ist

Space Rocket trägt die halbe Seite mit Sozialbeweis-Masse: 2.000 Kunden,
400 Bewertungen, 4 German Web Awards, 8 Branchen-Referenzen. Das hat FlowState
nicht. Eine 1:1-Übernahme erzeugt genau dort Löcher, wo das Vorbild am
stärksten ist — und eine leere Trust-Sektion wirkt schwächer als keine.

**Ersetzt wird Masse durch das stärkere eigene Argument:**

| Space Rocket | FlowState |
|---|---|
| „Geld-zurück-Garantie" (Risiko *nachher*) | **„Sie sehen Ihre fertige Website, bevor Sie zahlen"** (kein Risiko *vorher*) |
| 2.000 Kunden, 400 Bewertungen | 2 echte, nachprüfbare Referenzen mit Namen und Link |
| 4 Awards | Regionalität + persönlicher Kontakt (ihr standet in seinem Laden) |
| SEO | **SEO + GEO** (Sichtbarkeit in KI-Antworten) + KI-Workflows |

Das Vorab-Demo-Versprechen ist im Türgespräch das stärkere Argument als jeder
Rabatt. Es wird zur tragenden Botschaft der Seite.

## 5. Positionierung

- **ONE THING:** Die fertige Website sehen, bevor man sie bezahlt.
- **Emotion in 3 Sekunden:** Erleichterung — „kein Risiko, die meinen es ernst".
- **Merkbares Element:** Der Satz „Erst überzeugen. Dann bezahlen." plus die
  beiden echten Referenzen mit Namen.
- **Idealer Kunde:** Inhabergeführter lokaler Betrieb (5–50 Mitarbeiter) im
  Rhein-Main-Gebiet mit veralteter oder keiner Website.
- **Voice:** direkt · konkret · unaufgeregt.
- **NIE:** Effekte vor Inhalt, Agentur-Sprech, erfundene Zahlen, Lorem-Reste.

## 6. Design-System

### 6.1 Palette — eigene Farbe, Logik des Vorbilds

Logik übernommen (helle Basis + kühle Vertrauensfarbe + warme Signalfarbe),
Farbwerte eigenständig, damit ihr nicht wie ein Klon des Berliner
Wettbewerbers aussieht, den ihr in derselben Zielgruppe trefft.

**Empfehlung — Petrol + Koralle auf Creme:**

```
--ink:         #0E3A3E   /* tiefes Petrol, Text + dunkle Flaechen */
--ink-2:       #14595C   /* mittlere Stufe */
--accent:      #14807E   /* Vertrauensfarbe, Flaechen/Linien */
--accent-dark: #0B4B4E
--signal:      #E8563F   /* CTA, Preis-Akzent, nur hier */
--signal-dark: #C8412C
--paper:       #FBF8F3   /* warmes Creme, Grundflaeche */
--surface:     #F2EDE5   /* getoente Wechselflaeche */
--line:        #DCD3C6   /* getoente Haarlinie */
```

Regeln: ~90 % der Fläche neutral, Signalfarbe ausschließlich für Handlung
(CTA, Preis, Aktionsbadge). Nie reines `#000`/`#fff` als Sektionsgrund.
Kontrast lokal an der Pixelposition prüfen, Body ≥ 4.5:1.

*Alternativen zur Auswahl:* (B) Tannengrün `#12372A` + Warmrot `#C8452F` auf
`#F7F4EE` · (C) Ink-Navy `#1B2B4B` + Bernstein `#D98324` — C liegt bewusst
näher am Vorbild.

### 6.2 Typografie

Das Vorbild nutzt **Encode Sans Semi Condensed**. Der Semi-Condensed-Charakter
ist wirkungstragend (viel Aussage pro Zeile, energisch) und wird übernommen —
mit anderer Schrift.

- **Display:** Barlow Semi Condensed, 700/800
- **Body:** Barlow, 400/500
- Ein-Familien-System (DESIGN-DNA: 1 Display + 1 Text-Font)
- Fluide `clamp()`-Skala durchgehend, keine Media-Query-Sprünge
- H1 `clamp(2.4rem, 1.7rem + 3.4vw, 4.2rem)`, Tracking −0.02em, LH 0.95–1.05
- Body LH 1.55, Textblöcke `max-width: 62ch`
- `text-wrap: balance` auf h1–h3, keine Einzelwort-Schlusszeilen
- `font-variant-numeric: tabular-nums` auf Preisen
- Self-hosted als woff2 mit `font-display: swap` (kein Google-Fonts-Request)

*Alternativen:* Archivo Narrow · Saira Semi Condensed.

### 6.3 Motion-System (nach Vorbild)

| Element | Mechanik | Werte |
|---|---|---|
| Reveals | IntersectionObserver, einmalig | Fade + translateY 24px, 0.5s |
| Stagger | CSS-Delay über `--i` | 60–90ms Treppe |
| Parallax | ein rAF-Loop, passive, ticking-Flag | Hintergründe 7, Deko 20–60 |
| Hero-Signature | Typewriter auf Wechselwort | 1 Wort/1.6s, Cursor blinkt |
| CTA | Pulse, scroll-getriggert | 2s, dezent |
| Marquee | CSS-Keyframe | 1× als Referenz-/Branchenband |
| Sektions-Trenner | animierte SVG-Form | weich, einmalig beim Eintritt |
| Hintergrund | zwei weiche Farbblobs | 20–30s, sehr langsam |

Ein dominantes Easing: `cubic-bezier(0.16, 1, 0.3, 1)`.
Hover auf jedem interaktiven Element (Default/Hover/Active/Focus-visible).
`prefers-reduced-motion` schaltet alles Bewegte ab, Inhalte bleiben sichtbar.

**Verboten in diesem Build:** Preloader, Frame-Sequenzen, Sticky-Pins über
mehrere Viewports, 3D-Unfold, Word-Morph, Aurora/Glow, Gradient-Text.

## 7. Sektionsaufbau

| # | Sektion | Zweck | Kerninhalt |
|---|---|---|---|
| 1 | Sticky-Nav | Erreichbarkeit | Logo, Ankerlinks, **Telefon als `tel:`**, CTA. Mobil bleibt der Telefon-Button sichtbar |
| 2 | **Hero** | 20-Sekunden-Test bestehen | Trust-Zeile → H1 mit Typewriter-Wechselwort → „Erst überzeugen. Dann bezahlen." → **Preis mit Aktionsanker** → CTA-Paar (Anrufen / Kostenlose Demo) |
| 3 | Warum FlowState | Einwände vorwegnehmen | 4 Gründe: kein Risiko · fertig in X Tagen · aus der Region, persönlich · KI & GEO inklusive |
| 4 | So läuft es | Unsicherheit nehmen | 3 Schritte: Gespräch → wir bauen → Sie entscheiden |
| 5 | **Unsere Arbeiten** | Beweis | Juwelier Benjamin (live) + Derma Häusler-Mehlhorn, groß, Name + Link, echte Screenshots |
| 6 | **Angebot** | Preisfrage beantworten | Preis + Aktionsanker, Leistungspaket, was inklusive ist |
| 7 | Stimmen | Sozialbeweis | echte Kundenzitate mit Namen und Betrieb |
| 8 | **Der Unterschied** | Abgrenzung | Vergleich: übliche Agentur vs. FlowState (Vorkasse vs. erst sehen, Wartezeit, Baukasten, KI/GEO) |
| 9 | Über uns | Vertrauen in Personen | Benet, Adrian, Damian — echte Fotos, keine Stock-Gesichter |
| 10 | KI & GEO | Vorsprung zeigen | Workflows, Automatisierung, Auffindbarkeit in KI-Antworten — in Kundensprache, nicht in Tech-Sprache |
| 11 | FAQ | Resteinwände | Kosten, Dauer, Domain/E-Mail, selbst bearbeiten, was wenn es nicht gefällt, laufende Kosten |
| 12 | Abschluss-CTA + Footer | Handlung | Telefon groß, kurzes Formular, rechtliche Links |

**Dramaturgie:** Attention (1–2) → Trust (3–10) → Action (11–12).
Keine zwei benachbarten Sektionen im selben Layout-Muster.

## 8. Technik und Dateistruktur

Vanilla HTML/CSS/JS, kein Framework, kein npm-Build (BUILD-STANDARDS).
Die Struktur ist bewusst so geschnitten, dass **zwei Leute gleichzeitig ohne
Merge-Konflikte** arbeiten können — heute liegt alles in je einer Datei
(`style.css` 104 KB, `index.html` 51 KB, `script.js` 38 KB).

```
index.html              # eine Datei, Sektionen durch Kommentar-Marker getrennt
css/
  00-tokens.css         # Farben, Typo-Skala, Spacing   (gemeinsam, selten)
  01-base.css           # Reset, Typo-Grundlagen        (gemeinsam, selten)
  02-nav.css  03-hero.css  04-warum.css  05-ablauf.css
  06-arbeiten.css  07-angebot.css  08-stimmen.css
  09-vergleich.css  10-ueber.css  11-ki-geo.css
  12-faq.css  13-footer.css
js/
  motion.js             # IO-Reveals + Parallax-rAF     (gemeinsam)
  typewriter.js  faq.js  nav.js  form.js
assets/                 # Screenshots der Referenzen, Team-Fotos, Logo
```

**Arbeitsteilung:** Eine Sektion = eine CSS-Datei = eine Person. Konflikte
entstehen dann nur noch in `index.html`, und dort nur bei gleichen Zeilen.
`00-tokens.css` und `motion.js` sind gemeinsam — Änderungen daran vorher kurz
absprechen.

**CSS-Auslieferung:** In der Entwicklung mehrere `<link>`-Tags. Vor Go-Live
fügt `node scripts/build-css.js` (dependency-frei, ~20 Zeilen) die Dateien zu
einer `style.css` zusammen, damit nicht 14 Requests das Rendering blockieren.
Kein npm install, kein Framework — nur Verketten.

**Progressive Enhancement:** Ohne JS ist jeder Inhalt sichtbar und lesbar
(Reveals starten im Sichtbar-Zustand, JS blendet sie erst aus). FAQ funktioniert
über `<details>`. Keine `preventDefault`-Page-Transitions.

**Performance-Budget (Handy, Mobilfunk):** LCP < 2,0s · CLS < 0,05 ·
kein Render-Blocking außer einem CSS · Bilder in WebP mit `width`/`height` ·
Hero-Bild `fetchpriority="high"`, alle anderen lazy · Gesamt < 600 KB bis LCP.

**SEO/GEO:** semantische Überschriftenhierarchie, `LocalBusiness`- und
`FAQPage`-Structured-Data, sprechende Meta-Description, `llms.txt` pflegen
(existiert bereits), Textinhalte als Text statt in Bildern.

## 9. Rechtliches

- **Preisanker:** Der durchgestrichene Preis muss real sein — ein Preis, den
  ihr tatsächlich verlangt habt oder außerhalb der Aktion verlangt.
  Reine Fantasie-Streichpreise sind nach UWG/PAngV abmahnfähig.
- **Referenzen:** Benjamin und Mehlhorn werden namentlich genannt — vorher
  formlos deren Einverständnis einholen und dokumentieren.
- Impressum, Datenschutz und Cookie-Handhabung werden aus dem Bestand
  übernommen und geprüft.
- Keine übernommenen Inhalte, Bilder, Texte oder Code-Fragmente des Vorbilds.

## 10. Offene Daten (vom Betreiber zu liefern)

Ohne diese Angaben kann nicht ausgeliefert werden — Platzhalter sind laut
DESIGN-DNA ein Auslieferungs-Fail:

1. **Preise:** regulärer Preis und Aktionspreis (real belegbar)
2. **Live-URL der Mehlhorn-Seite** (die `.vercel.app`-Adresse antwortet 404)
3. **Kundenzitate:** 2–4 echte Aussagen mit Name und Betrieb
4. **Bearbeitungsdauer:** in wie vielen Tagen steht eine Seite
5. **Team-Fotos** von Benet, Adrian, Damian
6. **Leistungsumfang:** was genau ist im Preis enthalten
7. Bestätigung der Referenz-Freigabe durch Benjamin und Mehlhorn

## 11. Abnahme-Gates (jedes ≥ 8/10)

| Gate | Frage |
|---|---|
| **Mobil-20-Sekunden** | Auf 390×844: Sind Trust-Zeile, Kernaussage, Preis und Telefon-CTA ohne Scrollen sichtbar? |
| **Ladezeit** | LCP < 2,0s auf gedrosseltem 4G? |
| **Beweis** | Erkennt ein Fremder in 10s, dass die Referenzen echt und nachprüfbar sind? |
| **Anti-Slop** | Kein Dark-Glow, kein Bento, keine Badge-Reihe, keine Metric-Cards? |
| **Uniqueness** | Könnte Space Rocket diese Seite mit 3 Wortänderungen nutzen? (ja = Fail) |
| **Verkaufslogik** | Preis, Risiko-Versprechen, Vergleich und FAQ vorhanden und auffindbar? |
| **PE/A11y** | Ohne JS alles sichtbar, 0 Console-Errors, Kontrast AA, Fokus sichtbar? |
| **Parallelarbeit** | Sektionsdateien sauber getrennt, keine Konfliktzonen? |
