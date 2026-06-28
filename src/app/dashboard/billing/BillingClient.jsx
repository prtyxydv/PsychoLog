"use client";

import { useState } from "react";

const PLANS = [
  {
    name: "Free Beta",
    price: "Free",
    badge: "CURRENT",
    badgeColor: "#22c55e",
    desc: "Everything you need to get started. No credit card required.",
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
    name: "Pro",
    price: "$29/month",
    badge: "COMING SOON",
    badgeColor: "#f59e0b",
    desc: "For growing practices that need unlimited capacity.",
    features: [
      "Unlimited active patients",
      "Everything in Free Beta",
      "Priority AI processing",
      "Advanced mood analytics",
      "Dedicated support",
      "HIPAA Business Associate Agreement",
    ],
    cta: "Upgrade to Pro",
  },
];

export default function BillingClient({ profile, statusParam }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(
    statusParam === "demo"
      ? "✅ Demo mode: Stripe is not yet connected. Your subscription would start here once live keys are added."
      : statusParam === "success"
      ? "🎉 Payment successful! Your plan has been upgraded."
      : statusParam === "cancelled"
      ? "Payment was cancelled. You have not been charged."
      : null
  );

  async function handleUpgrade() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setMessage("Something went wrong. Please try again.");
      }
    } catch {
      setMessage("Network error. Please try again.");
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
                onClick={handleUpgrade}
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
    </div>
  );
}
