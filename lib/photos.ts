import fs from "node:fs";
import path from "node:path";
import { FALLBACK_CAPTIONS, MEDIA_CAPTIONS, QUEEN_PHOTO } from "@/lib/content";

export type Photo = {
  src: string;
  caption: string;
  kind: "image" | "video";
};

const MEDIA_DIR = path.join(process.cwd(), "public", "asset");
const IMAGE_EXT = /\.(jpe?g|png|webp|gif|avif)$/i;
const VIDEO_EXT = /\.(mp4|webm|mov|m4v)$/i;
// Camera / app default names don't make good captions.
const GENERIC_NAME =
  /^(img|vid|dsc|pxl|mvimg|whatsapp|screenshot|photo|image|video|snapchat|received|\d)/i;

function captionFrom(file: string, index: number): string {
  if (MEDIA_CAPTIONS[file]) return MEDIA_CAPTIONS[file];
  const base = file
    .replace(/\.[^.]+$/, "")
    .replace(/^\d+[\s._-]*/, "")
    .replace(/[_-]+/g, " ")
    .trim();
  if (!base || GENERIC_NAME.test(base)) {
    return FALLBACK_CAPTIONS[index % FALLBACK_CAPTIONS.length];
  }
  return base;
}

function toPhoto(file: string, index: number): Photo {
  return {
    src: `/asset/${encodeURIComponent(file)}`,
    caption: captionFrom(file, index),
    kind: VIDEO_EXT.test(file) ? "video" : "image",
  };
}

/**
 * Reads every photo/video in /public/asset. Files listed in MEDIA_CAPTIONS
 * come first, in that order; anything else follows, sorted by name.
 * Returns the Queen-of-Hearts photo separately.
 */
export function loadMedia(): { queen: Photo | null; wall: Photo[] } {
  let files: string[] = [];
  try {
    files = fs
      .readdirSync(MEDIA_DIR)
      .filter((f) => IMAGE_EXT.test(f) || VIDEO_EXT.test(f));
  } catch {
    return { queen: null, wall: [] };
  }

  const order = Object.keys(MEDIA_CAPTIONS);
  const rank = (f: string) => {
    const i = order.indexOf(f);
    return i === -1 ? order.length : i;
  };
  files.sort(
    (a, b) => rank(a) - rank(b) || a.localeCompare(b, undefined, { numeric: true }),
  );

  const queenFile =
    files.find((f) => f === QUEEN_PHOTO) ?? files.find((f) => IMAGE_EXT.test(f));
  const queen = queenFile ? toPhoto(queenFile, 0) : null;
  const wall = files.filter((f) => f !== queenFile).map((f, i) => toPhoto(f, i));

  return { queen, wall };
}
