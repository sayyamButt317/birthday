"use client";

import { useState, type MouseEvent } from "react";
import { DRINKS } from "@/lib/content";

type BirthdayCafeProps = {
  onCelebrate: (x: number, y: number, colors: string[]) => void;
};

function Cup({ liquid, foam, filled }: { liquid: string; foam: string; filled: boolean }) {
  return (
    <svg className="cup" viewBox="0 0 120 170" aria-hidden="true">
      <defs>
        <clipPath id={`cup-${liquid.slice(1)}`}>
          <path d="M22 38h76l-9 122a8 8 0 0 1-8 7H39a8 8 0 0 1-8-7z" />
        </clipPath>
      </defs>
      {/* straw */}
      <rect x="66" y="2" width="9" height="70" rx="4" fill="#f6c4da" transform="rotate(8 70 40)" />
      <g clipPath={`url(#cup-${liquid.slice(1)})`}>
        <rect className="cup-fill" x="0" y={filled ? 52 : 168} width="120" height="130" fill={liquid} />
        <rect className="cup-fill" x="0" y={filled ? 46 : 168} width="120" height="14" fill={foam} />
        {filled ? (
          <g className="ice">
            <rect x="38" y="70" width="18" height="18" rx="4" fill="#fff" opacity=".55" transform="rotate(-12 47 79)" />
            <rect x="62" y="84" width="16" height="16" rx="4" fill="#fff" opacity=".5" transform="rotate(14 70 92)" />
            <circle cx="50" cy="140" r="5" fill="#4b3478" opacity=".35" />
            <circle cx="64" cy="146" r="5" fill="#4b3478" opacity=".35" />
            <circle cx="76" cy="138" r="5" fill="#4b3478" opacity=".35" />
          </g>
        ) : null}
      </g>
      {/* cup outline + lid */}
      <path d="M22 38h76l-9 122a8 8 0 0 1-8 7H39a8 8 0 0 1-8-7z" fill="#ffffff22" stroke="#fff" strokeWidth="3" />
      <rect x="14" y="28" width="92" height="12" rx="6" fill="#fff" />
      <path d="M28 56l3 50" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".7" />
    </svg>
  );
}

export default function BirthdayCafe({ onCelebrate }: BirthdayCafeProps) {
  const [ordered, setOrdered] = useState<Record<string, boolean>>({});

  const order = (id: string, colors: string[]) => (e: MouseEvent<HTMLButtonElement>) => {
    if (ordered[id]) return;
    setOrdered((prev) => ({ ...prev, [id]: true }));
    const rect = e.currentTarget.getBoundingClientRect();
    onCelebrate(rect.left + rect.width / 2, rect.top + rect.height * 0.35, colors);
  };

  return (
    <section className="section cafe" aria-labelledby="cafe-title">
      <div className="section-head">
        <p className="kicker">today&apos;s menu · on the house</p>
        <h2 id="cafe-title" className="section-title">
          the birthday <em>café</em>
        </h2>
        <p className="section-sub">pick a drink — every order comes with a wish.</p>
      </div>

      <div className="menu">
        {DRINKS.map((drink) => {
          const isOrdered = !!ordered[drink.id];
          return (
            <article key={drink.id} className={`menu-item menu-${drink.id}${isOrdered ? " is-ordered" : ""}`}>
              <span className="menu-tag">{drink.tag}</span>
              <Cup liquid={drink.liquid} foam={drink.foam} filled={isOrdered} />
              <h3>{drink.name}</h3>
              <p className="menu-wish" aria-live="polite">
                {isOrdered ? drink.wish : " "}
              </p>
              <button
                type="button"
                className="btn btn-soft"
                onClick={order(drink.id, [drink.liquid, drink.foam, "#ffffff"])}
                disabled={isOrdered}
              >
                {isOrdered ? "served with love ♡" : "order this one"}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
