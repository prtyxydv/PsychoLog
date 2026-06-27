/**
 * PsychoLog Gemini AI Wrapper
 *
 * Wraps Gemini 1.5 Pro for summarizing patient logs.
 * STRICT RULES:
 *  - Only receives SANITIZED text (no PII, no patient identity)
 *  - Never diagnoses, never claims to be a therapist
 *  - Outputs: 3 factual bullet points + 1 therapist prompt
 *  - Falls back gracefully if API is unavailable
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_INSTRUCTION = `You are a clinical documentation assistant for a licensed therapist.

Your ONLY job is to help the therapist understand what their patient reported — factually and concisely.

STRICT RULES:
1. You are NOT a therapist. You do NOT provide therapy. You do NOT give advice to the patient.
2. You do NOT diagnose, label, or pathologize. No clinical diagnoses.
3. You ONLY work with the sanitized, anonymized text provided. Never infer personal details.
4. You write for the THERAPIST to read — not for the patient.
5. Output format is FIXED: exactly 3 factual bullet points + 1 optional therapist reflection prompt.

OUTPUT FORMAT (strict markdown):
• **Condition / Incident**: [Explain the condition or incident reported by the patient]
• **Emotional State**: [Outline how the patient is feeling in general based on their report]
• **Key Observation**: [Factual pattern or notable element from this entry]

💬 **Consider exploring:** [One open, non-leading question the therapist might consider]

Do not add any other text, headers, disclaimers, or labels outside this format.`;

/**
 * Generates an AI summary from sanitized patient log fields.
 *
 * @param {{
 *   eventSanitized: string,
 *   feelingSanitized: string,
 *   moodScore: number,
 *   priorContext?: string | null   // sanitized prior log from same day if 24h match
 * }} params
 * @returns {Promise<{ summary: string | null, error: string | null }>}
 */
export async function generateSummary({ eventSanitized, feelingSanitized, moodScore, priorContext = null }) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_INSTRUCTION,
      generationConfig: {
        temperature: 0.3,      // Low creativity — factual only
        topP: 0.85,
        maxOutputTokens: 512,
      },
    });

    let userMessage = `Today's patient log (anonymized):\n\n`;
    userMessage += `Mood score: ${moodScore}/10\n`;
    userMessage += `Reported incident: ${eventSanitized || "(no incident described)"}\n`;
    userMessage += `Emotional response: ${feelingSanitized || "(no emotional response described)"}\n`;

    if (priorContext) {
      userMessage += `\n--- Earlier entry from the same session day (for context only) ---\n`;
      userMessage += priorContext;
      userMessage += `\n--- End of prior context ---\n`;
    }

    const result = await model.generateContent(userMessage);
    const text = result.response.text();

    return { summary: text.trim(), error: null };
  } catch (err) {
    console.error("[Gemini] Summary generation failed:", err.message);
    return { summary: null, error: err.message };
  }
}

/**
 * Checks if two sanitized log entries share similar themes (for 24h context).
 * Uses Gemini to determine keyword similarity — no patient identity is shared.
 *
 * @param {string} newText — sanitized combined text from new entry
 * @param {string} priorText — sanitized combined text from prior entry
 * @returns {Promise<boolean>}
 */
export async function checkTopicSimilarity(newText, priorText) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash", // Use flash for lightweight similarity check
      generationConfig: { temperature: 0, maxOutputTokens: 10 },
    });

    const prompt = `Do these two anonymized log excerpts discuss the same or closely related topic/incident? Answer only "yes" or "no".\n\nText A: ${newText.slice(0, 300)}\n\nText B: ${priorText.slice(0, 300)}`;

    const result = await model.generateContent(prompt);
    const answer = result.response.text().trim().toLowerCase();
    return answer.startsWith("yes");
  } catch {
    return false; // Default to no context on error
  }
}
