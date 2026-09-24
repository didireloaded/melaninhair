import {
  archiveService,
  createCategory,
  createService,
  removeAddon,
  saveAddon,
  updateService,
} from "@/lib/data/admin";
import { AppError, errorResponse } from "@/lib/errors";
import { requireAdmin } from "@/lib/guard";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = (await request.json()) as { action?: string; id?: string };
    switch (body.action) {
      case "create-category":
        return Response.json(await createCategory(body));
      case "create-service":
        return Response.json(await createService(body));
      case "update-service":
        if (!body.id) throw new AppError("missing", "Choose a service.");
        return Response.json(await updateService(body.id, body));
      case "archive-service":
        if (!body.id) throw new AppError("missing", "Choose a service.");
        return Response.json(await archiveService(body.id));
      case "save-addon":
        return Response.json(await saveAddon(body, body.id));
      case "delete-addon":
        if (!body.id) throw new AppError("missing", "Choose an add-on.");
        await removeAddon(body.id);
        return Response.json({ ok: true });
      default:
        throw new AppError("action", "That action is not available.");
    }
  } catch (error) {
    return errorResponse(error);
  }
}
