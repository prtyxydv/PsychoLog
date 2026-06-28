import { createClient } from "@/lib/supabase/server";
import DashboardHomeClient from "./DashboardHomeClient";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  // Fetch patients for stats
  const { data: patients } = await supabase
    .from("patients")
    .select(`
      id,
      created_at,
      daily_logs (
        submitted_at,
        therapist_notes
      )
    `)
    .eq("therapist_id", user.id)
    .eq("is_active", true);

  // Compute stats
  const stats = {
    total: patients?.length || 0,
    unread: 0,
    activeThisWeek: 0,
  };

  const oneWeekAgo = Date.now() - 7 * 86400000;

  (patients || []).forEach(p => {
    const logs = p.daily_logs || [];
    const unread = logs.filter(l => !l.is_read).length;
    stats.unread += unread;
    
    if (logs.length > 0) {
      const lastLog = logs.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at))[0];
      if (new Date(lastLog.submitted_at) > oneWeekAgo) {
        stats.activeThisWeek += 1;
      }
    }
  });

  return (
    <div style={{ padding: "48px" }}>
      <DashboardHomeClient profile={profile} stats={stats} />
    </div>
  );
}
