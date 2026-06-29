import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata = {
  title: "PsychoLog — Intelligent Session Documentation for Therapists",
  description:
    "Privacy-first middleware that reduces therapist documentation time by auto-generating AI session summaries. Reclaim your focus. Protect your patients.",
};

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main
      className="min-h-screen therapist-view"
      style={{ background: "var(--th-bg)", color: "var(--th-text)" }}
    >
      {/* ── Navigation ── */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          background: "rgba(255,251,245,0.85)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--th-border-soft)",
          padding: "0 40px",
          height: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, var(--th-accent), #FCD34D)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
            }}
          >
            🧠
          </div>
          <span style={{ fontWeight: 700, fontSize: "1rem", letterSpacing: "-0.02em" }}>
            PsychoLog
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Link href="/auth/login" className="btn-th-secondary" style={{ textDecoration: "none" }}>
            Sign In
          </Link>
          <Link href="/auth/signup" className="btn-th-primary" style={{ textDecoration: "none" }}>
            Get Started →
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        style={{
          maxWidth: "960px",
          margin: "0 auto",
          padding: "100px 40px 80px",
          textAlign: "center",
        }}
      >
        {/* Badge */}
        <div
          className="animate-fade-in"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "5px 14px",
            background: "var(--th-accent-soft)",
            border: "1px solid rgba(245,158,11,0.25)",
            borderRadius: "999px",
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "var(--th-accent)",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            marginBottom: "32px",
          }}
        >
          <span>✦</span>
          Privacy-First · AI-Powered · HIPAA-Aligned
        </div>

        {/* Headline */}
        <h1
          className="animate-fade-in-up delay-100"
          style={{
            fontSize: "clamp(2.4rem, 5vw, 3.8rem)",
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            marginBottom: "24px",
            color: "var(--th-text)",
          }}
        >
          Your sessions deserve{" "}
          <span
            style={{
              background: "linear-gradient(135deg, var(--th-accent), #F97316)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            full attention
          </span>
          ,<br />
          not paperwork.
        </h1>

        {/* Subheadline */}
        <p
          className="animate-fade-in-up delay-200"
          style={{
            fontSize: "1.15rem",
            color: "var(--th-text-muted)",
            maxWidth: "580px",
            margin: "0 auto 48px",
            lineHeight: 1.7,
          }}
        >
          PsychoLog ingests inter-session patient check-ins and distills them into
          AI-generated summaries — so you walk into every session already informed.
          No PII reaches the AI. Ever.
        </p>

        {/* CTAs */}
        <div
          className="animate-fade-in-up delay-300"
          style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}
        >
          <Link
            href="/auth/signup"
            className="btn-th-primary"
            style={{ fontSize: "1rem", padding: "13px 32px", textDecoration: "none" }}
          >
            Start Free — No Credit Card
          </Link>
          <Link
            href="/auth/login"
            className="btn-th-secondary"
            style={{ fontSize: "1rem", padding: "13px 32px", textDecoration: "none" }}
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section
        className="animate-fade-in delay-400"
        style={{
          maxWidth: "960px",
          margin: "0 auto 80px",
          padding: "0 40px",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "24px",
        }}
      >
        {[
          { stat: "~30%", desc: "of billable hours lost to documentation" },
          { stat: "0 PII", desc: "ever reaches the AI model" },
          { stat: "30 sec", desc: "for a patient to complete a check-in" },
        ].map(({ stat, desc }) => (
          <div
            key={stat}
            className="th-card"
            style={{ padding: "28px 24px", textAlign: "center" }}
          >
            <p
              style={{
                fontSize: "2rem",
                fontWeight: 700,
                color: "var(--th-accent)",
                letterSpacing: "-0.03em",
                marginBottom: "6px",
              }}
            >
              {stat}
            </p>
            <p style={{ fontSize: "0.85rem", color: "var(--th-text-muted)", lineHeight: 1.5 }}>
              {desc}
            </p>
          </div>
        ))}
      </section>

      {/* ── Feature grid ── */}
      <section
        style={{
          maxWidth: "960px",
          margin: "0 auto 100px",
          padding: "0 40px",
        }}
      >
        <h2
          style={{
            fontSize: "1.8rem",
            fontWeight: 700,
            letterSpacing: "-0.025em",
            marginBottom: "8px",
            textAlign: "center",
          }}
        >
          Everything you need. Nothing you don&apos;t.
        </h2>
        <p
          style={{
            color: "var(--th-text-muted)",
            textAlign: "center",
            marginBottom: "48px",
            fontSize: "0.95rem",
          }}
        >
          Built for therapists who care about both their patients and their own time.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "16px",
          }}
        >
          {[
            {
              icon: "🔒",
              title: "Zero-Knowledge Privacy",
              body: "Patient identity and clinical data live in separate database tables. Even a breach reveals nothing useful.",
            },
            {
              icon: "🤖",
              title: "AI Session Summaries",
              body: "Gemini 1.5 Pro distills each check-in into 3 factual bullet points + one reflection prompt. Clinical, not chatty.",
            },
            {
              icon: "🚨",
              title: "Crisis Detection",
              body: "Real-time language analysis flags self-harm indicators. You get an email + in-app alert instantly.",
            },
            {
              icon: "📧",
              title: "Email Invite System",
              body: "Invite patients by email. They get a private link — no account, just a secure PIN and a 30-second form.",
            },
            {
              icon: "📝",
              title: "Editable Clinical Notes",
              body: "Annotate AI summaries with your own observations. Notes are client-side encrypted before storage.",
            },
            {
              icon: "📄",
              title: "Encrypted Export",
              body: "Download a complete patient record as a password-protected Word file. Stays entirely on your device.",
            },
          ].map(({ icon, title, body }) => (
            <div key={title} className="th-card" style={{ padding: "28px 24px" }}>
              <div style={{ fontSize: "1.6rem", marginBottom: "12px" }}>{icon}</div>
              <h3
                style={{
                  fontSize: "0.975rem",
                  fontWeight: 600,
                  marginBottom: "8px",
                  color: "var(--th-text)",
                }}
              >
                {title}
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--th-text-muted)", lineHeight: 1.6 }}>
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section
        style={{
          background: "var(--th-bg-secondary)",
          borderTop: "1px solid var(--th-border-soft)",
          borderBottom: "1px solid var(--th-border-soft)",
          padding: "80px 40px",
          marginBottom: "80px",
        }}
      >
        <div style={{ maxWidth: "760px", margin: "0 auto", textAlign: "center" }}>
          <h2
            style={{
              fontSize: "1.8rem",
              fontWeight: 700,
              letterSpacing: "-0.025em",
              marginBottom: "48px",
            }}
          >
            How it works
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "32px",
            }}
          >
            {[
              { step: "01", title: "Invite your patient", body: "Enter their email and therapy end date. They receive a private link in under a minute." },
              { step: "02", title: "Patient checks in", body: "They rate their mood, describe an event, and how it felt. Done in 30 seconds." },
              { step: "03", title: "AI processes instantly", body: "PsychoLog sanitizes all PII and generates a factual 3-bullet summary via Gemini." },
              { step: "04", title: "You review & annotate", body: "Open the dashboard before your session. Read the summary. Add your own notes." },
            ].map(({ step, title, body }) => (
              <div key={step} style={{ textAlign: "left" }}>
                <p
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: "var(--th-accent)",
                    letterSpacing: "0.08em",
                    marginBottom: "8px",
                  }}
                >
                  STEP {step}
                </p>
                <h3
                  style={{
                    fontSize: "0.975rem",
                    fontWeight: 600,
                    marginBottom: "8px",
                    color: "var(--th-text)",
                  }}
                >
                  {title}
                </h3>
                <p style={{ fontSize: "0.83rem", color: "var(--th-text-muted)", lineHeight: 1.6 }}>
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        style={{
          maxWidth: "600px",
          margin: "0 auto 100px",
          padding: "0 40px",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            letterSpacing: "-0.025em",
            marginBottom: "16px",
          }}
        >
          Ready to reclaim your focus?
        </h2>
        <p
          style={{
            color: "var(--th-text-muted)",
            marginBottom: "32px",
            fontSize: "0.95rem",
            lineHeight: 1.7,
          }}
        >
          Join therapists who spend less time on documentation and more time on what matters.
        </p>
        <Link
          href="/auth/signup"
          className="btn-th-primary"
          style={{ fontSize: "1rem", padding: "14px 40px", textDecoration: "none" }}
        >
          Create Your Account →
        </Link>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          borderTop: "1px solid var(--th-border-soft)",
          padding: "32px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "1rem" }}>🧠</span>
          <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>PsychoLog</span>
        </div>
        <p style={{ fontSize: "0.78rem", color: "var(--th-text-subtle)" }}>
          Not a clinical service. Not a substitute for professional care. Admin tool only.
        </p>
        <p style={{ fontSize: "0.78rem", color: "var(--th-text-subtle)" }}>
          Built by Pratyaksh · {new Date().getFullYear()}
        </p>
      </footer>
    </main>
  );
}
