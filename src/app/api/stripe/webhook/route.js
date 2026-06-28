import { createAdminClient } from "@/lib/supabase/server";

/**
 * POST /api/stripe/webhook
 *
 * Receives Stripe webhook events and updates the subscription status
 * in Supabase. Requires STRIPE_WEBHOOK_SECRET in .env.local.
 *
 * To activate:
 * 1. Add STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET to .env.local
 * 2. Uncomment the signature verification block below
 * 3. In Stripe Dashboard → Webhooks, add this endpoint URL and select:
 *    - checkout.session.completed
 *    - customer.subscription.updated
 *    - customer.subscription.deleted
 */
export async function POST(request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  /* ── LIVE signature verification (uncomment when ready) ───
  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-04-10",
  });

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("[webhook] Signature verification failed:", err.message);
    return new Response("Webhook signature invalid", { status: 400 });
  }
  ── END signature verification ───────────────────────────── */

  // ── MOCKED event parsing ────────────────────────────────
  let event;
  try {
    event = JSON.parse(body);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const adminClient = await createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data?.object;
        const customerId = session?.customer;
        const subscriptionId = session?.subscription;

        if (customerId && subscriptionId) {
          await adminClient
            .from("profiles")
            .update({
              stripe_subscription_id: subscriptionId,
              subscription_status: "active",
            })
            .eq("stripe_customer_id", customerId);
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data?.object;
        if (sub?.customer) {
          await adminClient
            .from("profiles")
            .update({ subscription_status: sub.status })
            .eq("stripe_customer_id", sub.customer);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data?.object;
        if (sub?.customer) {
          await adminClient
            .from("profiles")
            .update({
              subscription_status: "canceled",
              stripe_subscription_id: null,
            })
            .eq("stripe_customer_id", sub.customer);
        }
        break;
      }

      default:
        console.log(`[webhook] Unhandled event type: ${event.type}`);
    }

    return Response.json({ received: true });
  } catch (err) {
    console.error("[webhook] Handler error:", err);
    return Response.json({ error: "Handler failed" }, { status: 500 });
  }
}
