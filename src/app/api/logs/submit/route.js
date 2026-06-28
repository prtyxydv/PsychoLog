import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { verifySessionToken } from "../../pin/route";
import { sanitize } from "@/lib/sanitizer";
import { generateSummary, checkTopicSimilarity } from "@/lib/gemini";

export async function POST(request) {
  try {
    const sessionToken = request.headers.get("x-patient-session");
    if (!sessionToken) {
      return Response.json({ error: "Missing session token" }, { status: 401 });
    }

    const verifiedPatientId = verifySessionToken(sessionToken);
    if (!verifiedPatientId) {
      return Response.json({ error: "Invalid or expired session" }, { status: 401 });
    }

    const { token, patientId, moodScore, eventRaw, feelingRaw, crisisDetected, crisisSeverity } = await request.json();

    if (patientId !== verifiedPatientId) {
      return Response.json({ error: "Patient ID mismatch" }, { status: 403 });
    }

    if (!moodScore || moodScore < 1 || moodScore > 10) {
      return Response.json({ error: "Valid mood score required" }, { status: 400 });
    }

    const adminClient = await createAdminClient();

    const { data: patientData, error: patientError } = await adminClient
      .from("patients")
      .select("has_consented")
      .eq("id", patientId)
      .single();

    if (patientError || !patientData?.has_consented) {
      return Response.json({ error: "Patient has not provided informed consent" }, { status: 403 });
    }

    // ── 1. Sanitize PII locally ──────────────────────────────
    const eventSanitized   = sanitize(eventRaw || "");
    const feelingSanitized = sanitize(feelingRaw || "");

    // ── 2. Check for 24h Context ─────────────────────────────
    // If the patient posted something similar within 24h, we flag it.
    let hasPriorContext = false;
    const { data: recentLogs } = await adminClient
      .from("daily_logs")
      .select("event_sanitized, feeling_sanitized, submitted_at")
      .eq("patient_uuid", patientId)
      .order("submitted_at", { ascending: false })
      .limit(5);

    if (recentLogs && recentLogs.length > 0) {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const logsLast24h = recentLogs.filter(l => new Date(l.submitted_at) > oneDayAgo);
      if (logsLast24h.length > 0) {
        const priorText = logsLast24h.map(l => `${l.event_sanitized} ${l.feeling_sanitized}`).join(" | ");
        hasPriorContext = await checkTopicSimilarity(`${eventSanitized} ${feelingSanitized}`, priorText);
      }
    }

    // ── 3. Generate AI Summary (Gemini) ──────────────────────
    const summaryResult = await generateSummary({
      moodScore: moodScore,
      eventSanitized: eventSanitized,
      feelingSanitized: feelingSanitized,
      priorContext: hasPriorContext ? "User posted earlier today." : null,
    });

    const aiSummary = summaryResult.summary || "Summary generation failed or returned empty.";

    // ── 4. Save to Database ──────────────────────────────────
    const { error: insertError } = await adminClient
      .from("daily_logs")
      .insert({
        patient_uuid:      patientId,
        mood_score:        moodScore,
        event_sanitized:   eventSanitized,
        feeling_sanitized: feelingSanitized,
        ai_summary:        aiSummary,
        ai_generated_at:   new Date().toISOString(),
        crisis_detected:   crisisDetected || false,
        crisis_severity:   crisisSeverity || null,
        has_prior_context: hasPriorContext,
      });

    if (insertError) {
      console.error("[logs/submit] Insert error:", insertError);
      return Response.json({ error: "Failed to save check-in" }, { status: 500 });
    }

    revalidatePath("/dashboard", "layout");
    
    return Response.json({ success: true });
  } catch (err) {
    console.error("[logs/submit] Error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
