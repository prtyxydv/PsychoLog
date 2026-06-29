"use client";

import { useEffect, useState } from "react";

export default function DashboardHomeClient({ profile, stats }) {
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

  if (!mounted) return null; // Avoid hydration mismatch for time

  return (
    <>
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

      {stats.total === 0 ? (
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
        /* Screensaver / Therapist Overview */
        <div className="animate-fade-in" style={{
          display: "flex", flexDirection: "column", gap: "24px",
          marginTop: "12px", marginBottom: "32px"
        }}>
          {/* Clock & Status */}
          <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
            <div className="th-card" style={{ flex: "1 1 300px", padding: "40px 32px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: "linear-gradient(135deg, var(--th-accent-soft), transparent)" }}>
              <div style={{ fontSize: "3.5rem", fontWeight: 800, color: "var(--th-text)", letterSpacing: "-0.04em", fontFamily: "monospace" }}>
                {time.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
              </div>
              <p style={{ color: "var(--th-text-muted)", fontSize: "0.95rem", fontWeight: 500, marginTop: "8px" }}>
                Ready for your next session
              </p>
            </div>

            <div className="th-card" style={{ flex: "1 1 300px", padding: "32px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <h3 style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--th-text-subtle)", fontWeight: 700, marginBottom: "20px" }}>
                Account Overview
              </h3>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", paddingBottom: "16px", borderBottom: "1px solid var(--th-sidebar-border)" }}>
                <span style={{ color: "var(--th-text-muted)", fontSize: "0.9rem" }}>Member Since</span>
                <span style={{ color: "var(--th-text)", fontWeight: 600, fontSize: "0.9rem" }}>
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "Recently"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--th-text-muted)", fontSize: "0.9rem" }}>Subscription</span>
                <span style={{ color: "var(--th-accent)", fontWeight: 800, fontSize: "0.9rem", textTransform: "capitalize" }}>
                  {profile?.subscription_tier || "Free"} Tier
                </span>
              </div>
            </div>
          </div>
          
          {/* To-Do / Notification stub */}
          <div className="th-card" style={{ padding: "32px" }}>
             <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--th-text)", marginBottom: "16px" }}>Next Actions</h3>
             {stats.unread > 0 ? (
               <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "20px", background: "rgba(248, 113, 113, 0.08)", borderRadius: "var(--radius-md)", border: "1px solid rgba(248, 113, 113, 0.2)" }}>
                 <span style={{ fontSize: "1.8rem" }}>📬</span>
                 <div>
                   <p style={{ margin: 0, fontWeight: 700, color: "var(--th-text)", fontSize: "1rem" }}>You have {stats.unread} unread patient logs.</p>
                   <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--th-text-muted)", marginTop: "4px" }}>Review them before your next sessions to stay fully informed.</p>
                 </div>
               </div>
             ) : (
               <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "20px", background: "var(--th-bg-secondary)", borderRadius: "var(--radius-md)" }}>
                 <span style={{ fontSize: "1.8rem" }}>✅</span>
                 <div>
                   <p style={{ margin: 0, fontWeight: 700, color: "var(--th-text)", fontSize: "1rem" }}>All caught up!</p>
                   <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--th-text-muted)", marginTop: "4px" }}>You have no unread check-ins at the moment.</p>
                 </div>
               </div>
             )}
          </div>
        </div>
      )}

      {/* Stats row */}
      {stats.total > 0 && (
        <div
          className="animate-fade-in-up delay-200"
          style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}
        >
          {[
            { label: "Total patients", value: stats.total },
            { label: "Unread logs", value: stats.unread },
            { label: "Active this week", value: stats.activeThisWeek },
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
    </>
  );
}
