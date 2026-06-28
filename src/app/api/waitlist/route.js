import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email, plan } = await request.json();
    
    if (!email) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("waitlist")
      .insert({
        profile_id: user.id,
        email: email,
        requested_plan: plan || 'pro',
      });

    if (error) {
      console.error("[Waitlist Error]", error);
      return Response.json({ error: "Failed to join waitlist" }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("[Waitlist Route Error]", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
