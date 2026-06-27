import { createClient } from "@/lib/supabase/server";

export async function PATCH(request, { params }) {
  try {
    const { logId } = await params;
    const { notes } = await request.json();

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the log belongs to a patient of this therapist
    const { data: log, error: logError } = await supabase
      .from("daily_logs")
      .select("patients!inner(therapist_id)")
      .eq("id", logId)
      .single();

    if (logError || !log || log.patients.therapist_id !== user.id) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update notes
    const { error: updateError } = await supabase
      .from("daily_logs")
      .update({ therapist_notes: notes || null })
      .eq("id", logId);

    if (updateError) {
      return Response.json({ error: "Failed to update notes" }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("[notes PATCH] Error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
