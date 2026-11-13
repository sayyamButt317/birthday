import type { Metadata } from "next";
import { connection } from "next/server";
import { fetchWishes, type PublicWish } from "@/lib/wishes-api";
import { NAME } from "@/lib/content";
import "../birthday.css";

export const metadata: Metadata = {
  title: `${NAME}'s wishes 💜`,
  robots: { index: false, follow: false },
};

const NOTE_COLORS = ["#e4d6f8", "#d4ecf8", "#dcebc8", "#f9dbe8", "#fff1bf"];

export default async function WishesPage() {
  await connection();
  let wishes: PublicWish[] = [];
  let unreachable = false;
  try {
    wishes = await fetchWishes();
  } catch {
    unreachable = true;
  }

  return (
    <div className="bday wishes-page">
      <section className="section">
        <div className="section-head">
          <p className="kicker">for your eyes only</p>
          <h1 className="section-title">
            {NAME}&apos;s <em>wishes</em>
          </h1>
          <p className="section-sub">
            {unreachable
              ? "couldn’t reach the wishes server — check NEXT_PUBLIC_BACKEND_URL in .env and that the backend is running."
              : wishes.length === 0
                ? "no wishes saved yet — check back later 💜"
                : `${wishes.length} of 5 wishes made. refresh to see new ones.`}
          </p>
        </div>

        <ol className="wl-list">
          {wishes.map((w) => (
            <li key={w.slot} className="wl-item" style={{ background: NOTE_COLORS[w.slot - 1] }}>
              <span className="wb-slot-no">wish #{w.slot}</span>
              {w.imageUrl ? (
                <a href={w.imageUrl} target="_blank" rel="noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={w.imageUrl} alt={`Picture for wish ${w.slot}`} />
                </a>
              ) : null}
              {w.text ? <p className="hand">{w.text}</p> : null}
              <time dateTime={w.updatedAt}>
                saved{" "}
                {new Date(w.updatedAt).toLocaleString("en-GB", {
                  dateStyle: "medium",
                  timeStyle: "short",
                  timeZone: "Asia/Karachi",
                })}
              </time>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
