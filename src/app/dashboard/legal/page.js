import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Legal & Compliance — PsychoLog",
};

export default async function LegalPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const items = [
    {
      icon: "✅",
      status: "done",
      title: "Data Isolation (Row-Level Security)",
      desc: "Your patients' data is cryptographically isolated from all other therapists at the database level using Supabase RLS policies. No cross-contamination of data is architecturally possible.",
    },
    {
      icon: "✅",
      status: "done",
      title: "AI PHI/PII Protection",
      desc: "The AI that generates session summaries receives only anonymised, sanitised patient text. It is instructed by system rules to never infer, store, or reproduce Personally Identifiable Information (PII) or Protected Health Information (PHI). Zero-data-retention API policy is in effect.",
    },
    {
      icon: "✅",
      status: "done",
      title: "Patient Anonymisation",
      desc: "Patients are identified only by randomly generated aliases (e.g. Patient-Alpha-7). Their real name and contact email are stored separately from their check-in content and never passed to AI systems.",
    },
    {
      icon: "✅",
      status: "done",
      title: "Encrypted Transmission",
      desc: "All data in transit is protected by TLS 1.2+. All data at rest is encrypted with AES-256 via Supabase's SOC 2 Type II certified infrastructure.",
    },
    {
      icon: "✅",
      status: "done",
      title: "Patient Informed Consent Gateway",
      desc: "Every patient must explicitly agree to an Informed Consent screen — with three individual checkboxes — before accessing the check-in portal for the first time. This consent is recorded in their session.",
    },
    {
      icon: "✅",
      status: "done",
      title: "Not Medical Advice Disclaimer",
      desc: "Prominent legal disclaimers are displayed on the patient check-in portal, in the Terms of Service, and in the AI system prompt. PsychoLog never positions itself as a therapy or clinical service.",
    },
    {
      icon: "✅",
      status: "done",
      title: "PIN-Based Passwordless Authentication",
      desc: "Patients authenticate using a bcrypt-hashed 4-digit PIN. No passwords are stored. PINs are never logged or transmitted in plain text.",
    },
    {
      icon: "✅",
      status: "done",
      title: "Crisis Detection & Immediate Alert",
      desc: "Patient check-ins are scanned for crisis language. Detected crises trigger an immediate email to the treating therapist and display a crisis resources panel to the patient.",
    },
    {
      icon: "✅",
      status: "done",
      title: "Educational & Productivity Workspace (No PHI)",
      desc: "By using this service, you agree not to input real clinical patient data. This tool is explicitly designed for generalized, anonymized note-taking, conceptual case-mapping, and educational tracking. It is NOT an Electronic Health Record (EHR).",
    },
    {
      icon: "⏳",
      status: "pending",
      title: "IRB / Ethics Board Approval",
      desc: "If you are conducting research using anonymized PsychoLog data, you must obtain IRB or equivalent ethics board approval before deployment. PsychoLog provides educational infrastructure only.",
    },
    {
      icon: "⏳",
      status: "pending",
      title: "HIPAA & Compliance Exemption",
      desc: "Because you agree to use strictly anonymized and generalized data (no PHI), PsychoLog operates outside the scope of strict medical infrastructure laws (HIPAA). No BAA is required for educational use.",
    },
    {
      icon: "⏳",
      status: "pending",
      title: "Professional Liability Insurance",
      desc: "As the licensed practitioner using PsychoLog, you are responsible for carrying appropriate professional liability (malpractice) insurance. PsychoLog does not cover clinical liability.",
    },
  ];

  return (
    <div style={{ padding: "48px", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "40px" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--th-text)", marginBottom: "6px" }}>
          ⚖️ Legal & Compliance
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--th-text-muted)", lineHeight: 1.6, maxWidth: "620px" }}>
          PsychoLog is built with clinical-grade data isolation and privacy protections. This page summarises what is implemented and what responsibilities remain with you as the licensed practitioner.
        </p>
      </div>

      {/* Disclaimer banner */}
      <div style={{
        padding: "14px 18px", borderRadius: "var(--radius-md)", marginBottom: "32px",
        background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)",
      }}>
        <p style={{ fontSize: "0.82rem", color: "var(--th-text)", lineHeight: 1.7, margin: 0 }}>
          <strong>⚠️ Not legal advice.</strong> This page is for informational purposes only. For questions about HIPAA compliance, IRB requirements, or professional liability, consult a qualified healthcare attorney in your jurisdiction.
        </p>
      </div>

      {/* Compliance checklist */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {items.map(item => (
          <div
            key={item.title}
            className="th-card"
            style={{
              padding: "20px 24px",
              borderLeft: `3px solid ${item.status === "done" ? "#22c55e" : "#f59e0b"}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
              <span style={{ fontSize: "1.2rem", flexShrink: 0, marginTop: "1px" }}>{item.icon}</span>
              <div>
                <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--th-text)", marginBottom: "5px" }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: "0.8rem", color: "var(--th-text-muted)", lineHeight: 1.65, margin: 0 }}>
                  {item.desc}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "36px", padding: "20px 24px", borderRadius: "var(--radius-md)", background: "var(--th-bg-secondary)", border: "1px solid var(--th-sidebar-border)" }}>
        <p style={{ fontSize: "0.82rem", color: "var(--th-text-muted)", lineHeight: 1.7, margin: 0 }}>
          📋 <strong>Full documents:</strong>{" "}
          <a href="https://psycholog.app/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "var(--th-accent)" }}>Privacy Policy</a>
          {" · "}
          <a href="https://psycholog.app/terms" target="_blank" rel="noopener noreferrer" style={{ color: "var(--th-accent)" }}>Terms of Service</a>
        </p>
      </div>
    </div>
  );
}
