"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function DashboardError({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service if we had one
    console.error("Dashboard Boundary Error:", error);
  }, [error]);

  return (
    <div
      className="min-h-screen flex items-center justify-center therapist-view"
      style={{ padding: "40px", background: "var(--th-bg)" }}
    >
      <div className="th-card animate-fade-in-up" style={{ padding: "48px 40px", maxWidth: "480px", width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "20px" }}>⚠️</div>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--th-text)", marginBottom: "12px", letterSpacing: "-0.02em" }}>
          Something went wrong
        </h2>
        <p style={{ fontSize: "0.875rem", color: "var(--th-text-muted)", marginBottom: "24px", lineHeight: 1.6 }}>
          We encountered an unexpected error loading this dashboard view. Your patient records remain secure.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button
            onClick={() => reset()}
            className="btn-th-primary"
            style={{ minWidth: "120px" }}
          >
            Try Again
          </button>
          <Link href="/dashboard" className="btn-th-secondary" style={{ textDecoration: "none" }}>
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
