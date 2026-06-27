"use client";

import { useState } from "react";
import Link from "next/link";
import InviteModal from "@/components/ui/InviteModal";
import { formatRelativeTime, getMoodMeta } from "@/lib/utils";

export default function DashboardClient({ profile, initialPatients = [] }) {
  const [showInvite, setShowInvite]   = useState(false);
  const [patients, setPatients]       = useState(initialPatients);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter]           = useState("All");
  const [selectedId, setSelectedId]   = useState(null);

  const firstName = profile?.full_name?.split(" ")[0] ?? "Doctor";

  function getTimeOfDay() {
    const h = new Date().getHours();
    if (h < 12) return "morning";
    if (h < 17) return "afternoon";
    return "evening";
  }

  function handleInviteSuccess(newPatient) {
    setPatients(prev => [
      {
        id:           newPatient.id,
        display_alias: newPatient.alias,
        created_at:   new Date().toISOString(),
        unread:       0,
        last_log_at:  null,
      },
      ...prev,
    ]);
  }

  const filteredPatients = patients.filter(p => {
    const matchSearch = p.display_alias.toLowerCase().includes(searchQuery.toLowerCase());
    if (filter === "Unread") return matchSearch && p.unread > 0;
    if (filter === "Recent") {
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      return matchSearch && p.last_log_at && new Date(p.last_log_at) > oneDayAgo;
    }
    return matchSearch;
  });

  return (
    <>
      {/* ── Invite modal ── */}
      {showInvite && (
        <InviteModal
          onClose={() => setShowInvite(false)}
          onSuccess={handleInviteSuccess}
        />
      )}

      <div data-view="therapist" style={{ display: "flex", minHeight: "100vh" }}>
        {/* ══════════════════════════════════
            SIDEBAR
        ══════════════════════════════════ */}
        <aside className="th-sidebar">
          {/* Logo */}
          <div
            style={{
              padding: "20px 16px 16px",
              borderBottom: "1px solid var(--th-sidebar-border)",
              display: "flex", alignItems: "center", gap: "8px",
            }}
          >
            <div
              style={{
                width: "30px", height: "30px", borderRadius: "8px",
                background: "linear-gradient(135deg, var(--th-accent), #FCD34D)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "14px", flexShrink: 0,
              }}
            >
              🧠
            </div>
            <span style={{ fontWeight: 700, fontSize: "0.9rem", letterSpacing: "-0.02em", color: "var(--th-text)" }}>
              PsychoLog
            </span>
          </div>

          {/* Search + filters */}
          <div style={{ padding: "14px 12px 8px" }}>
            <div style={{ position: "relative", marginBottom: "10px" }}>
              <svg
                style={{ position: "absolute", left: "9px", top: "50%", transform: "translateY(-50%)", color: "var(--th-text-subtle)", pointerEvents: "none" }}
                width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              >
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                id="patient-search"
                className="th-search"
                placeholder="Search patients…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Status filters */}
            <div style={{ display: "flex", gap: "4px" }}>
              {["All", "Unread", "Recent"].map(f => (
                <button
                  key={f}
                  id={`filter-${f.toLowerCase()}`}
                  onClick={() => setFilter(f)}
                  style={{
                    flex: 1, padding: "4px 0",
                    fontSize: "0.7rem", fontWeight: 600,
                    borderRadius: "4px", border: "none", cursor: "pointer",
                    fontFamily: "Inter, sans-serif", letterSpacing: "0.02em",
                    background: filter === f ? "var(--th-accent-soft)" : "transparent",
                    color:      filter === f ? "var(--th-accent)"      : "var(--th-text-subtle)",
                    transition: "background var(--duration-fast) var(--ease-calm), color var(--duration-fast) var(--ease-calm)",
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Patient list */}
          <div style={{ flex: 1, overflowY: "auto", padding: "4px 8px" }}>
            {filteredPatients.length === 0 ? (
              <div
                style={{
                  padding: "28px 12px", textAlign: "center",
                  color: "var(--th-text-subtle)", fontSize: "0.8rem", lineHeight: 1.7,
                }}
              >
                <div style={{ fontSize: "1.4rem", marginBottom: "8px" }}>
                  {searchQuery ? "🔍" : "👥"}
                </div>
                {searchQuery
                  ? `No patients matching "${searchQuery}"`
                  : "No patients yet.\nClick below to invite your first patient."}
              </div>
            ) : (
              filteredPatients.map(p => (
                <Link
                  key={p.id}
                  href={`/dashboard/patient/${p.id}`}
                  className="th-nav-item"
                  style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "10px 12px", borderRadius: "var(--radius-sm)",
                    marginBottom: "2px", textDecoration: "none",
                    background: selectedId === p.id ? "var(--th-accent-soft)" : "transparent",
                    color: selectedId === p.id ? "var(--th-accent)" : "var(--th-text)",
                  }}
                  onClick={() => setSelectedId(p.id)}
                >
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: "0.8125rem", fontWeight: 500, margin: 0, truncate: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                      {p.display_alias}
                    </p>
                    {p.last_log_at && (
                      <p style={{ fontSize: "0.7rem", color: "var(--th-text-subtle)", margin: 0 }}>
                        {formatRelativeTime(p.last_log_at)}
                      </p>
                    )}
                  </div>
                  {p.unread > 0 && (
                    <span className="unread-badge">{p.unread}</span>
                  )}
                </Link>
              ))
            )}
          </div>

          {/* New Patient button */}
          <div style={{ padding: "12px", borderTop: "1px solid var(--th-sidebar-border)" }}>
            <button
              id="btn-new-patient"
              className="btn-th-primary"
              style={{ width: "100%", fontSize: "0.8125rem", padding: "9px" }}
              onClick={() => setShowInvite(true)}
            >
              + New Patient
            </button>
          </div>
        </aside>

        {/* ══════════════════════════════════
            MAIN CANVAS
        ══════════════════════════════════ */}
        <main className="th-main" style={{ padding: "48px", flex: 1 }}>
          {/* Greeting */}
          <div className="animate-fade-in" style={{ marginBottom: "40px" }}>
            <h1
              style={{
                fontSize: "1.6rem", fontWeight: 700,
                letterSpacing: "-0.025em", color: "var(--th-text)", marginBottom: "4px",
              }}
            >
              Good {getTimeOfDay()}, {firstName}.
            </h1>
            <p style={{ fontSize: "0.875rem", color: "var(--th-text-muted)" }}>
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>

          {/* Content: empty state or select patient prompt */}
          {patients.length === 0 ? (
            /* Onboarding cards */
            <div
              className="animate-fade-in-up"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "16px",
                marginBottom: "32px",
              }}
            >
              {[
                { step: "01", icon: "📧", title: "Invite your first patient", desc: "Click '+ New Patient' in the sidebar. Enter their email and therapy end date." },
                { step: "02", icon: "📋", title: "They complete a check-in", desc: "Your patient receives a private link and submits their log in under 30 seconds." },
                { step: "03", icon: "🤖", title: "AI summary appears here", desc: "PsychoLog processes the log and generates a 3-bullet summary for your review." },
              ].map(({ step, icon, title, desc }) => (
                <div key={step} className="th-card" style={{ padding: "24px", position: "relative", overflow: "hidden" }}>
                  <div
                    style={{
                      position: "absolute", top: "16px", right: "16px",
                      fontSize: "0.65rem", fontWeight: 700,
                      color: "var(--th-text-subtle)", letterSpacing: "0.06em",
                    }}
                  >
                    STEP {step}
                  </div>
                  <div style={{ fontSize: "1.5rem", marginBottom: "12px" }}>{icon}</div>
                  <h3 style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--th-text)", marginBottom: "6px" }}>{title}</h3>
                  <p style={{ fontSize: "0.8rem", color: "var(--th-text-muted)", lineHeight: 1.6 }}>{desc}</p>
                </div>
              ))}
            </div>
          ) : (
            /* "Select a patient" prompt */
            <div
              className="animate-fade-in"
              style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", minHeight: "300px", textAlign: "center",
                color: "var(--th-text-subtle)",
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "12px" }}>←</div>
              <p style={{ fontSize: "0.9rem" }}>Select a patient from the sidebar to view their timeline.</p>
            </div>
          )}

          {/* Stats row */}
          {patients.length > 0 && (
            <div
              className="animate-fade-in-up delay-200"
              style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}
            >
              {[
                { label: "Total patients", value: patients.length },
                { label: "Unread logs", value: patients.reduce((a, p) => a + (p.unread || 0), 0) },
                { label: "Active this week", value: patients.filter(p => p.last_log_at && Date.now() - new Date(p.last_log_at) < 7 * 86400000).length },
              ].map(({ label, value }) => (
                <div key={label} className="th-card" style={{ padding: "16px 20px", minWidth: "140px" }}>
                  <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--th-text)", letterSpacing: "-0.02em" }}>
                    {value}
                  </p>
                  <p style={{ fontSize: "0.75rem", color: "var(--th-text-muted)", marginTop: "2px" }}>{label}</p>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
