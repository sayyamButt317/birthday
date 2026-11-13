"use client";

import { useState } from "react";
import { NAME } from "@/lib/content";
import { HotAirBalloon } from "@/components/Stickers";

type WishCakeProps = {
  onAllBlown: () => void;
  onBlow: (x: number, y: number) => void;
};

const CANDLES = [
  { x: 92, color: "#b5d395" },
  { x: 130, color: "#c6aeef" },
  { x: 168, color: "#a9d8f0" },
];

export default function WishCake({ onAllBlown, onBlow }: WishCakeProps) {
  const [blown, setBlown] = useState<boolean[]>(CANDLES.map(() => false));
  const done = blown.every(Boolean);

  const blow = (i: number, el: Element) => {
    if (blown[i]) return;
    const next = blown.map((b, j) => (j === i ? true : b));
    setBlown(next);
    const r = el.getBoundingClientRect();
    onBlow(r.left + r.width / 2, r.top);
    if (next.every(Boolean)) onAllBlown();
  };

  return (
    <section className="section wish" aria-labelledby="wish-title">
      <div className="sky" aria-hidden="true">
        <span className="cloud c1" />
        <span className="cloud c2" />
        <span className="cloud c3" />
        <HotAirBalloon className="sky-balloon b1" color="#c6aeef" />
        <HotAirBalloon className="sky-balloon b2" color="#a9d8f0" />
        <HotAirBalloon className="sky-balloon b3" color="#b5d395" />
        <HotAirBalloon className="sky-balloon b4" color="#f6c4da" />
        <HotAirBalloon className="sky-balloon b5" color="#fff4c9" />
      </div>

      <div className="wish-inner">
        <p className="kicker">last stop</p>
        <h2 id="wish-title" className="section-title">
          make a <em>wish</em>, {NAME}
        </h2>
        <p className="section-sub">
          {done ? "wish sent up with the balloons ✨" : "close your eyes… then tap each candle to blow it out."}
        </p>

        <svg className={`cake${done ? " is-done" : ""}`} viewBox="0 0 260 230" role="group" aria-label="Birthday cake">
          <ellipse cx="130" cy="214" rx="112" ry="11" fill="#4b347822" />
          <rect x="22" y="200" width="216" height="10" rx="5" fill="#fff" />
          {/* bottom tier */}
          <rect x="34" y="140" width="192" height="62" rx="12" fill="#ddcdf6" />
          <path d="M34 152c12 0 12 14 24 14s12-14 24-14 12 14 24 14 12-14 24-14 12 14 24 14 12-14 24-14 12 14 24 14 12-14 24-14v-8a12 12 0 0 0-12-12H46a12 12 0 0 0-12 12z" fill="#fff" />
          {[60, 100, 140, 180, 210].map((x) => (
            <circle key={x} cx={x} cy="186" r="4" fill="#a98be0" />
          ))}
          {/* top tier */}
          <rect x="66" y="96" width="128" height="48" rx="10" fill="#efe6fb" />
          <path d="M66 106c8 0 8 10 16 10s8-10 16-10 8 10 16 10 8-10 16-10 8 10 16 10 8-10 16-10 8 10 16 10 8-10 16-10v-2a8 8 0 0 0-8-8H74a8 8 0 0 0-8 8z" fill="#c6aeef" />
          <text x="130" y="134" textAnchor="middle" className="cake-text">{NAME.toLowerCase()}</text>

          {CANDLES.map((c, i) => (
            <g
              key={c.x}
              className={`candle${blown[i] ? " is-out" : ""}`}
              role="button"
              tabIndex={blown[i] ? -1 : 0}
              aria-label={blown[i] ? "Candle blown out" : `Blow out candle ${i + 1}`}
              onClick={(e) => blow(i, e.currentTarget)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  blow(i, e.currentTarget);
                }
              }}
            >
              <rect x={c.x - 18} y="20" width="36" height="80" fill="transparent" />
              <rect x={c.x - 5} y="56" width="10" height="42" rx="3" fill={c.color} />
              <path d={`M${c.x - 5} 66l10-6M${c.x - 5} 78l10-6M${c.x - 5} 90l10-6`} stroke="#fff" strokeWidth="2.5" />
              <line x1={c.x} y1="56" x2={c.x} y2="49" stroke="#4b3478" strokeWidth="2" />
              <g className="flame">
                <ellipse cx={c.x} cy="38" rx="9" ry="14" fill="#fff4c9" opacity=".6" />
                <path d={`M${c.x} 26c6 8 8 13 0 22-8-9-6-14 0-22z`} fill="#ffcf7a" />
                <path d={`M${c.x} 34c3 4 4 7 0 12-4-5-3-8 0-12z`} fill="#fff" />
              </g>
              <path className="smoke" d={`M${c.x} 46c-6-8 6-12 0-20s6-12 0-18`} stroke="#4b347855" strokeWidth="2" fill="none" />
            </g>
          ))}
        </svg>

        {done ? (
          <button
            type="button"
            className="btn btn-soft"
            onClick={() => setBlown(CANDLES.map(() => false))}
          >
            light them again
          </button>
        ) : null}
      </div>
    </section>
  );
}
