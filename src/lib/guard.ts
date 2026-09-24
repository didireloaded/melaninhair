import { getSessionAdmin } from "@/lib/auth";
import { AppError } from "@/lib/errors";

export async function requireAdmin() {
  const admin = await getSessionAdmin();
  if (!admin) throw new AppError("auth", "Sign in to the studio.", 401);
  return admin;
}
