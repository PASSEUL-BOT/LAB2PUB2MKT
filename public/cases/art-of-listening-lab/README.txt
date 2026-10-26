The Art of Listening: Music Lab (prototype)
===========================================

How to run
1. Unzip this folder.
2. Double-click index.html (Chrome or Edge recommended; Safari and Firefox mostly work).
3. No internet, install, or server is needed. There are no external files.

What is inside
- Built-in Fur Elise (opening theme), played live by real instrument samples, 7 levels, four-line score,
  editable volume and tempo curves, three versions, feedback loop, voice guide.
- "Add real recordings": pick your own audio files (mp3, wav, m4a, ogg).
  They are saved inside the browser (IndexedDB), not inside this folder.

Layout (wide screen, two columns): left = play buttons, levels and controls; right = the band (cartoon instruments), the speed walk (an animal walks along a tempo bar), then notation and sound waves. On narrow screens it becomes one column.
Pieces played live by real instrument samples: Fur Elise (grand piano) and Beethoven's Ode to Joy (violin, cello, clarinet, bassoon). The samples come from the FluidR3 GM sound bank (MIT licence); every edit (key, mode, curves, chords, percussion) still works.

Sounds (level 5)
- Chords: 8 chord sounds (piano oom-pah, cello long chords, violin broken chords, harp glissando, harp arpeggio, celesta sparkle, clarinet pad, rocking piano). Percussion: 10 sounds. Nature: 8 sounds. Fun sounds: kiss, hug, clap, heartbeat, bubbles, chimes. All can be combined.
- 'Read options aloud': pointing at or choosing any option reads its name (uses the browser voice).

Cartoon stage
- Winds are shown as a clarinet and a bassoon. Level 1 offers grand piano, clarinet, bassoon, celesta and violin.
- Sticker book, level mascots with tips, ladybug playhead, and confetti when a piece finishes.
- Each piece has its own scenery (night sky, sunset, candy land, dancing bones, an elephant ballroom, a moonlit lake, a savanna sunset, an underwater world, a troll cave, a prairie at dusk, fireworks over onion domes). A balloon shows loudness (pp to ff) and a tempo animal shows speed (snail to cheetah).
- Under the controls, cartoon instruments pop up when their part enters and bounce with the music.
  Parts that have not entered yet sleep (zzz). Muted parts rest.

Built-in real recordings
- Ravel: Bolero, the build with drums joining (Strings / Winds / Drums stems + original mix).
- Tchaikovsky: Sugar Plum Fairy, the celesta opening (Celesta / Strings / Winds / Percussion stems + original mix).
- Saint-Saëns: Fossils from Carnival of the Animals, the whole piece (Xylophone / Clarinet / Strings / Double bass stems + original mix).
  The two pianos have no stem of their own, so you will hear them inside the other parts.
- Saint-Saëns: The Elephant from Carnival of the Animals, the whole piece (Double bass / Piano stems + original mix).
- Saint-Saëns: The Swan from Carnival of the Animals, the whole piece (Cello / Piano stems + original mix).
- Saint-Saëns: Royal March of the Lion from Carnival of the Animals, the whole piece (Pianos / Strings / Lion roars stems + original mix).
  Lion roars are the rumbling low runs that go up and down near the end (about 1:30 to 1:40).
- Tchaikovsky: 1812 Overture, the finale with cannons (U.S. Marine Band recording, public domain). Two stems split by a simple sound filter: Brass and woodwinds / Cannons, drums and cymbals. Some sound leaks between them; the bells stay mostly in the band stem.
- Saint-Saëns: Aquarium from Carnival of the Animals, the whole piece (Flute and pianos / Strings stems + original mix).
  The flute and the rippling pianos come out in one stem; the shimmering high notes sit mostly in the Strings stem.

Built-in 合成擬真 / realistic synthesis (made from recorded instrument samples; every section on its own clean track)
- Grieg: In the Hall of the Mountain King. Bassoons and plucked cellos and basses start in the dark, then violins, woodwinds, brass and timpani join while the tempo speeds up (Bassoons / Cellos and basses / Violins and violas / Flutes, oboes, clarinets / Horns, trumpets, trombones / Timpani and cymbals).
- Dvořák: New World Symphony, Largo. A soft brass chorale opens, then the famous English horn solo (the "Goin' Home" tune); flute, oboe and clarinet take it next, then the violins with glowing horns, and the English horn returns at the end (Horns, trombones, tuba / English horn / Violins and violas / Cellos and basses / Flute, oboe, clarinet).
  Arranged and played for this lab from the public-domain score; these are not live recordings.
- 合成擬真 versions of The Elephant and Aquarium sit next to their real recordings. Their notes were transcribed by software from the real recording and played again with instrument samples, so every stem is clean. The other recordings did not pass the accuracy check, so they have no 合成擬真 version.
  Stems are software-separated, so a little bleed between parts is normal.
  Pick them from the Music menu. Mixer: mute, solo, volume, and when each part enters.
  Fur Elise uses real grand-piano samples.

Notes
- Voice guide uses the browser's built-in speech voices. Chinese needs a zh-TW voice installed on the device.
- Saved settings and recordings are tied to the browser and to how you opened the file.
  If you move the file or switch browsers, they will not follow. Keep one browser for your library.
- Your own added recordings: only volume curve, tempo curve (pitch preserved) and the nature sound apply.
- Download WAV renders the built-in notes. Record a take plays the music once and saves it (webm/ogg), also for real recordings.
- Downloads work in this ZIP version opened on your computer. The online preview may block them.
- My works (saved projects) live in the browser. Use 'Project file' to move one to another computer.
- MP3 export is not built.

使用方式
1. 解壓縮資料夾。
2. 雙擊 index.html（建議用 Chrome 或 Edge）。
3. 不需要網路、不需安裝，也沒有外部檔案。
4. 「Download WAV」會下載成品音檔；「Record a take」會錄下播放內容。「Save my work」把作品存在瀏覽器的 My works，可匯出成 Project file 帶到別台電腦。
5. 「Add real recordings」加入的音檔存在瀏覽器裡，不在這個資料夾。換瀏覽器或移動檔案位置，資料不會跟著走。


Web-hosting version / 網站版說明
- The built-in recordings (Bolero, Carnival of the Animals, 1812 Overture, etc.) are now separate MP3 files in the audio/ folder
  instead of being embedded in index.html (it was 67 MB, too big for GitHub's 25 MB web upload limit).
- Keep the audio/ folder next to index.html. Open the page through a web address (the website). Double-clicking index.html from a
  local folder may play no sound for these recordings because browsers restrict local files; the 67 MB single-file version still works that way.
- 內建錄音現在是 audio/ 資料夾裡的獨立 MP3 檔，不再塞在 index.html 裡。請讓 audio/ 與 index.html 放在一起，並透過網址開啟。
