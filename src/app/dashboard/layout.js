import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardShell from "./DashboardShell";

export const metadata = {
  title: "PsychoLog Dashboard",
  description: "Therapist dashboard for PsychoLog",
};

export default async function DashboardLayout({ children }) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, org_name")
    .eq("id", user.id)
    .single();

  // Fetch patients
  const { data: patients } = await supabase
    .from("patients")
    .select(`
      id,
      display_alias,
      created_at,
      daily_logs (
        submitted_at,
        therapist_notes
      )
    `)
    .eq("therapist_id", user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  // Enrich patients
  const enrichedPatients = (patients || []).map(p => {
    const logs      = p.daily_logs || [];
    const lastLog   = logs.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at))[0];
    const unread    = logs.filter(l => !l.therapist_notes).length;
    return {
      id:            p.id,
      display_alias: p.display_alias,
      created_at:    p.created_at,
      last_log_at:   lastLog?.submitted_at ?? null,
      unread,
    };
  });

  return (
    <DashboardShell profile={profile} initialPatients={enrichedPatients}>
      {children}
    </DashboardShell>
  );
}
