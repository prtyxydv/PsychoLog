"use client";

import { useEffect, useState } from "react";

export default function DashboardHomeClient({ profile, stats }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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
