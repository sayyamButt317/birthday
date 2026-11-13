// Server-only module (uses the filesystem) — import it only from routes/pages.
import fs from "node:fs/promises";
import path from "node:path";

/**
 * Rafia's 5 wishes, stored as plain files on the server:
 *   data/wishes/wishes.json   — the text + which picture belongs to each wish
 *   data/wishes/slot-N-*.jpg  — the pictures
 * Override the folder with the WISHES_DIR env variable if you like.
 */

export const MAX_WISHES = 5;
export const MAX_TEXT = 500;
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export type StoredWish = {
  slot: number;
  text: string;
  image: string | null; // filename inside the wishes folder
  updatedAt: string;
};

// The ignore hint stops Turbopack from bundling the whole project because of these dynamic paths.
const DIR =
  process.env.WISHES_DIR || path.join(/*turbopackIgnore: true*/ process.cwd(), "data", "wishes");
const FILE = path.join(DIR, "wishes.json");

const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};
const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};
export const IMAGE_NAME = /^slot-[1-5]-\d+\.(jpg|png|webp|gif)$/;

export async function readWishes(): Promise<StoredWish[]> {
  try {
    const raw = JSON.parse(await fs.readFile(FILE, "utf8")) as { wishes?: StoredWish[] };
    return (raw.wishes ?? []).sort((a, b) => a.slot - b.slot);
  } catch {
    return [];
  }
}

async function writeWishes(wishes: StoredWish[]) {
  await fs.mkdir(DIR, { recursive: true });
  const tmp = `${FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify({ wishes }, null, 2), "utf8");
  await fs.rename(tmp, FILE); // atomic replace, so a crash never leaves half a file
}

// Serialise writes so two quick saves can't clobber each other.
let queue: Promise<unknown> = Promise.resolve();
function exclusive<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.catch(() => undefined);
  return run;
}

async function removeImageFile(name: string | null) {
  if (!name || !IMAGE_NAME.test(name)) return;
  await fs.unlink(path.join(DIR, name)).catch(() => undefined);
}

export class WishError extends Error {}

export function saveWish(input: {
  slot: number;
  text: string;
  image: File | null;
  removeImage: boolean;
}): Promise<StoredWish[]> {
  const { slot, image, removeImage } = input;
  const text = input.text.trim();

  if (!Number.isInteger(slot) || slot < 1 || slot > MAX_WISHES) throw new WishError("Invalid wish number.");
  if (text.length > MAX_TEXT) throw new WishError(`Please keep a wish under ${MAX_TEXT} characters.`);
  if (image) {
    if (!IMAGE_TYPES[image.type]) throw new WishError("Please use a JPG, PNG, WEBP or GIF picture.");
    if (image.size > MAX_IMAGE_BYTES) throw new WishError("That picture is too big (max 8 MB).");
  }

  return exclusive(async () => {
    const wishes = await readWishes();
    const existing = wishes.find((w) => w.slot === slot) ?? null;
    let imageName = existing?.image ?? null;

    if (image) {
      await fs.mkdir(DIR, { recursive: true });
      const name = `slot-${slot}-${Date.now()}.${IMAGE_TYPES[image.type]}`;
      await fs.writeFile(path.join(DIR, name), Buffer.from(await image.arrayBuffer()));
      await removeImageFile(imageName);
      imageName = name;
    } else if (removeImage) {
      await removeImageFile(imageName);
      imageName = null;
    }

    const others = wishes.filter((w) => w.slot !== slot);
    const next =
      text || imageName
        ? [...others, { slot, text, image: imageName, updatedAt: new Date().toISOString() }]
        : others; // empty text + no picture = wish cleared

    await writeWishes(next.sort((a, b) => a.slot - b.slot));
    return next;
  });
}

export async function readImage(name: string): Promise<{ body: Buffer; type: string } | null> {
  if (!IMAGE_NAME.test(name)) return null;
  try {
    const body = await fs.readFile(path.join(DIR, name));
    return { body, type: CONTENT_TYPES[name.split(".").pop() ?? ""] ?? "application/octet-stream" };
  } catch {
    return null;
  }
}

/** Shape sent to the browser: image becomes a URL. */
export function toPublic(w: StoredWish) {
  return {
    slot: w.slot,
    text: w.text,
    imageUrl: w.image ? `/api/wishes/image/${w.image}` : null,
    updatedAt: w.updatedAt,
  };
}
export type PublicWish = ReturnType<typeof toPublic>;
