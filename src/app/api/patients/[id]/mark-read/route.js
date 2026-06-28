import { createClient } from "@/lib/supabase/server";

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    
    if (!id) {
      return Response.json({ error: "Missing patient ID" }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Mark all logs for this patient as read
    const { error } = await supabase
      .from("daily_logs")
      .update({ is_read: true })
      .eq("patient_uuid", id)
      .eq("is_read", false);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("[mark-read] Error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
