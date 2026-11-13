import { connection } from "next/server";
import { readWishes, saveWish, toPublic, WishError } from "@/lib/wishes-server";

export async function GET() {
  await connection(); // always read the latest file, never a build-time copy
  const wishes = await readWishes();
  return Response.json({ wishes: wishes.map(toPublic) }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "Bad request." }, { status: 400 });
  }

  const image = form.get("image");
  try {
    const wishes = await saveWish({
      slot: Number(form.get("slot")),
      text: String(form.get("text") ?? ""),
      image: image instanceof File && image.size > 0 ? image : null,
      removeImage: form.get("removeImage") === "1",
    });
    return Response.json({ wishes: wishes.map(toPublic) });
  } catch (err) {
    if (err instanceof WishError) return Response.json({ error: err.message }, { status: 400 });
    console.error("Saving wish failed:", err);
    return Response.json({ error: "Couldn’t save right now — please try again." }, { status: 500 });
  }
}
