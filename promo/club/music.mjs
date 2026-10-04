// Procedural soundtrack for the Nocheit club promo — 120 BPM, 32 s, A minor house.
// Every cue is aligned with the visual timeline in promo.html.
import fs from 'fs';

const SR = 48000, DUR = 32, N = SR * DUR;
const BPM = 120, BEAT = 60 / BPM, BAR = BEAT * 4;
const L = new Float32Array(N), R = new Float32Array(N);
const sendL = new Float32Array(N), sendR = new Float32Array(N); // reverb send

let seed = 1;
const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
const noise = () => rnd() * 2 - 1;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

class Biquad {
  constructor() { this.x1 = this.x2 = this.y1 = this.y2 = 0; this.set('lp', 1000, 0.7); }
  set(type, f, q) {
    const w = 2 * Math.PI * clamp(f, 20, SR * 0.45) / SR, c = Math.cos(w), s = Math.sin(w), a = s / (2 * q);
    let b0, b1, b2, a0, a1, a2;
    if (type === 'lp') { b0 = (1 - c) / 2; b1 = 1 - c; b2 = (1 - c) / 2; }
    else if (type === 'hp') { b0 = (1 + c) / 2; b1 = -(1 + c); b2 = (1 + c) / 2; }
    else { b0 = a; b1 = 0; b2 = -a; } // band-pass
    a0 = 1 + a; a1 = -2 * c; a2 = 1 - a;
    this.b0 = b0 / a0; this.b1 = b1 / a0; this.b2 = b2 / a0; this.a1 = a1 / a0; this.a2 = a2 / a0;
  }
  p(x) { const y = this.b0 * x + this.b1 * this.x1 + this.b2 * this.x2 - this.a1 * this.y1 - this.a2 * this.y2; this.x2 = this.x1; this.x1 = x; this.y2 = this.y1; this.y1 = y; return y; }
}
const add = (i, l, r, send = 0) => { if (i < 0 || i >= N) return; L[i] += l; R[i] += r; if (send) { sendL[i] += l * send; sendR[i] += r * send; } };

// ---------------------------------------------------------------
// arrangement helpers
// ---------------------------------------------------------------
const kicks = [];
// kick: 4-on-the-floor from 4.0 to 26.5, plus soft outro kicks
for (let t = 4.0; t < 26.5 - 1e-6; t += BEAT) kicks.push([t, 1]);
for (let t = 29.0; t < 31.0; t += BEAT) kicks.push([t, 0.55]);
kicks.push([27.0, 1.25]);

// sidechain envelope (from kicks)
const duck = new Float32Array(N).fill(1);
for (const [t, v] of kicks) {
  const i0 = Math.floor(t * SR);
  for (let j = 0; j < SR * 0.35; j++) { const i = i0 + j; if (i >= N) break; const d = 1 - 0.75 * Math.min(1, v) * Math.exp(-j / SR / 0.09); duck[i] = Math.min(duck[i], d); }
}

// ---------------------------------------------------------------
// drums
// ---------------------------------------------------------------
function kick(t, v) {
  const i0 = Math.floor(t * SR); let ph = 0;
  for (let j = 0; j < SR * 0.45; j++) {
    const tt = j / SR;
    const f = 46 + 130 * Math.exp(-tt / 0.03);
    ph += 2 * Math.PI * f / SR;
    const env = Math.exp(-tt / 0.22) * (tt < 0.002 ? tt / 0.002 : 1);
    let s = Math.sin(ph) * env * 0.95 + (j < 120 ? noise() * 0.25 * (1 - j / 120) : 0);
    s = Math.tanh(s * 1.6) * 0.62 * v;
    add(i0 + j, s, s);
  }
}
function clap(t, v = 1) {
  const i0 = Math.floor(t * SR); const bp = new Biquad(); bp.set('bp', 1500, 1.2);
  for (let j = 0; j < SR * 0.3; j++) {
    const tt = j / SR;
    const burst = [0, 0.011, 0.022].reduce((a, o) => a + (tt >= o ? Math.exp(-(tt - o) / 0.008) : 0), 0) * 0.6 + Math.exp(-tt / 0.12) * 0.7;
    const s = bp.p(noise()) * burst * 0.42 * v;
    add(i0 + j, s * 0.9, s, 0.35);
  }
}
function hat(t, v = 1, open = false) {
  const i0 = Math.floor(t * SR); const hp = new Biquad(); hp.set('hp', 7500, 0.8);
  const dec = open ? 0.11 : 0.025;
  const pan = 0.25 * Math.sin(t * 3.1);
  for (let j = 0; j < SR * dec * 5; j++) {
    const s = hp.p(noise()) * Math.exp(-j / SR / dec) * 0.13 * v;
    add(i0 + j, s * (1 - pan), s * (1 + pan));
  }
}
for (const [t, v] of kicks) kick(t, v);
for (let t = 4.0; t < 26.5 - 1e-6; t += BEAT) {
  const b = Math.round((t - 4) / BEAT);
  if (b % 2 === 1) clap(t, t < 7 ? 0.7 : 1);
  hat(t + BEAT / 2, t < 7 ? 0.6 : 1, true);
  if (t >= 11) { hat(t + BEAT / 4, 0.45); hat(t + 3 * BEAT / 4, 0.45); }
}
// snare-ish roll building into the final impact
{ let t = 25.0; while (t < 26.95) { clap(t, 0.35 + 0.5 * ((t - 25) / 2)); t += t < 26.0 ? BEAT / 2 : BEAT / 4; } }

// ---------------------------------------------------------------
// harmony: Am – F – C – G (one chord per bar)
// ---------------------------------------------------------------
const CHORDS = [[57, 60, 64], [53, 57, 60], [55, 60, 64], [55, 59, 62]];
const ROOTS = [45, 41, 48, 43];
const chordAt = t => Math.floor(t / BAR) % 4;

// pad: detuned saws through a slowly opening low-pass, sidechained
{
  const lpL = new Biquad(), lpR = new Biquad(); const phs = new Float64Array(12).map(() => rnd());
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    if (i % 64 === 0) {
      let fc = 300 + 2200 * clamp(t / 4, 0, 1);
      if (t > 26.4 && t < 27) fc = 2500 + 4000 * (t - 26.4) / 0.6;
      if (t >= 27) fc = 3200 - 1800 * clamp((t - 27) / 5, 0, 1);
      lpL.set('lp', fc, 0.9); lpR.set('lp', fc * 1.03, 0.9);
    }
    const ch = CHORDS[chordAt(t)];
    let sl = 0, sr = 0;
    for (let v = 0; v < 3; v++) {
      for (let d = 0; d < 2; d++) {
        const k = v * 2 + d; const f = mtof(ch[v]) * (1 + (d ? 0.006 : -0.006));
        phs[k] = (phs[k] + f / SR) % 1; const saw = phs[k] * 2 - 1;
        if (d) sr += saw; else sl += saw;
      }
      // sub-octave warmth
      const k2 = 6 + v; phs[k2] = (phs[k2] + mtof(ch[v] - 12) / SR) % 1; const s2 = Math.sin(phs[k2] * 2 * Math.PI) * 0.6; sl += s2; sr += s2;
    }
    let env = clamp(t / 2.0, 0, 1) * (1 - clamp((t - 31.0) / 1.0, 0, 1));
    if (t > 26.5 && t < 27) env *= 1 + (t - 26.5) * 1.2;
    const g = (t < 4 ? 0.11 : 0.075) * env * (t > 4 ? duck[i] : 1);
    add(i, lpL.p(sl) * g, lpR.p(sr) * g, 0.5);
  }
}

// bass: off-beat house bass from 7 s, with a filter that follows energy
{
  const lp = new Biquad(); let ph = 0, ph2 = 0;
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    if (t < 7 || t > 26.5 && t < 27 || t > 31.2) continue;
    const beatPos = ((t - 4) / BEAT) % 1; // 0..1 within beat
    const inNote = beatPos >= 0.5 && beatPos < 0.92;
    const tn = (beatPos - 0.5) * BEAT;
    const env = inNote ? Math.exp(-tn / 0.18) * Math.min(1, tn / 0.004) : 0;
    const f = mtof(ROOTS[chordAt(t)]);
    ph = (ph + f / SR) % 1; ph2 = (ph2 + f * 0.5 / SR) % 1;
    if (i % 32 === 0) lp.set('lp', 180 + 1400 * (inNote ? Math.exp(-tn / 0.07) : 0) + (t > 19 ? 300 : 0), 2.2);
    const s = lp.p((ph * 2 - 1) * 0.7 + Math.sin(ph2 * 2 * Math.PI) * 0.6) * env * 0.42 * (t >= 27 ? 0.6 : 1);
    add(i, s, s);
  }
}

// pluck arp: 16ths, enters at 15 s for lift
function pluck(t, midi, v, pan = 0) {
  const i0 = Math.floor(t * SR); const f = mtof(midi); let ph = 0; const lp = new Biquad();
  for (let j = 0; j < SR * 0.4; j++) {
    const tt = j / SR; if (j % 32 === 0) lp.set('lp', 800 + 5000 * Math.exp(-tt / 0.05), 1.2);
    ph = (ph + f / SR) % 1;
    const s = lp.p((ph * 2 - 1) * 0.6 + Math.sin(ph * 4 * Math.PI) * 0.3) * Math.exp(-tt / 0.12) * v * Math.min(1, tt / 0.002);
    add(i0 + j, s * (1 - pan), s * (1 + pan), 0.45);
  }
}
{
  const pat = [0, 1, 2, 1, 2, 0, 1, 2, 0, 2, 1, 2, 0, 1, 2, 2];
  for (let t = 15.0, k = 0; t < 26.5 - 1e-6; t += BEAT / 4, k++) {
    const ch = CHORDS[chordAt(t)];
    const oct = (k % 8 === 7) ? 24 : 12;
    pluck(t, ch[pat[k % 16]] + oct, 0.07 * (t < 19 ? 0.7 : 1), Math.sin(k * 0.7) * 0.4);
  }
}

// ---------------------------------------------------------------
// sound design: whooshes, UI pops, riser, impacts
// ---------------------------------------------------------------
function whoosh(tc, len = 0.75, v = 1) {
  const a = tc - len * 0.65; const i0 = Math.floor(a * SR); const n = Math.floor(len * SR);
  const bpL = new Biquad(), bpR = new Biquad();
  for (let j = 0; j < n; j++) {
    const k = j / n; const env = Math.pow(Math.sin(Math.PI * Math.pow(k, 0.8)), 2);
    if (j % 32 === 0) { const f = 400 + 5200 * Math.pow(Math.sin(Math.PI * k * 0.9), 1.5); bpL.set('bp', f, 1.4); bpR.set('bp', f * 1.15, 1.4); }
    const pan = (k - 0.5) * 1.4; // left-to-right sweep
    const s = env * 0.5 * v;
    add(i0 + j, bpL.p(noise()) * s * (1 - pan * 0.6), bpR.p(noise()) * s * (1 + pan * 0.6), 0.3);
  }
}
function pop(t, midi = 84, v = 1, pan = 0) {
  const i0 = Math.floor(t * SR); let ph = 0;
  for (let j = 0; j < SR * 0.25; j++) {
    const tt = j / SR; const f = mtof(midi) * (1 + 0.5 * Math.exp(-tt / 0.01));
    ph += 2 * Math.PI * f / SR;
    const s = Math.sin(ph) * Math.exp(-tt / 0.06) * 0.16 * v * Math.min(1, tt / 0.001);
    add(i0 + j, s * (1 - pan), s * (1 + pan), 0.5);
  }
}
function chime(t, notes, v = 1) {
  notes.forEach((m, k) => {
    const i0 = Math.floor((t + k * 0.06) * SR); let ph = 0, ph2 = 0;
    for (let j = 0; j < SR * 1.2; j++) {
      const tt = j / SR; ph += 2 * Math.PI * mtof(m) / SR; ph2 += 2 * Math.PI * mtof(m) * 3.01 / SR;
      const s = Math.sin(ph + 1.2 * Math.exp(-tt / 0.2) * Math.sin(ph2)) * Math.exp(-tt / 0.35) * 0.09 * v * Math.min(1, tt / 0.002);
      add(i0 + j, s, s, 0.7);
    }
  });
}
function riser(a, b, v = 1) {
  const i0 = Math.floor(a * SR), n = Math.floor((b - a) * SR); const bp = new Biquad(); let ph = 0;
  for (let j = 0; j < n; j++) {
    const k = j / n; if (j % 32 === 0) bp.set('bp', 300 + 7000 * k * k, 2);
    ph += 2 * Math.PI * (200 + 900 * k * k) / SR;
    const s = (bp.p(noise()) * 0.6 + Math.sin(ph) * 0.05) * Math.pow(k, 2) * 0.5 * v;
    add(i0 + j, s, s, 0.4);
  }
}
function impact(t, v = 1) {
  const i0 = Math.floor(t * SR); let ph = 0; const lp = new Biquad(); lp.set('lp', 9000, 0.7);
  for (let j = 0; j < SR * 2.2; j++) {
    const tt = j / SR; const f = 38 + 60 * Math.exp(-tt / 0.08); ph += 2 * Math.PI * f / SR;
    const boom = Math.sin(ph) * Math.exp(-tt / 0.7) * 0.6;
    const crash = lp.p(noise()) * Math.exp(-tt / 0.6) * 0.25;
    const s = (boom + crash) * v;
    add(i0 + j, s, s, 0.5);
  }
}
function blip(t, v = 1) { // the glowing dot breathing in
  const i0 = Math.floor(t * SR); let ph = 0;
  for (let j = 0; j < SR * 0.9; j++) { const tt = j / SR; ph += 2 * Math.PI * 880 / SR; const s = Math.sin(ph) * Math.exp(-tt / 0.25) * 0.07 * v; add(i0 + j, s, s, 0.9); }
}

// intro
blip(0.3, 0.8); blip(0.8, 0.5); blip(1.3, 0.35);
riser(0.9, 1.55, 0.6);
chime(1.55, [69, 76, 81, 88], 1.2);      // icon pops
for (let k = 0; k < 7; k++) pop(2.2 + k * 0.06, 86 + (k % 3) * 3, 0.45, (k - 3) * 0.12); // wordmark letters
riser(2.7, 4.0, 1.0);
impact(4.0, 0.6);
// hook words
[4.05, 4.3, 4.55, 5.05, 5.3, 5.55].forEach((t, k) => pop(t, 72 + [0, 3, 7, 0, 3, 7][k], 0.5));
// scene whips
[7, 11, 15, 19, 23].forEach(t => whoosh(t, 0.8, 0.9));
whoosh(4.0, 0.5, 0.5);
// publish scene: typing ticks, click, toast
for (let t = 7.85; t < 9.35; t += 0.07) { const i0 = Math.floor(t * SR); const hp = new Biquad(); hp.set('hp', 3000, 0.7); for (let j = 0; j < 500; j++) { const s = hp.p(noise()) * Math.exp(-j / 80) * 0.06; add(i0 + j, s, s); } }
pop(9.68, 60, 1.2); chime(9.78, [76, 81], 0.8); pop(9.9, 88, 0.9, 0.3);
// sales notifications (left/right)
[11.6, 12.0, 12.45, 12.85, 13.3, 13.7].forEach((t, k) => pop(t, [84, 88, 86, 91, 88, 93][k], 0.9, k % 2 ? 0.45 : -0.45));
chime(13.9, [81, 85, 88], 0.6);
// door checks + QR validation
[16.0, 16.4, 16.8, 17.2, 17.6].forEach((t, k) => pop(t, 81 + k * 2, 0.8, -0.3));
chime(17.5, [76, 81, 85, 88], 1.0);
// KPIs
[19.6, 19.8, 20.0, 20.2].forEach((t, k) => pop(t, [79, 83, 86, 91][k], 0.7, k % 2 ? 0.4 : -0.4));
// map
pop(23.6, 67, 1.3); chime(23.65, [69, 76], 0.7); pop(24.2, 88, 0.7);
// final build + impact + logo
riser(25.2, 27.0, 1.4);
impact(27.0, 1.2);
chime(27.05, [57, 64, 69, 76, 81], 1.0);
for (let k = 0; k < 7; k++) pop(27.25 + k * 0.05, 88 + (k % 3) * 2, 0.35, (k - 3) * 0.12);
[28.1, 28.28, 28.46].forEach((t, k) => pop(t, 76 + k * 4, 0.5));
pop(28.9, 72, 0.9); chime(28.95, [81, 88], 0.6);

// ---------------------------------------------------------------
// reverb (Schroeder/Freeverb-lite) on the send bus
// ---------------------------------------------------------------
function reverb(inp, combs, aps) {
  const out = new Float32Array(N);
  const bufs = combs.map(d => ({ b: new Float32Array(d), i: 0, f: 0 }));
  const abufs = aps.map(d => ({ b: new Float32Array(d), i: 0 }));
  for (let n = 0; n < N; n++) {
    let s = 0; const x = inp[n];
    for (const c of bufs) { const y = c.b[c.i]; c.f = y * 0.75 + c.f * 0.25; c.b[c.i] = x + c.f * 0.84; c.i = (c.i + 1) % c.b.length; s += y; }
    s *= 0.12;
    for (const a of abufs) { const y = a.b[a.i]; const v = s + y * 0.5; a.b[a.i] = v; a.i = (a.i + 1) % a.b.length; s = y - v * 0.5; }
    out[n] = s;
  }
  return out;
}
const sc = SR / 44100;
const rvL = reverb(sendL, [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617].map(d => Math.round(d * sc)), [556, 441, 341, 225].map(d => Math.round(d * sc)));
const rvR = reverb(sendR, [1139, 1211, 1300, 1379, 1445, 1514, 1580, 1640].map(d => Math.round(d * sc)), [579, 464, 364, 248].map(d => Math.round(d * sc)));

// ---------------------------------------------------------------
// master: mix, gentle glue + soft clip, normalize, fades
// ---------------------------------------------------------------
let peak = 0;
for (let i = 0; i < N; i++) {
  const t = i / SR;
  let l = L[i] + rvL[i] * 0.9, r = R[i] + rvR[i] * 0.9;
  l = Math.tanh(l); r = Math.tanh(r);
  const fade = Math.min(1, t / 0.05) * (1 - clamp((t - 31.4) / 0.6, 0, 1));
  L[i] = l * fade; R[i] = r * fade;
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const g = 0.89 / peak;
const buf = Buffer.alloc(44 + N * 4);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVE', 8); buf.write('fmt ', 12);
buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  buf.writeInt16LE(Math.round(clamp(L[i] * g, -1, 1) * 32767), 44 + i * 4);
  buf.writeInt16LE(Math.round(clamp(R[i] * g, -1, 1) * 32767), 46 + i * 4);
}
fs.writeFileSync(process.argv[2] || 'music.wav', buf);
console.log('peak', peak.toFixed(3), 'written');
