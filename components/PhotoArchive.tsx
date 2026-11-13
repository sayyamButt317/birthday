"use client";

import { useEffect, useState } from "react";
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

export default function PhotoArchive({ queen, photos, showHint }: PhotoArchiveProps) {
  const all = queen ? [queen, ...photos] : photos;
  const [open, setOpen] = useState<number | null>(null);
  const offset = queen ? 1 : 0;

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
    <section className="section archive" aria-labelledby="archive-title">
      <div className="section-head">
        <p className="kicker">exhibit A, B, C… all of them</p>
        <h2 id="archive-title" className="section-title">
          the <em>{NAME}</em> archives
        </h2>
        <p className="section-sub">a wall of pure iconic behaviour. tap any polaroid — some of them move.</p>
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

        <ul className="polaroid-wall">
          {photos.map((photo, i) => (
            <li key={photo.src} style={{ ["--tilt" as string]: `${TILTS[i % TILTS.length]}deg` }}>
              <button
                type="button"
                className="polaroid"
                onClick={() => setOpen(i + offset)}
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
