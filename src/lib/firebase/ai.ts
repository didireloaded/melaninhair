"use client";

import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";
import { firebaseApp } from "./client";

const ai = getAI(firebaseApp, { backend: new GoogleAIBackend() });

export const geminiFlashModel = getGenerativeModel(ai, {
  model: "gemini-3.8-flash",
  generationConfig: {
    candidateCount: 1,
    maxOutputTokens: 2048,
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
  },
});

export async function generateFirebaseText(prompt: string): Promise<string> {
  const normalized = prompt.trim();
  if (!normalized) throw new Error("A prompt is required.");
  const result = await geminiFlashModel.generateContent(normalized);
  return result.response.text();
}
