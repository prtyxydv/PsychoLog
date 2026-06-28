"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";

export default function GeneralNotesClient() {
  const [content, setContent]   = useState("");
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const saveTimer = useRef(null);

  // Load on mount
  useEffect(() => {
    fetch("/api/general-notes")
      .then(r => r.json())
      .then(d => { setContent(d.content || ""); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Auto-save with 1.5s debounce
  function handleChange(val) {
    setContent(val);
    setSaved(false);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => persistNote(val), 1500);
  }

  async function persistNote(val) {
    setSaving(true);
    try {
      const res = await fetch("/api/general-notes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: val }),
      });
      if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
    } catch (e) {
      console.error("Note save failed:", e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ padding: "48px", maxWidth: "800px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--th-text)" }}>
            📝 My Notes
          </h1>
          <div style={{ fontSize: "0.8rem", color: "var(--th-text-subtle)" }}>
            {loading ? "Loading…" : saving ? "Saving…" : saved ? <span style={{ color: "#22c55e" }}>Saved ✓</span> : isEditing ? "Auto-saves on pause" : ""}
          </div>
        </div>
        <p style={{ fontSize: "0.875rem", color: "var(--th-text-muted)", lineHeight: 1.6 }}>
          Your private workspace — billing reminders, session prep, supervision notes. Not linked to any patient. Supports Markdown.
        </p>
      </div>

      {/* Editor / Viewer */}
      {loading ? (
        <div style={{ color: "var(--th-text-subtle)", padding: "40px", textAlign: "center" }}>Loading your notes…</div>
      ) : isEditing ? (
        <textarea
          autoFocus
          value={content}
          onChange={e => handleChange(e.target.value)}
          onBlur={() => { setIsEditing(false); if (saveTimer.current) { clearTimeout(saveTimer.current); persistNote(content); } }}
          placeholder={`Write your private notes here...\n\nTips:\n# Heading\n**Bold** _Italic_\n- Bullet list\n- [ ] Checkbox\n\nAuto-saves as you type.`}
          style={{
            width: "100%", minHeight: "60vh", padding: "20px",
            background: "var(--th-bg)", border: "1px solid var(--th-accent)",
            borderRadius: "var(--radius-md)", fontSize: "0.9rem",
            color: "var(--th-text)", lineHeight: 1.8, resize: "vertical",
            fontFamily: "Inter, sans-serif", outline: "none",
            boxSizing: "border-box",
          }}
        />
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          title="Click to edit"
          style={{
            minHeight: "60vh", padding: "20px",
            background: "var(--th-bg)", border: "1px solid var(--th-sidebar-border)",
            borderRadius: "var(--radius-md)", fontSize: "0.9rem",
            color: content ? "var(--th-text)" : "var(--th-text-subtle)",
            lineHeight: 1.8, cursor: "text",
          }}
        >
          {content ? (
            <div style={{ color: "var(--th-text)" }}>
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          ) : (
            <span style={{ fontStyle: "italic" }}>Click here to start writing your notes… (Markdown supported)</span>
          )}
        </div>
      )}

      {/* Hint */}
      <p style={{ marginTop: "12px", fontSize: "0.75rem", color: "var(--th-text-subtle)" }}>
        🔒 Only you can see these notes. They are stored securely and isolated to your account.
      </p>
    </div>
  );
}
