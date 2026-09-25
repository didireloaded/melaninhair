"use client";

import { useState } from "react";
import type { ConfirmationResult } from "firebase/auth";
import { ShieldCheck } from "lucide-react";
import { normalizeNamibianPhone } from "@/lib/booking/phone";
import { confirmPhoneCode, sendPhoneCode } from "@/lib/firebase/phone-auth";

export function PhoneVerificationStep({
  phone,
  onVerified,
  onError,
}: {
  phone: string;
  onVerified: (token: string) => void;
  onError: (message: string) => void;
}) {
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const normalized = normalizeNamibianPhone(phone);

  async function send() {
    if (!normalized) return onError("Enter a valid Namibian phone number.");
    setBusy(true);
    onError("");
    try {
      setConfirmation(await sendPhoneCode(normalized));
    } catch {
      onError("We could not send the code. Check the number and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    if (!confirmation || !/^\d{6}$/.test(code)) return onError("Enter the 6-digit code from the SMS.");
    setBusy(true);
    onError("");
    try {
      onVerified(await confirmPhoneCode(confirmation, code));
    } catch {
      onError("That code is incorrect or expired. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="px-5 pb-6 pt-7 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-blush text-coral">
        <ShieldCheck size={25} />
      </div>
      <h2 className="mt-5 font-serif text-[30px] leading-tight">Verify your number</h2>
      <p className="mx-auto mt-2 max-w-[300px] text-[14px] leading-6 text-muted">
        We&apos;ll text a one-time code to <strong className="text-brown">{normalized ?? phone}</strong>.
      </p>
      {!confirmation ? (
        <button type="button" disabled={busy} onClick={send} className="press mt-7 h-[52px] w-full rounded-[16px] bg-coral text-[16px] font-medium text-white disabled:opacity-50">
          {busy ? "Sending…" : "Send verification code"}
        </button>
      ) : (
        <>
          <label className="mt-7 block text-left text-[14px]" htmlFor="otp-code">
            Verification code
            <input
              id="otp-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
              className="mt-1.5 h-14 w-full rounded-[14px] border border-line bg-white px-4 text-center text-[24px] tracking-[0.3em] outline-none focus:border-coral"
            />
          </label>
          <button type="button" disabled={busy || code.length !== 6} onClick={verify} className="press mt-4 h-[52px] w-full rounded-[16px] bg-coral text-[16px] font-medium text-white disabled:opacity-50">
            {busy ? "Verifying…" : "Verify & continue"}
          </button>
          <button type="button" disabled={busy} onClick={send} className="mt-3 h-10 text-[14px] text-muted disabled:opacity-50">
            Send a new code
          </button>
        </>
      )}
      <div id="phone-recaptcha" />
    </div>
  );
}
