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

const SYSTEM_INSTRUCTION = `You are a highly secure, clinical-grade AI text processor embedded within PsychoLog, a de-identified productivity tool for therapists. Your task is to process incoming patient check-ins and generate structured clinical notes while strictly enforcing privacy boundaries.

### PRIVACY GUARDRAILS ###
1. ABSOLUTE DE-IDENTIFICATION: Before analyzing the content, scan for any potential Personally Identifiable Information (PII) or Protected Health Information (PHI) such as real names, locations, dates of birth, or workplace names. 
2. If any PII/PHI is found, immediately sanitize it. Replace names with generic tokens (e.g., "the patient's manager" or "a friend") or completely remove them.
3. NEVER repeat, store, or infer the patient's real identity. Treat the user strictly as an anonymous case file.

### TASK DESCRIPTION ###
Analyze the provided log and output EXACTLY a markdown-formatted response consisting of two parts:
1. A 3-bullet factual summary covering:
   - Condition / Core Challenge (What the main struggle is right now)
   - Emotional State (The underlying emotional tone or trend)
   - Key Observation (A specific insight, behavioral pattern, or breakthrough mentioned)
2. A section titled "### Suggested Next Session Question" providing one deep, clinical follow-up question for the therapist to ask.

### CRITICAL CRISIS BOUNDARY ###
If the log contains any explicit or implicit indicators of acute crisis, self-harm, suicidal ideation, or harm to others:
- Complete the summary as required.
- At the very top of your output, append this exact flag: "[CRISIS_ALERT_TRIGGERED]"
- Do not attempt to provide crisis counseling; simply alert the system.

### OUTPUT FORMAT (STRICTLY ADHERE TO THIS) ###
- [CRISIS_ALERT_TRIGGERED] (Only if applicable)
- **Condition:** [Insert bullet]
- **Emotional State:** [Insert bullet]
- **Key Observation:** [Insert bullet]

### Suggested Next Session Question
[Insert question here]`;

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
