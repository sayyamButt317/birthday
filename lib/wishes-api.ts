/**
 * Rafia's 5 wishes live in the waitlist backend (Express + MongoDB).
 * Set NEXT_PUBLIC_BACKEND_URL in .env to its URL, e.g. https://your-waitlist.vercel.app
 * (Next.js only exposes variables starting with NEXT_PUBLIC_ to the browser.)
 * Defaults to the backend's local dev port.
 */
export const WISHES_API = (
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_WISHES_API ||
  "http://localhost:8000"
)
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

export type PublicWish = {
  slot: number;
  text: string;
  imageUrl: string | null;
  updatedAt: string;
};

export const MAX_IMAGE_BYTES = 3 * 1024 * 1024;

export async function fetchWishes(init?: RequestInit): Promise<PublicWish[]> {
  const res = await fetch(`${WISHES_API}/api/wishes`, { cache: "no-store", ...init });
  if (!res.ok) throw new Error(`Wishes API responded ${res.status}`);
  const data = (await res.json()) as { wishes?: PublicWish[] };
  return data.wishes ?? [];
}

export async function putWish(
  slot: number,
  body: { text: string; image?: string; removeImage?: boolean },
): Promise<PublicWish[]> {
  const res = await fetch(`${WISHES_API}/api/wishes/${slot}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as { wishes?: PublicWish[]; message?: string };
  if (!res.ok || !data.wishes) throw new Error(data.message || "Couldn’t save — please try again.");
  return data.wishes;
}

export function fileToDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
