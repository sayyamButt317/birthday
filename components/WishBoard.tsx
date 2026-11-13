"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  deleteBoard,
  deletePin,
  loadBoards,
  loadPins,
  newId,
  saveBoard,
  savePin,
  shrinkImage,
  type Board,
  type Pin,
} from "@/lib/wish-store";

type WishBoardProps = {
  onCelebrate: (x: number, y: number, colors: string[]) => void;
};

const NOTE_COLORS = [
  { name: "lilac", value: "#e4d6f8" },
  { name: "blue", value: "#d4ecf8" },
  { name: "matcha", value: "#dcebc8" },
  { name: "pink", value: "#f9dbe8" },
  { name: "butter", value: "#fff1bf" },
];
const EMOJIS = ["💜", "✨", "✈️", "🏠", "🍵", "🎀", "📚", "💸", "🌷", "🦋"];
// Fixed ids so seeding is idempotent (StrictMode / multiple tabs can run it twice).
const DEFAULT_BOARDS: Omit<Board, "createdAt">[] = [
  { id: "default-wishes", name: "this year’s wishes", emoji: "💜" },
  { id: "default-places", name: "places to go", emoji: "✈️" },
  { id: "default-home", name: "dream home", emoji: "🏠" },
];
const MAX_IMAGES = 6;

type Draft = { file: File; url: string };

export default function WishBoard({ onCelebrate }: WishBoardProps) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [boards, setBoards] = useState<Board[]>([]);
  const [pins, setPins] = useState<Pin[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const [text, setText] = useState("");
  const [color, setColor] = useState(NOTE_COLORS[0].value);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [saving, setSaving] = useState(false);

  const [creating, setCreating] = useState(false);
  const [boardName, setBoardName] = useState("");
  const [boardEmoji, setBoardEmoji] = useState(EMOJIS[0]);

  const fileRef = useRef<HTMLInputElement>(null);
  const pinBtnRef = useRef<HTMLButtonElement>(null);

  // Load (and seed on first visit).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let b = await loadBoards();
        if (b.length === 0) {
          const now = Date.now();
          b = DEFAULT_BOARDS.map((d, i) => ({ ...d, createdAt: now + i }));
          await Promise.all(b.map(saveBoard));
        }
        const p = await loadPins();
        if (cancelled) return;
        setBoards(b);
        setPins(p);
        setActiveId(b[0]?.id ?? null);
      } catch {
        if (!cancelled) setError("Your browser blocked storage (private mode?), so wishes can’t be saved here.");
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Object URLs for stored images.
  const imageUrls = useMemo(() => {
    const map = new Map<string, string>();
    pins.forEach((p) => p.image && map.set(p.id, URL.createObjectURL(p.image)));
    return map;
  }, [pins]);
  useEffect(() => () => imageUrls.forEach((u) => URL.revokeObjectURL(u)), [imageUrls]);
  const draftsRef = useRef<Draft[]>([]);
  useEffect(() => {
    draftsRef.current = drafts;
  }, [drafts]);
  useEffect(() => () => draftsRef.current.forEach((d) => URL.revokeObjectURL(d.url)), []);

  const active = boards.find((b) => b.id === activeId) ?? null;
  const boardPins = pins.filter((p) => p.boardId === activeId);
  const countFor = (id: string) => pins.filter((p) => p.boardId === id).length;

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const images = Array.from(files).filter((f) => f.type.startsWith("image/"));
    const room = Math.max(0, MAX_IMAGES - drafts.length);
    const added = images.slice(0, room).map((file) => ({ file, url: URL.createObjectURL(file) }));
    setDrafts((prev) => [...prev, ...added]);
    if (fileRef.current) fileRef.current.value = "";
  };

  const removeDraft = (url: string) => {
    URL.revokeObjectURL(url);
    setDrafts((prev) => prev.filter((d) => d.url !== url));
  };

  const submitPin = async (e: FormEvent) => {
    e.preventDefault();
    if (!activeId || saving) return;
    const trimmed = text.trim();
    if (!trimmed && drafts.length === 0) return;

    setSaving(true);
    try {
      const now = Date.now();
      const created: Pin[] = [];
      if (drafts.length === 0) {
        created.push({ id: newId(), boardId: activeId, text: trimmed, color, done: false, createdAt: now });
      } else {
        // One pin per picture; the typed wish goes on each of them.
        for (const [i, d] of drafts.entries()) {
          const image = await shrinkImage(d.file);
          created.push({ id: newId(), boardId: activeId, text: trimmed, image, color, done: false, createdAt: now + i });
        }
      }
      await Promise.all(created.map(savePin));
      setPins((prev) => [...created.reverse(), ...prev]);
      setText("");
      drafts.forEach((d) => URL.revokeObjectURL(d.url));
      setDrafts([]);
      const r = pinBtnRef.current?.getBoundingClientRect();
      if (r) onCelebrate(r.left + r.width / 2, r.top, [color, "#c6aeef", "#ffffff"]);
    } catch {
      setError("Couldn’t save that one — the browser may be out of space. Try a smaller picture?");
    } finally {
      setSaving(false);
    }
  };

  const toggleDone = async (pin: Pin, el: HTMLElement) => {
    const updated = { ...pin, done: !pin.done };
    setPins((prev) => prev.map((p) => (p.id === pin.id ? updated : p)));
    await savePin(updated);
    if (updated.done) {
      const r = el.getBoundingClientRect();
      onCelebrate(r.left + r.width / 2, r.top, ["#fff4c9", "#c6aeef", "#b5d395"]);
    }
  };

  const removePin = async (pin: Pin) => {
    if (!window.confirm("Remove this wish?")) return;
    setPins((prev) => prev.filter((p) => p.id !== pin.id));
    await deletePin(pin.id);
  };

  const createBoard = async (e: FormEvent) => {
    e.preventDefault();
    const name = boardName.trim();
    if (!name) return;
    const board: Board = { id: newId(), name, emoji: boardEmoji, createdAt: Date.now() };
    await saveBoard(board);
    setBoards((prev) => [...prev, board]);
    setActiveId(board.id);
    setBoardName("");
    setCreating(false);
  };

  const removeBoard = async () => {
    if (!active || boards.length <= 1) return;
    const n = countFor(active.id);
    if (!window.confirm(`Delete the board “${active.name}”${n ? ` and its ${n} wish${n > 1 ? "es" : ""}` : ""}?`)) return;
    await deleteBoard(active.id);
    const rest = boards.filter((b) => b.id !== active.id);
    setBoards(rest);
    setPins((prev) => prev.filter((p) => p.boardId !== active.id));
    setActiveId(rest[0]?.id ?? null);
  };

  return (
    <section className="section wishboard" aria-labelledby="wishboard-title">
      <div className="section-head">
        <p className="kicker">pinned by you</p>
        <h2 id="wishboard-title" className="section-title">
          your <em>wish board</em>
        </h2>
        <p className="section-sub">
          type a wish or upload a picture of anything you want this year — make as many boards as you
          like. it all stays saved right here on your device.
        </p>
      </div>

      {error ? <p className="wb-error" role="alert">{error}</p> : null}

      {/* boards / folders */}
      <div className="wb-boards" role="tablist" aria-label="Your boards">
        {boards.map((b) => (
          <button
            key={b.id}
            type="button"
            role="tab"
            aria-selected={b.id === activeId}
            className={`wb-board${b.id === activeId ? " is-active" : ""}`}
            onClick={() => setActiveId(b.id)}
          >
            <span className="wb-board-emoji" aria-hidden="true">{b.emoji}</span>
            {b.name}
            <span className="wb-count">{countFor(b.id)}</span>
          </button>
        ))}
        {creating ? (
          <form className="wb-new-board" onSubmit={createBoard}>
            <select value={boardEmoji} onChange={(e) => setBoardEmoji(e.target.value)} aria-label="Board emoji">
              {EMOJIS.map((em) => (
                <option key={em} value={em}>{em}</option>
              ))}
            </select>
            <input
              autoFocus
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
              placeholder="board name…"
              maxLength={40}
              aria-label="Board name"
            />
            <button type="submit" className="wb-mini primary">add</button>
            <button type="button" className="wb-mini" onClick={() => setCreating(false)}>cancel</button>
          </form>
        ) : (
          <button type="button" className="wb-board wb-board-add" onClick={() => setCreating(true)} disabled={!ready || !!error}>
            + new board
          </button>
        )}
      </div>

      {/* composer */}
      <form className="wb-composer" onSubmit={submitPin} style={{ ["--note" as string]: color }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={active ? `I wish… (adding to ${active.emoji} ${active.name})` : "I wish…"}
          rows={3}
          maxLength={400}
          aria-label="Write a wish"
          disabled={!ready || !!error}
        />

        {drafts.length ? (
          <ul className="wb-drafts">
            {drafts.map((d) => (
              <li key={d.url}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={d.url} alt="" />
                <button type="button" onClick={() => removeDraft(d.url)} aria-label="Remove picture">×</button>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="wb-composer-row">
          <label className={`wb-upload${!ready || error ? " is-disabled" : ""}`}>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => addFiles(e.target.files)}
              disabled={!ready || !!error}
            />
            📷 add pictures
          </label>

          <div className="wb-swatches" role="radiogroup" aria-label="Note colour">
            {NOTE_COLORS.map((c) => (
              <button
                key={c.name}
                type="button"
                role="radio"
                aria-checked={color === c.value}
                aria-label={c.name}
                className={`wb-swatch${color === c.value ? " is-active" : ""}`}
                style={{ background: c.value }}
                onClick={() => setColor(c.value)}
              />
            ))}
          </div>

          <button
            ref={pinBtnRef}
            type="submit"
            className="btn btn-primary wb-submit"
            disabled={!ready || !!error || saving || (!text.trim() && drafts.length === 0)}
          >
            {saving ? "pinning…" : "pin it 📌"}
          </button>
        </div>
      </form>

      {/* pins */}
      {ready && boardPins.length === 0 ? (
        <div className="wb-empty">
          <span aria-hidden="true">{active?.emoji ?? "💜"}</span>
          <p className="hand">this board is waiting for its first wish…</p>
        </div>
      ) : (
        <ul className="wb-grid">
          {boardPins.map((pin) => {
            const url = imageUrls.get(pin.id);
            return (
              <li key={pin.id} className={`wb-pin${pin.done ? " is-done" : ""}${url ? " has-image" : ""}`} style={{ background: pin.color }}>
                {url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={url} alt={pin.text || "wish picture"} loading="lazy" />
                ) : null}
                {pin.text ? <p className="hand">{pin.text}</p> : null}
                {pin.done ? <span className="wb-stamp">came true ✨</span> : null}
                <div className="wb-actions">
                  <button
                    type="button"
                    onClick={(e) => toggleDone(pin, e.currentTarget)}
                    aria-pressed={pin.done}
                    title={pin.done ? "Not yet" : "It came true!"}
                    aria-label={pin.done ? "Mark as not yet" : "Mark as came true"}
                  >
                    {pin.done ? "↺" : "✓"}
                  </button>
                  <button type="button" onClick={() => removePin(pin)} title="Remove" aria-label="Remove wish">
                    🗑
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {active && boards.length > 1 ? (
        <div className="wb-footer">
          <button type="button" className="wb-mini danger" onClick={removeBoard}>
            delete “{active.name}” board
          </button>
        </div>
      ) : null}
    </section>
  );
}
