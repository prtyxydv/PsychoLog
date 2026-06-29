import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import HomeClient from "./HomeClient";

export const metadata = {
  title: "PsychoLog — Dashboard",
};

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // 1. Fetch profile
  const { data: profileData } = await supabase
    .from("profiles")
    .select("full_name, plan_type, subscription_status, created_at")
    .eq("id", user.id)
    .single();

  const profile = {
    ...profileData,
    email: user.email,
    subscription_tier: (profileData?.plan_type || "free")
      .charAt(0).toUpperCase() + (profileData?.plan_type || "free").slice(1),
  };

  // 2. Fetch all active patients (flat)
  const { data: patients } = await supabase
    .from("patients")
    .select("id, display_alias")
    .eq("therapist_id", user.id)
    .eq("is_active", true);

  const patientIds = (patients || []).map(p => p.id);
  const totalPatients = patientIds.length;

  // 3. Fetch unread logs for those patients (flat query — much more reliable than nested)
  let unreadPatients = [];
  if (patientIds.length > 0) {
    const { data: unreadLogs } = await supabase
      .from("daily_logs")
      .select("patient_uuid, submitted_at")
      .in("patient_uuid", patientIds)
      .eq("is_read", false);

    // Group by patient
    const unreadMap = {};
    for (const log of unreadLogs || []) {
      if (!unreadMap[log.patient_uuid]) {
        unreadMap[log.patient_uuid] = { count: 0, lastAt: null };
      }
      unreadMap[log.patient_uuid].count++;
      if (!unreadMap[log.patient_uuid].lastAt || log.submitted_at > unreadMap[log.patient_uuid].lastAt) {
        unreadMap[log.patient_uuid].lastAt = log.submitted_at;
      }
    }

    unreadPatients = (patients || [])
      .filter(p => unreadMap[p.id])
      .map(p => ({
        id: p.id,
        display_alias: p.display_alias,
        unread_count: unreadMap[p.id].count,
        last_log_at: unreadMap[p.id].lastAt,
      }))
      .sort((a, b) => new Date(b.last_log_at) - new Date(a.last_log_at));
  }

  // 4. Fetch upcoming sessions (flat, only future, only non-null)
  const { data: sessions } = await supabase
    .from("patient_sessions")
    .select("id, patient_id, next_appointment, prep_notes, patients ( display_alias )")
    .eq("therapist_id", user.id)
    .not("next_appointment", "is", null)
    .gte("next_appointment", new Date().toISOString())
    .order("next_appointment", { ascending: true })
    .limit(5);

  return (
    <HomeClient
      profile={profile}
      unreadPatients={unreadPatients}
      upcomingSessions={sessions || []}
      totalPatients={totalPatients}
    />
  );
}
