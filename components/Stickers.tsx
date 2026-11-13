import type { CSSProperties } from "react";

type StickerProps = {
  className?: string;
  style?: CSSProperties;
  color?: string;
};

const base = (className?: string) => `sticker ${className ?? ""}`.trim();

/** Two-tone gummy heart (lilac board). */
export function GummyHeart({ className, style, color = "#c6aeef" }: StickerProps) {
  const gradientId = `gummy-${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg className={base(className)} style={style} viewBox="0 0 64 58" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.48" stopColor="#ffffff" />
          <stop offset="0.52" stopColor={color} />
        </linearGradient>
      </defs>
      <path
        d="M32 54C12 40 3 30 3 18 3 9 10 3 18 3c6 0 11 3 14 8 3-5 8-8 14-8 8 0 15 6 15 15 0 12-9 22-29 36z"
        fill={`url(#${gradientId})`}
        stroke="#ffffff"
        strokeWidth="3"
      />
      <ellipse cx="18" cy="14" rx="6" ry="3.5" fill="#fff" opacity=".8" transform="rotate(-30 18 14)" />
    </svg>
  );
}

/** Star hair clip. */
export function StarClip({ className, style, color = "#a98be0" }: StickerProps) {
  return (
    <svg className={base(className)} style={style} viewBox="0 0 64 64" aria-hidden="true">
      <path
        d="M32 4l8.2 17.6 19.3 2.3-14.2 13.2 3.7 19L32 46.6 15 56.1l3.7-19L4.5 23.9l19.3-2.3z"
        fill={color}
        stroke="#fff"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M32 18l4 9 9.6 1.1-7 6.6 1.8 9.4L32 39.4 23.6 44l1.8-9.4-7-6.6 9.6-1.1z" fill="#fff" opacity=".35" />
    </svg>
  );
}

export function Butterfly({ className, style, color = "#b49cf0" }: StickerProps) {
  return (
    <svg className={base(className)} style={style} viewBox="0 0 64 56" aria-hidden="true">
      <g className="wing-l">
        <path d="M31 26C24 8 6 2 4 12c-2 9 8 15 20 15-10 4-14 14-8 18 6 4 13-6 15-17z" fill={color} stroke="#fff" strokeWidth="2.5" />
      </g>
      <g className="wing-r">
        <path d="M33 26C40 8 58 2 60 12c2 9-8 15-20 15 10 4 14 14 8 18-6 4-13-6-15-17z" fill={color} stroke="#fff" strokeWidth="2.5" />
      </g>
      <rect x="30" y="16" width="4" height="24" rx="2" fill="#4b3478" />
      <path d="M31 17c-2-6-6-9-8-10M33 17c2-6 6-9 8-10" stroke="#4b3478" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/** Fuzzy 8-ball pillow (home board). */
export function EightBall({ className, style }: StickerProps) {
  return (
    <svg className={base(className)} style={style} viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="28" fill="#2d2440" stroke="#fff" strokeWidth="3" />
      <circle cx="30" cy="28" r="12" fill="#fff" />
      <text x="30" y="34" textAnchor="middle" fontSize="16" fontWeight="700" fill="#2d2440" fontFamily="sans-serif">8</text>
      <ellipse cx="44" cy="18" rx="5" ry="3" fill="#fff" opacity=".25" transform="rotate(35 44 18)" />
    </svg>
  );
}

/** Fluffy dice (home board). */
export function Dice({ className, style }: StickerProps) {
  return (
    <svg className={base(className)} style={style} viewBox="0 0 64 64" aria-hidden="true">
      <rect x="5" y="5" width="54" height="54" rx="14" fill="#fff" stroke="#e7dcf8" strokeWidth="3" />
      {[
        [20, 20],
        [44, 20],
        [32, 32],
        [20, 44],
        [44, 44],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="5" fill="#2d2440" />
      ))}
    </svg>
  );
}

export function Sparkle({ className, style, color = "#fff" }: StickerProps) {
  return (
    <svg className={base(className)} style={style} viewBox="0 0 40 40" aria-hidden="true">
      <path d="M20 0c1.5 11 4 15.5 20 20-16 4.5-18.5 9-20 20-1.5-11-4-15.5-20-20 16-4.5 18.5-9 20-20z" fill={color} />
    </svg>
  );
}

/** Lilac gummy bear. */
export function Bear({ className, style, color = "#c6aeef" }: StickerProps) {
  return (
    <svg className={base(className)} style={style} viewBox="0 0 56 64" aria-hidden="true">
      <g fill={color} stroke="#fff" strokeWidth="2.5">
        <circle cx="14" cy="10" r="7" />
        <circle cx="42" cy="10" r="7" />
        <circle cx="28" cy="20" r="15" />
        <ellipse cx="28" cy="44" rx="17" ry="16" />
        <circle cx="10" cy="36" r="6" />
        <circle cx="46" cy="36" r="6" />
        <circle cx="15" cy="57" r="6" />
        <circle cx="41" cy="57" r="6" />
      </g>
      <ellipse cx="28" cy="45" rx="9" ry="8" fill="#fff" opacity=".35" />
    </svg>
  );
}

export function Flower({ className, style, color = "#f6c4da" }: StickerProps) {
  return (
    <svg className={base(className)} style={style} viewBox="0 0 64 64" aria-hidden="true">
      {[0, 72, 144, 216, 288].map((r) => (
        <ellipse key={r} cx="32" cy="16" rx="11" ry="14" fill={color} stroke="#fff" strokeWidth="2.5" transform={`rotate(${r} 32 32)`} />
      ))}
      <circle cx="32" cy="32" r="8" fill="#fff4c9" stroke="#fff" strokeWidth="2.5" />
    </svg>
  );
}

/** Striped hot-air balloon (home board's balloon ceiling). */
export function HotAirBalloon({ className, style, color = "#c6aeef" }: StickerProps) {
  return (
    <svg className={base(className)} style={style} viewBox="0 0 80 112" aria-hidden="true">
      <path d="M40 4C18 4 4 20 4 38c0 20 22 36 30 46h12c8-10 30-26 30-46C76 20 62 4 40 4z" fill={color} />
      <path d="M40 4C30 4 22 20 22 38c0 20 10 36 14 46h8c4-10 14-26 14-46C58 20 50 4 40 4z" fill="#fff" opacity=".55" />
      <path d="M40 4c-4 0-7 16-7 34 0 20 3 36 5 46h4c2-10 5-26 5-46 0-18-3-34-7-34z" fill={color} />
      <path d="M34 84l2 12M46 84l-2 12" stroke="#7d6a5a" strokeWidth="1.5" />
      <rect x="33" y="95" width="14" height="12" rx="2" fill="#c49a6c" />
      <rect x="33" y="95" width="14" height="3" fill="#a77e52" />
    </svg>
  );
}
