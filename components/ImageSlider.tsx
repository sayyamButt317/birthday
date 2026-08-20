"use client";

import { useRef } from "react";
import type { BirthdayImage } from "@/app/image";

type ImageSliderProps = {
  images: BirthdayImage[];
};

export default function ImageSlider({ images }: ImageSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    const track = trackRef.current;
    if (!track) return;

    const slide = track.querySelector<HTMLElement>(".photo-slide");
    const gap = 16;
    const amount = slide ? slide.offsetWidth + gap : track.clientWidth * 0.8;

    track.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  if (images.length === 0) return null;

  return (
    <section className="photo-gallery" aria-label="Birthday memories">
      <div className="photo-gallery-label">Moments &amp; memories</div>
      <div className="photo-slider">
        <button
          type="button"
          className="photo-slider-btn photo-slider-btn-prev"
          onClick={() => scroll("left")}
          aria-label="Previous photo"
        >
          ‹
        </button>

        <div className="photo-slider-track" ref={trackRef}>
          {images.map((image) => (
            <div key={image.src} className="photo-slide">
              <img src={image.src} alt={image.alt} loading="lazy" />
            </div>
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
    </section>
  );
}
