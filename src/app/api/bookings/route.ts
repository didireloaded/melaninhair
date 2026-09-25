import { createBooking } from "@/lib/data/create-booking";
import { AppError, errorResponse } from "@/lib/errors";
import { normalizeNamibianPhone } from "@/lib/booking/phone";
import { getFirebaseAdminAuth } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get("authorization") ?? "";
    if (!authorization.startsWith("Bearer ")) {
      throw new AppError("auth", "Verify your phone number before booking.", 401);
    }
    const identity = await getFirebaseAdminAuth().verifyIdToken(authorization.slice(7), true);
    const verifiedPhone = normalizeNamibianPhone(identity.phone_number ?? "");
    if (!verifiedPhone) throw new AppError("auth", "Your verified phone number is missing.", 401);
    const type = request.headers.get("content-type") ?? "";
    if (type.includes("multipart/form-data")) {
      const form = await request.formData();
      const payload = form.get("payload");
      if (typeof payload !== "string") throw new AppError("validation", "Check the booking details and try again.");
      const file = form.get("inspiration");
      const image = file instanceof File && file.size > 0 ? Buffer.from(await file.arrayBuffer()) : null;
      const parsedPayload = JSON.parse(payload) as { clientPhone?: string };
      if (normalizeNamibianPhone(parsedPayload.clientPhone ?? "") !== verifiedPhone) {
        throw new AppError("auth", "Book with the phone number you verified.", 403);
      }
      const receipt = await createBooking(parsedPayload, image, identity.uid);
      return Response.json(receipt);
    }
    const payload = (await request.json()) as { clientPhone?: string };
    if (normalizeNamibianPhone(payload.clientPhone ?? "") !== verifiedPhone) {
      throw new AppError("auth", "Book with the phone number you verified.", 403);
    }
    const receipt = await createBooking(payload, null, identity.uid);
    return Response.json(receipt);
  } catch (error) {
    return errorResponse(error);
  }
}
