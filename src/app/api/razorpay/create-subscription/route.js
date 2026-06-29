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

    // Read environment variable or use the active test key credentials as fallback
    const keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_T7RU0bzHddlLHF"; 
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "UkjPL7hNkHvtIWI7G7d7uPeF";

    // Map plan IDs dynamically with fallbacks from your dashboard
    const planIdMap = {
      basic: "plan_T7RJjghXwc2g7x",
      pro: "plan_T7RKKywkHaC1fL",
      elite: "plan_T7Rkuzzcxupbvx"
    };

    const planId = process.env[`NEXT_PUBLIC_RAZORPAY_PLAN_${plan.toUpperCase()}`] || planIdMap[plan.toLowerCase()];

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      total_count: 60, // 5 years subscription
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
