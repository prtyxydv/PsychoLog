import { createAdminClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";
import { sendPatientInvite } from "@/lib/resend";
import { generatePatientAlias, generateInviteToken } from "@/lib/utils";

export async function POST(request) {
  try {
    // ── Auth: verify therapist is logged in ───────────────────
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { email, expiresAt } = body;

    if (!email || !expiresAt) {
      return Response.json({ error: "Email and expiry date are required" }, { status: 400 });
    }

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "Invalid email address" }, { status: 400 });
    }

    // Expiry must be in the future
    if (new Date(expiresAt) <= new Date()) {
      return Response.json({ error: "Expiry date must be in the future" }, { status: 400 });
    }

    // ── Fetch therapist name ──────────────────────────────────
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .single();

    const therapistName = profile?.full_name || "Your Therapist";

    // ── Generate alias + token ────────────────────────────────
    const adminClient = await createAdminClient();
    let alias = generatePatientAlias();
    let token = generateInviteToken();

    // Ensure alias is unique for this therapist
    let aliasExists = true;
    while (aliasExists) {
      const { data } = await adminClient
        .from("patients")
        .select("id")
        .eq("therapist_id", user.id)
        .eq("display_alias", alias)
        .single();
      if (!data) { aliasExists = false; }
      else { alias = generatePatientAlias(); }
    }

    // ── Insert patient record ─────────────────────────────────
    const { data: patient, error: insertError } = await adminClient
      .from("patients")
      .insert({
        therapist_id:   user.id,
        display_alias:  alias,
        invite_email:   email,
        invite_token:   token,
        invite_expires: new Date(expiresAt).toISOString(),
      })
      .select("id, display_alias, invite_token")
      .single();

    if (insertError) {
      console.error("[invite] DB insert error:", insertError);
      return Response.json({ error: "Failed to create patient record" }, { status: 500 });
    }

    // ── Send invite email ─────────────────────────────────────
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const inviteLink = `${appUrl}/log?token=${token}`;

    const { error: emailError } = await sendPatientInvite({
      toEmail:      email,
      patientAlias: alias,
      inviteLink,
      therapistName,
      expiresAt,
    });

    if (emailError) {
      // Patient record created — but email failed. Still return success with warning.
      console.error("[invite] Email send error:", emailError);
      return Response.json({
        success: true,
        warning: "Patient created but email delivery failed. Share the link manually.",
        patient: { id: patient.id, alias, link: inviteLink },
      });
    }

    return Response.json({
      success: true,
      patient: { id: patient.id, alias, link: inviteLink },
    });

  } catch (err) {
    console.error("[invite] Unexpected error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
