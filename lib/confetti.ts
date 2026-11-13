export const PASTELS = [
  "#c6aeef", // lilac
  "#a98be0", // lavender
  "#a9d8f0", // baby blue
  "#b5d395", // matcha
  "#f6c4da", // pink
  "#fff4c9", // butter
];

type Shape = "heart" | "star" | "dot" | "strip";

type Piece = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rot: number;
  vr: number;
  color: string;
  shape: Shape;
  life: number;
  decay: number;
  wobble: number;
};

export type ConfettiController = {
  burst: (x: number, y: number, colors?: string[], count?: number) => void;
  rain: (count?: number, colors?: string[]) => void;
  destroy: () => void;
};

const SHAPES: Shape[] = ["heart", "heart", "star", "dot", "strip", "strip"];
const pick = <T,>(list: readonly T[]) => list[Math.floor(Math.random() * list.length)];

function drawHeart(ctx: CanvasRenderingContext2D, s: number) {
  ctx.beginPath();
  ctx.moveTo(0, s * 0.3);
  ctx.bezierCurveTo(-s, -s * 0.4, -s * 0.4, -s * 1.1, 0, -s * 0.45);
  ctx.bezierCurveTo(s * 0.4, -s * 1.1, s, -s * 0.4, 0, s * 0.3);
  ctx.fill();
}

function drawStar(ctx: CanvasRenderingContext2D, s: number) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? s : s * 0.45;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fill();
}

export function createConfetti(canvas: HTMLCanvasElement): ConfettiController {
  const ctx = canvas.getContext("2d");
  let pieces: Piece[] = [];
  let frame = 0;
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener("resize", resize);

  const tick = () => {
    if (!ctx) return;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    pieces = pieces.filter((p) => p.life > 0 && p.y < window.innerHeight + 40);
    for (const p of pieces) {
      p.vy += 0.07;
      p.vx *= 0.99;
      p.wobble += 0.08;
      p.x += p.vx + Math.sin(p.wobble) * 0.4;
      p.y += p.vy;
      p.rot += p.vr;
      p.life -= p.decay;

      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      if (p.shape === "heart") drawHeart(ctx, p.size);
      else if (p.shape === "star") drawStar(ctx, p.size);
      else if (p.shape === "dot") {
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
      } else ctx.fillRect(-p.size * 0.5, -p.size * 0.2, p.size, p.size * 0.4);
      ctx.restore();
    }

    frame = pieces.length ? requestAnimationFrame(tick) : 0;
  };

  const ensureRunning = () => {
    if (!frame) frame = requestAnimationFrame(tick);
  };

  const scale = (n: number) => (reduced ? Math.ceil(n / 4) : n);

  return {
    burst: (x, y, colors = PASTELS, count = 60) => {
      for (let i = 0; i < scale(count); i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 6;
        pieces.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 3,
          size: 6 + Math.random() * 7,
          rot: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.2,
          color: pick(colors),
          shape: pick(SHAPES),
          life: 1.4,
          decay: 0.008 + Math.random() * 0.006,
          wobble: Math.random() * 10,
        });
      }
      ensureRunning();
    },
    rain: (count = 140, colors = PASTELS) => {
      for (let i = 0; i < scale(count); i++) {
        pieces.push({
          x: Math.random() * window.innerWidth,
          y: -20 - Math.random() * window.innerHeight * 0.6,
          vx: (Math.random() - 0.5) * 1.5,
          vy: 1 + Math.random() * 2,
          size: 6 + Math.random() * 7,
          rot: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.15,
          color: pick(colors),
          shape: pick(SHAPES),
          life: 3,
          decay: 0.002,
          wobble: Math.random() * 10,
        });
      }
      ensureRunning();
    },
    destroy: () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      pieces = [];
    },
  };
}
