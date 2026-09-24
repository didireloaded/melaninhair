import { z } from "zod";
import { getAvailability } from "@/lib/data/availability";
import { AppError, errorResponse } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const from = url.searchParams.get("from") ?? "";
    const to = url.searchParams.get("to") ?? from;
    const serviceIds = (url.searchParams.get("services") ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter((item) => z.string().uuid().safeParse(item).success);
    if (!serviceIds.length) throw new AppError("service", "Choose a service first.");
    const result = await getAvailability({ from, to, serviceIds });
    return Response.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}
