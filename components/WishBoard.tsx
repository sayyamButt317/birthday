"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { shrinkImage } from "@/lib/shrink-image";
import { fetchWishes, fileToDataUrl, MAX_IMAGE_BYTES, putWish, type PublicWish } from "@/lib/wishes-api";

type WishBoardProps = {
  onCelebrate: (x: number, y: number, colors: string[]) => void;
};

const SLOTS = [1, 2, 3, 4, 5] as const;
const NOTE_COLORS = ["#e4d6f8", "#d4ecf8", "#dcebc8", "#f9dbe8", "#fff1bf"];
const PROMPTS = [
  "something I want this year…",
  "a place I want to go…",
  "a thing I want to learn…",
  "something just for me…",
  "a big, brave dream…",
];
const MAX_TEXT = 500;

type Slot = {
  saved: PublicWish | null;
  text: string;
  draft: File | null;
  draftUrl: string | null;
  removeImage: boolean;
  status: "idle" | "saving" | "saved" | "error";
  error?: string;
};

const emptySlot = (): Slot => ({
  saved: null,
  text: "",
  draft: null,
  draftUrl: null,
  removeImage: false,
  status: "idle",
});

function fromServer(wishes: PublicWish[]): Record<number, Slot> {
  const map: Record<number, Slot> = {};
  for (const n of SLOTS) {
    const w = wishes.find((x) => x.slot === n) ?? null;
    map[n] = { ...emptySlot(), saved: w, text: w?.text ?? "" };
  }
  return map;
}

export default function WishBoard({ onCelebrate }: WishBoardProps) {
  const [slots, setSlots] = useState<Record<number, Slot>>(() => fromServer([]));
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const fileRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const urlsRef = useRef<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchWishes()
      .then((wishes) => {
        if (!cancelled) setSlots(fromServer(wishes));
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    const urls = urlsRef.current;
    return () => {
      cancelled = true;
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);

  const update = (n: number, patch: Partial<Slot>) =>
    setSlots((prev) => ({ ...prev, [n]: { ...prev[n], ...patch } }));

  const pickImage = (n: number, files: FileList | null) => {
    const file = files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    urlsRef.current.push(url);
    update(n, { draft: file, draftUrl: url, removeImage: false, status: "idle" });
    const input = fileRefs.current[n];
    if (input) input.value = "";
  };

  const dropImage = (n: number) =>
    update(n, { draft: null, draftUrl: null, removeImage: true, status: "idle" });

  const isDirty = (s: Slot) =>
    s.text.trim() !== (s.saved?.text ?? "") || !!s.draft || (s.removeImage && !!s.saved?.imageUrl);

  const save = async (n: number, e: MouseEvent<HTMLButtonElement>) => {
    const s = slots[n];
    if (!isDirty(s) || s.status === "saving") return;
    const rect = e.currentTarget.getBoundingClientRect();
    update(n, { status: "saving", error: undefined });

    try {
      let image: string | undefined;
      if (s.draft) {
        const small = await shrinkImage(s.draft);
        if (small.size > MAX_IMAGE_BYTES) throw new Error("That picture is too big — please pick a smaller one.");
        image = await fileToDataUrl(small);
      }

      const wishes = await putWish(n, {
        text: s.text.trim(),
        ...(image ? { image } : {}),
        ...(s.removeImage ? { removeImage: true } : {}),
      });

      const saved = wishes.find((w) => w.slot === n) ?? null;
      update(n, { saved, text: saved?.text ?? "", draft: null, draftUrl: null, removeImage: false, status: "saved" });
      if (saved) onCelebrate(rect.left + rect.width / 2, rect.top, [NOTE_COLORS[n - 1], "#c6aeef", "#ffffff"]);
    } catch (err) {
      update(n, { status: "error", error: err instanceof Error ? err.message : "Couldn’t save." });
    }
  };

  const count = SLOTS.filter((n) => slots[n].saved).length;

  return (
    <section className="section wishboard" aria-labelledby="wishboard-title">
      <div className="section-head">
        <p className="kicker">your turn</p>
        <h2 id="wishboard-title" className="section-title">
          your <em>5 wishes</em>
        </h2>
        <p className="section-sub">
          write down 5 things you wish for this year — add a picture if you like. save each one and
          it&apos;s sent straight to me, so I can try to make them come true 💜
        </p>
        <p className="wb-progress" aria-live="polite">
          {loading ? "loading your wishes…" : `${count} of 5 wishes made`}
          <span className="wb-dots" aria-hidden="true">
            {SLOTS.map((n) => (
              <span key={n} className={slots[n].saved ? "on" : undefined} />
            ))}
          </span>
        </p>
      </div>

      {loadError ? (
        <p className="wb-error" role="alert">
          Couldn&apos;t reach the wish box right now — refresh the page in a moment.
        </p>
      ) : null}

      <ol className="wb-slots">
        {SLOTS.map((n, i) => {
          const s = slots[n];
          const preview = s.draftUrl ?? (s.removeImage ? null : s.saved?.imageUrl ?? null);
          const dirty = isDirty(s);
          const disabled = loading || loadError;
          return (
            <li key={n} className={`wb-slot${s.saved ? " is-saved" : ""}`} style={{ ["--note" as string]: NOTE_COLORS[i] }}>
              <div className="wb-slot-head">
                <span className="wb-slot-no">wish #{n}</span>
                {s.saved && !dirty ? <span className="wb-slot-badge">saved ✓</span> : null}
              </div>

              {preview ? (
                <div className="wb-slot-img">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt={`Picture for wish ${n}`} />
                  <button type="button" onClick={() => dropImage(n)} aria-label={`Remove picture from wish ${n}`}>
                    ×
                  </button>
                </div>
              ) : null}

              <textarea
                value={s.text}
                onChange={(e) => update(n, { text: e.target.value, status: "idle" })}
                placeholder={`I wish for ${PROMPTS[i]}`}
                maxLength={MAX_TEXT}
                rows={3}
                aria-label={`Wish number ${n}`}
                disabled={disabled}
              />

              <div className="wb-slot-actions">
                <label className={`wb-upload${disabled ? " is-disabled" : ""}`}>
                  <input
                    ref={(el) => {
                      fileRefs.current[n] = el;
                    }}
                    type="file"
                    accept="image/*"
                    onChange={(e) => pickImage(n, e.target.files)}
                    disabled={disabled}
                  />
                  📷 {preview ? "change" : "picture"}
                </label>
                <button
                  type="button"
                  className="btn btn-primary wb-save"
                  onClick={(e) => save(n, e)}
                  disabled={disabled || !dirty || s.status === "saving"}
                >
                  {s.status === "saving" ? "saving…" : s.saved && !s.text.trim() && !preview ? "clear" : "save wish"}
                </button>
              </div>

              {s.status === "error" ? (
                <p className="wb-slot-msg is-error" role="alert">{s.error}</p>
              ) : s.status === "saved" && !dirty ? (
                <p className="wb-slot-msg" role="status">{s.saved ? "sent to me 💌" : "wish cleared"}</p>
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
