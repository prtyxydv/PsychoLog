import { createAdminClient } from "@/lib/supabase/server";
import { createHmac, pbkdf2Sync, randomBytes } from "crypto";

const PIN_ITERATIONS = 100000;
const PIN_KEYLEN     = 64;
const PIN_DIGEST     = "sha512";

function hashPin(pin, salt) {
  return pbkdf2Sync(pin, salt, PIN_ITERATIONS, PIN_KEYLEN, PIN_DIGEST).toString("hex");
}

// ── SET PIN ─────────────────────────────────────────────────────
export async function POST(request) {
  try {
    const { token, pin } = await request.json();

    if (!token || !pin || !/^\d{4}$/.test(pin)) {
      return Response.json({ error: "Valid 4-digit PIN and token required" }, { status: 400 });
    }

    const adminClient = await createAdminClient();

    // Fetch patient by token
    const { data: patient, error } = await adminClient
      .from("patients")
      .select("id, pin_hash, invite_expires, is_active")
      .eq("invite_token", token)
      .single();

    if (error || !patient) {
      return Response.json({ error: "Invalid token" }, { status: 404 });
    }

    if (!patient.is_active || new Date(patient.invite_expires) < new Date()) {
      return Response.json({ error: "Link expired or inactive" }, { status: 403 });
    }

    // Only allow setting PIN once
    if (patient.pin_hash) {
      return Response.json({ error: "PIN already set. Use verify endpoint." }, { status: 409 });
    }

    // Hash and store
    const salt    = randomBytes(32).toString("hex");
    const hash    = hashPin(pin, salt);
    const pinHash = `${salt}:${hash}`;

    await adminClient
      .from("patients")
      .update({ pin_hash: pinHash })
      .eq("id", patient.id);

    // Issue a session token (signed HMAC — stored in cookie client-side)
    const sessionToken = issueSessionToken(patient.id);
    return Response.json({ success: true, sessionToken });

  } catch (err) {
    console.error("[pin/set] Error:", err);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}

// ── VERIFY PIN ───────────────────────────────────────────────────
export async function PUT(request) {
  try {
    const { token, pin } = await request.json();

    if (!token || !pin || !/^\d{4}$/.test(pin)) {
      return Response.json({ error: "Valid 4-digit PIN and token required" }, { status: 400 });
    }

    const adminClient = await createAdminClient();

    const { data: patient, error } = await adminClient
      .from("patients")
      .select("id, pin_hash, invite_expires, is_active")
      .eq("invite_token", token)
      .single();

    if (error || !patient) {
      return Response.json({ error: "Invalid token" }, { status: 404 });
    }

    if (!patient.is_active || new Date(patient.invite_expires) < new Date()) {
      return Response.json({ error: "Link expired or inactive" }, { status: 403 });
    }

    if (!patient.pin_hash) {
      return Response.json({ error: "PIN not set. Please set a PIN first." }, { status: 400 });
    }

    // Verify
    const [salt, storedHash] = patient.pin_hash.split(":");
    const attemptHash = hashPin(pin, salt);

    if (attemptHash !== storedHash) {
      return Response.json({ error: "Incorrect PIN", incorrect: true }, { status: 401 });
    }

    const sessionToken = issueSessionToken(patient.id);
    return Response.json({ success: true, sessionToken });

  } catch (err) {
    console.error("[pin/verify] Error:", err);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}

// ── HMAC session token ────────────────────────────────────────────
function issueSessionToken(patientId) {
  const secret  = process.env.SUPABASE_SERVICE_ROLE_KEY; // reuse as HMAC secret
  const payload = `${patientId}:${Date.now()}`;
  const sig     = createHmac("sha256", secret).update(payload).digest("hex");
  return `${Buffer.from(payload).toString("base64url")}.${sig}`;
}

export function verifySessionToken(token) {
  try {
    const [payloadB64, sig] = token.split(".");
    if (!payloadB64 || !sig) return null;
    const secret       = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const payload      = Buffer.from(payloadB64, "base64url").toString();
    const expectedSig  = createHmac("sha256", secret).update(payload).digest("hex");
    if (sig !== expectedSig) return null;
    const [patientId, ts] = payload.split(":");
    // Token valid for 24 hours
    if (Date.now() - parseInt(ts) > 24 * 60 * 60 * 1000) return null;
    return patientId;
  } catch {
    return null;
  }
}
