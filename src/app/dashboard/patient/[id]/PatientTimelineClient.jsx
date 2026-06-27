"use client";

import { useState } from "react";
import { formatRelativeTime, getMoodMeta } from "@/lib/utils";
import { generatePatientRecordDocx } from "@/lib/exportDocx";
import ReactMarkdown from "react-markdown";

const MOOD_EMOJI = ["😞","😟","😕","😐","🙂","😊","😄","😁","🤩","🌟"];

function LogCard({ log, onSaveNote }) {
  const [note, setNote] = useState(log.therapist_notes || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const moodColor = getMoodMeta(log.mood_score).color;

  async function handleSave() {
    setIsEditing(false);
    if (note === log.therapist_notes) return;
    setSaving(true);
    setSaved(false);
    
    // Call API to save note
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

  // Parse AI summary (3 bullets + 1 prompt)
  const summaryParts = log.ai_summary 
    ? log.ai_summary.split("💬").map(s => s.trim())
    : ["No summary available.", ""];
  
  const bullets = summaryParts[0];
  const prompt  = summaryParts[1] ? `💬 ${summaryParts[1]}` : "";

  return (
    <div className="th-card animate-fade-in-up" style={{ marginBottom: "24px", position: "relative" }}>
      {/* Date & Mood Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", paddingBottom: "16px", borderBottom: "1px solid var(--th-sidebar-border)" }}>
        <div>
          <p style={{ fontWeight: 600, fontSize: "0.95rem", color: "var(--th-text)" }}>
            {new Date(log.submitted_at).toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--th-text-subtle)", marginTop: "2px" }}>
            {formatRelativeTime(log.submitted_at)}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "var(--th-bg-secondary)", padding: "4px 12px", borderRadius: "999px", border: "1px solid var(--th-sidebar-border)" }}>
          <span style={{ fontSize: "1.2rem" }}>{MOOD_EMOJI[log.mood_score - 1]}</span>
          <span style={{ fontWeight: 700, fontSize: "0.85rem", color: moodColor }}>{log.mood_score}/10</span>
        </div>
      </div>

      {log.crisis_detected && (
        <div style={{ padding: "12px", background: "rgba(239, 68, 68, 0.05)", borderLeft: "3px solid #ef4444", borderRadius: "4px", marginBottom: "16px" }}>
          <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "#ef4444", margin: 0 }}>🚨 Crisis language detected in this log</p>
        </div>
      )}

      {/* AI Summary Section */}
      <div style={{ marginBottom: "24px" }}>
        <h4 style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--th-text-subtle)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "10px" }}>
          AI Session Summary
        </h4>
        <div style={{ fontSize: "0.875rem", color: "var(--th-text)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
          <ReactMarkdown>{bullets}</ReactMarkdown>
        </div>
        {prompt && (
          <div style={{ marginTop: "16px", padding: "12px", background: "var(--th-bg-secondary)", borderRadius: "var(--radius-md)", fontSize: "0.85rem", color: "var(--th-text)", border: "1px solid var(--th-sidebar-border)" }}>
            <strong>{prompt.split("**")[1] || "Consider exploring:"}</strong> {prompt.split("**")[2] || prompt.replace("💬 **Consider exploring:**", "")}
          </div>
        )}
      </div>

      {/* Therapist Notes Section */}
      <div>
        <h4 style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--th-text-subtle)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Your Notes (Encrypted)</span>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            {saved && <span style={{ color: "var(--pt-teal)", textTransform: "none" }}>Saved ✓</span>}
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
            placeholder="Add clinical notes, hypotheses, or plan for next session..."
            style={{
              width: "100%", minHeight: "100px", padding: "12px",
              background: "var(--th-bg)", border: "1px solid var(--th-sidebar-border)",
              borderRadius: "var(--radius-md)", fontSize: "0.875rem",
              color: "var(--th-text)", lineHeight: 1.6, resize: "vertical",
              fontFamily: "Inter, sans-serif"
            }}
          />
        ) : (
          <div 
            onClick={() => setIsEditing(true)}
            style={{
              width: "100%", minHeight: "40px", padding: "12px",
              background: "var(--th-bg)", border: "1px solid var(--th-sidebar-border)",
              borderRadius: "var(--radius-md)", fontSize: "0.875rem",
              color: note ? "var(--th-text)" : "var(--th-text-subtle)", lineHeight: 1.6,
              cursor: "pointer"
            }}
            className="prose prose-sm dark:prose-invert max-w-none"
          >
            {note ? (
              <ReactMarkdown>{note}</ReactMarkdown>
            ) : (
              "Click to add notes..."
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PatientTimelineClient({ patient, initialLogs }) {
  const [logs, setLogs] = useState(initialLogs);
  const [exporting, setExporting] = useState(false);

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

  return (
    <div style={{ padding: "48px", maxWidth: "800px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "40px" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--th-text)", marginBottom: "4px" }}>
            {patient.display_alias}
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--th-text-muted)" }}>
            Joined {new Date(patient.created_at).toLocaleDateString("en-US")}
          </p>
        </div>
        
        <button
          onClick={handleExport}
          disabled={exporting || logs.length === 0}
          className="btn-th-primary"
          style={{ padding: "8px 16px", fontSize: "0.8125rem", background: "var(--th-bg-secondary)", color: "var(--th-text)", border: "1px solid var(--th-sidebar-border)" }}
        >
          {exporting ? "Preparing Export..." : "↓ Export Records (.docx)"}
        </button>
      </div>

      {/* Timeline */}
      <div style={{ position: "relative" }}>
        {/* Vertical line connecting cards */}
        <div style={{ position: "absolute", left: "16px", top: "24px", bottom: "24px", width: "2px", background: "var(--th-sidebar-border)", zIndex: 0 }} />

        {logs.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--th-text-subtle)", background: "var(--th-bg-secondary)", borderRadius: "var(--radius-lg)", position: "relative", zIndex: 1 }}>
            <p style={{ fontSize: "0.9rem" }}>No check-ins from {patient.display_alias} yet.</p>
          </div>
        ) : (
          logs.map(log => (
            <div key={log.id} style={{ display: "flex", gap: "24px", position: "relative", zIndex: 1 }}>
              {/* Timeline Dot */}
              <div style={{ width: "34px", flexShrink: 0, display: "flex", justifyContent: "center" }}>
                <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "var(--th-bg)", border: "2px solid var(--th-accent)", marginTop: "24px", zIndex: 2 }} />
              </div>
              
              <div style={{ flex: 1 }}>
                <LogCard log={log} onSaveNote={handleSaveNote} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
