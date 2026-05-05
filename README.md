# Prüfungsvorbereitung SoSe 2026 - PDF Dashboard

Ein helles, modernes Dashboard für Prüfungsvorbereitungs-PDFs, bereitgestellt als statische HTML-Website, ideal für GitHub Pages. 

Dieses Tool nimmt lokale PDFs aus Semester-Ordnern, generiert saubere, optimierte Links, komprimiert die PDFs zu ZIP-Archiven und stellt alles auf einer durchsuchbaren Webseite dar.

## Ordnerstruktur

- `index.html` - Hauptseite (Einstiegspunkt)
- `css/styles.css` - Design und Layout
- `js/script.js` - Frontend-Logik (Rendern, Suchen, Filtern, Vorschau)
- `tools/generate_pdf_index.py` - Das Python-Skript zum Automatisieren der Updates.
- `pdfs/` - (Wird vom Skript generiert) Enthält bearbeitete PDF-Dateien.
- `data/pdfs.json` - (Wird vom Skript generiert) Informationskatalog aller PDFs für das Frontend.
- `downloads/` - (Wird vom Skript generiert) Enthält bereist geschnürte ZIP-Archive je Fach und ein globales ZIP-Archiv.

## So fügst du neue PDFs hinzu
1. Lege deine neuen PDFs in deinem Google Drive-Ordner im jeweiligen Fachordner ab (z. B. `01.02 Analyse 2 Prüfungsvorbereitung PDFs`).
2. Das war's in diesem Schritt. Das Skript holt sich die PDFs von dort automatisch.

## Website aktualisieren (Skript ausführen)
Immer, wenn du Änderungen oder neue PDFs in deinen Ordnern hast, musst du dieses Skript ausführen, um die Website auf den neuesten Stand zu bringen:

```bash
python3 tools/generate_pdf_index.py
```
Dies durchläuft die Verzeichnisse, kopiert und bereinigt Dateinamen, erstellt ZIPs und generiert `data/pdfs.json`.

## Lokal Testen
Da lokale Browser JavaScript `fetch` aus Sicherheitsgründen oft für "file://"-URLs blockieren, empfehlen wir einen lokalen HTTP-Server zu starten.

1. Starte den Server im Hauptverzeichnis des Repositories:
   ```bash
   python3 -m http.server 8000
   ```
2. Öffne deinen Browser und gehe auf:
   [http://localhost:8000](http://localhost:8000)

## Auf GitHub veröffentlichen
1. Füge alle Änderungen zum Commit hinzu:
   ```bash
   git add .
   ```
2. Erstelle einen Commit:
   ```bash
   git commit -m "Update exam preparation PDFs"
   ```
3. Lade die Änderungen hoch:
   ```bash
   git push origin main
   ```
   *(Falls dein Standard-Branch anders heißt, ändere `main` zu deinem Branchnamen)*

## GitHub Pages aktivieren
Nachdem du dein Repository hochgeladen hast, kannst du die Website live schalten:
1. Gehe in deinem Repository auf GitHub auf **Settings** (Einstellungen).
2. Gehe in der linken Seitenleiste auf **Pages**.
3. Bei "Build and deployment" wähle unter "Source" die Option **Deploy from a branch**.
4. Wähle als Branch **main** und als Verzeichnis **/(root)**.
5. Klicke auf **Save**.

Es kann ein paar Minuten dauern, bis GitHub deine Seite baut.

## Deine öffentliche URL
Sobald die Seite deployed ist, wird sie unter dem folgenden Link erreichbar sein:
`https://pashkinzon.github.io/pruefungs_vorbereitung_sose26_v2/`
