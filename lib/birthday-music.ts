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

// Notes for the little sparkle chime (C major arpeggio).
const C5 = 523.25, E5 = 659.25, G5 = 783.99;

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

export const SONG_URL = "/sound/HappyBirthday.mp3";
const VOLUME = 0.7;

/**
 * Plays the birthday song (public/sound/HappyBirthday.mp3) on loop with soft
 * fade-ins/outs. The file is only downloaded once music is first started.
 */
export function createBirthdayMusic(): BirthdayMusicController | null {
  if (typeof window === "undefined") return null;

  const audio = new Audio();
  audio.preload = "none";
  audio.loop = true;
  audio.volume = 0;

  let running = false;
  let muted = false;
  let fadeId = 0;

  const fadeTo = (target: number, ms: number, onDone?: () => void) => {
    window.clearInterval(fadeId);
    const from = audio.volume;
    const steps = Math.max(1, Math.round(ms / 40));
    let n = 0;
    fadeId = window.setInterval(() => {
      n += 1;
      audio.volume = Math.min(1, Math.max(0, from + ((target - from) * n) / steps));
      if (n >= steps) {
        window.clearInterval(fadeId);
        onDone?.();
      }
    }, 40);
  };

  return {
    start: () => {
      if (running) return;
      running = true;
      if (!audio.src) audio.src = SONG_URL;
      void audio.play().catch(() => {
        running = false; // browser blocked autoplay; the music button can retry
      });
      if (!muted) fadeTo(VOLUME, 1200);
    },
    stop: () => {
      running = false;
      fadeTo(0, 500, () => audio.pause());
    },
    setMuted: (isMuted: boolean) => {
      muted = isMuted;
      if (running) fadeTo(isMuted ? 0 : VOLUME, 400);
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
