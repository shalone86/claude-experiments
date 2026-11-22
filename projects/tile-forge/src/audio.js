/* =====================================================================
   AUDIO — sound effects and music, shared with The Scriptorium Vigil
   ===================================================================== */
// Volume: two sliders in the Menu, saved on this device.
const VOL = { music: 0.6, sfx: 0.6 };
try { Object.assign(VOL, JSON.parse(localStorage.getItem('tf_vol') || '{}')); } catch (e) {}
// Mixing: scales each slider so music and effects sit at about the same loudness.
const MIX = { music: 0.3, sfx: 2.2 };
function applyVol() {
  try { localStorage.setItem('tf_vol', JSON.stringify(VOL)); } catch (e) {}
  if (SFX.bus) SFX.bus.gain.value = VOL.sfx * MIX.sfx;
  if (MUSIC.bus) MUSIC.bus.gain.value = VOL.music * MIX.music;
}

const SFX = {
  ctx: null, muted: false, bus: null,
  out() {
    if (!this.bus) { this.bus = this.ctx.createGain(); this.bus.gain.value = VOL.sfx * MIX.sfx; this.bus.connect(this.ctx.destination); }
    return this.bus;
  },
  ensure() {
    try {
      if (!this.ctx) { const A = window.AudioContext || window.webkitAudioContext; if (!A) return null; this.ctx = new A(); }
      if (this.ctx.state === 'suspended' && !document.hidden) this.ctx.resume();
    } catch (e) {}
    return this.ctx;
  },
  tone(f, type, d, v = 0.07, slide = null) {
    if (this.muted || VOL.sfx <= 0) return;
    try {
      if (!this.ensure()) return;
      const o = this.ctx.createOscillator(), g = this.ctx.createGain(), t = this.ctx.currentTime;
      o.type = type; o.frequency.setValueAtTime(f, t);
      if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + d);
      g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + d);
      o.connect(g); g.connect(this.out()); o.start(t); o.stop(t + d);
    } catch (e) {}
  },
  pick() { this.tone(620, 'triangle', 0.05, 0.06, 820); },
  drop() { this.tone(360, 'triangle', 0.07, 0.07, 260); },
  tick(n) { this.tone(440 * Math.pow(1.06, n), 'triangle', 0.09, 0.06); },
  mult(n) { this.tone(330 * Math.pow(1.08, n), 'sawtooth', 0.12, 0.035, 660 * Math.pow(1.08, n)); },
  echo(n) { this.tone(520 * Math.pow(1.05, n), 'sine', 0.16, 0.05, 780 * Math.pow(1.05, n)); setTimeout(() => this.tone(780 * Math.pow(1.05, n), 'sine', 0.12, 0.03), 70); },
  chord() { [261.6, 329.6, 392, 523.2].forEach((f, i) => setTimeout(() => this.tone(f, 'triangle', 0.26, 0.07), i * 45)); },
  win() { [392, 493.9, 587.3, 784].forEach((f, i) => setTimeout(() => this.tone(f, 'sine', 0.34, 0.08), i * 80)); },
  coin() { this.tone(1200, 'square', 0.06, 0.03, 1800); setTimeout(() => this.tone(1600, 'square', 0.08, 0.03), 60); },
  whoosh() { this.tone(260, 'sine', 0.14, 0.07, 520); },
  page() { this.tone(180, 'sine', 0.3, 0.06, 420); },
  buzz() { this.tone(150, 'sawtooth', 0.16, 0.05, 105); },
  flare() { this.tone(300, 'sine', 0.22, 0.05, 900); setTimeout(() => this.tone(1200, 'triangle', 0.1, 0.025), 90); },
  bell() { [523.2, 659.3, 784, 1046.5].forEach((f, i) => setTimeout(() => this.tone(f, 'sine', 1.4, 0.06), i * 110)); this.tone(261.6, 'sine', 2.2, 0.05); },
  fanfare() {
    [[392, 0], [523.2, 140], [659.3, 280], [784, 420], [1046.5, 620]].forEach(([f, t]) => setTimeout(() => { this.tone(f, 'sawtooth', 0.45, 0.03); this.tone(f / 2, 'triangle', 0.55, 0.05); }, t));
    setTimeout(() => { [523.2, 659.3, 784, 1046.5, 1318.5].forEach(f => this.tone(f, 'sawtooth', 2.6, 0.022)); this.tone(130.8, 'triangle', 3, 0.07); this.tone(65.4, 'sine', 3, 0.08); }, 900);
  },
  shatter() { [2600, 1900, 3100, 1500, 2300].forEach((f, i) => setTimeout(() => this.tone(f, 'square', 0.06, 0.022, f * 0.55), i * 32)); }
};

// Music: the Scriptorium loops (src/audio), embedded at build time.
// G gameplay · B shop · C audit · D choir swell (stage cleared) · E minor swell (out of words)
const MUSIC_SRC = /*__AUDIO__*/{};
// Seconds of music in each loop before its reverb tail (4 bars at 80 bpm). The tail is mixed back
// over the start so the last bar rings into the next pass instead of leaving a gap.
const MUSIC_LOOP = { B: 12, C: 12, G: 12 };
const MUSIC = {
  bufs: {}, ready: false, loading: null, cur: null, key: null, scene: 'play', vol: 1, bus: null,
  out(c) {
    if (!this.bus) { this.bus = c.createGain(); this.bus.gain.value = VOL.music * MIX.music; this.bus.connect(c.destination); }
    return this.bus;
  },
  load() {
    if (this.loading) return this.loading;
    const c = SFX.ensure(); if (!c) return Promise.resolve();
    this.loading = (async () => {
      for (const [k, uri] of Object.entries(MUSIC_SRC)) {
        try {
          const bin = atob(uri.slice(uri.indexOf(',') + 1)); const u8 = new Uint8Array(bin.length);
          for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
          const buf = await new Promise((ok, no) => c.decodeAudioData(u8.buffer, ok, no));
          // skip the encoder's silent padding so loops are seamless
          const d = buf.getChannelData(0), th = 0.0015; let a = 0, b = d.length - 1;
          while (a < d.length && Math.abs(d[a]) < th) a++;
          while (b > a && Math.abs(d[b]) < th) b--;
          if (a < 0.02 * buf.sampleRate) a = 0;
          const n = Math.round((MUSIC_LOOP[k] || 0) * buf.sampleRate);
          if (n && a + n < buf.length) {
            const out = c.createBuffer(buf.numberOfChannels, n, buf.sampleRate);
            for (let ch = 0; ch < buf.numberOfChannels; ch++) {
              const src = buf.getChannelData(ch), dst = out.getChannelData(ch);
              dst.set(src.subarray(a, a + n));
              for (let i = a + n, j = 0; i < buf.length && j < n; i++, j++) dst[j] += src[i];
            }
            this.bufs[k] = { buf: out, s: 0, e: n / buf.sampleRate };
          } else this.bufs[k] = { buf, s: a / buf.sampleRate, e: (b + 1) / buf.sampleRate };
        } catch (e) {}
      }
      this.ready = true; this.key = null; this.update();
    })();
    return this.loading;
  },
  setScene(s) { if (s === this.scene) return; this.scene = s; this.update(); },
  update() {
    if (!this.ready) return;
    const k = this.scene === 'shop' ? 'B' : this.scene === 'audit' ? 'C' : 'G';
    if (k !== this.key) this.play(k);
  },
  play(k, loop = true) {
    this.key = k; const c = SFX.ctx; if (!c) return; const t = c.currentTime;
    if (this.cur) {
      const o = this.cur; o.g.gain.cancelScheduledValues(t); o.g.gain.setValueAtTime(o.g.gain.value, t);
      o.g.gain.linearRampToValueAtTime(0, t + 0.7); try { o.src.stop(t + 0.8); } catch (e) {}
      this.cur = null;
    }
    const b = this.bufs[k]; if (!b) return;
    const src = c.createBufferSource(); src.buffer = b.buf; src.loop = loop; src.loopStart = b.s; src.loopEnd = b.e;
    const g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(this.vol, t + 0.8);
    src.connect(g); g.connect(this.out(c)); src.start(t, b.s, loop ? undefined : b.e - b.s);
    this.cur = { src, g };
  },
  // a one-off swell over the loop, which ducks underneath it
  stinger(k) {
    const c = SFX.ctx, b = this.bufs[k]; if (!c || !b) return;
    const t = c.currentTime, dur = b.e - b.s;
    const src = c.createBufferSource(); src.buffer = b.buf; const g = c.createGain(); g.gain.value = this.vol * 1.1;
    src.connect(g); g.connect(this.out(c)); src.start(t, b.s, dur);
    if (this.cur) {
      const cg = this.cur.g.gain; cg.cancelScheduledValues(t); cg.setValueAtTime(cg.value, t);
      cg.linearRampToValueAtTime(this.vol * 0.2, t + 0.3); cg.setValueAtTime(this.vol * 0.2, t + dur - 1); cg.linearRampToValueAtTime(this.vol, t + dur + 0.5);
    }
  }
};
// Browsers only allow sound after a tap.
window.addEventListener('pointerdown', () => { SFX.ensure(); MUSIC.load(); }, { capture: true });
window.addEventListener('keydown', () => { SFX.ensure(); MUSIC.load(); }, { capture: true });
document.addEventListener('visibilitychange', () => { const c = SFX.ctx; if (!c) return; if (document.hidden) c.suspend(); else c.resume(); });
