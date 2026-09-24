import { getInspiration } from "@/lib/data/admin";
import { errorResponse } from "@/lib/errors";
import { requireAdmin } from "@/lib/guard";
import { readInspiration } from "@/lib/images";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const image = await getInspiration(id);
    if (!image) return new Response("Not found", { status: 404 });
    const file = await readInspiration(image.fileName);
    if (!file) return new Response("Not found", { status: 404 });
    return new Response(new Uint8Array(file.bytes), {
      headers: {
        "Content-Type": file.mime,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
