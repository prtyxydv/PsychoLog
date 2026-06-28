import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import SessionPlanClient from "./SessionPlanClient";

export async function generateMetadata({ params }) {
  return { title: "Next Session — PsychoLog" };
}

export default async function SessionPage({ params }) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Verify this patient belongs to the logged-in therapist
  const { data: patient, error } = await supabase
    .from("patients")
    .select("id, display_alias, therapist_id")
    .eq("id", id)
    .eq("therapist_id", user.id)
    .single();

  if (error || !patient) return notFound();

  return (
    <SessionPlanClient
      patientId={patient.id}
      patientAlias={patient.display_alias}
    />
  );
}
