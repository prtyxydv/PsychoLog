import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ approved: false, error: "Email is required" }, { status: 400 });
    }

    const cleanedEmail = email.trim().toLowerCase();

    // 1. Always allow the main admin email
    if (cleanedEmail === "pratyakshyadav888@gmail.com") {
      return NextResponse.json({ approved: true });
    }

    // 2. Query public_waitlist table using the admin client (which bypasses select RLS)
    const adminClient = await createAdminClient();
    const { data, error } = await adminClient
      .from("public_waitlist")
      .select("status")
      .eq("email", cleanedEmail)
      .maybeSingle();

    if (error) {
      console.error("[waitlist check] DB Error:", error);
      return NextResponse.json({ approved: false, error: "Database verification failed" }, { status: 500 });
    }

    if (data && data.status === "approved") {
      return NextResponse.json({ approved: true });
    }

    return NextResponse.json({ approved: false });
  } catch (err) {
    console.error("[waitlist check] Unexpected:", err);
    return NextResponse.json({ approved: false, error: "Internal server error" }, { status: 500 });
  }
}
