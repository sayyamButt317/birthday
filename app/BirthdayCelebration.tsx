"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import OpeningReveal from "@/components/OpeningReveal";
import PhotoArchive from "@/components/PhotoArchive";
import VinylPlayer from "@/components/VinylPlayer";
import WishCake from "@/components/WishCake";
import WishBoard from "@/components/WishBoard";
import {
  Bear,
  Butterfly,
  Dice,
  EightBall,
  Flower,
  GummyHeart,
  Sparkle,
  StarClip,
} from "@/components/Stickers";
import { createBirthdayMusic, playChime } from "@/lib/birthday-music";
import { createConfetti, type ConfettiController } from "@/lib/confetti";
import { CLOSING_LETTER, DICTIONARY, FROM, LETTER_GREETING, NAME, REASONS } from "@/lib/content";
import type { Photo } from "@/lib/photos";
import "./birthday.css";

type BirthdayCelebrationProps = {
  queen: Photo | null;
  photos: Photo[];
  showPhotoHint: boolean;
};

const NOTE_COLORS = ["lilac", "blue", "matcha", "pink", "butter", "lilac"];

export default function BirthdayCelebration({ queen, photos, showPhotoHint }: BirthdayCelebrationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const confettiRef = useRef<ConfettiController | null>(null);
  const musicRef = useRef<ReturnType<typeof createBirthdayMusic>>(null);

  const [revealed, setRevealed] = useState(false);
  const [showReveal, setShowReveal] = useState(true);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;
    const confetti = createConfetti(canvasRef.current);
    confettiRef.current = confetti;
    return () => confetti.destroy();
  }, []);

  useEffect(() => {
    if (!showReveal) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [showReveal]);

  useEffect(() => () => musicRef.current?.stop(), []);
  useEffect(() => {
    if (!revealed) return;
    const els = document.querySelectorAll<HTMLElement>(".reveal-on-scroll");
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        }),
      { threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [revealed]);

  const startMusic = useCallback(() => {
    if (!musicRef.current) musicRef.current = createBirthdayMusic();
    musicRef.current?.start();
    musicRef.current?.setMuted(false);
    setPlaying(true);
  }, []);

  const toggleMusic = useCallback(() => {
    if (playing) {
      musicRef.current?.stop();
      setPlaying(false);
    } else {
      startMusic();
    }
  }, [playing, startMusic]);

  const handleReveal = (withMusic: boolean) => {
    setRevealed(true);
    window.scrollTo({ top: 0, behavior: "auto" });
    playChime();
    window.setTimeout(() => setShowReveal(false), 800);

    const w = window.innerWidth;
    const h = window.innerHeight;
    confettiRef.current?.burst(w / 2, h * 0.4, undefined, 90);
    window.setTimeout(() => confettiRef.current?.burst(w * 0.2, h * 0.3), 200);
    window.setTimeout(() => confettiRef.current?.burst(w * 0.8, h * 0.3), 380);
    window.setTimeout(() => confettiRef.current?.rain(120), 500);

    if (withMusic) window.setTimeout(startMusic, 600);
  };

  const celebrateAt = (x: number, y: number, colors?: string[]) => {
    playChime();
    confettiRef.current?.burst(x, y, colors, 50);
  };

  const handleAllCandlesOut = () => {
    playChime();
    const w = window.innerWidth;
    const h = window.innerHeight;
    confettiRef.current?.burst(w / 2, h / 2, undefined, 120);
    window.setTimeout(() => confettiRef.current?.rain(200), 250);
  };

  return (
    <div className={`bday${revealed ? " is-revealed" : ""}`}>
      {showReveal ? <OpeningReveal exiting={revealed} onReveal={handleReveal} /> : null}

      <canvas className="confetti-canvas" ref={canvasRef} aria-hidden="true" />
      <header className="hero">
        <div className="hero-stickers" aria-hidden="true">
          <GummyHeart className="float f1" style={{ top: "9%", left: "6%", width: 70 }} />
          <StarClip className="float f2" style={{ top: "14%", right: "8%", width: 62 }} />
          <Butterfly className="float f3 flutter" style={{ top: "44%", left: "3%", width: 74 }} />
          <EightBall className="float f1" style={{ bottom: "12%", right: "6%", width: 64 }} />
          <Dice className="float f3" style={{ bottom: "8%", left: "10%", width: 54 }} />
          <Bear className="float f2" style={{ top: "58%", right: "16%", width: 44 }} />
          <GummyHeart className="float f3" color="#a9d8f0" style={{ top: "30%", right: "3%", width: 48 }} />
          <Flower className="float f1 spin-slow" style={{ top: "4%", left: "38%", width: 40 }} />
          <StarClip className="float f3" color="#b5d395" style={{ bottom: "26%", left: "24%", width: 34 }} />
          <Sparkle className="twinkle" style={{ top: "22%", left: "22%", width: 20 }} />
          <Sparkle className="twinkle t2" style={{ top: "70%", left: "40%", width: 16 }} />
          <Sparkle className="twinkle t3" style={{ top: "18%", right: "26%", width: 22 }} />
        </div>

        <div className="hero-inner">
          <p className="hero-eyebrow hand">it&apos;s your day ✿</p>
          <h1 className="hero-title">
            <span className="line">happy</span>
            <span className="line">birthday,</span>
            <em className="line name">{NAME}</em>
          </h1>
          <p className="hero-sub">
            a little surprise from a friend who gets to sit near the kindest heart, the
            brightest smile and the most beautiful soul — someone who makes every single day
            better just by being in it.
          </p>

          <article className="dictionary" aria-label={`Definition of ${DICTIONARY.word}`}>
            <p className="dict-word">
              {DICTIONARY.word} <span className="dict-phon">{DICTIONARY.phonetic}</span>
            </p>
            <p className="dict-type">{DICTIONARY.type}</p>
            <ol>
              {DICTIONARY.meanings.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ol>
          </article>
        </div>

        <a className="scroll-cue hand" href="#music">
          scroll for more ♡
        </a>
      </header>

      <main>
        <div className="marquee" aria-hidden="true">
          <div className="marquee-track">
            {Array.from({ length: 2 }).map((_, k) => (
              <span key={k}>
                happy birthday {NAME.toLowerCase()} 💜 lilac era 🦋 matcha o&apos;clock 🍵
                blue skies only 🩵 the way you speak to yourself matters ✨ we purple you 💜
                &nbsp;
              </span>
            ))}
          </div>
        </div>

        <div id="music" className="reveal-on-scroll">
          <VinylPlayer playing={playing} onToggle={toggleMusic} />
        </div>

        <div className="reveal-on-scroll">
          <PhotoArchive queen={queen} photos={photos} showHint={showPhotoHint} />
        </div>

        <div className="reveal-on-scroll">
          <WishBoard onCelebrate={celebrateAt} />
        </div>

        {/* ---------- NOTES ---------- */}
        <section className="section notes reveal-on-scroll" aria-labelledby="notes-title">
          <div className="section-head">
            <p className="kicker">pinned to the board</p>
            <h2 id="notes-title" className="section-title">
              reasons you&apos;re <em>the best</em>
            </h2>
            <p className="section-sub">(an incomplete list — I ran out of sticky notes)</p>
          </div>
          <ul className="corkboard">
            {REASONS.map((reason, i) => (
              <li key={reason} className={`note note-${NOTE_COLORS[i % NOTE_COLORS.length]}`}>
                <span className="pin" aria-hidden="true" />
                <span className="note-from">reason #{i + 1}</span>
                <p className="hand">{reason}</p>
              </li>
            ))}
          </ul>
        </section>

        <div className="reveal-on-scroll">
          <WishCake onBlow={(x, y) => confettiRef.current?.burst(x, y, undefined, 18)} onAllBlown={handleAllCandlesOut} />
        </div>
        <section className="section letter reveal-on-scroll" aria-label="A closing note">
          <div className="letter-paper">
            <p className="hand letter-dear">{LETTER_GREETING}</p>
            {CLOSING_LETTER.map((para) => (
              <p key={para} className="letter-body">
                {para}
              </p>
            ))}
            <p className="letter-sign">
              <span className="hand">with regards,</span>
              <strong>{FROM}</strong>
            </p>
            <span className="letter-stamp" aria-hidden="true">💜</span>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>
          made with lilac &amp; love for <em>{NAME}</em>
        </p>
      </footer>

      {revealed ? (
        <button
          type="button"
          className={`music-fab${playing ? " is-playing" : ""}`}
          onClick={toggleMusic}
          aria-pressed={playing}
          aria-label={playing ? "Pause music" : "Play music"}
        >
          <span className="music-fab-disc" aria-hidden="true" />
          {playing ? "music on" : "music off"}
        </button>
      ) : null}
    </div>
  );
}
