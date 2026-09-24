import { readPublicImage } from "@/lib/images";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ folder: string; file: string }> }) {
  const { folder, file } = await context.params;
  const image = await readPublicImage(folder, file);
  if (!image) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(image.bytes), {
    headers: {
      "Content-Type": image.mime,
      "Cache-Control": "public, max-age=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
