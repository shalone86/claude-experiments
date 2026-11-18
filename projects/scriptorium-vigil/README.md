# The Scriptorium Vigil

A Balatro-style roguelike word game built on Scrabble rules. You're a monk or nun at a candlelit
desk, writing verses into the Book of Life. Each word scores **Ink × Fervor**. Gather enough Grace
to keep each vigil, then spend Merit in the Treasury on stained-glass relics, scrolls and penances.

**Status:** playable prototype for playtesting gameplay. Built phone-first (portrait), with a
landscape layout for wide screens. Original art not added yet.

## Play

Open `scriptorium-vigil.html` in any browser, including on a phone. It's one self-contained file
with the word list built in, so it works offline. The fonts load from Google Fonts and fall back
to plain ones when offline.

### Android APK

`android/` wraps the game in a small fullscreen WebView app (portrait, offline, back button
sends it to the background instead of ending the run). Build a signed debug APK with:

```bash
android/build-apk.sh
```

It rebuilds the HTML first and writes `android/scriptorium-vigil.apk`. It needs Homebrew's
`openjdk@17` and the Android SDK (`platforms;android-34`, `build-tools;34.0.0`); no Gradle or
Android Studio. Each build gets a higher version code, so new APKs install over old ones and
keep unlocks.

### On the web

Live at https://shalonely.com/scriptorium/ (APK at `/scriptorium/ScriptoriumVigil.apk`). It's its
own Cloudflare Worker, `scriptorium-vigil`, routed at `shalonely.com/scriptorium*`, so it doesn't
touch the daily-beats site. To publish a new build:

```bash
web/deploy.sh
```

It builds the HTML and APK, copies them into `web/public/scriptorium/`, and runs `wrangler deploy`
(you need to be logged in to wrangler).

## Edit

The game source is `src/game.src.html`. The word list is packed separately, so after editing, rebuild:

```bash
python3 build.py
```

This writes `scriptorium-vigil.html` with the word list injected.

| File | What it is |
|---|---|
| `scriptorium-vigil.html` | The built, playable game |
| `src/game.src.html` | Game source: HTML, CSS and JavaScript |
| `src/lexicon.packed.txt` | Word list, prefix-packed |
| `src/encode_lexicon.py` | Packs a plain word list (one word per line) into `lexicon.packed.txt` |
| `src/audio/loopA–F.mp3` | Music loops, embedded at build time |
| `build.py` | Injects the word list and music into the source to make the playable file |

## Rules in brief

- **Words:** Scrabble rules. 2+ letters, checked against the ENABLE word list (public domain,
  ~168,000 words) plus newer two-letter words like QI and ZA. A, I and O are allowed as one-letter
  Monads: weak at first (15 × 1, like a high card), built up by the Codex and Monad relics. Blanks are wild and score 0.
- **Scoring:** the verse type (by tile count, Monad to Pentad) sets base Ink × Fervor. Tiles add
  Ink, and relics fire left to right. Gilt, Lapis and Rubric squares on the page multiply Ink.
- **Trading:** tap Trade, mark the tiles you want gone, then confirm (like a Scrabble exchange).
- **Never stuck:** any unbroken line can be inscribed. A non-word, or a word the Audit forbids,
  scores 0 but uses a verse and clears those tiles. End a run from the Menu.
- **Run:** 7 terraces of 2 vigils plus a boss Audit each, then endless mode. 20 bosses rotate (plus 2 Monad bosses, below):
  all appear before any repeats. Some change the Grace target (Single Stroke ×0.5, Heavy Tome ×2…).
- **Retriggers & copies:** red seals, Choir of Seraphs and the Lone Dove make tiles score again.
  The Antiphonal Echo makes the relic on its right fire twice, and Echoes chain (×2, ×4, ×16).
  The Copyist scroll copies tiles, Translation of Relics copies relics, and the Exemplar lets the
  shop sell relics you own. Glass seals give ×2 Fervor but may shatter (the letter stays).
- **Huge scores:** past a quadrillion they show as 1.23e15; past the largest number JavaScript
  holds, Grace is ∞ and the run ends in Beatitude. The Seventh Trumpet (Fervor to the power 1.3, unlocked by winning) plus
  chained Echoes is the route there.
- **Wards against the Audit:** rare relics and a scroll that only help against bosses, never adding
  Ink or Fervor. Saint Michael's Shield (Legendary) cancels every Audit. The Papal Dispensation scroll
  lifts the current one. The Intercessor lowers Audit Grace ×0.6. A Letter of Safe Conduct makes one
  verse length immune. The Litany of Vowels makes vowels immune, and the Alchemist's Crucible turns
  lead into blanks.
- **Beatitude:** a verse worth ∞ Grace breaks the game: shaking, light, fanfare, then the Beatific
  Vision ending. The run ends there as a win.
- **Speed:** Menu → Game speed, 1 to 5. It shortens the scoring and transition pauses. Saved on the device.
- **Penances:** one is offered per shop visit (a reroll keeps it), and each can be taken again and
  again. Each gives Fatigue (8% less Ink per point, max 50%; the Anchorite's Screen halves it) and a
  lasting cost: Hairshirt (consonants +1× Ink, rack −1), Nocturnal Vigil (candle +20%, −1 trade),
  Discipline (+0.5× Fervor per verse, −1 verse), Vow of Silence (+5 Fervor, −1 trade), Great Fast
  (burn 4 tiles, +$6, −1 verse next vigil), Cilice (Codices +1, Grace +15%). Trade penances are unavailable at 0 trades.
  At 0 verses, 0 rack or an empty bag the run ends (the game asks twice first). Purging has no floor.
- **Monad bosses:** play 4 Monads in one terrace (`MONAD_HEAT`) and its Audit becomes The Empty Bowl
  (each Monad takes all Merit) or The Iconoclast (each Monad smashes a relic), both Grace ×1.5.
  They never appear otherwise.
- **Tooltips show live values:** scaling relics show what they give right now, plus candle, Psalter and
  Echo effects on their slot. Tap a tile in the bag to see its seal.
- **Shop odds:** each relic is weighted by rarity (Common 4, Uncommon 3, Neighbor 3, Ascetic 2,
  Rare 2, Legendary 0.6), with no gating by terrace. See `RARITY_W`.
- **Tooltips:** hover (mouse) or tap (touch) a satchel, shop card or desk relic for a longer
  explanation.
- **Music:** loops A–G in `src/audio/` (A title, G gameplay, B shop, C Audit, F endless; D and E are swells).
  Optional `loopH` (win screen), `loopI` (lose screen) and `loopJ` (Beatitude) loop there when present, embedded at build time (see ASSETS.md).
- **Spectacle:** a censer swings across the page only when one word clears the whole vigil.
  The title, victory and defeat screens each have the Guardian Angel speaking. Play, shop and
  boss each have their own colours (amber desk, verdigris vault, blood red).

- **Seeds:** every run has a 7-character seed (Menu and end screens). Type one on the title
  screen to replay the same draws, shops, bosses and squares. Separate random streams mean
  shop rerolls never change your tile draws.
- **Unlocks:** start with the Novice's Satchel and 31 relics. 5 satchels and 9 relics unlock
  through play (Collection screen lists the conditions). Saved on the device in localStorage.
  Seeded runs don't unlock anything.

Art, music and sound still to make: see [ASSETS.md](ASSETS.md).

## Playtest notes / next tweaks

- Difficulty, tuned one change at a time:
  1. Grace scales per terrace (×1, 2.2, 5, 10, 20, 38, 70) on vigils of 300 / 600 / 1,000,
     all ×1.25 (`GRACE_BASE`, from phone playtests), so Terrace I is 380 / 750 / 1,250.
     Menu → Grace needed (50–150%) scales every target on top of that, saved on the device. Endless climbs by ever-bigger powers
     of ten: Audit Grace ≈ 8M, 500M, 80B, 30T, 3e16, 8e19… (`terraceMult`).
  2. Less Merit: vigil rewards 3/3/4/5 (were 4/5/6/8), unspent-verse bonus capped at $2,
     interest capped at $3 (was $5). Tunable in `ECON` and `STAGES` in `src/game.src.html`.
  - Still to try if needed: pricier shops, then lower scoring.
- Original art: relics and scrolls use emoji placeholders for now.
