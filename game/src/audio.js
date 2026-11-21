// Spot the Difference — sound effects. WebAudio only, no audio files: every
// effect is a short oscillator phrase so the game plays fully offline.
let audioContext = null;
let muted = false;

function ensureContext() {
  if (audioContext === null) {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    audioContext = new Ctor();
  }
  if (audioContext.state === 'suspended') void audioContext.resume();
  return audioContext;
}

function playTone(freq, startAt, duration, type, volume) {
  const ctx = ensureContext();
  if (ctx === null || muted) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + startAt);
  gain.gain.setValueAtTime(0.0001, ctx.currentTime + startAt);
  gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + startAt + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startAt + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(ctx.currentTime + startAt);
  osc.stop(ctx.currentTime + startAt + duration + 0.05);
}

/** Two-note chime when a difference is found; pitch climbs with the combo. */
export function playFound(combo) {
  const lift = Math.min(combo, 8) * 22;
  playTone(660 + lift, 0, 0.16, 'sine', 0.22);
  playTone(990 + lift, 0.09, 0.24, 'sine', 0.2);
}

/** Soft low thud for a wrong click. */
export function playMiss() {
  playTone(160, 0, 0.18, 'triangle', 0.16);
}

/** Single tick for a hint. */
export function playHint() {
  playTone(520, 0, 0.1, 'sine', 0.14);
  playTone(780, 0.08, 0.14, 'sine', 0.12);
}

/** Rising arpeggio when a level is completed. */
export function playLevelComplete() {
  [523, 659, 784, 1047].forEach((freq, i) => playTone(freq, i * 0.11, 0.3, 'sine', 0.2));
}

/** Short click for buttons and level select. */
export function playClick() {
  playTone(440, 0, 0.06, 'square', 0.06);
}

/** Warm-up call: browsers only allow audio after a user gesture. */
export function unlockAudio() {
  ensureContext();
}

export function isMuted() {
  return muted;
}

export function toggleMuted() {
  muted = !muted;
  return muted;
}
