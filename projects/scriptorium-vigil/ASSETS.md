# The Scriptorium Vigil — Art, Music & Sound Checklist

Everything the game currently draws with emoji, CSS or synthesized beeps, listed so it can be
replaced with original work. Tick items off as they're made.

**Sizes** are suggestions at 2× the game's on-screen size (the game is laid out on a 400-px-wide
portrait canvas). Use PNG with transparency for objects and WebP/JPG for full backgrounds.
**File names** are suggestions so art can later be dropped into an `assets/` folder and wired in.

---

## 1. Visual themes (palette per screen)

Each screen has its own mood so the player always knows where they are. Art for each screen
should sit inside its palette.

| Screen | Mood | Key colours |
|---|---|---|
| Vigil (normal play) | Candlelit oak desk at night | Amber glow, dark walnut `#2c1a0e`, vellum `#f2e6c9` |
| Treasury (shop) | Cool stone vault, gold light from above | Verdigris `#16433c`, gold `#d3a23b` |
| The Audit (boss) | Judgement, scorched, ominous | Blood red `#5a140c`, black leather, ember orange |
| Title | Quiet beginning, single candle | Warm brown, gold lettering |
| Victory (Ascended) | Heaven, light pouring down | White, pale gold `#f4d886`, sky blue `#7f9ccf` |
| Defeat (Candle Gutters) | Ash, penance, cold | Slate `#1b2029`, ash grey `#aeb8c8` |
| Beatitude (∞ Grace ending) | The face of God as pure light; blinding, overwhelming joy | White core, pale gold `#fffbe8`, deep gold `#c98a2a` |
| Endless ends (The Vigil Ends) | Evensong twilight, stars | Indigo `#0d1030`, violet `#6a3f78`, horizon gold |
| Throughout | Ink vs Fervor | **Ink = lapis blue** `#1f4fa3`, **Fervor = vermilion red** `#b5301c` |

- [ ] Style guide sheet (palette, line weight, how gold leaf and stained glass are rendered)

---

## 2. Characters

- [ ] **Guardian Angel**: idle (gentle hover), ~240×240 · `angel_idle.png`
- [ ] Angel speaking / approving (valid word, victory) · `angel_pleased.png`
- [ ] Angel disappointed (invalid word) · `angel_frown.png`
- [ ] Angel sorrowful, dimmed (defeat screen) · `angel_sorrow.png`
- [ ] Angel radiant (victory, glowing) · `angel_radiant.png`
- [ ] **The Beatific Vision** (∞ Grace ending): the face of God, most likely as light rather than a figure, with a ring of six-winged seraphim. Full-screen, portrait, ~1080×1920 · `scene_beatific.png` (now drawn in code: a white core, rotating rays, seraph and star rings, falling sparks)
- [ ] *(optional)* The scribe, monk and nun versions: hands with quill at the desk, or a portrait for the title

---

## 3. Relics: 40 stained-glass windows

Shown in a pointed-arch (lancet) window. Desk size ~100×132, shop card ~112×140; one piece at
**256×320** covers both. Border colour follows rarity: Common verdigris, Uncommon lapis,
Rare violet, Neighbor gold, Ascetic crimson, Legendary bright gold.

**Lighting is done in code, so draw each relic once, fully opaque, at normal daylight
brightness.** The game dims the two outer desk slots, leaves slots 2 and 4 near normal and
brightens the centre slot with a warm glow. It darkens everything when the Snuffed Candle boss
blows the flame out. Don't bake light or shadow into the art, and don't use transparency for
shading. Keep transparency only for the shape outside the arch. Optional extra: one shared
soft glow sprite to sit behind the centre relic (`fx_candle_glow.png`).

**Starting set (16)**
- [ ] The Psalter (Neighbor) · `relic_psalter.png`
- [ ] Anchorite's Screen (Neighbor) · `relic_screen.png`
- [ ] Choir Diptych (Neighbor) · `relic_diptych.png`
- [ ] Widow's Cruse (Common) · `relic_cruse.png`
- [ ] Fisher's Net (Common) · `relic_net.png`
- [ ] The Cornerstone (Uncommon) · `relic_corner.png`
- [ ] Censer of Smoke (Common) · `relic_censer.png`
- [ ] The Cloister Bell (Rare) · `relic_bell.png`
- [ ] Rose Window (Rare) · `relic_rose.png`
- [ ] Reliquary of Jerome (Uncommon) · `relic_jerome.png`
- [ ] Illuminated Gradual (Uncommon) · `relic_gradual.png`
- [ ] Penitent's Scourge (Ascetic) · `relic_scourge.png`
- [ ] Rubricator's Brush (Uncommon) · `relic_brush.png`
- [ ] Ascetic's Quill (Common) · `relic_quill.png`
- [ ] Gemini Bestiary (Rare) · `relic_bestiary.png`
- [ ] Tithe Box (Common) · `relic_tithe.png`

**Unlockable (8)**
- [ ] Lantern of the Rare (Uncommon) · `relic_lantern.png`
- [ ] Book of Hours (Uncommon) · `relic_hours.png`
- [ ] The Hourglass (Uncommon) · `relic_hourglass.png`
- [ ] Holy Water Font (Uncommon) · `relic_font.png`
- [ ] Alms Bowl (Common) · `relic_alms.png`
- [ ] Paschal Candle (Rare) · `relic_paschal.png`
- [ ] Scribe's Inkhorn (Rare) · `relic_inkhorn.png`
- [ ] Mirror of Saints (Rare) · `relic_mirror.png`

*Retriggers & copies*
- [ ] Antiphonal Echo (Rare) · `relic_echo.png`
- [ ] Choir of Seraphs (Uncommon) · `relic_seraphs.png`
- [ ] The Lone Dove (Uncommon) · `relic_dove.png`
- [ ] Scribe's Copybook (Uncommon) · `relic_copybook.png`
- [ ] The Exemplar (Common) · `relic_exemplar.png`
- [ ] The Seventh Trumpet (Legendary, unlockable) · `relic_trumpet.png`

*Verse-type relics*
- [ ] The Twin Cherubim (Diads) · `relic_cherubim.png`
- [ ] Trefoil Window (Trinities) · `relic_trefoil.png`
- [ ] The Tetramorph (Tetrads) · `relic_tetramorph.png`
- [ ] Basket of Loaves (Pentads) · `relic_loaves.png`
- [ ] Bede's Chronicle (grows with long words) · `relic_bede.png`
- [ ] Wards (help only against the Audit; consider a shared silver or white border so they read as a set):
  - [ ] Saint Michael's Shield (Legendary: Audits have no effect) · `relic_shield.png`
  - [ ] The Intercessor (Audits need less Grace) · `relic_intercessor.png`
  - [ ] Letter of Safe Conduct (one verse length ignores Audits; the length shows as text) · `relic_conduct.png`
  - [ ] Litany of Vowels (vowels ignore Audits) · `relic_litany.png`
  - [ ] Alchemist's Crucible (lead tiles become blanks) · `relic_crucible.png`
- [ ] "LIFTED" stamp for the Audit plate when a ward or Dispensation cancels it · `ui_lifted.png`
- [ ] Echo badge (↻ fires ×N) and Veiled overlay · `badge_echo.png`, `fx_veil.png`

- [ ] Locked-relic silhouette (Collection screen) · `relic_locked.png`
- [ ] Empty desk slot (plain arch) and candle-lit slot variant · `slot_desk.png`, `slot_candle.png`

---

## 4. Scrolls: 17 consumables

Rolled parchment with an emblem. Desk ~76×132, shop ~92×116; one piece at **192×256** covers both.

- [ ] Codex scroll: 5 variants or one book with a numeral I–V · `scroll_codex_1..5.png`
- [ ] Gold Seal (Matthew) · `scroll_seal_gold.png`
- [ ] Glass Seal (Clare) · `scroll_seal_glass.png`
- [ ] Red Seal (Benedict) · `scroll_seal_red.png`
- [ ] Cinnabar Seal · `scroll_seal_cinnabar.png`
- [ ] Scroll of Binding (makes combo tiles) · `scroll_binding.png`
- [ ] Palimpsest (+2 trades) · `scroll_palimpsest.png`
- [ ] Antiphon (+1 verse) · `scroll_antiphon.png`
- [ ] Blank Vellum (adds a blank tile) · `scroll_vellum.png`
- [ ] The Copyist (copies a tile) · `scroll_copyist.png`
- [ ] Translation of Relics (copies a relic) · `scroll_translatio.png`
- [ ] Papal Dispensation (lifts the current Audit) · `scroll_dispensation.png`
- [ ] Glass seal shattering (3–4 frame shards, the letter stays) · `fx_glass_break.png`
- [ ] Empty scroll slot · `slot_scroll.png`

---

## 5. Penances, services, bosses, satchels

**Penances** (round wax medallions, ~92×92 → art 192×192)
- [ ] The Hairshirt · `pen_hairshirt.png`
- [ ] Nocturnal Vigil · `pen_nocturne.png`
- [ ] The Great Fast · `pen_fast.png`
- [ ] Cilice of Iron · `pen_cilice.png`
- [ ] The Discipline · `pen_discipline.png`
- [ ] The Grand Silence · `pen_grandsilence.png`
- [ ] Purify the Bag (service) · `svc_purge.png`

**Bosses: the Audit** (sigil for the banner and HUD plate, plus a large version for the intro, 512×512)
- [ ] The Sealed Desk · `boss_sealed_desk.png`
- [ ] The Searing Flame · `boss_searing_flame.png`
- [ ] The Censored Quill · `boss_censored_quill.png`
- [ ] The Ash Rain · `boss_ash_rain.png`
- [ ] The Final Insertion · `boss_final_insertion.png`
- [ ] The Blank Margin · `boss_blank_margin.png`
- [ ] The Vow of Unity (only Monads) · `boss_only1.png`
- [ ] The Twin Lamps (only Diads) · `boss_only2.png`
- [ ] The Trinity Rule (only Trinities) · `boss_only3.png`
- [ ] The Four Evangelists (only Tetrads) · `boss_only4.png`
- [ ] The Five Wounds (only Pentads) · `boss_only5.png`
- [ ] The Clipped Tongue (no two vowels in a row) · `boss_clipped.png`
- [ ] The Publican (one verse length takes all Merit) · `boss_publican.png`
- [ ] The Unlearning (verses lower their Codex) · `boss_unlearning.png`
- [ ] The Lenten Veil (one relic veiled each verse) · `boss_veil.png`
- [ ] The Vow of Silence (no trades) · `boss_silence.png`
- [ ] The Single Stroke (one verse) · `boss_stroke.png`
- [ ] The Heavy Tome (Grace ×2) · `boss_heavy.png`
- [ ] The Last Judgement (Grace ×3) · `boss_judgement.png`
- [ ] The Snuffed Candle (no candlelight) · `boss_snuffed.png`
- [ ] The Empty Bowl (Monad boss: Monads take all Merit) · `boss_almsbowl.png`
- [ ] The Iconoclast (Monad boss: Monads smash a relic) · `boss_iconoclast.png`

**Satchels / starting decks** (title-screen cards, 256×256)
- [ ] Novice's Satchel · `deck_novice.png`
- [ ] Hermit's Cell · `deck_hermit.png`
- [ ] Chronicler's Case · `deck_chronicler.png`
- [ ] Mendicant Friar · `deck_friar.png`
- [ ] Illuminator's Kit · `deck_illuminator.png`
- [ ] Abbess's Reliquary · `deck_abbess.png`
- [ ] Locked satchel · `deck_locked.png`

---

## 6. Tiles & the page

**Letter tiles** (~108×120 in the Book, ~96×108 on the rack → art 128×144)
- [ ] Tile blank face (carved bone or wood) · `tile_base.png`
- [ ] Tile pressed/selected state (lifted, marked for trade) · `tile_marked.png`
- [ ] Blank (wild) tile · `tile_blank.png`
- [ ] Lead slug (boss junk tile) · `tile_lead.png`
- [ ] *(optional)* Hand-lettered glyph set A–Z plus combos EA OO AE OU CH TH SH ST QU ING STR. Otherwise keep the font.

**Wax seals on tiles** (corner badge, 32×32)
- [ ] Gold · `wax_gold.png`
- [ ] Glass (blue) · `wax_glass.png`
- [ ] Red · `wax_red.png`
- [ ] Cinnabar (orange) · `wax_cinnabar.png`

**Bonus squares on the page** (sit under a tile, 128×144)
- [ ] Gilt ×2 (gold leaf) · `sq_gilt.png`
- [ ] Lapis ×3 (ultramarine) · `sq_lapis.png`
- [ ] Rubric ×2 (red ink) · `sq_rubric.png`
- [ ] Empty ruled square · `sq_empty.png`

**Illuminated initials** (the drop cap beside the verse type, 96×96)
- [ ] M: Monad · `init_M.png`
- [ ] D: Diad · `init_D.png`
- [ ] T: Trinity / Tetrad (two variants?) · `init_T.png`
- [ ] P: Pentad · `init_P.png`
- [ ] ✠: empty page · `init_cross.png`

---

## 7. Environments & UI frames

**Backgrounds** (portrait 800×1600; landscape 1800×1120 if landscape is kept)
- [ ] Vigil desk (walnut, candle glow from above) · `bg_desk.jpg`
- [ ] Treasury vault (verdigris stone) · `bg_treasury.jpg`
- [ ] The Audit (scorched red) · `bg_audit.jpg`
- [ ] Title (single candle, dark) · `bg_title.jpg`
- [ ] Victory heaven (rays, clouds) · `bg_heaven.jpg`
- [ ] Defeat ash · `bg_ash.jpg`
- [ ] Endless twilight · `bg_twilight.jpg`

**Desk objects & frames**
- [ ] Book of Life: leather cover frame (normal) · `book_cover.png`
- [ ] Book of Life: cover for the Audit (black and red) · `book_cover_audit.png`
- [ ] Vellum page texture (ruled, margins) · `page_vellum.jpg`
- [ ] Letter rack (wooden Scrabble-style rail) · `rack.png`
- [ ] Relic shelf / desk edge · `shelf.png`
- [ ] Candle (with separate flame for flicker) · `candle.png`, `flame.png`
- [ ] Satchel / bag button (leather bag with tile count) · `bag.png`
- [ ] Censer (thurible) for the one-word-clear sweep, with chains · `censer.png`
- [ ] HUD plates: vigil name plate, Grace box, stat boxes · `hud_plate.png`, `hud_box.png`
- [ ] Info strip (marginalia scrap) · `marginalia.png`
- [ ] Buttons: lapis (Inscribe), cinnabar (Trade/Next), gold (Buy/Collect), verdigris (Reroll), wood (misc); normal and pressed · `btn_*.png`
- [ ] Ink and Fervor pigment boxes · `pig_ink.png`, `pig_fervor.png`
- [ ] Shop card frame (vellum card) and "Received" stamp · `card.png`, `stamp_received.png`
- [ ] Cash-out ledger sheet · `ledger.png`
- [ ] Unlock banner (gold) · `toast.png`
- [ ] Speech bubble (vellum) · `speech.png`
- [ ] Modal sheet (vellum) and tab buttons · `sheet.png`

**Logo & app**
- [ ] Title lettering "The Scriptorium Vigil" (blackletter, gold) · `logo.png`
- [ ] App icon / favicon (512×512, plus 192 and 32) · `icon_512.png`

**Visual effects (small sprites)**
- [ ] Incense smoke puff (2–3 variants) · `fx_smoke_1..3.png`
- [ ] Ember spark · `fx_ember.png`
- [ ] Falling ash flake · `fx_ash.png`
- [ ] Star twinkle · `fx_star.png`
- [ ] Golden light flash / halo burst · `fx_flash.png`
- [ ] Floating number badges (Ink blue, Fervor red, $ gold) · `fx_badge_*.png`

---

## 8. Music

Suggested sound: plainchant, organ drones, psaltery/harp, hand bells, soft choir pads.
Loops should be seamless. One shared tempo and key family makes crossfades between screens easy.

**In the game now (placeholders in `src/audio/`; replace a file and rebuild to swap it):**

| File | Plays on | Type |
|---|---|---|
| `loopA.mp3` | Title screen | loop |
| `loopG.mp3` | Gameplay (Terraces I–VII) | loop |
| `loopH.mp3` | *(not made yet)* Win screen (Ascended) and endless-end screen; D plays until it exists | loop |
| `loopI.mp3` | *(not made yet)* Lose screen; E plays until it exists | loop |
| `loopJ.mp3` | *(not made yet)* Beatitude screen, after the D swell; D plays until it exists | loop |
| `loopB.mp3` | Treasury (shop) | loop |
| `loopC.mp3` | The Audit (every boss) | loop |
| `loopD.mp3` | Censer word (one word clears the vigil, ducks the loop), Ascended and endless-end screens | one-shot |
| `loopE.mp3` | The Candle Gutters (defeat) | one-shot |
| `loopF.mp3` | Endless gameplay | loop |

Keep the names `loopA.mp3` … `loopJ.mp3`. The game trims silent padding at both ends. Loops A, B, C,
F and G are treated as **12 s of music (4 bars at 80 bpm) plus a reverb tail**. The tail is folded
back over the start so the loop is seamless. If you change a loop's length, update `MUSIC_LOOP`
in `src/game.src.html` (seconds of music before the tail). Music and effects each have a volume
slider in the Menu; `MIX` in the source sets their relative loudness.
Still open: H win, I lose and J Beatitude loops (any length; set `MUSIC_LOOP` if they have a reverb tail), victory bells, sound effects (list below).

- [ ] **Title theme**: single voice or chant over a drone, calm · `mus_title.ogg` (loop, ~1–2 min)
- [ ] **Vigil (gameplay)**: warm and focused, doesn't tire on repeat · `mus_vigil.ogg` (loop, 2–3 min)
- [ ] *(optional)* Vigil variant for later terraces, a little more intense · `mus_vigil_2.ogg`
- [ ] **Treasury (shop)**: lighter and brighter, harp or psaltery · `mus_treasury.ogg` (loop)
- [ ] **The Audit (boss)**: low organ, tension, minor mode · `mus_audit.ogg` (loop)
- [ ] **Endless climb**: variation of the vigil theme, sparser · `mus_endless.ogg` (loop)
- [ ] **Victory (Ascended)**: choir swell into bells · `mus_victory.ogg` (~20–40 s, may loop)
- [ ] **Defeat (Candle Gutters)**: sorrowful, short, penitential · `mus_defeat.ogg` (~15–25 s)
- [ ] **Endless ends (The Vigil Ends)**: evensong / Compline feel, peaceful · `mus_rest.ogg`
- [ ] Stinger: vigil kept / cash-out · `stg_vigil_kept.ogg` (2–3 s)
- [ ] Stinger: entering the Audit · `stg_audit.ogg` (2–3 s)

---

## 9. Sound effects

All currently synthesized beeps. Keep them short (under 0.5 s unless noted) and dry, so many
can overlap during scoring.

**Tiles & words**
- [ ] Pick up a tile (wood/bone click) · `sfx_tile_pick`
- [ ] Drop a tile on the page or rack · `sfx_tile_drop`
- [ ] Tile scores Ink: a small tick, ideally 8 rising pitches or one pitched by code · `sfx_ink_tick`
- [ ] Fervor added / multiplied: brighter, choral "ah" or chime · `sfx_fervor`
- [ ] Inscribe (quill scratch plus a chord) · `sfx_inscribe`
- [ ] Invalid word / not allowed (soft muffled thud, not harsh) · `sfx_invalid`
- [ ] Trade tiles (shuffle into the bag) · `sfx_trade`
- [ ] Mark a tile for trade · `sfx_mark`
- [ ] Sort rack · `sfx_sort`
- [ ] Slide the word left/right · `sfx_shift`

**Scoring moments**
- [ ] Grace total lands (big chord) · `sfx_grace`
- [ ] Vigil kept (cash-out fanfare) · `sfx_vigil_kept`
- [ ] One-word clear: censer swing with chain jingle, 2–3 s · `sfx_censer`
- [ ] Bell chord for the one-word clear and unlocks, ~1.5 s · `sfx_bell`
- [ ] Screen shake impact (low thump) · `sfx_impact`
- [ ] ∞ Grace fanfare: brass rising to a held chord, 2–3 s, under the choir swell · `sfx_fanfare`

**Shop & items**
- [ ] Coin / Merit gained · `sfx_coin`
- [ ] Buy item · `sfx_buy`
- [ ] Sell item · `sfx_sell`
- [ ] Shop reroll · `sfx_shop_reroll`
- [ ] Relic triggers during scoring (glass chime) · `sfx_relic`
- [ ] Relic moved on the desk · `sfx_relic_move`
- [ ] Seal pressed onto a tile (wax stamp) · `sfx_seal`
- [ ] Codex level up (page plus rising chime) · `sfx_codex`
- [ ] Scroll unrolled / used · `sfx_scroll`
- [ ] Take a penance (lash or chain, subdued) · `sfx_penance`
- [ ] Purge a tile (burn) · `sfx_purge`

**Bosses & effects**
- [ ] Ash Rain burns a tile · `sfx_ash_burn`
- [ ] Lead slug drawn · `sfx_lead`
- [ ] Boss ambience (embers crackle loop) · `amb_audit`

**Screens & UI**
- [ ] Page-turn wipe between screens · `sfx_page_turn`
- [ ] Button press · `sfx_button`
- [ ] Modal open / close (book thud) · `sfx_open`, `sfx_close`
- [ ] Unlock banner · `sfx_unlock`
- [ ] Title "Begin the Vigil" (candle lit, whoosh plus bell) · `sfx_begin`
- [ ] Defeat (candle snuffed) · `sfx_snuff`
- [ ] Victory choir swell (if separate from music) · `sfx_heaven`

**Ambience (optional loops)**
- [ ] Scriptorium room tone: candle crackle, distant wind · `amb_scriptorium`
- [ ] Treasury room tone: echoey stone · `amb_treasury`

---

## Totals

| Category | Count |
|---|---|
| Relics | 40 (+1 locked silhouette) |
| Scrolls | 17 (codex ×5 can share one design) |
| Penances & services | 5 |
| Bosses | 20 |
| Satchels | 6 (+1 locked) |
| Tile & page pieces | ~20 |
| Backgrounds | 7 |
| UI frames & desk objects | ~25 |
| VFX sprites | ~8 |
| Music tracks | 9 + 2 stingers (6 placeholders in) |
| Sound effects | ~40 |
