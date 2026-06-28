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

    const { targetUserId } = await request.json();

    if (!targetUserId) {
      return Response.json({ error: "Missing user ID" }, { status: 400 });
    }

    // Prevent deleting yourself
    if (targetUserId === user.id) {
      return Response.json({ error: "Cannot delete yourself" }, { status: 400 });
    }

    const adminClient = await createAdminClient();
    
    // Delete the user from Auth (this will cascade delete their profile and patients if set up correctly, 
    // but just in case, we'll delete the profile explicitly first to be safe, though Auth deletion is primary).
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(targetUserId);

    if (deleteError) {
      console.error("[admin/delete-user]", deleteError);
      return Response.json({ error: "Failed to delete user" }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("[admin/delete-user]", err);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
