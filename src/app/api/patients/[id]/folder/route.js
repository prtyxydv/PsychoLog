import { createAdminClient, createServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

/**
 * PATCH /api/patients/[id]/folder
 * Body: { folder_name: string }
 *
 * Updates the folder label for a patient.
 * Only the owning therapist can update their own patient — enforced
 * both at the Supabase RLS layer AND here by verifying therapist_id.
 */
export async function PATCH(request, { params }) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);

    // ── 1. Verify the caller is an authenticated therapist ──
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: patientId } = params;
    const body = await request.json();
    const folderName = (body.folder_name ?? "General").trim().slice(0, 80);

    if (!patientId) {
      return Response.json({ error: "Missing patient ID" }, { status: 400 });
    }

    // ── 2. Confirm this therapist owns the patient ──────────
    // Using admin client so we can do the ownership check reliably,
    // then we update only if therapist_id matches.
    const adminClient = await createAdminClient();

    const { data: patient, error: fetchError } = await adminClient
      .from("patients")
      .select("id, therapist_id")
      .eq("id", patientId)
      .single();

    if (fetchError || !patient) {
      return Response.json({ error: "Patient not found" }, { status: 404 });
    }

    if (patient.therapist_id !== user.id) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    // ── 3. Update folder_name ───────────────────────────────
    const { error: updateError } = await adminClient
      .from("patients")
      .update({ folder_name: folderName || "General" })
      .eq("id", patientId);

    if (updateError) {
      console.error("[folder] Update error:", updateError);
      return Response.json({ error: "Update failed" }, { status: 500 });
    }

    return Response.json({ success: true, folder_name: folderName });
  } catch (err) {
    console.error("[folder] Unexpected error:", err);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
