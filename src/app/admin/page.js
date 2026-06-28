import { createAdminClient } from "@/lib/supabase/server";
import AdminClient from "./AdminClient";

export default async function AdminPage() {
  const adminClient = await createAdminClient();

  // Fetch all profiles
  const { data: profiles, error } = await adminClient
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Admin fetch error:", error);
    return <div>Failed to load profiles.</div>;
  }

  // Fetch patient counts per therapist
  // We'll just fetch all patients and group them, or run a count query.
  // Given low volume, we can just fetch all patients and group in memory.
  const { data: patients } = await adminClient
    .from("patients")
    .select("therapist_id");

  const counts = {};
  if (patients) {
    patients.forEach(p => {
      counts[p.therapist_id] = (counts[p.therapist_id] || 0) + 1;
    });
  }

  // Attach counts to profiles
  const enrichedProfiles = profiles.map(p => ({
    ...p,
    patientCount: counts[p.id] || 0
  }));

  // Fetch Waitlist
  const { data: waitlist, error: waitlistError } = await adminClient
    .from("waitlist")
    .select("*")
    .order("created_at", { ascending: false });

  if (waitlistError) {
    console.error("Waitlist fetch error:", waitlistError);
  }

  return (
    <div>
      <h1 style={{ fontSize: "2rem", marginBottom: "8px", fontWeight: 700 }}>Therapist Directory</h1>
      <p style={{ color: "var(--th-text-subtle)", marginBottom: "32px" }}>
        Manage all registered therapists, patient limits, and subscriptions manually.
      </p>

      <AdminClient initialProfiles={enrichedProfiles} initialWaitlist={waitlist || []} />
    </div>
  );
}
