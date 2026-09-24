import { quoteAppointment } from "@/lib/data/availability";
import { errorResponse } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const quote = await quoteAppointment(await request.json());
    return Response.json(quote);
  } catch (error) {
    return errorResponse(error);
  }
}
