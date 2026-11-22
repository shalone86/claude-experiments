/* =====================================================================
   CORE ENGINE — Lexicon, Stages, Stackable Candlelight, SFX, Popups
   ===================================================================== */
const LEX = (() => {
  const el = document.getElementById('lexicon');
  const s = (el ? el.textContent : '').trim();
  const set = new Set();
  let prev = '', i = 0;
  const n = s.length;
  while (i < n) {
    const p = s.charCodeAt(i) - 48;
    i++;
    let j = i;
    while (j < n && s.charCodeAt(j) > 57) j++;
    const w = prev.slice(0, p) + s.slice(i, j);
    if (w) set.add(w);
    prev = w;
    i = j;
  }
  return set;
})();

const MONADS = ['A', 'I', 'O'];
function isWord(w) {
  if (!w) return false;
  if (w.length === 1) return MONADS.includes(w.toUpperCase());
  return LEX.has(w.toLowerCase());
}

const COMMON_ALPHA = 'ETAOINSHRDLCUMWFGYPBVKJXQZ';
function resolveWord(tiles, wildFlags = null) {
  const flags = wildFlags || tiles.map(t => !!t.wild);
  const parts = tiles.map((t, i) => (flags[i] ? null : t.letter.toUpperCase()));
  const holes = [];
  parts.forEach((p, idx) => {
    if (p === null) holes.push(idx);
  });
  if (!holes.length) {
    const w = parts.join('');
    return isWord(w) ? { word: w, fills: {} } : null;
  }
  if (holes.length <= 2) {
    const rec = (k, fills) => {
      if (k === holes.length) {
        const w = parts.map((p, i) => (p === null ? fills[i] : p)).join('');
        return isWord(w) ? { word: w, fills: { ...fills } } : null;
      }
      for (let c = 0; c < COMMON_ALPHA.length; c++) {
        fills[holes[k]] = COMMON_ALPHA[c];
        const r = rec(k + 1, fills);
        if (r) return r;
      }
      return null;
    };
    return rec(0, {});
  }
  if (parts.length === 1 && parts[0] === null) {
    return { word: 'A', fills: { 0: 'A' } };
  }
  let totalChars = 0;
  const fixed = [];
  const holeOffsets = [];
  parts.forEach((p, idx) => {
    if (p === null) {
      holeOffsets.push([idx, totalChars]);
      totalChars += 1;
    } else {
      fixed.push([totalChars, p.toLowerCase()]);
      totalChars += p.length;
    }
  });
  for (const w of LEX) {
    if (w.length !== totalChars) continue;
    let ok = true;
    for (let f = 0; f < fixed.length; f++) {
      const [offset, txt] = fixed[f];
      if (w.slice(offset, offset + txt.length) !== txt) {
        ok = false;
        break;
      }
    }
    if (ok) {
      const fills = {};
      const up = w.toUpperCase();
      for (const [tileIdx, offset] of holeOffsets) fills[tileIdx] = up[offset];
      return { word: up, fills };
    }
  }
  return null;
}

// Standard Scrabble tile counts with ×10 face values for clean single-score math
const LETTERS = {
  A: [10, 5], B: [30, 1], C: [30, 1], D: [20, 2], E: [10, 6], F: [40, 1], G: [20, 2],
  H: [40, 1], I: [10, 4], J: [80, 1], K: [50, 1], L: [10, 2], M: [30, 1], N: [10, 3],
  O: [10, 4], P: [30, 1], Q: [100, 1], R: [10, 3], S: [10, 2], T: [10, 3], U: [10, 2],
  V: [40, 1], W: [40, 1], X: [80, 1], Y: [40, 1], Z: [100, 1]
};

const WORD_NAMES = {
  1: '1-Letter Word',
  2: '2-Letter Word',
  3: '3-Letter Word',
  4: '4-Letter Word',
  5: '5-Letter Word'
};

const COMBOS = [
  { letter: 'TH', val: 50 },
  { letter: 'CH', val: 60 },
  { letter: 'SH', val: 50 },
  { letter: 'ST', val: 40 },
  { letter: 'QU', val: 100 },
  { letter: 'EA', val: 40 },
  { letter: 'OO', val: 40 },
  { letter: 'OU', val: 40 },
  { letter: 'ER', val: 40 },
  { letter: 'ED', val: 40 },
  { letter: 'ING', val: 60 },
  { letter: 'STR', val: 50 },
  { letter: 'ION', val: 50 }
];

function tileCategory(t) {
  if (t.lead) return 'lead';
  if (t.wild) return 'wild';
  const chars = t.letter.toUpperCase().split('');
  if (chars.every(ch => 'AEIOU'.includes(ch))) return 'vowel';
  if (chars.every(ch => !'AEIOU'.includes(ch))) return 'cons';
  return 'combo';
}

const LENGTH_BONUS = { 1: 0, 2: 0, 3: 30, 4: 80, 5: 150 };

const TERRACES_MAX = 7;
const TERRACE_GOALS = [
  [110,   230,   330],       // Terrace 1
  [400,   550,   750],       // Terrace 2
  [950,   1300,  1750],      // Terrace 3
  [2100,  2900,  3900],      // Terrace 4
  [5200,  7500,  10500],     // Terrace 5
  [14000, 21000, 30000],     // Terrace 6
  [42500, 62500, 87500]      // Terrace 7 (Final Boss)
];
const TERRACE_REWARDS = [
  [10, 12, 16],
  [12, 14, 18],
  [14, 16, 20],
  [15, 17, 22],
  [16, 18, 24],
  [18, 20, 26],
  [20, 22, 30]
];

const AUDITS = {
  half_vowels:   { id: 'half_vowels',   name: 'The Dimmed Vowels',    desc: 'Vowels (A E I O U) give half base score (½).', goalMult: 0.9 },
  mute_1_vowel:  { id: 'mute_1_vowel',  name: 'The Silent Vowel',     desc: 'One chosen vowel gives 0 base score.', goalMult: 0.9, pickVowels: 1 },
  mute_2_vowels: { id: 'mute_2_vowels', name: 'The Twin Silence',     desc: 'Two chosen vowels give 0 base score.', goalMult: 0.85, pickVowels: 2 },
  half_cons:     { id: 'half_cons',     name: 'The Muted Consonants', desc: 'Consonants give half base score (½).', goalMult: 0.88 },
  no_plosives:   { id: 'no_plosives',   name: 'The Soft Tongue',      desc: 'Plosives (B D G K P T) give 0 base score.', goalMult: 0.88, mutedChars: 'BDGKPT' },
  no_fricatives: { id: 'no_fricatives', name: 'The Held Breath',      desc: 'Fricatives (F H S V Z) give 0 base score.', goalMult: 0.88, mutedChars: 'FHSVZ' },
  no_liquids:    { id: 'no_liquids',    name: 'The Dry Ink',          desc: 'Liquids & Nasals (L M N R) give 0 base score.', goalMult: 0.88, mutedChars: 'LMNR' },
  no_start_cons: { id: 'no_start_cons', name: 'The Headless Word',    desc: 'If your word starts with a consonant, that first tile gives 0 base score.', goalMult: 0.9 },
  no_end_cons:   { id: 'no_end_cons',   name: 'The Clipped Tail',     desc: 'If your word ends with a consonant, that last tile gives 0 base score.', goalMult: 0.9 },
  snuffed:       { id: 'snuffed',       name: 'The Snuffed Candle',   desc: 'Candle is out! All 5 slots start in Shadow (Light tiles still work).', goalMult: 0.9 },
  min_4:         { id: 'min_4',         name: 'The Long Verse',       desc: 'Only 4 or 5-tile words count.', goalMult: 0.85 },
  max_3:         { id: 'max_3',         name: 'The Short Verse',      desc: 'Only 1, 2, or 3-tile words count.', goalMult: 0.7 },
  must_repeat:   { id: 'must_repeat',   name: 'The Echoed Letter',    desc: 'Word must repeat a letter (BOOK, TREE, SEEN).', goalMult: 0.75 },
  lead_tiles:    { id: 'lead_tiles',    name: 'The Heavy Lead',       desc: '2 Lead slugs (Pb, 0 pts) shuffled into your bag this Audit.', goalMult: 0.9 },
  no_replay:     { id: 'no_replay',     name: 'The Still Quill',      desc: 'Replay upgrades do not trigger this Audit.', goalMult: 0.8 }
};

function createAuditInstance(auditId, forcedLetters = null) {
  const base = AUDITS[auditId];
  if (!base) return null;
  if (base.pickVowels) {
    const letters = (Array.isArray(forcedLetters) && forcedLetters.length
      ? forcedLetters.map(ch => String(ch).toUpperCase())
      : shuffleArr(['A', 'E', 'I', 'O', 'U']).slice(0, base.pickVowels)
    ).slice(0, base.pickVowels).sort();
    const joined = letters.join(' & ');
    return {
      ...base,
      letters,
      mutedChars: letters.join(''),
      name: `${base.name} (${joined})`,
      desc: `${joined} tiles give 0 base score.`
    };
  }
  return { ...base };
}

function createAntiSpamWordAudit(word) {
  const w = String(word || '').toUpperCase();
  return {
    id: 'ban_word',
    dynamic: true,
    bannedWord: w,
    name: `Index Expurgatorius (“${w}”)`,
    desc: `You played “${w}” too often! “${w}” (and any word containing it) scores 0.`,
    goalMult: 0.9
  };
}

// Anti-spam for vowel-only builds: no single vowel is played often enough to be censored,
// so this one looks at the whole build instead.
function createVowelFastAudit() {
  return {
    id: 'vowel_fast',
    dynamic: true,
    name: 'The Vowel Fast',
    desc: 'Your build leans on vowels! Vowels (A E I O U) score 0 and their forges don’t fire this Audit.',
    goalMult: 0.88
  };
}

function createAntiSpamTileAudit(key) {
  const k = String(key || '').toUpperCase();
  const label = k === '?' ? 'Wild ?' : `${k} tiles`;
  return {
    id: 'censor_tile',
    dynamic: true,
    censoredKey: k,
    name: `Censored Glyph (${k === '?' ? 'Wild ?' : k})`,
    desc: `You relied on ${label} too often! ${label} give 0 base score & halve word score (×0.5).`,
    goalMult: 0.88
  };
}

function toRoman(n) {
  const m = [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];
  let o = '';
  for (const [v, c] of m) {
    while (n >= v) { o += c; n -= v; }
  }
  return o;
}

function roundNiceGoal(v) {
  if (!isFinite(v)) return 1e200;
  if (v < 1000) return Math.max(10, Math.round(v / 10) * 10);
  const mag = Math.pow(10, Math.max(1, Math.floor(Math.log10(v)) - 2));
  return Math.round(v / mag) * mag;
}

function getRunStageSpec(terrace, stageInTerrace, auditSpec = null, goalScale = 1) {
  const isAuditStage = stageInTerrace === 2;
  const roman = toRoman(terrace + 1);
  let baseGoal;
  let reward;
  if (terrace < TERRACES_MAX) {
    baseGoal = TERRACE_GOALS[terrace][stageInTerrace];
    reward = TERRACE_REWARDS[terrace][stageInTerrace];
  } else {
    const e = terrace - TERRACES_MAX;
    const baseStages = [175e3, 500e3, 1.5e6];
    baseGoal = Math.min(1e200, baseStages[stageInTerrace] * Math.pow(10, e * 1.4 + 0.35 * e * e));
    reward = 24 + stageInTerrace * 4;
  }

  const resolved = typeof auditSpec === 'string' ? createAuditInstance(auditSpec) : auditSpec;
  const audit = isAuditStage ? resolved : null;
  const mult = (audit ? (audit.goalMult || 1) : 1) * (typeof goalScale === 'number' && goalScale > 0 ? goalScale : 1);
  const rawGoal = baseGoal * mult;
  const goal = roundNiceGoal(rawGoal);

  const stageTitle = isAuditStage ? (audit ? audit.name : 'The Audit') : (stageInTerrace === 0 ? 'Vigil I' : 'Vigil II');
  const label = terrace < TERRACES_MAX
    ? `Terrace ${terrace + 1}/${TERRACES_MAX} · ${isAuditStage ? 'Audit' : `Vigil ${stageInTerrace + 1}`}`
    : `Endless ${terrace + 1} · ${isAuditStage ? 'Audit' : `Vigil ${stageInTerrace + 1}`}`;
  return {
    terrace,
    stageInTerrace,
    roman,
    isAudit: isAuditStage,
    audit,
    label,
    name: stageTitle,
    goal,
    reward,
    final: terrace === TERRACES_MAX - 1 && isAuditStage
  };
}

let uidSeq = 1;
function nextUid() {
  return uidSeq++;
}

function makeBaseBag(wildCount = 1, wildVal = 20) {
  const bag = [];
  for (const L of Object.keys(LETTERS)) {
    const [val, count] = LETTERS[L];
    for (let i = 0; i < count; i++) {
      bag.push({
        uid: nextUid(),
        letter: L,
        val,
        wild: false,
        mods: []
      });
    }
  }
  for (let i = 0; i < wildCount; i++) {
    bag.push({
      uid: nextUid(),
      letter: '?',
      val: wildVal,
      wild: true,
      mods: []
    });
  }
  // Starter combo tiles off the jump
  bag.push({ uid: nextUid(), letter: 'TH', val: 50, wild: false, mods: [] });
  bag.push({ uid: nextUid(), letter: 'ING', val: 60, wild: false, mods: [] });
  return bag;
}

function shuffleArr(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function sci(n) {
  if (!isFinite(n)) return '∞';
  const e = Math.floor(Math.log10(Math.abs(n)));
  let m = n / Math.pow(10, e);
  if (m >= 9.995) {
    m /= 10;
    return m.toFixed(2) + 'e' + (e + 1);
  }
  return m.toFixed(2) + 'e' + e;
}

function fmt(n) {
  if (typeof n !== 'number' || isNaN(n)) return '0';
  if (!isFinite(n)) return '∞';
  if (Math.abs(n) >= 1e15) return sci(n);
  return Math.round(n).toLocaleString('en-US');
}

function fmtC(n) {
  if (typeof n !== 'number' || isNaN(n)) return '0';
  if (!isFinite(n)) return '∞';
  const a = Math.abs(n);
  if (a >= 1e15) return sci(n);
  if (a >= 1e12) return (n / 1e12).toFixed(a >= 1e13 ? 1 : 2).replace(/\.0+$/, '') + 'T';
  if (a >= 1e9) return (n / 1e9).toFixed(a >= 1e10 ? 1 : 2).replace(/\.0+$/, '') + 'B';
  if (a >= 1e6) return (n / 1e6).toFixed(a >= 1e7 ? 1 : 2).replace(/\.0+$/, '') + 'M';
  if (a >= 1e5) return Math.round(n / 1e3) + 'K';
  if (a >= 1e4) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
  return fmt(n);
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

function safeMul(a, b) {
  if (!isFinite(a) || !isFinite(b)) {
    return (a > 0 && b > 0) ? Infinity : 0;
  }
  const res = a * b;
  return isFinite(res) ? res : Infinity;
}

function safePow(base, exp) {
  if (base <= 0) return 0;
  if (!isFinite(base)) return Infinity;
  if (!isFinite(exp)) return base > 1 ? Infinity : 1;
  const res = Math.pow(base, exp);
  return isFinite(res) ? res : Infinity;
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Sound effects and music live in audio.js (shared with The Scriptorium Vigil).

/* =====================================================================
   SHARED UI UTILITIES
   ===================================================================== */
const ANGEL_SVG = `<svg class="angel" viewBox="0 0 40 40" aria-hidden="true"><ellipse cx="20" cy="7" rx="7.5" ry="2.6" fill="none" stroke="#d3a23b" stroke-width="1.8"/><path d="M16 22 C6 14 1 20 2 30 C8 26 12 27 15 29 Z" fill="#f4d886" stroke="#7a5512" stroke-width=".8"/><path d="M24 22 C34 14 39 20 38 30 C32 26 28 27 25 29 Z" fill="#f4d886" stroke="#7a5512" stroke-width=".8"/><circle cx="20" cy="14" r="4.6" fill="#f2e6c9" stroke="#5a4128" stroke-width=".9"/><path d="M20 19 L12.5 38 H27.5 Z" fill="#f2e6c9" stroke="#5a4128" stroke-width=".9"/><path d="M20 22 V34 M16.5 26 H23.5" stroke="#b5301c" stroke-width="1.3"/></svg>`;

const JUDGE_OK = [
  'A worthy word.',
  'Let it be written.',
  'The ink holds true.',
  'Cleanly wrought.',
  'The page receives it.'
];

function popEl(el) {
  if (!el || !el.animate) return;
  el.animate(
    [{ transform: 'scale(1)' }, { transform: 'scale(1.18) rotate(-3deg)' }, { transform: 'scale(1)' }],
    { duration: 220, easing: 'ease-out' }
  );
}

function floatAt(el, text, cls = 'pts') {
  if (!el) return;
  const r = el.getBoundingClientRect();
  const f = document.createElement('div');
  f.className = `float ${cls}`;
  f.textContent = text;
  f.style.left = (r.left + r.width / 2) + 'px';
  f.style.top = (r.top - 6) + 'px';
  document.body.appendChild(f);
  if (f.animate) {
    f.animate(
      [
        { transform: 'translate(-50%, 0) scale(0.6)', opacity: 0 },
        { transform: 'translate(-50%, -14px) scale(1.1)', opacity: 1, offset: 0.25 },
        { transform: 'translate(-50%, -26px) scale(1)', opacity: 1, offset: 0.7 },
        { transform: 'translate(-50%, -40px) scale(0.95)', opacity: 0 }
      ],
      { duration: 850, easing: 'ease-out' }
    ).onfinish = () => f.remove();
  } else {
    setTimeout(() => f.remove(), 800);
  }
}

let toastTimer = 0;
function showToast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}

function showModal(title, bodyHtml, footHtml = '') {
  const m = document.getElementById('modal');
  m.innerHTML = `<div class="sheet">
    <div class="sheet-head"><h3>${title}</h3><button class="btn mini wood" data-act="closeModal">✕</button></div>
    <div class="sheet-body">${bodyHtml}</div>
    ${footHtml ? `<div class="sheet-foot">${footHtml}</div>` : ''}
  </div>`;
  m.classList.add('open');
}

function closeModal() {
  const m = document.getElementById('modal');
  m.classList.remove('open');
  m.innerHTML = '';
}

function showBeatitude({ word, stageLabel, wordsPlayed, summary, onRestart }) {
  SFX.fanfare();
  SFX.bell();
  const layer = document.getElementById('beatific-layer');
  layer.innerHTML = `
    <div class="beatific-rays"></div>
    <div class="beatific-card">
      <div style="font-family:Cinzel,serif;font-weight:900;font-size:11px;letter-spacing:.2em;color:#7a5512">TILE FORGE · ${esc(stageLabel.toUpperCase())} · SCALE SHATTERED</div>
      <h1>Beatitude!</h1>
      <div class="beatific-inf">∞</div>
      <div style="font-size:17px"><b>“${esc(word)}”</b> broke the Scriptorium scale — score overflowed beyond counting! The game cannot go on.</div>
      <div style="font-size:14.5px;color:#5b4128">${esc(summary)} (${wordsPlayed} word${wordsPlayed === 1 ? '' : 's'} played)</div>
      <div class="beatific-btns">
        <button class="btn gold" id="bf-restart">↺ New Run</button>
      </div>
    </div>
  `;
  layer.classList.add('open');
  document.getElementById('bf-restart').onclick = () => {
    hideBeatitude();
    onRestart && onRestart();
  };
}

function hideBeatitude() {
  const layer = document.getElementById('beatific-layer');
  layer.classList.remove('open');
  layer.innerHTML = '';
}

/* =====================================================================
   COMMON LINE VALIDATION & TILE DRAWING HELPERS
   ===================================================================== */
function inspectLine(lineSlots, wildFlagFn = null, auditCheckFn = null) {
  const positions = [];
  lineSlots.forEach((t, i) => {
    if (t) positions.push(i);
  });
  if (!positions.length) return { empty: true, count: 0, positions: [], tiles: [], wildFlags: [] };
  const tiles = positions.map(i => lineSlots[i]);
  const contiguous = positions[positions.length - 1] - positions[0] + 1 === positions.length;
  const wildFlags = wildFlagFn ? wildFlagFn(tiles, positions) : tiles.map(t => !!t.wild);
  let valid = false;
  let reason = '';
  let auditMsg = '';
  let word = tiles.map((t, j) => (wildFlags[j] ? '?' : t.letter)).join('').toUpperCase();
  let fills = {};
  if (!contiguous) {
    reason = 'gap';
  } else if (tiles.some(t => t.lead)) {
    reason = 'lead';
  } else {
    const res = resolveWord(tiles, wildFlags);
    if (res) {
      valid = true;
      word = res.word;
      fills = res.fills;
      if (auditCheckFn) {
        const err = auditCheckFn({ tiles, positions, count: tiles.length, word, fills });
        if (err) {
          valid = false;
          reason = 'audit';
          auditMsg = err;
        }
      }
    } else {
      reason = tiles.length === 1 ? 'monad' : 'lexicon';
    }
  }
  return { empty: false, count: tiles.length, positions, tiles, wildFlags, contiguous, valid, reason, auditMsg, word, fills };
}

function drawTilesFromState(S, handMax) {
  while (S.hand.length + S.line.filter(Boolean).length < handMax) {
    if (!S.draw.length) {
      const held = new Set([...S.hand, ...S.line.filter(Boolean)].map(t => t.uid));
      S.draw = shuffleArr(S.bag.filter(t => !held.has(t.uid)));
      if (!S.draw.length) break;
    }
    S.hand.push(S.draw.shift());
  }
}

function sortHandArr(hand, mode) {
  const key = t => (t.lead ? 'ZZZ' : t.wild ? 'ZZ' : t.letter);
  if (mode === 'az') {
    hand.sort((a, b) => key(a).localeCompare(key(b)) || b.val - a.val);
  } else {
    hand.sort((a, b) => b.val - a.val || key(a).localeCompare(key(b)));
  }
}

function renderAngelFeedback(v) {
  if (v.empty) return { text: 'Tap or type letters onto the 5-slot line.', cls: '' };
  if (v.reason === 'gap') return { text: 'Leave no gaps between tiles.', cls: 'bad' };
  if (v.reason === 'lead') return { text: 'Lead (Pb) can’t score — swap it away or play for 0.', cls: 'bad' };
  if (v.reason === 'audit') return { text: `${esc(v.auditMsg)} (plays for 0).`, cls: 'bad' };
  if (v.reason === 'monad') return { text: 'Only A, I, or O count as 1-letter words (plays for 0).', cls: 'bad' };
  if (v.reason === 'lexicon') return { text: `<span class="word">${esc(v.word)}</span> is not in the word list (plays for 0).`, cls: 'bad' };
  let h = 0;
  for (const ch of v.word) h = (h * 31 + ch.charCodeAt(0)) % 997;
  return { text: `<span class="word">${esc(v.word)}</span> — ${JUDGE_OK[h % JUDGE_OK.length]}`, cls: 'ok' };
}

/* =====================================================================
   LIGHTWEIGHT DICTIONARY DEFINITIONS + ASYNC CACHE (<= 300 entries)
   ===================================================================== */
const DICT_DEFS = {
  A: 'Indefinite article; first letter.', I: 'First-person singular pronoun.', O: 'Poetic interjection of address or surprise.',
  AA: 'Rough, jagged basaltic lava.', AB: 'Abdominal muscle.', AD: 'Public advertisement or notice.', AE: 'One (Scottish dialect).',
  AG: 'Relating to agriculture.', AH: 'Cry of relief or realization.', AI: 'Three-toed sloth.', AL: 'Indian mulberry tree.',
  AM: 'First-person singular of be.', AN: 'Form of "a" before vowel sounds.', AR: 'Name of the letter R.', AS: 'In the same manner or degree.',
  AT: 'Indicating location or time.', AW: 'Exclamation of mild protest or awe.', AX: 'Heavy chopping tool.', AY: 'Affirmative vote or exclamation.',
  BA: 'Eternal soul in Egyptian myth.', BE: 'To exist or occur.', BI: 'Prefixes meaning two; bisulfate.', BO: 'Buddy, friend, or hobo.',
  BY: 'Near to, beside, or via.', DA: 'Father; heavy Burmese knife.', DE: 'Of or from (in names/phrases).', DO: 'Perform an action; first solfège note.',
  ED: 'Relating to education or editing.', EF: 'Name of the letter F.', EH: 'Questioning interjection.', EL: 'Elevated railway; wing of a building.',
  EM: 'Typographical unit of width; letter M.', EN: 'Half an em width; letter N.', ER: 'Hesitation sound.', ES: 'Name of the letter S.',
  ET: 'Past tense of eat (dialect); Latin "and".', EW: 'Cry of mild disgust.', EX: 'Former partner; letter X.', FA: 'Fourth note of the musical scale.',
  FE: 'Hebrew letter; iron symbol.', GI: 'Loose martial-arts uniform.', GO: 'Move forward; classic board game.', HA: 'Expression of triumph or laughter.',
  HE: 'Male third-person pronoun.', HI: 'Casual greeting.', HM: 'Thoughtful humming sound.', HO: 'Exclamation calling attention.',
  ID: 'Deepest unconscious instinct; identifier.', IF: 'Conditional conjunction.', IN: 'Inside or enclosed by.', IS: 'Third-person present of be.',
  IT: 'Neuter third-person pronoun.', JO: 'Sweetheart or dear friend (Scottish).', KA: 'Spiritual essence in ancient Egypt.', KI: 'Vital life energy (martial arts).',
  LA: 'Sixth note of the musical scale.', LI: 'Chinese unit of distance (~500m).', LO: 'Look, behold!', MA: 'Mother.',
  ME: 'Objective case of I.', MI: 'Third note of the musical scale.', MM: 'Soft sound of contentment.', MO: 'A brief moment.',
  MU: 'Greek letter M; magnetic permeability.', MY: 'Belonging to me.', NA: 'No or not (Scottish dialect).', NE: 'Born with the maiden name of.',
  NO: 'Negative reply; atomic nobelium.', NU: 'Greek letter N.', OD: 'Hypothetical universal force.', OE: 'Whirlwind near the Faroe Islands.',
  OF: 'Expressing origin or relation.', OH: 'Exclamation of surprise.', OI: 'Attention-getting shout.', OK: 'All right; satisfactory.',
  OM: 'Sacred meditative syllable.', ON: 'Resting atop or active.', OP: 'Work of art, surgery, or op-art.', OR: 'Conjunction of choice; heraldic gold.',
  OS: 'Bone; ridge of glacial gravel.', OW: 'Cry of sudden pain.', OX: 'Domesticated draft bovine.', OY: 'Yiddish cry of dismay.',
  PA: 'Father.', PE: 'Hebrew letter; physical education.', PI: 'Circle circumference-to-diameter ratio (~3.14).', PO: 'Chamber pot (informal).',
  QI: 'Vital circulating life force in Chinese medicine.', RE: 'Second solfège note; concerning.', SH: 'Quiet! Whispered call for silence.', SI: 'Seventh solfège note (ti).',
  SO: 'Therefore; fifth solfège note.', TA: 'Thank you (British informal).', TE: 'Seventh note of musical scale.', TI: 'Seventh solfège note; Polynesian shrub.',
  TO: 'In the direction of.', UH: 'Sound of hesitation.', UM: 'Brief pause while thinking.', UN: 'One (informal dialect pronoun).',
  UP: 'Toward a higher place.', US: 'Objective form of we.', UT: 'Earliest name for the note do.', WE: 'Plural first-person pronoun.',
  WO: 'Sorrow or grief (woe).', XI: 'Fourteenth Greek letter.', XU: 'Former Vietnamese monetary coin.', YA: 'You (informal).',
  YE: 'Archaic plural form of you; the.', YO: 'Slang greeting.', ZA: 'Slice of pizza (Scrabble favorite).',
  CAT: 'Small domesticated carnivorous feline.', DOG: 'Domesticated loyal canine.', ZAP: 'Strike or destroy suddenly with energy.',
  STAR: 'Luminous celestial sphere of plasma.', STARE: 'Look fixedly with wide-open eyes.', BOOK: 'Bound collection of written pages.',
  TREE: 'Woody perennial plant with trunk and branches.', SEEN: 'Observed with the eyes; past participle of see.', STONE: 'Hard solid nonmetallic mineral matter.',
  FLAME: 'Glowing hot body of ignited gas.', FORGE: 'Blacksmith hearth or workshop for shaping.', LIGHT: 'Natural electromagnetic illumination.',
  WORD: 'Distinct meaningful unit of language.', TEA: 'Hot aromatic infusion of cured leaves.', ATE: 'Consumed food; past tense of eat.',
  EAT: 'Consume food for nourishment.', EAR: 'Organ of hearing and balance.', ERA: 'Long distinct period of history.',
  ARE: 'Plural present indicative of be.', ART: 'Creative expression of human skill.', RAT: 'Long-tailed omnivorous rodent.',
  TAR: 'Thick dark viscous hydrocarbon pitch.', BAT: 'Nocturnal flying mammal or wooden club.', HAT: 'Head covering with crown or brim.',
  MAT: 'Woven floor pad or dull surface.', SAT: 'Rested seated; past tense of sit.', PAN: 'Shallow metal cooking vessel.',
  PANG: 'Sudden sharp twinge of pain or emotion.', GROT: 'Small cavern or grotto.', FIRE: 'Rapid combustion releasing heat and flame.',
  GOLD: 'Precious lustrous yellow metal.', WIND: 'Perceptible natural motion of air.', RAIN: 'Condensed water droplets falling from clouds.',
  SONG: 'Musical composition with sung lyrics.', RING: 'Circular band worn as jewelry or chime.', KING: 'Male sovereign ruler of a kingdom.',
  SING: 'Produce musical tones with the voice.', WING: 'Feathered limb or airfoil for flight.', THING: 'An inanimate object, concept, or affair.',
  MIND: 'Faculty of consciousness and thought.', SOUL: 'Spiritual or immaterial part of a person.', HOPE: 'Expectation and desire for good outcome.',
  LOVE: 'Deep affection, care, or devotion.', LIFE: 'Condition of growth, breath, and vitality.', GAME: 'Structured form of play for fun or skill.',
  PLAY: 'Engage in enjoyable activity or spell a word.', FAST: 'Moving quickly or firmly secured.', NOTE: 'Brief written record or musical tone.',
  TONE: 'Musical pitch or prevailing mood.', BONE: 'Rigid calcified vertebrate skeleton tissue.', CONE: 'Three-dimensional shape tapering to a point.',
  ZONE: 'Distinct bounded area or region.', ZEAL: 'Great energy or enthusiasm in a cause.', JAZZ: 'Syncopated improvisational American music.',
  FIZZ: 'Hiss and release tiny gas bubbles.', BUZZ: 'Low continuous humming or vibrant hum.', QUIZ: 'Short test of knowledge or playful question.',
  QUIP: 'Witty, clever spontaneous remark.', QUIT: 'Leave permanently or cease an action.', QUAD: 'Courtyard or group of four.',
  APEX: 'Highest vertex, peak, or summit.', OATH: 'Solemn sworn promise or vow.', SAGE: 'Profoundly wise person; aromatic herb.',
  WINE: 'Alcoholic drink of fermented grapes.', TIME: 'Indefinite continued progress of existence.', MIST: 'Fine cloud of water droplets near ground.',
  DUSK: 'Darker stage of twilight after sunset.', DAWN: 'First appearance of daylight in morning.', CAST: 'Actors in a play; throw with force.',
  CASTE: 'Rigid hereditary social class.', THINE: 'Poetic archaic form of yours.', COAST: 'Land bordering directly on the sea.',
  UNFED: 'Not having received food or nourishment.', HOPING: 'Desiring with expectation of fulfillment.', BASK: 'Lie exposed to pleasant warmth and light.'
};

const DEF_CACHE_KEY = 'tileforge_defs_v1';
const DEF_CACHE_MAX = 300;
const DEF_CACHE = new Map(Object.entries(DICT_DEFS));
try {
  if (typeof localStorage !== 'undefined') {
    const rawDefs = localStorage.getItem(DEF_CACHE_KEY);
    if (rawDefs) {
      const parsed = JSON.parse(rawDefs);
      if (parsed && typeof parsed === 'object') {
        for (const [k, v] of Object.entries(parsed)) {
          if (typeof v === 'string' && v.trim() && !DEF_CACHE.has(k)) DEF_CACHE.set(k, v.trim());
        }
      }
    }
  }
} catch {}

let defLookupTimer = 0;
const defPending = new Set();

function persistDefCache() {
  try {
    if (typeof localStorage === 'undefined') return;
    const saved = {};
    const extras = [];
    for (const [k, v] of DEF_CACHE.entries()) {
      if (!DICT_DEFS[k] && v && v !== 'Valid dictionary word.') extras.push([k, v]);
    }
    const start = Math.max(0, extras.length - DEF_CACHE_MAX);
    for (let i = start; i < extras.length; i++) saved[extras[i][0]] = extras[i][1];
    localStorage.setItem(DEF_CACHE_KEY, JSON.stringify(saved));
  } catch {}
}

// Base forms to try when a word itself isn't in the dictionary (TOPS -> TOP, WALKED -> WALK).
function defStems(w) {
  const out = [];
  const add = (x) => { if (x.length >= 2 && !out.includes(x) && x !== w) out.push(x); };
  if (w.endsWith('IES')) add(w.slice(0, -3) + 'Y');
  if (w.endsWith('ES')) add(w.slice(0, -2));
  if (w.endsWith('S')) add(w.slice(0, -1));
  if (w.endsWith('ED')) { add(w.slice(0, -2)); add(w.slice(0, -1)); }
  if (w.endsWith('ING')) { add(w.slice(0, -3)); add(w.slice(0, -3) + 'E'); }
  if (w.endsWith('ER')) { add(w.slice(0, -2)); add(w.slice(0, -1)); }
  if (w.endsWith('EST')) add(w.slice(0, -3));
  return out;
}

async function fetchDef(w) {
  const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(w.toLowerCase())}`);
  if (res.status === 429 || res.status >= 500) return { retry: true };
  if (!res.ok) return { def: null };
  const data = await res.json();
  const raw = data && data[0] && data[0].meanings && data[0].meanings[0] &&
              data[0].meanings[0].definitions && data[0].meanings[0].definitions[0] &&
              data[0].meanings[0].definitions[0].definition;
  if (!raw) return { def: null };
  let clean = String(raw).replace(/\s+/g, ' ').trim();
  if (clean.length > 96) clean = clean.slice(0, 93).replace(/\s+\S*$/, '') + '…';
  return { def: clean };
}

let defWanted = '';
// Looks a word up once it has stayed on the line for a moment (so TO, TOP, TOPS isn't three lookups).
// A rate-limit or network hiccup is retried instead of being remembered as "no definition".
function lookupWordDef(word, onUpdate, attempt = 0) {
  const w = String(word || '').toUpperCase().trim();
  if (!w) return '';
  if (DEF_CACHE.has(w)) return DEF_CACHE.get(w);
  if (typeof fetch !== 'function') return null;
  defWanted = w;
  clearTimeout(defLookupTimer);
  defLookupTimer = setTimeout(async () => {
    if (DEF_CACHE.has(w) || defPending.has(w) || defWanted !== w) return;
    defPending.add(w);
    let def = null, retry = false;
    try {
      const r = await fetchDef(w);
      if (r.retry) retry = true;
      else if (r.def) def = r.def;
      else {
        for (const stem of defStems(w)) {
          const r2 = DEF_CACHE.has(stem) && DEF_CACHE.get(stem) !== 'Valid dictionary word.'
            ? { def: DEF_CACHE.get(stem) } : await fetchDef(stem);
          if (r2.retry) { retry = true; break; }
          if (r2.def) { def = `(${stem.toLowerCase()}) ${r2.def}`; break; }
        }
      }
    } catch {
      retry = true;
    } finally {
      defPending.delete(w);
    }
    if (retry) {
      if (attempt < 3 && defWanted === w) setTimeout(() => lookupWordDef(w, onUpdate, attempt + 1), 1500 * (attempt + 1));
      return;
    }
    def = def || 'Valid dictionary word.';
    DEF_CACHE.set(w, def);
    if (def !== 'Valid dictionary word.') persistDefCache();
    if (typeof onUpdate === 'function') onUpdate(w, def);
  }, attempt ? 0 : 450);
  return null;
}

/* =====================================================================
   STACKABLE TILE CANDLELIGHT (0=Shadow, 1=Warm ×2, 2=Bright ×3, 3+=Blazing)
   ===================================================================== */
function computeSlotLights(lineSlots, candleSlot, countModFn, snuffed = false) {
  const levels = [0, 1, 2, 3, 4].map(i => {
    if (snuffed) return 0;
    const dist = Math.abs(i - candleSlot);
    return dist === 0 ? 2 : dist === 1 ? 1 : 0;
  });
  for (let s = 0; s < 5; s++) {
    const t = lineSlots[s];
    if (!t) continue;
    const cSelf = countModFn(t, 'light_self');
    const cLeft = countModFn(t, 'light_left');
    const cRight = countModFn(t, 'light_right');
    const cAll = countModFn(t, 'light_all');
    if (cSelf) levels[s] += 2 * cSelf;
    if (cLeft && s > 0) levels[s - 1] += 2 * cLeft;
    if (cRight && s < 4) levels[s + 1] += 2 * cRight;
    if (cAll) {
      for (let k = 0; k < 5; k++) levels[k] += 2 * cAll;
    }
  }
  return levels;
}

function lightInfoFromLevel(level) {
  if (level <= 0) {
    return { level: 'shadow', mult: 1, label: 'SHADOW', tip: 'In shadow: normal tile score.' };
  }
  if (level === 1) {
    return { level: 'warm', mult: 2, label: 'WARM ×2', tip: 'Warm candlelight: 2× tile score.' };
  }
  if (level === 2) {
    return { level: 'bright', mult: 3, label: 'BRIGHT ×3', tip: 'Brightest candlelight: 3× tile score!' };
  }
  const mult = 3 * Math.pow(2, Math.min(level - 2, 30));
  return {
    level: 'blazing',
    mult,
    label: `BLAZING ×${fmtC(mult)}`,
    tip: `Stacked candlelight! ${fmtC(mult)}× tile score!`
  };
}

function nextCandleSlot(curSlot) {
  const choices = [0, 1, 2, 3, 4].filter(i => i !== curSlot);
  return choices[Math.floor(Math.random() * choices.length)];
}

function renderCandleHead(slotIdx, candleSlot, lightLevel, snuffed = false, moved = false) {
  const info = lightInfoFromLevel(lightLevel);
  const isCandle = !snuffed && slotIdx === candleSlot;
  const flame = isCandle ? 'candle' : lightLevel >= 2 ? 'orb' : lightLevel === 1 ? 'ember' : '';
  const title = info.level === 'blazing' ? `Blazing ×${fmtC(info.mult)}`
    : info.level === 'bright' ? 'Candlelight ×3'
      : info.level === 'warm' ? 'Warm light ×2'
        : 'Shadow';
  const text = info.level === 'blazing' ? `Light stacked by your forges: a letter here scores ×${fmtC(info.mult)}.`
    : info.level === 'bright' ? 'A letter here scores triple.'
      : info.level === 'warm' ? 'Next to a flame: a letter here scores double.'
        : snuffed ? 'The candle is out for this Audit: letters score their normal points.'
          : 'Out of the light: letters here score their normal points.';
  const more = isCandle ? ' The candle moves after every word. Slide your word with ‹ › to catch it.' : '';
  // each slot flickers on its own rhythm
  const delay = ((slotIdx * 0.53) % 1.3).toFixed(2);
  return `
    <div class="candle-head lv-${info.level} ${isCandle ? 'is-candle' : ''} ${isCandle && moved ? 'moved' : ''}" style="--fd:-${delay}s" data-tip-title="${esc(title)}" data-tip-text="${esc(text + more)}">
      <span class="cflame ${flame}" aria-hidden="true">${flame && flame !== 'ember' ? '<i class="fl"></i><i class="fl-core"></i>' : flame === 'ember' ? '<i class="emb"></i>' : ''}${isCandle ? '<i class="wax"></i>' : ''}</span>
      <span class="lmult">${info.mult > 1 ? '×' + fmtC(info.mult) : ''}</span>
    </div>
  `;
}
