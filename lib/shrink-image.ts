/**
 * Shrinks big phone photos (and converts them to JPEG) before upload.
 * Falls back to the original file if the browser can't decode it.
 */
export async function shrinkImage(file: File, max = 1600): Promise<File> {
  if (file.type === "image/gif") return file; // keep animation
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.86));
    return blob ? new File([blob], "wish.jpg", { type: "image/jpeg" }) : file;
  } catch {
    return file;
  }
}
