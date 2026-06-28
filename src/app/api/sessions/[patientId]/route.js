import { createAdminClient, createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

/**
 * GET  /api/sessions/[patientId]  — fetch session plan for a patient
 * PATCH /api/sessions/[patientId]  — upsert session plan (notes + appointment)
 *
 * Ownership enforced: therapist can only access their own patients' sessions.
 */

async function getAuthUser() {
  const cookieStore = cookies();
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

async function verifyOwnership(adminClient, patientId, therapistId) {
  const { data, error } = await adminClient
    .from("patients")
    .select("id, therapist_id, invite_email, invite_token")
    .eq("id", patientId)
    .single();

  if (error || !data) return { ok: false, patient: null };
  if (data.therapist_id !== therapistId) return { ok: false, patient: null };
  return { ok: true, patient: data };
}

export async function GET(request, { params }) {
  try {
    const user = await getAuthUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { patientId } = params;
    const adminClient = await createAdminClient();

    const { ok } = await verifyOwnership(adminClient, patientId, user.id);
    if (!ok) return Response.json({ error: "Forbidden" }, { status: 403 });

    const { data, error } = await adminClient
      .from("patient_sessions")
      .select("next_appointment, prep_notes, reminder_sent_at, updated_at")
      .eq("patient_id", patientId)
      .maybeSingle();

    if (error) {
      console.error("[sessions GET]", error);
      return Response.json({ error: "Fetch failed" }, { status: 500 });
    }

    return Response.json({
      next_appointment: data?.next_appointment ?? null,
      prep_notes: data?.prep_notes ?? "",
      reminder_sent_at: data?.reminder_sent_at ?? null,
      updated_at: data?.updated_at ?? null,
    });
  } catch (err) {
    console.error("[sessions GET] Unexpected:", err);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const user = await getAuthUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { patientId } = params;
    const body = await request.json();

    const adminClient = await createAdminClient();
    const { ok } = await verifyOwnership(adminClient, patientId, user.id);
    if (!ok) return Response.json({ error: "Forbidden" }, { status: 403 });

    const updateData = {};

    if ("prep_notes" in body) {
      updateData.prep_notes = typeof body.prep_notes === "string" ? body.prep_notes : "";
    }

    if ("next_appointment" in body) {
      // Validate date
      if (body.next_appointment) {
        const d = new Date(body.next_appointment);
        if (isNaN(d.getTime())) {
          return Response.json({ error: "Invalid appointment date" }, { status: 400 });
        }
        updateData.next_appointment = d.toISOString();
        // Reset reminder_sent_at so a new reminder can be scheduled
        updateData.reminder_sent_at = null;
      } else {
        updateData.next_appointment = null;
        updateData.reminder_sent_at = null;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return Response.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const { error } = await adminClient
      .from("patient_sessions")
      .upsert(
        { patient_id: patientId, therapist_id: user.id, ...updateData },
        { onConflict: "patient_id" }
      );

    if (error) {
      console.error("[sessions PATCH]", error);
      return Response.json({ error: "Save failed" }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("[sessions PATCH] Unexpected:", err);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
