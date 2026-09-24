import { createBooking } from "@/lib/data/create-booking";
import { AppError, errorResponse } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const type = request.headers.get("content-type") ?? "";
    if (type.includes("multipart/form-data")) {
      const form = await request.formData();
      const payload = form.get("payload");
      if (typeof payload !== "string") throw new AppError("validation", "Check the booking details and try again.");
      const file = form.get("inspiration");
      const image = file instanceof File && file.size > 0 ? Buffer.from(await file.arrayBuffer()) : null;
      const receipt = await createBooking(JSON.parse(payload), image);
      return Response.json(receipt);
    }
    const receipt = await createBooking(await request.json(), null);
    return Response.json(receipt);
  } catch (error) {
    return errorResponse(error);
  }
}
