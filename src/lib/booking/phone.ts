export function normalizeNamibianPhone(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  let digits = trimmed.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) digits = digits.slice(1);
  if (digits.startsWith("00")) digits = digits.slice(2);

  if (digits.startsWith("264")) {
    digits = digits.slice(3);
  } else if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  if (!/^\d{8,9}$/.test(digits)) return null;
  return `+264${digits}`;
}

export function formatNamibianPhone(e164: string): string {
  const digits = e164.replace(/\D/g, "");
  if (!digits.startsWith("264")) return e164;
  const national = digits.slice(3);
  if (national.length < 8) return e164;
  return `+264 ${national.slice(0, 2)} ${national.slice(2, 5)} ${national.slice(5)}`;
}

export function whatsappHref(e164: string, message?: string): string {
  const digits = e164.replace(/\D/g, "");
  const base = `https://wa.me/${digits}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}
