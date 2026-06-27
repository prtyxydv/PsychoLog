import { createAdminClient } from "@/lib/supabase/server";
import { sendCrisisAlert } from "@/lib/resend";
import { verifySessionToken } from "../pin/route";

export async function POST(request) {
  try {
    const { token, severity, timestamp } = await request.json();

    if (!token) {
      return Response.json({ error: "Missing token" }, { status: 400 });
    }

    // Since this is real-time from the patient log page, they might not have hit submit.
    // We don't strictly require sessionToken for this endpoint since it's just firing an alert based on the invite token.
    // However, the invite token must be valid.

    const adminClient = await createAdminClient();

    const { data: patient, error: patientError } = await adminClient
      .from("patients")
      .select(`
        id,
        display_alias,
        therapist_id,
        profiles (
          email,
          full_name
        )
      `)
      .eq("invite_token", token)
      .single();

    if (patientError || !patient) {
      return Response.json({ error: "Invalid patient" }, { status: 404 });
    }

    const therapistEmail = patient.profiles.email;
    const therapistName  = patient.profiles.full_name || "Therapist";

    // Send the crisis alert email to the therapist
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const patientLink = `${appUrl}/dashboard/patient/${patient.id}`;

    await sendCrisisAlert({
      toEmail: therapistEmail,
      therapistName,
      patientAlias: patient.display_alias,
      severity: severity || "high",
      patientLink,
    });

    // We don't store anything in the DB yet; that happens on submit.
    // This is purely the real-time notification mechanism.

    return Response.json({ success: true });
  } catch (err) {
    console.error("[crisis-alert] Error:", err);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
