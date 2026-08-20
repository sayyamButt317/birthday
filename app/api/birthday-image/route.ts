import { birthdayImages } from "@/app/image";

async function getThumbnailUrl(postUrl: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://www.instagram.com/api/v1/oembed/?url=${encodeURIComponent(postUrl)}`,
      {
        headers: { "User-Agent": "Mozilla/5.0" },
        next: { revalidate: 86400 },
      },
    );

    if (!response.ok) return null;

    const data = (await response.json()) as { thumbnail_url?: string };
    return data.thumbnail_url ?? null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const index = Number(searchParams.get("index"));

  if (
    !Number.isInteger(index) ||
    index < 0 ||
    index >= birthdayImages.length
  ) {
    return new Response("Not found", { status: 404 });
  }

  const thumbnailUrl = await getThumbnailUrl(birthdayImages[index]);
  if (!thumbnailUrl) {
    return new Response("Image unavailable", { status: 404 });
  }

  const imageResponse = await fetch(thumbnailUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      Referer: "https://www.instagram.com/",
    },
    next: { revalidate: 86400 },
  });

  if (!imageResponse.ok) {
    return new Response("Failed to fetch image", { status: 502 });
  }

  const buffer = await imageResponse.arrayBuffer();
  const contentType = imageResponse.headers.get("content-type") ?? "image/jpeg";

  return new Response(buffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
