"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import type { Photo } from "@/lib/photos";
import { NAME } from "@/lib/content";

type PhotoArchiveProps = {
  queen: Photo | null;
  photos: Photo[];
  showHint: boolean;
};

// Stable "random" tilt per polaroid so SSR and client agree.
const TILTS = [-4, 3, -2, 5, -5, 2, -3, 4, 1, -1];
const TAPES = ["#d9c8f7cc", "#bfe3f5cc", "#d3e8bccc", "#f8d3e3cc"];

function Media({ photo, inLightbox = false }: { photo: Photo; inLightbox?: boolean }) {
  if (photo.kind === "video") {
    return inLightbox ? (
      <video src={photo.src} autoPlay loop controls playsInline />
    ) : (
      <video src={photo.src} autoPlay loop muted playsInline preload="metadata" aria-label={photo.caption} />
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={photo.src} alt={photo.caption} loading={inLightbox ? undefined : "lazy"} draggable={false} />;
}

// Columns drift at different speeds while scrolling (parallax).
const SPEEDS = [-0.6, 0.45, -0.3, 0.7];

/** 3D tilt + glare that follows the mouse (ignored for touch). */
function tilt(e: PointerEvent<HTMLElement>, strength = 10) {
  if (e.pointerType !== "mouse") return;
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width;
  const y = (e.clientY - r.top) / r.height;
  el.style.setProperty("--ry", `${(x - 0.5) * strength}deg`);
  el.style.setProperty("--rx", `${(0.5 - y) * strength}deg`);
  el.style.setProperty("--mx", `${x * 100}%`);
  el.style.setProperty("--my", `${y * 100}%`);
}
function untilt(e: PointerEvent<HTMLElement>) {
  const el = e.currentTarget;
  ["--rx", "--ry"].forEach((v) => el.style.setProperty(v, "0deg"));
}

export default function PhotoArchive({ queen, photos, showHint }: PhotoArchiveProps) {
  const all = queen ? [queen, ...photos] : photos;
  const [open, setOpen] = useState<number | null>(null);
  const [shuffle, setShuffle] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const offset = queen ? 1 : 0;

  // Pin-drop entrance + videos only play while on screen.
  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;
    const reveal = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          reveal.unobserve(entry.target);
        }),
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    root.querySelectorAll(".pin-item, .queen-card").forEach((el) => reveal.observe(el));

    const playback = new IntersectionObserver((entries) =>
      entries.forEach((entry) => {
        const video = entry.target as HTMLVideoElement;
        if (entry.isIntersecting) void video.play().catch(() => undefined);
        else video.pause();
      }),
    );
    root.querySelectorAll(".polaroid-wall video, .queen-photo video").forEach((v) => playback.observe(v));

    return () => {
      reveal.disconnect();
      playback.disconnect();
    };
  }, [shuffle, photos.length]);

  // Scroll parallax: --p goes from -1 (section below) to 1 (section above).
  useEffect(() => {
    const root = sectionRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const r = root.getBoundingClientRect();
      if (r.bottom < -200 || r.top > window.innerHeight + 200) return;
      const center = r.top + r.height / 2 - window.innerHeight / 2;
      const p = Math.max(-1, Math.min(1, -center / (r.height / 2 + window.innerHeight / 2)));
      root.style.setProperty("--p", p.toFixed(3));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((i) => (i === null ? i : (i + 1) % all.length));
      if (e.key === "ArrowLeft") setOpen((i) => (i === null ? i : (i - 1 + all.length) % all.length));
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, all.length]);

  if (all.length === 0 && !showHint) return null;

  const current = open !== null ? all[open] : null;

  return (
    <section ref={sectionRef} className="section archive" aria-labelledby="archive-title">
      <div className="section-head">
        <p className="kicker">exhibit A, B, C… all of them</p>
        <h2 id="archive-title" className="section-title">
          the <em>{NAME}</em> archives
        </h2>
        <p className="section-sub">a wall of pure iconic behaviour. tap any polaroid — some of them move.</p>
        {photos.length > 1 ? (
          <button type="button" className="btn btn-soft shuffle-btn" onClick={() => setShuffle((n) => n + 1)}>
            🔀 shuffle the wall
          </button>
        ) : null}
      </div>

      {all.length === 0 ? (
        <div className="photo-hint">
          <strong>Add her photos 📸</strong>
          <p>
            Drop images or videos into <code>public/asset/</code> and refresh. Captions and order
            live in <code>lib/content.ts</code>. (This note only shows in development.)
          </p>
        </div>
      ) : null}

      <div className="archive-layout">
        <button
          type="button"
          className="queen-card"
          onClick={() => queen && setOpen(0)}
          onPointerMove={(e) => tilt(e, 14)}
          onPointerLeave={untilt}
          aria-label={`${NAME}, queen of hearts — open photo`}
        >
          <span className="queen-corner tl">
            <span>Q</span>
            <span>♥</span>
          </span>
          <span className="queen-photo">
            {queen ? <Media photo={queen} /> : <span className="queen-placeholder">♛</span>}
          </span>
          <span className="queen-caption hand">queen of hearts</span>
          <span className="queen-corner br">
            <span>Q</span>
            <span>♥</span>
          </span>
        </button>

        <ul className="polaroid-wall" key={shuffle}>
          {photos.map((photo, i) => (
            <li
              key={photo.src}
              className="pin-item"
              style={{
                ["--tilt" as string]: `${TILTS[(i + shuffle * 3) % TILTS.length] * (shuffle % 2 ? -1 : 1)}deg`,
                ["--speed" as string]: SPEEDS[i % SPEEDS.length],
                ["--d" as string]: i % 4,
              }}
            >
              <button
                type="button"
                className="polaroid"
                onClick={() => setOpen(i + offset)}
                onPointerMove={(e) => tilt(e)}
                onPointerLeave={untilt}
                aria-label={`Open ${photo.kind === "video" ? "video" : "photo"}: ${photo.caption}`}
              >
                <span className="tape" style={{ background: TAPES[i % TAPES.length] }} />
                <span className="polaroid-img">
                  <Media photo={photo} />
                  {photo.kind === "video" ? (
                    <span className="live-badge" aria-hidden="true">
                      ● live
                    </span>
                  ) : null}
                </span>
                <span className="polaroid-caption hand">{photo.caption}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {current && open !== null ? (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={current.caption} onClick={() => setOpen(null)}>
          <button type="button" className="lightbox-close" aria-label="Close" onClick={() => setOpen(null)}>
            ×
          </button>
          {all.length > 1 ? (
            <button
              type="button"
              className="lightbox-nav prev"
              aria-label="Previous"
              onClick={(e) => {
                e.stopPropagation();
                setOpen((open - 1 + all.length) % all.length);
              }}
            >
              ‹
            </button>
          ) : null}
          <figure className="lightbox-polaroid" onClick={(e) => e.stopPropagation()}>
            <Media key={current.src} photo={current} inLightbox />
            <figcaption className="hand">
              {current.caption}
              <span>
                {open + 1} / {all.length}
              </span>
            </figcaption>
          </figure>
          {all.length > 1 ? (
            <button
              type="button"
              className="lightbox-nav next"
              aria-label="Next"
              onClick={(e) => {
                e.stopPropagation();
                setOpen((open + 1) % all.length);
              }}
            >
              ›
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
