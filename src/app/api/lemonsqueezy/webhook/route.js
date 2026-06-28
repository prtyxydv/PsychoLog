import { NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-signature");
    const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;

    if (!secret) {
      console.error("Missing LEMON_SQUEEZY_WEBHOOK_SECRET");
      return NextResponse.json({ error: "Webhook secret missing" }, { status: 500 });
    }

    const hmac = crypto.createHmac("sha256", secret);
    const digest = Buffer.from(hmac.update(rawBody).digest("hex"), "utf8");
    const signatureBuffer = Buffer.from(signature || "", "utf8");

    if (digest.length !== signatureBuffer.length || !crypto.timingSafeEqual(digest, signatureBuffer)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const eventName = payload.meta.event_name;
    const customData = payload.meta.custom_data || {};
    const userId = customData.user_id;

    if (!userId) {
      console.warn("Webhook received without user_id in custom_data");
    }

    const supabaseAdmin = createAdminClient();
    const attributes = payload.data.attributes;
    
    // Check if it's a subscription payload
    if (payload.data.type === "subscriptions") {
      const customerId = String(attributes.customer_id);
      const subscriptionId = String(payload.data.id);

      if (eventName === "subscription_created" || eventName === "subscription_updated") {
        const status = attributes.status; // 'active', 'past_due', 'unpaid', 'cancelled', 'expired'
        let normalizedStatus = "active";
        
        if (status === "cancelled" || status === "expired") {
          normalizedStatus = "canceled";
        } else if (status === "past_due" || status === "unpaid") {
          normalizedStatus = "past_due";
        } else if (status === "on_trial") {
          normalizedStatus = "trialing";
        }

        if (userId) {
          await supabaseAdmin
            .from("profiles")
            .update({
              billing_customer_id: customerId,
              billing_subscription_id: subscriptionId,
              subscription_status: normalizedStatus
            })
            .eq("id", userId);
        }
      } else if (eventName === "subscription_cancelled" || eventName === "subscription_expired") {
        if (userId) {
          await supabaseAdmin
            .from("profiles")
            .update({
              subscription_status: "canceled"
            })
            .eq("id", userId);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
