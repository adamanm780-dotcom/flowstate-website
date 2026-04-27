# Flow State Website

Premium-Webdesign + AI-Lösungen — Single-Page-Site mit kinetic Editorial Hero, Word-Morph-Section, Tilted Laptop-Showcase, Bento-Metrics mit animiertem Trading-Chart, Sticky-pinned Process-Walk und Tilted Phone-Showcase.

**Stack:** Vanilla HTML / CSS / JavaScript. Kein Build-Step. Kein Framework. Direkt deploybar auf Vercel, Netlify oder jeden statischen Host.

---

## Lokal entwickeln

Einfach `index.html` im Browser öffnen reicht für die meisten Sektionen.

Wenn du `file://` Probleme bekommst (Frame-Sequenzen laden nicht):

```bash
# Mit Python (3.x):
python -m http.server 8766

# Mit Node:
npx serve -p 8766

# Oder das mitgelieferte Mini-Server-Script:
node .qa-serve.js
```

Dann im Browser: `http://localhost:8766`

> Hinweis: `.qa-serve.js` ist im `.gitignore` und wird nicht mit gepusht — falls du es brauchst, kopier es manuell oder benutze `npx serve`.

---

## Datei-Struktur

```
flowstate-zeta/
├── index.html              # Markup, alle Sektionen inline
├── style.css               # Komplettes Design-System + alle Sektionen-Styles
├── script.js               # Animationen, Scroll-3D, Preloader, Cursor-Light, Marquee
├── README.md
├── .gitignore
└── assets/
    ├── logo.webp           # Brand-Mark
    ├── btn1.png            # Button-Background (legacy, wird nicht mehr genutzt)
    ├── btn2.png
    ├── showcase-laptop.jpg # Customer-Site für Tilted-Laptop-Showcase
    ├── showcase-laptop-2.jpg
    ├── showcase-laptop-3.jpg
    ├── hero-frames/        # 71 WebP-Frames für ältere Hero-Animation (deaktiviert in v4)
    │   └── frame-001.webp ... frame-071.webp
    └── card-frames/        # 43 WebP-Frames für Services-Stage scroll-driven canvas
        └── frame-001.webp ... frame-043.webp
```

---

## Sektionen (in Scroll-Reihenfolge)

1. **Preloader** — Loading-Bar mit Shimmer, fadet aus nach 1.7s, triggert Hero-Cascade
2. **Hero v4** — USP-first: „Erst überzeugen. Dann bezahlen." mit Aurora-Background, Cursor-Light, Trust-Marquee
3. **Word-Morph** — Sticky-pinned 400vh, „Wir bauen [Webseiten/AI/Auto/Brand] die wirklich funktionieren." mit Icon-Glyph swap
4. **Risk-Free** — Sticky-pinned 200vh, 3-Step-USP mit scroll-tied Step-Emphasis
5. **Showcase** — Tilted Laptop-Mockup mit echtem Kunden-Build + scroll-tied 3D-Unfold
6. **Metrics-Bento** — 5 Cards: Performance, AI-Chat, Auffindbarkeit-Chart, Time-to-Launch, Reviews
7. **Process** — Sticky-pinned 360vh 4-Phasen 3D-Phase-Walk
8. **Phone-Showcase** — Tilted iPhone-Mockup mit scroll-tied straighten + Mobile-First-Pitch
9. **Team** — 2 Founder & Owner Cards (Benet + Adrian)
10. **Kontakt** — Contact-Card mit gradient Border-Pulse + Email/Tel-Items + Mailto-CTA
11. **Footer** — Logo + Nav + Legal

---

## Deploy

### Vercel (empfohlen)

```bash
npx vercel --prod
```

Oder via Vercel-Dashboard: GitHub-Repo verbinden → Auto-Deploy bei jedem Push.

### Netlify

```bash
npx netlify deploy --prod --dir=.
```

### Generisch (ohne Build)

Einfach den ganzen Ordner auf einen statischen Host hochladen. Keine Build-Befehle nötig.

---

## Tech-Notes

- **Animationen:** Pure CSS (transitions + keyframes) für die meisten; einzelne rAF-Loops im JS für scroll-driven 3D-Effekte. Kein GSAP, kein Framer-Motion.
- **3D-Scroll-Engine:** Single rAF in `script.js` (Sektion „SCROLL-3D ENGINE") steuert via CSS-Variablen Laptop-Unfold, Phone-Tilt, Bento-Cards-Entrance, Hero-F-Logo-Y-Rotation und Background-Parallax. Viewport-aware — pausiert wenn Section nicht sichtbar.
- **Performance:** WebP-Frames preloaded für scroll-driven Canvas (Services-Stage). `prefers-reduced-motion` wird global respektiert.
- **A11y:** Skip-Link, semantisches HTML, `aria-label` auf interaktiven Elementen, `prefers-reduced-motion` killt Animations + Marquee.

---

## Branding

- **Brand-Name:** Flow State
- **Founder & Owner:** Benet Tilinski + Adrian Pötzinger
- **Lead Developer:** Damian Braun
- **Email:** flow-state@gmx.de
- **Telefon:** +49 178 1868874
- **Standort:** Deutschland

---

## License

Privat — © Flow State. All rights reserved.
