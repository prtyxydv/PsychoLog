import { createAdminClient, createServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

/**
 * GET  /api/general-notes  — fetch therapist's personal notepad
 * PATCH /api/general-notes  — upsert note content
 *
 * Strict isolation: each therapist can only access their own note.
 * The DB has a UNIQUE constraint on therapist_id so there is
 * exactly one note per therapist, created on first GET.
 */

async function getAuthUser() {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const adminClient = await createAdminClient();

    // Try to fetch existing note
    const { data, error } = await adminClient
      .from("therapist_general_notes")
      .select("content, updated_at")
      .eq("therapist_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("[general-notes GET]", error);
      return Response.json({ error: "Fetch failed" }, { status: 500 });
    }

    // Return empty note if none exists yet (created on first PATCH)
    return Response.json({ content: data?.content ?? "", updated_at: data?.updated_at ?? null });
  } catch (err) {
    console.error("[general-notes GET] Unexpected:", err);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const user = await getAuthUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const content = typeof body.content === "string" ? body.content : "";

    const adminClient = await createAdminClient();

    // Upsert — creates on first call, updates thereafter
    const { error } = await adminClient
      .from("therapist_general_notes")
      .upsert(
        { therapist_id: user.id, content },
        { onConflict: "therapist_id" }
      );

    if (error) {
      console.error("[general-notes PATCH]", error);
      return Response.json({ error: "Save failed" }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("[general-notes PATCH] Unexpected:", err);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
