// Procedural sound: room tone, a slow generative score, and interface foley. No samples.
export class Sound {
  constructor() { this.enabled = true; this.ctx = null; this.tension = 0; this.lastType = 0; }

  init() {
    if (this.ctx) { this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    const ctx = (this.ctx = new AC());
    this.master = ctx.createGain(); this.master.gain.value = this.enabled ? 0.9 : 0;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 3;
    this.master.connect(comp).connect(ctx.destination);
    // Reverb from a synthetic impulse
    const len = ctx.sampleRate * 3.2, ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
    this.reverb = ctx.createConvolver(); this.reverb.buffer = ir;
    const wet = ctx.createGain(); wet.gain.value = 0.55; this.reverb.connect(wet).connect(this.master);
    this.music = ctx.createGain(); this.music.gain.value = 0.0; this.music.connect(this.master); this.music.connect(this.reverb);
    this.music.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 6);
    this.sfx = ctx.createGain(); this.sfx.gain.value = 0.8; this.sfx.connect(this.master);
    this.sfxWet = ctx.createGain(); this.sfxWet.gain.value = 0.25; this.sfx.connect(this.sfxWet).connect(this.reverb);
    this.noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    { const d = this.noiseBuf.getChannelData(0); let b = 0; for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; b = (b + 0.02 * w) / 1.02; d[i] = b * 3.2 + w * 0.02; } }
    // Room tone
    const room = ctx.createBufferSource(); room.buffer = this.noiseBuf; room.loop = true;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 220; const rg = ctx.createGain(); rg.gain.value = 0.2;
    room.connect(lp).connect(rg).connect(this.master); room.start();
    // Drone
    this.drone = this.osc('sine', 73.42, 0.05, this.music);
    this.droneB = this.osc('sine', 77.78, 0.0, this.music); // minor second, swells with tension
    this.step = 0; this.nextChord = ctx.currentTime + 0.5; this.nextTick = ctx.currentTime + 1; this.nextNote = ctx.currentTime + 4;
    this.timer = setInterval(() => this.schedule(), 200);
  }

  osc(type, freq, gain, dest) {
    const o = this.ctx.createOscillator(); o.type = type; o.frequency.value = freq; const g = this.ctx.createGain(); g.gain.value = gain; o.connect(g).connect(dest); o.start(); return { o, g };
  }

  schedule() {
    const ctx = this.ctx, now = ctx.currentTime;
    // D minor: i – VI – iv – V, voiced low
    const chords = [[146.83, 174.61, 220.0, 293.66], [116.54, 146.83, 174.61, 233.08], [98.0, 146.83, 196.0, 233.08], [110.0, 138.59, 164.81, 220.0], [146.83, 174.61, 220.0, 349.23], [87.31, 130.81, 174.61, 220.0], [98.0, 116.54, 146.83, 196.0], [110.0, 138.59, 164.81, 277.18]];
    while (this.nextChord < now + 1) {
      const ch = chords[this.step % chords.length]; this.chord = ch; const t = this.nextChord, dur = 10.5;
      ch.forEach((f, i) => {
        for (const det of [-5, 6]) {
          const o = ctx.createOscillator(); o.type = i === 0 ? 'triangle' : 'sawtooth'; o.frequency.value = f; o.detune.value = det;
          const fl = ctx.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = 420 + i * 90; fl.Q.value = 0.4;
          const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.028, t + 3.5); g.gain.setValueAtTime(0.028, t + dur - 4); g.gain.linearRampToValueAtTime(0, t + dur + 1.5);
          o.connect(fl).connect(g).connect(this.music); o.start(t); o.stop(t + dur + 2);
        }
      });
      this.step++; this.nextChord += 9;
    }
    while (this.nextNote < now + 1 && this.chord) {
      const f = this.chord[1 + Math.floor(Math.random() * 3)] * (Math.random() > 0.6 ? 4 : 2); this.pluck(f, this.nextNote, 0.05 + Math.random() * 0.03);
      if (Math.random() > 0.65) this.pluck(f * 1.5, this.nextNote + 0.45, 0.03);
      this.nextNote += 2.2 + Math.random() * 4.5;
    }
    while (this.nextTick < now + 1) { this.tick(this.nextTick, Math.round(this.nextTick) % 2); this.nextTick += 1; }
    this.droneB.g.gain.setTargetAtTime(this.tension * 0.045, now, 2); this.drone.g.gain.setTargetAtTime(0.05 + this.tension * 0.03, now, 2);
  }

  pluck(f, t, vol) {
    const ctx = this.ctx; const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + 3.2);
    for (const [m, a] of [[1, 1], [2, 0.32], [3, 0.1]]) { const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f * m; const og = ctx.createGain(); og.gain.value = a; o.connect(og).connect(g); o.start(t); o.stop(t + 3.4); }
    g.connect(this.music);
  }

  tick(t, alt) { this.burst({ t, dur: 0.018, freq: alt ? 2600 : 2100, q: 9, vol: 0.035, type: 'bandpass', dest: this.master }); }

  burst({ t, dur = 0.05, freq = 1200, q = 1, vol = 0.2, type = 'bandpass', dest, attack = 0.002 }) {
    if (!this.ctx) return; const ctx = this.ctx; t = t ?? ctx.currentTime;
    const s = ctx.createBufferSource(); s.buffer = this.noiseBuf; s.playbackRate.value = 0.8 + Math.random() * 0.5;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 300;
    const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol * 9, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(hp).connect(f).connect(g).connect(dest || this.sfx); s.start(t, Math.random()); s.stop(t + dur + 0.05);
  }

  tone(f, dur, vol, type = 'sine', when = 0, slide = 0) {
    if (!this.ctx) return; const ctx = this.ctx, t = ctx.currentTime + when; const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g).connect(this.sfx); o.start(t); o.stop(t + dur + 0.05);
  }

  // ---- foley ----
  hover() { this.burst({ dur: 0.02, freq: 3800, q: 2, vol: 0.012 }); }
  click() { this.burst({ dur: 0.03, freq: 1900, q: 3, vol: 0.06 }); this.tone(180, 0.06, 0.05, 'sine', 0, 90); }
  type() { if (!this.ctx) return; const n = performance.now(); if (n - this.lastType < 42) return; this.lastType = n; this.burst({ dur: 0.016, freq: 2400 + Math.random() * 1400, q: 5, vol: 0.02 }); }
  paper() { this.burst({ dur: 0.34, freq: 3200, q: 0.5, vol: 0.05, attack: 0.09 }); this.burst({ t: this.ctx?.currentTime + 0.12, dur: 0.22, freq: 5200, q: 0.7, vol: 0.03, attack: 0.05 }); }
  stamp() { this.tone(120, 0.22, 0.5, 'sine', 0, 42); this.burst({ dur: 0.09, freq: 700, q: 0.7, vol: 0.2 }); }
  gavel() { for (const w of [0, 0.22]) { this.tone(240, 0.12, 0.3, 'triangle', w, 110); this.burst({ t: this.ctx?.currentTime + w, dur: 0.05, freq: 1400, q: 1, vol: 0.12 }); } }
  chime() { [587.33, 440, 698.46].forEach((f, i) => this.tone(f, 1.6, 0.07, 'sine', i * 0.16)); }
  good() { [392, 493.88, 587.33].forEach((f, i) => this.tone(f, 1.2, 0.06, 'sine', i * 0.09)); }
  bad() { [233.08, 220, 155.56].forEach((f, i) => this.tone(f, 1.5, 0.08, 'triangle', i * 0.14)); }
  swell() { this.tone(73.42, 3.5, 0.22, 'sine'); this.tone(110, 3.5, 0.1, 'triangle', 0.1); this.burst({ dur: 2.4, freq: 240, q: 0.4, vol: 0.05, attack: 1.2 }); }
  drum() { for (let i = 0; i < 14; i++) this.burst({ t: this.ctx?.currentTime + i * 0.055, dur: 0.06, freq: 240, q: 1.2, vol: 0.03 + i * 0.006 }); this.tone(98, 0.9, 0.3, 'sine', 0.8, 55); }

  setTension(v) { this.tension = Math.max(0, Math.min(1, v)); }
  toggle() { this.enabled = !this.enabled; if (this.ctx) this.master.gain.setTargetAtTime(this.enabled ? 0.9 : 0, this.ctx.currentTime, 0.1); return this.enabled; }
}
