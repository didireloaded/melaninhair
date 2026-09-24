import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";
import { AppError } from "./errors";

export type ImageMime = "image/jpeg" | "image/png" | "image/webp";

export function detectImage(buffer: Buffer): ImageMime | null {
  if (buffer.length < 12) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "image/jpeg";
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return "image/png";
  if (buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") return "image/webp";
  return null;
}

function extension(mime: ImageMime): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

function assertImage(bytes: Buffer): ImageMime {
  const mime = detectImage(bytes);
  if (!mime) throw new AppError("image", "Use a JPG, PNG or WEBP photo.");
  if (bytes.length > 3_500_000) throw new AppError("image", "That photo is too large. Try a smaller one.");
  return mime;
}

export async function savePublicImage(folder: "services" | "portfolio", bytes: Buffer): Promise<string> {
  const mime = assertImage(bytes);
  const name = `${randomBytes(12).toString("hex")}.${extension(mime)}`;
  const dir = path.join(process.cwd(), "storage", "public", folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), bytes);
  return `/api/media/${folder}/${name}`;
}

export async function readPublicImage(folder: string, file: string): Promise<{ bytes: Buffer; mime: ImageMime } | null> {
  if (!["services", "portfolio"].includes(folder) || !/^[\w.-]+$/.test(file)) return null;
  const full = path.join(process.cwd(), "storage", "public", folder, file);
  try {
    const bytes = await readFile(full);
    const mime = detectImage(bytes);
    if (!mime) return null;
    return { bytes, mime };
  } catch {
    return null;
  }
}

export async function saveInspiration(bytes: Buffer): Promise<{ fileName: string; mimeType: ImageMime }> {
  const mime = assertImage(bytes);
  const fileName = `${randomBytes(16).toString("hex")}.${extension(mime)}`;
  const dir = path.join(process.cwd(), "storage", "inspiration");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, fileName), bytes);
  return { fileName, mimeType: mime };
}

export async function readInspiration(fileName: string): Promise<{ bytes: Buffer; mime: ImageMime } | null> {
  if (!/^[\w.-]+$/.test(fileName)) return null;
  try {
    const bytes = await readFile(path.join(process.cwd(), "storage", "inspiration", fileName));
    const mime = detectImage(bytes);
    if (!mime) return null;
    return { bytes, mime };
  } catch {
    return null;
  }
}
