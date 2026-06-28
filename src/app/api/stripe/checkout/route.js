import { createAdminClient, createClient } from "@/lib/supabase/server";
import Stripe from "stripe";

export async function POST(request) {
  try {
    const { priceId, planName } = await request.json();
    if (!priceId) {
      return Response.json({ error: "Missing priceId" }, { status: 400 });
    }

    const supabase = await createClient();

    // ── 1. Auth check ───────────────────────────────────────
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return Response.json({ error: "Missing Stripe Configuration" }, { status: 500 });
    }

    // ── 2. LIVE STRIPE ───────────────────────────────────────
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-04-10",
    });

    const adminClient = await createAdminClient();
    const { data: profile } = await adminClient
      .from("profiles")
      .select("stripe_customer_id, email")
      .eq("id", user.id)
      .single();

    // Create or reuse a Stripe customer
    let customerId = profile?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({ email: profile.email });
      customerId = customer.id;
      await adminClient
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: process.env.NEXT_PUBLIC_PRO_PRICE_ID, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?status=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?status=cancelled`,
    });

    return Response.json({ url: session.url });
  } catch (err) {
    console.error("[stripe/checkout]", err);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
