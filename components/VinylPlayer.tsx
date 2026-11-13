"use client";

import { NAME, TRACKS } from "@/lib/content";

type VinylPlayerProps = {
  playing: boolean;
  onToggle: () => void;
};

export default function VinylPlayer({ playing, onToggle }: VinylPlayerProps) {
  return (
    <section className="section vinyl-section" aria-labelledby="vinyl-title">
      <div className={`turntable${playing ? " is-playing" : ""}`}>
        <div className="record" aria-hidden="true">
          <div className="record-grooves" />
          <div className="record-label">
            <span className="record-label-top">side A</span>
            <span className="record-label-name">{NAME}&apos;s</span>
            <span className="record-label-sub">version</span>
          </div>
        </div>
        <div className="tonearm" aria-hidden="true">
          <span className="tonearm-head" />
        </div>
      </div>

      <div className="vinyl-copy">
        <p className="kicker">now playing</p>
        <h2 id="vinyl-title" className="section-title">
          {NAME}&apos;s <em>version</em>
        </h2>
        <ol className="tracklist">
          {TRACKS.map((track, i) => (
            <li key={track.title} className={i === 0 && playing ? "is-current" : undefined}>
              <span className="track-no">{String(i + 1).padStart(2, "0")}</span>
              <span className="track-title">{track.title}</span>
              <span className="track-time">{track.time}</span>
            </li>
          ))}
        </ol>
        <button type="button" className="btn btn-primary" onClick={onToggle} aria-pressed={playing}>
          {playing ? "❚❚  pause the song" : "▶  play the song"}
        </button>
      </div>
    </section>
  );
}
