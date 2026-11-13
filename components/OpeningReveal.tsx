"use client";

import { useState } from "react";
import { NAME } from "@/lib/content";
import { Butterfly, GummyHeart, Sparkle, StarClip } from "@/components/Stickers";

type OpeningRevealProps = {
  exiting?: boolean;
  onReveal: (withMusic: boolean) => void;
};

export default function OpeningReveal({ exiting = false, onReveal }: OpeningRevealProps) {
  const [musicOn, setMusicOn] = useState(true);
  const [opening, setOpening] = useState(false);

  const open = () => {
    if (opening) return;
    setOpening(true);
    window.setTimeout(() => onReveal(musicOn), 1100);
  };

  return (
    <div
      className={`opening${exiting ? " is-exiting" : ""}${opening ? " is-opening" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={`A birthday letter for ${NAME}`}
    >
      <div className="opening-gingham" aria-hidden="true" />
      <GummyHeart className="float f1" style={{ top: "12%", left: "10%", width: 56 }} />
      <StarClip className="float f2" style={{ top: "18%", right: "12%", width: 50 }} />
      <Butterfly className="float f3 flutter" style={{ bottom: "16%", left: "14%", width: 60 }} />
      <GummyHeart className="float f2" color="#a9d8f0" style={{ bottom: "20%", right: "10%", width: 46 }} />
      <Sparkle className="twinkle" style={{ top: "30%", left: "24%", width: 18 }} />
      <Sparkle className="twinkle t2" style={{ top: "22%", right: "28%", width: 14 }} />

      <div className="opening-inner">
        <p className="opening-eyebrow">you&apos;ve got mail 💌</p>

        <button type="button" className="envelope" onClick={open} aria-label="Open the letter">
          <span className="envelope-back" />
          <span className="envelope-letter">
            <span className="hand">for</span>
            <strong>{NAME}</strong>
            <span className="hand small">open me ♡</span>
          </span>
          <span className="envelope-front" />
          <span className="envelope-flap" />
          <span className="envelope-seal">R</span>
        </button>

        <h1 className="opening-title">
          a little lilac letter
          <br />
          for <em>{NAME}</em>
        </h1>
        <p className="opening-text">sealed with love, from a friend 💜</p>

        <label className="toggle">
          <input type="checkbox" checked={musicOn} onChange={(e) => setMusicOn(e.target.checked)} />
          <span className="toggle-ui" aria-hidden="true" />
          play the music box
        </label>

        <button type="button" className="btn btn-primary" onClick={open}>
          open your letter
        </button>
      </div>
    </div>
  );
}
