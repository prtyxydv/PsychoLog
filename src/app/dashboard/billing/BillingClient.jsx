"use client";

import { useState } from "react";

const PLANS = [
  {
    name: "Free Beta",
    price: "Free",
    badge: "CURRENT",
    badgeColor: "#22c55e",
    desc: "Everything you need to get started. For beta testing, please use completely fake names and dummy emails for your clients.",
    features: [
      "Up to 5 active patients",
      "AI session summaries",
      "Real-time crisis alerts",
      "Encrypted therapist notes",
      "Export records (.docx)",
    ],
    cta: null,
  },
  {
    name: "Basic",
    price: "$15/month",
    badge: "WAITLIST",
    badgeColor: "#6366f1",
    desc: "Perfect for part-time practices or those just getting started.",
    features: [
      "Up to 15 active patients",
      "Everything in Free Beta",
      "Standard support",
      "Educational Use Only (No PHI)",
    ],
    cta: "Join Waitlist",
  },
  {
    name: "Pro",
    price: "$29/month",
    badge: "WAITLIST",
    badgeColor: "#f59e0b",
    desc: "For growing practices that need more capacity and deeper insights.",
    features: [
      "Up to 50 active patients",
      "Everything in Basic",
      "Priority AI processing",
      "Advanced mood analytics",
      "Educational Use Only (No PHI)",
    ],
    cta: "Join Waitlist",
  },
  {
    name: "Elite",
    price: "$50/month",
    badge: "WAITLIST",
    badgeColor: "#ec4899",
    desc: "For full-time professionals handling high-volume caseloads.",
    features: [
      "Unlimited active patients",
      "Everything in Pro",
      "Dedicated account manager",
      "Early access to new features",
      "Educational Use Only (No PHI)",
    ],
    cta: "Join Waitlist",
  },
];

export default function BillingClient({ profile, statusParam }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(
    statusParam === "success"
      ? "🎉 Payment successful! Your plan has been upgraded."
      : statusParam === "cancelled"
      ? "Payment was cancelled. You have not been charged."
      : null
  );

  const [showWaitlist, setShowWaitlist] = useState(false);
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("pro");

  async function handleUpgrade(planName) {
    setSelectedPlan(planName.toLowerCase());
    setShowWaitlist(true);
  }

  async function handleWaitlistSubmit(e) {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: waitlistEmail, plan: selectedPlan })
      });
      
      if (!res.ok) throw new Error("Failed to join waitlist");
      
      setWaitlistSuccess(true);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  const subStatus = profile?.subscription_status ?? "free";
  const verificationStatus = profile?.verification_status ?? "pending";

  return (
    <div style={{ padding: "48px", maxWidth: "860px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "40px" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--th-text)", marginBottom: "6px" }}>
          💳 Billing & Subscription
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--th-text-muted)" }}>
          Manage your plan, view what's included, and upgrade when you're ready.
        </p>
      </div>

      {/* Status Banner */}
      {message && (
        <div style={{
          padding: "12px 16px", borderRadius: "var(--radius-md)", marginBottom: "32px",
          background: message.startsWith("🎉") ? "rgba(34,197,94,0.08)" : "rgba(245,158,11,0.08)",
          border: `1px solid ${message.startsWith("🎉") ? "#22c55e40" : "#f59e0b40"}`,
          fontSize: "0.875rem", color: "var(--th-text)",
        }}>
          {message}
        </div>
      )}

      {/* Account Info */}
      <div className="th-card" style={{ marginBottom: "32px", padding: "20px 24px", display: "flex", gap: "32px", flexWrap: "wrap" }}>
        <div>
          <p style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--th-text-subtle)", marginBottom: "4px" }}>Account</p>
          <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--th-text)" }}>{profile?.email}</p>
        </div>
        <div>
          <p style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--th-text-subtle)", marginBottom: "4px" }}>Plan</p>
          <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--th-text)", textTransform: "capitalize" }}>{subStatus === "free" ? "Free Beta" : subStatus}</p>
        </div>
        <div>
          <p style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--th-text-subtle)", marginBottom: "4px" }}>Verification</p>
          <p style={{
            fontWeight: 600, fontSize: "0.9rem", textTransform: "capitalize",
            color: verificationStatus === "verified" ? "#22c55e" : verificationStatus === "rejected" ? "#ef4444" : "#f59e0b",
          }}>
            {verificationStatus === "verified" ? "✓ Verified" : verificationStatus === "rejected" ? "✗ Rejected" : "⏳ Pending Review"}
          </p>
        </div>
      </div>

      {/* Pricing Plans */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
        {PLANS.map(plan => (
          <div
            key={plan.name}
            className="th-card"
            style={{
              padding: "28px",
              border: plan.name === "Pro" ? "1px solid var(--th-accent)" : "1px solid var(--th-sidebar-border)",
              position: "relative",
            }}
          >
            {/* Badge */}
            <div style={{
              position: "absolute", top: "16px", right: "16px",
              fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.08em",
              color: plan.badgeColor, background: `${plan.badgeColor}18`,
              padding: "2px 8px", borderRadius: "999px", border: `1px solid ${plan.badgeColor}40`,
            }}>
              {plan.badge}
            </div>

            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--th-text)", marginBottom: "4px" }}>{plan.name}</h2>
            <p style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--th-text)", letterSpacing: "-0.03em", marginBottom: "8px" }}>{plan.price}</p>
            <p style={{ fontSize: "0.82rem", color: "var(--th-text-muted)", marginBottom: "20px", lineHeight: 1.5 }}>{plan.desc}</p>

            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px 0" }}>
              {plan.features.map(f => (
                <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "8px", fontSize: "0.85rem", color: "var(--th-text)" }}>
                  <span style={{ color: "#22c55e", fontWeight: 700, flexShrink: 0, marginTop: "1px" }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>

            {plan.cta && (
              <button
                onClick={() => handleUpgrade(plan.name)}
                disabled={loading}
                className="btn-th-primary"
                style={{ width: "100%", padding: "10px", fontSize: "0.875rem" }}
              >
                {loading ? "Redirecting…" : plan.cta}
              </button>
            )}
          </div>
        ))}
      </div>

      <p style={{ marginTop: "24px", fontSize: "0.75rem", color: "var(--th-text-subtle)", lineHeight: 1.6 }}>
        PsychoLog is currently in private beta. Stripe payments will go live once we complete our beta program. Early beta users may receive extended free access as a thank-you.
      </p>

      {/* Waitlist & Legal Modal */}
      {showWaitlist && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div className="th-card" style={{ padding: "32px", maxWidth: "480px", width: "100%", position: "relative" }}>
            <button onClick={() => setShowWaitlist(false)} style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem", color: "var(--th-text-subtle)" }}>✕</button>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--th-text)", marginBottom: "12px" }}>Join the Waitlist</h2>
            
            {waitlistSuccess ? (
              <div style={{ padding: "20px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "8px", textAlign: "center" }}>
                <p style={{ fontSize: "1rem", color: "var(--th-text)", margin: 0, fontWeight: 600 }}>✅ You're on the list!</p>
                <p style={{ fontSize: "0.85rem", color: "var(--th-text-muted)", marginTop: "8px" }}>We'll review your practice details and an admin will upgrade your account shortly.</p>
              </div>
            ) : (
              <>
                <p style={{ fontSize: "0.9rem", color: "var(--th-text-muted)", lineHeight: 1.6, marginBottom: "20px" }}>
                  To get access to premium features, please agree to our compliance terms and join the waitlist.
                </p>
                <form onSubmit={handleWaitlistSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  
                  <input
                    type="email"
                    required
                    value={waitlistEmail}
                    onChange={e => setWaitlistEmail(e.target.value)}
                    placeholder="dr.smith@example.com"
                    style={{ padding: "12px", borderRadius: "8px", border: "1px solid var(--th-sidebar-border)", background: "var(--th-bg-secondary)", color: "var(--th-text)", fontSize: "0.9rem" }}
                  />

                  <label style={{ display: "flex", gap: "10px", alignItems: "flex-start", cursor: "pointer", background: "var(--th-bg)", padding: "16px", borderRadius: "8px", border: "1px solid var(--th-sidebar-border)" }}>
                    <input
                      type="checkbox"
                      required
                      style={{ width: "18px", height: "18px", marginTop: "2px", accentColor: "var(--th-accent)", flexShrink: 0 }}
                    />
                    <span style={{ fontSize: "0.85rem", color: "var(--th-text)", lineHeight: 1.6 }}>
                      I understand and agree that PsychoLog is an un-indexed, de-identified workflow tool. I agree that I will never input, upload, or transmit any Personally Identifiable Information (PII) or Protected Health Information (PHI)—including real names, phone numbers, or government IDs—into the platform. I maintain sole responsibility for maintaining any patient identity indexes offline.
                    </span>
                  </label>

                  <button type="submit" disabled={loading} className="btn-th-primary" style={{ padding: "14px", fontSize: "0.95rem", fontWeight: 600, marginTop: "8px" }}>
                    {loading ? "Joining..." : "I Agree — Join Waitlist"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
