"use client";

import { useState } from "react";

type OpeningRevealProps = {
  exiting?: boolean;
  onReveal: (withMusic: boolean) => void;
};

export default function OpeningReveal({
  exiting = false,
  onReveal,
}: OpeningRevealProps) {
  const [musicOn, setMusicOn] = useState(true);

  return (
    <div
      className={`opening-reveal${exiting ? " is-exiting" : ""}`} role="dialog" aria-modal="true" aria-label="Birthday surprise">
      <div className="opening-reveal-stars" aria-hidden="true" />
      <div className="opening-reveal-content">
        <div className="opening-reveal-eyebrow">Techtimize presents</div>
        <h2 className="opening-reveal-title">
          A birthday surprise
          <span>for Raheel Ahmed</span>
        </h2>
        <p className="opening-reveal-text">
          The team has prepared something special. Tap below to begin the
          celebration.
        </p>

        <div className="opening-reveal-actions">
          <label className="opening-reveal-music">
            <input
              type="checkbox"
              checked={musicOn}
              onChange={(event) => setMusicOn(event.target.checked)}
            />
            <span className="opening-reveal-music-ui" aria-hidden="true" />
            Play soft celebration music
          </label>

          <button
            type="button"
            className="opening-reveal-btn"
            onClick={() => onReveal(musicOn)}
          >
            Tap to celebrate
          </button>
        </div>
      </div>
    </div>
  );
}
