# Tile Forge

A casual-friendly yet deep "Scrabble Balatro" word roguelike spun out from *The Scriptorium Vigil*. Place tiles onto the 5-slot candlelit line, spell any valid Scrabble word for a single **Word Score**, and upgrade letters **Letter-Wide** in the Shop so every copy of a letter in your bag powers up together.

**Status:** Playable web prototype live on desktop and portrait mobile (`100dvh` no-scroll play screen).

## Play Online

Live at **https://shalonely.com/tileforge/** (served via its own Cloudflare Worker `tile-forge` on `shalonely.com/tileforge*`, separate from `shalonely.com/scriptorium/`).

### Local Build

```sh
python3 build.py
```

This bundles `src/template.html`, `src/styles.css`, `src/core.js`, `src/tile_forge.js`, and `src/lexicon.packed.txt` into standalone `index.html` and `tile-forge.html` files that work offline in any browser.

### Publish to Cloudflare

```sh
sh web/deploy.sh
```

Builds `tile-forge.html`, copies it to `web/public/tileforge/index.html`, and runs `wrangler deploy`.

## Reading the forges

Every forge is a glyph: what it does, plus an arrow toward the tile it hits. Hover (desktop) or tap
(phone) a card for the full explanation.

| Glyph | Means |
|---|---|
| `×2` | this tile scores ×2 (no arrow = itself) |
| `◀×2` / `×2▶` | the tile to the left / right scores ×2 |
| `◀×2▶` | the whole word scores ×2 (both arrows = everything) |
| `+40`, `◀+30` | extra points, on itself or a neighbour |
| `↻` | scores one extra time |
| flame | brings candlelight (×3) to a slot |

Colours: blue points, red multiply, purple replay, gold light and money, green combos, clones and wilds.

**Candlelight:** a real candle sits over one slot (×3) and moves after every word; the slots beside
it glow warm (×2). Empty slots show their multiplier, and every flame flickers on its own rhythm.

## Screens and first-time tips

- **Home screen** with your best word and highest terrace (saved on the device), **win** (Ascended),
  **lose** (The Forge Goes Cold) and **endless end** (The Climb Ends) screens, in the style of
  *The Scriptorium Vigil*.
- **One-word clears:** when a single word covers the whole goal, the choir swells and a censer swings
  across the screen. Ordinary clears just chime.
- **Seeing a tile's forges:** hover it (desktop) or press and hold it (phone). Tooltips colour the key
  words: red multiply, blue points, orange light, purple replay, gold money, green wild and copy.
- **Strongest** in the shop's letter grid sorts your letters by a rough strength score (points through
  every forge), so you can see what to build next.
- **First-time tips** light up where to tap, once each: the rack, playing a word, the candle, holding a
  tile, picking an upgrade, forging a letter, and the first Audit. Menu → "Show first-time tips again"
  resets them. They live in `src/scenes.js`.

## Sound

Music and effects come from *The Scriptorium Vigil* (`src/audio/loopA/B/C/D/E/G.mp3`, embedded by
`build.py`): A on the home screen, G while playing, B in the Forge, C during Audits, D when one word clears the whole goal and E when
you run out of words. Menu → Sound has Music and Effects sliders, saved on the device.

## Core Mechanics

- **Letter-Wide Forging:** Shop cards upgrade **ALL copies** of a letter in your bag (grouped as `×N` Letter Stacks on the Workbench). Mix `+Score`, `Multiply`, `Replay`, stackable `Candlelight` (`WARM ×2`, `BRIGHT ×3`, `BLAZING ×6+`), `Clone`, `Forge Combo` (digraphs/trigraphs), and `Wild` upgrades.
- **31 Rarity-Tiered Upgrades:** `Common`, `Uncommon`, `Rare`, and `Legendary` (`Word ^1.25`), plus Workbench thinning (`🔥 Burn Tile`, `📑 Clone +1`, `🔗 Fuse 2 Tiles`).
- **Wilds & Clones:** Max `2` Wild `?` tiles per run. Wilds keep their forges (a Wild `?` can't take new ones, and neighbours can't retrigger it). A letter can carry one wild forge (`◀?` or `?▶`), on top of any other forges; a tile made wild during play keeps its forges but can't make its own neighbour wild, so wilds don't chain. Every clone, paid ($11) or from a ⧉ forge, copies the tile with all its forges; the anti-spam Audits keep that in check.
- **7 Terraces × 15 Audits + Anti-Spam Audits:** Each Terrace plays Vigil I → Vigil II → Audit, unlocking Endless mode after Terrace 7 (hitting `∞ Beatitude` ends the run). Playing the same word `>= 3` times (`Index Expurgatorius`) or relying on the same tile `>= 7` times (`Censored Glyph`) schedules a targeted Audit against that spam.
- **Live Goal Scale (`10%`–`200%`) & 6 Stakes:** Open `⚙ Menu` to adjust the live goal multiplier anytime or challenge cumulative Stakes (`White`, `Red`, `Green`, `Blue`, `Purple`, `Gold`).
- **Word Definition Preview:** Displays a 1-line truncated dictionary definition beside the angel judgement badge when a valid word is formed.

## Files

| File | Purpose |
|---|---|
| `src/template.html` | HTML shell with bundled inline mount targets |
| `src/styles.css` | Candlelit desk, verdigris shop, menu modal, and mobile `100dvh` CSS |
| `src/audio.js` | Sound effects and music (shared with The Scriptorium Vigil) |
| `src/audio/` | Music loops, embedded at build time |
| `src/scenes.js` | Home, win, lose and endless-end screens, the censer, and first-time tips |
| `src/core.js` | ENABLE lexicon unpacker, goal scaling, 15 Audits + anti-spam Audits, Candlelight, `DICT_DEFS` |
| `src/tile_forge.js` | Tile Forge gameplay engine, 31 upgrades, 6 Stakes, drag-and-drop, and Shop UI |
| `src/lexicon.packed.txt` | Prefix-packed ~168k ENABLE Scrabble lexicon |
| `build.py` | Bundles source files into standalone `index.html` and `tile-forge.html` |
| `web/wrangler.jsonc` | Cloudflare Workers static-asset config for `shalonely.com/tileforge*` |
| `web/deploy.sh` | Build + publish script to Cloudflare Workers |
