/**
 * Tiny IndexedDB wrapper for the wish board. Everything lives in the
 * visitor's own browser — no server or database needed.
 */

export type Board = {
  id: string;
  name: string;
  emoji: string;
  createdAt: number;
};

export type Pin = {
  id: string;
  boardId: string;
  text: string;
  image?: Blob;
  color: string;
  done: boolean;
  createdAt: number;
};

const DB_NAME = "rafia-wish-board";
const VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("boards")) db.createObjectStore("boards", { keyPath: "id" });
      if (!db.objectStoreNames.contains("pins")) {
        db.createObjectStore("pins", { keyPath: "id" }).createIndex("boardId", "boardId");
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => {
      dbPromise = null;
      reject(req.error);
    };
  });
  return dbPromise;
}

function done(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

function getAll<T>(store: "boards" | "pins"): Promise<T[]> {
  return openDb().then(
    (db) =>
      new Promise<T[]>((resolve, reject) => {
        const req = db.transaction(store).objectStore(store).getAll();
        req.onsuccess = () => resolve(req.result as T[]);
        req.onerror = () => reject(req.error);
      }),
  );
}

async function put(store: "boards" | "pins", value: Board | Pin) {
  const db = await openDb();
  const tx = db.transaction(store, "readwrite");
  tx.objectStore(store).put(value);
  await done(tx);
}

export const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const loadBoards = () =>
  getAll<Board>("boards").then((b) => b.sort((x, y) => x.createdAt - y.createdAt));
export const loadPins = () =>
  getAll<Pin>("pins").then((p) => p.sort((x, y) => y.createdAt - x.createdAt));
export const saveBoard = (board: Board) => put("boards", board);
export const savePin = (pin: Pin) => put("pins", pin);

export async function deletePin(id: string) {
  const db = await openDb();
  const tx = db.transaction("pins", "readwrite");
  tx.objectStore("pins").delete(id);
  await done(tx);
}

export async function deleteBoard(id: string) {
  const db = await openDb();
  const tx = db.transaction(["boards", "pins"], "readwrite");
  tx.objectStore("boards").delete(id);
  const pins = tx.objectStore("pins");
  const req = pins.index("boardId").openCursor(IDBKeyRange.only(id));
  req.onsuccess = () => {
    const cursor = req.result;
    if (cursor) {
      cursor.delete();
      cursor.continue();
    }
  };
  await done(tx);
}

/** Shrinks big phone photos so the board stays light. Falls back to the original. */
export async function shrinkImage(file: File, max = 1400): Promise<Blob> {
  if (file.type === "image/gif") return file; // keep animation
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < 900_000) return file;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.86));
    return blob ?? file;
  } catch {
    return file;
  }
}
