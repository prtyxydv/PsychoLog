import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BillingClient from "./BillingClient";

export const metadata = {
  title: "Billing — PsychoLog",
  description: "Manage your PsychoLog subscription.",
};

export default async function BillingPage({ searchParams }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Fetch subscription status from the profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, email, plan_type, subscription_status, verification_status, trial_ends_at")
    .eq("id", user.id)
    .single();

  const status = (await searchParams)?.status ?? null;

  return <BillingClient profile={profile} userId={user.id} statusParam={status} />;
}
