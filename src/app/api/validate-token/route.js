import { createAdminClient } from "@/lib/supabase/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token || token.length < 10) {
      return Response.json({ valid: false, error: "Missing or invalid token" }, { status: 400 });
    }

    const adminClient = await createAdminClient();

    const { data: patient, error } = await adminClient
      .from("patients")
      .select("id, display_alias, invite_expires, is_active, pin_hash, has_consented")
      .eq("invite_token", token)
      .single();

    if (error || !patient) {
      return Response.json({ valid: false, error: "Token not found" }, { status: 404 });
    }

    // Check expiry
    if (new Date(patient.invite_expires) < new Date()) {
      return Response.json({
        valid: false,
        expired: true,
        error: "This invite link has expired. Please contact your therapist.",
      }, { status: 410 });
    }

    // Check active
    if (!patient.is_active) {
      return Response.json({
        valid: false,
        error: "This invite link has been deactivated. Please contact your therapist.",
      }, { status: 403 });
    }

    return Response.json({
      valid: true,
      patientId:    patient.id,
      alias:        patient.display_alias,
      hasPinSet:    !!patient.pin_hash,
      hasConsented: patient.has_consented,
      expiresAt:    patient.invite_expires,
    });

  } catch (err) {
    console.error("[validate-token] Error:", err);
    return Response.json({ valid: false, error: "Internal server error" }, { status: 500 });
  }
}
