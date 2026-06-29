import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createClient } from "@/lib/supabase/server";

export async function POST(req) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { plan } = await req.json();
    if (!plan || !["basic", "pro", "elite"].includes(plan.toLowerCase())) {
      return NextResponse.json({ error: "Invalid plan selected" }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json({
        error: "Razorpay credentials are not configured on the server. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your Vercel/Env settings."
      }, { status: 500 });
    }

    const planId = process.env[`NEXT_PUBLIC_RAZORPAY_PLAN_${plan.toUpperCase()}`];
    if (!planId) {
      return NextResponse.json({
        error: `Razorpay Plan ID for '${plan}' is not configured. Please set NEXT_PUBLIC_RAZORPAY_PLAN_${plan.toUpperCase()} in your environment variables.`
      }, { status: 500 });
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      total_count: 60, // 60 cycles (e.g. 5 years)
      quantity: 1,
      customer_notify: 1,
      notes: {
        user_id: user.id,
        plan: plan.toLowerCase(),
      }
    });

    return NextResponse.json({
      subscriptionId: subscription.id,
      keyId: keyId,
    });
  } catch (err) {
    console.error("Razorpay subscription creation failed:", err);
    return NextResponse.json({ error: err.message || "Failed to initiate subscription" }, { status: 500 });
  }
}
