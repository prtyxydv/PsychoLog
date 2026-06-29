import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// Fully public — no auth required. Uses service role to bypass RLS.
export async function POST(request) {
  try {
    const { name, email, role, plan, note } = await request.json();

    if (!name || !email || !role) {
      return NextResponse.json({ error: "Name, email, and role are required." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    const supabase = await createAdminClient();

    // Check for duplicate
    const { data: existing } = await supabase
      .from("public_waitlist")
      .select("id")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "This email is already on the waitlist!" }, { status: 409 });
    }

    const { error } = await supabase.from("public_waitlist").insert({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role,
      requested_plan: plan || "pro",
      note: note?.trim() || null,
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Waitlist POST error:", err);
    return NextResponse.json({ error: "Failed to join waitlist. Please try again." }, { status: 500 });
  }
}
