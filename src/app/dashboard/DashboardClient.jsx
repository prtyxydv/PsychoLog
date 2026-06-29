"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import InviteModal from "@/components/ui/InviteModal";
import { formatRelativeTime } from "@/lib/utils";

/* ── Logo: inline SVG so it always renders, colors adapt to theme ── */
function PsychologLogo({ size = 28 }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 200 200" fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", flexShrink: 0 }}
    >
      <path d="M130 60 C130 35 112 18 90 18 C68 18 50 35 48 58 C46 78 54 95 62 108 C66 115 68 122 68 130 L68 148 C68 152 71 155 75 155 L105 155 C109 155 112 152 112 148 L112 142 C120 138 128 130 132 120 C136 110 135 85 130 60 Z"
        stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M72 75 C72 68 78 62 86 64 C90 65 93 69 92 74 C91 78 87 80 83 79 C79 78 76 74 78 70"
        stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M86 64 C90 58 98 57 103 62 C107 66 107 72 103 76 C99 80 93 80 90 76"
        stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M103 62 C109 58 116 60 118 67 C120 73 116 79 110 80 C106 81 103 78 103 74"
        stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M78 80 C74 85 74 92 79 96 C84 100 91 99 94 94 C97 89 95 83 90 80"
        stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M94 94 C96 99 102 102 108 100 C114 97 116 91 113 86 C110 81 104 80 100 83"
        stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M113 86 C118 84 122 79 121 73" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M48 80 C42 82 38 88 39 95 C40 102 46 106 52 104" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

export default function DashboardClient({ profile, initialPatients = [] }) {
  const [showInvite, setShowInvite]   = useState(false);
  const [patients, setPatients]       = useState(initialPatients);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter]           = useState("All");
  const [selectedId, setSelectedId]   = useState(null);
  const [isDark, setIsDark]           = useState(false);

  const firstName = profile?.full_name?.split(" ")[0] ?? "Doctor";

  function getTimeOfDay() {
    const h = new Date().getHours();
    if (h < 12) return "morning";
    if (h < 17) return "afternoon";
    return "evening";
  }

  /* ── Theme: default light, respect manual override ── */
  useEffect(() => {
    const stored = localStorage.getItem("psycholog-theme");
    // Default: light. Only go dark if user explicitly set it.
    const dark = stored === "dark";
    setIsDark(dark);
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, []);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    if (next) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    localStorage.setItem("psycholog-theme", next ? "dark" : "light");
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
      {showInvite && (
        <InviteModal
          onClose={() => setShowInvite(false)}
          onSuccess={handleInviteSuccess}
        />
      )}

      <div data-view="therapist" style={{ display: "flex", minHeight: "100vh" }}>
        {/* ══════════════════════════════════ SIDEBAR ══════════════════════════════════ */}
        <aside className="th-sidebar">
          {/* Logo row */}
          <div style={{
            padding: "14px 16px",
            borderBottom: "1px solid var(--th-sidebar-border)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
              <div style={{
                width: "34px", height: "34px", borderRadius: "9px",
                background: "linear-gradient(135deg, #0d9488, #2dd4bf)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "white", flexShrink: 0,
                boxShadow: "0 2px 8px rgba(13,148,136,0.3)",
              }}>
                <PsychologLogo size={22} />
              </div>
              <span style={{ fontWeight: 800, fontSize: "0.95rem", letterSpacing: "-0.025em", color: "var(--th-text)" }}>
                PsychoLog
              </span>
            </Link>

            {/* Dark / Light toggle */}
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? "☀️" : "🌙"}
            </button>
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
                    transition: "background 0.15s, color 0.15s",
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
              <div style={{ padding: "28px 12px", textAlign: "center", color: "var(--th-text-subtle)", fontSize: "0.8rem", lineHeight: 1.7 }}>
                <div style={{ fontSize: "1.4rem", marginBottom: "8px" }}>{searchQuery ? "🔍" : "👥"}</div>
                {searchQuery ? `No patients matching "${searchQuery}"` : "No patients yet.\nClick below to invite your first patient."}
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
                    <p style={{ fontSize: "0.8125rem", fontWeight: 500, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.display_alias}
                    </p>
                    {p.last_log_at && (
                      <p style={{ fontSize: "0.7rem", color: "var(--th-text-subtle)", margin: 0 }}>
                        {formatRelativeTime(p.last_log_at)}
                      </p>
                    )}
                  </div>
                  {p.unread > 0 && <span className="unread-badge">{p.unread}</span>}
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

        {/* ══════════════════════════════════ MAIN CANVAS ══════════════════════════════════ */}
        <main className="th-main" style={{ padding: "48px", flex: 1 }}>
          {/* Greeting */}
          <div className="animate-fade-in" style={{ marginBottom: "40px" }}>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--th-text)", marginBottom: "4px" }}>
              Good {getTimeOfDay()}, {firstName}.
            </h1>
            <p style={{ fontSize: "0.875rem", color: "var(--th-text-muted)" }}>
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>

          {/* Onboarding or select prompt */}
          {patients.length === 0 ? (
            <div className="animate-fade-in-up" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginBottom: "32px" }}>
              {[
                { step: "01", icon: "📧", title: "Invite your first patient", desc: "Click '+ New Patient' in the sidebar. Enter their email and therapy end date." },
                { step: "02", icon: "📋", title: "They complete a check-in", desc: "Your patient receives a private link and submits their log in under 30 seconds." },
                { step: "03", icon: "🤖", title: "AI summary appears here", desc: "PsychoLog processes the log and generates a 3-bullet summary for your review." },
              ].map(({ step, icon, title, desc }) => (
                <div key={step} className="th-card" style={{ padding: "24px", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: "16px", right: "16px", fontSize: "0.65rem", fontWeight: 700, color: "var(--th-text-subtle)", letterSpacing: "0.06em" }}>
                    STEP {step}
                  </div>
                  <div style={{ fontSize: "1.5rem", marginBottom: "12px" }}>{icon}</div>
                  <h3 style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--th-text)", marginBottom: "6px" }}>{title}</h3>
                  <p style={{ fontSize: "0.8rem", color: "var(--th-text-muted)", lineHeight: 1.6 }}>{desc}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "300px", textAlign: "center", color: "var(--th-text-subtle)" }}>
              <div style={{ fontSize: "2rem", marginBottom: "12px" }}>←</div>
              <p style={{ fontSize: "0.9rem" }}>Select a patient from the sidebar to view their timeline.</p>
            </div>
          )}

          {/* Stats row */}
          {patients.length > 0 && (
            <div className="animate-fade-in-up delay-200" style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              {[
                { label: "Total patients", value: patients.length },
                { label: "Unread logs",    value: patients.reduce((a, p) => a + (p.unread || 0), 0) },
                { label: "Active this week", value: patients.filter(p => p.last_log_at && Date.now() - new Date(p.last_log_at) < 7 * 86400000).length },
              ].map(({ label, value }) => (
                <div key={label} className="th-card" style={{ padding: "16px 20px", minWidth: "140px" }}>
                  <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--th-accent)", letterSpacing: "-0.02em" }}>{value}</p>
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
