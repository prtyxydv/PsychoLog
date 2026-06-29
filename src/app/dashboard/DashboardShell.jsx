"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import InviteModal from "@/components/ui/InviteModal";
import { formatRelativeTime } from "@/lib/utils";

/* ── Inline SVG logo — always renders, no /public dependency ── */
function PsychologLogo({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
      <path d="M130 60 C130 35 112 18 90 18 C68 18 50 35 48 58 C46 78 54 95 62 108 C66 115 68 122 68 130 L68 148 C68 152 71 155 75 155 L105 155 C109 155 112 152 112 148 L112 142 C120 138 128 130 132 120 C136 110 135 85 130 60 Z" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M72 75 C72 68 78 62 86 64 C90 65 93 69 92 74 C91 78 87 80 83 79 C79 78 76 74 78 70" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M86 64 C90 58 98 57 103 62 C107 66 107 72 103 76 C99 80 93 80 90 76" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M103 62 C109 58 116 60 118 67 C120 73 116 79 110 80 C106 81 103 78 103 74" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M78 80 C74 85 74 92 79 96 C84 100 91 99 94 94 C97 89 95 83 90 80" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M94 94 C96 99 102 102 108 100 C114 97 116 91 113 86 C110 81 104 80 100 83" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M113 86 C118 84 122 79 121 73" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M48 80 C42 82 38 88 39 95 C40 102 46 106 52 104" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

export default function DashboardShell({ profile, initialPatients = [], children }) {
  const [showInvite, setShowInvite]   = useState(false);
  const [patients, setPatients]       = useState(initialPatients);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter]           = useState("All");
  const [isDark, setIsDark]           = useState(false);

  const pathname = usePathname();
  const router   = useRouter();
  const supabase = createClient();

  // Extract patient ID from URL if we are on a patient page
  const selectedId = pathname.match(/\/dashboard\/patient\/([^/]+)/)?.[1] || null;

  /* ── Theme: default light, only go dark if user explicitly chose it ── */
  useEffect(() => {
    const stored = localStorage.getItem("psycholog-theme");
    const dark = stored === "dark"; // default = light
    setIsDark(dark);
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("psycholog-theme", isDark ? "dark" : "light");
  }, [isDark]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
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
        {/* ══════════════════════════════════
            SIDEBAR
        ══════════════════════════════════ */}
        <aside className="th-sidebar">
          {/* Logo */}
          <Link
            href="/dashboard"
            style={{
              padding: "16px",
              borderBottom: "1px solid var(--th-sidebar-border)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              textDecoration: "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "34px", height: "34px", borderRadius: "9px",
                background: "linear-gradient(135deg, #0d9488, #2dd4bf)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "white", flexShrink: 0,
                boxShadow: "0 2px 8px rgba(13,148,136,0.25)",
              }}>
                <PsychologLogo size={22} />
              </div>
              <span style={{ fontWeight: 800, fontSize: "0.95rem", letterSpacing: "-0.025em", color: "var(--th-text)" }}>
                PsychoLog
              </span>
            </div>
            {/* Theme toggle */}
            <button
              className="theme-toggle"
              onClick={e => { e.preventDefault(); setIsDark(d => !d); }}
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? "☀️" : "🌙"}
            </button>
          </Link>

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
                  {p.unread > 0 && (
                    <span className="unread-badge">{p.unread}</span>
                  )}
                </Link>
              ))
            )}
          </div>

          {/* Utility nav links */}
          <div style={{ padding: "8px 12px 4px", borderTop: "1px solid var(--th-sidebar-border)" }}>
            <Link
              href="/dashboard/notes"
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "8px 10px", borderRadius: "var(--radius-sm)",
                textDecoration: "none", fontSize: "0.8rem",
                color: pathname === "/dashboard/notes" ? "var(--th-accent)" : "var(--th-text-muted)",
                background: pathname === "/dashboard/notes" ? "var(--th-accent-soft)" : "transparent",
                fontWeight: 500, marginBottom: "2px",
                transition: "background 0.15s ease, color 0.15s ease",
              }}
            >
              📝 My Notes
            </Link>
            <Link
              href="/dashboard/billing"
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "8px 10px", borderRadius: "var(--radius-sm)",
                textDecoration: "none", fontSize: "0.8rem",
                color: pathname === "/dashboard/billing" ? "var(--th-accent)" : "var(--th-text-muted)",
                background: pathname === "/dashboard/billing" ? "var(--th-accent-soft)" : "transparent",
                fontWeight: 500, marginBottom: "2px",
                transition: "background 0.15s ease, color 0.15s ease",
              }}
            >
              💳 Billing
            </Link>
            <Link
              href="/dashboard/legal"
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "8px 10px", borderRadius: "var(--radius-sm)",
                textDecoration: "none", fontSize: "0.8rem",
                color: pathname === "/dashboard/legal" ? "var(--th-accent)" : "var(--th-text-muted)",
                background: pathname === "/dashboard/legal" ? "var(--th-accent-soft)" : "transparent",
                fontWeight: 500,
                transition: "background 0.15s ease, color 0.15s ease",
              }}
            >
              ⚖️ Legal
            </Link>
            {profile?.is_admin && (
              <Link
                href="/admin"
                style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  padding: "8px 10px", borderRadius: "var(--radius-sm)",
                  textDecoration: "none", fontSize: "0.8rem",
                  color: "#fff",
                  background: "var(--th-accent)",
                  fontWeight: 700,
                  marginTop: "16px",
                  transition: "opacity 0.15s ease",
                }}
              >
                🛠️ Admin Panel
              </Link>
            )}

            <button
              onClick={handleLogout}
              style={{
                display: "flex", alignItems: "center", gap: "8px", width: "100%",
                padding: "8px 10px", borderRadius: "var(--radius-sm)",
                border: "none", background: "transparent", cursor: "pointer",
                fontSize: "0.8rem", color: "#DC2626", fontWeight: 500,
                marginTop: "16px", transition: "background 0.15s ease",
                fontFamily: "Inter, sans-serif",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(220,38,38,0.07)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              🚪 Sign Out
            </button>
          </div>

          {/* New Patient button */}
          <div style={{ padding: "12px", borderTop: "1px solid var(--th-sidebar-border)" }}>
            <button
              className="btn-th-primary"
              style={{ width: "100%", fontSize: "0.8125rem", padding: "9px" }}
              onClick={() => setShowInvite(true)}
            >
              + New Patient
            </button>
          </div>
        </aside>

        {/* ══════════════════════════════════
            MAIN CANVAS (Routed Content)
        ══════════════════════════════════ */}
        <main className="th-main" style={{ flex: 1, height: "100vh", overflowY: "auto" }}>
          {children}
        </main>
      </div>
    </>
  );
}
