/* =====================================================================
   SCENES — home, win, lose and endless-end screens; the censer;
   first-time coach hints. Ported in spirit from The Scriptorium Vigil.
   ===================================================================== */

// ---- Incense: smoke, embers, and a censer that swings across the screen ----
// The censer is painted like the rest of the game: flat gold bands, a sepia ink outline and a flat
// shadow. It is a round globe on three chains, with four little bells that hang down, lag the swing
// and jingle. Drawn in a 68 × 186 box; the chains hang from (34, 4).
const CENSER_INK = '#2a1609';
const CENSER_GOLD = { hi: '#fae296', base: '#deac42', dark: '#96681a' };
// One painted part: the shape in gold with an ink ring round it, a darker band (right side or bottom)
// and a light stripe, both kept inside the shape.
function censerPart(id, shape, [x, y, w, h], { split = 'right', light = true, ow = 2 } = {}) {
  const band = split === 'right'
    ? `<rect x="${x + w * 0.62}" y="${y}" width="${w * 0.38}" height="${h}" fill="${CENSER_GOLD.dark}"/>`
    : `<rect x="${x}" y="${y + h * 0.55}" width="${w}" height="${h * 0.45}" fill="${CENSER_GOLD.dark}"/>`;
  const stripe = light ? `<rect x="${x + w * 0.16}" y="${y}" width="${w * 0.14}" height="${h}" fill="${CENSER_GOLD.hi}"/>` : '';
  return `<clipPath id="tfc-${id}">${shape('')}</clipPath>` +
    shape(`fill="${CENSER_GOLD.base}" stroke="${CENSER_INK}" stroke-width="${ow * 2}" stroke-linejoin="round" paint-order="stroke"`) +
    `<g clip-path="url(#tfc-${id})">${band}${stripe}</g>`;
}
const CENSER_SVG = (() => {
  const P = [34, 4], ends = [[8, 153], [34, 121], [60, 153]];
  const chains = ends.map(([x, y]) =>
    `<line x1="${P[0]}" y1="${P[1]}" x2="${x}" y2="${y}" stroke="${CENSER_INK}" stroke-width="3.2" stroke-linecap="round"/>` +
    `<line x1="${P[0]}" y1="${P[1]}" x2="${x}" y2="${y}" stroke="${CENSER_GOLD.hi}" stroke-width="1.6" stroke-dasharray="2.4 1.8"/>`).join('');
  // a bell, drawn from the point it hangs by; censerSweep turns each one so it hangs down
  const bell = (i, side, k, f) => {
    const [ex, ey] = ends[side < 0 ? 0 : 2], ax = P[0] + (ex - P[0]) * f, ay = P[1] + (ey - P[1]) * f;
    return `<g transform="translate(${ax.toFixed(2)} ${ay.toFixed(2)})"><g class="cbell" data-k="${k}" data-side="${side}">` +
      `<rect x="-1.4" y="-0.9" width="2.8" height="2.4" fill="${CENSER_INK}"/>` +
      censerPart('b' + i, a => `<path d="M-4.8 5.25 A4.8 4.25 0 0 1 4.8 5.25 L6 11.5 L-6 11.5 Z" ${a}/>`, [-6, 1, 12, 10.5], { light: false, ow: 1.1 }) +
      `<circle cx="0" cy="12.9" r="1.8" fill="${CENSER_INK}"/><circle cx="0" cy="12.9" r="1" fill="${CENSER_GOLD.hi}"/></g></g>`;
  };
  const bells = [bell(0, -1, 0, 0.42), bell(1, -1, 1, 0.72), bell(2, 1, 0, 0.42), bell(3, 1, 1, 0.72)].join('');
  const hole = ([x, y]) => `<circle cx="${x}" cy="${y}" r="3.5" fill="${CENSER_INK}"/><circle cx="${x}" cy="${y}" r="2.4" fill="#e65a1e"/>` +
    `<circle cx="${x - 0.36}" cy="${y + 0.36}" r="1.32" fill="#ffd66e"/>`;
  const jewel = (x, c) => `<circle cx="${x}" cy="161" r="3.6" fill="${CENSER_INK}"/><circle cx="${x}" cy="161" r="2.5" fill="${c}"/>`;
  return `<svg viewBox="0 0 68 186" width="62" height="170" overflow="visible" aria-hidden="true">${chains}` +
    `<circle cx="34" cy="4" r="5" fill="${CENSER_INK}"/><circle cx="34" cy="4" r="3.2" fill="${CENSER_GOLD.hi}"/>${bells}` +
    censerPart('knob', a => `<ellipse cx="34" cy="119.5" rx="4" ry="4.5" ${a}/>`, [30, 115, 8, 9], { light: false }) +
    censerPart('lid', a => `<path d="M8 149 A26 26 0 0 1 60 149 Z" ${a}/>`, [8, 123, 52, 26]) +
    [[19, 143], [29, 136], [39, 136], [49, 143]].map(hole).join('') +
    censerPart('bowl', a => `<path d="M60 149 A26 26 0 0 1 8 149 Z" ${a}/>`, [8, 149, 52, 26]) +
    censerPart('rim', a => `<rect x="6" y="146" width="56" height="7" rx="3" ${a}/>`, [6, 146, 56, 7], { split: 'bottom' }) +
    censerPart('foot', a => `<path d="M28 173 L40 173 L45 183 L23 183 Z" ${a}/>`, [23, 173, 22, 10], { light: false }) +
    jewel(22, '#2e846c') + jewel(34, '#b5301c') + jewel(46, '#2e846c') + `</svg>`;
})();

function smoke(x, y, n = 6, spread = 60) {
  for (let i = 0; i < n; i++) {
    const d = document.createElement('div'); d.className = 'smoke';
    d.style.left = (x + (Math.random() - 0.5) * spread) + 'px'; d.style.top = (y + (Math.random() - 0.5) * 20) + 'px';
    document.body.appendChild(d);
    const dx = (Math.random() - 0.5) * 80, rise = 140 + Math.random() * 120, dur = 1800 + Math.random() * 1400;
    d.animate([{ transform: 'scale(.4)', opacity: 0 }, { transform: `translate(${dx * 0.3}px,-${rise * 0.3}px) scale(1.3)`, opacity: 0.9, offset: 0.25 },
      { transform: `translate(${dx}px,-${rise}px) scale(3.2)`, opacity: 0 }], { duration: dur, delay: i * 90, easing: 'ease-out', fill: 'backwards' }).onfinish = () => d.remove();
  }
}
function embers(x, y, n = 14, spread = 120) {
  for (let i = 0; i < n; i++) {
    const e = document.createElement('div'); e.className = 'ember';
    e.style.left = (x + (Math.random() - 0.5) * spread) + 'px'; e.style.top = y + 'px';
    document.body.appendChild(e);
    const dx = (Math.random() - 0.5) * 140, rise = 80 + Math.random() * 220, dur = 900 + Math.random() * 900;
    e.animate([{ transform: 'translate(0,0)', opacity: 1 }, { transform: `translate(${dx}px,-${rise}px) scale(.3)`, opacity: 0 }],
      { duration: dur, delay: Math.random() * 250, easing: 'cubic-bezier(.2,.6,.4,1)', fill: 'backwards' }).onfinish = () => e.remove();
  }
}
// ---- The censer's incense: real smoke on a canvas ----
// A soft puff texture is made once in code (no image files): about twenty faint round blobs piled
// together, so each puff is uneven like smoke. A seeded random keeps it the same on every device.
const SMOKE_RGB = '214,206,192';
let smokeTex = null;
function smokePuffTex(seed) {
  const N = 128, c = document.createElement('canvas');
  c.width = c.height = N;
  const g = c.getContext && c.getContext('2d');
  if (!g) return null;
  let s = seed * 9301 + 49297;
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 22; i++) {
    const a = rnd() * Math.PI * 2, d = Math.pow(rnd(), 0.7) * 30, r = 10 + rnd() * 20;
    const x = N / 2 + Math.cos(a) * d, y = N / 2 + Math.sin(a) * d * 0.8;
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, `rgba(${SMOKE_RGB},.2)`);
    gr.addColorStop(1, `rgba(${SMOKE_RGB},0)`);
    g.fillStyle = gr;
    g.fillRect(0, 0, N, N);
  }
  return c;
}
function sparkTex() {
  const c = document.createElement('canvas');
  c.width = c.height = 16;
  const g = c.getContext && c.getContext('2d');
  if (!g) return null;
  const gr = g.createRadialGradient(8, 8, 0, 8, 8, 8);
  gr.addColorStop(0, 'rgba(255,236,170,1)');
  gr.addColorStop(0.35, 'rgba(255,170,60,.85)');
  gr.addColorStop(1, 'rgba(255,110,20,0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, 16, 16);
  return c;
}
// One canvas for one swing. Puffs leave the censer carrying a little of its swing, rise, slow down,
// widen and fade; a gentle flow (a sideways sway that changes with height) bends them into curling
// wisps. Drawn at half resolution, since smoke is soft, and at most 240 puffs, to stay light on phones.
// Returns null where there's no canvas (the censer still swings).
function incenseSmoke() {
  if (!smokeTex) {
    const t = [1, 2, 3].map(smokePuffTex), sp = sparkTex();
    if (t.some(x => !x) || !sp) return null;
    smokeTex = { puffs: t, spark: sp };
  }
  const cv = document.createElement('canvas');
  const g = cv.getContext && cv.getContext('2d');
  if (!g) return null;
  const SC = 0.5, W = window.innerWidth, H = window.innerHeight;
  cv.width = Math.ceil(W * SC); cv.height = Math.ceil(H * SC);
  cv.className = 'incense-smoke';
  cv.style.width = W + 'px'; cv.style.height = H + 'px';
  document.body.appendChild(cv);
  const puffs = [], sparks = [];
  let ending = false, last = performance.now(), T = 0;
  const draw = (img, x, y, size, rot, alpha) => {
    const k = size * SC / img.width, c = Math.cos(rot) * k, s = Math.sin(rot) * k;
    g.globalAlpha = alpha;
    g.setTransform(c, s, -s, c, x * SC, y * SC);
    g.drawImage(img, -img.width / 2, -img.height / 2);
  };
  const frame = (now) => {
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now; T += dt;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalAlpha = 1;
    g.globalCompositeOperation = 'source-over';
    g.clearRect(0, 0, cv.width, cv.height);
    for (let i = puffs.length - 1; i >= 0; i--) if ((puffs[i].age += dt) >= puffs[i].life) puffs.splice(i, 1);
    for (const p of puffs) {
      p.vy -= 30 * dt;                                       // warm smoke rises
      p.vx -= p.vx * 1.5 * dt; p.vy -= p.vy * 0.8 * dt;      // and slows in the air
      p.vx += Math.sin(p.y * 0.04 + T * 1.3) * 38 * dt;      // the flow that curls it
      p.vy += Math.cos(p.x * 0.035 - T * 1.1) * 14 * dt;
      p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.spin * dt;
      const a = p.age / p.life;
      draw(smokeTex.puffs[p.tex], p.x, p.y, p.s0 + (p.s1 - p.s0) * Math.sqrt(a), p.rot,
        p.op * Math.min(1, a * 5) * Math.pow(1 - a, 1.6));
    }
    g.globalCompositeOperation = 'lighter';                  // sparks glow
    for (let i = sparks.length - 1; i >= 0; i--) {
      const p = sparks[i];
      if ((p.age += dt) >= p.life) { sparks.splice(i, 1); continue; }
      p.vy += 90 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
      const a = p.age / p.life;
      draw(smokeTex.spark, p.x, p.y, 7 * (1 - a * 0.5), 0, 1 - a);
    }
    if (ending && !puffs.length && !sparks.length) { cv.remove(); return; }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  return {
    // a puff from the censer at (x, y), which is moving at (vx, vy) px a second
    puff(x, y, vx, vy) {
      if (puffs.length >= 240) return;
      puffs.push({ x: x + (Math.random() - 0.5) * 10, y, vx: vx * 0.25 + (Math.random() - 0.5) * 12, vy: vy * 0.25 - 15 - Math.random() * 20,
        age: 0, life: 2.4 + Math.random() * 1.4, s0: 10 + Math.random() * 8, s1: 70 + Math.random() * 50,
        rot: Math.random() * Math.PI * 2, spin: (Math.random() - 0.5) * 1.2, op: 0.3 + Math.random() * 0.2, tex: Math.floor(Math.random() * 3) });
    },
    spark(x, y) {
      sparks.push({ x, y, vx: (Math.random() - 0.5) * 60, vy: -40 - Math.random() * 60, age: 0, life: 0.5 + Math.random() * 0.5 });
    },
    // the censer has gone; the canvas goes once the last smoke fades
    end() { ending = true; }
  };
}
// A thurible swings across the screen trailing incense: one word cleared the whole goal.
function censerSweep() {
  const W = window.innerWidth, H = window.innerHeight;
  const el = document.createElement('div'); el.className = 'censer'; el.innerHTML = CENSER_SVG; document.body.appendChild(el);
  const bells = [...el.querySelectorAll('.cbell')];
  // the chains hang from (31, 3.6) on screen; the smoke leaves the top of the globe, 108.5 px below
  const OX = 31, pivotY = H * 0.22, L = 108.5, dur = 2800, t0 = performance.now();
  const swing = (k) => Math.sin(k * Math.PI * 5) * 0.55;
  const fx = incenseSmoke();
  let px = null, py = null, pt = 0, due = 0;
  const step = (t) => {
    const k = Math.min(1, (t - t0) / dur), x = -60 + (W + 120) * k, th = swing(k);
    const vel = (swing(k + 0.004) - swing(k - 0.004)) / (0.008 * dur / 1000);   // radians a second
    el.style.transform = `translate(${x - OX}px,${pivotY}px) rotate(${th}rad)`;
    // the flat shadow stays down and to the right however the censer turns
    const dx = 7 * Math.cos(th) + 9 * Math.sin(th), dy = -7 * Math.sin(th) + 9 * Math.cos(th);
    el.style.filter = `drop-shadow(${dx.toFixed(1)}px ${dy.toFixed(1)}px 0 rgba(42,22,9,.5))`;
    // each bell hangs straight down, lags the swing a little and jingles
    const sec = (t - t0) / 1000;
    bells.forEach(b => {
      const bk = +b.dataset.k, side = +b.dataset.side;
      const ang = -th * 180 / Math.PI + vel * 180 / Math.PI * (0.12 + 0.05 * bk) - 7 * Math.sin(sec * 11 + bk * 1.7 + side);
      b.setAttribute('transform', `rotate(${ang.toFixed(1)})`);
    });
    // smoke leaves the top of the globe 60 times a second (whatever the screen's frame rate), spread
    // along the path the globe took since the last frame, carrying a little of the censer's own speed
    const bx = x - L * Math.sin(th), by = pivotY + L * Math.cos(th);
    if (fx && px !== null && t > pt) {
      const s = (t - pt) / 1000, vx = (bx - px) / s, vy = (by - py) / s;
      due += s * 60;
      for (let n = Math.floor(due), i = 1; i <= n; i++) {
        const f = i / n;
        fx.puff(px + (bx - px) * f, py + (by - py) * f, vx, vy);
        if (Math.random() < 0.18) fx.spark(px + (bx - px) * f, py + (by - py) * f);
      }
      due -= Math.floor(due);
    }
    px = bx; py = by; pt = t;
    if (k < 1) requestAnimationFrame(step);
    else { el.remove(); if (fx) fx.end(); }
  };
  requestAnimationFrame(step);
}

// ---- Records kept on this device ----
const TF_BEST_KEY = 'tf_best';
function readBest() { try { return JSON.parse(localStorage.getItem(TF_BEST_KEY) || '{}') || {}; } catch (e) { return {}; } }
function saveBest(b) { try { localStorage.setItem(TF_BEST_KEY, JSON.stringify(b)); } catch (e) {} }

// ---- Full-screen scenes ----
function sceneHtml(kind, d) {
  const angel = `<div class="angel-big">${angelHtml()}</div>`;
  const stats = d.stats ? `<div class="stats-line">${d.stats}</div>` : '';
  if (kind === 'home') {
    return `<div class="bg"></div>${angel}
      <div class="speech">Every letter you forge makes the next word stronger. Spell well.<small>YOUR GUARDIAN ANGEL</small></div>
      <h1>Tile Forge</h1><div class="sub">SEVEN TERRACES · ONE FORGE</div>
      ${stats}
      <div class="btns">
        <button class="btn gold" data-act="startRun">Light the forge</button>
        <div class="btn-row"><button class="btn wood" data-act="rules">How to play</button><button class="btn wood" data-act="menu">${d.stake}</button></div>
      </div>`;
  }
  if (kind === 'win') {
    return `<div class="bg"></div><div class="rays"></div>${angel}
      <div class="speech">Well done, good and faithful servant.<small>MATTHEW 25:21</small></div>
      <h1>Ascended</h1><div class="sub">ALL SEVEN TERRACES CLEARED</div>${stats}
      <div class="btns"><button class="btn gold" data-act="endless">Keep climbing (endless)</button><button class="btn wood" data-act="toHome">New run</button></div>`;
  }
  if (kind === 'rest') {
    const stars = Array.from({ length: 40 }, () => `<i class="star" style="left:${(Math.random() * 100).toFixed(1)}%;top:${(Math.random() * 55).toFixed(1)}%;animation-duration:${(2 + Math.random() * 3).toFixed(1)}s;animation-delay:-${(Math.random() * 3).toFixed(1)}s"></i>`).join('');
    return `<div class="bg"></div>${stars}${angel}
      <div class="speech">You cleared the seven terraces and climbed ${d.beyond} beyond. Rest now: every word you forged is kept.<small>YOUR GUARDIAN ANGEL</small></div>
      <h1>The Climb Ends</h1><div class="sub">ENDLESS · REACHED TERRACE ${d.terrace}</div>${stats}
      <div class="btns"><button class="btn gold" data-act="toHome">New run</button></div>`;
  }
  const ash = Array.from({ length: 28 }, () => `<i class="ash" style="left:${(Math.random() * 100).toFixed(1)}%;animation-duration:${(5 + Math.random() * 7).toFixed(1)}s;animation-delay:-${(Math.random() * 10).toFixed(1)}s"></i>`).join('');
  return `<div class="bg"></div>${ash}${angel}
    <div class="speech">Not yet, child. Let the forge cool, then light it again.<small>YOUR GUARDIAN ANGEL</small></div>
    <h1>The Forge Goes Cold</h1><div class="sub">TERRACE ${d.terrace} · ${d.scoreLine}</div>${stats}
    <div class="btns"><button class="btn cinnabar" data-act="toHome">Try a new run</button><button class="btn wood" data-act="retryStage">Retry this stage</button></div>`;
}
function showScene(kind, d = {}) {
  const sc = document.getElementById('scene');
  sc.innerHTML = sceneHtml(kind, d);
  sc.className = 'scene ' + kind;
  if (typeof coachClear === 'function') coachClear();
  MUSIC.setScene(kind === 'home' ? 'home' : 'end');
}
function hideScene() {
  const sc = document.getElementById('scene');
  sc.className = 'scene';
  sc.innerHTML = '';
}
const sceneOpen = () => document.getElementById('scene').classList.length > 1;

// ---- First-time hints: light up where to tap, once each ----
const COACH_KEY = 'tf_seen';
let coachSeen = {};
try { coachSeen = JSON.parse(localStorage.getItem(COACH_KEY) || '{}') || {}; } catch (e) {}
let coachCur = null;
function coachMark(id) {
  if (coachSeen[id]) return;
  coachSeen[id] = 1;
  try { localStorage.setItem(COACH_KEY, JSON.stringify(coachSeen)); } catch (e) {}
}
function coachReset() { coachSeen = {}; try { localStorage.removeItem(COACH_KEY); } catch (e) {} }
function coachClear() {
  document.querySelectorAll('.coach-glow').forEach(el => el.classList.remove('coach-glow'));
  const b = document.getElementById('coach');
  if (b) { b.className = ''; b.innerHTML = ''; }
  coachCur = null;
}
// step: {id, sel, text, gotIt}
function coachShow(step) {
  const target = document.querySelector(step.sel);
  if (!target) { coachClear(); return; }
  document.querySelectorAll('.coach-glow').forEach(el => { if (el !== target) el.classList.remove('coach-glow'); });
  target.classList.add('coach-glow');
  const b = document.getElementById('coach');
  if (coachCur !== step.id) {
    b.innerHTML = `<span>${step.text}</span>${step.gotIt ? `<button class="btn mini wood" data-coach-ok="${step.id}">Got it</button>` : ''}`;
    b.className = 'show';
    coachCur = step.id;
  }
  // sit below the target, or above it when there's no room
  const r = target.getBoundingClientRect();
  const bw = Math.min(300, window.innerWidth - 16);
  b.style.width = bw + 'px';
  const bh = b.offsetHeight || 60;
  const left = Math.max(8, Math.min(window.innerWidth - bw - 8, r.left + r.width / 2 - bw / 2));
  const fitsBelow = r.bottom + 12 + bh < window.innerHeight - 8, fitsAbove = r.top - bh - 12 > 8;
  const below = step.above ? !fitsAbove : fitsBelow;
  b.style.left = left + 'px';
  b.style.top = (below ? r.bottom + 12 : Math.max(8, r.top - bh - 12)) + 'px';
  b.classList.toggle('above', !below);
  b.style.setProperty('--ax', Math.max(14, Math.min(bw - 14, r.left + r.width / 2 - left)) + 'px');
}
document.addEventListener('click', e => {
  const ok = e.target.closest('[data-coach-ok]');
  if (!ok) return;
  coachMark(ok.dataset.coachOk);
  coachClear();
  if (typeof SFX !== 'undefined') SFX.pick();
}, true);
window.addEventListener('resize', () => { if (coachCur) { const id = coachCur; coachCur = null; document.dispatchEvent(new CustomEvent('tf-coach-refresh', { detail: id })); } });

// ---- Grace beyond counting: the screen shakes and tears open, light pours through the cracks,
// smoke rises, everything burns white, then the white glows down onto the Beatitude screen. ----
function glitchToWhite(duration = 2800) {
  return new Promise(resolve => {
    const app = document.getElementById('app');
    const layer = document.createElement('div'); layer.id = 'glitch-layer'; document.body.appendChild(layer);
    const white = document.createElement('div'); white.id = 'whiteout'; document.body.appendChild(white);
    app.classList.add('glitching');
    const t0 = performance.now(), W = window.innerWidth, H = window.innerHeight;
    const timer = setInterval(() => {
      const k = Math.min(1, (performance.now() - t0) / duration); // intensity builds from 0 to 1
      app.style.setProperty('--gk', k.toFixed(2));
      // torn slices of light
      const n = 1 + Math.round(k * 3);
      for (let i = 0; i < n; i++) {
        const sl = document.createElement('div'); sl.className = 'g-slice';
        sl.style.top = (Math.random() * 100).toFixed(1) + '%';
        sl.style.height = (0.6 + Math.random() * (2.5 + k * 9)).toFixed(1) + '%';
        sl.style.setProperty('--dx', ((Math.random() - 0.5) * 70 * (0.4 + k)).toFixed(0) + 'px');
        layer.appendChild(sl); setTimeout(() => sl.remove(), 80 + Math.random() * 170);
      }
      // a beam through a crack
      if (Math.random() < 0.3 + k * 0.55) {
        const r = document.createElement('div'); r.className = 'g-ray';
        r.style.left = (Math.random() * 100).toFixed(1) + '%';
        r.style.setProperty('--rot', ((Math.random() - 0.5) * 50).toFixed(0) + 'deg');
        layer.appendChild(r); setTimeout(() => r.remove(), 650);
      }
      if (Math.random() < 0.55) smoke(Math.random() * W, H - 10, 1, 40);
      if (Math.random() < 0.3 + k * 0.4) embers(Math.random() * W, H * (0.4 + Math.random() * 0.6), 2, 40);
      SFX.tone(80 + Math.random() * 1600, Math.random() < 0.5 ? 'square' : 'sawtooth', 0.05, 0.012 + k * 0.02, 40 + Math.random() * 400);
      if (k >= 1) {
        clearInterval(timer);
        white.classList.add('on');
        SFX.tone(220, 'sine', 1.4, 0.06, 1760);
        setTimeout(() => {
          app.classList.remove('glitching');
          app.style.removeProperty('--gk');
          layer.remove();
          // the caller puts the Beatitude in place, then calls this to let the white glow down
          resolve(() => { white.classList.add('fade'); setTimeout(() => white.remove(), 2600); });
        }, 700);
      }
    }, 70);
  });
}

// ---- Score smoke: the further a word goes past what you need, the higher smoke rises from
// behind the tiles (like Balatro's flames). Level 1 is reaching the goal, then each ten times
// over climbs higher (10x, 100x, 1000x). Level 5, smoke over the whole screen, is kept for
// infinity alone, so the big moment only comes with the glitch. ----
function scoreSmokeLevel(total, need) {
  if (!(total >= need) || need < 0) return 0;
  if (!isFinite(total)) return 5;
  const ratio = need > 0 ? total / need : 1e4;
  return ratio < 10 ? 1 : ratio < 100 ? 2 : ratio < 1000 ? 3 : 4;
}
const SMOKE_RISE = [0, 120, 230, 360, 520];
let smokeLevel = 0, smokeTimer = 0;
function setScoreSmoke(level) {
  if (level === smokeLevel) return;
  smokeLevel = level;
  clearInterval(smokeTimer);
  if (!level) return;
  const puff = () => {
    const line = document.querySelector('.verse-line');
    if (!line || document.hidden) return;
    if (document.querySelectorAll('.score-smoke').length > 70) return; // never let puffs pile up
    const r = line.getBoundingClientRect();
    if (!r.width) return;
    const full = smokeLevel >= 5;
    const rise = full ? r.top + 160 : SMOKE_RISE[smokeLevel];
    const count = smokeLevel >= 4 ? 2 : 1;
    for (let i = 0; i < count; i++) {
      const d = document.createElement('div');
      d.className = 'score-smoke';
      const size = 46 + smokeLevel * 14;
      d.style.width = d.style.height = size + 'px';
      // at full height the smoke spreads out past the word too
      const spread = full ? window.innerWidth : r.width;
      const x0 = full ? 0 : r.left;
      d.style.left = (x0 + Math.random() * spread) + 'px';
      d.style.top = (r.top + r.height * (0.35 + Math.random() * 0.4)) + 'px';
      document.body.appendChild(d);
      const dx = (Math.random() - 0.5) * (40 + smokeLevel * 30);
      const op = Math.min(0.62, 0.3 + smokeLevel * 0.07);
      d.animate([
        { transform: 'translate(-50%,-50%) scale(.45)', opacity: 0 },
        { transform: `translate(calc(-50% + ${dx * 0.25}px), calc(-50% - ${rise * 0.2}px)) scale(1)`, opacity: op, offset: 0.2 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% - ${rise}px)) scale(${1.8 + smokeLevel * 0.35})`, opacity: 0 }
      ], { duration: 1500 + rise * 2.4, easing: 'ease-out' }).onfinish = () => d.remove();
    }
  };
  puff();
  smokeTimer = setInterval(puff, Math.max(110, 260 - level * 30));
}
