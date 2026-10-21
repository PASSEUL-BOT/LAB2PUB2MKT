# Image sources and licenses

## What the pictures are

**All 1548 pictures in this game are original cartoon-style illustrations drawn by the program `tools/generate_dataset.py`
(with `tools/art/*.py`). They are _not_ photographs.** Each picture is drawn from its own random seed, so no picture is a resized,
cropped or lightly edited copy of another one.

The build environment for this game could not reach any photo source (Wikimedia Commons, iNaturalist, Flickr and similar sites were
blocked), and the brief forbids using pictures whose license has not been checked. So instead of bundling photographs with an unknown
license, the library uses illustrations that can be freely redistributed.

* **License:** CC0 1.0 (public domain dedication) for every picture, the drawing code and the data files made for this game.
  Each record in `dataset-manifest.json` has `"license": "CC0-1.0"` and `"source"`.
* **No third-party material:** no photo, clip-art, font, icon or model weight from anyone else is included.
* **Rebuild:** `python3 tools/generate_dataset.py && node tools/build_pack.js` re-creates the pictures. We tested this: all 1548 files came out
  byte-for-byte identical (same SHA-1).

### Honest limitation

Illustrations are much simpler than photographs. A score on these pictures says little about how the same AI would do on real photos.
A real photo library should be added by a teacher (see "Adding more pictures" in `README.md`). Only add pictures whose license allows it,
and record them in this file.

## Image counts

How the pictures are split (a picture is in exactly one split):

| Split | Pictures | Purpose |
|---|---:|---|
| train | 344 | The starter training set that every level begins with. Children may remove or relabel these. |
| pool | 516 | Extra library pictures children can browse and **add** to training (includes tricky and look-alike cases). |
| validation | 172 | Secret. Only used to show a "validation loss" while training. Never trained on. |
| test | 344 | Secret. The fixed test set that scores every AI. Never trained on. |
| challenge | 172 | Secret. An extra, harder test set. Never trained on. |
| **all** | **1548** | |

The game refuses to train on validation, test or challenge pictures (`app/js/model.js`, tested in `tests/leak.test.js`).

Tricky-picture tags in the library (a picture can have several): camouflage 135, distant 140, low_light 145, partially_hidden 137, similar_shape 104, transparent 20, unusual_angle 136.

### Pictures per category and split

| Category | Group | Habitat | train | pool | validation | test | challenge | all |
|---|---|---|---:|---:|---:|---:|---:|---:|
| Clownfish | Fish | OCEAN | 8 | 12 | 4 | 8 | 4 | 36 |
| Shark | Fish | OCEAN | 8 | 12 | 4 | 8 | 4 | 36 |
| Seahorse | Fish | OCEAN | 8 | 12 | 4 | 8 | 4 | 36 |
| Stingray | Fish | OCEAN | 8 | 12 | 4 | 8 | 4 | 36 |
| Tuna | Fish | OCEAN | 8 | 12 | 4 | 8 | 4 | 36 |
| Eel | Fish | OCEAN | 8 | 12 | 4 | 8 | 4 | 36 |
| Dolphin | Marine Mammals | OCEAN | 8 | 12 | 4 | 8 | 4 | 36 |
| Whale | Marine Mammals | OCEAN | 8 | 12 | 4 | 8 | 4 | 36 |
| Seal | Marine Mammals | OCEAN | 8 | 12 | 4 | 8 | 4 | 36 |
| Sea lion | Marine Mammals | OCEAN | 8 | 12 | 4 | 8 | 4 | 36 |
| Octopus | Mollusks | OCEAN | 8 | 12 | 4 | 8 | 4 | 36 |
| Squid | Mollusks | OCEAN | 8 | 12 | 4 | 8 | 4 | 36 |
| Clam | Mollusks | OCEAN | 8 | 12 | 4 | 8 | 4 | 36 |
| Sea snail | Mollusks | OCEAN | 8 | 12 | 4 | 8 | 4 | 36 |
| Crab | Crustaceans | OCEAN | 8 | 12 | 4 | 8 | 4 | 36 |
| Lobster | Crustaceans | OCEAN | 8 | 12 | 4 | 8 | 4 | 36 |
| Shrimp | Crustaceans | OCEAN | 8 | 12 | 4 | 8 | 4 | 36 |
| Jellyfish | Cnidarians | OCEAN | 8 | 12 | 4 | 8 | 4 | 36 |
| Coral | Cnidarians | OCEAN | 8 | 12 | 4 | 8 | 4 | 36 |
| Sea anemone | Cnidarians | OCEAN | 8 | 12 | 4 | 8 | 4 | 36 |
| Sea star | Echinoderms | OCEAN | 8 | 12 | 4 | 8 | 4 | 36 |
| Sea urchin | Echinoderms | OCEAN | 8 | 12 | 4 | 8 | 4 | 36 |
| Sea cucumber | Echinoderms | OCEAN | 8 | 12 | 4 | 8 | 4 | 36 |
| Sea turtle | Reptiles | OCEAN | 8 | 12 | 4 | 8 | 4 | 36 |
| Sea snake | Reptiles | OCEAN | 8 | 12 | 4 | 8 | 4 | 36 |
| Shore bird | Birds | COASTAL | 8 | 12 | 4 | 8 | 4 | 36 |
| Frog | Amphibians | FRESHWATER | 8 | 12 | 4 | 8 | 4 | 36 |
| Toad | Amphibians | FRESHWATER | 8 | 12 | 4 | 8 | 4 | 36 |
| Salamander | Amphibians | FRESHWATER | 8 | 12 | 4 | 8 | 4 | 36 |
| Marine worms | Worms | OCEAN | 8 | 12 | 4 | 8 | 4 | 36 |
| Sea sponge | Sponges | OCEAN | 8 | 12 | 4 | 8 | 4 | 36 |
| Coastal insect | Insects | COASTAL | 8 | 12 | 4 | 8 | 4 | 36 |
| Spider | Arachnids | COASTAL | 8 | 12 | 4 | 8 | 4 | 36 |
| Plastic bottle | Ocean Trash | OCEAN | 8 | 12 | 4 | 8 | 4 | 36 |
| Plastic bag | Ocean Trash | OCEAN | 8 | 12 | 4 | 8 | 4 | 36 |
| Fishing net | Ocean Trash | OCEAN | 8 | 12 | 4 | 8 | 4 | 36 |
| Fishing line | Ocean Trash | OCEAN | 8 | 12 | 4 | 8 | 4 | 36 |
| Plastic straw | Ocean Trash | OCEAN | 8 | 12 | 4 | 8 | 4 | 36 |
| Food wrapper | Ocean Trash | OCEAN | 8 | 12 | 4 | 8 | 4 | 36 |
| Aluminum can | Ocean Trash | OCEAN | 8 | 12 | 4 | 8 | 4 | 36 |
| Glass bottle | Ocean Trash | OCEAN | 8 | 12 | 4 | 8 | 4 | 36 |
| Old fishing gear | Ocean Trash | OCEAN | 8 | 12 | 4 | 8 | 4 | 36 |
| Other marine debris | Ocean Trash | OCEAN | 8 | 12 | 4 | 8 | 4 | 36 |
| **All categories** | | | **344** | **516** | **172** | **344** | **172** | **1548** |

Frogs, toads and salamanders are labelled `FRESHWATER`; the shore bird, coastal insect and spider are labelled `COASTAL`.
They are in the library to teach animal groups, not because they are ocean animals.

## Pictures children import

Pictures a child imports in the game stay on that computer (IndexedDB). They are never uploaded and are not part of this repository.
The importer asks the child to confirm that the picture is theirs or that a grown-up allows it.
