"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { BirthdayImage } from "@/app/image";

type ImageSliderProps = {
  images: BirthdayImage[];
};

const AUTOPLAY_MS = 4000;

export default function ImageSlider({ images }: ImageSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const pausedRef = useRef(false);

  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const scrollToIndex = useCallback(
    (index: number, behavior: ScrollBehavior = "smooth") => {
      const track = trackRef.current;
      if (!track || images.length === 0) return;

      const clamped = ((index % images.length) + images.length) % images.length;
      const slide = slideRefs.current[clamped];
      if (!slide) return;

      const targetLeft =
        slide.offsetLeft - (track.clientWidth - slide.offsetWidth) / 2;
      const maxScroll = track.scrollWidth - track.clientWidth;

      track.scrollTo({
        left: Math.min(maxScroll, Math.max(0, targetLeft)),
        behavior,
      });
      setActiveIndex(clamped);
    },
    [images.length],
  );

  const scroll = useCallback(
    (direction: "left" | "right") => {
      const delta = direction === "left" ? -1 : 1;
      scrollToIndex(activeIndex + delta);
    },
    [activeIndex, scrollToIndex],
  );

  useEffect(() => {
    if (images.length <= 1 || lightboxIndex !== null) return;

    const gallery = trackRef.current?.closest(".photo-gallery");
    if (!gallery) return;

    let isVisible = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.2 },
    );
    observer.observe(gallery);

    const id = window.setInterval(() => {
      if (pausedRef.current || !isVisible) return;
      scrollToIndex(activeIndex + 1);
    }, AUTOPLAY_MS);

    return () => {
      window.clearInterval(id);
      observer.disconnect();
    };
  }, [activeIndex, images.length, lightboxIndex, scrollToIndex]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || images.length === 0) return;

    const onScroll = () => {
      const trackRect = track.getBoundingClientRect();
      const trackCenter = trackRect.left + trackRect.width / 2;

      let closest = 0;
      let closestDistance = Infinity;

      slideRefs.current.forEach((slide, index) => {
        if (!slide) return;
        const rect = slide.getBoundingClientRect();
        const slideCenter = rect.left + rect.width / 2;
        const distance = Math.abs(slideCenter - trackCenter);
        if (distance < closestDistance) {
          closestDistance = distance;
          closest = index;
        }
      });

      setActiveIndex(closest);
    };

    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, [images.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLightboxIndex(null);
      } else if (event.key === "ArrowLeft") {
        setLightboxIndex(
          (lightboxIndex - 1 + images.length) % images.length,
        );
      } else if (event.key === "ArrowRight") {
        setLightboxIndex((lightboxIndex + 1) % images.length);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [images.length, lightboxIndex]);

  if (images.length === 0) return null;

  return (
    <>
      <section className="photo-gallery" aria-label="Birthday memories">
        <div className="photo-gallery-label">Moments &amp; memories</div>
        <div
          className="photo-slider"
          onMouseEnter={() => {
            pausedRef.current = true;
          }}
          onMouseLeave={() => {
            pausedRef.current = false;
          }}
          onFocusCapture={() => {
            pausedRef.current = true;
          }}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              pausedRef.current = false;
            }
          }}
        >
          <button
            type="button"
            className="photo-slider-btn photo-slider-btn-prev"
            onClick={() => scroll("left")}
            aria-label="Previous photo"
          >
            ‹
          </button>

          <div className="photo-slider-track" ref={trackRef}>
            {images.map((image, index) => (
              <button
                key={image.src}
                type="button"
                ref={(el) => {
                  slideRefs.current[index] = el;
                }}
                className={`photo-slide${activeIndex === index ? " is-active" : ""}`}
                onClick={() => setLightboxIndex(index)}
                aria-label={`View ${image.alt}`}
              >
                <img src={image.src} alt={image.alt} loading="lazy" draggable={false} />
                <span className="photo-slide-zoom" aria-hidden="true">
                  +
                </span>
              </button>
            ))}
          </div>

          <button
            type="button"
            className="photo-slider-btn photo-slider-btn-next"
            onClick={() => scroll("right")}
            aria-label="Next photo"
          >
            ›
          </button>
        </div>

        <div className="photo-slider-dots" role="tablist" aria-label="Photo slides">
          {images.map((image, index) => (
            <button
              key={image.src}
              type="button"
              role="tab"
              className={`photo-slider-dot${activeIndex === index ? " is-active" : ""}`}
              aria-label={`Go to ${image.alt}`}
              aria-selected={activeIndex === index}
              onClick={() => scrollToIndex(index)}
            />
          ))}
        </div>
      </section>

      {lightboxIndex !== null && (
        <div
          className="photo-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={images[lightboxIndex].alt}
          onClick={() => setLightboxIndex(null)}
        >
          <div
            className="photo-lightbox-inner"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="photo-lightbox-close"
              onClick={() => setLightboxIndex(null)}
              aria-label="Close lightbox"
            >
              &times;
            </button>

            <button
              type="button"
              className="photo-lightbox-nav photo-lightbox-prev"
              onClick={() =>
                setLightboxIndex(
                  (lightboxIndex - 1 + images.length) % images.length,
                )
              }
              aria-label="Previous photo"
            >
              ‹
            </button>

            <figure className="photo-lightbox-figure">
              <img
                src={images[lightboxIndex].src}
                alt={images[lightboxIndex].alt}
                className="photo-lightbox-image"
              />
              <figcaption className="photo-lightbox-caption">
                {lightboxIndex + 1} / {images.length}
              </figcaption>
            </figure>

            <button
              type="button"
              className="photo-lightbox-nav photo-lightbox-next"
              onClick={() =>
                setLightboxIndex((lightboxIndex + 1) % images.length)
              }
              aria-label="Next photo"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </>
  );
}
