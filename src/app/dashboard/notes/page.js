import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import GeneralNotesClient from "./GeneralNotesClient";

export const metadata = {
  title: "My Notes — PsychoLog",
  description: "Private therapist workspace for session prep, billing reminders, and general notes.",
};

export default async function NotesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // The actual content is fetched client-side so the page is always fresh
  return <GeneralNotesClient />;
}
