"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils";
import PsychologLogo from "@/components/ui/PsychologLogo";

export default function HomeClient({ profile, unreadPatients, upcomingSessions }) {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const firstName = profile?.full_name?.split(" ")[0] ?? "Doctor";

  function getTimeOfDay() {
    const h = new Date().getHours();
    if (h < 12) return "morning";
    if (h < 17) return "afternoon";
    return "evening";
  }

  if (!mounted) return null; // Hydration fix

  return (
    <div className="therapist-view" style={{ minHeight: "100vh", background: "var(--th-bg)", color: "var(--th-text)", display: "flex", flexDirection: "column" }}>
      {/* Navbar */}
      <nav style={{ padding: "24px 48px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <PsychologLogo width={32} height={32} />
          <span style={{ fontWeight: 700, fontSize: "1.2rem", letterSpacing: "-0.02em" }}>PsychoLog</span>
        </div>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <Link href="/dashboard" className="btn-th-primary" style={{ textDecoration: "none", padding: "10px 24px", fontSize: "0.9rem" }}>
            Open Workspace →
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ flex: 1, padding: "48px", maxWidth: "1200px", margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        
        {/* Header section with Clock */}
        <div className="animate-fade-in-up" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "64px" }}>
          <div>
            <h1 style={{ fontSize: "2.5rem", fontWeight: 700, letterSpacing: "-0.03em", marginBottom: "8px" }}>
              Good {getTimeOfDay()}, {firstName}.
            </h1>
            <p style={{ fontSize: "1.1rem", color: "var(--th-text-muted)" }}>
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "4.5rem", fontWeight: 800, letterSpacing: "-0.04em", fontFamily: "monospace", lineHeight: 1 }}>
              {time.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
            </div>
            <div style={{ color: "var(--th-accent)", fontWeight: 600, fontSize: "1.1rem", marginTop: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Current Time
            </div>
          </div>
        </div>

        {/* Actionable Panels */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "24px" }}>
          
          {/* Upcoming Sessions */}
          <div className="th-card animate-fade-in-up delay-100" style={{ padding: "32px", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
              <span style={{ fontSize: "1.5rem" }}>🗓️</span>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Upcoming Sessions</h3>
            </div>
            
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
              {upcomingSessions.length === 0 ? (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--th-text-subtle)", fontSize: "0.95rem" }}>
                  No sessions scheduled in the next 7 days.
                </div>
              ) : (
                upcomingSessions.map(session => (
                  <Link 
                    href={`/dashboard/patient/${session.patient_id}/session`} 
                    key={session.id}
                    style={{ textDecoration: "none", padding: "16px", borderRadius: "12px", background: "var(--th-bg-secondary)", border: "1px solid var(--th-sidebar-border)", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all 0.2s ease" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "var(--th-accent)"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "var(--th-sidebar-border)"}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--th-text)", fontSize: "1rem" }}>{session.patients?.display_alias || "Patient"}</div>
                      <div style={{ fontSize: "0.85rem", color: "var(--th-accent)", marginTop: "4px", fontWeight: 500 }}>
                        {new Date(session.next_appointment).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                      </div>
                    </div>
                    <div style={{ color: "var(--th-text-subtle)" }}>→</div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Action Required: Unread Logs */}
          <div className="th-card animate-fade-in-up delay-200" style={{ padding: "32px", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
              <span style={{ fontSize: "1.5rem" }}>📬</span>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Unread Patient Logs</h3>
            </div>
            
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
              {unreadPatients.length === 0 ? (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--th-text-subtle)", fontSize: "0.95rem" }}>
                  All caught up! No unread logs.
                </div>
              ) : (
                unreadPatients.map(p => (
                  <Link 
                    href={`/dashboard/patient/${p.id}`} 
                    key={p.id}
                    style={{ textDecoration: "none", padding: "16px", borderRadius: "12px", background: "rgba(248, 113, 113, 0.08)", border: "1px solid rgba(248, 113, 113, 0.2)", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all 0.2s ease" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(248, 113, 113, 0.6)"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(248, 113, 113, 0.2)"}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--th-text)", fontSize: "1rem", display: "flex", alignItems: "center", gap: "8px" }}>
                        {p.display_alias}
                        <span style={{ background: "#ef4444", color: "#fff", padding: "2px 6px", borderRadius: "999px", fontSize: "0.7rem", fontWeight: 800 }}>{p.unread_count} new</span>
                      </div>
                      <div style={{ fontSize: "0.85rem", color: "var(--th-text-muted)", marginTop: "4px" }}>
                        Last updated {p.last_log_at ? formatRelativeTime(p.last_log_at) : "Recently"}
                      </div>
                    </div>
                    <div style={{ color: "var(--th-text-subtle)" }}>→</div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Account & Subscription */}
          <div className="th-card animate-fade-in-up delay-300" style={{ padding: "32px", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
              <span style={{ fontSize: "1.5rem" }}>💳</span>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Subscription Plan</h3>
            </div>
            
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px", justifyContent: "center" }}>
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "16px", borderBottom: "1px solid var(--th-border)" }}>
                <span style={{ color: "var(--th-text-muted)" }}>Current Tier</span>
                <span style={{ color: "var(--th-accent)", fontWeight: 800, textTransform: "capitalize" }}>{profile?.subscription_tier || "Free"}</span>
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--th-text-subtle)", lineHeight: 1.6 }}>
                Need more limits or premium features? Upgrade to a pro plan via Lemon Squeezy to get unlimited session ingestion.
              </p>
              <Link 
                href="/dashboard/billing" 
                className="btn-th-secondary"
                style={{ textAlign: "center", padding: "12px", textDecoration: "none", marginTop: "auto" }}
              >
                Manage Subscription
              </Link>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
