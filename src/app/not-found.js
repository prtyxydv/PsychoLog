import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center therapist-view"
      style={{ padding: "40px", background: "var(--th-bg)" }}
    >
      <div className="th-card animate-fade-in-up" style={{ padding: "48px 40px", maxWidth: "480px", width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "20px" }}>🕵️‍♂️</div>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--th-text)", marginBottom: "12px", letterSpacing: "-0.02em" }}>
          Page Not Found
        </h2>
        <p style={{ fontSize: "0.875rem", color: "var(--th-text-muted)", marginBottom: "32px", lineHeight: 1.6 }}>
          The link you clicked may be broken, or the page may have been removed. If you are looking for a patient record, please return to the dashboard.
        </p>
        <Link href="/dashboard" className="btn-th-primary" style={{ textDecoration: "none" }}>
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
