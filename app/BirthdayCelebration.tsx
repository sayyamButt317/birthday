"use client";

import { useEffect, useRef, useState } from "react";
import "./birthday.css";

type ConfettiPiece = {
  x: number;
  y: number;
  r: number;
  c: string;
  vy: number;
  vx: number;
  rot: number;
  vr: number;
  fade?: boolean;
  life?: number;
};

type Balloon = {
  id: number;
  left: string;
  background: string;
  duration: string;
  delay: string;
};

const CONFETTI_COLORS = ["#e8b23c", "#0697D5", "#ffffff", "#0C5195", "#ffcf5c"];
const BALLOON_COLORS = ["#e8b23c", "#0697D5", "#ffffff", "#ff8a3d"];

export default function BirthdayCelebration() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const piecesRef = useRef<ConfettiPiece[]>([]);
  const treatCardRef = useRef<HTMLDivElement>(null);
  const balloonIdRef = useRef(0);

  const [giftOpened, setGiftOpened] = useState(false);
  const [responseNote, setResponseNote] = useState("");
  const [balloons, setBalloons] = useState<Balloon[]>([]);

  const spawnConfetti = (count: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    for (let i = 0; i < count; i++) {
      piecesRef.current.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * canvas.height * 0.5,
        r: 4 + Math.random() * 5,
        c: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        vy: 1.5 + Math.random() * 2.5,
        vx: -1 + Math.random() * 2,
        rot: Math.random() * 360,
        vr: -4 + Math.random() * 8,
      });
    }
  };

  const fireworkBurst = (x: number, y: number) => {
    for (let i = 0; i < 40; i++) {
      const angle = (Math.PI * 2 * i) / 40;
      const speed = 2 + Math.random() * 3;
      piecesRef.current.push({
        x,
        y,
        r: 3 + Math.random() * 3,
        c: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        vy: Math.sin(angle) * speed,
        vx: Math.cos(angle) * speed,
        rot: Math.random() * 360,
        vr: -6 + Math.random() * 12,
        fade: true,
      });
    }
  };

  const spawnBalloons = (count: number) => {
    const next: Balloon[] = [];
    for (let i = 0; i < count; i++) {
      balloonIdRef.current += 1;
      next.push({
        id: balloonIdRef.current,
        left: `${Math.random() * 100}vw`,
        background:
          BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)],
        duration: `${7 + Math.random() * 5}s`,
        delay: `${Math.random() * 2}s`,
      });
    }

    setBalloons((prev) => [...prev, ...next]);

    window.setTimeout(() => {
      const ids = new Set(next.map((b) => b.id));
      setBalloons((prev) => prev.filter((b) => !ids.has(b.id)));
    }, 14000);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);
    spawnConfetti(120);

    let frameId = 0;
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      piecesRef.current.forEach((p) => {
        p.x += p.vx;
        p.rot += p.vr;
        if (p.fade) {
          p.vy += 0.06;
          p.y += p.vy;
          p.life = (p.life || 1) - 0.012;
        } else {
          p.y += p.vy;
          if (p.y > canvas.height + 20) {
            p.y = -20;
            p.x = Math.random() * canvas.width;
          }
        }
        ctx.save();
        ctx.globalAlpha = p.fade ? Math.max(p.life ?? 1, 0) : 1;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.6);
        ctx.restore();
      });
      piecesRef.current = piecesRef.current.filter(
        (p) => !(p.fade && (p.life ?? 1) <= 0),
      );
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    spawnBalloons(10);
    const balloonInterval = window.setInterval(() => spawnBalloons(4), 6000);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frameId);
      window.clearInterval(balloonInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only setup for canvas + balloons
  }, []);

  const handleOpenGift = () => {
    if (giftOpened) return;
    setGiftOpened(true);
    setResponseNote("");

    const canvas = canvasRef.current;
    if (canvas) {
      fireworkBurst(canvas.width / 2, canvas.height / 2.5);
      window.setTimeout(
        () => fireworkBurst(canvas.width * 0.3, canvas.height * 0.4),
        200,
      );
      window.setTimeout(
        () => fireworkBurst(canvas.width * 0.7, canvas.height * 0.4),
        400,
      );
    }

    spawnBalloons(8);
    window.setTimeout(() => {
      treatCardRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 50);
  };

  const handleClose = () => {
    setGiftOpened(false);
    setResponseNote("");
  };

  const handleAccept = () => {
    setResponseNote(
      "That's the spirit! The team is already arguing about restaurants.",
    );
    spawnConfetti(200);
  };

  const handleLater = () => {
    setResponseNote("Fair enough — we'll follow up and find a date that works.");
  };

  return (
    <div className="birthday-page">
      <canvas id="confetti-canvas" ref={canvasRef} />
      <div className="balloons" aria-hidden="true">
        {balloons.map((balloon) => (
          <div
            key={balloon.id}
            className="balloon"
            style={{
              left: balloon.left,
              background: balloon.background,
              animationDuration: balloon.duration,
              animationDelay: balloon.delay,
            }}
          />
        ))}
      </div>

      <div className="wrap">
        <div className="eyebrow">Techtimize · Celebration</div>
        <h1>
          Happy Birthday,
          <br />
          <span>Raheel Ahmed</span>
        </h1>
        <p className="subtitle">
          The whole Techtimize team is lighting a candle for the person who
          lights the way for all of us.
        </p>

        <div className="cake-scene">
          <svg
            width="220"
            height="180"
            viewBox="0 0 220 180"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <ellipse
              cx="110"
              cy="165"
              rx="90"
              ry="10"
              fill="rgba(0,0,0,0.2)"
            />
            <rect x="40" y="110" width="140" height="50" rx="6" fill="#f2d9c2" />
            <rect x="40" y="110" width="140" height="12" fill="#fbe8d6" />
            <rect x="55" y="90" width="110" height="24" rx="5" fill="#e8b23c" />
            <rect x="55" y="90" width="110" height="8" fill="#f3cf74" />
            <rect x="75" y="60" width="70" height="34" rx="5" fill="#f2d9c2" />
            <rect x="75" y="60" width="70" height="9" fill="#fbe8d6" />
            <g className="flame">
              <rect x="105" y="35" width="4" height="26" fill="#8a5a2b" />
              <path
                d="M107 12 C112 20 116 26 107 36 C98 26 102 20 107 12 Z"
                fill="#ffcf5c"
              />
              <path
                d="M107 20 C110 25 112 28 107 34 C102 28 104 25 107 20 Z"
                fill="#ff8a3d"
              />
            </g>
            <circle cx="70" cy="105" r="4" fill="#0697D5" />
            <circle cx="90" cy="102" r="4" fill="#e8b23c" />
            <circle cx="130" cy="102" r="4" fill="#0697D5" />
            <circle cx="150" cy="105" r="4" fill="#e8b23c" />
          </svg>
        </div>

        <div className="blessing">
          <span className="quote-mark">&ldquo;</span>
          <p>
            May this new year of your life bring you the same clarity, courage,
            and heart you bring to Techtimize every single day. May your health
            stay strong, your family stay close, and every goal you set find its
            way into your hands. We&apos;re grateful to build under your
            leadership — here&apos;s to more milestones, more laughter, and more
            reasons to celebrate together.
          </p>
          <div className="sign">
            — With respect and gratitude, Team Techtimize
          </div>
        </div>

        <p className="company-line">
          On behalf of every desk, every team, and every project we&apos;ve
          shipped together — <b>Techtimize</b> wishes you a year ahead as
          visionary and driven as the one behind you. Thank you for building a
          place we&apos;re proud to grow in.
        </p>

        <div className="treat-box">
          <div className="treat-label">Your surprise is waiting</div>
          <div
            className="gift-wrap"
            onClick={handleOpenGift}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleOpenGift();
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="Tap the gift to open"
          >
            <svg
              className={`gift${giftOpened ? " opened" : ""}`}
              viewBox="0 0 90 90"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <rect x="12" y="38" width="66" height="42" rx="4" fill="#0697D5" />
              <rect x="12" y="38" width="66" height="10" fill="#0C5195" />
              <rect x="40" y="38" width="10" height="42" fill="#e8b23c" />
              <path d="M45 38 C30 20 10 24 20 38 Z" fill="#e8b23c" />
              <path d="M45 38 C60 20 80 24 70 38 Z" fill="#e8b23c" />
            </svg>
            <div className="tap-label">Tap the gift to open</div>
          </div>

          <div
            className={`treat-card${giftOpened ? " show" : ""}`}
            id="treatCard"
            ref={treatCardRef}
          >
            <button
              className="close-btn"
              onClick={handleClose}
              aria-label="Close"
              type="button"
            >
              &times;
            </button>
            <div className="tag">Team request</div>
            <h2>It&apos;s your birthday — treat time!</h2>
            <p>
              You know the rule: birthday boy treats the team. So it&apos;s time
              to make it happen, whenever works for you.
            </p>
            <div className="btn-row">
              <button
                className="btn primary"
                type="button"
                onClick={handleAccept}
              >
                Count me in!
              </button>
              <button className="btn" type="button" onClick={handleLater}>
                Let&apos;s plan it soon
              </button>
            </div>
            <div
              className={`response-note${responseNote ? " show" : ""}`}
            >
              {responseNote}
            </div>
          </div>
        </div>
      </div>

      <footer>Made with gratitude by Team Techtimize</footer>
    </div>
  );
}
