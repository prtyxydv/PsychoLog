"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";

export default function SessionPlanClient({ patientId, patientAlias }) {
  const [appointment, setAppointment] = useState("");   // datetime-local string
  const [notes, setNotes]             = useState("");
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [saved, setSaved]             = useState(false);
  const [apptSaved, setApptSaved]     = useState(false);
  const [reminderSent, setReminderSent] = useState(null);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [error, setError]             = useState(null);
  const noteTimer = useRef(null);

  // Load existing session plan
  useEffect(() => {
    fetch(`/api/sessions/${patientId}`)
      .then(r => r.json())
      .then(d => {
        if (d.next_appointment) {
          // Convert UTC ISO → local datetime-local format (YYYY-MM-DDTHH:MM)
          const local = new Date(d.next_appointment);
          const pad = n => String(n).padStart(2, "0");
          const localStr = `${local.getFullYear()}-${pad(local.getMonth()+1)}-${pad(local.getDate())}T${pad(local.getHours())}:${pad(local.getMinutes())}`;
          setAppointment(localStr);
        }
        setNotes(d.prep_notes || "");
        setReminderSent(d.reminder_sent_at);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [patientId]);

  // Auto-save notes with 1.5s debounce
  function handleNotesChange(val) {
    setNotes(val);
    setSaved(false);
    if (noteTimer.current) clearTimeout(noteTimer.current);
    noteTimer.current = setTimeout(() => saveNotes(val), 1500);
  }

  async function saveNotes(val) {
    setSaving(true);
    try {
      const res = await fetch(`/api/sessions/${patientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prep_notes: val }),
      });
      if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
    } catch (e) {
      console.error("Notes save failed:", e);
    } finally {
      setSaving(false);
    }
  }

  async function saveAppointment() {
    if (!appointment) return;
    setError(null);
    setApptSaved(false);

    // Validate: must be in the future
    if (new Date(appointment) <= new Date()) {
      setError("Appointment date must be in the future.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/sessions/${patientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ next_appointment: new Date(appointment).toISOString() }),
      });
      if (res.ok) {
        setApptSaved(true);
        setReminderSent(null); // reset since appointment changed
        setTimeout(() => setApptSaved(false), 3000);
      }
    } catch (e) {
      setError("Failed to save appointment. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function clearAppointment() {
    setSaving(true);
    try {
      await fetch(`/api/sessions/${patientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ next_appointment: null }),
      });
      setAppointment("");
      setReminderSent(null);
    } catch (e) {
      console.error("Clear failed:", e);
    } finally {
      setSaving(false);
    }
  }

  const apptDate = appointment ? new Date(appointment) : null;
  const isToday  = apptDate && apptDate.toDateString() === new Date().toDateString();
  const isSoon   = apptDate && (apptDate - new Date()) < 48 * 60 * 60 * 1000 && apptDate > new Date();

  return (
    <div style={{ padding: "48px", maxWidth: "700px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "40px" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--th-text)", marginBottom: "4px" }}>
          {patientAlias}
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--th-text-muted)" }}>
          Next Session Planning
        </p>
      </div>

      {loading ? (
        <div style={{ color: "var(--th-text-subtle)", padding: "40px", textAlign: "center" }}>Loading…</div>
      ) : (
        <>
          {/* ── Appointment Block ─────────────────────────────── */}
          <div className="th-card" style={{ marginBottom: "28px", padding: "28px" }}>
            <h2 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--th-text)", marginBottom: "4px", display: "flex", alignItems: "center", gap: "8px" }}>
              📅 Next Session Date & Time
            </h2>
            <p style={{ fontSize: "0.8rem", color: "var(--th-text-muted)", marginBottom: "20px" }}>
              A reminder email will automatically be sent to the patient <strong>24 hours before</strong> this appointment.
            </p>

            {/* Current appointment display */}
            {apptDate && (
              <div style={{
                padding: "12px 16px", borderRadius: "var(--radius-md)", marginBottom: "16px",
                background: isSoon ? "rgba(245,158,11,0.07)" : "var(--th-bg-secondary)",
                border: `1px solid ${isSoon ? "rgba(245,158,11,0.3)" : "var(--th-sidebar-border)"}`,
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: "0.95rem", color: "var(--th-text)" }}>
                    {apptDate.toLocaleString("en-US", { weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit" })}
                  </p>
                  <p style={{ fontSize: "0.75rem", marginTop: "3px", color: isSoon ? "#f59e0b" : "var(--th-text-subtle)" }}>
                    {isToday
                      ? "🔔 Today!"
                      : isSoon
                      ? "⏰ Coming up soon"
                      : reminderSent
                      ? `✅ Reminder sent ${new Date(reminderSent).toLocaleDateString("en-US")}`
                      : "⏳ Reminder will be sent 24h before"}
                  </p>
                </div>
                <button
                  onClick={clearAppointment}
                  style={{ background: "none", border: "none", color: "var(--th-text-subtle)", cursor: "pointer", fontSize: "0.75rem", padding: "4px 8px" }}
                >
                  Clear ✕
                </button>
              </div>
            )}

            {/* Date/time picker */}
            <div style={{ display: "flex", gap: "10px", alignItems: "flex-end", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: "200px" }}>
                <label style={{ fontSize: "0.75rem", color: "var(--th-text-subtle)", display: "block", marginBottom: "5px" }}>
                  {apptDate ? "Change appointment" : "Set appointment date & time"}
                </label>
                <input
                  type="datetime-local"
                  value={appointment}
                  onChange={e => { setAppointment(e.target.value); setError(null); }}
                  min={new Date().toISOString().slice(0, 16)}
                  style={{
                    width: "100%", padding: "10px 12px", borderRadius: "var(--radius-md)",
                    border: "1px solid var(--th-sidebar-border)",
                    background: "var(--th-bg)", color: "var(--th-text)",
                    fontSize: "0.875rem", fontFamily: "Inter, sans-serif", outline: "none",
                  }}
                />
              </div>
              <button
                onClick={saveAppointment}
                disabled={!appointment || saving}
                className="btn-th-primary"
                style={{ padding: "10px 20px", fontSize: "0.875rem", whiteSpace: "nowrap" }}
              >
                {saving ? "Saving…" : apptSaved ? "✓ Saved & Scheduled!" : "Save & Schedule Reminder"}
              </button>
            </div>

            {error && (
              <p style={{ marginTop: "8px", fontSize: "0.8rem", color: "#ef4444" }}>{error}</p>
            )}
            {apptSaved && (
              <p style={{ marginTop: "8px", fontSize: "0.8rem", color: "#22c55e" }}>
                ✓ Appointment saved. Reminder email will be sent to the patient 24 hours before.
              </p>
            )}
          </div>

          {/* ── Prep Notes Block ──────────────────────────────── */}
          <div className="th-card" style={{ padding: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <h2 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--th-text)" }}>
                🗒️ Session Prep Notes
              </h2>
              <span style={{ fontSize: "0.75rem", color: "var(--th-text-subtle)" }}>
                {saving ? "Saving…" : saved ? <span style={{ color: "#22c55e" }}>Auto-saved ✓</span> : ""}
              </span>
            </div>
            <p style={{ fontSize: "0.8rem", color: "var(--th-text-muted)", marginBottom: "16px" }}>
              Reminders, topics to cover, hypotheses, goals for this session. Not visible to the patient. Supports Markdown.
            </p>

            {isEditingNotes ? (
              <textarea
                autoFocus
                value={notes}
                onChange={e => handleNotesChange(e.target.value)}
                onBlur={() => { setIsEditingNotes(false); if (noteTimer.current) { clearTimeout(noteTimer.current); saveNotes(notes); } }}
                placeholder={`What do you want to cover in the next session?\n\nExamples:\n- Follow up on conflict with colleague\n- Introduce CBT thought record\n- [ ] Ask about sleep patterns\n- Goal: patient tries one coping strategy`}
                style={{
                  width: "100%", minHeight: "240px", padding: "16px",
                  background: "var(--th-bg)", border: "1px solid var(--th-accent)",
                  borderRadius: "var(--radius-md)", fontSize: "0.9rem",
                  color: "var(--th-text)", lineHeight: 1.8, resize: "vertical",
                  fontFamily: "Inter, sans-serif", outline: "none", boxSizing: "border-box",
                }}
              />
            ) : (
              <div
                onClick={() => setIsEditingNotes(true)}
                title="Click to edit"
                style={{
                  minHeight: "120px", padding: "16px",
                  background: "var(--th-bg)", border: "1px solid var(--th-sidebar-border)",
                  borderRadius: "var(--radius-md)", fontSize: "0.9rem",
                  color: notes ? "var(--th-text)" : "var(--th-text-subtle)",
                  lineHeight: 1.8, cursor: "text",
                }}
              >
                {notes
                  ? <ReactMarkdown>{notes}</ReactMarkdown>
                  : <span style={{ fontStyle: "italic" }}>Click to add session prep notes… (Markdown supported)</span>
                }
              </div>
            )}

            <p style={{ marginTop: "10px", fontSize: "0.72rem", color: "var(--th-text-subtle)" }}>
              🔒 Only you can see these notes. Auto-saves as you type.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
