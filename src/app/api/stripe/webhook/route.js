import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req) {
  try {
    const rawBody = await req.text();
    const sig = req.headers.get("stripe-signature");

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("Missing STRIPE_SECRET_KEY env variable");
      return NextResponse.json({ error: "Stripe configuration missing" }, { status: 500 });
    }

    let event;

    try {
      if (endpointSecret) {
        event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
      } else {
        // Fallback for local dev testing if signature verification secret is omitted
        event = JSON.parse(rawBody);
      }
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const supabaseAdmin = await createAdminClient();
    const eventType = event.type || event.event_name; // handle both verified and raw JSON testing

    // Handle the event
    if (eventType === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.client_reference_id;
      const customerId = session.customer;
      const subscriptionId = session.subscription;
      
      // Get plan type from metadata (configured on payment link or checkout session creation)
      const planType = session.metadata?.plan || "pro";

      if (userId) {
        const { error } = await supabaseAdmin
          .from("profiles")
          .update({
            billing_customer_id: customerId,
            billing_subscription_id: subscriptionId,
            subscription_status: "active",
            plan_type: planType.toLowerCase()
          })
          .eq("id", userId);

        if (error) {
          console.error("Failed to update profile on checkout completed:", error);
        } else {
          console.log(`Successfully upgraded user ${userId} to plan ${planType}`);
        }
      } else {
        console.warn("checkout.session.completed received without client_reference_id");
      }
    } else if (eventType === "customer.subscription.updated" || eventType === "customer.subscription.deleted") {
      const subscription = event.data.object;
      const subscriptionId = subscription.id;
      const status = subscription.status; // 'active', 'trialing', 'past_due', 'canceled', 'unpaid'

      let normalizedStatus = "active";
      let planType = null;

      if (status === "canceled" || status === "unpaid" || status === "incomplete_expired") {
        normalizedStatus = "canceled";
        planType = "free"; // Downgrade back to free plan
      } else if (status === "past_due") {
        normalizedStatus = "past_due";
      } else if (status === "trialing") {
        normalizedStatus = "trialing";
      }

      const updateData = { subscription_status: normalizedStatus };
      if (planType) {
        updateData.plan_type = planType;
      }

      const { error } = await supabaseAdmin
        .from("profiles")
        .update(updateData)
        .eq("billing_subscription_id", subscriptionId);

      if (error) {
        console.error("Failed to update profile on subscription change:", error);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Stripe Webhook error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
