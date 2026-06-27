import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import PatientTimelineClient from "./PatientTimelineClient";

export const metadata = {
  title: "Patient Timeline",
};

export default async function PatientPage({ params }) {
  const { id } = await params;
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // Fetch patient and their logs
  const { data: patient, error } = await supabase
    .from("patients")
    .select(`
      id,
      display_alias,
      created_at,
      invite_expires,
      daily_logs (
        id,
        submitted_at,
        mood_score,
        event_sanitized,
        feeling_sanitized,
        ai_summary,
        therapist_notes,
        crisis_detected,
        crisis_severity
      )
    `)
    .eq("id", id)
    .eq("therapist_id", user.id)
    .single();

  if (error || !patient) {
    if (error) console.error("[PatientPage] Supabase error:", error);
    return notFound();
  }

  // Sort logs by newest first
  const logs = (patient.daily_logs || []).sort(
    (a, b) => new Date(b.submitted_at) - new Date(a.submitted_at)
  );

  return <PatientTimelineClient patient={patient} initialLogs={logs} />;
}
