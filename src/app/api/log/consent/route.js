import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request) {
  try {
    const { token } = await request.json();
    if (!token) return Response.json({ error: "No token provided" }, { status: 400 });

    const adminClient = await createAdminClient();

    const { error } = await adminClient
      .from("patients")
      .update({ has_consented: true })
      .eq("invite_token", token);

    if (error) {
      console.error("[consent] DB update failed", error);
      return Response.json({ error: "Update failed" }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("[consent] Error", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
