import { createAdminClient, createClient } from "@/lib/supabase/server";

export async function POST(request) {
  try {
    const supabase = await createClient();

    // Verify caller is logged in
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify caller is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id, field, value } = await request.json();

    if (!id || !field || value === undefined) {
      return Response.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Only allow updating specific billing fields to prevent abuse
    if (!["plan_type", "subscription_status"].includes(field)) {
      return Response.json({ error: "Invalid field" }, { status: 400 });
    }

    const adminClient = await createAdminClient();
    const { error: updateError } = await adminClient
      .from("profiles")
      .update({ [field]: value })
      .eq("id", id);

    if (updateError) {
      console.error("[admin/update-sub]", updateError);
      return Response.json({ error: "Failed to update profile" }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("[admin/update-sub]", err);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
