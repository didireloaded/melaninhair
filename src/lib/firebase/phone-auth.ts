"use client";

import {
  ConfirmationResult,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import { firebaseAuth } from "./client";

let verifier: RecaptchaVerifier | null = null;

function getVerifier(): RecaptchaVerifier {
  if (verifier) return verifier;
  verifier = new RecaptchaVerifier(firebaseAuth, "phone-recaptcha", {
    size: "invisible",
  });
  return verifier;
}

export async function sendPhoneCode(phone: string): Promise<ConfirmationResult> {
  try {
    return await signInWithPhoneNumber(firebaseAuth, phone, getVerifier());
  } catch (error) {
    verifier?.clear();
    verifier = null;
    throw error;
  }
}

export async function confirmPhoneCode(confirmation: ConfirmationResult, code: string): Promise<string> {
  const credential = await confirmation.confirm(code);
  return credential.user.getIdToken(true);
}
