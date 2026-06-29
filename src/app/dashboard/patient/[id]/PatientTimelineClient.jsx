"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { formatRelativeTime, getMoodMeta } from "@/lib/utils";
import { generatePatientRecordDocx } from "@/lib/exportDocx";
import ReactMarkdown from "react-markdown";

const MOOD_EMOJI = ["😞","😟","😕","😐","🙂","😊","😄","😁","🤩","🌟"];

function getMoodDotColor(score) {
  if (!score) return "var(--th-text-subtle)";
  if (score >= 7) return "#22c55e"; // green
  if (score >= 4) return "#f59e0b"; // amber
  return "#ef4444"; // red
}

// ── Folder Label ──────────────────────────────────────────────
function FolderLabel({ patientId, initialFolder }) {
  const [folder, setFolder]     = useState(initialFolder || "General");
  const [editing, setEditing]   = useState(false);
  const [draft, setDraft]       = useState(folder);
  const [saving, setSaving]     = useState(false);

  async function save() {
    const trimmed = draft.trim() || "General";
    setEditing(false);
    if (trimmed === folder) return;
    setSaving(true);
    try {
      await fetch(`/api/patients/${patientId}/folder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder_name: trimmed }),
      });
      setFolder(trimmed);
    } catch (e) {
      console.error("Folder save failed:", e);
    } finally {
      setSaving(false);
    }
  }

  return editing ? (
    <div style={{ position: "relative", display: "inline-block" }}>
      <input
        autoFocus
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={save}
        onKeyDown={e => { if (e.key === "Enter") save(); if (e.key === "Escape") { setEditing(false); setDraft(folder); } }}
        maxLength={80}
        placeholder="Enter a folder name..."
        style={{
          fontSize: "0.75rem", padding: "4px 12px", borderRadius: "999px",
          border: "1px solid var(--th-accent)", background: "var(--th-bg-secondary)",
          color: "var(--th-text)", fontFamily: "Inter, sans-serif", outline: "none",
          width: "180px", boxShadow: "0 0 0 2px var(--th-accent-soft)"
        }}
      />
      <span style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", fontSize: "0.6rem", color: "var(--th-text-subtle)" }}>
        ⏎
      </span>
    </div>
  ) : (
    <button
      onClick={() => { setDraft(folder); setEditing(true); }}
      title="Click to organize patient into a folder"
      style={{
        display: "inline-flex", alignItems: "center", gap: "6px",
        fontSize: "0.75rem", fontWeight: 600, padding: "4px 12px",
        borderRadius: "999px", border: "1px dashed var(--th-accent)",
        background: "var(--th-accent-soft)", color: saving ? "var(--th-text-subtle)" : "var(--th-accent)",
        cursor: "pointer", fontFamily: "Inter, sans-serif", letterSpacing: "0.02em",
        transition: "all 0.15s ease",
      }}
      onMouseEnter={e => { e.currentTarget.style.borderStyle = "solid"; }}
      onMouseLeave={e => { e.currentTarget.style.borderStyle = "dashed"; }}
    >
      <span>📁 {folder === "General" ? "Assign Folder" : `Folder: ${folder}`}</span>
      <span style={{ fontSize: "0.8rem", opacity: 0.7 }}>✎</span>
    </button>
  );
}

// ── Log Card ──────────────────────────────────────────────────
function LogCard({ log, onSaveNote, onMarkRead }) {
  const [note, setNote]       = useState(log.therapist_notes || "");
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isRead, setIsRead]   = useState(log.is_read ?? true);

  const moodColor = getMoodMeta(log.mood_score).color;
  const dotColor  = getMoodDotColor(log.mood_score);

  // Auto session label from date
  const sessionLabel = `Session — ${new Date(log.submitted_at).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  })}`;

  async function handleSave() {
    setIsEditing(false);
    if (note === log.therapist_notes) return;
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch(`/api/notes/${log.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: note }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        onSaveNote(log.id, note);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  // Parse AI summary — split on the 💬 marker
  const summaryParts = log.ai_summary
    ? log.ai_summary.split("💬").map(s => s.trim())
    : [null, ""];
  const bullets = summaryParts[0];
  const prompt  = summaryParts[1] ? `💬 ${summaryParts[1]}` : "";

  return (
    <div className="th-card animate-fade-in-up" style={{ marginBottom: "24px", position: "relative", border: !isRead ? "1px solid rgba(34,211,238,0.25)" : undefined }}
      onClick={() => { if (!isRead) { setIsRead(true); onMarkRead && onMarkRead(log.id); } }}
    >
      {/* Date & Mood */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", paddingBottom: "16px", borderBottom: "1px solid var(--th-sidebar-border)" }}>
        <div>
          <p style={{ fontWeight: 600, fontSize: "0.95rem", color: "var(--th-text)" }}>
            {new Date(log.submitted_at).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--th-text-subtle)", marginTop: "2px" }}>
            {formatRelativeTime(log.submitted_at)}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {!isRead && (
            <span style={{
              fontSize: "0.62rem", fontWeight: 900, letterSpacing: "0.06em",
              color: "#000", background: "#22d3ee",
              padding: "2px 8px", borderRadius: "999px",
            }}>UNREAD</span>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "var(--th-bg-secondary)", padding: "4px 12px", borderRadius: "999px", border: "1px solid var(--th-sidebar-border)" }}>
            <span style={{ fontSize: "1.2rem" }}>{MOOD_EMOJI[(log.mood_score ?? 5) - 1]}</span>
            <span style={{ fontWeight: 700, fontSize: "0.85rem", color: moodColor }}>{log.mood_score ?? "?"}/10</span>
          </div>
        </div>
      </div>

      {/* Crisis Banner */}
      {log.crisis_detected && (
        <div style={{ padding: "12px", background: "rgba(239,68,68,0.05)", borderLeft: "3px solid #ef4444", borderRadius: "4px", marginBottom: "16px" }}>
          <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "#ef4444", margin: 0 }}>🚨 Crisis language detected in this log</p>
        </div>
      )}

      {/* AI Summary */}
      <div style={{ marginBottom: "24px" }}>
        <h4 style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--th-text-subtle)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "10px" }}>
          AI Session Summary
        </h4>
        {bullets ? (
          <div style={{ fontSize: "0.875rem", color: "var(--th-text)", lineHeight: 1.7 }}>
            <ReactMarkdown>{bullets}</ReactMarkdown>
          </div>
        ) : (
          <p style={{ fontSize: "0.85rem", color: "var(--th-text-subtle)", fontStyle: "italic" }}>No AI summary for this entry.</p>
        )}
        {prompt && (
          <div style={{ marginTop: "16px", padding: "12px", background: "var(--th-bg-secondary)", borderRadius: "var(--radius-md)", fontSize: "0.85rem", color: "var(--th-text)", border: "1px solid var(--th-sidebar-border)" }}>
            <ReactMarkdown>{prompt}</ReactMarkdown>
          </div>
        )}
      </div>

      {/* Session Notes */}
      <div>
        <h4 style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--th-text-subtle)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>{sessionLabel} — Notes</span>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            {saved && <span style={{ color: "var(--pt-teal)", textTransform: "none", fontWeight: 500 }}>Saved ✓</span>}
            {saving && <span style={{ color: "var(--th-text-subtle)", textTransform: "none" }}>Saving…</span>}
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                style={{ background: "none", border: "none", color: "var(--th-accent)", fontSize: "0.75rem", cursor: "pointer", fontWeight: 600 }}
              >
                Edit Notes
              </button>
            )}
          </div>
        </h4>
        {isEditing ? (
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            onBlur={handleSave}
            autoFocus
            placeholder="Add clinical notes, hypotheses, or plan for next session… (Markdown supported)"
            style={{
              width: "100%", minHeight: "120px", padding: "12px",
              background: "var(--th-bg)", border: "1px solid var(--th-accent)",
              borderRadius: "var(--radius-md)", fontSize: "0.875rem",
              color: "var(--th-text)", lineHeight: 1.6, resize: "vertical",
              fontFamily: "Inter, sans-serif", outline: "none", boxSizing: "border-box",
            }}
          />
        ) : (
          <div
            onClick={() => setIsEditing(true)}
            style={{
              width: "100%", minHeight: "44px", padding: "12px",
              background: "var(--th-bg)", border: "1px solid var(--th-sidebar-border)",
              borderRadius: "var(--radius-md)", fontSize: "0.875rem",
              color: note ? "var(--th-text)" : "var(--th-text-subtle)",
              lineHeight: 1.6, cursor: "pointer",
            }}
          >
            {note ? <ReactMarkdown>{note}</ReactMarkdown> : "Click to add session notes…"}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Mood Legend ───────────────────────────────────────────────
function MoodLegend() {
  return (
    <div style={{ display: "flex", gap: "16px", marginBottom: "32px", flexWrap: "wrap" }}>
      {[
        { color: "#22c55e", label: "Positive (7–10)" },
        { color: "#f59e0b", label: "Moderate (4–6)" },
        { color: "#ef4444", label: "Low (1–3)" },
      ].map(({ color, label }) => (
        <div key={label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: color, border: "2px solid var(--th-bg)", boxShadow: `0 0 0 1px ${color}` }} />
          <span style={{ fontSize: "0.72rem", color: "var(--th-text-subtle)" }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Main Export ───────────────────────────────────────────────
export default function PatientTimelineClient({ patient, initialLogs }) {
  const [logs, setLogs]       = useState(initialLogs);
  const [exporting, setExporting] = useState(false);

  const pathname = usePathname();
  const activeTab = pathname.endsWith("/session") ? "session" : "timeline";

  // Mark all logs as read when timeline is opened — only run once on mount
  useEffect(() => {
    const unreadIds = initialLogs.filter(l => !l.is_read).map(l => l.id);
    if (unreadIds.length > 0) {
      fetch(`/api/patients/${patient.id}/mark-read`, { method: "PATCH" })
        .then(res => {
          if (res.ok) {
            setLogs(prev => prev.map(l => ({ ...l, is_read: true })));
          }
        })
        .catch(console.error);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patient.id]);

  function handleMarkRead(logId) {
    setLogs(prev => prev.map(l => l.id === logId ? { ...l, is_read: true } : l));
  }

  function handleSaveNote(logId, newNote) {
    setLogs(prev => prev.map(l => l.id === logId ? { ...l, therapist_notes: newNote } : l));
  }

  async function handleExport() {
    setExporting(true);
    try {
      const blob = await generatePatientRecordDocx(patient, logs);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `PsychoLog_${patient.display_alias.replace(/\s+/g, "_")}_Record.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export failed:", e);
      alert("Failed to export DOCX.");
    } finally {
      setExporting(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Are you sure you want to permanently delete ${patient.display_alias} and all their logs? This cannot be undone.`)) {
      return;
    }
    
    try {
      const res = await fetch(`/api/patients/${patient.id}/delete`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      
      // Redirect back to dashboard upon deletion
      window.location.href = "/dashboard";
    } catch (err) {
      console.error(err);
      alert("Failed to delete patient.");
    }
  }

  const unreadCount = logs.filter(l => !l.is_read).length;

  return (
    <div style={{ padding: "48px", maxWidth: "800px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--th-text)", marginBottom: "6px" }}>
            {patient.display_alias}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <p style={{ fontSize: "0.875rem", color: "var(--th-text-muted)" }}>
              Joined {new Date(patient.created_at).toLocaleDateString("en-US")}
            </p>
            <FolderLabel patientId={patient.id} initialFolder={patient.folder_name} />
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={handleExport}
            disabled={exporting || logs.length === 0}
            className="btn-th-primary"
            style={{ padding: "8px 16px", fontSize: "0.8125rem", background: "var(--th-bg-secondary)", color: "var(--th-text)", border: "1px solid var(--th-sidebar-border)", flexShrink: 0 }}
          >
            {exporting ? "Preparing Export…" : "↓ Export Records (.docx)"}
          </button>
          <button
            onClick={handleDelete}
            style={{ 
              padding: "8px 16px", fontSize: "0.8125rem", background: "rgba(239, 68, 68, 0.1)", 
              color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "6px", 
              cursor: "pointer", fontWeight: 600, flexShrink: 0 
            }}
          >
            Delete Patient
          </button>
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
            href: `/dashboard/patient/${patient.id}` 
          },
          { 
            id: "session",
            label: "Session Prep", 
            desc: "Review insights and generate a plan for the next visit",
            icon: "📅",
            href: `/dashboard/patient/${patient.id}/session` 
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

      {/* Unread banner */}
      {unreadCount > 0 && (
        <div style={{
          padding: "12px 18px", borderRadius: "10px", marginBottom: "20px",
          background: "rgba(34,211,238,0.07)", border: "1px solid rgba(34,211,238,0.25)",
          display: "flex", alignItems: "center", gap: "10px",
        }}>
          <span style={{ fontSize: "1.1rem" }}>📬</span>
          <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "#22d3ee" }}>
            {unreadCount} unread log{unreadCount > 1 ? "s" : ""}
          </span>
          <span style={{ fontSize: "0.82rem", color: "var(--th-text-muted)" }}>— cards glow cyan, marked read on open</span>
        </div>
      )}

      {/* Mood Legend */}
      <MoodLegend />


      {/* Timeline */}
      <div style={{ position: "relative" }}>
        {/* Vertical line */}
        <div style={{ position: "absolute", left: "16px", top: "24px", bottom: "24px", width: "2px", background: "var(--th-sidebar-border)", zIndex: 0 }} />

        {logs.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--th-text-subtle)", background: "var(--th-bg-secondary)", borderRadius: "var(--radius-lg)", position: "relative", zIndex: 1 }}>
            <p style={{ fontSize: "0.9rem" }}>No check-ins from {patient.display_alias} yet.</p>
          </div>
        ) : (
          logs.map(log => (
            <div key={log.id} style={{ display: "flex", gap: "24px", position: "relative", zIndex: 1 }}>
              {/* Mood-coloured timeline dot — ring in cyan if unread */}
              <div style={{ width: "34px", flexShrink: 0, display: "flex", justifyContent: "center" }}>
                <div style={{
                  width: "14px", height: "14px", borderRadius: "50%",
                  background: getMoodDotColor(log.mood_score),
                  border: "2px solid var(--th-bg)",
                  marginTop: "24px", zIndex: 2,
                  boxShadow: log.is_read
                    ? `0 0 0 2px ${getMoodDotColor(log.mood_score)}40`
                    : `0 0 0 3px #22d3ee, 0 0 8px #22d3ee80`,
                  transition: "box-shadow 0.3s ease",
                }} />
              </div>

              <div style={{ flex: 1 }}>
                <LogCard log={log} onSaveNote={handleSaveNote} onMarkRead={handleMarkRead} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
