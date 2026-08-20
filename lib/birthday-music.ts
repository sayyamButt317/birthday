type BirthdayMusicController = {
  start: () => void;
  stop: () => void;
  setMuted: (muted: boolean) => void;
};

const CHORD = [261.63, 329.63, 392.0, 523.25, 392.0, 329.63];

export function createBirthdayMusic(): BirthdayMusicController | null {
  if (typeof window === "undefined") return null;

  const AudioContextClass =
    window.AudioContext ??
    (window as Window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;

  if (!AudioContextClass) return null;

  const ctx = new AudioContextClass();
  const masterGain = ctx.createGain();
  masterGain.gain.value = 0;
  masterGain.connect(ctx.destination);

  let intervalId = 0;
  let noteIndex = 0;
  let running = false;
  let muted = false;

  const playNote = (frequency: number, startTime: number) => {
    const oscillator = ctx.createOscillator();
    const noteGain = ctx.createGain();

    oscillator.type = "triangle";
    oscillator.frequency.value = frequency;

    noteGain.gain.setValueAtTime(0.0001, startTime);
    noteGain.gain.exponentialRampToValueAtTime(0.12, startTime + 0.04);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.9);

    oscillator.connect(noteGain);
    noteGain.connect(masterGain);

    oscillator.start(startTime);
    oscillator.stop(startTime + 0.95);
  };

  const scheduleNote = () => {
    if (!running) return;
    playNote(CHORD[noteIndex % CHORD.length], ctx.currentTime);
    noteIndex += 1;
  };

  return {
    start: () => {
      if (running) return;
      running = true;
      void ctx.resume();
      masterGain.gain.setTargetAtTime(muted ? 0 : 0.14, ctx.currentTime, 0.4);
      scheduleNote();
      intervalId = window.setInterval(scheduleNote, 900);
    },
    stop: () => {
      running = false;
      window.clearInterval(intervalId);
      masterGain.gain.setTargetAtTime(0, ctx.currentTime, 0.2);
    },
    setMuted: (isMuted: boolean) => {
      muted = isMuted;
      masterGain.gain.setTargetAtTime(
        isMuted || !running ? 0 : 0.14,
        ctx.currentTime,
        0.15,
      );
    },
  };
}

export function playRevealChime(): void {
  if (typeof window === "undefined") return;

  const AudioContextClass =
    window.AudioContext ??
    (window as Window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;

  if (!AudioContextClass) return;

  const ctx = new AudioContextClass();
  const gain = ctx.createGain();
  gain.gain.value = 0.18;
  gain.connect(ctx.destination);

  const fanfare = [523.25, 659.25, 783.99, 1046.5];

  fanfare.forEach((frequency, index) => {
    const oscillator = ctx.createOscillator();
    const noteGain = ctx.createGain();
    const start = ctx.currentTime + index * 0.12;

    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    noteGain.gain.setValueAtTime(0.0001, start);
    noteGain.gain.exponentialRampToValueAtTime(0.2, start + 0.03);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.55);

    oscillator.connect(noteGain);
    noteGain.connect(gain);
    oscillator.start(start);
    oscillator.stop(start + 0.6);
  });

  window.setTimeout(() => void ctx.close(), 1200);
}
