import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import HomeClient from "./HomeClient";

export const metadata = {
  title: "PsychoLog Dashboard",
};

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch profile
  const { data: profileData } = await supabase
    .from("profiles")
    .select("full_name, plan_type")
    .eq("id", user.id)
    .single();

  const profile = { ...profileData, subscription_tier: profileData?.plan_type || "Free" };

  // Fetch patients for unread stats
  const { data: patients } = await supabase
    .from("patients")
    .select(`
      id,
      display_alias,
      daily_logs (
        submitted_at,
        is_read
      )
    `)
    .eq("therapist_id", user.id)
    .eq("is_active", true);

  // Compute unread logs
  const unreadPatients = (patients || [])
    .map(p => {
      const logs = p.daily_logs || [];
      const unreadCount = logs.filter(l => !l.is_read).length;
      const lastLog = logs.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at))[0];
      return {
        id: p.id,
        display_alias: p.display_alias,
        unread_count: unreadCount,
        last_log_at: lastLog ? lastLog.submitted_at : null
      };
    })
    .filter(p => p.unread_count > 0)
    .sort((a, b) => new Date(b.last_log_at) - new Date(a.last_log_at));

  // Fetch upcoming sessions
  const { data: sessions } = await supabase
    .from("patient_sessions")
    .select(`
      id,
      patient_id,
      next_appointment,
      patients ( display_alias )
    `)
    .eq("therapist_id", user.id)
    .gte("next_appointment", new Date().toISOString())
    .order("next_appointment", { ascending: true })
    .limit(5);

  return (
    <HomeClient 
      profile={profile} 
      unreadPatients={unreadPatients}
      upcomingSessions={sessions || []}
    />
  );
}
