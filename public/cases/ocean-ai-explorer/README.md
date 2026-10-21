# Ocean AI Explorer

A colourful, fully **offline** game that shows children aged 8–10 how an AI learns from pictures: it looks at examples, trains,
is tested on pictures it has never seen, makes mistakes, and improves when the child gives it better examples.
The robot **Bubbles** is the AI. The whole interface is in simple English.

> **Read this first – three honest facts**
>
> 1. **The pictures are illustrations, not photographs.** All 1,548 pictures are original cartoon drawings (CC0) made by the
>    program in `tools/`. The build environment could not reach any photo source and the brief forbids pictures with unchecked
>    licenses. See [`IMAGE_SOURCES.md`](IMAGE_SOURCES.md) for counts and for how to add real photos.
> 2. **The AI is small and starts from nothing.** No pretrained photo model could be downloaded, so Bubbles is a neural network
>    written for this game that learns only from what the child teaches it. Its scores are modest, and that is part of the lesson.
> 3. **Reading aloud depends on the computer.** It uses voices already installed on the device and refuses voices that need the internet.

## Play (no internet, no account, no terminal)

| System | Double-click |
|---|---|
| Windows | `START_WINDOWS.bat` |
| Mac | `START_MAC.command` (first time: right-click → Open) |
| Linux | `START_LINUX.sh` |

The launcher starts a tiny web server that only your own computer can reach (`127.0.0.1`) and opens the game in your browser.
It uses **Python 3** (`server/serve.py`) or, if Python is missing, **Node.js** (`server/serve.js`). Neither needs installing any package or
going online. If neither is installed, the launcher opens `index.html` straight from the folder; the game was tested that way too
(see limitations). You can also open `index.html` yourself, or run `python3 server/serve.py`.

Needs a recent Chrome, Edge, Firefox or Safari. Everything the game needs is in this folder: scripts, styles, the AI code,
1,548 pictures, artwork and the picture data. Nothing is downloaded.

## What children do

An ocean map has three levels and a bonus level. Each level follows the same six steps: **LOOK → TEACH → TRAIN → TEST → FIX → AGAIN**.

| Level | Mission | Groups |
|---|---|---|
| 1 Ocean Sorter | Animal or trash? | OCEAN ANIMAL, OCEAN TRASH |
| 2 Ocean Animal Expert | Six animal groups | FISH, MARINE MAMMALS, MOLLUSKS, CRUSTACEANS, CNIDARIANS, ECHINODERMS |
| 3 Ocean Mystery Challenge | Dark, hidden, look-alike pictures | the six above + REPTILES, BIRDS, AMPHIBIANS, WORMS, SPONGES, TRASH, and **UNSURE** (insects and spiders are never taught, so UNSURE is the right answer for them) |
| 4 Animal Classification Lab (bonus) | Family tree, then 13 groups | adds INSECTS and ARACHNIDS; tree shows vertebrates / invertebrates and that crustaceans, insects and arachnids are arthropods |

Level 2 opens after Level 1's test, and so on (a grown-up can open all levels). Habitat labels (`OCEAN`, `COASTAL`, `FRESHWATER`) are shown
so frogs and spiders are never presented as ocean animals.

1. **LOOK** – search and browse the labelled picture library; tap a picture for its facts.
2. **TEACH** – choose the training pictures. Add library pictures, **import your own picture file**, remove pictures, or change a label.
   The game warns about empty groups and lopsided sets.
3. **TRAIN** – `TRAIN MY AI` runs real training and shows the round, examples processed, training/validation loss and accuracy, and a live loss chart.
4. **TEST** – the AI predicts every picture of the **fixed test set** (or the harder **challenge set**) it has never seen. A spot-check deck shows
   Bubbles's guess with its real confidence before the child presses **REVEAL THE ANSWER**. "Try any picture" lets the child test any picture file.
5. **FIX** – the **AI Improvement Lab**: accuracy report, per-group scores, confusion table, a gallery of every wrong answer, the **Mistake Detective**
   and the **AI Coach** (below). Coach pictures can be added with one press.
6. **AGAIN** – retrain, run the same fixed test, and see an honest before/after. Finishing a level needs a real change to the training pictures.

### The AI Improvement Lab (all numbers are measured)

* **Accuracy** = right / total test pictures × 100, with total, right, wrong, UNSURE count, per-group scores, a ~95 % range, and which set was used.
* **Mistake gallery**: picture, correct label, AI prediction, real confidence, a fact ("Detective clue"), and a hedged reason ("One possible reason is...").
* **Mistake Detective**: patterns such as dark pictures, camouflage, look-alikes, missing examples, wrong labels, "very sure but wrong".
  Each card separates **MEASURED** (a count) from **POSSIBLE CLUE** (a guess).
* **AI Coach**: ranked by observed error counts; each idea says the weak spot, what to add, why it *may* help (never a promise), and how to add it, with candidate
  library pictures that are not already in training and never secret pictures.
* **Before/after**: previous vs new accuracy, change in percentage points, fixed vs new mistakes, groups better and worse, and a verdict
  (*better / worse / not clear*) from an exact sign test plus a 2-point minimum. The AI is allowed to get worse and the game says so.

## How the AI works

* **Eyes** (`app/js/features.js`): a fixed bank of image filters turns a 160×160 picture into 1,099 numbers (colour layout, Gabor edge filters,
  colour-edge filters, edge density, a rough shape mask, 64 random convolution filters). Nothing here is trained and no picture id is looked up.
* **Brain** (`app/js/nn.js`): a neural network with one hidden layer of 128 units (ReLU, dropout 0.3) and a softmax output, trained with back-propagation
  and the Adam optimiser (40 rounds, class-weighted cross-entropy, small L2 penalty). Written from scratch so it runs in any browser and in Node. Gradients are checked
  against numerical gradients in the tests.
* **Training** (`app/js/model.js`): uses only the child's chosen pictures, each also mirrored. The final round is kept. (We first tried keeping the round with the lowest validation
  loss, but that picked very early rounds and made scores jump around, so it was removed. In our experiments the new settings were stable across random seeds.)
* **Prediction**: the real class scores come from the network. A level that allows UNSURE answers UNSURE when the top score is below a threshold (0.55 in Level 3, 0.45 in Level 4).
  Confidence wording ("pretty sure", "not sure, just a guess") follows the real score.
* **Saved on the device** (IndexedDB, `app/js/storage.js`): progress, each level's trained network, training choices, test runs (for before/after), imported pictures and
  the cached picture numbers. Storage errors (private windows, full disk) show a kind message; without IndexedDB the game still works but says that nothing is saved.

Typical scores with the default starter pictures on the fixed test set (one run in headless Chromium; training is deterministic, so you get the same numbers):

| Level | Test pictures | Accuracy | Notes |
|---|---:|---:|---|
| 1 Animal / trash | 296 | 79.1 % | 2 groups |
| 2 Six groups | 184 | 64.1 % | |
| 3 Mystery (13 outputs incl. UNSURE) | 344 | 49.7 % | challenge set: 19.2 % |
| 4 Lab (14 outputs incl. UNSURE) | 264 | 54.9 % | |

Adding coach-suggested pictures to Level 1 moved 79.1 % to 84.5 % in one end-to-end test run, and moved it by 0.0 points in another. Both are real results.

## Offline guarantee and how it is checked

* No CDN, remote font, remote image, API, analytics, login or service worker. The app code has no network calls (`fetch`, XHR, WebSocket are absent).
* `index.html` carries a **Content-Security-Policy** (`default-src 'none'`, local files only), so the *browser itself* refuses any web request.
* Pictures are also packed as scripts (`assets/pack/*.js`) so the game works even when opened from `file://`.
* The three header labels are computed, not decorative: **OFFLINE READY** (every resource the page loaded was local), **AI MODEL READY** (a trained brain is loaded for
  this level), **TRAINING DATA READY** (every listed picture was found and opened). Otherwise they turn amber/red with an explanation.
  *Grown-ups → Offline check* re-runs these checks and also opens sample pictures.
* The local servers only serve `index.html`, `app/`, `assets/` and the manifest, bind to `127.0.0.1`, and answer 404 for `tools/`, `tests/` and `../`.

## Project layout

```
index.html                 entry page (strict CSP, local scripts only)
START_WINDOWS.bat / START_MAC.command / START_LINUX.sh
server/serve.py, serve.js  tiny local servers (no packages)
app/js/   config.js (levels, groups, training settings)   dataset.js (manifest, picture loading, search)
          features.js, nn.js (the eyes and the brain)      model.js (training, prediction, leak protection)
          evaluation.js (accuracy, confusion, comparison)  coach.js (Mistake Detective + AI Coach)
          storage.js, state.js (saving)                    voice.js (READ TO ME)
          app.js (shell, home, map, grown-ups, certificate) level.js (look + teach)  train.js (train + test)  report.js (fix + again)
          art.js (Bubbles, icons, reef)   boot.js
app/css/style.css          app/data/data.js (generated), taxonomy.json (groups, categories, facts, look-alikes)
assets/dataset/<split>/<category>/*.jpg   the pictures        assets/pack/*.js   same pictures as data for file:// use
dataset-manifest.json      id, path, label, group, habitat, split, difficulty, tags, look-alike, fact, license, source, hashes
tools/                     picture generator + packers         tests/   unit tests and a browser end-to-end test
```

## Adding more pictures

* **In the game**: TEACH → IMPORT A PICTURE (stays on that computer, only used for that child's training).
* **For everyone**: put JPEGs in `assets/dataset/pool/<category>/`, add records to `dataset-manifest.json` (id, path, label, group, kind, habitat, `"split": "pool"`, tags, fact, license, source, `sha1`, `dhash`),
  record the license in `IMAGE_SOURCES.md`, then run `node tools/build_pack.js` (needs the `sharp` package) to refresh `assets/pack/` and `app/data/data.js`. Never put the same photo (or a crop/resize) in a
  training split and in `validation`/`test`/`challenge`; `npm test` checks hashes, duplicates and splits. Use only pictures you may legally redistribute.

## Tests

```
npm test                      # 49 unit tests, plain Node, no packages (node --test tests/*.test.js)
SHARP_PATH=... npm test       # (optional) also runs the pixel-level duplicate check if `sharp` is installed
npm i -D playwright && npm run test:browser   # ~5 min: real Chromium, real training, requests to the internet blocked
```

Unit tests cover metric calculations, gradients, training really lowering loss, dataset file/hash/label/split integrity, the categories in the brief, level label rules,
leak protection (secret pictures refused), the coach's evidence-based advice and careful wording, and a static "no web address / no network call" scan.
The browser test covers start-up, offline rules, training, testing, the error gallery, coach, importing (including refusing a copy of a secret test picture), retraining, before/after,
all four levels, restart persistence, missing pictures, storage off, voice and the delete confirmations.

## Known limitations

* Illustrations, not photographs (see above). The AI will not recognise real photos reliably; "Try any picture" will still give a real, but often wrong, guess.
* Scores on Levels 3 and 4 are low by design of the small AI and the difficult pictures; the 128-unit network overfits (training accuracy ≫ validation accuracy). Children can see this on the loss chart.
* Training runs in the page and takes roughly 10–30 seconds per level on a normal computer (the page stays usable but the first run also reads every picture). Slower tablets may take longer.
* **Voice**: only installed, local English voices are used. Many computers have one; some (and headless test browsers) have none, and then the game says so and keeps all text on screen. Voice quality varies.
* **file:// mode**: tested in Chromium. Firefox and Safari may refuse to save progress for `file://` pages; the game then warns "SAVING IS OFF". Use the launcher's local server for reliable saving.
* The "offline" test blocked every non-local request and relied on the browser's CSP; it was not done by physically unplugging a network on a separate computer. Chromium was the only browser tested.
* Test runs and brains are stored per browser profile; there is no export.
* **Narration voice.** No audio files and no text-to-speech engine are bundled (none could be built or downloaded offline here). `READ TO ME` uses the English voice already installed on the device, only if the browser marks it as local. The game gives it a lively, child-friendly storytelling style: each sentence is split into phrases with its own pitch, speed and pause (questions rise, cheers are bright and quick, "Oops" is lower and gentler, statements settle down). Bubbles also speaks short reactions after training, testing and before/after when "Read each new screen aloud" is on. The sound of the voice itself differs per device (it is not a real child's recording), and the style can be switched off in Grown-ups > "Lively storytelling voice". Tested with a mocked speech engine, not by listening on every OS.
* **"Voice not available".** The game only uses English voices stored on the device. If the browser lists only online voices (common with some Chrome setups), READ TO ME stays off and says so. Fixes: install an English voice in the computer settings (Windows: Settings > Time & language > Speech; Mac: System Settings > Accessibility > Spoken Content), or a grown-up can tick Grown-ups > "Allow online voices". That option is off by default; when it is on the browser may send the spoken words to its own speech service, so the game is not fully offline while it is on.
* **Starting again.** The Ocean Map has PLAY LEVEL n AGAIN buttons and START A NEW GAME (asks twice); every level screen has PLAY LEVEL AGAIN. Both ask before deleting anything.
