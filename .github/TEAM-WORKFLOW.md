# Team-Workflow — yourflowstate.de Redesign

Zwei Leute, ein Branch, keine verlorene Arbeit.

## Die Lage

- **Repo:** `adamanm780-dotcom/flowstate-website`
- **Arbeits-Branch:** `redesign` ← hier arbeiten wir beide
- **`main`** = die Live-Website. Ein Push auf `main` startet automatisch den
  Deploy auf IONOS (yourflowstate.de). **Nie direkt auf `main` arbeiten.**
- Solange wir auf `redesign` sind, kann nichts live kaputtgehen.

## Erststart auf einem neuen Rechner

1. Git installieren: https://git-scm.com/download/win
   Danach **PowerShell einmal komplett schliessen und neu oeffnen** — sonst
   kennt sie den Befehl `git` noch nicht.
2. Eigenen Commit-Namen setzen (siehe Abschnitt oben).
3. Repo holen — mit dem Zugriffs-Token, den du bekommen hast:
   ```
   git clone https://<TOKEN>@github.com/adamanm780-dotcom/flowstate-website.git
   cd flowstate-website
   git checkout redesign
   ```
   `<TOKEN>` durch den echten Token ersetzen (die spitzen Klammern weg).
   Der Token wird lokal gespeichert, du musst ihn nur einmal eingeben.

## Setup: ein GitHub-Account, zwei Rechner

Wir pushen beide über denselben Account (`adamanm780-dotcom`). Damit man
trotzdem sieht, **wer** was geändert hat, setzt jeder auf seinem Rechner
EINMALIG seinen eigenen Commit-Namen:

```
git config --global user.name "Dein Vorname"
```

Die E-Mail bleibt bei beiden `adamanm780@gmail.com` — nur der Name
unterscheidet sich. Danach zeigt `git log` sauber, von wem jeder Commit ist:

```
git log --oneline --format="%h %an — %s" -10
```

## Die eine Regel, die alles rettet

**Vor JEDEM Push: erst ziehen, dann pushen.**

```
git pull --rebase
git push
```

`--rebase` setzt deine Änderungen sauber oben auf die des anderen drauf.
Nichts wird überschrieben, nichts geht verloren.

## Der tägliche Ablauf

**1. Arbeit beginnen — holen, was der andere gemacht hat**
```
git checkout redesign
git pull --rebase
```

**2. Arbeiten** — an deinen Dateien / deiner Sektion.

**3. Zwischenspeichern und hochladen** (gern mehrmals am Tag, nicht nur abends)
```
git add -A
git commit -m "Hero-Sektion: neues Layout"
git pull --rebase
git push
```

**4. Sehen, was der andere geändert hat**
```
git log --oneline -10
git log -p -1          # letzte Änderung im Detail anschauen
```

## Wenn es doch mal knallt (Merge-Konflikt)

Passiert nur, wenn ihr **dieselben Zeilen derselben Datei** geändert habt.
Git meldet dann `CONFLICT`. So löst du es:

```
git status                  # zeigt die betroffene Datei
```
Datei öffnen. Du siehst:
```
<<<<<<< HEAD
   ... Version des anderen ...
=======
   ... deine Version ...
>>>>>>> deine-aenderung
```
Beide Blöcke anschauen, das Richtige stehen lassen, die drei Markierungszeilen
(`<<<<<<<`, `=======`, `>>>>>>>`) löschen. Dann:
```
git add <datei>
git rebase --continue
git push
```

Im Zweifel: **kurz beim anderen nachfragen**, statt seine Zeilen wegzuwerfen.

Notausstieg, wenn du dich verrannt hast (deine letzten Commits bleiben erhalten):
```
git rebase --abort
```

## Konflikte von vornherein vermeiden

- **Vorher absprechen, wer welche Sektion macht.** Das ist die wichtigste Regel.
- Oft pushen (kleine Commits) statt einmal am Abend einen riesigen.
- Beim Redesign schneiden wir CSS/JS in Sektions-Dateien
  (`css/hero.css`, `css/leistungen.css` …), damit ihr nicht in derselben
  Datei sitzt.

## Wenn eine Sektion fertig ist

Nichts tun — sie bleibt auf `redesign`. Erst wenn das **komplette Redesign**
fertig und abgenommen ist, geht `redesign` → `main` und damit live.
