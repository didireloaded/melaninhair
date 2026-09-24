import { deletePortfolio, deleteSpecial, savePortfolio, saveSettings, saveSpecial } from "@/lib/data/admin";
import { AppError, errorResponse } from "@/lib/errors";
import { requireAdmin } from "@/lib/guard";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = (await request.json()) as { action?: string; id?: string };
    switch (body.action) {
      case "save-portfolio":
        return Response.json(await savePortfolio(body, body.id));
      case "delete-portfolio":
        if (!body.id) throw new AppError("missing", "Choose a photo.");
        await deletePortfolio(body.id);
        return Response.json({ ok: true });
      case "save-special":
        return Response.json(await saveSpecial(body, body.id));
      case "delete-special":
        if (!body.id) throw new AppError("missing", "Choose a special.");
        await deleteSpecial(body.id);
        return Response.json({ ok: true });
      case "settings":
        await saveSettings(body);
        return Response.json({ ok: true });
      default:
        throw new AppError("action", "That action is not available.");
    }
  } catch (error) {
    return errorResponse(error);
  }
}
