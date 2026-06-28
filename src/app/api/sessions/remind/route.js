import { createAdminClient } from "@/lib/supabase/server";
import { sendAppointmentReminder } from "@/lib/resend";

/**
 * GET /api/sessions/remind
 *
 * Cron job endpoint — finds all patient sessions where:
 *   - next_appointment is within the next 24-25 hours
 *   - reminder_sent_at is NULL (not yet sent)
 *
 * Call this endpoint once per hour via:
 *   - Vercel Cron Jobs (vercel.json)
 *   - Any external scheduler (cron-job.org, GitHub Actions)
 *
 * Secured with CRON_SECRET env var to prevent public abuse.
 */
export async function GET(request) {
  // ── Secret check ────────────────────────────────────────────
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // If CRON_SECRET is set, require it. If not set, allow (for development).
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminClient = await createAdminClient();
  const now         = new Date();
  const in24h       = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const in25h       = new Date(now.getTime() + 25 * 60 * 60 * 1000);

  // Find sessions due for a reminder
  const { data: sessions, error } = await adminClient
    .from("patient_sessions")
    .select(`
      id,
      next_appointment,
      patient_id,
      therapist_id,
      patients (
        invite_email,
        invite_token,
        display_alias
      ),
      profiles:therapist_id (
        full_name,
        email
      )
    `)
    .gte("next_appointment", in24h.toISOString())
    .lte("next_appointment", in25h.toISOString())
    .is("reminder_sent_at", null);

  if (error) {
    console.error("[remind] Query error:", error);
    return Response.json({ error: "Query failed" }, { status: 500 });
  }

  if (!sessions || sessions.length === 0) {
    return Response.json({ sent: 0, message: "No reminders due." });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  let sent = 0;
  const results = [];

  for (const session of sessions) {
    const patient        = session.patients;
    const therapistName  = session.profiles?.full_name || "Your Therapist";
    const toEmail        = patient?.invite_email;
    const logLink        = `${appUrl}/log?token=${patient?.invite_token}`;

    if (!toEmail) {
      results.push({ patientId: session.patient_id, status: "skipped — no email" });
      continue;
    }

    try {
      const { error: emailError } = await sendAppointmentReminder({
        toEmail,
        patientAlias: patient.display_alias,
        therapistName,
        appointmentDate: session.next_appointment,
        logLink,
      });

      if (emailError) {
        results.push({ patientId: session.patient_id, status: "email_failed", error: emailError.message });
        continue;
      }

      // Mark reminder as sent
      await adminClient
        .from("patient_sessions")
        .update({ reminder_sent_at: now.toISOString() })
        .eq("id", session.id);

      sent++;
      results.push({ patientId: session.patient_id, status: "sent" });
    } catch (err) {
      console.error("[remind] Unexpected error for session", session.id, err);
      results.push({ patientId: session.patient_id, status: "error", error: err.message });
    }
  }

  return Response.json({ sent, results });
}
