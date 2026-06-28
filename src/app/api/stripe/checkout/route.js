import { createAdminClient, createServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

/**
 * POST /api/stripe/checkout
 *
 * Creates a Stripe Checkout Session for the authenticated therapist.
 * Currently MOCKED — returns a demo URL so the full UI works
 * without live Stripe keys. When ready, uncomment the Stripe block
 * and add STRIPE_SECRET_KEY + STRIPE_PRICE_ID to .env.local.
 */
export async function POST() {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);

    // ── 1. Auth check ───────────────────────────────────────
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    /* ── 2. LIVE STRIPE (uncomment when keys are ready) ──────
    const Stripe = (await import("stripe")).default;
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
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?status=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?status=cancelled`,
    });

    return Response.json({ url: session.url });
    ── END LIVE STRIPE ─────────────────────────────────────── */

    // ── 2. MOCKED response until keys are added ─────────────
    console.log(`[stripe/checkout] MOCK — therapist ${user.id} initiated checkout`);
    return Response.json({
      url: "/dashboard/billing?status=demo",
      mock: true,
    });
  } catch (err) {
    console.error("[stripe/checkout]", err);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
