"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SessionPlanClient({ patientId, patientAlias, patientCreatedAt, patientFolder }) {
  const pathname = usePathname();
  const activeTab = pathname.endsWith("/session") ? "session" : "timeline";

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
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.error || "Failed to auto-save notes.");
      }
    } catch (e) {
      console.error("Notes save failed:", e);
      setError("Network error while saving notes.");
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
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.error || "Failed to save appointment.");
      }
    } catch (e) {
      setError("Failed to save appointment. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function clearAppointment() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/sessions/${patientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ next_appointment: null }),
      });
      if (res.ok) {
        setAppointment("");
        setReminderSent(null);
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.error || "Failed to clear appointment.");
      }
    } catch (e) {
      console.error("Clear failed:", e);
      setError("Network error while clearing appointment.");
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--th-text)", marginBottom: "6px" }}>
            {patientAlias}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <p style={{ fontSize: "0.875rem", color: "var(--th-text-muted)" }}>
              Next Session Planning
            </p>
          </div>
        </div>
      </div>

      {/* Tab bar / Navigation Cards */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "32px", flexWrap: "wrap" }}>
        {[
          { 
            id: "timeline",
            label: "Patient Timeline", 
            desc: "View past check-ins, AI summaries, and your notes",
            icon: "📋",
            href: `/dashboard/patient/${patientId}` 
          },
          { 
            id: "session",
            label: "Session Prep", 
            desc: "Review insights and generate a plan for the next visit",
            icon: "📅",
            href: `/dashboard/patient/${patientId}/session` 
          },
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              style={{
                flex: "1 1 250px",
                display: "flex", alignItems: "flex-start", gap: "16px",
                padding: "20px", borderRadius: "12px",
                textDecoration: "none",
                background: isActive ? "var(--th-accent-soft)" : "var(--th-bg-secondary)",
                border: `2px solid ${isActive ? "var(--th-accent)" : "var(--th-sidebar-border)"}`,
                transition: "all 0.2s ease",
                boxShadow: isActive ? "var(--th-shadow-sm)" : "none",
                cursor: "pointer",
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = "var(--th-text-subtle)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = "var(--th-sidebar-border)";
                  e.currentTarget.style.transform = "none";
                }
              }}
            >
              <div style={{ fontSize: "1.8rem", opacity: isActive ? 1 : 0.7, filter: isActive ? "none" : "grayscale(100%)" }}>
                {tab.icon}
              </div>
              <div>
                <div style={{ 
                  fontSize: "1.05rem", fontWeight: 700, letterSpacing: "-0.01em",
                  color: isActive ? "var(--th-accent)" : "var(--th-text)",
                  marginBottom: "4px"
                }}>
                  {tab.label}
                </div>
                <div style={{ 
                  fontSize: "0.8125rem", 
                  color: isActive ? "var(--th-accent)" : "var(--th-text-subtle)",
                  opacity: isActive ? 0.85 : 1,
                  lineHeight: 1.5 
                }}>
                  {tab.desc}
                </div>
              </div>
            </Link>
          );
        })}
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
