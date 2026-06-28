import { createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  const adminClient = await createAdminClient();
  const { data, error } = await adminClient.from("daily_logs").select("*").limit(1);
  return Response.json({ data, error });
}
