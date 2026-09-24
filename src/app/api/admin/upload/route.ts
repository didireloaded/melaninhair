import { savePublicImage } from "@/lib/images";
import { AppError, errorResponse } from "@/lib/errors";
import { requireAdmin } from "@/lib/guard";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const form = await request.formData();
    const folder = form.get("folder");
    const file = form.get("file");
    if (folder !== "services" && folder !== "portfolio") throw new AppError("image", "Choose where to save the photo.");
    if (!(file instanceof File) || file.size === 0) throw new AppError("image", "Choose a photo.");
    const url = await savePublicImage(folder, Buffer.from(await file.arrayBuffer()));
    return Response.json({ url });
  } catch (error) {
    return errorResponse(error);
  }
}
