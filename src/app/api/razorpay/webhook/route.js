import { NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!secret) {
      console.error("Missing RAZORPAY_WEBHOOK_SECRET environment variable");
      return NextResponse.json({ error: "Webhook secret missing" }, { status: 500 });
    }

    // Verify webhook signature
    const expectedSig = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    if (expectedSig !== signature) {
      console.error("Invalid Razorpay webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    
    console.log(`[Razorpay Webhook] Received event: ${event}`);

    const subEntity = payload.payload?.subscription?.entity;
    if (!subEntity) {
      return NextResponse.json({ error: "No subscription entity in payload" }, { status: 400 });
    }

    const userId = subEntity.notes?.user_id;
    const plan = subEntity.notes?.plan || "pro";
    const subscriptionId = subEntity.id;
    const status = subEntity.status; // active, authenticated, cancelled, completed

    if (!userId) {
      console.warn("Razorpay Webhook payload notes missing user_id");
      return NextResponse.json({ received: true, warning: "user_id missing" });
    }

    const supabaseAdmin = await createAdminClient();

    if (event === "subscription.activated" || event === "subscription.charged") {
      // Upgrade user
      const { error } = await supabaseAdmin
        .from("profiles")
        .update({
          billing_subscription_id: subscriptionId,
          subscription_status: "active",
          plan_type: plan.toLowerCase()
        })
        .eq("id", userId);

      if (error) {
        console.error("[Razorpay Webhook] Failed to upgrade user profile:", error);
        return NextResponse.json({ error: "Database update failed" }, { status: 500 });
      }
      console.log(`[Razorpay Webhook] Upgraded user ${userId} to plan: ${plan}`);
    } else if (event === "subscription.cancelled" || event === "subscription.completed" || status === "cancelled") {
      // Downgrade user back to free plan
      const { error } = await supabaseAdmin
        .from("profiles")
        .update({
          subscription_status: "canceled",
          plan_type: "free"
        })
        .eq("id", userId);

      if (error) {
        console.error("[Razorpay Webhook] Failed to downgrade user profile:", error);
        return NextResponse.json({ error: "Database update failed" }, { status: 500 });
      }
      console.log(`[Razorpay Webhook] Downgraded user ${userId} to free plan`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[Razorpay Webhook] Error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
