type BirthdayMusicController = {
  start: () => void;
  stop: () => void;
  setMuted: (muted: boolean) => void;
};

type AudioCtor = typeof AudioContext;

function getAudioContextClass(): AudioCtor | null {
  if (typeof window === "undefined") return null;
  return (
    window.AudioContext ??
    (window as Window & { webkitAudioContext?: AudioCtor }).webkitAudioContext ??
    null
  );
}

// "Happy Birthday" (public domain) in C — [frequency, beats]. 0 = rest.
const G4 = 392.0, A4 = 440.0, B4 = 493.88, C5 = 523.25, D5 = 587.33,
  E5 = 659.25, F5 = 698.46, G5 = 783.99;

const MELODY: [number, number][] = [
  [G4, 0.75], [G4, 0.25], [A4, 1], [G4, 1], [C5, 1], [B4, 2],
  [G4, 0.75], [G4, 0.25], [A4, 1], [G4, 1], [D5, 1], [C5, 2],
  [G4, 0.75], [G4, 0.25], [G5, 1], [E5, 1], [C5, 1], [B4, 1], [A4, 2],
  [F5, 0.75], [F5, 0.25], [E5, 1], [C5, 1], [D5, 1], [C5, 3],
  [0, 2],
];

const BEAT = 0.46; // seconds — gentle, music-box tempo
const LOOP_SECONDS = MELODY.reduce((sum, [, beats]) => sum + beats, 0) * BEAT;
const VOLUME = 0.16;

/** A soft music-box note: sine + bell-ish overtone with a quick decay. */
function musicBoxNote(
  ctx: AudioContext,
  destination: AudioNode,
  frequency: number,
  start: number,
) {
  const partials: [number, number][] = [
    [1, 0.5],
    [2, 0.18],
    [3.01, 0.06],
  ];

  partials.forEach(([ratio, level]) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = frequency * ratio;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(level, start + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 1.4 / ratio);
    osc.connect(gain);
    gain.connect(destination);
    osc.start(start);
    osc.stop(start + 1.5);
  });
}

export function createBirthdayMusic(): BirthdayMusicController | null {
  const AudioContextClass = getAudioContextClass();
  if (!AudioContextClass) return null;

  const ctx = new AudioContextClass();
  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  let running = false;
  let muted = false;
  let timeoutId = 0;

  const scheduleLoop = () => {
    if (!running) return;
    let t = ctx.currentTime + 0.08;
    for (const [freq, beats] of MELODY) {
      if (freq > 0) musicBoxNote(ctx, master, freq, t);
      t += beats * BEAT;
    }
    timeoutId = window.setTimeout(scheduleLoop, LOOP_SECONDS * 1000);
  };

  const applyGain = () => {
    master.gain.setTargetAtTime(
      running && !muted ? VOLUME : 0,
      ctx.currentTime,
      0.25,
    );
  };

  return {
    start: () => {
      if (running) return;
      running = true;
      void ctx.resume();
      applyGain();
      scheduleLoop();
    },
    stop: () => {
      running = false;
      window.clearTimeout(timeoutId);
      applyGain();
    },
    setMuted: (isMuted: boolean) => {
      muted = isMuted;
      applyGain();
    },
  };
}

/** A tiny sparkly arpeggio for "moments" (opening the letter, wishes…). */
export function playChime(): void {
  const AudioContextClass = getAudioContextClass();
  if (!AudioContextClass) return;

  const ctx = new AudioContextClass();
  const out = ctx.createGain();
  out.gain.value = 0.22;
  out.connect(ctx.destination);

  [C5, E5, G5, C5 * 2].forEach((freq, i) => {
    musicBoxNote(ctx, out, freq, ctx.currentTime + i * 0.09);
  });

  window.setTimeout(() => void ctx.close(), 2000);
}
