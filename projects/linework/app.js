'use strict';
const $ = id => document.getElementById(id);
const stage = $('stage'), world = $('world'), ref = $('ref'), ink = $('ink'),
  strokesG = $('strokes'), live = $('live');
const NORM = 1000; // long side of the drawing in SVG units
const LS = { get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } },
             set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} } };

// ---------- tiny IndexedDB wrapper ----------
const db = (() => {
  const open = new Promise((res, rej) => {
    const r = indexedDB.open('linework', 1);
    r.onupgradeneeded = () => { r.result.createObjectStore('pics', { keyPath: 'id' }); r.result.createObjectStore('done', { keyPath: 'id' }); };
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  });
  const tx = async (s, mode, fn) => { const d = await open; return new Promise((res, rej) => { const t = d.transaction(s, mode); const q = fn(t.objectStore(s)); t.oncomplete = () => res(q && q.result); t.onerror = () => rej(t.error); }); };
  return { all: s => tx(s, 'readonly', o => o.getAll()), put: (s, v) => tx(s, 'readwrite', o => o.put(v)), del: (s, k) => tx(s, 'readwrite', o => o.delete(k)) };
})();

// ---------- state ----------
let items = [];            // {id,title,src|blob,description,tags}
let doneIds = new Set(LS.get('done', []));
let cur = null;            // current item
let W = NORM, H = NORM;    // drawing size in SVG units
let strokes = [], redo = [];
let view = { s: 1, x: 0, y: 0 };
const settings = Object.assign({ size: 2, stab: 40, opacity: 50, url: '', token: '', finger: false }, LS.get('settings', {}));
const saveSettings = () => LS.set('settings', settings);

const toast = (m, ms = 2200) => { const t = $('toast'); t.textContent = m; t.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => t.hidden = true, ms); };

// ---------- view transform ----------
function applyView() { world.style.transform = `translate(${view.x}px,${view.y}px) scale(${view.s})`; }
function fit() {
  const r = stage.getBoundingClientRect();
  view.s = Math.min(r.width / W, r.height / H) * 0.96;
  view.x = (r.width - W * view.s) / 2; view.y = (r.height - H * view.s) / 2; applyView();
}
function zoomAt(cx, cy, f) {
  const ns = Math.min(Math.max(view.s * f, 0.1), 40), k = ns / view.s;
  view.x = cx - (cx - view.x) * k; view.y = cy - (cy - view.y) * k; view.s = ns; applyView();
}
const toWorld = (cx, cy) => { const r = stage.getBoundingClientRect(); return [(cx - r.left - view.x) / view.s, (cy - r.top - view.y) / view.s]; };

// ---------- stroke rendering ----------
const f2 = n => Math.round(n * 100) / 100;
function pathD(p) {
  if (p.length === 1) return `M${f2(p[0][0])} ${f2(p[0][1])}L${f2(p[0][0])} ${f2(p[0][1])}`;
  let d = `M${f2(p[0][0])} ${f2(p[0][1])}`;
  for (let i = 1; i < p.length - 1; i++) {
    const mx = (p[i][0] + p[i + 1][0]) / 2, my = (p[i][1] + p[i + 1][1]) / 2;
    d += `Q${f2(p[i][0])} ${f2(p[i][1])} ${f2(mx)} ${f2(my)}`;
  }
  if (p.length > 1) d += `L${f2(p[p.length - 1][0])} ${f2(p[p.length - 1][1])}`;
  return d;
}
function renderStrokes() {
  strokesG.innerHTML = '';
  for (const s of strokes) { const el = document.createElementNS('http://www.w3.org/2000/svg', 'path'); el.setAttribute('d', pathD(s.pts)); el.setAttribute('stroke-width', s.w); strokesG.appendChild(el); }
}
const saveDraft = () => { if (cur) LS.set('draft:' + cur.id, strokes); };

// ---------- drawing + gestures ----------
const ptrs = new Map();
let drawing = null, gesture = null, panning = null, spaceDown = false;

function startStroke(e) {
  const p = toWorld(e.clientX, e.clientY);
  drawing = { pen: e.pointerType === 'pen', id: e.pointerId, brush: p.slice(), pts: [p.slice()], w: settings.size };
  live.setAttribute('stroke-width', settings.size);
  live.setAttribute('d', pathD(drawing.pts));
}
function moveStroke(e) {
  const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
  const rad = (settings.stab * 1.2) / view.s; // screen px -> world units
  for (const ev of (evs.length ? evs : [e])) {
    const q = toWorld(ev.clientX, ev.clientY), b = drawing.brush;
    const dx = q[0] - b[0], dy = q[1] - b[1], d = Math.hypot(dx, dy);
    if (d > rad && d > 0) {
      const k = (d - rad) / d; b[0] += dx * k; b[1] += dy * k;
      const last = drawing.pts[drawing.pts.length - 1];
      if (Math.hypot(b[0] - last[0], b[1] - last[1]) > 0.15 / view.s) drawing.pts.push(b.slice());
    }
  }
  live.setAttribute('d', pathD(drawing.pts));
}
function endStroke() {
  if (!drawing) return;
  strokes.push({ w: drawing.w, pts: drawing.pts }); redo = [];
  drawing = null; live.setAttribute('d', ''); renderStrokes(); saveDraft();
}
function cancelStroke() { drawing = null; live.setAttribute('d', ''); }

const touches = () => [...ptrs.values()].filter(p => p.type === 'touch');
function startGesture() {
  const t = touches(); if (t.length < 2) return;
  const [a, b] = t;
  gesture = { d: Math.hypot(a.x - b.x, a.y - b.y), cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2 };
}

stage.addEventListener('pointerdown', e => {
  if (e.target.closest('#empty button')) return;
  stage.setPointerCapture(e.pointerId);
  ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY, type: e.pointerType });
  if (!cur) return;
  const isPen = e.pointerType === 'pen', isMouse = e.pointerType === 'mouse';
  if (isMouse && (e.button === 1 || e.button === 2 || spaceDown)) { panning = { id: e.pointerId, x: e.clientX, y: e.clientY }; return; }
  if (isPen || (isMouse && e.button === 0)) { if (!drawing) { cancelGesture(); startStroke(e); } return; }
  if (e.pointerType === 'touch') {
    if (drawing && drawing.pen) return; // palm rejection
    if (touches().length === 1 && settings.finger) { startStroke(e); return; }
    if (touches().length >= 2) { if (drawing) cancelStroke(); panning = null; startGesture(); }
    else panning = { id: e.pointerId, x: e.clientX, y: e.clientY };
  }
});
function cancelGesture() { gesture = null; panning = null; }
stage.addEventListener('pointermove', e => {
  const p = ptrs.get(e.pointerId); if (!p) return;
  const px = p.x, py = p.y; p.x = e.clientX; p.y = e.clientY;
  if (drawing && drawing.id === e.pointerId) { moveStroke(e); return; }
  if (gesture && touches().length >= 2) {
    const [a, b] = touches(), d = Math.hypot(a.x - b.x, a.y - b.y), cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2;
    const r = stage.getBoundingClientRect();
    view.x += cx - gesture.cx; view.y += cy - gesture.cy;
    zoomAt(cx - r.left, cy - r.top, d / gesture.d);
    gesture.d = d; gesture.cx = cx; gesture.cy = cy; return;
  }
  if (panning && panning.id === e.pointerId) { view.x += e.clientX - px; view.y += e.clientY - py; applyView(); }
});
function up(e) {
  if (drawing && drawing.id === e.pointerId) endStroke();
  ptrs.delete(e.pointerId);
  if (panning && panning.id === e.pointerId) panning = null;
  if (touches().length < 2) gesture = null;
  if (touches().length === 1 && !settings.finger) { const t = [...ptrs.entries()].find(([, v]) => v.type === 'touch'); panning = { id: t[0], x: t[1].x, y: t[1].y }; }
}
stage.addEventListener('pointerup', up); stage.addEventListener('pointercancel', up);
stage.addEventListener('wheel', e => { e.preventDefault(); const r = stage.getBoundingClientRect(); zoomAt(e.clientX - r.left, e.clientY - r.top, Math.exp(-e.deltaY * 0.0015)); }, { passive: false });
stage.addEventListener('contextmenu', e => e.preventDefault());
addEventListener('keydown', e => {
  if (e.code === 'Space') spaceDown = true;
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.shiftKey ? doRedo() : doUndo(); e.preventDefault(); }
});
addEventListener('keyup', e => { if (e.code === 'Space') spaceDown = false; });
addEventListener('resize', fit);

// ---------- undo / redo ----------
function doUndo() { if (strokes.length) { redo.push(strokes.pop()); renderStrokes(); saveDraft(); } }
function doRedo() { if (redo.length) { strokes.push(redo.pop()); renderStrokes(); saveDraft(); } }
$('btnUndo').onclick = doUndo; $('btnRedo').onclick = doRedo; $('btnFit').onclick = fit;

// ---------- loading pictures ----------
let objUrl = null;
async function loadItems() {
  let bundled = [];
  try { bundled = await (await fetch('icons/index.json', { cache: 'no-cache' })).json(); } catch {}
  bundled = bundled.map(i => ({ ...i, src: 'icons/' + i.src }));
  let mine = []; try { mine = await db.all('pics'); } catch {}
  items = [...bundled, ...mine];
}
function setRef(item) {
  return new Promise(res => {
    if (objUrl) { URL.revokeObjectURL(objUrl); objUrl = null; }
    let src = item.src; if (item.blob) src = objUrl = URL.createObjectURL(item.blob);
    ref.onload = () => { const m = Math.max(ref.naturalWidth, ref.naturalHeight) || 1;
      W = Math.round(ref.naturalWidth / m * NORM); H = Math.round(ref.naturalHeight / m * NORM); res(); };
    ref.src = src;
  });
}
async function show(item) {
  cur = item; strokes = LS.get('draft:' + item.id, []); redo = [];
  await setRef(item);
  world.style.width = W + 'px'; world.style.height = H + 'px';
  ink.setAttribute('viewBox', `0 0 ${W} ${H}`);
  $('title').textContent = item.title || 'Untitled';
  $('empty').hidden = true; renderStrokes(); fit();
}
function pickRandom(avoid) {
  let pool = items.filter(i => !doneIds.has(i.id));
  if (avoid && pool.length > 1) pool = pool.filter(i => i.id !== avoid.id);
  return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
}
async function next(avoid) {
  const it = pickRandom(avoid);
  if (!it) { cur = null; ref.removeAttribute('src'); strokes = []; renderStrokes(); $('title').textContent = 'All done 🎉';
    $('empty').hidden = false; $('empty').firstElementChild.textContent = items.length ? 'Every picture is checked off.' : 'Nothing to draw yet.'; updateStats(); return; }
  await show(it); updateStats();
}
function updateStats() { $('stats').textContent = `${items.filter(i => doneIds.has(i.id)).length} done · ${items.filter(i => !doneIds.has(i.id)).length} left in rotation`; }
$('btnSkip').onclick = () => { saveDraft(); next(cur); };

// ---------- controls ----------
function bindRange(id, key, out, fmt = v => v) {
  const el = $(id); el.value = settings[key]; const o = out && $(out);
  const upd = () => { settings[key] = +el.value; if (o) o.textContent = fmt(settings[key]); saveSettings(); };
  el.addEventListener('input', upd); if (o) o.textContent = fmt(settings[key]);
}
bindRange('size', 'size', 'sizeOut'); bindRange('stab', 'stab', 'stabOut');
bindRange('opacity', 'opacity'); $('opacity').addEventListener('input', () => ref.style.opacity = settings.opacity / 100);
ref.style.opacity = settings.opacity / 100;

// ---------- SVG export ----------
const esc = s => String(s).replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c]));
function buildSVG(meta, bg) {
  const paths = strokes.map(s => `<path d="${pathD(s.pts)}" stroke-width="${s.w}"/>`).join('\n  ');
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<title>${esc(meta.title)}</title>
<desc>${esc(meta.description)}</desc>
<metadata>${esc(meta.tags.join(', '))}</metadata>
${bg ? `<rect width="${W}" height="${H}" fill="#fff"/>\n` : ''}<g fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round">
  ${paths}
</g>
</svg>`;
}
const slug = s => (s || 'drawing').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'drawing';
const meta = () => ({ id: cur.id, title: $('fTitle').value.trim() || cur.title || 'Untitled', description: $('fDesc').value.trim(),
  tags: $('fTags').value.split(',').map(t => t.trim()).filter(Boolean) });

$('btnDone').onclick = () => {
  if (!cur) return; if (!strokes.length) return toast('Draw something first');
  $('fTitle').value = cur.title || ''; $('fDesc').value = cur.description || ''; $('fTags').value = (cur.tags || []).join(', ');
  $('fBg').checked = false; $('doneMsg').textContent = ''; $('dlgDone').showModal();
};
$('btnDownload').onclick = () => {
  const m = meta(), a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([buildSVG(m, $('fBg').checked)], { type: 'image/svg+xml' }));
  a.download = slug(m.title) + '.svg'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
};
async function publish(m, svg) {
  if (!settings.url) throw new Error('Set the website URL in Library → Website settings');
  const r = await fetch(settings.url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(settings.token ? { Authorization: 'Bearer ' + settings.token } : {}) }, body: JSON.stringify({ ...m, svg }) });
  if (!r.ok) throw new Error('Server said ' + r.status);
}
$('btnPublish').onclick = async () => {
  const m = meta(); $('doneMsg').textContent = 'Publishing…';
  try { await publish(m, buildSVG(m, $('fBg').checked)); $('doneMsg').textContent = 'Published ✓'; }
  catch (err) { $('doneMsg').textContent = '⚠ ' + err.message; }
};
$('btnSave').onclick = async () => {
  const m = meta(), svg = buildSVG(m, $('fBg').checked);
  await db.put('done', { ...m, svg, date: Date.now() });
  doneIds.add(cur.id); LS.set('done', [...doneIds]); localStorage.removeItem('draft:' + cur.id);
  $('dlgDone').close(); toast('Saved ✓'); next();
};

// ---------- menu / gallery / settings / import ----------
$('btnMenu').onclick = () => { updateStats(); $('dlgMenu').showModal(); };
$('btnAdd').onclick = $('btnAdd2').onclick = () => $('file').click();
$('file').onchange = async e => {
  for (const f of e.target.files) {
    const id = 'u-' + Date.now() + Math.random().toString(36).slice(2, 6);
    await db.put('pics', { id, title: f.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '), blob: f, tags: [], description: '' });
  }
  e.target.value = ''; $('dlgMenu').close(); await loadItems(); toast('Added'); if (!cur) next(); else updateStats();
};
$('btnReset').onclick = () => { doneIds.clear(); LS.set('done', []); $('dlgMenu').close(); toast('All pictures back in rotation'); if (!cur) next(); else updateStats(); };
$('btnSettings').onclick = () => { $('dlgMenu').close(); $('sUrl').value = settings.url; $('sToken').value = settings.token; $('sFinger').checked = settings.finger; $('dlgSettings').showModal(); };
$('btnSaveSettings').onclick = () => { settings.url = $('sUrl').value.trim(); settings.token = $('sToken').value; settings.finger = $('sFinger').checked; saveSettings(); $('dlgSettings').close(); };
let galUrls = [];
$('btnGallery').onclick = async () => {
  $('dlgMenu').close(); galUrls.forEach(URL.revokeObjectURL); galUrls = [];
  const g = $('gal'); g.innerHTML = '';
  for (const d of (await db.all('done')).sort((a, b) => b.date - a.date)) {
    const u = URL.createObjectURL(new Blob([d.svg], { type: 'image/svg+xml' })); galUrls.push(u);
    const box = document.createElement('div'), im = document.createElement('img'); im.src = u; im.title = d.title; box.appendChild(im); g.appendChild(box);
  }
  if (!g.children.length) g.textContent = 'Nothing finished yet.';
  $('dlgGallery').showModal();
};
$('btnExportAll').onclick = async () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(await db.all('done'), null, 1)], { type: 'application/json' }));
  a.download = 'linework-export.json'; a.click();
};

// ---------- boot ----------
(async () => {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
  await loadItems(); await next();
  window.__lw = { get strokes() { return strokes; }, items };
})();
