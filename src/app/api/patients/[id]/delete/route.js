import { createClient } from "@/lib/supabase/server";

export async function DELETE(request, { params }) {
  try {
    const { id } = await params; // patient uuid
    if (!id) {
      return Response.json({ error: "Patient ID missing" }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. Verify caller is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Delete patient. RLS ensures a therapist can only delete their own patient.
    // Assuming cascading deletes are set up on daily_logs referencing patient_uuid,
    // the logs will also be destroyed. If not, the delete might fail due to foreign key constraints,
    // but typically Supabase handles this via RLS or CASCADE.
    // If CASCADE is not set, we'll manually delete the logs first.
    await supabase
      .from("daily_logs")
      .delete()
      .eq("patient_uuid", id);

    const { error: deleteError } = await supabase
      .from("patients")
      .delete()
      .eq("id", id)
      .eq("therapist_id", user.id);

    if (deleteError) {
      console.error("[patients/delete] DB delete error:", deleteError);
      return Response.json({ error: "Failed to delete patient" }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("[patients/delete] Unexpected error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
