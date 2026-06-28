"use client";

import { useState } from "react";

const inputStyle = {
  width: "100%",
  padding: "9px 12px",
  background: "var(--th-bg-secondary)",
  border: "1px solid var(--th-border)",
  borderRadius: "var(--radius-sm)",
  fontSize: "0.875rem",
  color: "var(--th-text)",
  outline: "none",
  fontFamily: "Inter, sans-serif",
  boxSizing: "border-box",
  transition: "border-color var(--duration-fast) var(--ease-calm), box-shadow var(--duration-fast) var(--ease-calm)",
};

const labelStyle = {
  display: "block",
  fontSize: "0.8125rem",
  fontWeight: 500,
  color: "var(--th-text)",
  marginBottom: "6px",
};

export default function InviteModal({ onClose, onSuccess }) {
  const [email, setEmail]       = useState("");
  const [expires, setExpires]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [done, setDone]         = useState(null); // { alias, link }

  // Min date = tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res  = await fetch("/api/invite", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, expiresAt: expires }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.error === "LIMIT_REACHED") {
          setError("LIMIT_REACHED");
        } else {
          setError(data.error || "Something went wrong. Please try again.");
        }
        setLoading(false);
        return;
      }

      setDone(data.patient);
      onSuccess?.(data.patient);
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  }

  function copyLink() {
    if (done?.link) {
      navigator.clipboard.writeText(done.link);
    }
  }

  return (
    /* ── Backdrop ── */
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position:        "fixed",
        inset:           0,
        zIndex:          100,
        background:      "rgba(28,25,23,0.55)",
        backdropFilter:  "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "center",
        padding:         "20px",
      }}
    >
      {/* ── Modal card ── */}
      <div
        className="animate-fade-in-up th-card"
        style={{
          width:    "100%",
          maxWidth: "460px",
          padding:  "32px",
        }}
      >
        {/* ── Success state ── */}
        {done ? (
          <div style={{ textAlign: "center" }}>
            <div className="animate-confetti" style={{ fontSize: "2.5rem", marginBottom: "16px" }}>📧</div>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--th-text)", marginBottom: "8px" }}>
              Invite sent!
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--th-text-muted)", marginBottom: "24px", lineHeight: 1.6 }}>
              <strong style={{ color: "var(--th-text)" }}>{done.alias}</strong> has been created.
              An invite email is on its way. You can also copy the link below.
            </p>

            {/* Link box */}
            <div
              style={{
                background:   "var(--th-bg-secondary)",
                border:       "1px solid var(--th-border)",
                borderRadius: "var(--radius-sm)",
                padding:      "10px 14px",
                display:      "flex",
                alignItems:   "center",
                gap:          "10px",
                marginBottom: "20px",
                textAlign:    "left",
              }}
            >
              <code style={{ flex: 1, fontSize: "0.73rem", color: "var(--th-text-muted)", wordBreak: "break-all" }}>
                {done.link}
              </code>
              <button
                id="btn-copy-invite-link"
                onClick={copyLink}
                style={{
                  flexShrink:   0,
                  padding:      "5px 12px",
                  background:   "var(--th-accent-soft)",
                  border:       "none",
                  borderRadius: "4px",
                  fontSize:     "0.75rem",
                  fontWeight:   600,
                  color:        "var(--th-accent)",
                  cursor:       "pointer",
                  fontFamily:   "Inter, sans-serif",
                }}
              >
                Copy
              </button>
            </div>

            <button id="btn-invite-done" className="btn-th-primary" style={{ width: "100%" }} onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          /* ── Form state ── */
          <>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
              <div>
                <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--th-text)", marginBottom: "4px" }}>
                  Invite a patient
                </h2>
                <p style={{ fontSize: "0.8rem", color: "var(--th-text-muted)" }}>
                  They&apos;ll receive a private link by email.
                </p>
              </div>
              <button
                id="btn-close-invite-modal"
                onClick={onClose}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "var(--th-text-subtle)", fontSize: "1.25rem",
                  lineHeight: 1, padding: "2px 6px",
                }}
              >
                ✕
              </button>
            </div>

            {/* Error */}
            {error === "LIMIT_REACHED" ? (
              <div
                style={{
                  padding: "16px", background: "rgba(245,158,11,0.1)",
                  border: "1px solid rgba(245,158,11,0.3)", borderRadius: "var(--radius-sm)",
                  marginBottom: "20px", textAlign: "center"
                }}
              >
                <div style={{ fontSize: "2rem", marginBottom: "8px" }}>🛑</div>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--th-text)", marginBottom: "4px" }}>Patient Limit Reached</h3>
                <p style={{ fontSize: "0.85rem", color: "var(--th-text-muted)", marginBottom: "16px", lineHeight: 1.5 }}>
                  You have reached the maximum number of active patients for your current plan.
                </p>
                <a href="/dashboard/billing" className="btn-th-primary" style={{ display: "inline-block", padding: "8px 16px", textDecoration: "none", fontSize: "0.85rem" }}>
                  View Upgrade Options
                </a>
              </div>
            ) : error ? (
              <div
                style={{
                  padding: "10px 14px", background: "#FEF2F2",
                  border: "1px solid #FECACA", borderRadius: "var(--radius-sm)",
                  fontSize: "0.8125rem", color: "#DC2626", marginBottom: "16px",
                }}
              >
                {error}
              </div>
            ) : null}

            {error !== "LIMIT_REACHED" && (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                {/* Email */}
                <div>
                  <label htmlFor="invite-email" style={labelStyle}>Patient&apos;s email address</label>
                  <input
                    id="invite-email"
                    type="email"
                    required
                    placeholder="patient@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = "var(--th-accent)"; e.target.style.boxShadow = "0 0 0 3px var(--th-accent-soft)"; }}
                    onBlur={e => { e.target.style.borderColor = "var(--th-border)"; e.target.style.boxShadow = "none"; }}
                  />
                </div>

                {/* Therapy end date */}
                <div>
                  <label htmlFor="invite-expires" style={labelStyle}>
                    Therapy end date
                    <span style={{ fontWeight: 400, color: "var(--th-text-subtle)", marginLeft: "6px" }}>
                      (link expires on this date)
                    </span>
                  </label>
                  <input
                    id="invite-expires"
                    type="date"
                    required
                    min={minDate}
                    value={expires}
                    onChange={e => setExpires(e.target.value)}
                    style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = "var(--th-accent)"; e.target.style.boxShadow = "0 0 0 3px var(--th-accent-soft)"; }}
                    onBlur={e => { e.target.style.borderColor = "var(--th-border)"; e.target.style.boxShadow = "none"; }}
                  />
                  <p style={{ fontSize: "0.72rem", color: "var(--th-text-subtle)", marginTop: "5px" }}>
                    The patient&apos;s link will stop working after this date.
                  </p>
                </div>

                {/* Privacy note */}
                <div
                  style={{
                    padding: "12px 14px",
                    background: "var(--th-accent-soft)",
                    border: "1px solid rgba(245,158,11,0.2)",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "0.78rem",
                    color: "var(--th-text-muted)",
                    lineHeight: 1.6,
                  }}
                >
                  🔒 Your patient will be assigned a random alias (e.g. <em>Patient-Alpha-7</em>). Their real name and email are never linked to their clinical logs.
                </div>

                {/* Buttons */}
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    id="btn-cancel-invite"
                    type="button"
                    onClick={onClose}
                    className="btn-th-secondary"
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </button>
                  <button
                    id="btn-send-invite"
                    type="submit"
                    disabled={loading}
                    className="btn-th-primary"
                    style={{ flex: 2, opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
                  >
                    {loading ? "Sending…" : "Send Invite →"}
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
