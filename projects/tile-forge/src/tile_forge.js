/* =====================================================================
   TILE FORGE — Single-Score Word Roguelike (7 Terraces × 3 Stages + Audits)
   ===================================================================== */
const TileForge = (() => {
  const UPGRADES = {
    // +Points (Blue)
    add_self_20:  { id: 'add_self_20',  cat: 'pts',    rarity: 'common',    color: 'pts',    icon: '🔵',   name: '+20 Tile',     short: '+20 score forever',                           chip: '+20',    cost: 4,  immediate: true },
    add_self_40:  { id: 'add_self_40',  cat: 'pts',    rarity: 'common',    color: 'pts',    icon: '🔷',   name: '+40 Tile',     short: '+40 score forever',                           chip: '+40',    cost: 6,  immediate: true },
    add_left_30:  { id: 'add_left_30',  cat: 'pts',    rarity: 'common',    color: 'pts',    icon: '◀︎🔵', name: '+30 Left',     short: '+30 to left tile',                            chip: '◀︎+30',   cost: 5 },
    add_right_30: { id: 'add_right_30', cat: 'pts',    rarity: 'common',    color: 'pts',    icon: '🔵▶︎', name: '+30 Right',    short: '+30 to right tile',                           chip: '+30▶︎',   cost: 5 },

    // Multiply (Red)
    mult_self_2:  { id: 'mult_self_2',  cat: 'mult',   rarity: 'common',    color: 'mult',   icon: '💎',   name: '2× Tile',      short: '2× this tile',                                chip: '2×',     cost: 6 },
    mult_self_3:  { id: 'mult_self_3',  cat: 'mult',   rarity: 'uncommon',  color: 'mult',   icon: '♦️',   name: '3× Tile',      short: '3× this tile',                                chip: '3×',     cost: 8 },
    mult_left_2:  { id: 'mult_left_2',  cat: 'mult',   rarity: 'common',    color: 'mult',   icon: '◀︎💎', name: '2× Left',      short: '2× left tile',                                chip: '◀︎2×',    cost: 6 },
    mult_left_3:  { id: 'mult_left_3',  cat: 'mult',   rarity: 'uncommon',  color: 'mult',   icon: '◀︎🔴', name: '3× Left',      short: '3× left tile',                                chip: '◀︎3×',    cost: 8 },
    mult_left_4:  { id: 'mult_left_4',  cat: 'mult',   rarity: 'rare',      color: 'mult',   icon: '◀︎🔥', name: '4× Left',      short: '4× left tile!',                               chip: '◀︎4×',    cost: 11 },
    mult_right_2: { id: 'mult_right_2', cat: 'mult',   rarity: 'common',    color: 'mult',   icon: '💎▶︎', name: '2× Right',     short: '2× right tile',                               chip: '2×▶︎',    cost: 6 },
    mult_right_3: { id: 'mult_right_3', cat: 'mult',   rarity: 'uncommon',  color: 'mult',   icon: '🔴▶︎', name: '3× Right',     short: '3× right tile',                               chip: '3×▶︎',    cost: 8 },
    mult_right_4: { id: 'mult_right_4', cat: 'mult',   rarity: 'rare',      color: 'mult',   icon: '🔥▶︎', name: '4× Right',     short: '4× right tile!',                              chip: '4×▶︎',    cost: 11 },
    mult_word_2:  { id: 'mult_word_2',  cat: 'mult',   rarity: 'uncommon',  color: 'mult',   icon: '👑',   name: '2× Word',      short: '2× whole word!',                              chip: '2×W',    cost: 8 },
    mult_word_3:  { id: 'mult_word_3',  cat: 'mult',   rarity: 'rare',      color: 'mult',   icon: '🌟',   name: '3× Word',      short: '3× whole word!',                              chip: '3×W',    cost: 12 },

    // Replay (Purple)
    replay_self:  { id: 'replay_self',  cat: 'replay', rarity: 'uncommon',  color: 'echo',   icon: '🔁',   name: 'Replay Self',  short: 'Triggers +1 extra time',                      chip: '↻',      cost: 7 },
    replay_left:  { id: 'replay_left',  cat: 'replay', rarity: 'rare',      color: 'echo',   icon: '◀︎🔁', name: 'Replay Left',  short: 'Retriggers left tile',                        chip: '◀︎↻',    cost: 9 },
    replay_right: { id: 'replay_right', cat: 'replay', rarity: 'rare',      color: 'echo',   icon: '🔁▶︎', name: 'Replay Right', short: 'Retriggers right tile',                       chip: '↻▶︎',    cost: 9 },

    // Light (Gold)
    light_self:   { id: 'light_self',   cat: 'light',  rarity: 'common',    color: 'gold',   icon: '🕯️',   name: 'Light Self',   short: 'Bright ×3 (stacks)',                          chip: '🕯️',     cost: 4 },
    light_left:   { id: 'light_left',   cat: 'light',  rarity: 'common',    color: 'gold',   icon: '◀︎🕯️', name: 'Light Left',   short: 'Lights left (stacks)',                        chip: '◀︎🕯️',   cost: 5 },
    light_right:  { id: 'light_right',  cat: 'light',  rarity: 'common',    color: 'gold',   icon: '🕯️▶︎', name: 'Light Right',  short: 'Lights right (stacks)',                       chip: '🕯️▶︎',   cost: 5 },
    light_all:    { id: 'light_all',    cat: 'light',  rarity: 'uncommon',  color: 'gold',   icon: '☀️',   name: 'Light All',    short: 'Lights all 5 (stacks)',                       chip: '🕯️ALL',  cost: 8 },

    // Clone, Combo & Wild (Green)
    forge_combo:  { id: 'forge_combo',  cat: 'util',   rarity: 'common',    color: 'green',  icon: '🔤',   name: 'Forge Combo',  short: 'Turns 1 tile into TH/ING/QU… (keeps forges)', chip: 'ABC',    cost: 6,  immediate: true },
    clone_self:   { id: 'clone_self',   cat: 'util',   rarity: 'rare',      color: 'green',  icon: '🧬',   name: 'Clone Self',   short: 'Adds a full copy of self on play',   chip: '📑S',    cost: 11 },
    clone_left:   { id: 'clone_left',   cat: 'util',   rarity: 'rare',      color: 'green',  icon: '◀︎📑', name: 'Clone Left',   short: 'Adds a full copy of left on play',   chip: '◀︎📑',   cost: 11 },
    clone_right:  { id: 'clone_right',  cat: 'util',   rarity: 'rare',      color: 'green',  icon: '📑▶︎', name: 'Clone Right',  short: 'Adds a full copy of right on play',  chip: '📑▶︎',   cost: 11 },
    wild_self:    { id: 'wild_self',    cat: 'util',   rarity: 'rare',      color: 'green',  icon: '✨',   name: 'Wild Tile',    short: 'Turns 1 tile Wild ? (max 2 in bag; keeps forges)', chip: '?',      cost: 9,  immediate: true },
    wild_left:    { id: 'wild_left',    cat: 'util',   rarity: 'rare',      color: 'green',  icon: '◀︎✨', name: 'Wild Left',    short: 'Makes left tile wild (one wild forge per letter)',     chip: '◀︎?',    cost: 11 },
    wild_right:   { id: 'wild_right',   cat: 'util',   rarity: 'rare',      color: 'green',  icon: '✨▶︎', name: 'Wild Right',   short: 'Makes right tile wild (one wild forge per letter)',    chip: '?▶︎',    cost: 11 },

    // Special Picks
    grow_2:       { id: 'grow_2',       cat: 'pts',    rarity: 'rare',      color: 'pts',    icon: '📈',   name: '2× Forever',   short: 'Doubles tile score after play',               chip: '📈',     cost: 10 },
    gold_3:       { id: 'gold_3',       cat: 'light',  rarity: 'common',    color: 'gold',   icon: '🪙',   name: '+$3 Gold',     short: '+$3 every trigger',                           chip: '+$3',    cost: 6 },
    power_word:   { id: 'power_word',   cat: 'replay', rarity: 'legendary', color: 'echo',   icon: '⚡',   name: 'Word ^1.25',   short: 'Raises word score ^1.25!',                    chip: '^1.25',  cost: 15 }
  };

  const RARITY_META = {
    common:    { label: 'COMMON',    cls: 'rar-common' },
    uncommon:  { label: 'UNCOMMON',  cls: 'rar-uncommon' },
    rare:      { label: 'RARE',      cls: 'rar-rare' },
    legendary: { label: 'LEGENDARY', cls: 'rar-legendary' }
  };

  const CAT_LABELS = {
    pts: 'SCORE UPGRADE',
    mult: 'MULTIPLY',
    replay: 'REPLAY / POWER',
    light: 'CANDLE & GOLD',
    util: 'COMBO & WILD'
  };

  // Each forge as a glyph: the value, with an arrow toward the tile it hits.
  // No arrow = this tile. Both arrows = the whole word (or every slot, for light).
  const GLYPHS = {
    add_self_20: ['self', '+20'], add_self_40: ['self', '+40'], add_left_30: ['left', '+30'], add_right_30: ['right', '+30'],
    mult_self_2: ['self', '×2'], mult_self_3: ['self', '×3'],
    mult_left_2: ['left', '×2'], mult_left_3: ['left', '×3'], mult_left_4: ['left', '×4'],
    mult_right_2: ['right', '×2'], mult_right_3: ['right', '×3'], mult_right_4: ['right', '×4'],
    mult_word_2: ['both', '×2'], mult_word_3: ['both', '×3'],
    replay_self: ['self', '↻'], replay_left: ['left', '↻'], replay_right: ['right', '↻'],
    light_self: ['self', '*'], light_left: ['left', '*'], light_right: ['right', '*'], light_all: ['both', '*'],
    forge_combo: ['self', 'TH'],
    clone_self: ['self', '⧉'], clone_left: ['left', '⧉'], clone_right: ['right', '⧉'],
    wild_self: ['self', '?'], wild_left: ['left', '?'], wild_right: ['right', '?'],
    grow_2: ['self', '↑×2'], gold_3: ['self', '+$3'], power_word: ['both', '^1.25']
  };
  // What each forge does, in plain words (tooltips).
  const TIPS = {
    add_self_20: 'This letter is worth +20 points, for good.',
    add_self_40: 'This letter is worth +40 points, for good.',
    add_left_30: 'When it scores, the letter to its left gets +30 points.',
    add_right_30: 'When it scores, the letter to its right gets +30 points.',
    mult_self_2: 'This letter scores ×2.',
    mult_self_3: 'This letter scores ×3.',
    mult_left_2: 'The letter to its left scores ×2.',
    mult_left_3: 'The letter to its left scores ×3.',
    mult_left_4: 'The letter to its left scores ×4.',
    mult_right_2: 'The letter to its right scores ×2.',
    mult_right_3: 'The letter to its right scores ×3.',
    mult_right_4: 'The letter to its right scores ×4.',
    mult_word_2: 'The whole word scores ×2.',
    mult_word_3: 'The whole word scores ×3.',
    replay_self: 'This letter scores one extra time.',
    replay_left: 'The letter to its left scores one extra time.',
    replay_right: 'The letter to its right scores one extra time.',
    light_self: 'Brings a flame to this letter’s slot (×3 there). Stack more for a bigger blaze.',
    light_left: 'Brings a flame to the slot on its left (×3 there). Stacks.',
    light_right: 'Brings a flame to the slot on its right (×3 there). Stacks.',
    light_all: 'Lights every slot on the line one step brighter. Stacks.',
    forge_combo: 'Turns one copy into a letter pair like TH, ING or QU. It keeps its forges.',
    clone_self: 'Each time it’s played, a full copy of this letter, forges and all, joins your bag.',
    clone_left: 'Each time it’s played, a full copy of the letter on its left, forges and all, joins your bag.',
    clone_right: 'Each time it’s played, a full copy of the letter on its right, forges and all, joins your bag.',
    wild_self: 'Turns one copy into a Wild ? that can be any letter. It keeps its forges. Up to 2 per run.',
    wild_left: 'The letter on its left can be any letter while they sit together, and keeps its own forges. A letter can carry one wild forge.',
    wild_right: 'The letter on its right can be any letter while they sit together, and keeps its own forges. A letter can carry one wild forge.',
    grow_2: 'After each play, this letter’s points double, for good.',
    gold_3: '+$3 every time this letter scores.',
    power_word: 'Raises the whole word’s score to the power of 1.25.'
  };
  const ONE_COPY = new Set(['forge_combo', 'wild_self']);
  const tipFor = (u) => TIPS[u.id] + (ONE_COPY.has(u.id) ? '' : ' Goes on every tile of the letter you pick.');
  // Forge colours: blue points, red multiply, purple replay, gold light and money, green tricks.
  const FORGE_COL = { pts: '#1f4fa3', mult: '#b5301c', echo: '#7b3ba8', gold: '#a8730f', green: '#2e846c' };
  const TAG_H = { big: 34, inline: 19, mini: 15 };
  const FLAME_PATH = 'M6 .4C7.6 4 11.2 6 11.2 10.2a5.2 5.2 0 0 1-10.4 0c0-2.3 1.2-3.7 2.5-5 .2 1.9 1 2.9 2.1 2.9C5 5 5.2 2.6 6 .4z';
  const countBubble = (x, h, n) =>
    `<circle cx="${x}" cy="${h * 0.24}" r="${h * 0.28}" fill="#2b1b0f" stroke="#f4d886" stroke-width="1"/>` +
    `<text x="${x}" y="${h * 0.24}" text-anchor="middle" dominant-baseline="central" font-size="${h * 0.36}" fill="#f4d886">${n}</text>`;
  // A soft tag: a rounded plate whose nose points at the tile it affects (none = itself, both = the whole word).
  function glyphHtml(u, opts = {}) {
    const [dir, label] = GLYPHS[u.id] || ['self', u.chip];
    const h = TAG_H[opts.cls] || TAG_H.inline;
    const flame = label === '*';
    const w = h * (flame ? 1.05 : 0.5 + 0.4 * [...label].length);
    const p = h * 0.4, j = h * 0.24;
    const L = dir === 'left' || dir === 'both', R = dir === 'right' || dir === 'both';
    const x0 = L ? p + j / 2 + 1 : j / 2 + 1, x1 = x0 + w;
    const W = x1 + (R ? p + j / 2 + 1 : j / 2 + 1) + (opts.count > 1 ? h * 0.45 : 0), H = h + 2;
    const cy = H / 2, y0 = 1 + j / 2, y1 = H - 1 - j / 2;
    const pts = [[x0, y0], [x1, y0], ...(R ? [[x1 + p, cy]] : []), [x1, y1], [x0, y1], ...(L ? [[x0 - p, cy]] : [])]
      .map(q => q.map(n => n.toFixed(1)).join(',')).join(' ');
    const col = FORGE_COL[u.color] || '#3b2415';
    const mid = (x0 + x1) / 2;
    const body = flame
      ? `<path transform="translate(${(mid - 6 * h / 24).toFixed(1)},${(cy - 8 * h / 24).toFixed(1)}) scale(${(h / 24).toFixed(3)})" d="${FLAME_PATH}" fill="#ffd34d"/>`
      : `<text x="${mid.toFixed(1)}" y="${cy.toFixed(1)}" text-anchor="middle" dominant-baseline="central" font-size="${(h * 0.56).toFixed(1)}" fill="#fff">${esc(label)}</text>`;
    return `<svg class="ftag${opts.cls ? ' ' + opts.cls : ''}" width="${W.toFixed(1)}" height="${H}" viewBox="0 0 ${W.toFixed(1)} ${H}" aria-hidden="true">` +
      `<polygon points="${pts}" fill="${col}" stroke="#2b1b0f" stroke-opacity=".35" stroke-width="${(j + 1.6).toFixed(1)}" stroke-linejoin="round"/>` +
      `<polygon points="${pts}" fill="${col}" stroke="${col}" stroke-width="${j.toFixed(1)}" stroke-linejoin="round"/>` +
      body + (opts.count > 1 ? countBubble(W - h * 0.3, h, opts.count) : '') + `</svg>`;
  }
  function moreChip(n, cls = 'mini') {
    const h = TAG_H[cls], W = h * 1.5, H = h + 2;
    return `<svg class="ftag ${cls}" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true">` +
      `<rect x="1" y="1" width="${W - 2}" height="${h}" rx="${h * 0.4}" fill="#3b2415" stroke="#f4d886" stroke-width="1"/>` +
      `<text x="${W / 2}" y="${H / 2}" text-anchor="middle" dominant-baseline="central" font-size="${h * 0.55}" fill="#f4d886">+${n}</text></svg>`;
  }
  // Which forges earn a visible tag first: whole-word effects, then multiply, replay, light, tricks, points.
  const FORGE_RANK = (id) => {
    const [dir] = GLYPHS[id] || ['self'];
    const u = UPGRADES[id];
    return (dir === 'both' ? 0 : 10) + ({ mult: 0, echo: 1, gold: 2, green: 3, pts: 4 }[u.color] ?? 5);
  };
  // The shop's letter grid: past three forges, one colour bar by type plus a total.
  function forgeBarHtml(entries) {
    const by = new Map();
    let total = 0;
    for (const [id, n] of entries) { const c = UPGRADES[id].color; by.set(c, (by.get(c) || 0) + n); total += n; }
    const order = ['mult', 'echo', 'gold', 'green', 'pts'];
    const segs = [...by.entries()].sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]));
    return `<div class="fbar">${segs.map(([c, n]) => `<i style="flex:${n};background:${FORGE_COL[c]}"></i>`).join('')}<b>${total}</b></div>`;
  }

  const BURN_CRAFT_COST = 4;
  const MIN_BAG_SIZE = 10;
  const CLONE_CRAFT_COST = 11;
  const FUSE_CRAFT_COST = 7;
  const REROLL_COST = 3;
  const MAX_WILD_TILES = 2;
  const WORD_SPAM_THRESHOLD = 3;
  const TILE_SPAM_THRESHOLD = 7;
  // The Vowel Fast: scheduled when 70% of your forges sit on vowels (6+ forges), or 60% of
  // the letters you've played are vowels (20+ plays). Ordinary English runs about 40% vowels.
  const VOWEL_FAST_FORGE_SHARE = 0.7;
  const VOWEL_FAST_MIN_FORGES = 6;
  const VOWEL_FAST_PLAY_SHARE = 0.6;
  const VOWEL_FAST_MIN_PLAYS = 20;

  const STAKES = [
    { id: 'white',  icon: '⚪', name: 'White Stake',  short: 'White',  wordsPerStage: 4, swapsPerStage: 3, goalMult: 1,    noFuse: false, shopPriceAdd: 0, desc: 'Base rules: 4 Words, 3 Swaps, full Forge.' },
    { id: 'red',    icon: '🔴', name: 'Red Stake',    short: 'Red',    wordsPerStage: 4, swapsPerStage: 2, goalMult: 1,    noFuse: false, shopPriceAdd: 0, desc: '-1 Swap per stage (2 Swaps instead of 3).' },
    { id: 'green',  icon: '🟢', name: 'Green Stake',  short: 'Green',  wordsPerStage: 4, swapsPerStage: 2, goalMult: 1.35, noFuse: false, shopPriceAdd: 0, desc: 'Includes Red · Goals scale ×1.35 faster.' },
    { id: 'blue',   icon: '🔵', name: 'Blue Stake',   short: 'Blue',   wordsPerStage: 4, swapsPerStage: 2, goalMult: 1.35, noFuse: true,  shopPriceAdd: 0, desc: 'Includes Green · No Fusing (🔗 Fuse 2 Tiles locked).' },
    { id: 'purple', icon: '🟣', name: 'Purple Stake', short: 'Purple', wordsPerStage: 3, swapsPerStage: 2, goalMult: 1.35, noFuse: true,  shopPriceAdd: 0, desc: 'Includes Blue · -1 Word per stage (only 3 Words!).' },
    { id: 'gold',   icon: '🟡', name: 'Gold Stake',   short: 'Gold',   wordsPerStage: 3, swapsPerStage: 2, goalMult: 1.75, noFuse: true,  shopPriceAdd: 2, desc: 'Includes Purple · All Shop prices +$2 & Goals ×1.75.' }
  ];
  const STAKE_MAP = Object.fromEntries(STAKES.map(s => [s.id, s]));

  const LS_SCALE_KEY = 'tileforge_goal_scale_v2';
  const LS_STAKE_KEY = 'tileforge_stake';
  const LS_WINS_KEY = 'tileforge_wins';
  const SCALE_PRESETS = [10, 25, 50, 75, 100, 150, 200];

  function readStorage(key, fallback) {
    try {
      const v = typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
      return v === null ? fallback : v;
    } catch {
      return fallback;
    }
  }
  function writeStorage(key, val) {
    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem(key, String(val));
    } catch {}
  }
  function clampScalePct(v) {
    const n = Math.round(Number(v));
    if (!isFinite(n)) return 100;
    return Math.max(10, Math.min(200, n));
  }
  function readClearedStakes() {
    try {
      const raw = readStorage(LS_WINS_KEY, '[]');
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr.filter(id => !!STAKE_MAP[id]) : [];
    } catch {
      return [];
    }
  }

  let goalScalePct = clampScalePct(readStorage(LS_SCALE_KEY, 100));
  let activeStakeId = STAKE_MAP[readStorage(LS_STAKE_KEY, 'white')] ? readStorage(LS_STAKE_KEY, 'white') : 'white';
  let clearedStakes = new Set(readClearedStakes());
  let menuStakeId = activeStakeId;

  let S = null;
  let pendingComboCtx = null;
  let dragUid = null;
  let touchDrag = null;
  let suppressNextClick = false;
  let lastCandleSlot = null;
  let lastPtr = 'mouse';

  const getStake = (id = S ? S.stakeId : activeStakeId) => STAKE_MAP[id] || STAKES[0];
  const effectiveGoalMult = (stakeId = S ? S.stakeId : activeStakeId, scalePct = S ? S.goalScalePct : goalScalePct) =>
    getStake(stakeId).goalMult * (clampScalePct(scalePct) / 100);
  const stageSpec = (terrace, stageInTerrace, auditSpec = S ? S.audit : null) =>
    getRunStageSpec(terrace, stageInTerrace, auditSpec, effectiveGoalMult());
  const getBurnCost = () => BURN_CRAFT_COST + getStake().shopPriceAdd;
  const getCloneCost = () => CLONE_CRAFT_COST + getStake().shopPriceAdd;
  const getFuseCost = () => FUSE_CRAFT_COST + getStake().shopPriceAdd;
  const getRerollCost = () => REROLL_COST + getStake().shopPriceAdd;
  function markStakeCleared(stakeId) {
    if (!STAKE_MAP[stakeId]) return;
    clearedStakes.add(stakeId);
    writeStorage(LS_WINS_KEY, JSON.stringify([...clearedStakes]));
  }

  const letterKey = (t) => (t.lead ? 'Pb' : (t.wild ? '?' : t.letter));
  const countMod = (t, id) => (t && t.mods ? t.mods.filter(m => m === id).length : 0);
  const countWildsInBag = () => (S && S.bag ? S.bag.filter(t => !t.lead && t.wild).length : 0);
  const isAudit = () => S.stageInTerrace === 2;

  function maybeScheduleAntiSpamAudit(notify = true) {
    if (!S || !S.wordCounts || !S.tileCounts) return null;
    const candidates = [];
    for (const [w, cnt] of Object.entries(S.wordCounts)) {
      if (cnt >= WORD_SPAM_THRESHOLD) {
        candidates.push({ type: 'word', key: w, tag: 'W:' + w, pressure: cnt / WORD_SPAM_THRESHOLD });
      }
    }
    for (const [k, cnt] of Object.entries(S.tileCounts)) {
      if (cnt >= TILE_SPAM_THRESHOLD) {
        candidates.push({ type: 'tile', key: k, tag: 'T:' + k, pressure: cnt / TILE_SPAM_THRESHOLD });
      }
    }
    // Vowel-heavy builds: most forges sit on vowels, or most letters played lately are vowels.
    {
      const best = new Map(); // forges on the most-forged copy of each letter
      for (const t of S.bag) {
        if (t.lead || t.wild) continue;
        const k = letterKey(t);
        best.set(k, Math.max(best.get(k) || 0, t.mods.length));
      }
      let vForges = 0, allForges = 0;
      for (const [k, n] of best) { allForges += n; if ('AEIOU'.includes(k)) vForges += n; }
      let vPlays = 0, allPlays = 0;
      for (const [k, n] of Object.entries(S.tileCounts)) { allPlays += n; if ('AEIOU'.includes(k)) vPlays += n; }
      const forgeShare = allForges >= VOWEL_FAST_MIN_FORGES ? vForges / allForges : 0;
      const playShare = allPlays >= VOWEL_FAST_MIN_PLAYS ? vPlays / allPlays : 0;
      const pressure = Math.max(forgeShare / VOWEL_FAST_FORGE_SHARE, playShare / VOWEL_FAST_PLAY_SHARE);
      if (pressure >= 1) candidates.push({ type: 'vowels', key: 'V', tag: 'V', pressure });
    }
    if (!candidates.length) return null;
    candidates.sort((a, b) => b.pressure - a.pressure);
    const pick = candidates.find(c => c.tag !== S.lastDynamicAuditKey) || candidates[0];
    const dynAudit = pick.type === 'word' ? createAntiSpamWordAudit(pick.key)
      : pick.type === 'vowels' ? createVowelFastAudit()
        : createAntiSpamTileAudit(pick.key);

    if (S.stageInTerrace < 2) {
      const same = S.audit && S.audit.dynamic && (
        (S.audit.id === 'ban_word' && pick.type === 'word' && S.audit.bannedWord === pick.key) ||
        (S.audit.id === 'censor_tile' && pick.type === 'tile' && S.audit.censoredKey === pick.key) ||
        (S.audit.id === 'vowel_fast' && pick.type === 'vowels')
      );
      S.audit = dynAudit;
      if (!same && notify) showToast(`⚔️ Anti-Spam Audit Scheduled: ${dynAudit.name}`);
    } else {
      const same = S.nextAudit && S.nextAudit.dynamic && (
        (S.nextAudit.id === 'ban_word' && pick.type === 'word' && S.nextAudit.bannedWord === pick.key) ||
        (S.nextAudit.id === 'censor_tile' && pick.type === 'tile' && S.nextAudit.censoredKey === pick.key) ||
        (S.nextAudit.id === 'vowel_fast' && pick.type === 'vowels')
      );
      S.nextAudit = dynAudit;
      if (!same && notify) showToast(`⚔️ Next Terrace Audit Scheduled: ${dynAudit.name}`);
    }
    return dynAudit;
  }

  function popAuditFromBag(allowNoReplay = true) {
    if (!S.auditBag || !S.auditBag.length) {
      S.auditBag = shuffleArr(Object.keys(AUDITS));
    }
    if (!allowNoReplay && S.auditBag[S.auditBag.length - 1] === 'no_replay' && S.auditBag.length > 1) {
      const top = S.auditBag.length - 1;
      [S.auditBag[0], S.auditBag[top]] = [S.auditBag[top], S.auditBag[0]];
    }
    return createAuditInstance(S.auditBag.pop());
  }

  function initState() {
    uidSeq = 1;
    const appEl = document.getElementById('app');
    if (appEl) appEl.classList.remove('scale-broken');
    const bag = makeBaseBag(1, 20);
    const st = getStake(activeStakeId);
    S = {
      terrace: 0,
      stageInTerrace: 0,
      stakeId: st.id,
      goalScalePct,
      auditBag: shuffleArr(Object.keys(AUDITS)),
      audit: null,
      nextAudit: null,
      phase: 'play', // 'play' | 'shop'
      score: 0,
      wordsLeft: st.wordsPerStage,
      swapsLeft: st.swapsPerStage,
      gold: 6,
      bag,
      draw: [],
      hand: [],
      line: [null, null, null, null, null],
      candleSlot: 2,
      swapSet: null,
      sortMode: 'az',
      shopCards: [],
      shopSel: null,
      shopMode: null, // null | 'card' | 'clone' | 'fuse'
      fuseFirstUid: null,
      wbFilter: 'all',
      rerollCost: getRerollCost(),
      shopNum: 0,
      busy: false,
      broken: false,
      wordsPlayed: 0,
      wordCounts: {},
      tileCounts: {},
      lastDynamicAuditKey: null,
      demoBanner: null,
      calcOverride: null
    };
    S.audit = popAuditFromBag(false);
    S.nextAudit = popAuditFromBag(true);
    startStage(0, 0);
  }

  function startStage(terrace, stageInTerrace) {
    const st = getStake();
    S.terrace = terrace;
    S.stageInTerrace = stageInTerrace;
    const spec = stageSpec(terrace, stageInTerrace, S.audit);
    S.phase = 'play';
    S.score = 0;
    S.wordsLeft = st.wordsPerStage;
    S.swapsLeft = st.swapsPerStage;
    S.line = [null, null, null, null, null];
    S.candleSlot = (terrace === 0 && stageInTerrace === 0) ? 2 : nextCandleSlot(S.candleSlot);
    S.swapSet = null;
    S.shopSel = null;
    S.shopMode = null;
    S.fuseFirstUid = null;
    S.calcOverride = null;
    S.draw = shuffleArr(S.bag);

    // The Heavy Lead Audit shuffles 2 temporary Pb (0-pt) slugs into the draw pile only
    if (isAudit() && S.audit && S.audit.id === 'lead_tiles') {
      const makeLead = () => ({ uid: nextUid(), letter: 'Pb', val: 0, wild: false, lead: true, mods: [] });
      S.draw.splice(Math.min(S.draw.length, Math.floor(Math.random() * 6)), 0, makeLead());
      S.draw.splice(Math.min(S.draw.length, 3 + Math.floor(Math.random() * 9)), 0, makeLead());
    }

    S.hand = [];
    drawTilesFromState(S, 7);
    sortHandArr(S.hand, S.sortMode);
    if (spec.isAudit) {
      showToast(`⚔️ Audit: ${spec.name}`);
    }
  }

  // Which tiles on the line act as wild. A ◀? or ?▶ tile makes its neighbour wild, but a tile
  // that has itself been made wild loses that power (no chains). In a face-off (◀? next to ?▶
  // pointing at each other) the left tile wins.
  function wildFlagsForLine(tiles) {
    const n = tiles.length;
    const flags = tiles.map(t => !t.lead && !!t.wild);
    const target = tiles.map((t, j) => {
      if (t.lead || t.wild) return -1;
      if (countMod(t, 'wild_left') > 0 && j > 0) return j - 1;
      if (countMod(t, 'wild_right') > 0 && j < n - 1) return j + 1;
      return -1;
    });
    const state = target.map(x => (x < 0 ? 'none' : null));
    while (state.includes(null)) {
      let changed = false;
      for (let j = 0; j < n; j++) {
        if (state[j] !== null) continue;
        const hitters = target.map((x, k) => (x === j ? k : -1)).filter(k => k >= 0);
        if (hitters.some(k => state[k] === 'on')) { state[j] = 'off'; changed = true; }
        else if (hitters.every(k => state[k] === 'off')) { state[j] = 'on'; changed = true; }
      }
      if (!changed) state[state.indexOf(null)] = 'on';
    }
    state.forEach((st, j) => { if (st === 'on' && !tiles[target[j]].lead) flags[target[j]] = true; });
    return flags;
  }

  function auditCheck(v) {
    if (!isAudit() || !S.audit) return '';
    if (S.audit.id === 'min_4' && v.count < 4) return 'Audit: Only 4 or 5-tile words count.';
    if (S.audit.id === 'max_3' && v.count > 3) return 'Audit: Only 1, 2, or 3-tile words count.';
    if (S.audit.id === 'must_repeat' && !/(.).*\1/.test(v.word)) return 'Audit: Word must repeat a letter (BOOK, TREE…).';
    if (S.audit.id === 'ban_word' && S.audit.bannedWord && v.word.includes(S.audit.bannedWord)) {
      return `Audit: “${S.audit.bannedWord}” is banned (Index Expurgatorius)!`;
    }
    return '';
  }

  function computeTriggers(tiles) {
    const len = tiles.length;
    const trig = tiles.map(t => Math.min(4096, 1 + countMod(t, 'replay_self')));

    const pingPongPairs = new Set();
    for (let j = 0; j < len - 1; j++) {
      if (tiles[j].wild || tiles[j + 1].wild) continue;
      const cR = countMod(tiles[j], 'replay_right');
      const cL = countMod(tiles[j + 1], 'replay_left');
      if (cR > 0 && cL > 0) {
        const ppFactor = Math.min(256, 8 * Math.max(1, cR + cL - 1));
        trig[j] = Math.min(4096, trig[j] * ppFactor);
        trig[j + 1] = Math.min(4096, trig[j + 1] * ppFactor);
        pingPongPairs.add(j);
      }
    }

    for (let j = len - 1; j >= 1; j--) {
      if (pingPongPairs.has(j - 1) || tiles[j - 1].wild) continue;
      const cL = countMod(tiles[j], 'replay_left');
      if (cL > 0) {
        trig[j - 1] = Math.min(4096, trig[j - 1] * (1 + cL * trig[j]));
      }
    }

    for (let j = 0; j < len - 1; j++) {
      if (pingPongPairs.has(j) || tiles[j + 1].wild) continue;
      const cR = countMod(tiles[j], 'replay_right');
      if (cR > 0) {
        trig[j + 1] = Math.min(4096, trig[j + 1] * (1 + cR * trig[j]));
      }
    }

    return { trig, pingPongPairs };
  }

  function computeScore(v, preview = true) {
    const len = v.count;
    const lengthBonus = LENGTH_BONUS[len] || 0;
    let wordScore = lengthBonus;
    let goldGain = 0;
    const steps = [];

    const audit = isAudit() ? S.audit : null;
    // The Vowel Fast: vowel tiles score 0 and their forges (light included) don't fire this round
    const fasting = !!(audit && audit.id === 'vowel_fast');
    const fast = (t) => (t && fasting && !t.lead && tileCategory(t) === 'vowel' ? { ...t, val: 0, mods: [] } : t);
    if (fasting) v = { ...v, tiles: v.tiles.map(fast) };
    const lineForLight = fasting ? S.line.map(fast) : S.line;
    const snuffed = !!(audit && audit.id === 'snuffed');
    const noReplay = !!(audit && audit.id === 'no_replay');
    const isConsChar = ch => !!ch && /[A-Z]/.test(ch) && !'AEIOU'.includes(ch);

    const { trig, pingPongPairs } = noReplay
      ? { trig: v.tiles.map(() => 1), pingPongPairs: new Set() }
      : computeTriggers(v.tiles);

    const lightLevels = computeSlotLights(lineForLight, S.candleSlot, countMod, snuffed);

    const simVal = v.tiles.map((t, j) => {
      if (t.lead) return 0;
      if (audit) {
        if (audit.id === 'censor_tile' && audit.censoredKey && letterKey(t) === audit.censoredKey) return 0;
        const cat = tileCategory(t);
        const up = t.wild ? '?' : t.letter.toUpperCase();
        if (audit.id === 'half_vowels' && cat === 'vowel') return Math.floor(t.val / 2);
        if (audit.id === 'half_cons' && cat === 'cons') return Math.floor(t.val / 2);
        if (audit.mutedChars && !t.wild) {
          const chars = up.split('');
          if (chars.every(ch => audit.mutedChars.includes(ch))) return 0;
        }
        if (audit.id === 'no_start_cons' && j === 0 && !t.wild && isConsChar(up[0])) return 0;
        if (audit.id === 'no_end_cons' && j === len - 1 && !t.wild && isConsChar(up[up.length - 1])) return 0;
      }
      return t.val;
    });

    // Pre-score additive neighbor buffs (+30 Left / +30 Right)
    for (let j = 0; j < len; j++) {
      const t = v.tiles[j];
      const addL = countMod(t, 'add_left_30');
      const addR = countMod(t, 'add_right_30');
      if (addL > 0 && j > 0) {
        const gain = 30 * addL * trig[j];
        simVal[j - 1] += gain;
        steps.push({ uid: t.uid, label: `◀︎ +${fmtC(gain)}`, cls: 'pts', wordScore });
      }
      if (addR > 0 && j + 1 < len) {
        const gain = 30 * addR * trig[j];
        simVal[j + 1] += gain;
        steps.push({ uid: t.uid, label: `+${fmtC(gain)} ▶︎`, cls: 'pts', wordScore });
      }
    }

    // Pre-score self & neighbor multipliers
    for (let j = 0; j < len; j++) {
      const t = v.tiles[j];
      const selfMult = Math.pow(2, countMod(t, 'mult_self_2')) * Math.pow(3, countMod(t, 'mult_self_3'));
      if (selfMult > 1) {
        simVal[j] = safeMul(simVal[j], selfMult);
      }

      const fLeft = Math.pow(2, countMod(t, 'mult_left_2')) *
                    Math.pow(3, countMod(t, 'mult_left_3')) *
                    Math.pow(4, countMod(t, 'mult_left_4'));
      if (fLeft > 1 && j > 0) {
        const effLeft = safePow(fLeft, Math.min(trig[j], 1024));
        simVal[j - 1] = safeMul(simVal[j - 1], effLeft);
        steps.push({ uid: t.uid, label: `◀︎ ${fmtC(effLeft)}×`, cls: 'mult', wordScore });
      }

      const fRight = Math.pow(2, countMod(t, 'mult_right_2')) *
                     Math.pow(3, countMod(t, 'mult_right_3')) *
                     Math.pow(4, countMod(t, 'mult_right_4'));
      if (fRight > 1 && j + 1 < len) {
        const effRight = safePow(fRight, Math.min(trig[j], 1024));
        simVal[j + 1] = safeMul(simVal[j + 1], effRight);
        steps.push({ uid: t.uid, label: `${fmtC(effRight)}× ▶︎`, cls: 'mult', wordScore });
      }
    }

    for (const pairIdx of pingPongPairs) {
      steps.push({ uid: v.tiles[pairIdx].uid, label: '⚡ PING-PONG ×8!', cls: 'echo', wordScore });
    }

    // Pass 1: Tile points, permanent growth (2× Forever), gold triggers, and clones
    const clonedThisWord = [];
    for (let j = 0; j < len; j++) {
      const t = v.tiles[j];
      const kMax = trig[j];
      const light = lightInfoFromLevel(lightLevels[v.positions[j]]);

      const cGrow = countMod(t, 'grow_2');
      const cGold = countMod(t, 'gold_3');

      const applySingleTileTrigger = (recordStep) => {
        const ptsGain = safeMul(simVal[j], light.mult);
        wordScore = isFinite(wordScore) && isFinite(ptsGain)
          ? wordScore + ptsGain
          : (wordScore > 0 || ptsGain > 0 ? Infinity : 0);

        if (recordStep) {
          const pfx = light.level === 'blazing' || light.level === 'bright' ? '🕯️ ' : (kMax > 1 ? '↻ ' : '');
          steps.push({ uid: t.uid, label: `${pfx}+${fmtC(ptsGain)}`, cls: 'pts', wordScore });
        }

        if (cGold > 0) {
          goldGain = Math.min(100, goldGain + 3 * cGold);
          if (recordStep) steps.push({ uid: t.uid, label: `+$${3 * cGold}`, cls: 'gold', wordScore });
        }
      };

      const animIndiv = Math.min(kMax, 3);
      for (let k = 0; k < animIndiv; k++) {
        applySingleTileTrigger(true);
      }

      if (kMax > animIndiv) {
        const rem = kMax - animIndiv;
        const ptsGain = safeMul(safeMul(simVal[j], light.mult), rem);
        wordScore = isFinite(wordScore) && isFinite(ptsGain) ? wordScore + ptsGain : Infinity;
        if (cGold > 0) goldGain = Math.min(100, goldGain + 3 * cGold * rem);
        steps.push({ uid: t.uid, label: `↻ ×${fmtC(rem)} burst!`, cls: 'echo', wordScore });
      }

      if (cGrow > 0) {
        const growMult = Math.pow(2, cGrow);
        const nextVal = safeMul(t.val, growMult);
        if (!preview) t.val = nextVal;
        steps.push({ uid: t.uid, label: `📈 → ${fmtC(nextVal)}`, cls: 'pts', wordScore });
      }

      if (!preview && cGrow > 0) {
        const k = letterKey(t);
        for (const b of S.bag) {
          if (!b.lead && letterKey(b) === k) {
            b.val = isFinite(t.val) ? Math.max(b.val, t.val) : Infinity;
          }
        }
      }

      if (!preview) {
        const pushCleanClone = (src) => {
          if (!src || src.lead || src.wild) return;
          const c = {
            uid: nextUid(),
            letter: src.letter,
            val: src.val,
            wild: false,
            mods: src.mods.slice()
          };
          S.bag.push(c);
          clonedThisWord.push(c.letter);
        };
        for (let k = 0; k < countMod(t, 'clone_self'); k++) {
          pushCleanClone(t);
        }
        if (j > 0) {
          for (let k = 0; k < countMod(t, 'clone_left'); k++) {
            pushCleanClone(v.tiles[j - 1]);
          }
        }
        if (j + 1 < len) {
          for (let k = 0; k < countMod(t, 'clone_right'); k++) {
            pushCleanClone(v.tiles[j + 1]);
          }
        }
      }
    }

    // Pass 2a: Whole-word multipliers (applies to total word score regardless of slot order)
    for (let j = 0; j < len; j++) {
      const t = v.tiles[j];
      const wordMult = Math.pow(2, countMod(t, 'mult_word_2')) * Math.pow(3, countMod(t, 'mult_word_3'));
      if (wordMult > 1) {
        const kMax = trig[j];
        const animIndiv = Math.min(kMax, 3);
        for (let k = 0; k < animIndiv; k++) {
          wordScore = safeMul(wordScore, wordMult);
          steps.push({ uid: t.uid, label: `${wordMult}× Word!`, cls: 'mult', wordScore });
        }
        if (kMax > animIndiv) {
          const rem = kMax - animIndiv;
          wordScore = safeMul(wordScore, safePow(wordMult, rem));
          steps.push({ uid: t.uid, label: `↻ ${fmtC(wordMult)}×W ×${fmtC(rem)}!`, cls: 'mult', wordScore });
        }
      }
    }

    // Pass 2b: Whole-word exponents (^1.25)
    for (let j = 0; j < len; j++) {
      const t = v.tiles[j];
      const cPow = countMod(t, 'power_word');
      if (cPow > 0 && wordScore > 0) {
        const exp = Math.pow(1.25, cPow);
        const kMax = trig[j];
        const animIndiv = Math.min(kMax, 3);
        for (let k = 0; k < animIndiv; k++) {
          if (wordScore <= 1) wordScore += 2;
          wordScore = safePow(wordScore, exp);
          steps.push({ uid: t.uid, label: `⚡ ^${exp.toFixed(2)}!`, cls: 'echo', wordScore });
        }
        if (kMax > animIndiv) {
          const rem = kMax - animIndiv;
          const loops = Math.min(rem, 1100);
          for (let b = 0; b < loops; b++) {
            if (wordScore <= 1) wordScore += 2;
            wordScore = safePow(wordScore, exp);
            if (!isFinite(wordScore)) break;
          }
          if (rem > loops && isFinite(wordScore) && wordScore > 1) {
            wordScore = Infinity;
          }
          steps.push({ uid: t.uid, label: `↻ ^${exp.toFixed(2)} ×${fmtC(rem)}!`, cls: 'echo', wordScore });
        }
      }
    }

    if (audit && audit.id === 'censor_tile' && audit.censoredKey) {
      for (let j = 0; j < len; j++) {
        const t = v.tiles[j];
        if (letterKey(t) === audit.censoredKey) {
          wordScore = safeMul(wordScore, 0.5);
          steps.push({ uid: t.uid, label: '✕ Censored ×0.5', cls: 'mult', wordScore });
        }
      }
    }

    let total = isFinite(wordScore) ? Math.round(wordScore) : Infinity;
    if (!isFinite(total)) total = Infinity;
    return { baseScore: lengthBonus, steps, total, goldGain, clonedThisWord, lightLevels, snuffed };
  }

  function rollRarity() {
    const r = Math.random();
    if (S.terrace <= 1) {
      if (r < 0.72) return 'common';
      if (r < 0.96) return 'uncommon';
      return 'rare';
    }
    if (S.terrace <= 4) {
      if (r < 0.62) return 'common';
      if (r < 0.91) return 'uncommon';
      return 'rare';
    }
    if (S.terrace <= 6) {
      if (r < 0.54) return 'common';
      if (r < 0.85) return 'uncommon';
      if (r < 0.99) return 'rare';
      return 'legendary';
    }
    if (r < 0.45) return 'common';
    if (r < 0.77) return 'uncommon';
    if (r < 0.96) return 'rare';
    return 'legendary';
  }

  function genShop() {
    S.shopNum++;
    S.shopSel = null;
    S.shopMode = null;
    S.fuseFirstUid = null;
    S.rerollCost = getRerollCost();
    const priceAdd = getStake().shopPriceAdd;
    const atWildCap = countWildsInBag() >= MAX_WILD_TILES;

    const allUps = Object.values(UPGRADES).filter(u => !(atWildCap && u.id === 'wild_self'));
    const byRarity = {
      common: allUps.filter(u => u.rarity === 'common'),
      uncommon: allUps.filter(u => u.rarity === 'uncommon'),
      rare: allUps.filter(u => u.rarity === 'rare'),
      legendary: allUps.filter(u => u.rarity === 'legendary')
    };
    const fallbackOrder = ['legendary', 'rare', 'uncommon', 'common'];
    const picked = [];
    const usedIds = new Set();

    for (let i = 0; i < 6; i++) {
      const target = rollRarity();
      const startIdx = Math.max(0, fallbackOrder.indexOf(target));
      let chosen = null;
      for (let t = startIdx; t < fallbackOrder.length; t++) {
        const pool = byRarity[fallbackOrder[t]].filter(u => !usedIds.has(u.id));
        if (pool.length) {
          chosen = pickRand(pool);
          break;
        }
      }
      if (!chosen) {
        const anyAvail = allUps.filter(u => !usedIds.has(u.id));
        chosen = pickRand(anyAvail.length ? anyAvail : allUps);
      }
      usedIds.add(chosen.id);
      picked.push(chosen);
    }

    S.shopCards = picked.map(item => ({ item, cost: item.cost + priceAdd, sold: false }));
  }

  function openForgeComboModal(cardIdx, tileUid) {
    const card = S.shopCards[cardIdx];
    const tile = S.bag.find(t => t.uid === tileUid);
    if (!card || card.sold || !tile || S.gold < card.cost) return;
    const choices = shuffleArr(COMBOS).slice(0, 3);
    const sameKeyCount = S.bag.filter(t => !t.lead && letterKey(t) === letterKey(tile)).length;
    pendingComboCtx = { cardIdx, tileUid, choices };
    const intro = sameKeyCount > 1
      ? `<p>Turn <b>1 copy of ${esc(tile.wild ? '?' : tile.letter)} (${fmtC(tile.val)})</b> into one of these combos (keeps all upgrades; your other ${sameKeyCount - 1} copies stay unchanged):</p>`
      : `<p>Turn <b>${esc(tile.wild ? '?' : tile.letter)} (${fmtC(tile.val)})</b> into one of these combos (keeps all stacked upgrades!):</p>`;
    showModal(
      `Forge Combo Tile ($${card.cost})`,
      `${intro}
       <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
         ${choices.map((c, idx) => `<button class="btn gold" style="flex:1;min-width:110px" data-act="pickForgeCombo" data-arg="${idx}">${esc(c.letter)} <small>(${c.val} pts)</small></button>`).join('')}
       </div>`,
      `<button class="btn wood" data-act="closeModal">Cancel</button>`
    );
  }

  function applyCardToTile(cardIdx, tileUid) {
    const card = S.shopCards[cardIdx];
    const tile = S.bag.find(t => t.uid === tileUid);
    if (!card || card.sold || !tile) return;
    if (S.gold < card.cost) {
      SFX.buzz();
      showToast(`Need $${card.cost}!`);
      return;
    }

    if (tile.wild) {
      SFX.buzz();
      showToast('Wild ? tiles cannot receive upgrades!');
      return;
    }

    const up = card.item;
    const origLabel = tile.letter;
    const targets = S.bag.filter(t => !t.lead && letterKey(t) === letterKey(tile));
    if (!targets.length) return;

    if (up.id === 'wild_self') {
      if (countWildsInBag() >= MAX_WILD_TILES) {
        SFX.buzz();
        showToast(`Wild limit reached (max ${MAX_WILD_TILES} Wild ? tiles per run)!`);
        return;
      }
      const cleanPool = targets.slice().sort((a, b) => a.mods.length - b.mods.length || a.val - b.val);
      const target = cleanPool[0];
      S.gold -= card.cost;
      card.sold = true;
      S.shopSel = null;
      S.shopMode = null;
      target.wild = true;
      target.letter = '?';
      // it keeps its forges, except a wild forge (a wild can't make its neighbour wild)
      target.mods = target.mods.filter(m => m !== 'wild_left' && m !== 'wild_right');
      SFX.chord();
      showToast(`1 ${origLabel} became a Wild ?${target.mods.length ? ', forges kept' : ''} (${countWildsInBag()}/${MAX_WILD_TILES})`);
      render();
      return;
    }

    if (up.id === 'wild_left' || up.id === 'wild_right') {
      if (targets.some(t => t.mods.includes('wild_left') || t.mods.includes('wild_right'))) {
        SFX.buzz();
        showToast('A letter can carry only one wild forge (◀? or ?▶).');
        return;
      }
    }

    if (up.id === 'forge_combo') {
      openForgeComboModal(cardIdx, tileUid);
      return;
    }

    S.gold -= card.cost;
    card.sold = true;
    S.shopSel = null;
    S.shopMode = null;

    if (up.id === 'add_self_20') {
      targets.forEach(t => { t.val += 20; });
      SFX.chord();
      showToast(targets.length > 1
        ? `ALL ${targets.length} ${origLabel} tiles boosted +20 → ${fmtC(tile.val)}!`
        : `${origLabel} boosted +20 → ${fmtC(tile.val)}!`);
    } else if (up.id === 'add_self_40') {
      targets.forEach(t => { t.val += 40; });
      SFX.chord();
      showToast(targets.length > 1
        ? `ALL ${targets.length} ${origLabel} tiles boosted +40 → ${fmtC(tile.val)}!`
        : `${origLabel} boosted +40 → ${fmtC(tile.val)}!`);
    } else {
      targets.forEach(t => { t.mods.push(up.id); });
      SFX.chord();
      showToast(targets.length > 1
        ? `Forged ${up.name} onto ALL ${targets.length} ${origLabel} tiles!`
        : `Forged ${up.name} onto ${origLabel}!`);
    }
    render();
  }

  function applyWorkbenchCraft(uid) {
    const tile = S.bag.find(t => t.uid === uid);
    if (!tile) return;

    const burnCost = getBurnCost();
    const cloneCost = getCloneCost();
    const fuseCost = getFuseCost();

    if (S.shopMode === 'burn') {
      if (S.gold < burnCost) { SFX.buzz(); showToast(`Need $${burnCost}!`); return; }
      if (S.bag.length <= MIN_BAG_SIZE) { SFX.buzz(); showToast(`Minimum bag size is ${MIN_BAG_SIZE} tiles!`); return; }
      const same = S.bag.filter(t => !t.lead && letterKey(t) === letterKey(tile));
      if (!same.length) return;
      same.sort((a, b) => a.mods.length - b.mods.length || a.val - b.val);
      const victim = same[0];
      S.gold -= burnCost;
      S.bag = S.bag.filter(t => t.uid !== victim.uid);
      S.shopMode = null;
      const leftCount = same.length - 1;
      const lbl = tile.wild ? '?' : tile.letter;
      SFX.whoosh();
      showToast(leftCount > 0 ? `Burned 1 ${lbl}! (${leftCount} left · Bag: ${S.bag.length})` : `Burned 1 ${lbl}! (Bag: ${S.bag.length})`);
      render();
      return;
    }

    if (S.shopMode === 'clone') {
      if (S.gold < cloneCost) { SFX.buzz(); showToast(`Need $${cloneCost}!`); return; }
      if (tile.wild) { SFX.buzz(); showToast('Wild ? tiles cannot be cloned!'); return; }
      S.gold -= cloneCost;
      S.shopMode = null;
      const kept = tile.mods.slice();
      S.bag.push({
        uid: nextUid(),
        letter: tile.letter,
        val: tile.val,
        wild: false,
        mods: kept
      });
      SFX.win();
      showToast(`Copied ${tile.letter}${kept.length ? ' with its forges' : ''} (bag: ${S.bag.length})`);
      render();
      return;
    }

    if (S.shopMode === 'fuse') {
      if (getStake().noFuse) { SFX.buzz(); showToast('Fuse 2 Tiles is locked on this Stake!'); return; }
      if (S.gold < fuseCost) { SFX.buzz(); showToast(`Need $${fuseCost}!`); return; }
      if (!S.fuseFirstUid) {
        if (tile.wild || tile.letter.length >= 3) {
          SFX.buzz();
          showToast('Pick a 1–2 letter non-wild tile first!');
          return;
        }
        S.fuseFirstUid = uid;
        SFX.pick();
        render();
        return;
      }

      const first = S.bag.find(t => t.uid === S.fuseFirstUid);
      let second = tile;
      if (S.fuseFirstUid === uid) {
        if (first && !first.wild && first.letter.length * 2 <= 3) {
          const sameCopies = S.bag
            .filter(t => t.uid !== first.uid && letterKey(t) === letterKey(first))
            .sort((a, b) => b.mods.length - a.mods.length || b.val - a.val);
          if (sameCopies.length) {
            second = sameCopies[0];
          } else {
            S.fuseFirstUid = null;
            SFX.drop();
            render();
            return;
          }
        } else {
          S.fuseFirstUid = null;
          SFX.drop();
          render();
          return;
        }
      }

      if (!first || second.wild || first.letter.length + second.letter.length > 3) {
        SFX.buzz();
        showToast('Combined letters must be ≤ 3 (no Wilds)!');
        return;
      }
      S.gold -= fuseCost;
      const fused = {
        uid: nextUid(),
        letter: first.letter + second.letter,
        val: first.val + second.val,
        wild: false,
        mods: [...first.mods, ...second.mods]
      };
      S.bag = S.bag.filter(t => t.uid !== first.uid && t.uid !== second.uid);
      S.bag.push(fused);
      S.shopMode = null;
      S.fuseFirstUid = null;
      SFX.win();
      showToast(`Fused into ${fused.letter} (${fmtC(fused.val)} pts${fused.mods.length ? ` · ${fused.mods.length} upgrade${fused.mods.length === 1 ? '' : 's'}` : ''})!`);
      render();
    }
  }

  function tilePrimaryClass(t) {
    if (t.lead) return 'lead';
    if (!t.mods.length) return '';
    if (t.mods.some(m => m === 'power_word' || m.startsWith('replay_'))) return 'mat-prism';
    if (t.mods.some(m => m.startsWith('light_'))) return 'mat-lantern';
    if (t.mods.some(m => m.startsWith('mult_'))) return 'mat-ruby';
    if (t.mods.some(m => m === 'grow_2' || m.startsWith('add_'))) return 'mat-sapphire';
    if (t.mods.some(m => m === 'gold_3')) return 'mat-gilded';
    return 'mat-catalyst';
  }

  function tileHtml(t, opts = {}) {
    const isWildVisual = !t.lead && (t.wild || opts.neighborWild);
    const cls = ['tile'];
    if (isWildVisual) cls.push('wild');
    if (t.letter.length === 2 && !t.lead) cls.push('len2', 'combo-tile');
    if (t.letter.length >= 3 && !t.lead) cls.push('len3', 'combo-tile');
    const matCls = tilePrimaryClass(t);
    if (matCls) cls.push(matCls);
    if (S.swapSet && S.swapSet.has(t.uid)) cls.push('marked');
    if (opts.pickable) cls.push('pickable');
    if (opts.unpickable) cls.push('unpickable');
    if (S.fuseFirstUid === t.uid) cls.push('fuse-picked');

    const modCounts = new Map();
    for (const m of t.mods) {
      modCounts.set(m, (modCounts.get(m) || 0) + 1);
    }
    const entries = [...modCounts.entries()];
    // Up to 3 forges show as tags. Past that: the shop shows a forge bar; the rack and board show the top two and +N.
    const ranked = entries.slice().sort((a, b) => FORGE_RANK(a[0]) - FORGE_RANK(b[0]));
    let chipsHtml = '';
    if (ranked.length > 3 && opts.bar) {
      chipsHtml = forgeBarHtml(ranked);
    } else if (ranked.length) {
      const keep = ranked.length > 3 ? ranked.slice(0, 2) : ranked;
      chipsHtml = `<div class="tile-chips">${keep.map(([mId, cnt]) => glyphHtml(UPGRADES[mId], { count: cnt, cls: 'mini' })).join('')}` +
        `${ranked.length > 3 ? moreChip(ranked.length - 2) : ''}</div>`;
    }

    const ltrHtml = opts.fill
      ? `<span class="ltr res">${esc(opts.fill)}</span>`
      : t.wild
        ? `<span class="ltr">?</span>`
        : `<span class="ltr">${esc(t.letter)}</span>`;

    const tipParts = t.lead
      ? ['Lead Slug (Pb) · 0 pts · Cannot score! Swap it or play for 0 to clear it.']
      : [`${t.wild ? 'Wild ?' : t.letter} · ${fmtC(t.val)} pts`];
    entries.forEach(([mId, cnt]) => {
      const u = UPGRADES[mId];
      tipParts.push(`${u.name}${cnt > 1 ? ` (×${cnt})` : ''}: ${TIPS[mId] || u.short}`);
    });
    if (opts.neighborWild && !t.wild) tipParts.push('Wild right now (from neighbor Wild upgrade)!');
    if (opts.cleanNote) tipParts.push('Clean copy (no upgrades — cloned or starter)');
    if (opts.stackCount && opts.stackCount > 1) {
      tipParts.push(`${opts.stackCount} copies in bag — forging upgrades ALL ${opts.stackCount}!`);
    }

    return `
      <div class="${cls.join(' ')}" ${opts.draggable ? 'draggable="true"' : ''} data-tf-tile="${t.uid}" data-tip-title="${esc(t.lead ? 'Lead Slug' : t.wild ? 'Wild Tile' : 'Tile ' + t.letter)}" data-tip-text="${esc(tipParts.join(' | '))}">
        ${chipsHtml}
        ${isWildVisual ? `<span class="tile-wild-tag">?</span>` : ''}
        ${opts.stackCount > 1 ? `<span class="tile-qty">×${opts.stackCount}</span>` : ''}
        <div class="face">${ltrHtml}<span class="val">${fmtC(t.val)}</span></div>
      </div>
    `;
  }

  function dropTileOnSlot(uid, targetSlot) {
    if (S.busy || S.broken || S.phase !== 'play' || S.swapSet) return false;
    if (targetSlot < 0 || targetSlot > 4) return false;
    const srcLine = S.line.findIndex(t => t && t.uid === uid);
    if (srcLine >= 0) {
      if (srcLine === targetSlot) return false;
      const tmp = S.line[targetSlot];
      S.line[targetSlot] = S.line[srcLine];
      S.line[srcLine] = tmp;
      SFX.pick();
      render();
      return true;
    }
    const srcHand = S.hand.findIndex(t => t.uid === uid);
    if (srcHand >= 0) {
      const displaced = S.line[targetSlot];
      const [moved] = S.hand.splice(srcHand, 1);
      if (displaced) S.hand.splice(srcHand, 0, displaced);
      S.line[targetSlot] = moved;
      SFX.pick();
      render();
      return true;
    }
    return false;
  }

  function dropTileOnRack(uid, targetRackUid = null) {
    if (S.busy || S.broken || S.phase !== 'play' || S.swapSet) return false;
    const srcLine = S.line.findIndex(t => t && t.uid === uid);
    if (srcLine >= 0) {
      const tile = S.line[srcLine];
      S.line[srcLine] = null;
      const dstIdx = targetRackUid ? S.hand.findIndex(t => t.uid === targetRackUid) : -1;
      if (dstIdx >= 0) S.hand.splice(dstIdx, 0, tile);
      else S.hand.push(tile);
      SFX.drop();
      render();
      return true;
    }
    const srcHand = S.hand.findIndex(t => t.uid === uid);
    if (srcHand >= 0 && targetRackUid && targetRackUid !== uid) {
      const origDst = S.hand.findIndex(t => t.uid === targetRackUid);
      if (origDst >= 0) {
        const [moved] = S.hand.splice(srcHand, 1);
        S.hand.splice(origDst, 0, moved);
        SFX.pick();
        render();
        return true;
      }
    }
    return false;
  }

  function placeOrReturnTile(uid) {
    if (S.busy || S.broken || S.phase !== 'play') return;
    if (S.swapSet) {
      if (S.hand.some(t => t.uid === uid)) {
        S.swapSet.has(uid) ? S.swapSet.delete(uid) : S.swapSet.add(uid);
        SFX.pick();
        render();
      }
      return;
    }
    const lineIdx = S.line.findIndex(t => t && t.uid === uid);
    if (lineIdx >= 0) {
      S.hand.push(S.line[lineIdx]);
      S.line[lineIdx] = null;
      SFX.drop();
      render();
      return;
    }
    const handIdx = S.hand.findIndex(t => t.uid === uid);
    if (handIdx >= 0) {
      const filled = S.line.map((t, i) => (t ? i : -1)).filter(i => i >= 0);
      let slot = -1;
      if (!filled.length) slot = 0;
      else {
        const last = filled[filled.length - 1];
        if (last < 4 && !S.line[last + 1]) slot = last + 1;
        else slot = S.line.findIndex(t => !t);
      }
      if (slot < 0) { SFX.buzz(); return; }
      S.line[slot] = S.hand.splice(handIdx, 1)[0];
      SFX.pick();
      render();
    }
  }

  function shiftLine(dir) {
    if (S.busy || S.broken || S.phase !== 'play') return;
    const filled = S.line.map((t, i) => (t ? i : -1)).filter(i => i >= 0);
    if (!filled.length) return;
    if (dir < 0 && filled[0] === 0) return;
    if (dir > 0 && filled[filled.length - 1] === 4) return;
    const next = [null, null, null, null, null];
    S.line.forEach((t, i) => { if (t) next[i + dir] = t; });
    S.line = next;
    SFX.pick();
    render();
  }

  function clearLine() {
    if (S.busy || S.broken) return;
    S.line.forEach(t => { if (t) S.hand.push(t); });
    S.line = [null, null, null, null, null];
    SFX.drop();
    render();
  }

  async function inscribe() {
    if (S.busy || S.broken || S.phase !== 'play' || S.swapSet) return;
    const v = inspectLine(S.line, wildFlagsForLine, auditCheck);
    if (v.empty || !v.contiguous || S.wordsLeft <= 0) {
      SFX.buzz();
      return;
    }

    if (!v.valid) {
      S.busy = true;
      SFX.whoosh();
      await sleep(220);
      S.line = [null, null, null, null, null];
      S.candleSlot = nextCandleSlot(S.candleSlot);
      S.wordsLeft--;
      S.wordsPlayed++;
      S.busy = false;
      if (S.wordsLeft <= 0) { openLoss(); return; }
      drawTilesFromState(S, 7);
      sortHandArr(S.hand, S.sortMode);
      render();
      return;
    }

    S.busy = true;
    const sc = computeScore(v, false);
    S.calcOverride = sc.baseScore;
    render();
    SFX.chord();
    await sleep(200);

    for (let i = 0; i < sc.steps.length; i++) {
      const st = sc.steps[i];
      const el = document.querySelector(`[data-tf-tile="${st.uid}"]`);
      if (el) {
        popEl(el);
        floatAt(el, st.label, st.cls);
      }
      S.calcOverride = st.wordScore;
      const totEl = document.getElementById('tf-word-score');
      if (totEl) totEl.textContent = fmt(st.wordScore);
      if (st.cls === 'mult') SFX.mult(i);
      else if (st.cls === 'echo') SFX.echo(i);
      else if (st.cls === 'gold') SFX.coin();
      else SFX.tick(i);
      await sleep(170);
    }

    S.calcOverride = sc.total;
    const totEl = document.getElementById('tf-word-score');
    if (totEl) {
      totEl.textContent = fmt(sc.total);
      floatAt(totEl, fmt(sc.total), 'total');
    }

    const spec = stageSpec(S.terrace, S.stageInTerrace, S.audit);

    if (!isFinite(sc.total)) {
      S.broken = true;
      const appEl = document.getElementById('app');
      if (appEl) appEl.classList.add('scale-broken');
      const scoreEl = document.getElementById('tf-word-score');
      if (scoreEl) scoreEl.textContent = '∞';
      SFX.bell();
      await sleep(600);
      S.busy = false;
      S.calcOverride = null;
      S.line = [null, null, null, null, null];
      S.wordsPlayed++;
      showBeatitude({
        word: v.word,
        stageLabel: spec.label,
        wordsPlayed: S.wordsPlayed,
        summary: 'Your stacked forges shattered the scoring engine — only a fresh run can mend the ledger.',
        onRestart: () => {
          initState();
          render();
        }
      });
      return;
    }

    await sleep(340);
    S.score += sc.total;
    if (sc.total > (S.bestScore || 0)) { S.bestScore = sc.total; S.bestWord = v.word; }
    S.gold += sc.goldGain;
    if (sc.clonedThisWord.length) {
      showToast(`Copied into your bag: ${sc.clonedThisWord.join(', ')}`);
    }
    S.wordsLeft--;
    S.wordsPlayed++;
    S.wordCounts[v.word] = (S.wordCounts[v.word] || 0) + 1;
    for (const t of v.tiles) {
      if (t.lead) continue;
      const k = letterKey(t);
      S.tileCounts[k] = (S.tileCounts[k] || 0) + 1;
    }
    maybeScheduleAntiSpamAudit(true);
    S.line = [null, null, null, null, null];
    S.candleSlot = nextCandleSlot(S.candleSlot);
    S.calcOverride = null;
    S.busy = false;

    if (S.score >= spec.goal) {
      // one word that covers the whole goal earns the choir and the censer (like Balatro's flames)
      const oneWord = sc.total >= spec.goal;
      if (oneWord) { MUSIC.stinger('D'); SFX.bell(); censerSweep(); } else SFX.win();
      const unusedBonus = Math.min(3, S.wordsLeft);
      const payout = spec.reward + unusedBonus;
      S.gold += payout;
      if (spec.final) {
        openVictory(payout, unusedBonus, spec.reward);
      } else {
        showToast(`${spec.name} cleared! +$${payout} Gold`);
        if (oneWord) { S.busy = true; render(); await sleep(1500); S.busy = false; }
        S.demoBanner = null;
        genShop();
        S.phase = 'shop';
        render();
      }
      return;
    }

    if (S.wordsLeft <= 0) { openLoss(); return; }
    drawTilesFromState(S, 7);
    sortHandArr(S.hand, S.sortMode);
    render();
  }

  function runStatsLine() {
    return `Words played: ${S.wordsPlayed} · Best word: ${S.bestWord ? `“${esc(S.bestWord)}” ${fmtC(S.bestScore)}` : '—'}`;
  }
  function recordBest() {
    const b = readBest();
    if ((S.bestScore || 0) > (b.score || 0)) { b.score = S.bestScore; b.word = S.bestWord; }
    b.terrace = Math.max(b.terrace || 0, S.terrace + 1);
    saveBest(b);
  }
  function homeData() {
    const st = getStake(), b = readBest();
    return {
      stake: `${st.icon} ${esc(st.short)} Stake`,
      stats: b.score ? `Best word: “${esc(b.word || '')}” ${fmtC(b.score)} · Highest: Terrace ${b.terrace || 1}` : ''
    };
  }
  function goHome() {
    closeModal();
    hideBeatitude();
    hideScene();
    initState();
    render();
    showScene('home', homeData());
  }

  function openVictory() {
    markStakeCleared(getStake().id);
    recordBest();
    showScene('win', { stats: runStatsLine() });
    SFX.bell();
    MUSIC.stinger('D');
  }

  function openLoss() {
    const spec = stageSpec(S.terrace, S.stageInTerrace, S.audit);
    recordBest();
    SFX.buzz();
    if (S.terrace >= 7) {
      // running out of words past the seventh terrace isn't a loss: the endless climb ends
      showScene('rest', { stats: runStatsLine(), terrace: S.terrace + 1, beyond: S.terrace - 6 });
      SFX.bell();
      return;
    }
    showScene('lose', { stats: runStatsLine(), terrace: S.terrace + 1, scoreLine: `SCORE ${fmtC(S.score)} OF ${fmtC(spec.goal)}` });
    MUSIC.stinger('E');
  }

  function loadDemoCombo() {
    closeModal();
    hideBeatitude();
    S.broken = false;
    const appEl = document.getElementById('app');
    if (appEl) appEl.classList.remove('scale-broken');
    S.phase = 'play';
    S.busy = false;
    S.swapSet = null;
    S.calcOverride = null;
    S.line = [null, null, null, null, null];
    S.candleSlot = 2;
    S.wordsLeft = Math.max(S.wordsLeft, 4);

    const makeDemoTile = (letter, val, mods = []) => {
      const t = { uid: nextUid(), letter, val, wild: false, mods: [...mods] };
      S.bag.push(t);
      return t;
    };

    S.hand = [
      makeDemoTile('S', 40, ['mult_word_3', 'power_word', 'power_word', 'replay_self', 'replay_right']),
      makeDemoTile('T', 20, ['replay_left', 'mult_left_4']),
      makeDemoTile('A', 20, ['light_all', 'mult_left_3']),
      makeDemoTile('R', 20, ['light_all']),
      makeDemoTile('E', 20, ['mult_word_2']),
      makeDemoTile('N', 10, ['replay_right']),
      makeDemoTile('O', 10, ['replay_left', 'wild_left'])
    ];
    S.demoBanner = 'Demo loaded! Spell S-T-A-R-E (Legendary ^1.25×2 + Rare Ping-Pong ×8 → ∞ Beatitude!), or try N-O for Ping-Pong ×8!';
    SFX.chord();
    render();
  }

  function openRules() {
    const rerollCost = getRerollCost();
    const burnCost = getBurnCost();
    const fuseCost = getFuseCost();
    const cloneCost = getCloneCost();
    showModal(
      'How to Play Tile Forge',
      `<p><b>✨ Everything Stacks:</b> Mix &amp; match <b>+Score</b>, <b>Multiply</b>, <b>Replay</b>, <b>Light</b> &amp; neighbors on any normal letter! <b>Wild ?</b> tiles are capped at <b>2 per run</b>, stay clean (no upgrades or replays), and <b>Clones</b> create clean un-modded copies.</p>
       <p><b>🅰️ Letter-Wide &amp; Thinning:</b> Upgrades apply to <b>ALL copies</b> of a letter! Use <b>🔥 Burn Tile ($${burnCost})</b> to cut unwanted letters, <b>🔗 Fuse 2 Tiles ($${fuseCost})</b> to build digraphs/trigraphs, or <b>📑 Clone +1 ($${cloneCost})</b>.</p>
       <p><b>🏔️ Run Structure, Scale &amp; Anti-Spam Audits:</b> Ascend <b>7 Terraces</b> across <b>15 Audits</b>. Repeating the same word (3×) or tile (7×) schedules a targeted <b>Anti-Spam Audit</b> banning that word or glyph! Open <b>⚙ Menu</b> to tune <b>Goal Scale (10%–200%)</b> or play <b>Stakes</b>.</p>
       <p><b>🕯️ Candlelight &amp; Controls:</b> Tap or drag letters onto the 5 slots (shift with <b>‹ ›</b> onto <b>BRIGHT ×3</b> / <b>WARM ×2</b>) and tap <b>WORD SCORE</b> to play! Directional <b>◀︎ / ▶︎</b> triangles show which neighbor gets buffed.</p>`,
      `<button class="btn gold" data-act="closeModal">Got It</button>`
    );
  }

  function getGoalScaleTag(pct) {
    if (pct <= 25) return 'Story';
    if (pct <= 55) return 'Chill';
    if (pct <= 85) return 'Relaxed';
    if (pct === 100) return 'Standard';
    if (pct <= 145) return 'Challenging';
    return 'Brutal';
  }

  function renderScalePreviewHtml(stakeId, scalePct) {
    const m = effectiveGoalMult(stakeId, scalePct);
    const t1v1 = getRunStageSpec(0, 0, null, m).goal;
    const t4v1 = getRunStageSpec(3, 0, null, m).goal;
    const t4a = getRunStageSpec(3, 2, null, m).goal;
    const t7a = getRunStageSpec(6, 2, null, m).goal;
    return `Goals (<b>${esc(getStake(stakeId).short)} · ${scalePct}%</b>): T1 <b>${fmtC(t1v1)}</b> → T4 V1 <b>${fmtC(t4v1)}</b> → T4 Audit <b>${fmtC(t4a)}</b> → T7 Final <b>${fmtC(t7a)}</b>`;
  }

  function setGoalScale(pct) {
    const next = clampScalePct(pct);
    goalScalePct = next;
    if (S) S.goalScalePct = next;
    writeStorage(LS_SCALE_KEY, next);
    const valEl = document.getElementById('tf-scale-val');
    if (valEl) valEl.textContent = `${next}%`;
    const tagEl = document.getElementById('tf-scale-tag');
    if (tagEl) tagEl.textContent = getGoalScaleTag(next);
    const sliderEl = document.getElementById('tf-scale-slider');
    if (sliderEl) sliderEl.value = String(next);
    const prevEl = document.getElementById('tf-scale-preview');
    if (prevEl) prevEl.innerHTML = renderScalePreviewHtml(menuStakeId, next);
    document.querySelectorAll('.scale-preset[data-act="setGoalScale"]').forEach(btn => {
      btn.classList.toggle('active', +btn.dataset.arg === next);
    });
    render();
  }

  function openMenu(previewStakeId = S ? S.stakeId : activeStakeId) {
    menuStakeId = STAKE_MAP[previewStakeId] ? previewStakeId : getStake().id;
    const picked = getStake(menuStakeId);
    const curId = S ? S.stakeId : activeStakeId;
    const changedStake = menuStakeId !== curId;
    const presetsHtml = SCALE_PRESETS.map(p =>
      `<button class="scale-preset ${S.goalScalePct === p ? 'active' : ''}" data-act="setGoalScale" data-arg="${p}">${p}%</button>`
    ).join('');
    const stakesHtml = STAKES.map(st => {
      const isCur = st.id === curId;
      const isPicked = st.id === menuStakeId;
      const isCleared = clearedStakes.has(st.id);
      return `
        <button class="stake-card stake-${st.id} ${isCur ? 'active' : ''} ${isPicked ? 'picked' : ''}" data-act="pickStake" data-arg="${st.id}">
          <div class="stake-card-top">
            <span class="stake-card-name">${st.icon} ${esc(st.name)}</span>
            <span class="stake-badges">
              ${isCur ? '<span class="stake-badge cur">ACTIVE</span>' : ''}
              ${isCleared ? '<span class="stake-badge cleared">✓ CLEARED</span>' : ''}
            </span>
          </div>
          <div class="stake-card-desc">${esc(st.desc)}</div>
        </button>
      `;
    }).join('');

    const bodyHtml = `
      <div class="menu-section">
        <div class="scale-head">
          <div>
            <b>Goal Scale (10% – 200%)</b>
            <span class="menu-hint">Applies live to every Vigil &amp; Audit!</span>
          </div>
          <div class="scale-readout"><b id="tf-scale-val">${S.goalScalePct}%</b> <span id="tf-scale-tag">${getGoalScaleTag(S.goalScalePct)}</span></div>
        </div>
        <input class="scale-slider" id="tf-scale-slider" type="range" min="10" max="200" step="5" value="${S.goalScalePct}" aria-label="Goal Scale Percentage">
        <div class="scale-presets">${presetsHtml}</div>
        <div class="scale-preview" id="tf-scale-preview">${renderScalePreviewHtml(menuStakeId, S.goalScalePct)}</div>
      </div>

      <div class="menu-section">
        <div class="menu-sec-head"><b>Sound</b></div>
        <label class="vol-row"><span>Music</span><input type="range" id="tf-vol-music" min="0" max="1" step="0.05" value="${VOL.music}"></label>
        <label class="vol-row"><span>Effects</span><input type="range" id="tf-vol-sfx" min="0" max="1" step="0.05" value="${VOL.sfx}"></label>
      </div>

      <div class="menu-section">
        <div class="menu-sec-head">
          <b>Stakes (Cumulative Difficulty)</b>
          <span class="menu-hint">${changedStake ? `Click button below to start ${esc(picked.name)}` : 'Pick a Stake to start a new run with'}</span>
        </div>
        <div class="stakes-grid">${stakesHtml}</div>
      </div>

      <div class="menu-section">
        <div class="menu-sec-head">
          <b>Sandbox &amp; Testing</b>
          <span class="menu-hint">Quick tools</span>
        </div>
        <div class="sandbox-row">
          <button class="btn mini violet" data-act="demoCombo">🧪 Demo ∞ Combo</button>
          <button class="btn mini gold" data-act="addGold">+$20 Gold</button>
          <button class="btn mini wood" data-act="resetTips">Show first-time tips again</button>
        </div>
      </div>
    `;

    const footHtml = changedStake
      ? `<button class="btn wood" data-act="closeModal">Cancel</button>
         <button class="btn gold" data-act="applyStake">Start New Run · ${esc(picked.name)}</button>`
      : `<button class="btn gold" data-act="closeModal">Done</button>`;

    showModal('Tile Forge · Menu', bodyHtml, footHtml);
  }

  function renderNav() {
    const nav = document.getElementById('ws-nav');
    if (!nav) return;
    const st = getStake();
    nav.innerHTML = `
      <div class="nav-brand">
        <span>Tile Forge</span>
        <button class="stake-pill stake-${st.id}" data-act="menu" title="Open Menu: Goal Scale &amp; Stakes">${st.icon} ${esc(st.short)} Stake${S.goalScalePct !== 100 ? ` · ${S.goalScalePct}%` : ''}</button>
      </div>
      <div class="nav-tools">
        <button class="btn mini gold" data-act="menu">⚙ Menu</button>
        <button class="btn mini wood" data-act="restart">↺ New Run</button>
        <button class="btn mini wood" data-act="rules">? Rules</button>
      </div>
    `;
  }

  function renderHud(spec) {
    const st = getStake();
    const pct = spec.goal ? Math.min(100, (S.score / spec.goal) * 100) : 0;
    const pips = [0, 1, 2].map(i => `<i class="${i < S.stageInTerrace ? 'done' : i === S.stageInTerrace ? 'cur' : ''} ${i === 2 ? 'final' : ''}"></i>`).join('');
    return `
      <div class="hud">
        <div class="plate">
          <div class="plate-top"><span>${esc(spec.label.toUpperCase())}</span><span class="pips">${pips}</span></div>
          <div class="plate-name">${esc(spec.name)}</div>
          <div class="plate-goal">Goal: <b>${fmtC(spec.goal)}</b>${S.goalScalePct !== 100 ? ` <small class="goal-scale-note">(${S.goalScalePct}%)</small>` : ''}</div>
        </div>
        <div class="scorebox">
          <div class="lbl">SCORE</div>
          <div class="score">${fmtC(S.score)}</div>
          <div class="bar"><i style="width:${pct}%"></i></div>
        </div>
        <div class="hud-stats">
          <div class="stat words"><span class="lbl">WORDS</span><b>${S.phase === 'play' ? S.wordsLeft : st.wordsPerStage}</b></div>
          <div class="stat swaps"><span class="lbl">SWAPS</span><b>${S.phase === 'play' ? S.swapsLeft : st.swapsPerStage}</b></div>
          <div class="stat gold"><span class="lbl">GOLD</span><b>$${S.gold}</b></div>
        </div>
      </div>
    `;
  }

  function renderPlay(spec) {
    const v = inspectLine(S.line, wildFlagsForLine, auditCheck);
    const sc = v.empty ? null : computeScore(v, true);
    const displayScore = S.calcOverride !== null ? S.calcOverride : (sc && v.valid ? sc.total : 0);
    const judge = renderAngelFeedback(v);
    const filledIdx = S.line.map((t, i) => (t ? i : -1)).filter(i => i >= 0);
    const fillMap = {};
    const neighborWildMap = {};
    if (!v.empty) {
      v.positions.forEach((p, j) => {
        if (v.fills && v.fills[j]) fillMap[p] = v.fills[j];
        if (v.wildFlags && v.wildFlags[j]) neighborWildMap[p] = true;
      });
    }

    const snuffed = isAudit() && S.audit && S.audit.id === 'snuffed';
    const lightLevels = sc ? sc.lightLevels : computeSlotLights(S.line, S.candleSlot, countMod, snuffed);
    const allBlazing = lightLevels.every(lv => lv >= 2);
    const willClear = v.valid && (S.score + displayScore >= spec.goal);
    const nudgeLeft = !v.empty && !v.positions.includes(S.candleSlot) && S.candleSlot < v.positions[0] && filledIdx[0] > 0;
    const nudgeRight = !v.empty && !v.positions.includes(S.candleSlot) && S.candleSlot > v.positions[v.positions.length - 1] && filledIdx[filledIdx.length - 1] < 4;

    const canDrag = !S.swapSet && !S.busy && !S.broken;
    const candleMoved = lastCandleSlot !== null && lastCandleSlot !== S.candleSlot;
    lastCandleSlot = S.candleSlot;
    if (candleMoved) setTimeout(() => SFX.flare(), 60);
    const slotsHtml = S.line.map((t, i) => {
      const info = lightInfoFromLevel(lightLevels[i]);
      return `
        <div class="vslot" style="--fd:-${((i * 0.53) % 1.3).toFixed(2)}s">
          ${renderCandleHead(i, S.candleSlot, lightLevels[i], snuffed, candleMoved)}
          <div class="vcell light-${info.level}" data-slot-idx="${i}">${t ? tileHtml(t, { fill: fillMap[i], neighborWild: !!neighborWildMap[i], draggable: canDrag }) : `<span class="pnum">${info.mult > 1 ? '×' + fmtC(info.mult) : ''}</span>`}</div>
        </div>
      `;
    }).join('');

    const auditBannerHtml = spec.isAudit && spec.audit
      ? `<div class="audit-banner"><b>⚔️ AUDIT · ${esc(spec.audit.name)}:</b> ${esc(spec.audit.desc)}</div>`
      : '';

    const infoHtml = S.demoBanner
      ? `<div class="info-strip demo"><div><b>🧪 DEMO GUIDE:</b> ${esc(S.demoBanner)}</div></div>`
      : S.swapSet
        ? `<div class="info-strip"><div>Tap rack tiles to swap them · ${S.swapSet.size} marked</div></div>`
        : '';

    const lenBonus = v.empty ? 0 : (LENGTH_BONUS[v.count] || 0);
    const breakdownText = v.empty
      ? 'Spell a word on the line'
      : `${WORD_NAMES[v.count]}${lenBonus ? ` (+${lenBonus} length bonus)` : ''} · ${S.score < spec.goal ? `${fmtC(Math.max(0, spec.goal - S.score))} left to goal` : 'Goal reached!'}`;

    const noRackTiles = !S.hand.length;
    let angelTextHtml = judge.text;
    if (v.valid) {
      const def = lookupWordDef(v.word, (w, d) => {
        const el = document.getElementById('tf-word-def');
        if (el && el.dataset.word === w) {
          el.textContent = d;
          el.title = d;
        }
      });
      const shownDef = def || 'Valid dictionary word.';
      angelTextHtml = `<span class="word">${esc(v.word)}</span> <span class="word-def-sep">—</span> <span id="tf-word-def" class="word-def" data-word="${esc(v.word)}" title="${esc(shownDef)}">${esc(shownDef)}</span>`;
    }

    const actionHtml = S.swapSet
      ? `
        <div class="actions swap-actions">
          <button class="btn wood swap-btn" data-act="cancelSwap">Cancel</button>
          <button class="btn gold" data-act="swapAll" ${S.swapsLeft <= 0 || noRackTiles ? 'disabled' : ''}>Swap All Rack (${S.hand.length})</button>
          <button class="btn cinnabar grow" data-act="confirmSwap" ${S.swapSet.size ? '' : 'disabled'}>Swap ${S.swapSet.size || ''} Tile${S.swapSet.size === 1 ? '' : 's'}</button>
        </div>
      `
      : `
        <div class="actions">
          <button class="btn cinnabar swap-btn" data-act="startSwap" ${S.swapsLeft <= 0 || noRackTiles || S.busy || S.broken ? 'disabled' : ''}>Swap (${S.swapsLeft})</button>
          <button class="btn cinnabar" data-act="swapAll" ${S.swapsLeft <= 0 || noRackTiles || S.busy || S.broken ? 'disabled' : ''} title="Swap all tiles on your rack (tiles on the board stay put!)">${filledIdx.length ? `Swap Rack (${S.hand.length})` : 'Swap All'}</button>
          <button class="btn wood" data-act="sort">Sort ${S.sortMode === 'az' ? 'A–Z' : 'Score'}</button>
          <button class="btn wood" data-act="bag">Bag (${S.draw.length}/${S.bag.length})</button>
          <button class="btn ${v.valid || v.empty ? 'lapis' : 'wood'} grow" data-act="inscribe" ${v.empty || !v.contiguous || S.busy || S.broken ? 'disabled' : ''}>
            Play Word${S.busy ? '' : v.valid ? ` <small>+${fmtC(sc.total)}</small>` : (!v.empty && v.contiguous ? ' <small>(for 0)</small>' : '')}
          </button>
        </div>
      `;

    return `
      ${renderHud(spec)}
      ${auditBannerHtml}
      ${infoHtml}
      <div class="book-cover">
        <div class="book-page">
          <div class="angel-line">${ANGEL_SVG}<div class="judgement ${judge.cls}">${angelTextHtml}</div></div>
          <div class="verse-wrap">
            <button class="shift ${nudgeLeft ? 'nudge' : ''}" data-act="shift" data-arg="-1" ${!filledIdx.length || filledIdx[0] === 0 ? 'disabled' : ''} title="Shift word left">‹</button>
            <div class="verse-line-wrap" style="overflow:hidden">
              <div class="candle-halo ${allBlazing ? 'all-lit' : ''}" style="left:${S.candleSlot * 20 - 7}%"></div>
              <div class="verse-line">${slotsHtml}</div>
            </div>
            <button class="shift ${nudgeRight ? 'nudge' : ''}" data-act="shift" data-arg="1" ${!filledIdx.length || filledIdx[filledIdx.length - 1] === 4 ? 'disabled' : ''} title="Shift word right">›</button>
          </div>
          <div class="word-score-wrap">
            <div class="word-score-row">
              <span class="ws-spacer" aria-hidden="true"></span>
              <button class="word-score-box ${willClear ? 'ablaze' : ''} ${!v.empty && !v.valid && v.contiguous ? 'void-btn' : ''}" data-act="inscribe" ${v.empty || !v.contiguous || S.busy || S.broken ? 'disabled' : ''}>
                <small>${v.empty ? 'WORD SCORE' : v.valid ? '▶ TAP TO PLAY WORD' : '▶ PLAY FOR 0'}</small>
                <b id="tf-word-score">${S.calcOverride !== null ? fmt(S.calcOverride) : (v.empty ? '0' : (v.valid ? fmt(displayScore) : '0'))}</b>
              </button>
              <div class="ws-side">
                ${filledIdx.length && !S.swapSet ? `<button class="btn mini wood clear-near-btn" data-act="clear" title="Return all board tiles to your rack">↩ Clear</button>` : ''}
              </div>
            </div>
            <div class="word-score-sub">${breakdownText}</div>
          </div>
        </div>
      </div>
      <div class="rack-box" data-drop-rack="1">
        <div class="rack-tiles">${S.hand.length ? S.hand.map(t => tileHtml(t, { draggable: canDrag })).join('') : '<span>Rack empty</span>'}</div>
      </div>
      ${actionHtml}
    `;
  }

  function renderShop(spec) {
    const nextT = S.stageInTerrace === 2 ? S.terrace + 1 : S.terrace;
    const nextS = S.stageInTerrace === 2 ? 0 : S.stageInTerrace + 1;
    const previewAudit = S.stageInTerrace === 2 ? S.nextAudit : S.audit;
    const nextSpec = stageSpec(nextT, nextS, previewAudit);
    const burnCost = getBurnCost();
    const cloneCost = getCloneCost();
    const fuseCost = getFuseCost();
    const rerollCost = getRerollCost();
    const noFuse = getStake().noFuse;

    const selCard = S.shopMode === 'card' && S.shopSel !== null ? S.shopCards[S.shopSel] : null;
    const anyTargeting = !!selCard || S.shopMode === 'burn' || S.shopMode === 'clone' || S.shopMode === 'fuse';

    const isUpgraded = t => t.mods.length > 0 || t.wild || t.letter.length >= 2 || t.val > (LETTERS[t.letter] ? LETTERS[t.letter][0] : 20);

    const groups = new Map();
    for (const t of S.bag) {
      if (t.lead) continue;
      const key = letterKey(t);
      const gk = key + (t.mods.length > 0 ? ':U' : ':C');
      if (!groups.has(gk)) groups.set(gk, { key, list: [] });
      groups.get(gk).list.push(t);
    }
    const stackKeySort = (k) => (k === '?' ? '~~' : k.length === 1 ? '0' + k : '1' + k);
    const sortGroup = (arr) => arr.slice().sort((a, b) => b.mods.length - a.mods.length || b.val - a.val);
    const allStacks = [...groups.values()].map(({ key, list }) => {
      const sorted = sortGroup(list);
      const rep = sorted[0];
      return {
        key,
        list,
        tile: rep,
        count: list.length,
        cleanNote: rep.mods.length === 0 && S.bag.some(t => !t.lead && letterKey(t) === key && t.mods.length > 0),
        upgraded: list.some(isUpgraded),
        combo: !rep.wild && !rep.lead && rep.letter.length >= 2,
        vowel: !rep.wild && 'AEIOU'.includes(rep.letter),
        high: list.some(t => t.val >= 30)
      };
    });

    const canTargetStack = (st) => {
      const rep = st.tile;
      if (selCard) {
        if (rep.wild) return false;
        if (selCard.item.id === 'wild_self') return countWildsInBag() < MAX_WILD_TILES;
        if (selCard.item.id === 'wild_left' || selCard.item.id === 'wild_right') {
          const allSame = S.bag.filter(t => !t.lead && letterKey(t) === st.key);
          return !allSame.some(t => t.mods.includes('wild_left') || t.mods.includes('wild_right'));
        }
        return true;
      }
      if (S.shopMode === 'clone') return !rep.wild;
      if (S.shopMode === 'fuse') {
        if (!S.fuseFirstUid) return !rep.wild && rep.letter.length < 3;
        const first = S.bag.find(t => t.uid === S.fuseFirstUid);
        if (!first) return !rep.wild && rep.letter.length < 3;
        if (st.list.some(t => t.uid === first.uid)) {
          return !first.wild && first.letter.length * 2 <= 3 &&
            S.bag.some(t => t.uid !== first.uid && letterKey(t) === letterKey(first));
        }
        return !rep.wild && first.letter.length + rep.letter.length <= 3;
      }
      if (S.shopMode === 'burn') return S.bag.length > MIN_BAG_SIZE;
      return false;
    };

    const upStacks = allStacks.filter(s => s.upgraded).sort((a, b) => stackKeySort(a.key).localeCompare(stackKeySort(b.key)) || b.tile.mods.length - a.tile.mods.length);
    const comboStacks = allStacks.filter(s => s.combo).sort((a, b) => stackKeySort(a.key).localeCompare(stackKeySort(b.key)) || b.tile.mods.length - a.tile.mods.length);
    const vowelStacks = allStacks.filter(s => s.vowel).sort((a, b) => stackKeySort(a.key).localeCompare(stackKeySort(b.key)) || b.tile.mods.length - a.tile.mods.length);
    const highStacks = allStacks.filter(s => s.high).sort((a, b) => b.tile.val - a.tile.val || stackKeySort(a.key).localeCompare(stackKeySort(b.key)) || b.tile.mods.length - a.tile.mods.length);
    const allSortedStacks = [...allStacks].sort((a, b) => (b.upgraded - a.upgraded) || stackKeySort(a.key).localeCompare(stackKeySort(b.key)) || b.tile.mods.length - a.tile.mods.length);

    // A rough strength score: base points through every forge, so you can see which letter to build next.
    const tilePower = (t) => {
      const c = (id) => countMod(t, id);
      let p = Math.max(1, t.val);
      p *= Math.pow(2, c('mult_self_2')) * Math.pow(3, c('mult_self_3')) * (1 + c('replay_self')) * Math.pow(2, c('grow_2')) *
        Math.pow(2, c('mult_word_2')) * Math.pow(3, c('mult_word_3')) * Math.pow(3, c('power_word')) * (c('light_self') ? 3 : 1);
      p += 30 * (c('add_left_30') + c('add_right_30')) + 15 * c('gold_3');
      p *= 1 + 0.5 * (c('mult_left_2') + c('mult_right_2')) + (c('mult_left_3') + c('mult_right_3')) + 1.5 * (c('mult_left_4') + c('mult_right_4')) +
        0.6 * (c('replay_left') + c('replay_right')) + 0.5 * (c('light_left') + c('light_right')) + 1.5 * c('light_all') +
        0.3 * (c('clone_self') + c('clone_left') + c('clone_right')) + 0.4 * (c('wild_left') + c('wild_right'));
      return p;
    };
    const strongStacks = [...allStacks].sort((a, b) => tilePower(b.tile) - tilePower(a.tile));

    let shownStacks;
    if (S.wbFilter === 'strong') shownStacks = strongStacks;
    else if (S.wbFilter === 'upgraded') shownStacks = upStacks;
    else if (S.wbFilter === 'combos') shownStacks = comboStacks;
    else if (S.wbFilter === 'vowels') shownStacks = vowelStacks;
    else if (S.wbFilter === 'high') shownStacks = highStacks;
    else shownStacks = allSortedStacks;

    const wbTitleHtml = `Your letters <small>${S.bag.length} tiles</small>`;
    const wbFiltersHtml = `
      <button class="wb-filter ${S.wbFilter === 'all' ? 'active' : ''}" data-act="wbFilter" data-arg="all">All</button>
      <button class="wb-filter ${S.wbFilter === 'strong' ? 'active' : ''}" data-act="wbFilter" data-arg="strong" data-tip-title="Strongest" data-tip-text="Your letters from strongest to weakest, counting their points and forges.">Strongest</button>
      <button class="wb-filter ${S.wbFilter === 'upgraded' ? 'active' : ''}" data-act="wbFilter" data-arg="upgraded">Forged</button>
      <button class="wb-filter ${S.wbFilter === 'vowels' ? 'active' : ''}" data-act="wbFilter" data-arg="vowels">Vowels</button>
      ${comboStacks.length ? `<button class="wb-filter ${S.wbFilter === 'combos' ? 'active' : ''}" data-act="wbFilter" data-arg="combos">Pairs</button>` : ''}
    `;
    const wbTilesHtml = shownStacks.length
      ? shownStacks.map(st => {
          const ok = anyTargeting ? canTargetStack(st) : false;
          return tileHtml(st.tile, { pickable: ok, unpickable: anyTargeting && !ok, stackCount: st.count, cleanNote: st.cleanNote, bar: true });
        }).join('')
      : '<span style="color:#cbb282;font-style:italic">No letter stacks in this filter yet.</span>';

    const cardsHtml = S.shopCards.map((c, idx) => {
      const u = c.item;
      const rm = RARITY_META[u.rarity || 'common'];
      const isSel = S.shopMode === 'card' && S.shopSel === idx;
      const cant = S.gold < c.cost;
      const tipTitle = `${u.name} · ${rm.label.charAt(0) + rm.label.slice(1).toLowerCase()}`;
      return `
        <button class="scard cat-${u.cat} ${rm.cls} ${c.sold ? 'sold' : ''} ${isSel ? 'selected' : ''} ${cant && !c.sold ? 'cant' : ''}"
          data-act="pickCard" data-arg="${idx}" data-card-idx="${idx}" ${c.sold ? 'disabled' : ''}
          data-tip-title="${esc(tipTitle)}" data-tip-text="${esc(tipFor(u))}${cant && !c.sold ? ` (Need $${c.cost}.)` : ''}">
          ${glyphHtml(u, { cls: 'big' })}
          <span class="scard-price">${c.sold ? 'Forged' : `<i class="coin" aria-hidden="true">$</i>${c.cost}`}</span>
          <span class="rar-dot ${rm.cls}" aria-hidden="true"></span>
        </button>
      `;
    }).join('');

    let guideMsg = '';
    if (selCard) {
      guideMsg = `${glyphHtml(selCard.item, { cls: 'inline' })} <span>${ONE_COPY.has(selCard.item.id) ? 'Tap a letter to change one copy.' : 'Tap a letter to forge every copy of it.'}</span>`;
    } else if (S.shopMode === 'burn') {
      guideMsg = `<span>🔥 Tap a letter to burn one copy out of your bag.</span>`;
    } else if (S.shopMode === 'clone') {
      guideMsg = `<span>⧉ Tap a letter to add a copy of it, forges and all, to your bag.</span>`;
    } else if (S.shopMode === 'fuse') {
      const fTile = S.fuseFirstUid ? S.bag.find(t => t.uid === S.fuseFirstUid) : null;
      guideMsg = fTile
        ? `<span>🔗 Now tap a second letter to join with <b>${esc(fTile.letter)}</b> (3 letters at most).</span>`
        : `<span>🔗 Tap the first letter to fuse.</span>`;
    }

    const auditPreviewHtml = previewAudit
      ? (nextSpec.isAudit
          ? `<div class="audit-banner"><b>⚔️ Next: ${esc(previewAudit.name)}</b> ${esc(previewAudit.desc)}</div>`
          : `<div class="audit-banner shop-audit-preview"><b>Terrace ${nextT + 1} Audit: ${esc(previewAudit.name)}</b> ${esc(previewAudit.desc)}</div>`)
      : '';

    return `
      ${renderHud(spec)}
      <div class="shop-wrap">
        <div class="shop-head">
          <div>
            <div class="shop-title">The Forge</div>
            <div class="shop-sub">Next goal <b>${fmtC(nextSpec.goal)}</b></div>
          </div>
          <div class="coin-badge" data-tip-title="Gold" data-tip-text="Spend it on forges. Unspent gold carries over to the next shop."><i class="coin" aria-hidden="true">$</i><b>${S.gold}</b></div>
        </div>

        ${auditPreviewHtml}

        ${guideMsg ? `<div class="shop-guide">${guideMsg}<button class="btn mini wood" data-act="cancelPick">Cancel</button></div>` : ''}

        <div class="shop-body">
          <div class="shop-cards">${cardsHtml}</div>

          <div class="workbench">
            <div class="wb-head">
              <div>
                <div class="wb-title">${wbTitleHtml}</div>
                <div class="wb-filters" style="margin-top:4px">
                  ${wbFiltersHtml}
                </div>
              </div>
              <div class="wb-crafts">
                <button class="craft ${S.shopMode === 'burn' ? 'on' : ''}" data-act="startBurn" ${S.gold < burnCost || S.bag.length <= MIN_BAG_SIZE ? 'disabled' : ''} data-tip-title="Burn" data-tip-text="Remove one copy of a letter from your bag, so your good letters come up more often. Your bag keeps at least ${MIN_BAG_SIZE} tiles.">🔥 <i class="coin" aria-hidden="true">$</i><b>${burnCost}</b></button>
                <button class="craft ${S.shopMode === 'clone' ? 'on' : ''}" data-act="startClone" ${S.gold < cloneCost ? 'disabled' : ''} data-tip-title="Clone" data-tip-text="Add a copy of a letter to your bag, forges and all.">⧉ <i class="coin" aria-hidden="true">$</i><b>${cloneCost}</b></button>
                <button class="craft ${S.shopMode === 'fuse' ? 'on' : ''}" data-act="startFuse" ${noFuse || S.gold < fuseCost ? 'disabled' : ''} data-tip-title="Fuse" data-tip-text="${noFuse ? 'Locked on this Stake.' : 'Join two letters into one tile (like T + H = TH). Points and forges add together.'}">🔗 ${noFuse ? '<b>🔒</b>' : `<i class="coin" aria-hidden="true">$</i><b>${fuseCost}</b>`}</button>
              </div>
            </div>
            <div class="wb-tiles">
              ${wbTilesHtml}
            </div>
          </div>
        </div>

        <div class="actions shop-actions">
          <button class="btn wood reroll-btn" data-act="reroll" ${S.gold < rerollCost ? 'disabled' : ''}>Reroll <span class="cost"><i class="coin" aria-hidden="true">$</i>${rerollCost}</span></button>
          <button class="btn ${nextSpec.isAudit ? 'cinnabar' : 'verd'} grow" data-act="nextStage">${nextSpec.isAudit ? 'Face the Audit' : 'Next Vigil'} ›</button>
        </div>
      </div>
    `;
  }

  function render() {
    renderNav();
    const app = document.getElementById('app');
    const main = document.getElementById('ws-main');
    if (!app || !main) return;
    app.classList.toggle('phase-shop', S.phase === 'shop');
    app.classList.toggle('boss-stage', S.phase === 'play' && isAudit());
    app.classList.toggle('scale-broken', !!S.broken);
    const spec = stageSpec(S.terrace, S.stageInTerrace, S.audit);
    main.innerHTML = S.phase === 'shop' ? renderShop(spec) : renderPlay(spec);
    if (!sceneOpen()) MUSIC.setScene(S.phase === 'shop' ? 'shop' : isAudit() ? 'audit' : 'play');
    setTimeout(runCoach, 0);
  }

  // What an Audit actually does, in plain words (first-time hints).
  function auditHelp(a) {
    if (!a) return '';
    const ls = (a.mutedChars || '').split('');
    const letters = ls.length > 1 ? ls.slice(0, -1).join(', ') + ' and ' + ls[ls.length - 1] : ls.join('');
    const lower = a.goalMult && a.goalMult < 1 ? ' The goal is lower to make up for it.' : '';
    const say = {
      half_vowels: 'Vowels (A E I O U) score half their points. Lean on consonants.',
      mute_1_vowel: `${letters || 'One vowel'} scores 0 points. Build words around the other vowels.`,
      mute_2_vowels: `${letters || 'Two vowels'} score 0 points. Build words around the other vowels.`,
      half_cons: 'Consonants score half their points. Vowel-heavy words do better.',
      no_plosives: `${letters} score 0 points. Spell around them.`,
      no_fricatives: `${letters} score 0 points. Spell around them.`,
      no_liquids: `${letters} score 0 points. Spell around them.`,
      no_start_cons: 'If a word starts with a consonant, that first letter scores 0. Start with a vowel when you can.',
      no_end_cons: 'If a word ends with a consonant, that last letter scores 0. End on a vowel when you can.',
      snuffed: 'The candle is out: no ×3 or ×2 slots, unless your flame forges light them.',
      min_4: 'Only words of 4 or 5 tiles count. Shorter words score 0.',
      max_3: 'Only words of 1 to 3 tiles count. Longer words score 0.',
      must_repeat: 'Your word must use a letter twice, like BOOK or TREE, or it scores 0.',
      lead_tiles: 'Two lead slugs (Pb) are mixed into your bag. They’re worth 0 and can’t spell anything: swap them out, or play one alone for 0 to clear it.',
      no_replay: 'Replay forges (↻) don’t fire this round.',
      ban_word: `You played “${a.bannedWord}” too often. It, and any word containing it, scores 0 this round.`,
      vowel_fast: 'Your build leans on vowels. This round, vowels (A E I O U) score 0 and their forges don’t fire: your consonants and letter pairs have to carry the words.',
      censor_tile: `You leaned on ${a.censoredKey === '?' ? 'Wild ?' : a.censoredKey} too much. Those tiles score 0 and halve the word’s score this round.`
    }[a.id] || a.desc;
    return `<b>${esc(a.name)}:</b> ${say}${lower}`;
  }

  // ---- First-time hints: one at a time, only until you've done the thing ----
  function pickCoach() {
    const seen = (id) => coachSeen[id];
    const audit = document.querySelector('.audit-banner');
    const hover = lastPtr === 'mouse' && matchMedia('(hover: hover)').matches;
    if (S.phase === 'play') {
      const v = inspectLine(S.line, wildFlagsForLine, auditCheck);
      if (!seen('tap')) {
        if (!v.empty || S.wordsPlayed > 0) coachMark('tap');
        else return { id: 'tap', sel: '.rack-tiles', above: true, text: 'Tap a letter to set it on the line.' };
      }
      if (!seen('play')) {
        if (S.wordsPlayed > 0) coachMark('play');
        else if (v.valid) return { id: 'play', sel: '.word-score-box', text: 'That’s a word! Tap the score to play it.' };
        else return null;
      }
      if (!seen('candle')) {
        if (S.wordsPlayed >= 4) coachMark('candle');
        else return { id: 'candle', sel: '.candle-head.is-candle', gotIt: true,
          text: 'A letter under the candle scores <span class="tt-light">×3</span>, and <span class="tt-light">×2</span> beside it. The candle moves after every word.' };
      }
      if (!seen('hold')) {
        if (S.wordsPlayed >= 6) coachMark('hold');
        else return { id: 'hold', sel: '.rack-tiles', above: true, gotIt: true,
          text: hover ? 'Hover a letter to see its points and forges.' : 'Press and hold a letter to see its points and forges.' };
      }
      if (!seen('audit') && Object.keys(coachSeen).some(k => k.startsWith('audit:'))) coachMark('audit');
      if (isAudit() && S.audit) {
        const key = 'audit:' + S.audit.id;
        if (!seen(key)) {
          const lead = S.audit.id === 'lead_tiles' && document.querySelector('.rack-tiles .tile.lead');
          return { id: key, sel: lead ? '.rack-tiles .tile.lead' : '.audit-banner', above: !!lead, gotIt: true,
            text: (seen('audit') ? '' : 'This is an Audit, the boss round with a special rule. ') + auditHelp(S.audit) };
        }
        if (!seen('audit')) coachMark('audit');
      }
      if (!seen('more') && seen('hold') && seen('forge')) return { id: 'more', sel: '#ws-nav [data-act="rules"]', gotIt: true,
        text: 'That’s the basics. Rules has the rest, and the Menu has sound, difficulty and Stakes.' };
      return null;
    }
    if (S.phase === 'shop') {
      if (!seen('shop')) {
        if (S.shopMode === 'card' || S.shopCards.some(c => c.sold)) coachMark('shop');
        else return { id: 'shop', sel: '.shop-cards', text: 'Welcome to the Forge. Tap an upgrade to pick it. Its point shows which letter it powers up.' };
      }
      if (!seen('forge')) {
        if (S.shopCards.some(c => c.sold)) coachMark('forge');
        else if (S.shopMode === 'card') return { id: 'forge', sel: '.wb-tiles', text: 'Now tap a letter. Every copy of it in your bag gets the forge.' };
      }
      const nextAudit = S.stageInTerrace === 2 ? S.nextAudit : S.audit;
      if (!seen('audit') && audit) return { id: 'audit', sel: '.audit-banner', gotIt: true,
        text: 'An Audit is coming: a boss round with a special rule. ' + auditHelp(nextAudit) };
      if (!seen('more') && seen('hold') && seen('forge')) return { id: 'more', sel: '#ws-nav [data-act="rules"]', gotIt: true,
        text: 'That’s the basics. Rules has the rest, and the Menu has sound, difficulty and Stakes.' };
    }
    return null;
  }
  function runCoach() {
    const modalOpen = document.getElementById('modal').classList.contains('open');
    if (sceneOpen() || modalOpen || S.busy || S.broken) { coachClear(); return; }
    const step = pickCoach();
    if (step) coachShow(step); else coachClear();
  }
  document.addEventListener('tf-coach-refresh', () => runCoach());
  window.addEventListener('scroll', () => { if (coachCur) runCoach(); }, { passive: true });

  function handleAction(act, arg) {
    switch (act) {
      case 'closeModal': closeModal(); pendingComboCtx = null; return;
      case 'rules': openRules(); return;
      case 'menu': openMenu(); return;
      case 'setGoalScale': setGoalScale(+arg); SFX.pick(); return;
      case 'pickStake': openMenu(arg); SFX.pick(); return;
      case 'applyStake': {
        activeStakeId = STAKE_MAP[menuStakeId] ? menuStakeId : 'white';
        writeStorage(LS_STAKE_KEY, activeStakeId);
        closeModal();
        hideBeatitude();
        initState();
        SFX.chord();
        render();
        showToast(`${getStake().icon} Started ${getStake().name}!`);
        return;
      }
      case 'demoCombo': loadDemoCombo(); return;
      case 'addGold': S.gold += 20; SFX.coin(); render(); return;
      case 'restart': case 'toHome': goHome(); return;
      case 'startRun': hideScene(); closeModal(); initState(); render(); SFX.chord(); return;
      case 'retryStage': closeModal(); hideScene(); startStage(S.terrace, S.stageInTerrace); render(); return;
      case 'endless': closeModal(); hideScene(); S.demoBanner = null; genShop(); S.phase = 'shop'; render(); return;
      case 'resetTips': coachReset(); closeModal(); render(); showToast('First-time tips will show again.'); return;
      case 'inscribe': inscribe(); return;
      case 'clear': clearLine(); return;
      case 'shift': shiftLine(+arg); return;
      case 'sort': S.sortMode = S.sortMode === 'az' ? 'val' : 'az'; sortHandArr(S.hand, S.sortMode); SFX.pick(); render(); return;
      case 'startSwap':
        if (S.busy || S.broken || S.phase !== 'play' || S.swapsLeft <= 0) return;
        if (!S.hand.length) {
          SFX.buzz();
          showToast('No tiles on your rack to swap — move one down from the board first!');
          return;
        }
        S.swapSet = new Set();
        SFX.pick();
        render();
        return;
      case 'cancelSwap': S.swapSet = null; render(); return;
      case 'cancelPick': S.shopSel = null; S.shopMode = null; S.fuseFirstUid = null; hideTip(); SFX.drop(); render(); return;
      case 'swapAll': {
        if (S.busy || S.broken || S.phase !== 'play' || S.swapsLeft <= 0) return;
        if (!S.hand.length) {
          SFX.buzz();
          showToast('No tiles on your rack to swap — move one down from the board first!');
          return;
        }
        const swapped = S.hand.length;
        const kept = S.line.filter(Boolean).length;
        S.hand = [];
        S.swapSet = null;
        S.swapsLeft--;
        drawTilesFromState(S, 7);
        sortHandArr(S.hand, S.sortMode);
        SFX.whoosh();
        showToast(
          kept > 0
            ? `Swapped ${swapped} rack tile${swapped === 1 ? '' : 's'} (${kept} kept on board · ${S.swapsLeft} swap${S.swapsLeft === 1 ? '' : 's'} left)`
            : `Swapped all ${swapped} tiles! (${S.swapsLeft} swap${S.swapsLeft === 1 ? '' : 's'} left)`
        );
        render();
        return;
      }
      case 'confirmSwap': {
        if (!S.swapSet || !S.swapSet.size) return;
        const out = S.swapSet;
        S.hand = S.hand.filter(t => !out.has(t.uid));
        S.swapSet = null;
        S.swapsLeft--;
        drawTilesFromState(S, 7);
        sortHandArr(S.hand, S.sortMode);
        SFX.whoosh();
        render();
        return;
      }
      case 'bag': {
        const sorted = [...S.bag].sort((a, b) => (a.wild ? 1 : 0) - (b.wild ? 1 : 0) || a.letter.localeCompare(b.letter));
        showModal(
          `Your Bag (${S.draw.length} left to draw / ${S.bag.length} total)`,
          `<div class="bag-grid">${sorted.map(t => tileHtml(t)).join('')}</div>`,
          `<button class="btn gold" data-act="closeModal">Close</button>`
        );
        return;
      }
      case 'pickCard': {
        const idx = +arg;
        if (S.shopMode === 'card' && S.shopSel === idx) {
          S.shopSel = null;
          S.shopMode = null;
        } else {
          S.shopSel = idx;
          S.shopMode = 'card';
          S.fuseFirstUid = null;
        }
        SFX.pick();
        render();
        return;
      }
      case 'pickForgeCombo': {
        const ctx = pendingComboCtx;
        pendingComboCtx = null;
        closeModal();
        if (!ctx) return;
        const card = S.shopCards[ctx.cardIdx];
        const tile = S.bag.find(t => t.uid === ctx.tileUid);
        const combo = ctx.choices[+arg];
        if (!card || card.sold || !tile || !combo || S.gold < card.cost) return;
        S.gold -= card.cost;
        card.sold = true;
        S.shopSel = null;
        S.shopMode = null;
        tile.letter = combo.letter;
        tile.wild = false;
        tile.val = Math.max(tile.val, combo.val);
        SFX.win();
        showToast(`Forged into ${combo.letter} (${fmtC(tile.val)} pts)!`);
        render();
        return;
      }
      case 'startBurn': {
        if (S.shopMode === 'burn') {
          S.shopMode = null;
        } else {
          S.shopMode = 'burn';
          S.shopSel = null;
          S.fuseFirstUid = null;
        }
        SFX.pick();
        render();
        return;
      }
      case 'startClone': {
        if (S.shopMode === 'clone') {
          S.shopMode = null;
        } else {
          S.shopMode = 'clone';
          S.shopSel = null;
          S.fuseFirstUid = null;
        }
        SFX.pick();
        render();
        return;
      }
      case 'startFuse': {
        if (getStake().noFuse) {
          SFX.buzz();
          showToast('Fuse 2 Tiles is locked on this Stake!');
          return;
        }
        if (S.shopMode === 'fuse') {
          S.shopMode = null;
          S.fuseFirstUid = null;
        } else {
          S.shopMode = 'fuse';
          S.shopSel = null;
          S.fuseFirstUid = null;
        }
        SFX.pick();
        render();
        return;
      }
      case 'wbFilter': S.wbFilter = arg; SFX.pick(); render(); return;
      case 'reroll': {
        const cost = getRerollCost();
        if (S.gold < cost) return;
        S.gold -= cost;
        S.shopNum--;
        genShop();
        SFX.whoosh();
        render();
        return;
      }
      case 'nextStage': {
        if (S.stageInTerrace === 2) {
          if (S.audit && S.audit.id === 'ban_word' && S.audit.bannedWord) {
            S.wordCounts[S.audit.bannedWord] = 0;
            S.lastDynamicAuditKey = 'W:' + S.audit.bannedWord;
          } else if (S.audit && S.audit.id === 'censor_tile' && S.audit.censoredKey) {
            S.tileCounts[S.audit.censoredKey] = 0;
            S.lastDynamicAuditKey = 'T:' + S.audit.censoredKey;
          } else if (S.audit && S.audit.id === 'vowel_fast') {
            for (const k of 'AEIOU') S.tileCounts[k] = 0;
            S.lastDynamicAuditKey = 'V';
          }
          S.audit = S.nextAudit || popAuditFromBag(true);
          S.nextAudit = popAuditFromBag(true);
          startStage(S.terrace + 1, 0);
        } else {
          startStage(S.terrace, S.stageInTerrace + 1);
        }
        render();
        return;
      }
    }
  }

  // Colour the key words in a tooltip the way the game colours them: gold, multiply, points, light, replay, wild/copy.
  function colorTip(h) {
    return h.split(' | ').join('<br>').replace(
      /(\+?\$\d+|\bgold\b)|(×\s?[\d.,]+|\bdouble\b|\btriple\b|\^1\.25)|(\+\d+(?: points?)?)|(\bflames?\b|\bcandle(?:light)?\b|\blights?\b|\bblaze\b|\bshadow\b)|(\bone extra time\b|\breplays?\b|↻)|(\bwild\b|\bcop(?:y|ies)\b|\bclones?\b)/gi,
      (m, g, x, p, l, r) => `<span class="tt-${g ? 'gold' : x ? 'mult' : p ? 'pts' : l ? 'light' : r ? 'echo' : 'green'}">${m}</span>`);
  }

  function hideTip() {
    const t = document.getElementById('tip');
    if (t) t.classList.remove('show');
  }

  function showTipFor(el) {
    const t = document.getElementById('tip');
    if (!t || !el) return;
    const title = el.dataset.tipTitle || '';
    const text = el.dataset.tipText || '';
    if (!text) { hideTip(); return; }
    t.innerHTML = `${title ? `<b>${esc(title)}</b>` : ''}${colorTip(esc(text))}`;
    const r = el.getBoundingClientRect();
    t.classList.add('show');
    const tw = t.offsetWidth || 220;
    const th = t.offsetHeight || 60;
    const left = Math.max(8, Math.min(window.innerWidth - tw - 8, r.left + r.width / 2 - tw / 2));
    const top = r.top - th - 8 >= 8 ? r.top - th - 8 : Math.min(window.innerHeight - th - 8, r.bottom + 8);
    t.style.left = left + 'px';
    t.style.top = top + 'px';
  }

  function bindEvents() {
    const app = document.getElementById('app');
    if (!app) return;

    const clearDragVisuals = () => {
      document.querySelectorAll('.drag-over, .dragging').forEach(el => {
        el.classList.remove('drag-over', 'dragging');
      });
    };

    app.addEventListener('input', e => {
      if (e.target && e.target.id === 'tf-scale-slider') {
        setGoalScale(+e.target.value);
      }
      if (e.target && (e.target.id === 'tf-vol-music' || e.target.id === 'tf-vol-sfx')) {
        VOL[e.target.id === 'tf-vol-music' ? 'music' : 'sfx'] = +e.target.value;
        applyVol();
        if (e.target.id === 'tf-vol-sfx') SFX.pick();
      }
    });

    app.addEventListener('click', e => {
      if (suppressNextClick) {
        suppressNextClick = false;
        return;
      }
      if (document.activeElement && document.activeElement.tagName === 'BUTTON') {
        document.activeElement.blur();
      }
      const actEl = e.target.closest('[data-act]');
      if (actEl) {
        if (actEl.disabled) {
          if (lastPtr !== 'mouse' && actEl.dataset.tipText) showTipFor(actEl);
          return;
        }
        handleAction(actEl.dataset.act, actEl.dataset.arg);
        // the card you just picked explains itself
        if (actEl.dataset.act === 'pickCard' && S.shopMode === 'card') {
          const card = document.querySelector(`[data-card-idx="${actEl.dataset.arg}"]`);
          if (card) showTipFor(card);
        } else if (lastPtr !== 'mouse') hideTip();
        return;
      }
      if (lastPtr !== 'mouse') {
        const tipEl = e.target.closest('.candle-head[data-tip-text]');
        if (tipEl) { showTipFor(tipEl); return; }
        hideTip();
      }
      if (e.target.id === 'modal') {
        closeModal();
        pendingComboCtx = null;
        return;
      }
      const tileEl = e.target.closest('[data-tf-tile]');
      if (tileEl) {
        const uid = +tileEl.dataset.tfTile;
        if (S.phase === 'shop') {
          if (S.shopMode === 'card' && S.shopSel !== null) applyCardToTile(S.shopSel, uid);
          else if (S.shopMode === 'burn' || S.shopMode === 'clone' || S.shopMode === 'fuse') applyWorkbenchCraft(uid);
          else { showTipFor(tileEl); SFX.pick(); }
          return;
        }
        if (tileEl.closest('.bag-grid')) return;
        placeOrReturnTile(uid);
      }
    });

    // Desktop HTML5 Drag & Drop (Play mode)
    app.addEventListener('dragstart', e => {
      // touch has its own drag (below); the browser's drag would cancel a press-and-hold tooltip
      if (lastPtr !== 'mouse' || touchDrag) {
        e.preventDefault();
        return;
      }
      if (S.phase !== 'play' || S.busy || S.broken || S.swapSet) {
        e.preventDefault();
        return;
      }
      const tileEl = e.target.closest('[data-tf-tile][draggable="true"]');
      if (!tileEl) return;
      dragUid = +tileEl.dataset.tfTile;
      hideTip();
      tileEl.classList.add('dragging');
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', String(dragUid));
      }
    });

    app.addEventListener('dragover', e => {
      if (dragUid === null || S.phase !== 'play' || S.busy || S.broken || S.swapSet) return;
      const slotEl = e.target.closest('.vcell[data-slot-idx]');
      const rackTileEl = !slotEl ? e.target.closest('.rack-tiles [data-tf-tile]') : null;
      const rackEl = !slotEl ? e.target.closest('[data-drop-rack]') : null;
      if (!slotEl && !rackEl) return;
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
      clearDragVisuals();
      const srcEl = document.querySelector(`[data-tf-tile="${dragUid}"]`);
      if (srcEl) srcEl.classList.add('dragging');
      if (slotEl) slotEl.classList.add('drag-over');
      else if (rackTileEl && +rackTileEl.dataset.tfTile !== dragUid) rackTileEl.classList.add('drag-over');
      else if (rackEl) rackEl.classList.add('drag-over');
    });

    app.addEventListener('drop', e => {
      if (dragUid === null || S.phase !== 'play' || S.busy || S.broken || S.swapSet) return;
      const slotEl = e.target.closest('.vcell[data-slot-idx]');
      const rackTileEl = !slotEl ? e.target.closest('.rack-tiles [data-tf-tile]') : null;
      const rackEl = !slotEl ? e.target.closest('[data-drop-rack]') : null;
      if (!slotEl && !rackEl) return;
      e.preventDefault();
      const uid = dragUid;
      dragUid = null;
      clearDragVisuals();
      if (slotEl) dropTileOnSlot(uid, +slotEl.dataset.slotIdx);
      else if (rackEl) dropTileOnRack(uid, rackTileEl ? +rackTileEl.dataset.tfTile : null);
    });

    app.addEventListener('dragend', () => {
      dragUid = null;
      clearDragVisuals();
    });

    // Touch Drag & Drop fallback (strictly touch pointerType)
    app.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'touch' || S.phase !== 'play' || S.busy || S.broken || S.swapSet) return;
      const tileEl = e.target.closest('[data-tf-tile][draggable="true"]');
      if (!tileEl || tileEl.closest('.bag-grid')) return;
      touchDrag = {
        pointerId: e.pointerId,
        uid: +tileEl.dataset.tfTile,
        startX: e.clientX,
        startY: e.clientY,
        srcEl: tileEl,
        active: false,
        hold: setTimeout(() => {
          if (!touchDrag || touchDrag.active) return;
          touchDrag.held = true;
          showTipFor(tileEl);
          coachMark('hold');
          try { navigator.vibrate && navigator.vibrate(12); } catch (err) {}
        }, 430),
        ghost: null
      };
    });

    app.addEventListener('pointermove', e => {
      if (!touchDrag || e.pointerType !== 'touch' || e.pointerId !== touchDrag.pointerId) return;
      const dx = e.clientX - touchDrag.startX;
      const dy = e.clientY - touchDrag.startY;
      if (!touchDrag.active) {
        if (Math.hypot(dx, dy) < 10) return;
        clearTimeout(touchDrag.hold);
        touchDrag.active = true;
        hideTip();
        const ghost = touchDrag.srcEl.cloneNode(true);
        ghost.className = touchDrag.srcEl.className + ' drag-ghost';
        ghost.style.width = touchDrag.srcEl.offsetWidth + 'px';
        ghost.style.height = touchDrag.srcEl.offsetHeight + 'px';
        document.body.appendChild(ghost);
        touchDrag.ghost = ghost;
        touchDrag.srcEl.classList.add('dragging');
      }
      e.preventDefault();
      if (touchDrag.ghost) {
        touchDrag.ghost.style.left = e.clientX + 'px';
        touchDrag.ghost.style.top = e.clientY + 'px';
      }
      clearDragVisuals();
      touchDrag.srcEl.classList.add('dragging');
      const under = document.elementFromPoint(e.clientX, e.clientY);
      const slotEl = under ? under.closest('.vcell[data-slot-idx]') : null;
      const rackTileEl = !slotEl && under ? under.closest('.rack-tiles [data-tf-tile]') : null;
      const rackEl = !slotEl && under ? under.closest('[data-drop-rack]') : null;
      if (slotEl) slotEl.classList.add('drag-over');
      else if (rackTileEl && +rackTileEl.dataset.tfTile !== touchDrag.uid) rackTileEl.classList.add('drag-over');
      else if (rackEl) rackEl.classList.add('drag-over');
    });

    const finishTouchDrag = (e, applyDrop) => {
      if (!touchDrag || e.pointerId !== touchDrag.pointerId) return;
      const td = touchDrag;
      touchDrag = null;
      clearTimeout(td.hold);
      if (td.ghost) td.ghost.remove();
      clearDragVisuals();
      if (td.held && !td.active) {
        // a long press only shows the tooltip; it doesn't place the tile
        e.preventDefault();
        suppressNextClick = true;
        setTimeout(() => { suppressNextClick = false; }, 400);
        return;
      }
      if (!td.active) return;
      e.preventDefault();
      suppressNextClick = true;
      setTimeout(() => { suppressNextClick = false; }, 120);
      if (!applyDrop) return;
      const under = document.elementFromPoint(e.clientX, e.clientY);
      const slotEl = under ? under.closest('.vcell[data-slot-idx]') : null;
      const rackTileEl = !slotEl && under ? under.closest('.rack-tiles [data-tf-tile]') : null;
      const rackEl = !slotEl && under ? under.closest('[data-drop-rack]') : null;
      if (slotEl) dropTileOnSlot(td.uid, +slotEl.dataset.slotIdx);
      else if (rackEl) dropTileOnRack(td.uid, rackTileEl ? +rackTileEl.dataset.tfTile : null);
    };
    app.addEventListener('pointerup', e => finishTouchDrag(e, true));
    app.addEventListener('pointercancel', e => finishTouchDrag(e, false));

    window.addEventListener('pointerdown', e => { lastPtr = e.pointerType || 'mouse'; }, { capture: true });
    // no phone context menu on a long-pressed tile
    app.addEventListener('contextmenu', e => { if (e.target.closest('[data-tf-tile]')) e.preventDefault(); });
    app.addEventListener('pointerover', e => {
      if (e.pointerType !== 'mouse') return;
      const el = e.target.closest('[data-tip-text]');
      if (el) showTipFor(el);
      else hideTip();
    });

    app.addEventListener('pointerout', e => {
      if (e.pointerType !== 'mouse') return;
      if (!e.target.isConnected) return; // the screen redrew under a still mouse
      if (!e.relatedTarget || !e.relatedTarget.closest || !e.relatedTarget.closest('[data-tip-text]')) {
        hideTip();
      }
    });

    window.addEventListener('keydown', e => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (document.getElementById('beatific-layer').classList.contains('open')) {
        return;
      }
      if (document.getElementById('modal').classList.contains('open')) {
        if (e.key === 'Escape') { closeModal(); pendingComboCtx = null; }
        return;
      }
      if (S.broken || S.phase !== 'play' || S.busy || S.swapSet) return;
      if (e.key === 'Enter') { e.preventDefault(); inscribe(); }
      else if (e.key === 'Backspace') {
        e.preventDefault();
        for (let i = 4; i >= 0; i--) {
          if (S.line[i]) { placeOrReturnTile(S.line[i].uid); break; }
        }
      } else if (e.key === 'Escape') {
        clearLine();
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        const L = e.key.toUpperCase();
        const match = S.hand.find(t => !t.wild && !t.lead && t.letter === L)
          || S.hand.find(t => !t.wild && !t.lead && t.letter[0] === L)
          || S.hand.find(t => t.wild);
        if (match) placeOrReturnTile(match.uid);
      }
    });
  }

  initState();
  bindEvents();
  render();
  showScene('home', homeData());

  return {
    restart() { handleAction('restart'); },
    handleAction,
    dropTileOnSlot,
    dropTileOnRack,
    applyCardToTile,
    applyWorkbenchCraft,
    genShop,
    UPGRADES,
    STAKES,
    MAX_WILD_TILES,
    maybeScheduleAntiSpamAudit,
    setGoalScale,
    openMenu,
    stageSpec,
    loadDemoCombo,
    wildFlagsForLine,
    auditCheck,
    computeTriggers,
    computeScore,
    startStage,
    _getState: () => S
  };
})();
