import { ZodError } from "zod";

export class AppError extends Error {
  status: number;
  code: string;

  constructor(code: string, message: string, status = 400) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export function errorResponse(error: unknown): Response {
  if (error instanceof ZodError) {
    return Response.json(
      { error: "validation", message: error.issues[0]?.message || "Check the details and try again." },
      { status: 400 },
    );
  }
  if (error instanceof AppError) {
    return Response.json({ error: error.code, message: error.message }, { status: error.status });
  }
  console.error(error);
  return Response.json(
    { error: "server", message: "Something went wrong. Please try again." },
    { status: 500 },
  );
}
